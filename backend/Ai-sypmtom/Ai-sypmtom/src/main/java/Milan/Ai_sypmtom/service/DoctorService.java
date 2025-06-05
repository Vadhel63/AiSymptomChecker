package Milan.Ai_sypmtom.service;

import Milan.Ai_sypmtom.entity.Doctor;

import javax.print.Doc;
import java.util.List;


public interface DoctorService {
    Doctor AddDoctor(Doctor doctor,Long id);
    Doctor AddDoctorByEmail(Doctor doctor,String email);
    Doctor UpdateDoctor(Doctor UpdatedDoctor,Long Id);
    Doctor GetDoctorById(Long Id);
    List<Doctor> GetAllDoctor();

    Doctor GetDoctorByEmail(String email);
}
