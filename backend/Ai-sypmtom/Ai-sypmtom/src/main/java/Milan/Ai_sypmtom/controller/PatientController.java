package Milan.Ai_sypmtom.controller;

import Milan.Ai_sypmtom.entity.Doctor;
import Milan.Ai_sypmtom.entity.Patient;
import Milan.Ai_sypmtom.entity.UserInfo;
import Milan.Ai_sypmtom.service.PatientService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/Api")
public class PatientController {
    @Autowired
    private PatientService patientService;

    @GetMapping("/Patient/{id}")
   public ResponseEntity<Patient> GetPatientById(@PathVariable Long id)
    {
        Patient patient=patientService.GetPatientById(id);
        if(patient!=null)
        {
            return new ResponseEntity<>(patient,HttpStatus.ACCEPTED);
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);

    }
    @GetMapping("/Patients")
    public ResponseEntity<List<Patient>> GetAllPatients()
    {
        List<Patient> ps=patientService.GetAllPatient();
        return new ResponseEntity<>(ps,HttpStatus.OK);
    }

    // ✅ POST (Add new Patient)
    @PostMapping("/Patient/{id}")
    public ResponseEntity<Patient> AddPatient(@RequestBody Patient patient,@PathVariable Long id) {
        try {
            Patient savedPatient = patientService.AddPatient(patient,id);
            return new ResponseEntity<>(savedPatient, HttpStatus.CREATED);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PostMapping("/Patient")
    public ResponseEntity<Patient> AddPatientBYEmail(Authentication authentication,@RequestBody Patient patient){
        String email= authentication.getName();
        Patient savedPatient=patientService.AddPatientByEmail(patient,email);
        if(savedPatient==null)
        {
            return new ResponseEntity<>(null,HttpStatus.NOT_FOUND);
        }
        return new ResponseEntity<>(patient,HttpStatus.CREATED);
    }
    // ✅ PUT (Update existing Patient)
    @PutMapping("/Patient/{id}")
    public ResponseEntity<Patient> UpdatePatient(@RequestBody Patient updatedPatient, @PathVariable Long id) {
        try {
            Patient updated = patientService.UpdatePatient(updatedPatient, id);
            return new ResponseEntity<>(updated, HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
    @GetMapping("/Patient/me")
    public ResponseEntity<Patient> GetMyDoctorProfile(Authentication authentication) {
        String email = authentication.getName();
        Patient p = patientService.GetPatientByEmail(email);
        if (p != null) {
            return new ResponseEntity<>(p, HttpStatus.OK);
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

}
