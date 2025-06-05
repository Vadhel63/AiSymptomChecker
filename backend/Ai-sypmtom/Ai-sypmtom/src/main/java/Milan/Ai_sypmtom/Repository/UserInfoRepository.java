package Milan.Ai_sypmtom.Repository;

import Milan.Ai_sypmtom.entity.Role;
import Milan.Ai_sypmtom.entity.Status;
import Milan.Ai_sypmtom.entity.UserInfo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserInfoRepository extends JpaRepository<UserInfo,Long> {

    Optional<UserInfo> findByEmail(String Email); // Use 'email' if that is the correct field for login

    boolean existsByEmail(String Email);

    List<UserInfo> findByRoleAndStatus(Role role, Status status);
    long countByRoleAndStatus(Role role, Status status);
    long countByStatus(Status status);


}
