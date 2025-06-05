"use client";

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doctorAPI, appointmentAPI, patientAPI } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import {
  Calendar,
  Clock,
  User,
  FileText,
  CreditCard,
  MapPin,
  CheckCircle,
} from "lucide-react";

const BookAppointment = () => {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [doctor, setDoctor] = useState(null);
  const [patientProfile, setPatientProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    date: "",
    time: "",
    reason: "",
    specialNotes: "",
    insuranceProvider: "",
    insuranceNumber: "",
  });

  useEffect(() => {
    fetchDoctorAndPatient();
  }, [doctorId]);

  const fetchDoctorAndPatient = async () => {
    try {
      // Fetch doctor details
      const doctorResponse = await doctorAPI.getDoctorById(doctorId);
      setDoctor(doctorResponse.data);

      // Fetch patient profile to get patient ID
      try {
        const patientResponse = await patientAPI.getMyProfile();
        setPatientProfile(patientResponse.data);
        console.log("Patient profile:", patientResponse.data);
      } catch (patientError) {
        console.error("Error fetching patient profile:", patientError);
        setError(
          "Please complete your patient profile before booking an appointment."
        );
      }
    } catch (error) {
      console.error("Error fetching doctor:", error);
      setError("Doctor not found");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const checkAvailability = async (date, time) => {
    try {
      const response = await appointmentAPI.checkAvailability(
        doctorId,
        date,
        time
      );
      return response.data.available;
    } catch (error) {
      console.error("Error checking availability:", error);
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    // Check if patient profile exists
    if (!patientProfile || !patientProfile.patientId) {
      setError(
        "Please complete your patient profile before booking an appointment."
      );
      setSubmitting(false);
      return;
    }

    try {
      // Check availability first
      const isAvailable = await checkAvailability(formData.date, formData.time);

      if (!isAvailable) {
        setError(
          "This time slot is not available. Please choose a different time."
        );
        setSubmitting(false);
        return;
      }

      // Create appointment with proper field names that match backend expectations
      const appointmentData = {
        date: formData.date,
        time: formData.time,
        reason: formData.reason,
        specialNotes: formData.specialNotes,
        insuranceProvider: formData.insuranceProvider,
        insuranceNumber: formData.insuranceNumber,
        status: "Pending",
        // Use the exact field names expected by the backend
        doctorId: Number.parseInt(doctorId),
        patientId: patientProfile.patientId,
        // Alternative field names in case backend expects different naming
        doctor_id: Number.parseInt(doctorId),
        patient_id: patientProfile.patientId,
      };

      console.log("Sending appointment data:", appointmentData);
      console.log(
        "Doctor ID:",
        doctorId,
        "Patient ID:",
        patientProfile.patientId
      );

      const response = await appointmentAPI.addAppointment(appointmentData);
      console.log("Appointment created:", response.data);

      setSuccess(true);

      // Redirect after 3 seconds
      setTimeout(() => {
        navigate("/dashboard");
      }, 3000);
    } catch (error) {
      console.error("Error booking appointment:", error);
      console.error("Error response:", error.response?.data);
      setError(
        error.response?.data?.message ||
          "Failed to book appointment. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Generate time slots
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour <= 17; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = `${hour.toString().padStart(2, "0")}:${minute
          .toString()
          .padStart(2, "0")}`;
        slots.push(time);
      }
    }
    return slots;
  };

  // Get minimum date (today)
  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  // Get maximum date (30 days from now)
  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 30);
    return maxDate.toISOString().split("T")[0];
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">
            Loading appointment details...
          </p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Appointment Booked!
          </h2>
          <p className="text-gray-600 mb-4">
            Your appointment request has been sent to Dr.{" "}
            {doctor?.user?.userName}. You will receive a confirmation once the
            doctor approves your request.
          </p>
          <div className="bg-blue-50 rounded-lg p-4 mb-4">
            <p className="text-sm text-blue-800">
              <strong>Appointment Details:</strong>
              <br />
              Date: {formData.date}
              <br />
              Time: {formData.time}
              <br />
              Doctor: Dr. {doctor?.user?.userName}
              <br />
              Reason: {formData.reason}
            </p>
          </div>
          <p className="text-sm text-gray-500">
            Redirecting to dashboard in 3 seconds...
          </p>
        </div>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Doctor Not Found
          </h2>
          <p className="text-gray-600">
            The requested doctor could not be found.
          </p>
        </div>
      </div>
    );
  }

  if (!patientProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Complete Your Profile
          </h2>
          <p className="text-gray-600 mb-6">
            You need to complete your patient profile before booking an
            appointment.
          </p>
          <button
            onClick={() => navigate("/profile")}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Complete Profile
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <Calendar className="h-12 w-12 text-blue-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900">Book Appointment</h1>
          <p className="text-gray-600 mt-2">
            Schedule your consultation with Dr. {doctor.user?.userName}
          </p>
        </div>

        {/* Patient Info Display */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-blue-800 text-sm">
            <strong>Booking as:</strong> {user?.userName} (Patient ID:{" "}
            {patientProfile?.patientId})
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Doctor Information */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="h-12 w-12 text-blue-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">
                  Dr. {doctor.user?.userName}
                </h2>
                <p className="text-blue-600 font-medium">
                  {doctor.specialization}
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="h-4 w-4 mr-3" />
                  <div>
                    <p>{doctor.clinicName}</p>
                    <p>
                      {doctor.area}, {doctor.city}
                    </p>
                    <p>
                      {doctor.state}, {doctor.pincode}
                    </p>
                  </div>
                </div>

                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="h-4 w-4 mr-3" />
                  <span>{doctor.experience} years experience</span>
                </div>

                <div className="flex items-center text-sm text-gray-600">
                  <CreditCard className="h-4 w-4 mr-3" />
                  <span>₹{doctor.checkUpFee} consultation fee</span>
                </div>

                {doctor.qualification && (
                  <div className="pt-4 border-t border-gray-200">
                    <h3 className="font-medium text-gray-900 mb-2">
                      Qualifications
                    </h3>
                    <p className="text-sm text-gray-600">
                      {doctor.qualification}
                    </p>
                  </div>
                )}

                {doctor.availability && (
                  <div className="pt-4 border-t border-gray-200">
                    <h3 className="font-medium text-gray-900 mb-2">
                      Availability
                    </h3>
                    <p className="text-sm text-gray-600">
                      {doctor.availability}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Booking Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">
                  Appointment Details
                </h2>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Date and Time */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label
                      htmlFor="date"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      <Calendar className="inline h-4 w-4 mr-1" />
                      Preferred Date
                    </label>
                    <input
                      type="date"
                      id="date"
                      name="date"
                      required
                      min={getMinDate()}
                      max={getMaxDate()}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={formData.date}
                      onChange={handleChange}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="time"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      <Clock className="inline h-4 w-4 mr-1" />
                      Preferred Time
                    </label>
                    <select
                      id="time"
                      name="time"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={formData.time}
                      onChange={handleChange}
                    >
                      <option value="">Select time</option>
                      {generateTimeSlots().map((time) => (
                        <option key={time} value={time}>
                          {time}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Reason for Visit */}
                <div>
                  <label
                    htmlFor="reason"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    <FileText className="inline h-4 w-4 mr-1" />
                    Reason for Visit
                  </label>
                  <input
                    type="text"
                    id="reason"
                    name="reason"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Brief description of your health concern"
                    value={formData.reason}
                    onChange={handleChange}
                  />
                </div>

                {/* Special Notes */}
                <div>
                  <label
                    htmlFor="specialNotes"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    <FileText className="inline h-4 w-4 mr-1" />
                    Special Notes (Optional)
                  </label>
                  <textarea
                    id="specialNotes"
                    name="specialNotes"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Any additional information you'd like the doctor to know"
                    value={formData.specialNotes}
                    onChange={handleChange}
                  />
                </div>

                {/* Insurance Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label
                      htmlFor="insuranceProvider"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      <CreditCard className="inline h-4 w-4 mr-1" />
                      Insurance Provider (Optional)
                    </label>
                    <input
                      type="text"
                      id="insuranceProvider"
                      name="insuranceProvider"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., Blue Cross, Aetna"
                      value={formData.insuranceProvider}
                      onChange={handleChange}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="insuranceNumber"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      <CreditCard className="inline h-4 w-4 mr-1" />
                      Insurance Number (Optional)
                    </label>
                    <input
                      type="text"
                      id="insuranceNumber"
                      name="insuranceNumber"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Insurance policy number"
                      value={formData.insuranceNumber}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
                    {error}
                  </div>
                )}

                {/* Submit Button */}
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => navigate("/find-doctors")}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? "Booking..." : "Book Appointment"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookAppointment;
