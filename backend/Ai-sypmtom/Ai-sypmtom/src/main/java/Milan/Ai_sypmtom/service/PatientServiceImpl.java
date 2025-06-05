package Milan.Ai_sypmtom.service;

import Milan.Ai_sypmtom.Repository.PatientRepository;
import Milan.Ai_sypmtom.Repository.UserInfoRepository;
import Milan.Ai_sypmtom.entity.Doctor;
import Milan.Ai_sypmtom.entity.Patient;
import Milan.Ai_sypmtom.entity.UserInfo;
import Milan.Ai_sypmtom.exception.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public  class PatientServiceImpl implements  PatientService {

    @Autowired
    private PatientRepository patientRepository;
    @Autowired
   private UserInfoRepository userInfoRepository;
    @Override
    public Patient AddPatient(Patient patient,Long Id)
    {
        Optional<UserInfo> _user=userInfoRepository.findById(Id);
        if(_user.isPresent())
        {
            patient.setUser(_user.get());
            return patientRepository.save(patient);
        }
        return null;
    }

    @Override
    public Patient AddPatientByEmail(Patient patient, String email) {
            Optional<UserInfo>_user=userInfoRepository.findByEmail(email);
            if(_user.isPresent())
            {
                patient.setUser(_user.get());
                return patientRepository.save(patient);
            }
            return null;
    }



    @Override
    public Patient UpdatePatient(Patient UpdatedPatient, Long id) {
        Patient existingPatient = patientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with ID: " + id));

        if (UpdatedPatient.getCity() != null)
            existingPatient.setCity(UpdatedPatient.getCity());

        if (UpdatedPatient.getState() != null)
            existingPatient.setState(UpdatedPatient.getState());

        if (UpdatedPatient.getPincode() != null)
            existingPatient.setPincode(UpdatedPatient.getPincode());

        if (UpdatedPatient.getArea() != null)
            existingPatient.setArea(UpdatedPatient.getArea());
    if(UpdatedPatient.getMobileNo()!=null)
    {
        existingPatient.setMobileNo(UpdatedPatient.getMobileNo());
    }
        if (UpdatedPatient.getCountry() != null)
            existingPatient.setCountry(UpdatedPatient.getCountry());

        if (UpdatedPatient.getAge() != 0)
            existingPatient.setAge(UpdatedPatient.getAge());

        if (UpdatedPatient.getGender() != null)
            existingPatient.setGender(UpdatedPatient.getGender());

        if (UpdatedPatient.getMedicalHistory() != null)
            existingPatient.setMedicalHistory(UpdatedPatient.getMedicalHistory());

        return patientRepository.save(existingPatient);
    }


    @Override
    public List<Patient> GetAllPatient() {
        return patientRepository.findAll();
    }

    @Override
    public Patient GetPatientById(Long Id) {
        return patientRepository.findById(Id).orElse(null);
    }

    @Override
    public Patient GetPatientByEmail(String email) {
        Optional<UserInfo> userOptional = userInfoRepository.findByEmail(email);
        if (userOptional.isPresent()) {
            Optional<Patient> patientOptional = patientRepository.findByUser(userOptional.get());
            return patientOptional.orElse(null);
        }
        return null;
    }

}
