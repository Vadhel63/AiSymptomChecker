"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import {
  appointmentAPI,
  medicalReportAPI,
  patientAPI,
  doctorAPI,
} from "../services/api";
import {
  Users,
  Calendar,
  Activity,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Stethoscope,
  UserCircle,
  Eye,
  Search,
  Bell,
  Heart,
  X,
  Plus,
  Pill,
  DollarSign,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  FileText,
  Save,
  MapPin,
  Award,
  Building,
  Maximize2,
  Download,
  Package,
  AlertTriangle,
} from "lucide-react";

const DoctorDashboard = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [reports, setReports] = useState([]);
  const [doctorProfile, setDoctorProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [showMedicineModal, setShowMedicineModal] = useState(false);
  const [showMedicalReportModal, setShowMedicalReportModal] = useState(false);
  const [showReportViewModal, setShowReportViewModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [medicineSearch, setMedicineSearch] = useState("");
  const [medicines, setMedicines] = useState([]);
  const [selectedMedicines, setSelectedMedicines] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [medicalReportForm, setMedicalReportForm] = useState({
    diagnosis: "",
    prescribedMedicine: "",
    doctorNotes: "",
    medicines: [],
  });
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    completed: 0,
    today: 0,
    totalPatients: 0,
  });
  const [earnings, setEarnings] = useState({
    daily: 0,
    monthly: 0,
    yearly: 0,
    totalEarnings: 0,
  });
  const [medicineLoading, setMedicineLoading] = useState(false);

  // Enhanced medicine database with quantities and detailed information
  const medicineDatabase = [
    // Pain Relief & Anti-inflammatory
    {
      id: 1,
      name: "Paracetamol",
      genericName: "Acetaminophen",
      dosage: "500mg",
      type: "Tablet",
      manufacturer: "GSK",
      category: "Analgesic",
      stockQuantity: 500,
      minStockLevel: 50,
      price: 2.5,
      frequency: "3 times daily",
      duration: "5 days",
      instructions: "Take after meals",
      sideEffects: "Nausea, skin rash",
      contraindications: "Liver disease",
    },
    {
      id: 2,
      name: "Ibuprofen",
      genericName: "Ibuprofen",
      dosage: "400mg",
      type: "Tablet",
      manufacturer: "Pfizer",
      category: "NSAID",
      stockQuantity: 300,
      minStockLevel: 30,
      price: 3.0,
      frequency: "2 times daily",
      duration: "3 days",
      instructions: "Take with food",
      sideEffects: "Stomach upset, dizziness",
      contraindications: "Peptic ulcer, kidney disease",
    },
    {
      id: 3,
      name: "Aspirin",
      genericName: "Acetylsalicylic acid",
      dosage: "75mg",
      type: "Tablet",
      manufacturer: "Bayer",
      category: "Antiplatelet",
      stockQuantity: 400,
      minStockLevel: 40,
      price: 1.5,
      frequency: "Once daily",
      duration: "Ongoing",
      instructions: "Take in morning",
      sideEffects: "Stomach irritation, bleeding",
      contraindications: "Bleeding disorders",
    },
    {
      id: 4,
      name: "Diclofenac",
      genericName: "Diclofenac Sodium",
      dosage: "50mg",
      type: "Tablet",
      manufacturer: "Novartis",
      category: "NSAID",
      stockQuantity: 250,
      minStockLevel: 25,
      price: 4.5,
      frequency: "2 times daily",
      duration: "7 days",
      instructions: "Take with food",
      sideEffects: "Stomach pain, headache",
      contraindications: "Heart disease, kidney problems",
    },

    // Antibiotics
    {
      id: 5,
      name: "Amoxicillin",
      genericName: "Amoxicillin",
      dosage: "250mg",
      type: "Capsule",
      manufacturer: "Abbott",
      category: "Antibiotic",
      stockQuantity: 200,
      minStockLevel: 25,
      price: 5.0,
      frequency: "3 times daily",
      duration: "7 days",
      instructions: "Complete full course",
      sideEffects: "Diarrhea, allergic reactions",
      contraindications: "Penicillin allergy",
    },
    {
      id: 6,
      name: "Ciprofloxacin",
      genericName: "Ciprofloxacin HCl",
      dosage: "500mg",
      type: "Tablet",
      manufacturer: "Cipla",
      category: "Antibiotic",
      stockQuantity: 150,
      minStockLevel: 15,
      price: 9.0,
      frequency: "2 times daily",
      duration: "10 days",
      instructions: "Take on empty stomach",
      sideEffects: "Nausea, tendon problems",
      contraindications: "Pregnancy, children under 18",
    },
    {
      id: 7,
      name: "Azithromycin",
      genericName: "Azithromycin",
      dosage: "250mg",
      type: "Tablet",
      manufacturer: "Pfizer",
      category: "Antibiotic",
      stockQuantity: 180,
      minStockLevel: 20,
      price: 12.0,
      frequency: "Once daily",
      duration: "5 days",
      instructions: "Take on empty stomach",
      sideEffects: "Stomach upset, diarrhea",
      contraindications: "Liver disease",
    },
    {
      id: 8,
      name: "Cephalexin",
      genericName: "Cephalexin",
      dosage: "500mg",
      type: "Capsule",
      manufacturer: "Teva",
      category: "Antibiotic",
      stockQuantity: 120,
      minStockLevel: 15,
      price: 8.5,
      frequency: "4 times daily",
      duration: "7 days",
      instructions: "Take with or without food",
      sideEffects: "Diarrhea, stomach upset",
      contraindications: "Cephalosporin allergy",
    },

    // Cardiovascular
    {
      id: 9,
      name: "Lisinopril",
      genericName: "Lisinopril",
      dosage: "10mg",
      type: "Tablet",
      manufacturer: "Merck",
      category: "ACE Inhibitor",
      stockQuantity: 250,
      minStockLevel: 25,
      price: 6.0,
      frequency: "Once daily",
      duration: "Ongoing",
      instructions: "Take at same time daily",
      sideEffects: "Dry cough, dizziness",
      contraindications: "Pregnancy, angioedema",
    },
    {
      id: 10,
      name: "Losartan",
      genericName: "Losartan potassium",
      dosage: "50mg",
      type: "Tablet",
      manufacturer: "Teva",
      category: "ARB",
      stockQuantity: 280,
      minStockLevel: 30,
      price: 5.5,
      frequency: "Once daily",
      duration: "Ongoing",
      instructions: "Can be taken with or without food",
      sideEffects: "Dizziness, fatigue",
      contraindications: "Pregnancy, severe kidney disease",
    },
    {
      id: 11,
      name: "Atorvastatin",
      genericName: "Atorvastatin calcium",
      dosage: "20mg",
      type: "Tablet",
      manufacturer: "Lipitor",
      category: "Statin",
      stockQuantity: 180,
      minStockLevel: 20,
      price: 8.0,
      frequency: "Once daily",
      duration: "Ongoing",
      instructions: "Take in evening",
      sideEffects: "Muscle pain, liver problems",
      contraindications: "Active liver disease",
    },
    {
      id: 12,
      name: "Amlodipine",
      genericName: "Amlodipine besylate",
      dosage: "5mg",
      type: "Tablet",
      manufacturer: "Pfizer",
      category: "Calcium Channel Blocker",
      stockQuantity: 200,
      minStockLevel: 25,
      price: 4.0,
      frequency: "Once daily",
      duration: "Ongoing",
      instructions: "Take at same time daily",
      sideEffects: "Swelling, dizziness",
      contraindications: "Severe heart failure",
    },

    // Diabetes
    {
      id: 13,
      name: "Metformin",
      genericName: "Metformin HCl",
      dosage: "500mg",
      type: "Tablet",
      manufacturer: "Novartis",
      category: "Antidiabetic",
      stockQuantity: 350,
      minStockLevel: 35,
      price: 4.0,
      frequency: "2 times daily",
      duration: "Ongoing",
      instructions: "Take with meals",
      sideEffects: "Nausea, diarrhea",
      contraindications: "Kidney disease, heart failure",
    },
    {
      id: 14,
      name: "Glipizide",
      genericName: "Glipizide",
      dosage: "5mg",
      type: "Tablet",
      manufacturer: "Pfizer",
      category: "Antidiabetic",
      stockQuantity: 150,
      minStockLevel: 20,
      price: 6.5,
      frequency: "2 times daily",
      duration: "Ongoing",
      instructions: "Take before meals",
      sideEffects: "Low blood sugar, weight gain",
      contraindications: "Severe kidney disease",
    },
    {
      id: 15,
      name: "Insulin Glargine",
      genericName: "Insulin Glargine",
      dosage: "100 units/ml",
      type: "Injection",
      manufacturer: "Sanofi",
      category: "Insulin",
      stockQuantity: 50,
      minStockLevel: 10,
      price: 45.0,
      frequency: "Once daily",
      duration: "Ongoing",
      instructions: "Inject subcutaneously",
      sideEffects: "Low blood sugar, injection site reactions",
      contraindications: "Hypoglycemia",
    },

    // Gastrointestinal
    {
      id: 16,
      name: "Omeprazole",
      genericName: "Omeprazole",
      dosage: "20mg",
      type: "Capsule",
      manufacturer: "AstraZeneca",
      category: "PPI",
      stockQuantity: 320,
      minStockLevel: 30,
      price: 7.0,
      frequency: "Once daily",
      duration: "14 days",
      instructions: "Take before breakfast",
      sideEffects: "Headache, stomach pain",
      contraindications: "Severe liver disease",
    },
    {
      id: 17,
      name: "Ranitidine",
      genericName: "Ranitidine HCl",
      dosage: "150mg",
      type: "Tablet",
      manufacturer: "GSK",
      category: "H2 Blocker",
      stockQuantity: 200,
      minStockLevel: 25,
      price: 3.5,
      frequency: "2 times daily",
      duration: "7 days",
      instructions: "Take with or without food",
      sideEffects: "Headache, dizziness",
      contraindications: "Kidney disease",
    },
    {
      id: 18,
      name: "Loperamide",
      genericName: "Loperamide HCl",
      dosage: "2mg",
      type: "Capsule",
      manufacturer: "Johnson & Johnson",
      category: "Antidiarrheal",
      stockQuantity: 100,
      minStockLevel: 15,
      price: 5.0,
      frequency: "As needed",
      duration: "2 days",
      instructions: "Take after loose stool",
      sideEffects: "Constipation, dizziness",
      contraindications: "Bacterial diarrhea",
    },

    // Respiratory
    {
      id: 19,
      name: "Salbutamol",
      genericName: "Salbutamol sulfate",
      dosage: "100mcg",
      type: "Inhaler",
      manufacturer: "GSK",
      category: "Bronchodilator",
      stockQuantity: 80,
      minStockLevel: 10,
      price: 15.0,
      frequency: "As needed",
      duration: "Ongoing",
      instructions: "Inhale as directed",
      sideEffects: "Tremor, rapid heartbeat",
      contraindications: "Severe heart disease",
    },
    {
      id: 20,
      name: "Prednisolone",
      genericName: "Prednisolone",
      dosage: "5mg",
      type: "Tablet",
      manufacturer: "Pfizer",
      category: "Corticosteroid",
      stockQuantity: 150,
      minStockLevel: 20,
      price: 8.0,
      frequency: "Once daily",
      duration: "5 days",
      instructions: "Take with food",
      sideEffects: "Weight gain, mood changes",
      contraindications: "Systemic infections",
    },

    // Mental Health
    {
      id: 21,
      name: "Sertraline",
      genericName: "Sertraline HCl",
      dosage: "50mg",
      type: "Tablet",
      manufacturer: "Pfizer",
      category: "Antidepressant",
      stockQuantity: 120,
      minStockLevel: 15,
      price: 12.0,
      frequency: "Once daily",
      duration: "Ongoing",
      instructions: "Take in morning",
      sideEffects: "Nausea, sleep problems",
      contraindications: "MAO inhibitor use",
    },
    {
      id: 22,
      name: "Lorazepam",
      genericName: "Lorazepam",
      dosage: "1mg",
      type: "Tablet",
      manufacturer: "Wyeth",
      category: "Anxiolytic",
      stockQuantity: 80,
      minStockLevel: 10,
      price: 10.0,
      frequency: "2-3 times daily",
      duration: "Short term",
      instructions: "Take as directed",
      sideEffects: "Drowsiness, confusion",
      contraindications: "Respiratory depression",
    },

    // Vitamins & Supplements
    {
      id: 23,
      name: "Vitamin D3",
      genericName: "Cholecalciferol",
      dosage: "1000 IU",
      type: "Tablet",
      manufacturer: "Nature Made",
      category: "Vitamin",
      stockQuantity: 300,
      minStockLevel: 30,
      price: 3.0,
      frequency: "Once daily",
      duration: "Ongoing",
      instructions: "Take with food",
      sideEffects: "Rare at normal doses",
      contraindications: "Hypercalcemia",
    },
    {
      id: 24,
      name: "Folic Acid",
      genericName: "Folic Acid",
      dosage: "5mg",
      type: "Tablet",
      manufacturer: "Abbott",
      category: "Vitamin",
      stockQuantity: 200,
      minStockLevel: 25,
      price: 2.0,
      frequency: "Once daily",
      duration: "Ongoing",
      instructions: "Take with or without food",
      sideEffects: "Rare",
      contraindications: "B12 deficiency",
    },
    {
      id: 25,
      name: "Iron Sulfate",
      genericName: "Ferrous Sulfate",
      dosage: "325mg",
      type: "Tablet",
      manufacturer: "Teva",
      category: "Mineral",
      stockQuantity: 180,
      minStockLevel: 20,
      price: 4.0,
      frequency: "Once daily",
      duration: "3 months",
      instructions: "Take on empty stomach",
      sideEffects: "Stomach upset, constipation",
      contraindications: "Iron overload",
    },
  ];

  // Simulate API call for medicine data
  const fetchMedicinesFromAPI = async (searchQuery = "") => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Filter medicines based on search query
    if (!searchQuery.trim()) {
      return medicineDatabase;
    }

    return medicineDatabase.filter(
      (med) =>
        med.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        med.genericName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        med.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        med.manufacturer.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (reports.length > 0 && doctorProfile) {
      calculateDynamicEarnings();
    }
  }, [reports, doctorProfile]);

  const parseApiData = (response) => {
    try {
      let data = null;

      if (response?.data) {
        if (typeof response.data === "string") {
          data = JSON.parse(response.data);
        } else if (Array.isArray(response.data)) {
          data = response.data;
        } else {
          data = response.data;
        }
      } else if (Array.isArray(response)) {
        data = response;
      } else if (typeof response === "string") {
        data = JSON.parse(response);
      }

      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error("Error parsing API data:", error);
      return [];
    }
  };

  const fetchData = async () => {
    try {
      const [
        appointmentsResponse,
        patientsResponse,
        reportsResponse,
        doctorResponse,
      ] = await Promise.all([
        appointmentAPI.getDoctorAppointments(),
        patientAPI.getAllPatients(),
        medicalReportAPI.getAllReports(),
        doctorAPI.getMyProfile(),
      ]);

      const appointmentsData = parseApiData(appointmentsResponse);
      const patientsData = parseApiData(patientsResponse);
      const reportsData = parseApiData(reportsResponse);
      const doctorData = doctorResponse.data || doctorResponse;

      setAppointments(appointmentsData);
      setPatients(patientsData);
      setReports(reportsData);
      setDoctorProfile(doctorData);

      // Calculate stats
      const total = appointmentsData.length;
      const pending = appointmentsData.filter(
        (apt) => apt.status === "Pending"
      ).length;
      const confirmed = appointmentsData.filter(
        (apt) => apt.status === "Confirmed"
      ).length;
      const completed = appointmentsData.filter(
        (apt) => apt.status === "Completed"
      ).length;

      const today = new Date().toISOString().split("T")[0];
      const todayAppointments = appointmentsData.filter(
        (apt) => apt.date === today
      ).length;

      const uniquePatients = new Set(
        appointmentsData.map((apt) => apt.patient?.patientId).filter(Boolean)
      );
      const totalPatients = uniquePatients.size;

      setStats({
        total,
        pending,
        confirmed,
        completed,
        today: todayAppointments,
        totalPatients,
      });
    } catch (error) {
      console.error("Error fetching data:", error);
      setAppointments([]);
      setPatients([]);
      setReports([]);
      setDoctorProfile(null);
      setStats({
        total: 0,
        pending: 0,
        confirmed: 0,
        completed: 0,
        today: 0,
        totalPatients: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateDynamicEarnings = () => {
    try {
      const today = new Date();
      const currentMonth = today.getMonth();
      const currentYear = today.getFullYear();
      const todayStr = today.toISOString().split("T")[0];

      const reportsArray = Array.isArray(reports) ? reports : [];
      const appointmentsArray = Array.isArray(appointments) ? appointments : [];

      const checkupFee = doctorProfile?.checkUpFee || 50;

      const completedAppointments = appointmentsArray.filter(
        (apt) => apt.status === "Completed"
      );

      const todayCompletedAppointments = completedAppointments.filter(
        (apt) => apt.date === todayStr
      );

      const monthlyCompletedAppointments = completedAppointments.filter(
        (apt) => {
          try {
            const aptDate = new Date(apt.date);
            return (
              aptDate.getMonth() === currentMonth &&
              aptDate.getFullYear() === currentYear
            );
          } catch {
            return false;
          }
        }
      );

      const yearlyCompletedAppointments = completedAppointments.filter(
        (apt) => {
          try {
            const aptDate = new Date(apt.date);
            return aptDate.getFullYear() === currentYear;
          } catch {
            return false;
          }
        }
      );

      const dailyEarnings = todayCompletedAppointments.length * checkupFee;
      const monthlyEarnings = monthlyCompletedAppointments.length * checkupFee;
      const yearlyEarnings = yearlyCompletedAppointments.length * checkupFee;
      const totalEarnings = completedAppointments.length * checkupFee;

      setEarnings({
        daily: dailyEarnings,
        monthly: monthlyEarnings,
        yearly: yearlyEarnings,
        totalEarnings: totalEarnings,
      });
    } catch (error) {
      console.error("Error calculating earnings:", error);
      setEarnings({
        daily: 0,
        monthly: 0,
        yearly: 0,
        totalEarnings: 0,
      });
    }
  };

  const handleStatusUpdate = async (appointmentId, status) => {
    try {
      await appointmentAPI.updateStatus(appointmentId, status);
      fetchData();
    } catch (error) {
      console.error("Error updating appointment status:", error);
    }
  };

  const searchMedicines = async (query) => {
    if (!query.trim()) {
      setMedicines([]);
      return;
    }

    setMedicineLoading(true);
    try {
      const results = await fetchMedicinesFromAPI(query);
      setMedicines(results);
    } catch (error) {
      console.error("Error fetching medicines:", error);
      setMedicines([]);
    } finally {
      setMedicineLoading(false);
    }
  };

  const addMedicineToReport = (medicine) => {
    if (!selectedMedicines.find((med) => med.id === medicine.id)) {
      setSelectedMedicines([
        ...selectedMedicines,
        { ...medicine, prescribedQuantity: 1 },
      ]);
    }
  };

  const updateMedicineQuantity = (medicineId, quantity) => {
    setSelectedMedicines(
      selectedMedicines.map((med) =>
        med.id === medicineId ? { ...med, prescribedQuantity: quantity } : med
      )
    );
  };

  const removeMedicineFromReport = (medicineId) => {
    setSelectedMedicines(
      selectedMedicines.filter((med) => med.id !== medicineId)
    );
  };

  const openMedicalReportModal = (appointment) => {
    setSelectedAppointment(appointment);
    setShowMedicalReportModal(true);
    setSelectedMedicines([]);
    setMedicalReportForm({
      diagnosis: "",
      prescribedMedicine: "",
      doctorNotes: "",
      medicines: [],
    });
  };

  const openReportViewModal = (report, appointment) => {
    setSelectedReport({ ...report, appointment });
    setShowReportViewModal(true);
  };

  const handleMedicalReportSubmit = async () => {
    try {
      const medicineString = selectedMedicines
        .map(
          (med) =>
            `${med.name} ${med.dosage} - ${med.frequency} for ${med.duration} (Qty: ${med.prescribedQuantity}) - ${med.instructions}`
        )
        .join(", ");

      const reportData = {
        diagnosis: medicalReportForm.diagnosis,
        prescribedMedicine: medicineString,
        doctorNotes: medicalReportForm.doctorNotes,
        reportDate: new Date().toISOString().split("T")[0],
        appointment: {
          id: selectedAppointment.id,
        },
      };

      await medicalReportAPI.addReport(reportData);
      await appointmentAPI.updateStatus(selectedAppointment.id, "Completed");

      setShowMedicalReportModal(false);
      setSelectedMedicines([]);
      setMedicalReportForm({
        diagnosis: "",
        prescribedMedicine: "",
        doctorNotes: "",
        medicines: [],
      });

      await fetchData();
      alert("Medical report created successfully!");
    } catch (error) {
      console.error("Error creating medical report:", error);
      alert("Error creating medical report. Please try again.");
    }
  };

  const downloadReportAsPDF = (report) => {
    // Create a simple HTML structure for PDF generation
    const reportContent = `
      <html>
        <head>
          <title>Medical Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; }
            .section { margin: 20px 0; }
            .label { font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Medical Report</h1>
            <p>Dr. ${user?.userName} - ${doctorProfile?.specialization}</p>
            <p>${doctorProfile?.clinicName}</p>
          </div>
          
          <div class="section">
            <p><span class="label">Patient:</span> ${
              report.appointment?.patient?.name
            }</p>
            <p><span class="label">Date:</span> ${new Date(
              report.reportDate
            ).toLocaleDateString()}</p>
            <p><span class="label">Appointment Reason:</span> ${
              report.appointment?.reason
            }</p>
          </div>
          
          <div class="section">
            <h3>Diagnosis</h3>
            <p>${report.diagnosis}</p>
          </div>
          
          <div class="section">
            <h3>Prescribed Medicines</h3>
            <p>${report.prescribedMedicine}</p>
          </div>
          
          <div class="section">
            <h3>Doctor's Notes</h3>
            <p>${report.doctorNotes}</p>
          </div>
          
          <div class="section">
            <p><span class="label">Doctor's Signature:</span> Dr. ${
              user?.userName
            }</p>
            <p><span class="label">Date:</span> ${new Date().toLocaleDateString()}</p>
          </div>
        </body>
      </html>
    `;

    // Create a new window and print
    const printWindow = window.open("", "_blank");
    printWindow.document.write(reportContent);
    printWindow.document.close();
    printWindow.print();
  };

  const getAppointmentReport = (appointmentId) => {
    const reportsArray = Array.isArray(reports) ? reports : [];
    return reportsArray.find(
      (report) => report.appointment?.id === appointmentId
    );
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Pending":
        return <Clock className="h-4 w-4 text-amber-500" />;
      case "Confirmed":
        return <CheckCircle className="h-4 w-4 text-emerald-500" />;
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
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "Confirmed":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "Completed":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "Rejected":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const appointmentsArray = Array.isArray(appointments) ? appointments : [];
  const patientsArray = Array.isArray(patients) ? patients : [];
  const reportsArray = Array.isArray(reports) ? reports : [];

  const filteredAppointments = appointmentsArray.filter(
    (appointment) =>
      appointment.patient?.user?.userName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      appointment.reason?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPatients = Array.from(
    new Set(
      appointmentsArray.map((apt) => apt.patient?.patientId).filter(Boolean)
    )
  )
    .map(
      (patientId) =>
        appointmentsArray.find((apt) => apt.patient?.patientId === patientId)
          ?.patient
    )
    .filter(Boolean)
    .filter(
      (patient) =>
        patient.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.medicalHistory?.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const getScheduleForDate = (date) => {
    const dateStr = date.toISOString().split("T")[0];
    return appointmentsArray.filter((apt) => apt.date === dateStr);
  };

  const navigateDate = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + direction);
    setCurrentDate(newDate);
  };

  const sidebarItems = [
    { id: "overview", label: "Dashboard", icon: Activity },
    { id: "appointments", label: "Appointments", icon: Calendar },
    { id: "patients", label: "Patients", icon: Users },
    { id: "reports", label: "Medical Reports", icon: FileText },
    { id: "medicines", label: "Medicine Inventory", icon: Pill },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Sidebar */}
      <div className="w-64 bg-indigo-600 text-white flex flex-col">
        <div className="p-6">
          <h1 className="text-xl font-bold">Doctor Portal</h1>
        </div>

        <nav className="flex-1 px-4">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg mb-2 transition-colors ${
                activeTab === item.id
                  ? "bg-white bg-opacity-20 text-white"
                  : "text-indigo-200 hover:text-white hover:bg-white hover:bg-opacity-10"
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-sm font-medium">{item.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        <div className="flex-1 p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search appointments, patients..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 w-80"
                />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Bell className="h-6 w-6 text-gray-400" />
            </div>
          </div>

          {/* Welcome Banner */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg p-6 mb-6 text-white relative overflow-hidden">
            <div className="relative z-10">
              <h2 className="text-2xl font-bold mb-2">
                Hello Dr. {user?.userName}
              </h2>
              <p className="text-indigo-100">
                Manage your practice efficiently with our comprehensive tools.
              </p>
              <p className="text-indigo-100">
                Check appointments, manage patients, and create medical reports.
              </p>
            </div>
            <div className="absolute right-6 top-1/2 transform -translate-y-1/2">
              <Stethoscope className="h-16 w-16 text-white opacity-30" />
            </div>
          </div>

          {activeTab === "overview" && (
            <>
              {/* Dynamic Earnings Overview */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <div className="bg-white rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">
                        Daily Earnings
                      </p>
                      <p className="text-2xl font-bold text-green-600">
                        ₹{earnings.daily}
                      </p>
                      <p className="text-xs text-gray-400">
                        Today's consultations
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <DollarSign className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">
                        Monthly Earnings
                      </p>
                      <p className="text-2xl font-bold text-blue-600">
                        ₹{earnings.monthly}
                      </p>
                      <p className="text-xs text-gray-400">
                        This month's total
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <TrendingUp className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">
                        Yearly Earnings
                      </p>
                      <p className="text-2xl font-bold text-purple-600">
                        ₹{earnings.yearly}
                      </p>
                      <p className="text-xs text-gray-400">This year's total</p>
                    </div>
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                      <Heart className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">
                        Total Earnings
                      </p>
                      <p className="text-2xl font-bold text-indigo-600">
                        ₹{earnings.totalEarnings}
                      </p>
                      <p className="text-xs text-gray-400">All time total</p>
                    </div>
                    <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                      <FileText className="h-6 w-6 text-indigo-600" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <button
                  onClick={() => setActiveTab("medicines")}
                  className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow text-left"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <Package className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        Medicine Inventory
                      </h3>
                      <p className="text-sm text-gray-500">
                        Manage medicine stock and prescriptions
                      </p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab("reports")}
                  className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow text-left"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                      <FileText className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        Medical Reports
                      </h3>
                      <p className="text-sm text-gray-500">
                        View and manage patient reports
                      </p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab("patients")}
                  className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow text-left"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Users className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        Patient Management
                      </h3>
                      <p className="text-sm text-gray-500">
                        View patient details and history
                      </p>
                    </div>
                  </div>
                </button>
              </div>

              {/* Schedule Navigator */}
              <div className="bg-white rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Today's Schedule
                  </h3>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => navigateDate(-1)}
                      className="p-2 hover:bg-gray-100 rounded-lg"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <span className="text-sm font-medium px-4">
                      {currentDate.toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                    <button
                      onClick={() => navigateDate(1)}
                      className="p-2 hover:bg-gray-100 rounded-lg"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="space-y-4">
                  {getScheduleForDate(currentDate).length === 0 ? (
                    <div className="text-center py-8">
                      <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">
                        No appointments for this date
                      </p>
                    </div>
                  ) : (
                    getScheduleForDate(currentDate).map((appointment) => (
                      <div
                        key={appointment.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                            <UserCircle className="h-6 w-6 text-indigo-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {appointment.patient?.user?.userName}
                            </p>
                            <p className="text-sm text-gray-500">
                              {appointment.reason}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900">
                            {appointment.time}
                          </p>
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${getStatusColor(
                              appointment.status
                            )}`}
                          >
                            {appointment.status}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}

          {activeTab === "appointments" && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Appointment Management{" "}
                    {searchTerm && `(${filteredAppointments.length} results)`}
                  </h3>
                </div>
                <div className="space-y-4">
                  {filteredAppointments.length === 0 ? (
                    <div className="text-center py-8">
                      <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">
                        {searchTerm
                          ? "No appointments found matching your search"
                          : "No appointments found"}
                      </p>
                    </div>
                  ) : (
                    filteredAppointments.map((appointment) => {
                      const existingReport = getAppointmentReport(
                        appointment.id
                      );
                      return (
                        <div
                          key={appointment.id}
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                              <UserCircle className="h-6 w-6 text-indigo-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                {appointment.patient?.name}
                              </p>
                              <p className="text-sm text-gray-500">
                                {appointment.reason}
                              </p>
                              <p className="text-xs text-gray-400">
                                {new Date(
                                  appointment.date
                                ).toLocaleDateString()}{" "}
                                at {appointment.time}
                              </p>
                              {appointment.specialNotes && (
                                <p className="text-xs text-gray-500 mt-1">
                                  <strong>Notes:</strong>{" "}
                                  {appointment.specialNotes}
                                </p>
                              )}
                              {existingReport && (
                                <p className="text-xs text-green-600 mt-1 flex items-center">
                                  <FileText className="h-3 w-3 mr-1" />
                                  Medical report created
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            {getStatusIcon(appointment.status)}
                            <span
                              className={`px-2.5 py-0.5 text-xs font-medium rounded-full border ${getStatusColor(
                                appointment.status
                              )}`}
                            >
                              {appointment.status}
                            </span>
                            {appointment.status === "Pending" && (
                              <div className="flex space-x-2">
                                <button
                                  onClick={() =>
                                    handleStatusUpdate(
                                      appointment.id,
                                      "Confirmed"
                                    )
                                  }
                                  className="px-3 py-1.5 text-xs font-medium text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() =>
                                    handleStatusUpdate(
                                      appointment.id,
                                      "Rejected"
                                    )
                                  }
                                  className="px-3 py-1.5 text-xs font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
                                >
                                  Reject
                                </button>
                              </div>
                            )}
                            {appointment.status === "Confirmed" &&
                              !existingReport && (
                                <button
                                  onClick={() =>
                                    openMedicalReportModal(appointment)
                                  }
                                  className="px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors flex items-center"
                                >
                                  <FileText className="h-3 w-3 mr-1" />
                                  Create Report
                                </button>
                              )}
                            {existingReport && (
                              <div className="flex space-x-2">
                                <button
                                  onClick={() =>
                                    openReportViewModal(
                                      existingReport,
                                      appointment
                                    )
                                  }
                                  className="px-3 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 rounded-md hover:bg-indigo-100 transition-colors flex items-center"
                                >
                                  <Maximize2 className="h-3 w-3 mr-1" />
                                  View
                                </button>
                                <button
                                  onClick={() =>
                                    downloadReportAsPDF(existingReport)
                                  }
                                  className="px-3 py-1.5 text-xs font-medium text-green-600 bg-green-50 rounded-md hover:bg-green-100 transition-colors flex items-center"
                                >
                                  <Download className="h-3 w-3 mr-1" />
                                  PDF
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "patients" && (
            <div className="bg-white rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Patient Management{" "}
                {searchTerm && `(${filteredPatients.length} results)`}
              </h3>
              {filteredPatients.length === 0 ? (
                <div className="text-center py-10">
                  <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <h3 className="text-lg font-medium text-gray-900 mb-1">
                    {searchTerm ? "No patients found" : "No patients yet"}
                  </h3>
                  <p className="text-gray-500 text-sm">
                    {searchTerm
                      ? "Try adjusting your search terms"
                      : "Patients will appear here after they book appointments with you"}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredPatients.map((patient) => (
                    <div
                      key={patient.patientId}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
                    >
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                          <UserCircle className="h-6 w-6 text-indigo-600" />
                        </div>
                        <div>
                          <h3 className="font-medium text-black-900">
                            {patient.name}
                          </h3>
                          <p className="text-xs text-gray-500">
                            {patient.age} years old, {patient.gender}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-1.5 text-xs">
                        <p className="text-gray-600">
                          <strong>Location:</strong> {patient.city},{" "}
                          {patient.state}
                        </p>
                        {patient.medicalHistory && (
                          <p className="text-gray-600">
                            <strong>Medical History:</strong>{" "}
                            {patient.medicalHistory}
                          </p>
                        )}
                        <p className="text-gray-600">
                          <strong>Appointments:</strong>{" "}
                          {
                            appointmentsArray.filter(
                              (apt) =>
                                apt.patient?.patientId === patient.patientId
                            ).length
                          }
                        </p>
                        <p className="text-gray-600">
                          <strong>Reports:</strong>{" "}
                          {
                            reportsArray.filter(
                              (report) =>
                                appointmentsArray.find(
                                  (apt) => apt.id === report.appointment?.id
                                )?.patient?.patientId === patient.patientId
                            ).length
                          }
                        </p>
                      </div>

                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <button
                          onClick={() => {
                            setSelectedPatient(patient);
                            setShowPatientModal(true);
                          }}
                          className="w-full px-3 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 rounded-md hover:bg-indigo-100 transition-colors flex items-center justify-center"
                        >
                          <Eye className="h-3.5 w-3.5 mr-1.5" />
                          View Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "reports" && (
            <div className="bg-white rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Medical Reports Management
                </h3>
              </div>

              {reportsArray.length === 0 ? (
                <div className="text-center py-10">
                  <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <h3 className="text-lg font-medium text-gray-900 mb-1">
                    No medical reports yet
                  </h3>
                  <p className="text-gray-500 text-sm">
                    Reports will appear here after you complete appointments
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {reportsArray.map((report) => {
                    const associatedAppointment = appointmentsArray.find(
                      (apt) => apt.id === report.appointment?.id
                    );
                    return (
                      <div
                        key={report.id}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                              <FileText className="h-4 w-4 text-green-600" />
                            </div>
                            <div>
                              <h3 className="font-medium text-gray-900 text-sm">
                                {associatedAppointment?.patient?.user?.userName}
                              </h3>
                              <p className="text-xs text-gray-500">
                                {new Date(
                                  report.reportDate
                                ).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex space-x-1">
                            <button
                              onClick={() =>
                                openReportViewModal(
                                  report,
                                  associatedAppointment
                                )
                              }
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <Maximize2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => downloadReportAsPDF(report)}
                              className="text-green-600 hover:text-green-800"
                            >
                              <Download className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div>
                            <h4 className="font-medium text-gray-900 text-xs mb-1">
                              Diagnosis
                            </h4>
                            <p className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                              {report.diagnosis?.substring(0, 100)}
                              {report.diagnosis?.length > 100 ? "..." : ""}
                            </p>
                          </div>

                          <div className="pt-2 border-t border-gray-100">
                            <p className="text-xs text-gray-500">
                              <strong>Appointment:</strong>{" "}
                              {associatedAppointment?.reason}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === "medicines" && (
            <div className="bg-white rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Medicine Inventory Management
                </h3>
                <button
                  onClick={() => setShowMedicineModal(true)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
                >
                  <Plus className="h-4 w-4 mr-2 inline" />
                  Search Medicines
                </button>
              </div>

              {/* Medicine Inventory Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {medicineDatabase.slice(0, 6).map((medicine) => (
                  <div
                    key={medicine.id}
                    className={`border rounded-lg p-4 ${
                      medicine.stockQuantity <= medicine.minStockLevel
                        ? "border-red-200 bg-red-50"
                        : "border-gray-200 bg-white"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            medicine.stockQuantity <= medicine.minStockLevel
                              ? "bg-red-100"
                              : "bg-blue-100"
                          }`}
                        >
                          <Pill
                            className={`h-4 w-4 ${
                              medicine.stockQuantity <= medicine.minStockLevel
                                ? "text-red-600"
                                : "text-blue-600"
                            }`}
                          />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900 text-sm">
                            {medicine.name}
                          </h3>
                          <p className="text-xs text-gray-500">
                            {medicine.dosage} - {medicine.type}
                          </p>
                        </div>
                      </div>
                      {medicine.stockQuantity <= medicine.minStockLevel && (
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                      )}
                    </div>

                    <div className="space-y-1 text-xs">
                      <p className="text-gray-600">
                        <strong>Category:</strong> {medicine.category}
                      </p>
                      <p className="text-gray-600">
                        <strong>Stock:</strong> {medicine.stockQuantity} units
                      </p>
                      <p className="text-gray-600">
                        <strong>Price:</strong> ₹{medicine.price}
                      </p>
                      <p className="text-gray-600">
                        <strong>Manufacturer:</strong> {medicine.manufacturer}
                      </p>
                    </div>

                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <div className="flex justify-between items-center">
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            medicine.stockQuantity <= medicine.minStockLevel
                              ? "bg-red-100 text-red-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {medicine.stockQuantity <= medicine.minStockLevel
                            ? "Low Stock"
                            : "In Stock"}
                        </span>
                        <button
                          onClick={() => addMedicineToReport(medicine)}
                          className="text-xs text-indigo-600 hover:text-indigo-800"
                        >
                          Add to Prescription
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Selected Medicines for Prescription */}
              {selectedMedicines.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 mb-3">
                    Selected for Prescription
                  </h4>
                  <div className="space-y-2">
                    {selectedMedicines.map((medicine) => (
                      <div
                        key={medicine.id}
                        className="flex items-center justify-between p-3 bg-blue-50 rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <Pill className="h-5 w-5 text-blue-600" />
                          <div>
                            <p className="font-medium text-gray-900">
                              {medicine.name}
                            </p>
                            <p className="text-sm text-gray-500">
                              {medicine.dosage} - {medicine.frequency} for{" "}
                              {medicine.duration}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center space-x-2">
                            <label className="text-sm text-gray-600">
                              Qty:
                            </label>
                            <input
                              type="number"
                              min="1"
                              value={medicine.prescribedQuantity || 1}
                              onChange={(e) =>
                                updateMedicineQuantity(
                                  medicine.id,
                                  Number.parseInt(e.target.value)
                                )
                              }
                              className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                            />
                          </div>
                          <button
                            onClick={() =>
                              removeMedicineFromReport(medicine.id)
                            }
                            className="text-red-600 hover:text-red-800"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="w-80 p-6 space-y-6">
          {/* Doctor Profile Card */}
          <div className="bg-white rounded-lg p-6 text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-pink-400 to-red-400 rounded-full mx-auto mb-4 flex items-center justify-center">
              {user?.imageUrl ? (
                <img
                  src={user.imageUrl || "/placeholder.svg"}
                  alt="Doctor Profile"
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <UserCircle className="h-12 w-12 text-white" />
              )}
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">
              Dr. {user?.userName}
            </h3>
            <p className="text-sm text-gray-500 mb-2">
              {doctorProfile?.specialization || "General Practitioner"}
            </p>
            <p className="text-xs text-gray-400 mb-4 flex items-center justify-center">
              <Building className="h-3 w-3 mr-1" />
              {doctorProfile?.clinicName || "Medical Center"}
            </p>

            {doctorProfile && (
              <div className="text-xs text-gray-500 space-y-1 mb-4">
                <p className="flex items-center justify-center">
                  <Award className="h-3 w-3 mr-1" />
                  {doctorProfile.experience} years experience
                </p>
                <p className="flex items-center justify-center">
                  <MapPin className="h-3 w-3 mr-1" />
                  {doctorProfile.city}, {doctorProfile.state}
                </p>
                <p className="flex items-center justify-center">
                  <DollarSign className="h-3 w-3 mr-1" />₹
                  {doctorProfile.checkUpFee} per consultation
                </p>
              </div>
            )}

            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-500">
                  {stats.totalPatients} People
                </span>
                <span className="text-sm text-gray-500">
                  {stats.totalPatients}/300
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-indigo-600 h-2 rounded-full"
                  style={{
                    width: `${Math.min(
                      (stats.totalPatients / 300) * 100,
                      100
                    )}%`,
                  }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">Appointments Limit</p>
            </div>
          </div>

          {/* Statistics Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-indigo-600">
                {stats.completed}
              </p>
              <p className="text-sm text-gray-500">Completed</p>
            </div>
            <div className="bg-white rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-indigo-600">
                {stats.totalPatients}
              </p>
              <p className="text-sm text-gray-500">Total Patients</p>
            </div>
            <div className="bg-white rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-indigo-600">
                {reportsArray.length}
              </p>
              <p className="text-sm text-gray-500">Medical Reports</p>
            </div>
            <div className="bg-white rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-indigo-600">
                {stats.total}
              </p>
              <p className="text-sm text-gray-500">Total Appointments</p>
            </div>
          </div>

          {/* Today's Stats */}
          <div className="bg-white rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3">Today's Activity</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">
                  Today's Appointments
                </span>
                <span className="font-medium text-indigo-600">
                  {stats.today}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Pending Requests</span>
                <span className="font-medium text-amber-600">
                  {stats.pending}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Confirmed</span>
                <span className="font-medium text-green-600">
                  {stats.confirmed}
                </span>
              </div>
            </div>
          </div>

          {/* Dynamic Earnings Summary */}
          <div className="bg-white rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3">Earnings Summary</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Today</span>
                <span className="font-medium text-green-600">
                  ₹{earnings.daily}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">This Month</span>
                <span className="font-medium text-blue-600">
                  ₹{earnings.monthly}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">This Year</span>
                <span className="font-medium text-purple-600">
                  ₹{earnings.yearly}
                </span>
              </div>
              <div className="flex justify-between items-center border-t pt-2">
                <span className="text-sm font-medium text-gray-900">
                  Total Earnings
                </span>
                <span className="font-bold text-indigo-600">
                  ₹{earnings.totalEarnings}
                </span>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-100">
              <p className="text-xs text-gray-500">
                Rate: ₹{doctorProfile?.checkUpFee || 50} per consultation
              </p>
            </div>
          </div>

          {/* Medicine Stock Alerts */}
          <div className="bg-white rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3">Stock Alerts</h4>
            <div className="space-y-2">
              {medicineDatabase
                .filter((med) => med.stockQuantity <= med.minStockLevel)
                .slice(0, 3)
                .map((medicine) => (
                  <div
                    key={medicine.id}
                    className="flex items-center space-x-2 p-2 bg-red-50 rounded"
                  >
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                    <div>
                      <p className="text-sm font-medium text-red-800">
                        {medicine.name}
                      </p>
                      <p className="text-xs text-red-600">
                        Only {medicine.stockQuantity} left
                      </p>
                    </div>
                  </div>
                ))}
              {medicineDatabase.filter(
                (med) => med.stockQuantity <= med.minStockLevel
              ).length === 0 && (
                <p className="text-sm text-gray-500">
                  All medicines are well stocked
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Medical Report View Modal */}
      {showReportViewModal && selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-semibold text-gray-900">
                Medical Report
              </h3>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => downloadReportAsPDF(selectedReport)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </button>
                <button
                  onClick={() => setShowReportViewModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Report Header */}
            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">
                    Patient Information
                  </h4>
                  <div className="space-y-2 text-sm">
                    <p>
                      <strong>Name:</strong>{" "}
                      {selectedReport.appointment?.patient?.name}
                    </p>
                    <p>
                      <strong>Age:</strong>{" "}
                      {selectedReport.appointment?.patient?.age} years
                    </p>
                    <p>
                      <strong>Gender:</strong>{" "}
                      {selectedReport.appointment?.patient?.gender}
                    </p>
                    <p>
                      <strong>Location:</strong>{" "}
                      {selectedReport.appointment?.patient?.city},{" "}
                      {selectedReport.appointment?.patient?.state}
                    </p>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">
                    Appointment Details
                  </h4>
                  <div className="space-y-2 text-sm">
                    <p>
                      <strong>Date:</strong>{" "}
                      {new Date(selectedReport.reportDate).toLocaleDateString()}
                    </p>
                    <p>
                      <strong>Reason:</strong>{" "}
                      {selectedReport.appointment?.reason}
                    </p>
                    <p>
                      <strong>Doctor:</strong> Dr. {user?.userName}
                    </p>
                    <p>
                      <strong>Clinic:</strong> {doctorProfile?.clinicName}
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
                  <Pill className="h-5 w-5 mr-2 text-blue-500" />
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
                  <FileText className="h-5 w-5 mr-2 text-green-500" />
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
                    {new Date(selectedReport.reportDate).toLocaleDateString()}
                  </p>
                  <p>
                    Consultation Fee: ₹{doctorProfile?.checkUpFee || 50} |
                    Status:{" "}
                    <span className="text-green-600 font-medium">
                      Completed
                    </span>
                  </p>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => downloadReportAsPDF(selectedReport)}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Print Report
                  </button>
                  <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                    Share Report
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Medical Report Modal */}
      {showMedicalReportModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900">
                Create Medical Report
              </h3>
              <button
                onClick={() => setShowMedicalReportModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">
                Patient Information
              </h4>
              <p className="text-sm text-gray-600">
                <strong>Name:</strong> {selectedAppointment.patient?.name}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Appointment:</strong> {selectedAppointment.reason}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Date:</strong>{" "}
                {new Date(selectedAppointment.date).toLocaleDateString()} at{" "}
                {selectedAppointment.time}
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Diagnosis
                </label>
                <textarea
                  value={medicalReportForm.diagnosis}
                  onChange={(e) =>
                    setMedicalReportForm({
                      ...medicalReportForm,
                      diagnosis: e.target.value,
                    })
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  rows="3"
                  placeholder="Enter patient diagnosis..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Doctor Notes
                </label>
                <textarea
                  value={medicalReportForm.doctorNotes}
                  onChange={(e) =>
                    setMedicalReportForm({
                      ...medicalReportForm,
                      doctorNotes: e.target.value,
                    })
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  rows="3"
                  placeholder="Enter additional notes and recommendations..."
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Prescribed Medicines
                  </label>
                  <button
                    onClick={() => setShowMedicineModal(true)}
                    className="px-3 py-1 text-xs bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                  >
                    <Plus className="h-3 w-3 mr-1 inline" />
                    Add Medicine
                  </button>
                </div>

                {selectedMedicines.length === 0 ? (
                  <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center">
                    <Pill className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">
                      No medicines added yet
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {selectedMedicines.map((medicine) => (
                      <div
                        key={medicine.id}
                        className="flex items-center justify-between p-3 bg-blue-50 rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <Pill className="h-4 w-4 text-blue-600" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {medicine.name} {medicine.dosage}
                            </p>
                            <p className="text-xs text-gray-500">
                              {medicine.frequency} for {medicine.duration} (Qty:{" "}
                              {medicine.prescribedQuantity})
                            </p>
                            <p className="text-xs text-gray-400">
                              {medicine.instructions}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => removeMedicineFromReport(medicine.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
              <button
                onClick={() => setShowMedicalReportModal(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleMedicalReportSubmit}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center"
              >
                <Save className="h-4 w-4 mr-2" />
                Create Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Patient Details Modal */}
      {showPatientModal && selectedPatient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900">
                Patient Details & Medical Reports
              </h3>
              <button
                onClick={() => setShowPatientModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Patient Information */}
              <div className="space-y-4">
                <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                  <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center">
                    <UserCircle className="h-10 w-10 text-indigo-600" />
                  </div>
                  <div>
                    <h4 className="text-lg font-medium text-gray-900">
                      {selectedPatient.name}
                    </h4>
                    <p className="text-gray-600">
                      {selectedPatient.age} years old, {selectedPatient.gender}
                    </p>
                    <p className="text-sm text-gray-500">
                      {selectedPatient.city}, {selectedPatient.state}
                    </p>
                  </div>
                </div>

                <div className="p-4 border border-gray-200 rounded-lg">
                  <h5 className="font-medium text-gray-900 mb-2">
                    Contact Information
                  </h5>
                  <p className="text-sm text-gray-600">
                    Name: {selectedPatient.name}
                  </p>
                  <p className="text-sm text-gray-600">
                    Phone: {selectedPatient.mobilNo || "Not provided"}
                  </p>
                </div>

                <div className="p-4 border border-gray-200 rounded-lg">
                  <h5 className="font-medium text-gray-900 mb-2">
                    Medical Information
                  </h5>
                  <p className="text-sm text-gray-600">
                    Medical History:{" "}
                    {selectedPatient.medicalHistory || "None recorded"}
                  </p>
                </div>
              </div>

              {/* Medical Reports */}
              <div className="space-y-4">
                <h5 className="font-medium text-gray-900">Medical Reports</h5>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {reportsArray
                    .filter(
                      (report) =>
                        appointmentsArray.find(
                          (apt) => apt.id === report.appointment?.id
                        )?.patient?.patientId === selectedPatient.patientId
                    )
                    .map((report) => {
                      const appointment = appointmentsArray.find(
                        (apt) => apt.id === report.appointment?.id
                      );
                      return (
                        <div
                          key={report.id}
                          className="p-4 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <h6 className="font-medium text-gray-900">
                              {appointment?.reason || "General Consultation"}
                            </h6>
                            <div className="flex items-center space-x-2">
                              <span className="text-xs text-gray-500">
                                {new Date(
                                  report.reportDate
                                ).toLocaleDateString()}
                              </span>
                              <button
                                onClick={() =>
                                  openReportViewModal(report, appointment)
                                }
                                className="text-indigo-600 hover:text-indigo-800"
                              >
                                <Maximize2 className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => downloadReportAsPDF(report)}
                                className="text-green-600 hover:text-green-800"
                              >
                                <Download className="h-4 w-4" />
                              </button>
                            </div>
                          </div>

                          <div className="space-y-2 text-sm">
                            <div>
                              <strong className="text-gray-700">
                                Diagnosis:
                              </strong>
                              <p className="text-gray-600">
                                {report.diagnosis}
                              </p>
                            </div>

                            {report.prescribedMedicine && (
                              <div>
                                <strong className="text-gray-700">
                                  Prescribed Medicines:
                                </strong>
                                <p className="text-gray-600">
                                  {report.prescribedMedicine}
                                </p>
                              </div>
                            )}

                            {report.doctorNotes && (
                              <div>
                                <strong className="text-gray-700">
                                  Doctor Notes:
                                </strong>
                                <p className="text-gray-600">
                                  {report.doctorNotes}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}

                  {reportsArray.filter(
                    (report) =>
                      appointmentsArray.find(
                        (apt) => apt.id === report.appointment?.id
                      )?.patient?.patientId === selectedPatient.patientId
                  ).length === 0 && (
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">No medical reports found</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Medicine Search Modal */}
      {showMedicineModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Search Medicines
              </h3>
              <button
                onClick={() => {
                  setShowMedicineModal(false);
                  setMedicineSearch("");
                  setMedicines([]);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="mb-4">
              <div className="relative">
                <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search medicines by name, category, or generic name..."
                  value={medicineSearch}
                  onChange={(e) => {
                    setMedicineSearch(e.target.value);
                    searchMedicines(e.target.value);
                  }}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full"
                />
              </div>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {medicines.length === 0 ? (
                <div className="text-center py-8">
                  <Pill className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">
                    {medicineSearch
                      ? "No medicines found matching your search"
                      : "Start typing to search medicines"}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {medicines.map((medicine) => (
                    <div
                      key={medicine.id}
                      className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              medicine.stockQuantity <= medicine.minStockLevel
                                ? "bg-red-100"
                                : "bg-blue-100"
                            }`}
                          >
                            <Pill
                              className={`h-5 w-5 ${
                                medicine.stockQuantity <= medicine.minStockLevel
                                  ? "text-red-600"
                                  : "text-blue-600"
                              }`}
                            />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h4 className="font-medium text-gray-900">
                                {medicine.name}
                              </h4>
                              {medicine.stockQuantity <=
                                medicine.minStockLevel && (
                                <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                                  Low Stock
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mb-2">
                              <strong>Generic:</strong> {medicine.genericName} |{" "}
                              <strong>Dosage:</strong> {medicine.dosage}
                            </p>
                            <div className="grid grid-cols-2 gap-4 text-xs text-gray-500">
                              <div>
                                <p>
                                  <strong>Category:</strong> {medicine.category}
                                </p>
                                <p>
                                  <strong>Type:</strong> {medicine.type}
                                </p>
                                <p>
                                  <strong>Manufacturer:</strong>{" "}
                                  {medicine.manufacturer}
                                </p>
                              </div>
                              <div>
                                <p>
                                  <strong>Stock:</strong>{" "}
                                  {medicine.stockQuantity} units
                                </p>
                                <p>
                                  <strong>Price:</strong> ₹{medicine.price}
                                </p>
                                <p>
                                  <strong>Frequency:</strong>{" "}
                                  {medicine.frequency}
                                </p>
                              </div>
                            </div>
                            <div className="mt-2 text-xs">
                              <p>
                                <strong>Instructions:</strong>{" "}
                                {medicine.instructions}
                              </p>
                              <p>
                                <strong>Side Effects:</strong>{" "}
                                {medicine.sideEffects}
                              </p>
                              <p>
                                <strong>Contraindications:</strong>{" "}
                                {medicine.contraindications}
                              </p>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            addMedicineToReport(medicine);
                            setShowMedicineModal(false);
                            setMedicineSearch("");
                            setMedicines([]);
                          }}
                          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors"
                        >
                          Add to Prescription
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorDashboard;
