package Milan.Ai_sypmtom.service;

import Milan.Ai_sypmtom.dto.AppointmentRequestDTO;
import Milan.Ai_sypmtom.entity.Appointment;
import Milan.Ai_sypmtom.entity.AppointmentStatus;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public interface AppointmentService {
    Appointment AddAppointment(AppointmentRequestDTO appointmentDTO);
    List<Appointment> GetAllAppointment();
    Appointment GetAppointmentById(Long id);
    List<Appointment> GetAppointmentsByPatientEmail(String email);
    List<Appointment> GetAppointmentsByDoctorEmail(String email);
    boolean CheckAvailability(Long doctorId, LocalDate date, LocalTime time);
    Appointment UpdateAppointment(Appointment updated, Long id);
    Appointment UpdateAppointmentStatus(Long id, AppointmentStatus status);
    Boolean DeleteAppointment(Long id);
    Long getPatientIdByEmail(String email);
}