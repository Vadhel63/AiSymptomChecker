package Milan.Ai_sypmtom.Repository;

import Milan.Ai_sypmtom.entity.Doctor;
import Milan.Ai_sypmtom.entity.Patient;
import Milan.Ai_sypmtom.entity.UserInfo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PatientRepository extends JpaRepository<Patient ,Long> {
    Optional<Patient> findByUser(UserInfo userInfo);
}
