"use client";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import PatientDashboard from "./pages/PatientDashboard";
import DoctorDashboard from "./pages/DoctorDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import SymptomChecker from "./pages/SymptomChecker";
import DoctorFinder from "./pages/DoctorFinder";
import BookAppointment from "./pages/BookAppointment";
import Profile from "./pages/Profile";
import LoadingSpinner from "./components/LoadingSpinner";
import ProtectedRoute from "./components/ProtectedRoute";
import DoctorPending from "./pages/DoctorPending";

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {user && <Navbar />}
      <Routes>
        <Route
          path="/login"
          element={!user ? <Login /> : <Navigate to="/dashboard" />}
        />
        <Route
          path="/register"
          element={!user ? <Register /> : <Navigate to="/dashboard" />}
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardRouter />
            </ProtectedRoute>
          }
        />

        <Route
          path="/symptom-checker"
          element={
            <ProtectedRoute roles={["Patient"]}>
              <SymptomChecker />
            </ProtectedRoute>
          }
        />

        <Route
          path="/find-doctors"
          element={
            <ProtectedRoute roles={["Patient"]}>
              <DoctorFinder />
            </ProtectedRoute>
          }
        />

        <Route
          path="/book-appointment/:doctorId"
          element={
            <ProtectedRoute roles={["Patient"]}>
              <BookAppointment />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/doctor-pending"
          element={
            <ProtectedRoute roles={["Doctor"]}>
              <DoctorPending />
            </ProtectedRoute>
          }
        />

        <Route path="/" element={<Navigate to="/dashboard" />} />
      </Routes>
    </div>
  );
}

function DashboardRouter() {
  const { user } = useAuth();

  if (user?.role === "Patient") {
    return <PatientDashboard />;
  } else if (user?.role === "Doctor") {
    if (user?.status === "Pending") {
      return <DoctorPending />;
    }
    return <DoctorDashboard />;
  } else if (user?.role === "Admin") {
    return <AdminDashboard />;
  }

  return <Navigate to="/login" />;
}

export default App;
