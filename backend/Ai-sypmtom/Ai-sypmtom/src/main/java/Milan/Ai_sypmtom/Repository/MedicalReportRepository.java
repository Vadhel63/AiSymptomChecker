package Milan.Ai_sypmtom.Repository;


import Milan.Ai_sypmtom.entity.MedicalReport;
import Milan.Ai_sypmtom.entity.Patient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MedicalReportRepository extends JpaRepository<MedicalReport,Long> {
    MedicalReport findByAppointment_Id(Long appointmentId);
    List<MedicalReport> findByAppointment_Patient(Patient patient);
}
