# AiSymptomChecker

AI-powered healthcare platform with role-based dashboards for Patients, Doctors, and Admins. Built with Spring Boot (Java 17) and a modern frontend.

---
![Java](https://img.shields.io/badge/Java-17+-orange.svg)](https://www.oracle.com/java/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.0-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18.2.0-blue.svg)](https://reactjs.org/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0+-blue.svg)](https://www.mysql.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
---

## 📑 Table of Contents

- [🌟 Features](#features)
- [🏗️ System Architecture](#system-architecture)
- [🔐 Authentication Flow](#authentication-flow)
- [📊 Dashboard Features](#dashboard-features)
- [🛠️ Technology Stack](#technology-stack)
- [⚙️ Installation & Setup](#installation--setup)
- [🔧 Configuration](#configuration)
- [📱 API Documentation](#api-documentation)
- [📸 Screenshots](#screenshots)
- [🤝 Contributing](#contributing)
- [📄 License](#license)
- [🙏 Acknowledgments](#acknowledgments)

---

## 🌟 Features

- **Role-based authentication** for Patients, Doctors, and Admins
- **Doctor approval workflow** (Admin must approve new doctors)
- **Protected routes** and dashboards per role
- **Appointment booking and approval**
- **Medical report creation and management**
- **Real-time data sync** across dashboards
- **JWT token management with auto-refresh**
- **Robust API error handling and CORS support**

---

## 🏗️ System Architecture

```
AiSymptomChecker/
├── backend/
│   └── Ai-sypmtom/         # Spring Boot (Java 17) backend source code
├── frontend/
│   └── AiSymptomChecker/   # Frontend source code (React,...)
├── .gitignore
├── README.md
```

- **backend/Ai-sypmtom/**: Spring Boot REST API (Java 17)
- **frontend/AiSymptomChecker/**: Modern frontend (React/Angular/Vue)

---

## 🔐 Authentication Flow

- **Role-based Login:** Users (patient/doctor/admin) are redirected to their respective dashboard after login.
- **Doctor Registration Approval:** Doctors must be approved by an admin before accessing system features.
- **Route Protection:** Each dashboard and API is protected according to user role with JWT security.
- **Automatic Token Refresh:** Smooth user experience with background token renewal.

---

## 📊 Dashboard Features

### Patient Dashboard
- Symptom checker, doctor finder
- Book/manage appointments
- Medical records and health tips
- Real-time appointment status
- Profile management

### Doctor Dashboard
- Patient list & statistics
- Approve/reject appointments
- Daily schedule & analytics
- Create/manage medical reports & prescribe medicines
- Income tracking & profile management

### Admin Dashboard
- Approve/reject doctor accounts
- System/user statistics & recent activity
- Comprehensive user management

---

## 🛠️ Technology Stack

- **Backend:** Spring Boot (Java 17), Spring Security, JWT, RESTful APIs
- **Frontend:** React.js+tailwind css
- **Database:** ( MySQL) 
- **Authentication:** JWT
- **Other:** CORS, Maven

---

## ⚙️ Installation & Setup

### Prerequisites

- Java 17+
- Maven 
- Node.js (for frontend)
- Database (MySQL)

### Clone the repository

```bash
git clone https://github.com/Vadhel63/AiSymptomChecker.git
```

### Backend (Spring Boot)

```bash
cd AiSymptomChecker/backend/Ai-sypmtom
# For Maven
./mvnw spring-boot:run

```
> Configure `application.properties` or `application.yml` with your database and JWT settings.

### Frontend

```bash
cd ../../frontend/AiSymptomChecker
npm install
npm run dev
npm start
```

---

## 🔧 Configuration

- **Backend:**  
  - Set environment variables or edit `application.properties`/`application.yml` for DB connection, JWT secret, CORS, etc.
- **Frontend:**  
  - Configure API base URL and environment settings as required (e.g., `src/environments/` or `.env` file).

---

## 📱 API Documentation

> (Document your REST endpoints here or link to Swagger/OpenAPI docs if available)

- **Base URL:** `http://localhost:8080/api`
- **Endpoints include:**
  - `/auth/login`
  - `/auth/register`
  - `Api/patients/*`
  - `Api/doctors/*`
  - `Api/admin/*`
  - `Api/appointments/*`
  - `Api/medical-reports/*`
- For complete API details, see [API Docs](#) _(add link if using Swagger UI or similar)_

---

## 📸 Screenshots

> Replace `#` with actual image URLs or upload screenshots to the repo.

- ![Login Page](#)
- ![Patient Dashboard](#)
- ![Doctor Approval Flow](#)
- ![Medical Report Creation](#)
- ![Admin Dashboard](#)

---







## 📄 License

This project is licensed under the MIT License.

---

## 🙏 Acknowledgments

Thanks to the contributors and the open-source community for inspiration and support.
