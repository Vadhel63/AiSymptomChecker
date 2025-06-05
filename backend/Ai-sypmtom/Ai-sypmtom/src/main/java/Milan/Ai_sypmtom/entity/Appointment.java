package Milan.Ai_sypmtom.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@NoArgsConstructor
@Data
public class Appointment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDate date;
    private LocalTime time;

    private String reason; // Short reason for visit
    private String specialNotes;

    private String insuranceProvider;
    private String insuranceNumber;

    @ManyToOne
    @JoinColumn(name = "doctor_id")
    private Doctor doctor;

    @ManyToOne
    @JoinColumn(name = "patient_id")
    private Patient patient;

    @OneToOne(mappedBy = "appointment", cascade = CascadeType.ALL)
    @JsonBackReference

    private MedicalReport medicalReport;

    @Enumerated(EnumType.STRING)
    private AppointmentStatus status=AppointmentStatus.Pending; // PENDING, CONFIRMED, CANCELLED, COMPLETED



    @UpdateTimestamp
    private LocalDateTime updatedAt;


}
