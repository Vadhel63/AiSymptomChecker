package Milan.Ai_sypmtom.service;

import Milan.Ai_sypmtom.Repository.ChatMessageRepository;
import Milan.Ai_sypmtom.Repository.UserInfoRepository;
import Milan.Ai_sypmtom.dto.ChatMessageDTO;
import Milan.Ai_sypmtom.entity.ChatMessage;
import Milan.Ai_sypmtom.entity.UserInfo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ChatService {

    @Autowired
    private ChatMessageRepository chatRepo;

    @Autowired
    private UserInfoRepository userRepo;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    // Track online users
    private static final Set<Long> onlineUsers = Collections.synchronizedSet(new HashSet<>());

    // Track typing status: key = "senderId-receiverId", value = isTyping
    private static final Map<String, Boolean> typingStatus = new HashMap<>();

    /**
     * Save a new chat message to the database
     */
    public ChatMessage saveMessage(ChatMessageDTO dto) {
        UserInfo sender = userRepo.findById(dto.getSenderId()).orElseThrow();
        UserInfo receiver = userRepo.findById(dto.getReceiverId()).orElseThrow();

        ChatMessage message = new ChatMessage();
        message.setSender(sender);
        message.setReceiver(receiver);
        message.setContent(dto.getContent());
        message.setTimestamp(LocalDateTime.now());

        ChatMessage savedMessage = chatRepo.save(message);

        // Notify the receiver about the new message
        notifyNewMessage(savedMessage);

        return savedMessage;
    }

    /**
     * Get conversation history between two users
     */
    public List<ChatMessage> getConversationHistory(Long user1Id, Long user2Id) {
        List<ChatMessage> sentMessages = chatRepo.findBySenderIdAndReceiverId(user1Id, user2Id);
        List<ChatMessage> receivedMessages = chatRepo.findBySenderIdAndReceiverId(user2Id, user1Id);

        // Combine both lists
        List<ChatMessage> allMessages = new ArrayList<>();
        allMessages.addAll(sentMessages);
        allMessages.addAll(receivedMessages);

        // Sort by timestamp
        allMessages.sort(Comparator.comparing(ChatMessage::getTimestamp));

        return allMessages;
    }

    /**
     * Get all conversations for a user
     */
    public List<Map<String, Object>> getUserConversations(Long userId) {
        // Get all messages where user is either sender or receiver
        List<ChatMessage> sentMessages = chatRepo.findBySenderId(userId);
        List<ChatMessage> receivedMessages = chatRepo.findByReceiverId(userId);

        // Combine and find unique conversation partners
        Set<Long> conversationPartnerIds = new HashSet<>();

        for (ChatMessage message : sentMessages) {
            conversationPartnerIds.add(message.getReceiver().getId());
        }

        for (ChatMessage message : receivedMessages) {
            conversationPartnerIds.add(message.getSender().getId());
        }

        // Create conversation summaries
        List<Map<String, Object>> conversations = new ArrayList<>();

        for (Long partnerId : conversationPartnerIds) {
            UserInfo partner = userRepo.findById(partnerId).orElse(null);
            if (partner == null) continue;

            // Get the latest message
            List<ChatMessage> conversationMessages = getConversationHistory(userId, partnerId);
            ChatMessage latestMessage = !conversationMessages.isEmpty() ?
                    conversationMessages.get(conversationMessages.size() - 1) : null;

            // Count unread messages
            long unreadCount = conversationMessages.stream()
                    .filter(msg -> msg.getSender().getId().equals(partnerId) && !msg.isRead())
                    .count();

            Map<String, Object> conversation = new HashMap<>();
            conversation.put("partnerId", partnerId);
            conversation.put("partnerName", partner.getUserName());
            conversation.put("isOnline", onlineUsers.contains(partnerId));
            conversation.put("unreadCount", unreadCount);

            if (latestMessage != null) {
                conversation.put("latestMessage", latestMessage.getContent());
                conversation.put("latestMessageTime", latestMessage.getTimestamp());
            }

            conversations.add(conversation);
        }

        // Sort by latest message time
        conversations.sort((c1, c2) -> {
            LocalDateTime time1 = (LocalDateTime) c1.getOrDefault("latestMessageTime", LocalDateTime.MIN);
            LocalDateTime time2 = (LocalDateTime) c2.getOrDefault("latestMessageTime", LocalDateTime.MIN);
            return time2.compareTo(time1); // Descending order
        });

        return conversations;
    }

    /**
     * Mark messages as read
     */
    public void markMessagesAsRead(Long senderId, Long receiverId) {
        List<ChatMessage> unreadMessages = chatRepo.findBySenderIdAndReceiverId(senderId, receiverId)
                .stream()
                .filter(msg -> !msg.isRead())
                .collect(Collectors.toList());

        for (ChatMessage message : unreadMessages) {
            message.setRead(true);
        }

        chatRepo.saveAll(unreadMessages);

        // Notify the sender that messages were read
        if (!unreadMessages.isEmpty()) {
            Map<String, Object> readReceipt = new HashMap<>();
            readReceipt.put("type", "read_receipt");
            readReceipt.put("receiverId", receiverId);
            readReceipt.put("messageIds", unreadMessages.stream()
                    .map(ChatMessage::getId)
                    .collect(Collectors.toList()));

            messagingTemplate.convertAndSend("/topic/user/" + senderId, readReceipt);
        }
    }

    /**
     * Update user online status
     */
    public void updateUserOnlineStatus(Long userId, boolean isOnline) {
        if (isOnline) {
            onlineUsers.add(userId);
        } else {
            onlineUsers.remove(userId);
        }

        // Broadcast online status change to all users
        Map<String, Object> statusUpdate = new HashMap<>();
        statusUpdate.put("type", "user_status");
        statusUpdate.put("userId", userId);
        statusUpdate.put("isOnline", isOnline);

        messagingTemplate.convertAndSend("/topic/user-status", statusUpdate);
    }

    /**
     * Update typing status
     */
    public void updateTypingStatus(Long senderId, Long receiverId, boolean isTyping) {
        String key = senderId + "-" + receiverId;
        typingStatus.put(key, isTyping);

        // Send typing status to receiver
        Map<String, Object> typingUpdate = new HashMap<>();
        typingUpdate.put("type", "typing_status");
        typingUpdate.put("senderId", senderId);
        typingUpdate.put("isTyping", isTyping);

        messagingTemplate.convertAndSend("/topic/user/" + receiverId, typingUpdate);
    }

    /**
     * Check if user is online
     */
    public boolean isUserOnline(Long userId) {
        return onlineUsers.contains(userId);
    }

    /**
     * Notify user about new message
     */
    private void notifyNewMessage(ChatMessage message) {
        Map<String, Object> notification = new HashMap<>();
        notification.put("type", "new_message");
        notification.put("messageId", message.getId());
        notification.put("senderId", message.getSender().getId());
        notification.put("senderName", message.getSender().getUserName());
        notification.put("content", message.getContent());
        notification.put("timestamp", message.getTimestamp());

        // Send to receiver's topic
        messagingTemplate.convertAndSend("/topic/user/" + message.getReceiver().getId(), notification);

        // Send delivery receipt to sender
        Map<String, Object> deliveryReceipt = new HashMap<>();
        deliveryReceipt.put("type", "delivery_receipt");
        deliveryReceipt.put("messageId", message.getId());
        deliveryReceipt.put("status", "delivered");

        messagingTemplate.convertAndSend("/topic/user/" + message.getSender().getId(), deliveryReceipt);
    }

    /**
     * Get all messages for a user (sent and received)
     */
    public List<ChatMessage> getAllUserMessages(Long userId) {
        List<ChatMessage> sentMessages = chatRepo.findBySenderId(userId);
        List<ChatMessage> receivedMessages = chatRepo.findByReceiverId(userId);

        List<ChatMessage> allMessages = new ArrayList<>();
        allMessages.addAll(sentMessages);
        allMessages.addAll(receivedMessages);

        // Sort by timestamp
        allMessages.sort(Comparator.comparing(ChatMessage::getTimestamp));

        return allMessages;
    }

    /**
     * Delete a message
     */
    public void deleteMessage(Long messageId) {
        chatRepo.deleteById(messageId);
    }

    /**
     * Get unread message count for a user
     */
    public long getUnreadMessageCount(Long userId) {
        return chatRepo.findByReceiverId(userId)
                .stream()
                .filter(msg -> !msg.isRead())
                .count();
    }
}
