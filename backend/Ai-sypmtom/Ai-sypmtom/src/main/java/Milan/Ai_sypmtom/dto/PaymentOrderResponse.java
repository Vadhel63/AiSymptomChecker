package Milan.Ai_sypmtom.dto;

import lombok.Data;

@Data
public class PaymentOrderResponse {
    private boolean success;
    private String orderId;
    private Double amount;
    private String currency;
    private String message;
    private Long tempAppointmentId; // For tracking
}
