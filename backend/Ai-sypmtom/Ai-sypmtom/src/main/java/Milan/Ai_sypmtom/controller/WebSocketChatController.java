package Milan.Ai_sypmtom.controller;

import Milan.Ai_sypmtom.dto.ChatMessageDTO;
import Milan.Ai_sypmtom.service.ChatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.stereotype.Controller;

import java.util.Map;

@Controller
public class WebSocketChatController {

    @Autowired
    private ChatService chatService;

    @MessageMapping("/chat.sendMessage")
    public void sendMessage(@Payload ChatMessageDTO chatMessageDTO) {
        chatService.saveMessage(chatMessageDTO);
    }

    @MessageMapping("/chat.addUser")
    public void addUser(@Payload Map<String, Object> payload,
                        SimpMessageHeaderAccessor headerAccessor) {
        Long userId = Long.valueOf(payload.get("userId").toString());
        headerAccessor.getSessionAttributes().put("userId", userId);
        chatService.updateUserOnlineStatus(userId, true);
    }

    @MessageMapping("/chat.typing")
    public void typingIndicator(@Payload Map<String, Object> payload) {
        Long senderId = Long.valueOf(payload.get("senderId").toString());
        Long receiverId = Long.valueOf(payload.get("receiverId").toString());
        boolean isTyping = (boolean) payload.get("isTyping");

        chatService.updateTypingStatus(senderId, receiverId, isTyping);
    }

    @MessageMapping("/chat.markRead")
    public void markRead(@Payload Map<String, Object> payload) {
        Long senderId = Long.valueOf(payload.get("senderId").toString());
        Long receiverId = Long.valueOf(payload.get("receiverId").toString());

        chatService.markMessagesAsRead(senderId, receiverId);
    }
}
