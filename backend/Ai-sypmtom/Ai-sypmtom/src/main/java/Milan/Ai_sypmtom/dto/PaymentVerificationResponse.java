package Milan.Ai_sypmtom.dto;

import Milan.Ai_sypmtom.entity.Appointment;
import lombok.Data;

@Data
public class PaymentVerificationResponse {
    private boolean success;
    private String message;
    private Appointment appointment;
    private Long paymentId;
}
