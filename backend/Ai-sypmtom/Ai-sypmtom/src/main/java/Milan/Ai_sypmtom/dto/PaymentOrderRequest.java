package Milan.Ai_sypmtom.dto;

import lombok.Data;

@Data
public class PaymentOrderRequest {
    private Double amount;
    private String currency = "INR";
    private Long doctorId;
    private AppointmentRequestDTO appointmentData;
}
