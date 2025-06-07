"use client";

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { appointmentAPI, medicalReportAPI } from "../services/api";
import {
  UserCircle,
  Calendar,
  FileText,
  Activity,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Heart,
  Brain,
  Stethoscope,
  TrendingUp,
  Plus,
  Maximize2,
  X,
} from "lucide-react";

const PatientDashboard = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [medicalReports, setMedicalReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedReport, setSelectedReport] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    completed: 0,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const cleanJsonString = (jsonString) => {
    try {
      // Remove extra closing braces and fix common JSON issues
      const cleaned = jsonString
        .replace(/}+$/g, "}") // Remove multiple closing braces at the end
        .replace(/}+"/g, '}"') // Fix multiple closing braces before quotes
        .replace(/}+,/g, "},") // Fix multiple closing braces before commas
        .replace(/}+]/g, "}]") // Fix multiple closing braces before array end
        .replace(/,\s*}/g, "}") // Remove trailing commas
        .replace(/,\s*]/g, "]") // Remove trailing commas in arrays
        .trim();

      // Ensure it starts and ends properly
      if (!cleaned.startsWith("[") && !cleaned.startsWith("{")) {
        return "[]";
      }

      return cleaned;
    } catch (error) {
      console.error("Error cleaning JSON string:", error);
      return "[]";
    }
  };

  const parseApiData = (response) => {
    try {
      console.log("Raw API Response:", response);

      let data = null;
      let rawData = null;

      // Extract the raw data
      if (response?.data) {
        rawData = response.data;
      } else if (response) {
        rawData = response;
      }

      console.log("Raw Data to Parse:", rawData);

      // Handle different data types
      if (typeof rawData === "string") {
        console.log("Data is string, attempting to clean and parse...");

        // Clean the JSON string first
        const cleanedJson = cleanJsonString(rawData);
        console.log("Cleaned JSON:", cleanedJson);

        try {
          data = JSON.parse(cleanedJson);
        } catch (parseError) {
          console.error("Failed to parse cleaned JSON:", parseError);
          console.log("Attempting alternative parsing methods...");

          // Try to extract valid JSON using regex
          const jsonMatch = rawData.match(/\[.*\]/s);
          if (jsonMatch) {
            const extractedJson = cleanJsonString(jsonMatch[0]);
            console.log("Extracted JSON:", extractedJson);
            data = JSON.parse(extractedJson);
          } else {
            console.log("No valid JSON array found, returning empty array");
            data = [];
          }
        }
      } else if (Array.isArray(rawData)) {
        console.log("Data is already an array");
        data = rawData;
      } else if (rawData && typeof rawData === "object") {
        console.log("Data is object, checking for nested arrays");
        // Check if it's an object containing an array
        const keys = Object.keys(rawData);
        const arrayKey = keys.find((key) => Array.isArray(rawData[key]));
        if (arrayKey) {
          data = rawData[arrayKey];
        } else {
          data = [rawData]; // Wrap single object in array
        }
      } else {
        console.log("Unknown data type, returning empty array");
        data = [];
      }

      // Ensure we return an array
      const result = Array.isArray(data) ? data : [];
      console.log("Final parsed result:", result);
      return result;
    } catch (error) {
      console.error("Error parsing API data:", error);
      console.log("Returning empty array due to parsing error");
      return [];
    }
  };

  const fetchData = async () => {
    try {
      console.log("Fetching data...");

      const [appointmentsResponse, reportsResponse] = await Promise.all([
        appointmentAPI.getMyAppointments(),
        medicalReportAPI.getAllReports(),
      ]);

      console.log("API Responses:", {
        appointments: appointmentsResponse,
        reports: reportsResponse,
      });

      // Parse the API responses safely
      const appointmentsData = parseApiData(appointmentsResponse);
      const reportsData = parseApiData(reportsResponse);

      console.log("Successfully Processed Data:", {
        appointments: appointmentsData,
        appointmentsCount: appointmentsData.length,
        reports: reportsData,
        reportsCount: reportsData.length,
      });

      setAppointments(appointmentsData);

      // Filter reports for current user's appointments with safe array operations
      const userReports = reportsData.filter((report) => {
        if (!report || !report.appointment) return false;
        return appointmentsData.some(
          (apt) => apt && apt.id === report.appointment.id
        );
      });

      console.log("Filtered user reports:", userReports);
      setMedicalReports(userReports);

      // Calculate stats with safe array operations
      const total = appointmentsData.length;
      const pending = appointmentsData.filter(
        (apt) => apt && apt.status === "Pending"
      ).length;
      const confirmed = appointmentsData.filter(
        (apt) => apt && apt.status === "Confirmed"
      ).length;
      const completed = appointmentsData.filter(
        (apt) => apt && apt.status === "Completed"
      ).length;

      const newStats = { total, pending, confirmed, completed };
      console.log("Calculated stats:", newStats);
      setStats(newStats);
    } catch (error) {
      console.error("Error fetching data:", error);
      // Set empty arrays as fallback
      setAppointments([]);
      setMedicalReports([]);
      setStats({
        total: 0,
        pending: 0,
        confirmed: 0,
        completed: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const openReportModal = (report) => {
    // Find the associated appointment for this report
    const associatedAppointment = appointments.find(
      (apt) => apt.id === report.appointment?.id
    );
    setSelectedReport({ ...report, appointment: associatedAppointment });
    setShowReportModal(true);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Pending":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "Confirmed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "Completed":
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case "Rejected":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Confirmed":
        return "bg-green-100 text-green-800 border-green-200";
      case "Completed":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Rejected":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                  Welcome back, {user?.userName}! 👋
                </h1>
                <p className="text-xl text-gray-600">
                  Manage your health and appointments from your personalized
                  dashboard
                </p>
              </div>
              <div className="hidden md:block">
                <div className="w-24 h-24 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                  <Heart className="h-12 w-12 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Link
            to="/symptom-checker"
            className="group bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all border border-gray-100 hover:border-blue-200 transform hover:-translate-y-1"
          >
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                  AI Symptom Checker
                </h3>
                <p className="text-gray-600 text-sm">
                  Get intelligent health insights
                </p>
              </div>
            </div>
          </Link>

          <Link
            to="/find-doctors"
            className="group bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all border border-gray-100 hover:border-green-200 transform hover:-translate-y-1"
          >
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Stethoscope className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-bold text-gray-900 group-hover:text-green-600 transition-colors">
                  Find Doctors
                </h3>
                <p className="text-gray-600 text-sm">
                  Search and book appointments
                </p>
              </div>
            </div>
          </Link>

          <button
            onClick={() => setActiveTab("appointments")}
            className="group bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all border border-gray-100 hover:border-purple-200 transform hover:-translate-y-1"
          >
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-bold text-gray-900 group-hover:text-purple-600 transition-colors">
                  My Appointments
                </h3>
                <p className="text-gray-600 text-sm">
                  {stats.total} total appointments
                </p>
              </div>
            </div>
          </button>

          <button
            onClick={() => setActiveTab("reports")}
            className="group bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all border border-gray-100 hover:border-orange-200 transform hover:-translate-y-1"
          >
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-bold text-gray-900 group-hover:text-orange-600 transition-colors">
                  Medical Reports
                </h3>
                <p className="text-gray-600 text-sm">
                  {medicalReports.length} reports available
                </p>
              </div>
            </div>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  Total Appointments
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.total}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Activity className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  Pending
                </p>
                <p className="text-3xl font-bold text-yellow-600">
                  {stats.pending}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  Confirmed
                </p>
                <p className="text-3xl font-bold text-green-600">
                  {stats.confirmed}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  Completed
                </p>
                <p className="text-3xl font-bold text-blue-600">
                  {stats.completed}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-2">
            <nav className="flex space-x-2">
              <button
                onClick={() => setActiveTab("overview")}
                className={`px-6 py-3 rounded-xl font-medium transition-all ${
                  activeTab === "overview"
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab("appointments")}
                className={`px-6 py-3 rounded-xl font-medium transition-all ${
                  activeTab === "appointments"
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                Appointments ({appointments.length})
              </button>
              <button
                onClick={() => setActiveTab("reports")}
                className={`px-6 py-3 rounded-xl font-medium transition-all ${
                  activeTab === "reports"
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                Medical Reports ({medicalReports.length})
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            {/* Recent Appointments */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
              <div className="px-8 py-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                  <Calendar className="h-6 w-6 mr-3 text-blue-600" />
                  Recent Appointments
                </h2>
              </div>
              <div className="p-8">
                {appointments.length === 0 ? (
                  <div className="text-center py-12">
                    <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      No appointments found
                    </h3>
                    <p className="text-gray-500 mb-6">
                      Start your health journey by booking your first
                      appointment
                    </p>
                    <Link
                      to="/find-doctors"
                      className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all"
                    >
                      <Plus className="h-5 w-5 mr-2" />
                      Book Your First Appointment
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {appointments.slice(0, 3).map((appointment) => (
                      <div
                        key={appointment.id}
                        className="flex items-center justify-between p-6 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <UserCircle className="h-6 w-6 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              Dr. {appointment.doctor?.name || "Unknown"}
                            </h3>
                            <p className="text-blue-600 font-medium">
                              {appointment.doctor?.specialization || "General"}
                            </p>
                            <p className="text-sm text-gray-500">
                              {appointment.date
                                ? new Date(
                                    appointment.date
                                  ).toLocaleDateString()
                                : "Date TBD"}{" "}
                              at {appointment.time || "Time TBD"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          {getStatusIcon(appointment.status)}
                          <span
                            className={`px-3 py-1 text-sm font-medium rounded-full border ${getStatusColor(
                              appointment.status
                            )}`}
                          >
                            {appointment.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Health Tips */}
            <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 rounded-2xl shadow-lg text-white overflow-hidden">
              <div className="p-8">
                <h2 className="text-2xl font-bold mb-6 flex items-center">
                  <Heart className="h-6 w-6 mr-3" />
                  Health Tips & Wellness
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white bg-opacity-20 p-6 rounded-xl backdrop-blur-sm">
                    <div className="w-12 h-12 bg-white bg-opacity-30 rounded-xl flex items-center justify-center mb-4">
                      <Activity className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="font-bold mb-2">Stay Hydrated</h3>
                    <p className="text-blue-100 text-sm">
                      Drink at least 8 glasses of water daily to maintain
                      optimal health and energy levels.
                    </p>
                  </div>
                  <div className="bg-white bg-opacity-20 p-6 rounded-xl backdrop-blur-sm">
                    <div className="w-12 h-12 bg-white bg-opacity-30 rounded-xl flex items-center justify-center mb-4">
                      <TrendingUp className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="font-bold mb-2">Regular Exercise</h3>
                    <p className="text-blue-100 text-sm">
                      Aim for 30 minutes of moderate exercise most days of the
                      week for better health.
                    </p>
                  </div>
                  <div className="bg-white bg-opacity-20 p-6 rounded-xl backdrop-blur-sm">
                    <div className="w-12 h-12 bg-white bg-opacity-30 rounded-xl flex items-center justify-center mb-4">
                      <Heart className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="font-bold mb-2">Balanced Diet</h3>
                    <p className="text-blue-100 text-sm">
                      Include fruits, vegetables, and whole grains in your daily
                      meals for nutrition.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "appointments" && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
            <div className="px-8 py-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <Calendar className="h-6 w-6 mr-3 text-blue-600" />
                All Appointments
              </h2>
            </div>
            <div className="p-8">
              {appointments.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    No appointments found
                  </h3>
                  <p className="text-gray-500 mb-6">
                    Book your first appointment to get started
                  </p>
                  <Link
                    to="/find-doctors"
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Book Appointment
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {appointments.map((appointment) => {
                    const hasReport = medicalReports.some(
                      (report) => report.appointment?.id === appointment.id
                    );
                    return (
                      <div
                        key={appointment.id}
                        className="border border-gray-200 rounded-xl p-6 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                              <UserCircle className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">
                                Dr. {appointment.doctor?.name || "Unknown"}
                              </h3>
                              <p className="text-blue-600 font-medium">
                                {appointment.doctor?.specialization ||
                                  "General"}
                              </p>
                              <p className="text-sm text-gray-500">
                                {appointment.date
                                  ? new Date(
                                      appointment.date
                                    ).toLocaleDateString()
                                  : "Date TBD"}{" "}
                                at {appointment.time || "Time TBD"}
                              </p>
                              <p className="text-sm text-gray-600 mt-1">
                                <strong>Reason:</strong>{" "}
                                {appointment.reason || "General consultation"}
                              </p>
                              {appointment.specialNotes && (
                                <p className="text-xs text-gray-500 mt-1">
                                  <strong>Notes:</strong>{" "}
                                  {appointment.specialNotes}
                                </p>
                              )}
                              {hasReport && (
                                <p className="text-xs text-green-600 mt-1 flex items-center">
                                  <FileText className="h-3 w-3 mr-1" />
                                  Medical report available
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            {getStatusIcon(appointment.status)}
                            <span
                              className={`px-3 py-1 text-sm font-medium rounded-full border ${getStatusColor(
                                appointment.status
                              )}`}
                            >
                              {appointment.status}
                            </span>
                            {hasReport && (
                              <button
                                onClick={() => {
                                  const report = medicalReports.find(
                                    (r) => r.appointment?.id === appointment.id
                                  );
                                  if (report) openReportModal(report);
                                }}
                                className="px-3 py-1 text-sm font-medium text-blue-600 bg-blue-50 rounded-full hover:bg-blue-100 transition-colors flex items-center"
                              >
                                <Maximize2 className="h-3 w-3 mr-1" />
                                View Report
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "reports" && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
            <div className="px-8 py-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <FileText className="h-6 w-6 mr-3 text-blue-600" />
                Medical Reports
              </h2>
            </div>
            <div className="p-8">
              {medicalReports.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    No medical reports available
                  </h3>
                  <p className="text-gray-500">
                    Medical reports will appear here after completed
                    appointments
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {medicalReports.map((report) => {
                    const associatedAppointment = appointments.find(
                      (apt) => apt.id === report.appointment?.id
                    );
                    return (
                      <div
                        key={report.id}
                        className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                              <FileText className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">
                                Medical Report
                              </h3>
                              <p className="text-sm text-gray-500">
                                {report.reportDate
                                  ? new Date(
                                      report.reportDate
                                    ).toLocaleDateString()
                                  : "Date unknown"}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                              Completed
                            </span>
                            <button
                              onClick={() => openReportModal(report)}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <Maximize2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <h4 className="font-medium text-gray-900 mb-1">
                              Diagnosis
                            </h4>
                            <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                              {report.diagnosis || "No diagnosis provided"}
                            </p>
                          </div>

                          <div>
                            <h4 className="font-medium text-gray-900 mb-1">
                              Prescribed Medicine
                            </h4>
                            <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                              {report.prescribedMedicine ||
                                "No medication prescribed"}
                            </p>
                          </div>

                          {report.doctorNotes && (
                            <div>
                              <h4 className="font-medium text-gray-900 mb-1">
                                Doctor's Notes
                              </h4>
                              <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                                {report.doctorNotes}
                              </p>
                            </div>
                          )}

                          <div className="pt-3 border-t border-gray-200">
                            <p className="text-xs text-gray-500">
                              <strong>Doctor:</strong> Dr.{" "}
                              {associatedAppointment?.doctor?.user?.userName ||
                                "Unknown"}
                            </p>
                            <p className="text-xs text-gray-500">
                              <strong>Appointment Date:</strong>{" "}
                              {associatedAppointment?.date
                                ? new Date(
                                    associatedAppointment.date
                                  ).toLocaleDateString()
                                : "N/A"}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Medical Report View Modal */}
      {showReportModal && selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-semibold text-gray-900">
                Medical Report
              </h3>
              <button
                onClick={() => setShowReportModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Report Header */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">
                    Patient Information
                  </h4>
                  <div className="space-y-2 text-sm">
                    <p>
                      <strong>Name:</strong> {user?.userName}
                    </p>
                    <p>
                      <strong>Report Date:</strong>{" "}
                      {selectedReport.reportDate
                        ? new Date(
                            selectedReport.reportDate
                          ).toLocaleDateString()
                        : "Date unknown"}
                    </p>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">
                    Doctor Information
                  </h4>
                  <div className="space-y-2 text-sm">
                    <p>
                      <strong>Doctor:</strong> Dr.{" "}
                      {selectedReport.appointment?.doctor?.name || "Unknown"}
                    </p>
                    <p>
                      <strong>Specialization:</strong>{" "}
                      {selectedReport.appointment?.doctor?.specialization ||
                        "General"}
                    </p>
                    <p>
                      <strong>Appointment Date:</strong>{" "}
                      {selectedReport.appointment?.date
                        ? new Date(
                            selectedReport.appointment.date
                          ).toLocaleDateString()
                        : "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Report Content */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Diagnosis */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <Activity className="h-5 w-5 mr-2 text-red-500" />
                  Diagnosis
                </h4>
                <div className="bg-red-50 rounded-lg p-4">
                  <p className="text-gray-800">
                    {selectedReport.diagnosis || "No diagnosis provided"}
                  </p>
                </div>
              </div>

              {/* Prescribed Medicines */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-blue-500" />
                  Prescribed Medicines
                </h4>
                <div className="bg-blue-50 rounded-lg p-4">
                  {selectedReport.prescribedMedicine ? (
                    <div className="space-y-2">
                      {selectedReport.prescribedMedicine
                        .split(", ")
                        .map((medicine, index) => (
                          <div
                            key={index}
                            className="flex items-start space-x-2"
                          >
                            <span className="text-blue-600 font-medium">
                              {index + 1}.
                            </span>
                            <p className="text-gray-800 text-sm">{medicine}</p>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No medicines prescribed</p>
                  )}
                </div>
              </div>

              {/* Doctor Notes */}
              <div className="bg-white border border-gray-200 rounded-lg p-6 lg:col-span-2">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <Stethoscope className="h-5 w-5 mr-2 text-green-500" />
                  Doctor's Notes & Recommendations
                </h4>
                <div className="bg-green-50 rounded-lg p-4">
                  <p className="text-gray-800">
                    {selectedReport.doctorNotes ||
                      "No additional notes provided"}
                  </p>
                </div>
              </div>
            </div>

            {/* Report Footer */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-500">
                  <p>
                    Report generated on{" "}
                    {selectedReport.reportDate
                      ? new Date(selectedReport.reportDate).toLocaleDateString()
                      : "Date unknown"}
                  </p>
                  <p>
                    Status:{" "}
                    <span className="text-green-600 font-medium">
                      Completed
                    </span>
                  </p>
                </div>
                <div className="flex space-x-3">
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    Download PDF
                  </button>
                  <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                    Print Report
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientDashboard;
