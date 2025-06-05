package Milan.Ai_sypmtom.service;

import Milan.Ai_sypmtom.Repository.UserInfoRepository;
import Milan.Ai_sypmtom.config.CustomUserDetails;
import Milan.Ai_sypmtom.entity.UserInfo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {

    @Autowired
    private UserInfoRepository userRepo;

    @Override
    public UserDetails loadUserByUsername(String Email) throws UsernameNotFoundException {
        UserInfo user = userRepo.findByEmail(Email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        return new CustomUserDetails(user);
    }
}
