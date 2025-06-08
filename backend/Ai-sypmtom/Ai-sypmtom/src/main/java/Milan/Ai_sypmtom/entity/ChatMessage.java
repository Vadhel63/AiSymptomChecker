package Milan.Ai_sypmtom.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String content;

    private LocalDateTime timestamp;

    // Option 1: Escape the reserved keyword with backticks
    @Column(name = "`read`")
    private boolean read = false;

    // Option 2: Better approach - rename to avoid reserved keyword
    // @Column(name = "is_read")
    // private boolean isRead = false;

    @ManyToOne
    @JoinColumn(name = "sender_id")
    private UserInfo sender;

    @ManyToOne
    @JoinColumn(name = "receiver_id")
    private UserInfo receiver;
}