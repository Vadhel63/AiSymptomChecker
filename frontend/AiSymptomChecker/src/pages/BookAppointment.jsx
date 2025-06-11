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
  ArrowLeft,
  IndianRupee,
  AlertCircle,
  Shield,
  Info,
} from "lucide-react";

const BookAppointmentEnhanced = () => {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [doctor, setDoctor] = useState(null);
  const [patientProfile, setPatientProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    date: "",
    time: "",
    reason: "",
    specialNotes: "",
    insuranceProvider: "",
    insuranceNumber: "",
  });

  const [paymentData, setPaymentData] = useState({
    orderId: "",
    amount: 0,
    currency: "INR",
  });

  const [createdAppointment, setCreatedAppointment] = useState(null);

  useEffect(() => {
    fetchDoctorAndPatient();
    loadRazorpayScript();
  }, [doctorId]);

  const loadRazorpayScript = () => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
  };

  const fetchDoctorAndPatient = async () => {
    try {
      const doctorResponse = await doctorAPI.getDoctorById(doctorId);
      setDoctor(doctorResponse.data);

      setPaymentData((prev) => ({
        ...prev,
        amount: doctorResponse.data.checkUpFee || 500,
      }));

      try {
        const patientResponse = await patientAPI.getMyProfile();
        setPatientProfile(patientResponse.data);
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

  const validateAppointmentTiming = (date, time) => {
    const now = new Date();
    const appointmentDateTime = new Date(`${date}T${time}`);

    // Check if appointment is at least 1 day from now
    const minimumDateTime = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    if (appointmentDateTime < minimumDateTime) {
      return "Appointments must be booked at least 1 day in advance";
    }

    // Check if appointment is within 30 days
    const maximumDateTime = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    if (appointmentDateTime > maximumDateTime) {
      return "Appointments can only be booked up to 30 days in advance";
    }

    // Check if appointment time is at least 2 hours from current time (for same day bookings)
    const minimumTimeToday = new Date(now.getTime() + 2 * 60 * 60 * 1000);
    const today = now.toISOString().split("T")[0];
    if (date === today && appointmentDateTime < minimumTimeToday) {
      return "Appointments must be booked at least 2 hours in advance";
    }

    // Check if appointment is during working hours (9 AM to 6 PM)
    const hour = Number.parseInt(time.split(":")[0]);
    if (hour < 9 || hour >= 18) {
      return "Appointments can only be booked between 9:00 AM and 6:00 PM";
    }

    return null;
  };

  const validateForm = () => {
    if (!formData.date) {
      setError("Please select an appointment date");
      return false;
    }
    if (!formData.time) {
      setError("Please select an appointment time");
      return false;
    }
    if (!formData.reason.trim()) {
      setError("Please provide a reason for the appointment");
      return false;
    }

    // Validate timing
    const timingError = validateAppointmentTiming(formData.date, formData.time);
    if (timingError) {
      setError(timingError);
      return false;
    }

    return true;
  };

  const proceedToPayment = async () => {
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      setError("");

      // Check availability
      const isAvailable = await checkAvailability(formData.date, formData.time);
      if (!isAvailable) {
        setError(
          "This time slot is not available. Please choose a different time."
        );
        return;
      }

      // Create payment order
      const orderResponse = await appointmentAPI.createPaymentOrder({
        amount: paymentData.amount,
        currency: paymentData.currency,
        doctorId: Number.parseInt(doctorId),
        appointmentData: {
          ...formData,
          doctorId: Number.parseInt(doctorId),
          patientId: patientProfile.patientId,
        },
      });

      if (orderResponse.data.success) {
        setPaymentData((prev) => ({
          ...prev,
          orderId: orderResponse.data.orderId,
          amount: orderResponse.data.amount,
        }));
        setCurrentStep(2);
      } else {
        setError("Failed to create payment order");
      }
    } catch (error) {
      console.error("Error creating payment order:", error);
      setError(
        error.response?.data?.message ||
          "Failed to create payment order. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handlePayment = () => {
    if (!window.Razorpay) {
      setError("Payment gateway not loaded. Please refresh and try again.");
      return;
    }

    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: paymentData.amount * 100,
      currency: paymentData.currency,
      name: "AI HealthCare",
      description: `Consultation with Dr. ${doctor?.name}`,
      order_id: paymentData.orderId,
      image: "/logo.png",
      handler: async (response) => {
        await handlePaymentSuccess(response);
      },
      prefill: {
        name: user?.userName,
        email: user?.email,
        contact: patientProfile?.mobileNo || "",
      },
      notes: {
        doctorId: doctorId,
        patientId: patientProfile?.patientId,
        appointmentDate: formData.date,
        appointmentTime: formData.time,
      },
      theme: {
        color: "#3B82F6",
      },
      modal: {
        ondismiss: () => {
          setError("Payment cancelled. Please try again.");
        },
      },
    };

    const razorpay = new window.Razorpay(options);
    razorpay.open();
  };

  const handlePaymentSuccess = async (paymentResponse) => {
    try {
      setPaymentLoading(true);
      setError("");

      const verificationResponse =
        await appointmentAPI.verifyPaymentAndCreateAppointment({
          razorpayOrderId: paymentResponse.razorpay_order_id,
          razorpayPaymentId: paymentResponse.razorpay_payment_id,
          razorpaySignature: paymentResponse.razorpay_signature,
          appointmentData: {
            ...formData,
            doctorId: Number.parseInt(doctorId),
            patientId: patientProfile.patientId,
          },
        });

      if (verificationResponse.data.success) {
        setCreatedAppointment(verificationResponse.data.appointment);
        setSuccess("Payment successful! Your appointment has been booked.");
        setCurrentStep(3);
      } else {
        setError("Payment verification failed. Please contact support.");
      }
    } catch (error) {
      console.error("Error verifying payment:", error);
      setError(
        "Payment verification failed. Please contact support with your payment ID: " +
          paymentResponse.razorpay_payment_id
      );
    } finally {
      setPaymentLoading(false);
    }
  };

  // Generate time slots with enhanced restrictions
  const generateTimeSlots = () => {
    const slots = [];
    const now = new Date();
    const selectedDate = formData.date;
    const isToday = selectedDate === now.toISOString().split("T")[0];

    for (let hour = 9; hour <= 17; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = `${hour.toString().padStart(2, "0")}:${minute
          .toString()
          .padStart(2, "0")}`;

        // If it's today, only show slots that are at least 2 hours from now
        if (isToday) {
          const slotDateTime = new Date(`${selectedDate}T${time}`);
          const minimumTime = new Date(now.getTime() + 2 * 60 * 60 * 1000);
          if (slotDateTime < minimumTime) {
            continue;
          }
        }

        slots.push(time);
      }
    }
    return slots;
  };

  // Get minimum date (tomorrow)
  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  };

  // Get maximum date (30 days from now)
  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 30);
    return maxDate.toISOString().split("T")[0];
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">
            Loading appointment details...
          </p>
        </div>
      </div>
    );
  }

  if (!doctor || !patientProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto">
          <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {!doctor ? "Doctor Not Found" : "Complete Your Profile"}
          </h2>
          <p className="text-gray-600 mb-6">
            {!doctor
              ? "The requested doctor could not be found."
              : "You need to complete your patient profile before booking an appointment."}
          </p>
          <button
            onClick={() => navigate(!doctor ? "/find-doctors" : "/profile")}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {!doctor ? "Find Doctors" : "Complete Profile"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/find-doctors")}
            className="flex items-center text-blue-600 hover:text-blue-800 mb-4 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Doctors
          </button>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center space-x-6">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="h-10 w-10 text-blue-600" />
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900">
                  Dr. {doctor.name}
                </h1>
                <p className="text-xl text-blue-600 font-medium">
                  {doctor.specialization}
                </p>
                <div className="flex items-center space-x-4 mt-2 text-gray-600">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>{doctor.experience} years experience</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span>
                      {doctor.city}, {doctor.state}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <IndianRupee className="h-4 w-4 mr-1" />
                    <span>₹{doctor.checkUpFee} consultation</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Booking Guidelines */}
        <div className="mb-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-start space-x-3">
            <Info className="h-6 w-6 text-blue-600 mt-0.5" />
            <div>
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                Booking Guidelines
              </h3>
              <ul className="text-blue-800 space-y-1 text-sm">
                <li>• Appointments must be booked at least 1 day in advance</li>
                <li>• Maximum booking window is 30 days from today</li>
                <li>• Same-day appointments require at least 2 hours notice</li>
                <li>• Available hours: 9:00 AM to 6:00 PM</li>
                <li>• Full refund if doctor rejects your appointment</li>
                <li>• Payment is required to confirm your booking</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-8">
            <div
              className={`flex items-center ${
                currentStep >= 1 ? "text-blue-600" : "text-gray-400"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  currentStep >= 1 ? "bg-blue-600 text-white" : "bg-gray-200"
                }`}
              >
                1
              </div>
              <span className="ml-2 font-medium">Appointment Details</span>
            </div>
            <div
              className={`w-16 h-1 ${
                currentStep >= 2 ? "bg-blue-600" : "bg-gray-200"
              }`}
            ></div>
            <div
              className={`flex items-center ${
                currentStep >= 2 ? "text-blue-600" : "text-gray-400"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  currentStep >= 2 ? "bg-blue-600 text-white" : "bg-gray-200"
                }`}
              >
                2
              </div>
              <span className="ml-2 font-medium">Payment</span>
            </div>
            <div
              className={`w-16 h-1 ${
                currentStep >= 3 ? "bg-green-600" : "bg-gray-200"
              }`}
            ></div>
            <div
              className={`flex items-center ${
                currentStep >= 3 ? "text-green-600" : "text-gray-400"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  currentStep >= 3 ? "bg-green-600 text-white" : "bg-gray-200"
                }`}
              >
                3
              </div>
              <span className="ml-2 font-medium">Confirmation</span>
            </div>
          </div>
        </div>

        {/* Step 1: Appointment Details */}
        {currentStep === 1 && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
            <div className="px-8 py-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <Calendar className="h-6 w-6 mr-3 text-blue-600" />
                Appointment Details
              </h2>
            </div>
            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Date Selection */}
                <div>
                  <label
                    htmlFor="date"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    <Calendar className="inline h-4 w-4 mr-1" />
                    Appointment Date
                  </label>
                  <input
                    type="date"
                    id="date"
                    name="date"
                    min={getMinDate()}
                    max={getMaxDate()}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={formData.date}
                    onChange={handleChange}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Select a date between tomorrow and{" "}
                    {new Date(getMaxDate()).toLocaleDateString()}
                  </p>
                </div>

                {/* Time Selection */}
                <div>
                  <label
                    htmlFor="time"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    <Clock className="inline h-4 w-4 mr-1" />
                    Appointment Time
                  </label>
                  <select
                    id="time"
                    name="time"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={formData.time}
                    onChange={handleChange}
                    disabled={!formData.date}
                  >
                    <option value="">
                      {!formData.date ? "Select date first" : "Select time"}
                    </option>
                    {formData.date &&
                      generateTimeSlots().map((time) => (
                        <option key={time} value={time}>
                          {time}
                        </option>
                      ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Available slots: 9:00 AM - 6:00 PM (30-minute intervals)
                  </p>
                </div>

                {/* Reason for Visit */}
                <div className="md:col-span-2">
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
                <div className="md:col-span-2">
                  <label
                    htmlFor="specialNotes"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
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

              {/* Consultation Fee Display */}
              <div className="mt-8 p-6 bg-blue-50 rounded-xl border border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Consultation Fee
                    </h3>
                    <p className="text-gray-600">
                      One-time consultation with Dr. {doctor.name}
                    </p>
                    <p className="text-sm text-blue-600 mt-1">
                      <Shield className="inline h-4 w-4 mr-1" />
                      100% refund if appointment is rejected
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-blue-600">
                      ₹{doctor.checkUpFee}
                    </p>
                    <p className="text-sm text-gray-500">Including all taxes</p>
                  </div>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mt-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md flex items-center">
                  <AlertCircle className="h-5 w-5 mr-2" />
                  {error}
                </div>
              )}

              {/* Continue Button */}
              <div className="mt-8 flex justify-end space-x-4">
                <button
                  onClick={() => navigate("/find-doctors")}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={proceedToPayment}
                  disabled={submitting}
                  className="flex items-center px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-5 w-5 mr-2" />
                      Proceed to Payment
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Payment */}
        {currentStep === 2 && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
            <div className="px-8 py-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <CreditCard className="h-6 w-6 mr-3 text-blue-600" />
                Payment Details
              </h2>
            </div>
            <div className="p-8">
              {/* Appointment Summary */}
              <div className="bg-gray-50 rounded-xl p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Appointment Summary
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Doctor:</span>
                    <span className="ml-2 font-medium">Dr. {doctor.name}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Specialization:</span>
                    <span className="ml-2 font-medium">
                      {doctor.specialization}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Date:</span>
                    <span className="ml-2 font-medium">
                      {new Date(formData.date).toLocaleDateString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Time:</span>
                    <span className="ml-2 font-medium">{formData.time}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Patient:</span>
                    <span className="ml-2 font-medium">{user?.userName}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Reason:</span>
                    <span className="ml-2 font-medium">{formData.reason}</span>
                  </div>
                </div>
              </div>

              {/* Payment Amount */}
              <div className="bg-blue-50 rounded-xl p-6 mb-6 border border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Total Amount
                    </h3>
                    <p className="text-gray-600">
                      Consultation fee (including taxes)
                    </p>
                    <p className="text-sm text-blue-600 mt-1">
                      <Shield className="inline h-4 w-4 mr-1" />
                      Automatic refund if appointment is rejected
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-blue-600">
                      ₹{paymentData.amount}
                    </p>
                  </div>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md flex items-center">
                  <AlertCircle className="h-5 w-5 mr-2" />
                  {error}
                </div>
              )}

              {/* Payment Buttons */}
              <div className="flex space-x-4">
                <button
                  onClick={() => setCurrentStep(1)}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Back to Details
                </button>
                <button
                  onClick={handlePayment}
                  disabled={paymentLoading}
                  className="flex-1 flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {paymentLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <Shield className="h-5 w-5 mr-2" />
                      Pay ₹{paymentData.amount}
                    </>
                  )}
                </button>
              </div>

              {/* Payment Security Info */}
              <div className="mt-6 text-center text-sm text-gray-500">
                <p className="flex items-center justify-center">
                  <Shield className="h-4 w-4 mr-1" />
                  Your payment is secured by Razorpay
                </p>
                <p>We accept all major credit cards, debit cards, and UPI</p>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Success */}
        {currentStep === 3 && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
            <div className="p-8 text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Appointment Booked Successfully!
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Your appointment with Dr. {doctor.name} has been confirmed and
                payment received.
              </p>

              {/* Appointment Details */}
              {createdAppointment && (
                <div className="bg-gray-50 rounded-xl p-6 mb-8 text-left max-w-md mx-auto">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Appointment Details
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Appointment ID:</span>
                      <span className="font-medium">
                        #{createdAppointment.id}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Date:</span>
                      <span className="font-medium">
                        {new Date(createdAppointment.date).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Time:</span>
                      <span className="font-medium">
                        {createdAppointment.time}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className="font-medium text-yellow-600">
                        Pending Doctor Approval
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Amount Paid:</span>
                      <span className="font-medium">₹{paymentData.amount}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Important Notice */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-8">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="h-6 w-6 text-yellow-600 mt-0.5" />
                  <div className="text-left">
                    <h4 className="text-lg font-semibold text-yellow-900 mb-2">
                      Important Notice
                    </h4>
                    <ul className="text-yellow-800 space-y-1 text-sm">
                      <li>• Your appointment is pending doctor approval</li>
                      <li>
                        • You will receive a notification once the doctor
                        confirms
                      </li>
                      <li>
                        • If the doctor rejects your appointment, you will
                        receive a full automatic refund
                      </li>
                      <li>• Refunds are processed within 5-7 business days</li>
                      <li>
                        • You can track your appointment status in your
                        dashboard
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Success Message */}
              {success && (
                <div className="mb-6 bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-md">
                  {success}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => navigate("/dashboard")}
                  className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Go to Dashboard
                </button>
                <button
                  onClick={() => navigate("/find-doctors")}
                  className="px-8 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Book Another Appointment
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookAppointmentEnhanced;
