package Milan.Ai_sypmtom.controller;

import Milan.Ai_sypmtom.entity.Doctor;
import Milan.Ai_sypmtom.entity.Status;
import Milan.Ai_sypmtom.entity.UserInfo;
import Milan.Ai_sypmtom.Repository.UserInfoRepository;
import Milan.Ai_sypmtom.service.DoctorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/Api")
@CrossOrigin(origins = "http://localhost:5173")
public class DoctorController {

    @Autowired
    private DoctorService doctorService;

    @Autowired
    private UserInfoRepository userInfoRepository;

    @PostMapping("/Doctor/{id}")
    public ResponseEntity<Doctor> AddDoctor(@RequestBody Doctor doctor, @PathVariable Long id) {
        Doctor saved = doctorService.AddDoctor(doctor, id);
        if (saved == null) {
            return new ResponseEntity<>(null, HttpStatus.NOT_FOUND);
        }
        return new ResponseEntity<>(saved, HttpStatus.CREATED);
    }

    @PostMapping("/Doctor")
    public ResponseEntity<Doctor> AddDoctorByEmail(Authentication authentication, @RequestBody Doctor doctor) {
        String email = authentication.getName();
        Doctor saved = doctorService.AddDoctorByEmail(doctor, email);
        if (saved == null) {
            return new ResponseEntity<>(null, HttpStatus.NOT_FOUND);
        }
        return new ResponseEntity<>(saved, HttpStatus.CREATED);
    }

    @GetMapping("/Doctors")
    public ResponseEntity<List<Doctor>> GetAllDoctors() {
        return new ResponseEntity<>(doctorService.GetAllDoctor(), HttpStatus.OK);
    }

    @GetMapping("/Doctor/{id}")
    public ResponseEntity<Doctor> GetDoctorById(@PathVariable Long id) {
        Doctor doctor = doctorService.GetDoctorById(id);

        if (doctor != null) {
            return new ResponseEntity<>(doctor, HttpStatus.OK);
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    @GetMapping("/Doctor/me")
    public ResponseEntity<Doctor> GetMyDoctorProfile(Authentication authentication) {
        String email = authentication.getName();
        Doctor doctor = doctorService.GetDoctorByEmail(email);
        if (doctor != null) {
            return new ResponseEntity<>(doctor, HttpStatus.OK);
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    @PutMapping("/Doctor/{id}")
    public ResponseEntity<Doctor> UpdateDoctor(@RequestBody Doctor updated, @PathVariable Long id) {
        try {
            Doctor doctor = doctorService.UpdateDoctor(updated, id);
            return new ResponseEntity<>(doctor, HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @PutMapping("/Doctor/{id}/status")
    public ResponseEntity<?> UpdateDoctorStatus(@PathVariable Long id, @RequestBody Map<String, String> statusUpdate) {
        try {
            Doctor doctor = doctorService.GetDoctorById(id);
            if (doctor == null) {
                return new ResponseEntity<>("Doctor not found", HttpStatus.NOT_FOUND);
            }

            UserInfo user = doctor.getUser();
            String statusStr = statusUpdate.get("status");

            if ("Active".equals(statusStr)) {
                user.setStatus(Status.Active);
            } else if ("Blocked".equals(statusStr)) {
                user.setStatus(Status.Blocked);
            } else {
                return new ResponseEntity<>("Invalid status", HttpStatus.BAD_REQUEST);
            }

            userInfoRepository.save(user);
            return new ResponseEntity<>("Doctor status updated successfully", HttpStatus.OK);

        } catch (Exception e) {
            return new ResponseEntity<>("Error updating doctor status: " + e.getMessage(),
                    HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
