package Milan.Ai_sypmtom.controller;

import Milan.Ai_sypmtom.dto.*;
import Milan.Ai_sypmtom.service.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/Api/Payment")
@CrossOrigin(origins = "http://localhost:5173")
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    @PostMapping("/create-order")
    public ResponseEntity<?> createPaymentOrder(
            @RequestBody PaymentOrderRequest request,
            Authentication authentication) {
        try {
            String userEmail = authentication.getName();
            PaymentOrderResponse response = paymentService.createPaymentOrder(request, userEmail);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @PostMapping("/verify-and-create-appointment")
    public ResponseEntity<?> verifyPaymentAndCreateAppointment(
            @RequestBody PaymentVerificationRequest request,
            Authentication authentication) {
        try {
            String userEmail = authentication.getName();
            PaymentVerificationResponse response = paymentService
                    .verifyPaymentAndCreateAppointment(request, userEmail);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @GetMapping("/order/{orderId}")
    public ResponseEntity<?> getPaymentByOrderId(@PathVariable String orderId) {
        try {
            var payment = paymentService.getPaymentByOrderId(orderId);
            return ResponseEntity.ok(payment);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
}
