package Milan.Ai_sypmtom.Repository;

import Milan.Ai_sypmtom.entity.Doctor;
import Milan.Ai_sypmtom.entity.UserInfo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DoctorRepository extends JpaRepository<Doctor,Long> {
    Optional<Doctor> findByUser(UserInfo userInfo);
}
