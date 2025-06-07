# 🏥 Healthcare Management System

A comprehensive digital healthcare platform that streamlines medical appointments, patient management, and doctor-patient interactions through role-based authentication and real-time data synchronization.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-v16%2B-green)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.x-blue)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-5.x-green)](https://www.mongodb.com/)

## 📋 Table of Contents

- [🌟 Features](#-features)
- [🏗️ System Architecture](#️-system-architecture)
- [🔐 Authentication Flow](#-authentication-flow)
- [📊 Dashboard Features](#-dashboard-features)
- [🛠️ Technology Stack](#️-technology-stack)
- [⚙️ Installation & Setup](#️-installation--setup)
- [🔧 Configuration](#-configuration)
- [📱 API Documentation](#-api-documentation)
- [📸 Screenshots](#-screenshots)
- [🚀 Deployment](#-deployment)
- [🧪 Testing](#-testing)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)
- [🙏 Acknowledgments](#-acknowledgments)
- [📞 Support & Contact](#-support--contact)

## 🌟 Features

### 🎯 Core Functionality
- **Role-based Authentication**: Secure login system with Patient, Doctor, and Admin roles
- **Appointment Management**: Complete booking, approval, and scheduling system
- **Medical Records**: Digital health records with report generation
- **Doctor Verification**: Admin-controlled doctor approval workflow
- **Real-time Updates**: Live synchronization across all user interfaces
- **Profile Management**: Comprehensive user profile customization

### 👨‍⚕️ For Doctors
- **Patient Management**: View and manage patient information with statistics
- **Appointment Control**: Approve/reject patient appointment requests
- **Schedule Management**: Daily schedule overview with time slots
- **Medical Reporting**: Create and manage detailed medical reports
- **Medicine Integration**: Add medicines to reports from integrated database
- **Income Tracking**: Monitor earnings from checkup fees
- **Analytics Dashboard**: Performance metrics with customizable time periods

### 👤 For Patients
- **Symptom Checker**: AI-powered symptom analysis tool
- **Doctor Finder**: Search and filter doctors by specialty and location
- **Appointment Booking**: Easy scheduling with real-time availability
- **Medical History**: Access to complete medical records and reports
- **Health Tips**: Personalized health recommendations
- **Appointment Tracking**: Real-time status updates for booked appointments

### 👨‍💼 For Administrators
- **Doctor Approval System**: Review and approve new doctor registrations
- **User Management**: Comprehensive user administration tools
- **System Analytics**: Platform usage statistics and insights
- **Activity Monitoring**: Track recent system activities
- **Platform Overview**: Complete system health dashboard

## 🏗️ System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API   │    │   Database      │
│   (React)       │◄──►│   (Node.js)     │◄──►│   (MongoDB)     │
│                 │    │                 │    │                 │
│ • Patient UI    │    │ • Authentication│    │ • Users         │
│ • Doctor UI     │    │ • Appointments  │    │ • Appointments  │
│ • Admin UI      │    │ • Medical Data  │    │ • Medical Reports│
│ • Auth System   │    │ • File Upload   │    │ • Medicines     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🔐 Authentication Flow

### Registration & Login Process
1. **User Registration**: Users register with role selection (Patient/Doctor)
2. **Email Verification**: Automated email verification system
3. **Role-based Routing**: Automatic redirection based on user role
4. **Admin Approval**: Doctors require admin approval before system access
5. **JWT Token Management**: Secure token-based authentication with auto-refresh

### Security Features
- **Protected Routes**: Role-based access control
- **Session Management**: Automatic logout on token expiration
- **Password Encryption**: Bcrypt hashing for secure password storage
- **CORS Configuration**: Proper cross-origin request handling

## 📊 Dashboard Features

### Patient Dashboard
- **Quick Actions**: Symptom checker, find doctors, book appointments
- **Appointment Status**: Real-time tracking of appointment requests
- **Medical Records**: Access to complete health history
- **Health Insights**: Personalized health tips and recommendations
- **Profile Management**: Update personal information and preferences

### Doctor Dashboard
- **Patient Statistics**: Overview of total and active patients
- **Appointment Management**: Approve/reject pending appointments
- **Today's Schedule**: Daily appointment calendar view
- **Medical Reporting**: Create and manage patient reports
- **Medicine Database**: Access to comprehensive medicine catalog
- **Income Analytics**: Financial tracking with detailed breakdowns
- **Performance Metrics**: Analytics with customizable date ranges

### Admin Dashboard
- **Doctor Approvals**: Review and process doctor applications
- **User Statistics**: Platform-wide user metrics and growth
- **Activity Feed**: Real-time system activity monitoring
- **User Management**: Administrative controls for all users
- **System Health**: Platform performance and status overview

## 🛠️ Technology Stack

### Frontend
- **React 18**: Modern React with Hooks and Context API
- **React Router**: Client-side routing with protected routes
- **Axios**: HTTP client for API communication
- **Tailwind CSS**: Utility-first CSS framework
- **React Icons**: Comprehensive icon library
- **Chart.js**: Interactive data visualization

### Backend
- **Node.js**: Server-side JavaScript runtime
- **Express.js**: Web application framework
- **MongoDB**: NoSQL database for data storage
- **Mongoose**: MongoDB object modeling
- **JWT**: JSON Web Token for authentication
- **Bcrypt**: Password hashing and security
- **Multer**: File upload handling
- **Nodemailer**: Email service integration

### DevOps & Tools
- **Git**: Version control system
- **npm**: Package management
- **Postman**: API testing and documentation
- **MongoDB Atlas**: Cloud database hosting
- **Heroku/Vercel**: Deployment platforms

## ⚙️ Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (v5 or higher)
- Git
- npm or yarn package manager

### Quick Start

1. **Clone the Repository**
   ```bash
   git clone https://github.com/yourusername/healthcare-management-system.git
   cd healthcare-management-system
   ```

2. **Install Dependencies**
   ```bash
   # Install backend dependencies
   cd backend
   npm install
   
   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

3. **Environment Setup**
   ```bash
   # Backend environment file
   cd backend
   cp .env.example .env
   
   # Frontend environment file
   cd ../frontend
   cp .env.example .env
   ```

4. **Database Setup**
   ```bash
   # Start MongoDB service
   mongod
   
   # Create database and collections
   npm run db:setup
   ```

5. **Start Development Servers**
   ```bash
   # Start backend server (Terminal 1)
   cd backend
   npm run dev
   
   # Start frontend server (Terminal 2)
   cd frontend
   npm start
   ```

6. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - Admin Panel: http://localhost:3000/admin

## 🔧 Configuration

### Backend Configuration (.env)
```env
# Database
MONGODB_URI=mongodb://localhost:27017/healthcare_db
DB_NAME=healthcare_management

# Authentication
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=7d
REFRESH_TOKEN_SECRET=your_refresh_token_secret

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Server Configuration
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000

# File Upload
MAX_FILE_SIZE=5MB
UPLOAD_PATH=./uploads
```

### Frontend Configuration (.env)
```env
# API Configuration
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_BASE_URL=http://localhost:5000

# Application Settings
REACT_APP_NAME=Healthcare Management System
REACT_APP_VERSION=1.0.0

# Third-party Services
REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_key
REACT_APP_ANALYTICS_ID=your_analytics_id
```

## 📱 API Documentation

### Authentication Endpoints
```http
POST /api/auth/register          # User registration
POST /api/auth/login             # User login
POST /api/auth/logout            # User logout
POST /api/auth/refresh-token     # Refresh JWT token
POST /api/auth/forgot-password   # Password reset request
POST /api/auth/reset-password    # Password reset confirmation
```

### User Management
```http
GET  /api/users/profile          # Get user profile
PUT  /api/users/profile          # Update user profile
GET  /api/users/doctors          # Get all doctors
PUT  /api/users/doctor/approve   # Approve doctor (Admin)
```

### Appointments
```http
POST /api/appointments           # Create appointment
GET  /api/appointments           # Get user appointments
PUT  /api/appointments/:id       # Update appointment status
DELETE /api/appointments/:id     # Cancel appointment
```

### Medical Records
```http
POST /api/medical-reports        # Create medical report
GET  /api/medical-reports        # Get medical reports
GET  /api/medical-reports/:id    # Get specific report
PUT  /api/medical-reports/:id    # Update medical report
```

### Medicine Database
```http
GET  /api/medicines              # Get all medicines
POST /api/medicines              # Add new medicine (Doctor/Admin)
PUT  /api/medicines/:id          # Update medicine info
DELETE /api/medicines/:id        # Remove medicine
```

## 📸 Screenshots

### Authentication & Landing
![Login Page](screenshots/login-page.png)
*Secure login interface with role selection*

![Registration](screenshots/registration.png)
*User registration with email verification*

### Patient Interface
![Patient Dashboard](screenshots/patient-dashboard.png)
*Patient dashboard with quick access to key features*

![Symptom Checker](screenshots/symptom-checker.png)
*AI-powered symptom analysis tool*

![Doctor Finder](screenshots/doctor-finder.png)
*Advanced doctor search with filters*

![Appointment Booking](screenshots/appointment-booking.png)
*Easy appointment scheduling interface*

### Doctor Interface
![Doctor Dashboard](screenshots/doctor-dashboard.png)
*Comprehensive doctor dashboard with analytics*

![Patient Management](screenshots/patient-management.png)
*Patient list with detailed information*

![Appointment Management](screenshots/appointment-management.png)
*Appointment approval and scheduling system*

![Medical Report Creation](screenshots/medical-report.png)
*Medical report creation with medicine integration*

![Doctor Analytics](screenshots/doctor-analytics.png)
*Income tracking and performance analytics*

### Admin Interface
![Admin Dashboard](screenshots/admin-dashboard.png)
*System overview with user statistics*

![Doctor Approval](screenshots/doctor-approval.png)
*Doctor verification and approval system*

![User Management](screenshots/user-management.png)
*Comprehensive user administration panel*

### Mobile Responsive
![Mobile View](screenshots/mobile-responsive.png)
*Fully responsive design for all devices*

## 🚀 Deployment

### Production Build
```bash
# Build frontend
cd frontend
npm run build

# Prepare backend for production
cd ../backend
npm run build
```

### Deployment Options

#### Heroku Deployment
```bash
# Install Heroku CLI
npm install -g heroku

# Login and create app
heroku login
heroku create your-app-name

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI=your_production_db_url

# Deploy
git push heroku main
```

#### Vercel Deployment (Frontend)
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy frontend
cd frontend
vercel --prod
```

#### Docker Deployment
```dockerfile
# Dockerfile included in repository
docker build -t healthcare-app .
docker run -p 3000:3000 healthcare-app
```

## 🧪 Testing

### Running Tests
```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test

# Integration tests
npm run test:integration

# End-to-end tests
npm run test:e2e
```

### Test Coverage
```bash
# Generate coverage report
npm run test:coverage

# View coverage report
npm run coverage:open
```

### Testing Framework
- **Jest**: JavaScript testing framework
- **React Testing Library**: React component testing
- **Supertest**: HTTP assertion library
- **Cypress**: End-to-end testing

## 🤝 Contributing

We welcome contributions to improve the Healthcare Management System! Please follow these guidelines:

### Development Process
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Standards
- Follow ESLint configuration
- Write unit tests for new features
- Update documentation as needed
- Follow conventional commit messages

### Issue Reporting
- Use GitHub Issues for bug reports
- Provide detailed reproduction steps
- Include system information and screenshots

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

```
MIT License

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
```

## 🙏 Acknowledgments

- **React Team** for the amazing frontend framework
- **Node.js Community** for the robust backend ecosystem
- **MongoDB** for the flexible database solution
- **Open Source Contributors** who made this project possible
- **Healthcare Professionals** who provided domain expertise
- **Beta Testers** for their valuable feedback

### Special Thanks
- UI/UX inspiration from modern healthcare platforms
- Icon sets from React Icons and Heroicons
- Color palette from Tailwind CSS
- Documentation template from Best README practices

## 📞 Support & Contact

### Getting Help
- **Documentation**: Check our [Wiki](wiki-link) for detailed guides
- **FAQ**: Common questions and solutions
- **Community**: Join our [Discord](discord-link) for discussions
- **Issues**: Report bugs on [GitHub Issues](issues-link)

### Contact Information
- **Project Maintainer**: [Your Name](mailto:your.email@example.com)
- **Team Email**: healthcare-support@example.com
- **LinkedIn**: [Your LinkedIn Profile](linkedin-link)
- **Twitter**: [@YourTwitterHandle](twitter-link)

### Business Inquiries
For commercial licensing, custom development, or enterprise solutions:
- **Email**: business@example.com
- **Phone**: +1 (555) 123-4567
- **Website**: [www.yourwebsite.com](website-link)

---

<div align="center">

### ⭐ Star this repository if you found it helpful!

**Built with ❤️ for better healthcare management**

[🔝 Back to Top](#-healthcare-management-system)

</div>
