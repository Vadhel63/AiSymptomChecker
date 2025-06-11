package Milan.Ai_sypmtom.service;

import Milan.Ai_sypmtom.dto.*;
import Milan.Ai_sypmtom.entity.*;

public interface PaymentService {
    PaymentOrderResponse createPaymentOrder(PaymentOrderRequest request, String userEmail);
    PaymentVerificationResponse verifyPaymentAndCreateAppointment(PaymentVerificationRequest request, String userEmail);
    Payment getPaymentByOrderId(String orderId);
    boolean verifyPaymentSignature(String orderId, String paymentId, String signature);
}
