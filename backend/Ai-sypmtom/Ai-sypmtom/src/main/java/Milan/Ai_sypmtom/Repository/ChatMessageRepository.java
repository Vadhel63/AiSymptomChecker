package Milan.Ai_sypmtom.Repository;

import Milan.Ai_sypmtom.entity.ChatMessage;
import Milan.Ai_sypmtom.entity.UserInfo;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    List<ChatMessage> findBySenderIdAndReceiverId(Long senderId, Long receiverId);
    List<ChatMessage> findBySenderId(Long senderId);
    List<ChatMessage> findByReceiverId(Long receiverId);
}
