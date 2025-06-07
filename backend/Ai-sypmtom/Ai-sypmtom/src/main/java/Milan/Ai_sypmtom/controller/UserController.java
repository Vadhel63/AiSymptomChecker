package Milan.Ai_sypmtom.controller;


import Milan.Ai_sypmtom.Repository.DoctorRepository;
import Milan.Ai_sypmtom.Repository.PatientRepository;
import Milan.Ai_sypmtom.Repository.UserInfoRepository;
import Milan.Ai_sypmtom.entity.Doctor;
import Milan.Ai_sypmtom.entity.Patient;
import Milan.Ai_sypmtom.entity.Role;
import Milan.Ai_sypmtom.entity.UserInfo;
import Milan.Ai_sypmtom.service.CloudinaryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.security.Principal;
import java.util.Optional;

@RestController
@RequestMapping("/Api")
public class UserController {

    @Autowired
    private  UserInfoRepository userInfoRepository;

    @Autowired
    private DoctorRepository doctorRepository;
    @Autowired
    private PatientRepository patientRepository;
    @Autowired
    private CloudinaryService cloudinaryService;
    @GetMapping("/Profile")
    public UserInfo GetProfile(Principal principal)
    {
        return userInfoRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
    @GetMapping("/Profile/{id}")
    public UserInfo GetProfileByIf(Principal principal , @RequestParam Long id)
    {
        return userInfoRepository.findById(id).orElseThrow(()-> new RuntimeException("User Not Found"));
    }
    @PutMapping("/UpdateProfile")
    public ResponseEntity<UserInfo> updateUserProfile(
            @RequestParam(value = "imageUrl", required = false) MultipartFile image,
            @RequestParam(value = "name", required = false) String name,
            Principal principal) throws IOException {

        String email = principal.getName();

        UserInfo user = userInfoRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        if(user.getRole()== Role.Patient)
        {
            Optional<Patient>_p=patientRepository.findByUser(user);
            if(_p.isPresent())
            {
                Patient p=_p.get();
                if (name != null && !name.trim().isEmpty())
                    p.setName(name.trim());
            }
        }
        if(user.getRole()== Role.Doctor)
        {
            Optional<Doctor>_d=doctorRepository.findByUser(user);
            if(_d.isPresent())
            {
                Doctor d=_d.get();
                if (name != null && !name.trim().isEmpty())
                    d.setName(name.trim());
            }
        }
        // Update image if provided
        if (image != null && !image.isEmpty()) {
            String uploadedImageUrl = cloudinaryService.uploadImage(image);
            user.setImageUrl(uploadedImageUrl);
        }

        // Update name if provided
        if (name != null && !name.trim().isEmpty()) {
            user.setUserName(name.trim());
        }

        userInfoRepository.save(user);
        return ResponseEntity.ok(user);
    }


}
