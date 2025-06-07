package Milan.Ai_sypmtom.service;

import Milan.Ai_sypmtom.Repository.UserInfoRepository;
import Milan.Ai_sypmtom.entity.Doctor;
import Milan.Ai_sypmtom.Repository.DoctorRepository;
import Milan.Ai_sypmtom.entity.UserInfo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class DoctorServiceImpl implements DoctorService {

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private UserInfoRepository userInfoRepository;

    @Override
    public Doctor AddDoctor(Doctor doctor, Long Id) {
        Optional<UserInfo> _user = userInfoRepository.findById(Id);

        if (_user.isPresent()) {
            UserInfo user=_user.get();
            doctor.setUser(_user.get());
            doctor.setName(user.getUserName());
            return doctorRepository.save(doctor);
        }
        return null;
    }

    @Override
    public Doctor AddDoctorByEmail(Doctor doctor, String email) {
        Optional<UserInfo> _user = userInfoRepository.findByEmail(email);
        if (_user.isPresent()) {
            UserInfo user=_user.get();
            doctor.setUser(_user.get());
            doctor.setName(user.getUserName());
            return doctorRepository.save(doctor);
        }
        return null;
    }

    @Override
    public Doctor UpdateDoctor(Doctor updatedDoctor, Long id) {
        Doctor existingDoctor = doctorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Doctor not found with id: " + id));

        if (updatedDoctor.getClinicName() != null)
            existingDoctor.setClinicName(updatedDoctor.getClinicName());

        if (updatedDoctor.getExperience() != 0)
            existingDoctor.setExperience(updatedDoctor.getExperience());

        if (updatedDoctor.getSpecialization() != null)
            existingDoctor.setSpecialization(updatedDoctor.getSpecialization());

        if (updatedDoctor.getCheckUpFee() != 0)
            existingDoctor.setCheckUpFee(updatedDoctor.getCheckUpFee());
        if(updatedDoctor.getMobileNo()!=null)
        {
            existingDoctor.setMobileNo(updatedDoctor.getMobileNo());
        }
        if (updatedDoctor.getCity() != null)
            existingDoctor.setCity(updatedDoctor.getCity());

        if (updatedDoctor.getState() != null)
            existingDoctor.setState(updatedDoctor.getState());

        if (updatedDoctor.getPincode() != null)
            existingDoctor.setPincode(updatedDoctor.getPincode());

        if (updatedDoctor.getArea() != null)
            existingDoctor.setArea(updatedDoctor.getArea());

        if (updatedDoctor.getCountry() != null)
            existingDoctor.setCountry(updatedDoctor.getCountry());

        if (updatedDoctor.getQualification() != null)
            existingDoctor.setQualification(updatedDoctor.getQualification());

        if (updatedDoctor.getAvailability() != null)
            existingDoctor.setAvailability(updatedDoctor.getAvailability());

        if (updatedDoctor.getLicenseProofPath() != null)
            existingDoctor.setLicenseProofPath(updatedDoctor.getLicenseProofPath());

        return doctorRepository.save(existingDoctor);
    }

    @Override
    public Doctor GetDoctorById(Long id) {
        return doctorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Doctor not found with id: " + id));
    }

    @Override
    public List<Doctor> GetAllDoctor() {
        return doctorRepository.findAll();
    }

    @Override
    public Doctor GetDoctorByEmail(String email) {
        Optional<UserInfo> userOptional = userInfoRepository.findByEmail(email);
        if (userOptional.isPresent()) {
            Optional<Doctor> doctorOptional = doctorRepository.findByUser(userOptional.get());
            return doctorOptional.orElse(null);
        }
        return null;
    }
}
