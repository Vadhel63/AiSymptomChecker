# 🩺 AI Symptom Checker & Doctor Appointment System

A fully integrated, role-based web application enabling **patients**, **doctors**, and **admins** to interact efficiently with health-related features like symptom checking, doctor discovery, appointment booking, medical report management, and real-time data synchronization.

---

## 🚀 Features

### 🔐 Role-Based Authentication
- **JWT-powered login flow** with secure token management.
- **Role-based routing**: Users are redirected to their appropriate dashboards post-login.
- **Doctor approval system**: Only admin-approved doctors can access doctor dashboard.
- **Protected Routes**: Only accessible based on roles (`Patient`, `Doctor`, `Admin`).

---

### 📊 Dashboards

#### 👤 **Patient Dashboard**
- Access to Symptom Checker, Doctor Finder, Appointment Booking.
- View real-time appointment statuses.
- Overview of uploaded or received medical reports.
- Personalized health tips and alerts.

#### 🩺 **Doctor Dashboard**
- View and manage patient details and medical history.
- Approve/reject appointment requests.
- View today’s appointments and manage schedule.
- Generate and upload medical reports.
- Dashboard analytics with custom time filters.

#### 🛡️ **Admin Dashboard**
- Approve or reject new doctor registrations.
- Monitor application statistics and recent activity.
- Manage all users (patients, doctors).
- System health overview.

---

### 🔗 Backend Integration (Spring Boot)
- Complete **RESTful API layer** with full error handling.
- **JWT Token Management** with auto-refresh support.
- **Real-time updates** synced across all clients.
- **CORS configuration** for frontend-backend interaction.

---

## ⚙️ Backend Requirements

Update your Spring Boot backend with the following:

### 🔍 Verify JWT Token Endpoint
```java
@PostMapping("/verify-token")
public ResponseEntity<?> verifyToken(@RequestHeader("Authorization") String token) {
    // Verify JWT token and return user details with role and status
}
