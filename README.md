# AiSymptomChecker

A fully integrated AI-powered symptom checker with role-based authentication and real-time backend integration for patients, doctors, and admins.

---

## 🚀 Project Overview

AiSymptomChecker is a comprehensive health management system with robust role segregation and live data synchronization. The system seamlessly integrates patient, doctor, and admin dashboards, providing tailored workflows, advanced appointment management, and medical reporting.

---

## 📁 Project Structure

```
AiSymptomChecker/
├── backend/
│   └── Ai-sypmtom/
├── frontend/
│   └── AiSymptomChecker/
├── .gitignore
├── README.md
```

- **backend/Ai-sypmtom/**: Contains backend API, authentication, business logic, and integrations.
- **frontend/AiSymptomChecker/**: Contains all frontend code (React or similar) for UI, dashboards, and client-side logic.

---

## 🔐 Enhanced Authentication & Authorization

- **Role-based redirection**: Users are routed to their respective dashboards upon login.
- **Doctor approval workflow**: Doctor accounts require admin approval before accessing the system.
- **Protected routes**: All routes are guarded and accessible only to permitted roles.

---

## 📊 Refined Dashboards

### Patient Dashboard
- Quick access: Symptom checker, doctor finder, appointments, and medical records.
- Real-time: See appointment statuses and medical report updates.
- Health tips and profile management.

### Doctor Dashboard
- Patient and appointment management, including approve/reject system.
- Today's schedule, analytics by time period.
- Medical report creation, including adding medicines.
- View income and manage profile.

### Admin Dashboard
- Approve/reject new doctor accounts.
- System overview: user statistics and recent activity.
- User management.

---

## 🔗 Backend Integration

- Complete API service layer with robust error handling.
- JWT token management with auto-refresh.
- Real-time data updates across dashboards.
- Proper CORS configuration.

---

## 🎯 Key Features

1. **Doctor Approval Flow**: Doctors register → Admin reviews → Approval/Rejection → Access granted.
2. **Appointment Management**: Patients book → Doctors approve → Appointment confirmed.
3. **Medical Reports**: Doctors create reports for completed appointments.
4. **Role-based Access**: Each user role sees tailored features and dashboards.
5. **Real-time Updates**: Live information sync across all dashboards.

---

## 🖼️ Screenshots

> Add screenshots of Patient/Doctor/Admin dashboards, login, approval flows, etc.

- ![Dashboard Screenshot](#)
- ![Appointment Flow](#)
- ![Medical Report Module](#)

---

## 🛠️ Getting Started

### Prerequisites

- Node.js, npm/yarn
- Python (if backend uses it), or relevant backend runtime
- MongoDB/PostgreSQL/Other DB

### Installation

```bash
# Clone the repository
git clone https://github.com/Vadhel63/AiSymptomChecker.git

# Install backend dependencies
cd backend/Ai-sypmtom
npm install

# Install frontend dependencies
cd ../../frontend/AiSymptomChecker
npm install
```

### Running the Application

```bash
# Start backend (from backend/Ai-sypmtom)
npm run dev

# Start frontend (from frontend/AiSymptomChecker)
npm start
```

> Configure `.env` files for backend and frontend as per your environment.

---

## 🤝 Contributing

Contributions are welcome! Please open issues or pull requests for improvements and bug fixes.

---

## 📄 License

This project is licensed under the MIT License.

---

## 🙏 Acknowledgments

Thanks to all contributors and the open-source community!
