package Milan.Ai_sypmtom.controller;

import Milan.Ai_sypmtom.entity.MedicalReport;
import Milan.Ai_sypmtom.service.MedicalReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/Api")
public class MedicalReportController {

    @Autowired
    private MedicalReportService medicalReportService;

    @PostMapping("/MedicalReport")
    public ResponseEntity<MedicalReport> AddMedicalReport(@RequestBody MedicalReport report) {
        return new ResponseEntity<>(medicalReportService.AddMedicalReport(report), HttpStatus.CREATED);
    }

    @GetMapping("/MedicalReports")
    public ResponseEntity<List<MedicalReport>> GetAllMedicalReports() {
        return new ResponseEntity<>(medicalReportService.GetAllMedicalReport(), HttpStatus.OK);
    }

    // New endpoint: Get medical reports for current user
    @GetMapping("/MedicalReports/me")
    public ResponseEntity<List<MedicalReport>> GetMyMedicalReports(Principal principal) {
        try {
            String email = principal.getName();
            List<MedicalReport> reports = medicalReportService.GetMedicalReportsByUserEmail(email);
            return new ResponseEntity<>(reports, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // New endpoint: Get medical report by appointment ID
    @GetMapping("/MedicalReport/appointment/{appointmentId}")
    public ResponseEntity<MedicalReport> GetMedicalReportByAppointmentId(@PathVariable Long appointmentId) {
        try {
            MedicalReport report = medicalReportService.GetMedicalReportByAppointmentId(appointmentId);
            return report != null ?
                    new ResponseEntity<>(report, HttpStatus.OK) :
                    new ResponseEntity<>(HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // New endpoint: Get medical reports by patient ID
    @GetMapping("/MedicalReports/patient/{patientId}")
    public ResponseEntity<List<MedicalReport>> GetMedicalReportsByPatientId(@PathVariable Long patientId) {
        try {
            List<MedicalReport> reports = medicalReportService.GetMedicalReportsByPatientId(patientId);
            return new ResponseEntity<>(reports, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/MedicalReport/{id}")
    public ResponseEntity<MedicalReport> GetMedicalReportById(@PathVariable Long id) {
        MedicalReport report = medicalReportService.GetMedicalReportById(id);
        return report != null ? new ResponseEntity<>(report, HttpStatus.OK) : new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    @PutMapping("/MedicalReport/{id}")
    public ResponseEntity<MedicalReport> UpdateMedicalReport(@RequestBody MedicalReport updated, @PathVariable Long id) {
        try {
            MedicalReport report = medicalReportService.UpdateMedicalReport(updated, id);
            return new ResponseEntity<>(report, HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @DeleteMapping("/MedicalReport/{id}")
    public ResponseEntity<Void> DeleteMedicalReport(@PathVariable Long id) {
        if (medicalReportService.DeleteMedicalReport(id)) {
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }
}