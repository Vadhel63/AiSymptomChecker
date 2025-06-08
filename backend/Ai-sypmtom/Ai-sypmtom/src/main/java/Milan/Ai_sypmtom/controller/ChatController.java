package Milan.Ai_sypmtom.controller;

import Milan.Ai_sypmtom.dto.ChatMessageDTO;
import Milan.Ai_sypmtom.entity.ChatMessage;
import Milan.Ai_sypmtom.service.ChatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    @Autowired
    private ChatService chatService;

    @PostMapping("/send")
    public ResponseEntity<ChatMessage> sendMessage(@RequestBody ChatMessageDTO messageDTO) {
        ChatMessage savedMessage = chatService.saveMessage(messageDTO);
        return ResponseEntity.ok(savedMessage);
    }

    @GetMapping("/history/{user1Id}/{user2Id}")
    public ResponseEntity<List<ChatMessage>> getConversationHistory(
            @PathVariable Long user1Id,
            @PathVariable Long user2Id) {
        List<ChatMessage> messages = chatService.getConversationHistory(user1Id, user2Id);
        return ResponseEntity.ok(messages);
    }

    @GetMapping("/conversations/{userId}")
    public ResponseEntity<List<Map<String, Object>>> getUserConversations(@PathVariable Long userId) {
        List<Map<String, Object>> conversations = chatService.getUserConversations(userId);
        return ResponseEntity.ok(conversations);
    }

    @PostMapping("/mark-read")
    public ResponseEntity<?> markMessagesAsRead(
            @RequestParam Long senderId,
            @RequestParam Long receiverId) {
        chatService.markMessagesAsRead(senderId, receiverId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/unread-count/{userId}")
    public ResponseEntity<Long> getUnreadMessageCount(@PathVariable Long userId) {
        long count = chatService.getUnreadMessageCount(userId);
        return ResponseEntity.ok(count);
    }

    @DeleteMapping("/message/{messageId}")
    public ResponseEntity<?> deleteMessage(@PathVariable Long messageId) {
        chatService.deleteMessage(messageId);
        return ResponseEntity.ok().build();
    }
}
