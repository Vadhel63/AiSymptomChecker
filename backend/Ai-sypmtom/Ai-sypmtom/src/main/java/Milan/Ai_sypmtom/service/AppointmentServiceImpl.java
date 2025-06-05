package Milan.Ai_sypmtom.service;

import Milan.Ai_sypmtom.dto.AppointmentRequestDTO;
import Milan.Ai_sypmtom.entity.Appointment;
import Milan.Ai_sypmtom.entity.AppointmentStatus;
import Milan.Ai_sypmtom.entity.Doctor;
import Milan.Ai_sypmtom.entity.Patient;
import Milan.Ai_sypmtom.entity.UserInfo;
import Milan.Ai_sypmtom.Repository.AppointmentRepository;
import Milan.Ai_sypmtom.Repository.DoctorRepository;
import Milan.Ai_sypmtom.Repository.PatientRepository;
import Milan.Ai_sypmtom.Repository.UserInfoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

@Service
public class AppointmentServiceImpl implements AppointmentService {

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private UserInfoRepository userInfoRepository;

    public Appointment AddAppointment(AppointmentRequestDTO appointmentDTO) {
        System.out.println("Processing appointment DTO: " + appointmentDTO);

        // Find the doctor by ID
        Optional<Doctor> doctorOpt = doctorRepository.findById(appointmentDTO.getDoctorId());
        if (!doctorOpt.isPresent()) {
            throw new RuntimeException("Doctor not found with ID: " + appointmentDTO.getDoctorId());
        }

        // Find the patient by ID
        Optional<Patient> patientOpt = patientRepository.findById(appointmentDTO.getPatientId());
        if (!patientOpt.isPresent()) {
            throw new RuntimeException("Patient not found with ID: " + appointmentDTO.getPatientId());
        }

        // Create the appointment entity
        Appointment appointment = new Appointment();
        appointment.setDate(appointmentDTO.getDate());
        appointment.setTime(appointmentDTO.getTime());
        appointment.setReason(appointmentDTO.getReason());
        appointment.setSpecialNotes(appointmentDTO.getSpecialNotes());
        appointment.setInsuranceProvider(appointmentDTO.getInsuranceProvider());
        appointment.setInsuranceNumber(appointmentDTO.getInsuranceNumber());

        // Set the entity relationships
        appointment.setDoctor(doctorOpt.get());
        appointment.setPatient(patientOpt.get());

        // Set status
        appointment.setStatus(AppointmentStatus.Pending);

        System.out.println("Saving appointment with Doctor ID: " + appointment.getDoctor().getDoctorId() +
                " and Patient ID: " + appointment.getPatient().getPatientId());

        return appointmentRepository.save(appointment);
    }

    public Long getPatientIdByEmail(String email) {
        UserInfo user = userInfoRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));

        Patient patient = patientRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Patient profile not found for user: " + email));

        return patient.getPatientId();
    }

    public List<Appointment> GetAllAppointment() {
        return appointmentRepository.findAll();
    }

    public Appointment GetAppointmentById(Long id) {
        Optional<Appointment> appointment = appointmentRepository.findById(id);
        return appointment.orElse(null);
    }

    public List<Appointment> GetAppointmentsByPatientEmail(String email) {
        return appointmentRepository.findByPatientUserEmail(email);
    }

    public List<Appointment> GetAppointmentsByDoctorEmail(String email) {
        return appointmentRepository.findByDoctorUserEmail(email);
    }

    public boolean CheckAvailability(Long doctorId, LocalDate date, LocalTime time) {
        List<Appointment> existingAppointments = appointmentRepository
                .findByDoctorDoctorIdAndDateAndTime(doctorId, date, time);

        // Check if there are any confirmed or pending appointments at this time
        return existingAppointments.stream()
                .noneMatch(apt -> apt.getStatus() == AppointmentStatus.Confirmed ||
                        apt.getStatus() == AppointmentStatus.Pending);
    }

    public Appointment UpdateAppointment(Appointment updated, Long id) {
        Optional<Appointment> existingAppointment = appointmentRepository.findById(id);
        if (existingAppointment.isPresent()) {
            Appointment appointment = existingAppointment.get();
            appointment.setDate(updated.getDate());
            appointment.setTime(updated.getTime());
            appointment.setReason(updated.getReason());
            appointment.setSpecialNotes(updated.getSpecialNotes());
            appointment.setInsuranceProvider(updated.getInsuranceProvider());
            appointment.setInsuranceNumber(updated.getInsuranceNumber());
            appointment.setStatus(updated.getStatus());
            return appointmentRepository.save(appointment);
        } else {
            throw new RuntimeException("Appointment not found with id: " + id);
        }
    }

    public Appointment UpdateAppointmentStatus(Long id, AppointmentStatus status) {
        Optional<Appointment> existingAppointment = appointmentRepository.findById(id);
        if (existingAppointment.isPresent()) {
            Appointment appointment = existingAppointment.get();
            appointment.setStatus(status);
            return appointmentRepository.save(appointment);
        } else {
            throw new RuntimeException("Appointment not found with id: " + id);
        }
    }

    public Boolean DeleteAppointment(Long id) {
        if (appointmentRepository.existsById(id)) {
            appointmentRepository.deleteById(id);
            return true;
        }
        return false;
    }
}