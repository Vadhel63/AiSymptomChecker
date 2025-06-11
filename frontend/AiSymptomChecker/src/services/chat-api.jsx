const API_BASE_URL = "https://aisymptomchecker.onrender.com/";

export const chatAPI = {
  // Get all conversations for a user
  getUserConversations: async (userId) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/chat/conversations/${userId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch conversations");
      }

      const text = await response.text();
      if (!text) return [];

      const conversations = JSON.parse(text);

      // Transform backend data to frontend format
      return conversations.map((conv) => ({
        id: `conv-${userId}-${conv.partnerId}`,
        otherUser: {
          id: conv.partnerId,
          name: conv.partnerName,
          imageUrl: null, // Add if available in backend
        },
        lastMessage: conv.latestMessage || "",
        timestamp: conv.latestMessageTime || new Date().toISOString(),
        unreadCount: conv.unreadCount || 0,
        isOnline: conv.isOnline || false,
      }));
    } catch (error) {
      console.error("Error fetching conversations:", error);
      return [];
    }
  },

  // Get chat history between two users
  getChatHistory: async (userId1, userId2) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/chat/history/${userId1}/${userId2}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch chat history");
      }

      const text = await response.text();
      if (!text) return [];

      const messages = JSON.parse(text);

      // Transform backend data to frontend format
      return messages.map((msg) => ({
        id: msg.id,
        senderId: msg.sender?.id,
        receiverId: msg.receiver?.id,
        content: msg.content,
        timestamp: msg.timestamp,
        status: msg.read ? "read" : "delivered",
      }));
    } catch (error) {
      console.error("Error fetching chat history:", error);
      return [];
    }
  },

  // Save a new message
  saveMessage: async (messageData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/chat/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(messageData),
      });

      if (!response.ok) {
        throw new Error("Failed to save message");
      }

      const text = await response.text();
      if (!text) throw new Error("Empty response");

      const savedMessage = JSON.parse(text);

      // Transform backend data to frontend format
      return {
        id: savedMessage.id,
        senderId: savedMessage.sender?.id,
        receiverId: savedMessage.receiver?.id,
        content: savedMessage.content,
        timestamp: savedMessage.timestamp,
        status: "sent",
      };
    } catch (error) {
      console.error("Error saving message:", error);
      throw error;
    }
  },

  // Mark messages as read
  markMessagesAsRead: async (senderId, receiverId) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/chat/mark-read?senderId=${senderId}&receiverId=${receiverId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to mark messages as read");
      }

      // Handle empty response (204 No Content)
      const text = await response.text();
      return text ? JSON.parse(text) : { success: true };
    } catch (error) {
      console.error("Error marking messages as read:", error);
      // Don't throw error for mark as read, just log it
      return { success: false };
    }
  },

  // Get unread message count
  getUnreadCount: async (userId) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/chat/unread-count/${userId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch unread count");
      }

      const text = await response.text();
      return text ? JSON.parse(text) : 0;
    } catch (error) {
      console.error("Error fetching unread count:", error);
      return 0;
    }
  },

  // Delete a message
  deleteMessage: async (messageId) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/chat/message/${messageId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete message");
      }

      const text = await response.text();
      return text ? JSON.parse(text) : { success: true };
    } catch (error) {
      console.error("Error deleting message:", error);
      throw error;
    }
  },
};

export default chatAPI;
