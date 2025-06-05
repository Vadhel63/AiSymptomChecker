package Milan.Ai_sypmtom.service;

import Milan.Ai_sypmtom.entity.Doctor;
import Milan.Ai_sypmtom.entity.Patient;

import java.util.List;

public interface PatientService {
    Patient AddPatient(Patient patient,Long Id);
    Patient AddPatientByEmail(Patient patient,String email);
    Patient UpdatePatient(Patient UpdatedPatient,Long Id);
    List<Patient> GetAllPatient();
    Patient GetPatientById(Long Id);
    Patient GetPatientByEmail(String email);

}
