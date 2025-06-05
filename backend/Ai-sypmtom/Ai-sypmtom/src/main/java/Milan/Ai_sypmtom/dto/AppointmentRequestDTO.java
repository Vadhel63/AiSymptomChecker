package Milan.Ai_sypmtom.dto;

import lombok.Data;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class AppointmentRequestDTO {
    private LocalDate date;
    private LocalTime time;
    private String reason;
    private String specialNotes;
    private String insuranceProvider;
    private String insuranceNumber;
    private Long doctorId;  // This is what frontend sends
    private Long patientId; // This is what frontend sends
    private String status = "Pending";
}