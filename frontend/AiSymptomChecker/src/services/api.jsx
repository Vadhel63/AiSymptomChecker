import axios from "axios";

const BASE_URL = "http://localhost:8080";

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Only redirect to login if we're not already on login/register pages
      const currentPath = window.location.pathname;
      if (currentPath !== "/login" && currentPath !== "/register") {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  setAuthToken: (token) => {
    if (token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common["Authorization"];
    }
  },

  login: (email, password) => api.post("/auth/login", { email, password }),

  register: (userData) => api.post("/auth/signup", userData),

  verifyToken: () => api.post("/auth/verify"),
};

// User API
export const userAPI = {
  getProfile: () => api.get("/Api/Profile"),
  updateProfile: (formData) =>
    api.put("/Api/UpdateProfile", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
};

// Doctor API
export const doctorAPI = {
  getAllDoctors: () => api.get("/Api/Doctors"),
  getDoctorById: (id) => api.get(`/Api/Doctor/${id}`),
  getMyProfile: () => api.get("/Api/Doctor/me"),
  addDoctor: (doctorData) => api.post("/Api/Doctor", doctorData),
  addDoctorByEmail: (doctorData) => api.post("/Api/Doctor", doctorData),
  updateDoctor: (id, doctorData) => api.put(`/Api/Doctor/${id}`, doctorData),
  updateStatus: (id, status) => api.put(`/Api/Doctor/${id}/status`, { status }),
};

// Patient API
export const patientAPI = {
  getAllPatients: () => api.get("/Api/Patients"),
  getPatientById: (id) => api.get(`/Api/Patient/${id}`),
  getMyProfile: () => api.get("/Api/Patient/me"),
  addPatient: (patientData) => api.post("/Api/Patient", patientData),
  addPatientBYEmail: (patientData) => api.post("/Api/Patient", patientData),
  updatePatient: (id, patientData) =>
    api.put(`/Api/Patient/${id}`, patientData),
};

// Appointment API
export const appointmentAPI = {
  getAllAppointments: () => api.get("/Api/Appointments"),
  getMyAppointments: () => api.get("/Api/Appointments/me"),
  getDoctorAppointments: () => api.get("/Api/Appointments/doctor"),
  getAppointmentById: (id) => api.get(`/Api/Appointment/${id}`),
  addAppointment: (appointmentData) =>
    api.post("/Api/Appointment", appointmentData),
  updateAppointment: (id, appointmentData) =>
    api.put(`/Api/Appointment/${id}`, appointmentData),
  updateStatus: (id, status) =>
    api.put(`/Api/Appointment/${id}/status`, { status }),
  checkAvailability: (doctorId, date, time) =>
    api.get(
      `/Api/Appointment/check-availability?doctorId=${doctorId}&date=${date}&time=${time}`
    ),
  deleteAppointment: (id) => api.delete(`/Api/Appointment/${id}`),
  // Razorpay Payment Integration
  createPaymentOrder: (orderData) =>
    api.post("/Api/Payment/create-order", orderData),
  verifyPaymentAndCreateAppointment: (paymentData) =>
    api.post("/Api/Payment/verify-and-create-appointment", paymentData),
};

// Medical Report API
export const medicalReportAPI = {
  getAllReports: () => api.get("/Api/MedicalReports"),
  getMyReports: () => api.get("/Api/MedicalReports/me"),
  getReportById: (id) => api.get(`/Api/MedicalReport/${id}`),
  addReport: (reportData) => api.post("/Api/MedicalReport", reportData),
  updateReport: (id, reportData) =>
    api.put(`/Api/MedicalReport/${id}`, reportData),
  deleteReport: (id) => api.delete(`/Api/MedicalReport/${id}`),
};

// Health API
export const healthAPI = {
  getAdvice: (userData) => api.post("/Api/Get-advice", userData),
};

// Admin API
export const adminAPI = {
  getPendingDoctors: () => api.get("/admin/pending-doctors"),
  approveDoctor: (doctorId) => api.post(`/admin/approve-doctor/${doctorId}`),
  rejectDoctor: (doctorId, reason) =>
    api.post(`/admin/reject-doctor/${doctorId}`, { reason }),
  getAllUsers: () => api.get("/admin/all-users"),
  toggleUserStatus: (userId) => api.post(`/admin/toggle-user-status/${userId}`),
  getDashboardStats: () => api.get("/admin/dashboard-stats"),
};

export default api;
