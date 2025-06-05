package Milan.Ai_sypmtom.entity;


import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@NoArgsConstructor
@Data
@AllArgsConstructor
public class UserInfo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long Id;
    private String UserName;
    @NonNull
    private  String password;
    @Column(unique = true)
    private String  email;
    @Enumerated(EnumType.STRING)

    private  Role role;

    private String ImageUrl  ;//--Image is optional for every users

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL)
    @JsonManagedReference

    private Doctor doctorProfile;

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL)
    @JsonManagedReference

    private Patient patientProfile;

    private Status status;




}
