package Milan.Ai_sypmtom.Repository;

import Milan.Ai_sypmtom.entity.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    List<Appointment> findByPatientUserEmail(String email);

    List<Appointment> findByDoctorUserEmail(String email);


    List<Appointment> findByDoctorDoctorIdAndDateAndTime(Long doctorId, LocalDate date, LocalTime time);
}
