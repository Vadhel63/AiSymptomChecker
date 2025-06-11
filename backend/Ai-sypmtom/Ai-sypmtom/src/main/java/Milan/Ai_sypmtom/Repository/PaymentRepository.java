package Milan.Ai_sypmtom.Repository;

import Milan.Ai_sypmtom.entity.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    Optional<Payment> findByRazorpayOrderId(String orderId);
    Optional<Payment> findByRazorpayPaymentId(String paymentId);
    List<Payment> findByPatientAndStatus(Patient patient, PaymentStatus status);
    List<Payment> findByDoctorAndStatus(Doctor doctor, PaymentStatus status);
    Optional<Payment> findByPatientAndDoctorAndStatusAndCreatedAtAfter(
            Patient patient, Doctor doctor, PaymentStatus status, LocalDateTime after);

    Optional<Payment> findByAppointment(Appointment appointment);
}
