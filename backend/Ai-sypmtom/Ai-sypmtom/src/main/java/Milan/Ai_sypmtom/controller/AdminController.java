package Milan.Ai_sypmtom.controller;

import Milan.Ai_sypmtom.entity.Role;
import Milan.Ai_sypmtom.entity.Status;
import Milan.Ai_sypmtom.entity.UserInfo;
import Milan.Ai_sypmtom.Repository.UserInfoRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/admin")
@PreAuthorize("hasRole('ADMIN')") // Ensure only admins can access these endpoints
public class AdminController {

    private final UserInfoRepository userRepository;

    public AdminController(UserInfoRepository userRepository) {
        this.userRepository = userRepository;
    }

    /**
     * Get all pending doctor approval requests
     */
    @GetMapping("/pending-doctors")
    public ResponseEntity<?> getPendingDoctors() {
        try {
            List<UserInfo> pendingDoctors = userRepository.findByRoleAndStatus(Role.Doctor, Status.Pending);

            Map<String, Object> response = new HashMap<>();
            response.put("pendingDoctors", pendingDoctors);
            response.put("count", pendingDoctors.size());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to fetch pending doctors: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * Approve a doctor's registration
     */
    @PostMapping("/approve-doctor/{doctorId}")
    public ResponseEntity<?> approveDoctor(@PathVariable Long doctorId) {
        try {
            Optional<UserInfo> doctorOpt = userRepository.findById(doctorId);

            if (doctorOpt.isEmpty()) {
                Map<String, String> response = new HashMap<>();
                response.put("error", "Doctor not found");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }

            UserInfo doctor = doctorOpt.get();

            // Verify the user is actually a doctor with pending status
            if (doctor.getRole() != Role.Doctor) {
                Map<String, String> response = new HashMap<>();
                response.put("error", "User is not a doctor");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }

            if (doctor.getStatus() != Status.Pending) {
                Map<String, String> response = new HashMap<>();
                response.put("error", "Doctor is not in pending status");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }

            // Approve the doctor
            doctor.setStatus(Status.Active);
            userRepository.save(doctor);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Doctor approved successfully");
            response.put("doctorId", doctorId);
            response.put("doctorName", doctor.getUserName());
            response.put("doctorEmail", doctor.getEmail());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to approve doctor: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * Reject a doctor's registration
     */
    @PostMapping("/reject-doctor/{doctorId}")
    public ResponseEntity<?> rejectDoctor(@PathVariable Long doctorId,
                                          @RequestBody(required = false) Map<String, String> requestBody) {
        try {
            Optional<UserInfo> doctorOpt = userRepository.findById(doctorId);

            if (doctorOpt.isEmpty()) {
                Map<String, String> response = new HashMap<>();
                response.put("error", "Doctor not found");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }

            UserInfo doctor = doctorOpt.get();

            // Verify the user is actually a doctor with pending status
            if (doctor.getRole() != Role.Doctor) {
                Map<String, String> response = new HashMap<>();
                response.put("error", "User is not a doctor");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }

            if (doctor.getStatus() != Status.Pending) {
                Map<String, String> response = new HashMap<>();
                response.put("error", "Doctor is not in pending status");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }

            // You can either delete the user or set status to Rejected
            // Option 1: Delete the user completely
            userRepository.delete(doctor);

            // Option 2: Set status to Rejected (if you have this status)
            // doctor.setStatus(Status.Rejected);
            // userRepository.save(doctor);

            String rejectionReason = requestBody != null ? requestBody.get("reason") : "No reason provided";

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Doctor registration rejected");
            response.put("doctorId", doctorId);
            response.put("doctorName", doctor.getUserName());
            response.put("doctorEmail", doctor.getEmail());
            response.put("rejectionReason", rejectionReason);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to reject doctor: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * Get all users with their status (for admin dashboard)
     */
    @GetMapping("/all-users")
    public ResponseEntity<?> getAllUsers() {
        try {
            List<UserInfo> allUsers = userRepository.findAll();

            Map<String, Object> response = new HashMap<>();
            response.put("users", allUsers);
            response.put("totalCount", allUsers.size());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to fetch users: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * Block/Unblock a user
     */
    @PostMapping("/toggle-user-status/{userId}")
    public ResponseEntity<?> toggleUserStatus(@PathVariable Long userId) {
        try {
            Optional<UserInfo> userOpt = userRepository.findById(userId);

            if (userOpt.isEmpty()) {
                Map<String, String> response = new HashMap<>();
                response.put("error", "User not found");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }

            UserInfo user = userOpt.get();

            // Don't allow blocking/unblocking pending users or admins
            if (user.getRole() == Role.Admin) {
                Map<String, String> response = new HashMap<>();
                response.put("error", "Cannot modify admin user status");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
            }

            // Toggle status between Active and Blocked
            Status newStatus = user.getStatus() == Status.Active ? Status.Blocked : Status.Active;
            user.setStatus(newStatus);
            userRepository.save(user);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "User status updated successfully");
            response.put("userId", userId);
            response.put("userName", user.getUserName());
            response.put("newStatus", newStatus.toString());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to update user status: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * Get dashboard statistics
     */
    @GetMapping("/dashboard-stats")
    public ResponseEntity<?> getDashboardStats() {
        try {
            long totalUsers = userRepository.count();
            long pendingDoctors = userRepository.countByRoleAndStatus(Role.Doctor, Status.Pending);
            long activeDoctors = userRepository.countByRoleAndStatus(Role.Doctor, Status.Active);
            long activePatients = userRepository.countByRoleAndStatus(Role.Patient, Status.Active);
            long blockedUsers = userRepository.countByStatus(Status.Blocked);

            Map<String, Object> stats = new HashMap<>();
            stats.put("totalUsers", totalUsers);
            stats.put("pendingDoctors", pendingDoctors);
            stats.put("activeDoctors", activeDoctors);
            stats.put("activePatients", activePatients);
            stats.put("blockedUsers", blockedUsers);

            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to fetch dashboard stats: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
}