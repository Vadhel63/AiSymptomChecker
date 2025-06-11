package Milan.Ai_sypmtom.service;

import Milan.Ai_sypmtom.dto.*;
import Milan.Ai_sypmtom.entity.*;
import Milan.Ai_sypmtom.Repository.*;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class PaymentServiceImpl implements PaymentService {

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private AppointmentService appointmentService;

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private UserInfoRepository userInfoRepository;

    @Value("${razorpay.key.id}")
    private String razorpayKeyId;

    @Value("${razorpay.key.secret}")
    private String razorpayKeySecret;

    @Override
    @Transactional
    public PaymentOrderResponse createPaymentOrder(PaymentOrderRequest request, String userEmail) {
        try {
            // Get patient from email
            UserInfo user = userInfoRepository.findByEmail(userEmail)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            Patient patient = patientRepository.findByUser(user)
                    .orElseThrow(() -> new RuntimeException("Patient profile not found"));

            // Get doctor
            Doctor doctor = doctorRepository.findById(request.getDoctorId())
                    .orElseThrow(() -> new RuntimeException("Doctor not found"));

            // Validate appointment data
            AppointmentRequestDTO appointmentData = request.getAppointmentData();

            // Check if appointment slot is available
            boolean isAvailable = appointmentService.CheckAvailability(
                    request.getDoctorId(),
                    appointmentData.getDate(),
                    appointmentData.getTime()
            );

            if (!isAvailable) {
                throw new RuntimeException("Selected time slot is not available");
            }

//            // Check for existing pending payments for same slot
//            Optional<Payment> existingPayment = paymentRepository
//                    .findByPatientAndDoctorAndStatusAndCreatedAtAfter(
//                            patient, doctor, PaymentStatus.PENDING,
//                            LocalDateTime.now().minusMinutes(15) // 15 min window
//                    );
//
//            if (existingPayment.isPresent()) {
//                throw new RuntimeException("You have a pending payment for this doctor. Please complete or cancel it first.");
//            }

            // Use doctor's consultation fee
            Double amount = (double) doctor.getCheckUpFee();

            // Create Razorpay order
            RazorpayClient razorpayClient = new RazorpayClient(razorpayKeyId, razorpayKeySecret);

            JSONObject orderRequest = new JSONObject();
            orderRequest.put("amount", amount * 100); // Amount in paise
            orderRequest.put("currency", request.getCurrency());
            orderRequest.put("receipt", "appointment_" + System.currentTimeMillis());

            JSONObject notes = new JSONObject();
            notes.put("doctorId", request.getDoctorId());
            notes.put("patientId", patient.getPatientId());
            notes.put("appointmentDate", appointmentData.getDate().toString());
            notes.put("appointmentTime", appointmentData.getTime().toString());
            orderRequest.put("notes", notes);

            Order order = razorpayClient.orders.create(orderRequest);

            // Save payment record
            Payment payment = new Payment();
            payment.setRazorpayOrderId(order.get("id"));
            payment.setAmount(amount);
            payment.setCurrency(request.getCurrency());
            payment.setPatient(patient);
            payment.setDoctor(doctor);
            payment.setStatus(PaymentStatus.PENDING);

            Payment savedPayment = paymentRepository.save(payment);

            // Return response
            PaymentOrderResponse response = new PaymentOrderResponse();
            response.setSuccess(true);
            response.setOrderId(order.get("id"));
            response.setAmount(amount);
            response.setCurrency(request.getCurrency());
            response.setMessage("Payment order created successfully");

            return response;

        } catch (RazorpayException e) {
            throw new RuntimeException("Failed to create payment order: " + e.getMessage());
        } catch (Exception e) {
            throw new RuntimeException("Error creating payment order: " + e.getMessage());
        }
    }

    @Override
    @Transactional
    public PaymentVerificationResponse verifyPaymentAndCreateAppointment(
            PaymentVerificationRequest request, String userEmail) {

        try {
            // Verify payment signature
            boolean isValidSignature = verifyPaymentSignature(
                    request.getRazorpayOrderId(),
                    request.getRazorpayPaymentId(),
                    request.getRazorpaySignature()
            );

            if (!isValidSignature) {
                throw new RuntimeException("Invalid payment signature");
            }

            // Get payment record
            Payment payment = paymentRepository.findByRazorpayOrderId(request.getRazorpayOrderId())
                    .orElseThrow(() -> new RuntimeException("Payment record not found"));

            // Update payment status
            payment.setRazorpayPaymentId(request.getRazorpayPaymentId());
            payment.setRazorpaySignature(request.getRazorpaySignature());
            payment.setStatus(PaymentStatus.COMPLETED);
            payment.setPaidAt(LocalDateTime.now());
            payment.setPaymentMethod("Razorpay");

            // Create appointment after successful payment
            AppointmentRequestDTO appointmentData = request.getAppointmentData();
            appointmentData.setPatientId(payment.getPatient().getPatientId());
            appointmentData.setDoctorId(payment.getDoctor().getDoctorId());

            Appointment appointment = appointmentService.AddAppointment(appointmentData);

            // Link payment to appointment
            payment.setAppointment(appointment);
            paymentRepository.save(payment);

            PaymentVerificationResponse response = new PaymentVerificationResponse();
            response.setSuccess(true);
            response.setMessage("Payment verified and appointment created successfully");
            response.setAppointment(appointment);
            response.setPaymentId(payment.getPaymentId());

            return response;

        } catch (Exception e) {
            // Update payment status to failed
            Optional<Payment> paymentOpt = paymentRepository.findByRazorpayOrderId(request.getRazorpayOrderId());
            if (paymentOpt.isPresent()) {
                Payment payment = paymentOpt.get();
                payment.setStatus(PaymentStatus.FAILED);
                payment.setFailureReason(e.getMessage());
                paymentRepository.save(payment);
            }

            throw new RuntimeException("Payment verification failed: " + e.getMessage());
        }
    }

    @Override
    public Payment getPaymentByOrderId(String orderId) {
        return paymentRepository.findByRazorpayOrderId(orderId)
                .orElseThrow(() -> new RuntimeException("Payment not found"));
    }

    @Override
    public boolean verifyPaymentSignature(String orderId, String paymentId, String signature) {
        try {
            String payload = orderId + "|" + paymentId;

            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKeySpec = new SecretKeySpec(razorpayKeySecret.getBytes(), "HmacSHA256");
            mac.init(secretKeySpec);

            byte[] hash = mac.doFinal(payload.getBytes());
            StringBuilder hexString = new StringBuilder();

            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) {
                    hexString.append('0');
                }
                hexString.append(hex);
            }

            return hexString.toString().equals(signature);

        } catch (Exception e) {
            return false;
        }
    }
}
