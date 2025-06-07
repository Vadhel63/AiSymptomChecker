"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { adminAPI } from "../services/api";
import {
  Users,
  UserCheck,
  UserX,
  Activity,
  Clock,
  CheckCircle,
  Shield,
  Eye,
  Ban,
  UserPlus,
} from "lucide-react";

const AdminDashboard = () => {
  // Initialize state variables with proper default values
  const [pendingDoctors, setPendingDoctors] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [stats, setStats] = useState({});
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsResponse, pendingResponse, usersResponse] = await Promise.all(
        [
          adminAPI.getDashboardStats(),
          adminAPI.getPendingDoctors(),
          adminAPI.getAllUsers(),
        ]
      );

      setStats(statsResponse.data || {});
      setPendingDoctors(
        Array.isArray(pendingResponse.data)
          ? pendingResponse.data
          : pendingResponse.data?.pendingDoctors || []
      );

      // Ensure allUsers is always an array
      const usersData = usersResponse.data;
      if (Array.isArray(usersData)) {
        setAllUsers(usersData);
      } else if (usersData && Array.isArray(usersData.users)) {
        setAllUsers(usersData.users);
      } else {
        console.error("Unexpected users data format:", usersData);
        setAllUsers([]);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setAllUsers([]);
      setPendingDoctors([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDoctorApproval = async (doctorId, action) => {
    try {
      if (action === "approve") {
        await adminAPI.approveDoctor(doctorId);
      } else {
        await adminAPI.rejectDoctor(doctorId, "Application rejected by admin");
      }
      fetchDashboardData(); // Refresh data
    } catch (error) {
      console.error("Error updating doctor status:", error);
    }
  };

  const handleUserStatusToggle = async (userId) => {
    try {
      await adminAPI.toggleUserStatus(userId);
      fetchDashboardData(); // Refresh data
    } catch (error) {
      console.error("Error toggling user status:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">
            Loading admin dashboard...
          </p>
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
                  Admin Dashboard 👨‍💼
                </h1>
                <p className="text-xl text-gray-600">
                  Welcome back, {user?.userName}. Manage your healthcare system
                </p>
              </div>
              <div className="hidden md:block">
                <div className="w-24 h-24 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                  <Shield className="h-12 w-12 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  Total Users
                </p>
                <p className="text-3xl font-bold text-blue-600">
                  {stats.totalUsers || allUsers.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  Pending Doctors
                </p>
                <p className="text-3xl font-bold text-yellow-600">
                  {pendingDoctors.length}
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
                  Active Doctors
                </p>
                <p className="text-3xl font-bold text-green-600">
                  {Array.isArray(allUsers)
                    ? allUsers.filter(
                        (u) => u.role === "Doctor" && u.status === "Active"
                      ).length
                    : 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <UserCheck className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  Active Patients
                </p>
                <p className="text-3xl font-bold text-purple-600">
                  {Array.isArray(allUsers)
                    ? allUsers.filter(
                        (u) => u.role === "Patient" && u.status === "Active"
                      ).length
                    : 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Activity className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  Blocked Users
                </p>
                <p className="text-3xl font-bold text-red-600">
                  {Array.isArray(allUsers)
                    ? allUsers.filter((u) => u.status === "Blocked").length
                    : 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <UserX className="h-6 w-6 text-red-600" />
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
                onClick={() => setActiveTab("pending")}
                className={`px-6 py-3 rounded-xl font-medium transition-all ${
                  activeTab === "pending"
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                Pending Doctors ({pendingDoctors.length})
              </button>
              <button
                onClick={() => setActiveTab("users")}
                className={`px-6 py-3 rounded-xl font-medium transition-all ${
                  activeTab === "users"
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                User Management ({allUsers.length})
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
              <div className="px-8 py-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                  <Activity className="h-6 w-6 mr-3 text-blue-600" />
                  System Overview
                </h2>
              </div>
              <div className="p-8">
                <div className="space-y-6">
                  <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
                    <span className="text-gray-700 font-medium">
                      Total System Users
                    </span>
                    <span className="font-bold text-blue-600 text-xl">
                      {allUsers.length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                    <span className="text-gray-700 font-medium">
                      Active Healthcare Providers
                    </span>
                    <span className="font-bold text-green-600 text-xl">
                      {Array.isArray(allUsers)
                        ? allUsers.filter(
                            (u) => u.role === "Doctor" && u.status === "Active"
                          ).length
                        : 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-purple-50 rounded-lg">
                    <span className="text-gray-700 font-medium">
                      Registered Patients
                    </span>
                    <span className="font-bold text-purple-600 text-xl">
                      {Array.isArray(allUsers)
                        ? allUsers.filter((u) => u.role === "Patient").length
                        : 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-yellow-50 rounded-lg">
                    <span className="text-gray-700 font-medium">
                      Pending Approvals
                    </span>
                    <span className="font-bold text-yellow-600 text-xl">
                      {pendingDoctors.length}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
              <div className="px-8 py-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                  <CheckCircle className="h-6 w-6 mr-3 text-green-600" />
                  Recent Activity
                </h2>
              </div>
              <div className="p-8">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-700">
                      System running smoothly
                    </span>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <span className="text-sm text-gray-700">
                      {pendingDoctors.length} doctor(s) awaiting approval
                    </span>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-sm text-gray-700">
                      All services operational
                    </span>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                    <span className="text-sm text-gray-700">
                      User registrations active
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "pending" && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
            <div className="px-8 py-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <Clock className="h-6 w-6 mr-3 text-yellow-600" />
                Pending Doctor Approvals
              </h2>
            </div>
            <div className="p-8">
              {pendingDoctors.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    No pending approvals
                  </h3>
                  <p className="text-gray-500">
                    All doctor applications have been processed
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {pendingDoctors.map((doctor) => (
                    <div
                      key={doctor.id}
                      className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <UserCheck className="h-6 w-6 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-900 text-lg">
                              {doctor.userName}
                            </h3>
                            <p className="text-blue-600 font-medium">
                              {doctor.email}
                            </p>
                          </div>
                        </div>
                        <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-medium rounded-full">
                          Pending
                        </span>
                      </div>

                      <div className="space-y-2 mb-6">
                        <p className="text-sm text-gray-600">
                          <strong>Role:</strong> {doctor.role}
                        </p>
                        <p className="text-sm text-gray-600">
                          <strong>Registration Date:</strong>{" "}
                          {new Date(
                            doctor.createdAt || Date.now()
                          ).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="flex space-x-3">
                        <button
                          onClick={() =>
                            handleDoctorApproval(doctor.id, "approve")
                          }
                          className="flex-1 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <CheckCircle className="h-4 w-4 mr-2 inline" />
                          Approve
                        </button>
                        <button
                          onClick={() =>
                            handleDoctorApproval(doctor.id, "reject")
                          }
                          className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                        >
                          <UserX className="h-4 w-4 mr-2 inline" />
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "users" && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
            <div className="px-8 py-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <Users className="h-6 w-6 mr-3 text-blue-600" />
                User Management
              </h2>
            </div>
            <div className="p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {allUsers.map((user) => (
                  <div
                    key={user.id}
                    className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                          <Users className="h-6 w-6 text-gray-600"  />
                          
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900">
                            {user.userName}
                          </h3>
                          <p className="text-sm text-gray-600">{user.email}</p>
                        </div>
                      </div>
                      <button
                        onClick={() =>
                          setSelectedUser(
                            selectedUser === user.id ? null : user.id
                          )
                        }
                        className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="space-y-3 mb-4">
                      <div className="flex items-center justify-between">
                        <span
                          className={`px-3 py-1 text-sm font-medium rounded-full ${
                            user.role === "Admin"
                              ? "bg-purple-100 text-purple-800"
                              : user.role === "Doctor"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {user.role}
                        </span>
                        <span
                          className={`px-3 py-1 text-sm font-medium rounded-full ${
                            user.status === "Active"
                              ? "bg-green-100 text-green-800"
                              : user.status === "Pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {user.status}
                        </span>
                      </div>

                      {selectedUser === user.id && (
                        <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-2">
                          <p className="text-sm text-gray-600">
                            <strong>User ID:</strong> {user.id}
                          </p>
                          <p className="text-sm text-gray-600">
                            <strong>Email:</strong> {user.email}
                          </p>
                          <p className="text-sm text-gray-600">
                            <strong>Role:</strong> {user.role}
                          </p>
                          <p className="text-sm text-gray-600">
                            <strong>Status:</strong> {user.status}
                          </p>
                          <p className="text-sm text-gray-600">
                            <strong>Joined:</strong>{" "}
                            {new Date(
                              user.createdAt || Date.now()
                            ).toLocaleDateString()}
                          </p>
                        </div>
                      )}
                    </div>

                    {user.role !== "Admin" && (
                      <button
                        onClick={() => handleUserStatusToggle(user.id)}
                        className={`w-full px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                          user.status === "Active"
                            ? "text-white bg-red-600 hover:bg-red-700"
                            : "text-white bg-green-600 hover:bg-green-700"
                        }`}
                      >
                        {user.status === "Active" ? (
                          <>
                            <Ban className="h-4 w-4 mr-2 inline" />
                            Block User
                          </>
                        ) : (
                          <>
                            <UserPlus className="h-4 w-4 mr-2 inline" />
                            Activate User
                          </>
                        )}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
