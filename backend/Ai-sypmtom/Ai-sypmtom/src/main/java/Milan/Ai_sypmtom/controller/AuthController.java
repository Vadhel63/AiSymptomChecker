package Milan.Ai_sypmtom.controller;

import Milan.Ai_sypmtom.entity.Role;
import Milan.Ai_sypmtom.entity.Status;
import Milan.Ai_sypmtom.entity.UserInfo;
import Milan.Ai_sypmtom.Repository.UserInfoRepository;
import Milan.Ai_sypmtom.service.TokenService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    private final UserInfoRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final TokenService tokenService;

    public AuthController(UserInfoRepository userRepository,
                          PasswordEncoder passwordEncoder,
                          AuthenticationManager authenticationManager,
                          TokenService tokenService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.tokenService = tokenService;
    }

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody UserInfo user) {
        if (userRepository.existsByEmail(user.getEmail())) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("Email already registered!");
        }

        // Assign default role and status
        if (user.getRole() == null) {
            user.setRole(Role.Patient);
        }

        // Set status based on role
        if (user.getRole() == Role.Doctor) {
            user.setStatus(Status.Pending); // Doctors need approval
        } else {
            user.setStatus(Status.Active); // Patients and admins are active by default
        }

        user.setPassword(passwordEncoder.encode(user.getPassword()));
        userRepository.save(user);
        return ResponseEntity.status(HttpStatus.CREATED).body("User registered successfully.");
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody UserInfo user) {
        try {
            Authentication auth = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(user.getEmail(), user.getPassword())
            );

            // Get user details
            UserInfo existingUser = userRepository.findByEmail(user.getEmail())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            // Check if user account is blocked
            if (existingUser.getStatus() == Status.Blocked) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("Your account has been blocked. Please contact support.");
            }

            String token = tokenService.generateToken(auth);

            // Create response with token and user info
            Map<String, Object> response = new HashMap<>();
            response.put("token", token);

            Map<String, Object> userInfo = new HashMap<>();
            userInfo.put("id", existingUser.getId());
            userInfo.put("email", existingUser.getEmail());
            userInfo.put("userName", existingUser.getUserName());
            userInfo.put("role", existingUser.getRole().toString());
            userInfo.put("status", existingUser.getStatus().toString());
            if(existingUser.getImageUrl() != null)
                userInfo.put("imageUrl",existingUser.getImageUrl());
            response.put("user", userInfo);

            return ResponseEntity.ok(response);

        } catch (BadCredentialsException ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Invalid credentials");
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Login failed: " + ex.getMessage());
        }
    }
    @PostMapping("/verify")
    public ResponseEntity<?> verifyToken(@RequestHeader("Authorization") String tokenHeader) {
        try {
            String token = tokenHeader.replace("Bearer ", "");
            boolean isValid = tokenService.validateToken(token);
            if (isValid) {
                Map<String, String> response = new HashMap<>();
                response.put("message", "Token is valid");
                return ResponseEntity.ok(response);
            } else {
                Map<String, String> response = new HashMap<>();
                response.put("message", "Invalid or expired token");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("error", "Token verification failed: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }


}
