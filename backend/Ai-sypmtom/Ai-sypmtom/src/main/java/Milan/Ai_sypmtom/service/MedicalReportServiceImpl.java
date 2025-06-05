package Milan.Ai_sypmtom.service;

import Milan.Ai_sypmtom.Repository.PatientRepository;
import Milan.Ai_sypmtom.Repository.UserInfoRepository;
import Milan.Ai_sypmtom.entity.MedicalReport;
import Milan.Ai_sypmtom.entity.Patient;
import Milan.Ai_sypmtom.entity.UserInfo;
import Milan.Ai_sypmtom.exception.ResourceNotFoundException;
import Milan.Ai_sypmtom.Repository.MedicalReportRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MedicalReportServiceImpl implements MedicalReportService {

    @Autowired
    private MedicalReportRepository medicalReportRepository;

    @Autowired
    private  UserInfoRepository userInfoRepository;

    @Autowired
    private PatientRepository patientRepository;
    @Override
    public List<MedicalReport> GetMedicalReportsByUserEmail(String email) {
        // Get user by email
        UserInfo user = userInfoRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Get patient profile
        Patient patient = patientRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Patient profile not found"));

        // Get all medical reports for this patient
        return medicalReportRepository.findByAppointment_Patient(patient);
    }

    @Override
    public MedicalReport GetMedicalReportByAppointmentId(Long appointmentId) {
        return medicalReportRepository.findByAppointment_Id(appointmentId);
    }

    @Override
    public List<MedicalReport> GetMedicalReportsByPatientId(Long patientId) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new RuntimeException("Patient not found"));
        return medicalReportRepository.findByAppointment_Patient(patient);
    }
    @Override
    public MedicalReport AddMedicalReport(MedicalReport medicalReport) {
        return medicalReportRepository.save(medicalReport);
    }

    @Override
    public MedicalReport GetMedicalReportById(Long id) {
        return medicalReportRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Medical Report not found with ID: " + id));
    }

    @Override
    public MedicalReport UpdateMedicalReport(MedicalReport updatedMedical, Long id) {
        MedicalReport existingReport = medicalReportRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Medical Report not found with ID: " + id));

        if (updatedMedical.getDiagnosis() != null)
            existingReport.setDiagnosis(updatedMedical.getDiagnosis());

        if (updatedMedical.getPrescribedMedicine() != null)
            existingReport.setPrescribedMedicine(updatedMedical.getPrescribedMedicine());

        if (updatedMedical.getDoctorNotes() != null)
            existingReport.setDoctorNotes(updatedMedical.getDoctorNotes());

        if (updatedMedical.getReportDate() != null)
            existingReport.setReportDate(updatedMedical.getReportDate());

        if (updatedMedical.getAppointment() != null)
            existingReport.setAppointment(updatedMedical.getAppointment());

        return medicalReportRepository.save(existingReport);
    }

    @Override
    public Boolean DeleteMedicalReport(Long id) {
        MedicalReport report = medicalReportRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Medical Report not found with ID: " + id));

        medicalReportRepository.delete(report);
        return true;
    }

    @Override
    public List<MedicalReport> GetAllMedicalReport() {
        return medicalReportRepository.findAll();
    }
}
