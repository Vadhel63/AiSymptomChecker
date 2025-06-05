package Milan.Ai_sypmtom.service;

import Milan.Ai_sypmtom.entity.MedicalReport;

import java.util.List;

public interface MedicalReportService {
    MedicalReport AddMedicalReport(MedicalReport medicalReport);
    MedicalReport GetMedicalReportById(Long Id);
    MedicalReport UpdateMedicalReport(MedicalReport UpdatedMedical ,Long Id);
    Boolean DeleteMedicalReport(Long Id);
    List<MedicalReport> GetAllMedicalReport();

    List<MedicalReport> GetMedicalReportsByUserEmail(String email);

    MedicalReport GetMedicalReportByAppointmentId(Long appointmentId);
    List<MedicalReport> GetMedicalReportsByPatientId(Long patientId);
}
