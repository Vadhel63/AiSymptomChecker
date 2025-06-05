package Milan.Ai_sypmtom.controller;

import Milan.Ai_sypmtom.dto.AppointmentRequestDTO;
import Milan.Ai_sypmtom.entity.Appointment;
import Milan.Ai_sypmtom.entity.AppointmentStatus;
import Milan.Ai_sypmtom.service.AppointmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/Api")
@CrossOrigin(origins = "http://localhost:5173")
public class AppointmentController {

    @Autowired
    private AppointmentService appointmentService;

    @PostMapping("/Appointment")
    public ResponseEntity<?> AddAppointment(@RequestBody AppointmentRequestDTO appointmentDTO, Authentication authentication) {
        try {
            System.out.println("Received appointment request: " + appointmentDTO);

            // If patientId is not provided, get it from the authenticated user
            if (appointmentDTO.getPatientId() == null) {
                String email = authentication.getName();
                appointmentDTO.setPatientId(appointmentService.getPatientIdByEmail(email));
            }

            Appointment appointment = appointmentService.AddAppointment(appointmentDTO);
            return new ResponseEntity<>(appointment, HttpStatus.CREATED);
        } catch (RuntimeException e) {
            System.err.println("Error creating appointment: " + e.getMessage());
            return new ResponseEntity<>(Map.of("error", e.getMessage()), HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            System.err.println("Unexpected error: " + e.getMessage());
            e.printStackTrace();
            return new ResponseEntity<>(Map.of("error", "Internal server error"), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/Appointments")
    public ResponseEntity<List<Appointment>> GetAllAppointments() {
        return new ResponseEntity<>(appointmentService.GetAllAppointment(), HttpStatus.OK);
    }

    @GetMapping("/Appointments/me")
    public ResponseEntity<List<Appointment>> GetMyAppointments(Authentication authentication) {
        String email = authentication.getName();
        List<Appointment> appointments = appointmentService.GetAppointmentsByPatientEmail(email);
        return new ResponseEntity<>(appointments, HttpStatus.OK);
    }

    @GetMapping("/Appointments/doctor")
    public ResponseEntity<List<Appointment>> GetDoctorAppointments(Authentication authentication) {
        String email = authentication.getName();
        List<Appointment> appointments = appointmentService.GetAppointmentsByDoctorEmail(email);
        return new ResponseEntity<>(appointments, HttpStatus.OK);
    }

    @GetMapping("/Appointment/{id}")
    public ResponseEntity<Appointment> GetAppointmentById(@PathVariable Long id) {
        Appointment appt = appointmentService.GetAppointmentById(id);
        return appt != null ? new ResponseEntity<>(appt, HttpStatus.OK) : new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    @GetMapping("/Appointment/check-availability")
    public ResponseEntity<Map<String, Boolean>> CheckAvailability(
            @RequestParam Long doctorId,
            @RequestParam String date,
            @RequestParam String time) {

        try {
            LocalDate appointmentDate = LocalDate.parse(date);
            LocalTime appointmentTime = LocalTime.parse(time);

            boolean isAvailable = appointmentService.CheckAvailability(doctorId, appointmentDate, appointmentTime);

            return ResponseEntity.ok(Map.of("available", isAvailable));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("available", false));
        }
    }

    @PutMapping("/Appointment/{id}")
    public ResponseEntity<Appointment> UpdateAppointment(@RequestBody Appointment updated, @PathVariable Long id) {
        try {
            Appointment appt = appointmentService.UpdateAppointment(updated, id);
            return new ResponseEntity<>(appt, HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @PutMapping("/Appointment/{id}/status")
    public ResponseEntity<?> UpdateAppointmentStatus(@PathVariable Long id, @RequestBody Map<String, String> statusUpdate) {
        try {
            String statusStr = statusUpdate.get("status");
            AppointmentStatus status;

            switch (statusStr) {
                case "Confirmed":
                    status = AppointmentStatus.Confirmed;
                    break;
                case "Rejected":
                    status = AppointmentStatus.Rejected;
                    break;
                case "Completed":
                    status = AppointmentStatus.Completed;
                    break;
                default:
                    return new ResponseEntity<>("Invalid status", HttpStatus.BAD_REQUEST);
            }

            Appointment appointment = appointmentService.UpdateAppointmentStatus(id, status);
            return new ResponseEntity<>(appointment, HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>("Appointment not found", HttpStatus.NOT_FOUND);
        }
    }

    @DeleteMapping("/Appointment/{id}")
    public ResponseEntity<Void> DeleteAppointment(@PathVariable Long id) {
        if (appointmentService.DeleteAppointment(id)) {
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }
}