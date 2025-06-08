"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import chatAPI from "../services/chat-api";
import { webSocketService } from "../services/websocket-service";
import { useAuth } from "./AuthContext";

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [unreadCounts, setUnreadCounts] = useState({});
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(null);

  // Initialize WebSocket connection
  useEffect(() => {
    if (!user?.id) return;

    const initializeWebSocket = async () => {
      try {
        setConnectionError(null);
        await webSocketService.connect(user.id);
        setConnected(true);

        // Set up message handlers
        webSocketService.onMessage("message", handleIncomingMessage);
        webSocketService.onMessage("typing", handleTypingIndicator);
        webSocketService.onMessage("online-status", handleOnlineStatus);
      } catch (error) {
        console.error("Failed to connect to WebSocket:", error);
        setConnected(false);
        setConnectionError(error.message || "Failed to connect to chat server");
      }
    };

    initializeWebSocket();

    return () => {
      webSocketService.disconnect();
      setConnected(false);
    };
  }, [user?.id]);

  // Load conversations
  const loadConversations = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const conversationsData = await chatAPI.getUserConversations(user.id);
      setConversations(conversationsData || []);

      // Calculate unread counts
      const counts = {};
      if (Array.isArray(conversationsData)) {
        conversationsData.forEach((conv) => {
          counts[conv.otherUser.id] = conv.unreadCount || 0;
        });
      }
      setUnreadCounts(counts);
    } catch (error) {
      console.error("Error loading conversations:", error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Load conversations on mount
  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // Load chat history when active conversation changes
  useEffect(() => {
    if (!activeConversation || !user?.id) return;

    const loadChatHistory = async () => {
      try {
        setLoading(true);
        const chatHistory = await chatAPI.getChatHistory(
          user.id,
          activeConversation.id
        );
        setMessages(chatHistory || []);

        // Mark messages as read
        await chatAPI.markMessagesAsRead(activeConversation.id, user.id);

        // Reset unread count for this conversation
        setUnreadCounts((prev) => ({
          ...prev,
          [activeConversation.id]: 0,
        }));
      } catch (error) {
        console.error("Error loading chat history:", error);
      } finally {
        setLoading(false);
      }
    };

    loadChatHistory();
  }, [activeConversation, user?.id]);

  const handleIncomingMessage = useCallback(
    (messageData) => {
      console.log("Handling incoming message:", messageData);

      // Extract message info from notification
      const message = {
        id: messageData.messageId,
        senderId: messageData.senderId,
        receiverId: user?.id,
        content: messageData.content,
        timestamp: messageData.timestamp,
        status: "delivered",
      };

      // Add message to current conversation if it's active
      if (
        activeConversation &&
        (message.senderId === activeConversation.id ||
          message.receiverId === activeConversation.id)
      ) {
        setMessages((prev) => [...prev, message]);

        // Mark as read if we're the receiver
        if (message.receiverId === user?.id) {
          webSocketService.markMessageAsRead(message.senderId, user.id);
        }
      }
      // Otherwise update unread count
      else if (message.receiverId === user?.id) {
        setUnreadCounts((prev) => ({
          ...prev,
          [message.senderId]: (prev[message.senderId] || 0) + 1,
        }));

        // Update conversations list
        setConversations((prev) => {
          const updated = [...prev];
          const index = updated.findIndex(
            (c) => c.otherUser.id === message.senderId
          );

          if (index !== -1) {
            updated[index] = {
              ...updated[index],
              lastMessage: message.content,
              timestamp: message.timestamp,
              unreadCount: (updated[index].unreadCount || 0) + 1,
            };

            // Move to top
            const [conversation] = updated.splice(index, 1);
            updated.unshift(conversation);
          } else {
            // Create new conversation if it doesn't exist
            updated.unshift({
              id: `conv-${user.id}-${message.senderId}`,
              otherUser: {
                id: message.senderId,
                name: messageData.senderName || "Unknown User",
                imageUrl: null,
              },
              lastMessage: message.content,
              timestamp: message.timestamp,
              unreadCount: 1,
              isOnline: false,
            });
          }

          return updated;
        });
      }
    },
    [activeConversation, user?.id]
  );

  const handleTypingIndicator = useCallback((typingData) => {
    if (typingData.isTyping) {
      setTypingUsers((prev) => new Set([...prev, typingData.senderId]));

      // Clear typing indicator after 3 seconds
      setTimeout(() => {
        setTypingUsers((prev) => {
          const updated = new Set(prev);
          updated.delete(typingData.senderId);
          return updated;
        });
      }, 3000);
    } else {
      setTypingUsers((prev) => {
        const updated = new Set(prev);
        updated.delete(typingData.senderId);
        return updated;
      });
    }
  }, []);

  const handleOnlineStatus = useCallback((statusData) => {
    if (statusData.isOnline) {
      setOnlineUsers((prev) => new Set([...prev, statusData.userId]));
    } else {
      setOnlineUsers((prev) => {
        const updated = new Set(prev);
        updated.delete(statusData.userId);
        return updated;
      });
    }
  }, []);

  const sendMessage = useCallback(
    async (content) => {
      if (!activeConversation || !user?.id || !content.trim()) return false;

      try {
        // Create message object
        const messageData = {
          senderId: user.id,
          receiverId: activeConversation.id,
          content: content.trim(),
        };

        // Add to local messages immediately for UI feedback
        const tempId = `temp-${Date.now()}`;
        const tempMessage = {
          ...messageData,
          id: tempId,
          timestamp: new Date().toISOString(),
          status: "sending",
        };
        setMessages((prev) => [...prev, tempMessage]);

        // Send via WebSocket for real-time delivery if connected
        if (connected) {
          webSocketService.sendMessage(activeConversation.id, content);
        }

        // Save to database via REST API
        const savedMessage = await chatAPI.saveMessage(messageData);

        // Replace temp message with saved message
        setMessages((prev) =>
          prev.map((msg) => (msg.id === tempId ? savedMessage : msg))
        );

        // Update conversations list
        setConversations((prev) => {
          const updated = [...prev];
          const index = updated.findIndex(
            (c) => c.otherUser.id === activeConversation.id
          );

          if (index !== -1) {
            updated[index] = {
              ...updated[index],
              lastMessage: content,
              timestamp: new Date().toISOString(),
            };

            // Move to top
            const [conversation] = updated.splice(index, 1);
            updated.unshift(conversation);
          } else {
            // Create new conversation if it doesn't exist
            updated.unshift({
              id: `conv-${user.id}-${activeConversation.id}`,
              otherUser: activeConversation,
              lastMessage: content,
              timestamp: new Date().toISOString(),
              unreadCount: 0,
            });
          }

          return updated;
        });

        return true;
      } catch (error) {
        console.error("Error sending message:", error);

        // Update message status to failed
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === `temp-${Date.now()}` ? { ...msg, status: "failed" } : msg
          )
        );

        return false;
      }
    },
    [activeConversation, user?.id, connected]
  );

  const sendTypingIndicator = useCallback(
    (isTyping) => {
      if (!activeConversation || !connected) return;
      webSocketService.sendTypingIndicator(activeConversation.id, isTyping);
    },
    [activeConversation, connected]
  );

  const isUserOnline = useCallback(
    (userId) => {
      return onlineUsers.has(userId);
    },
    [onlineUsers]
  );

  const isUserTyping = useCallback(
    (userId) => {
      return typingUsers.has(userId);
    },
    [typingUsers]
  );

  const getTotalUnreadCount = useCallback(() => {
    return Object.values(unreadCounts).reduce((sum, count) => sum + count, 0);
  }, [unreadCounts]);

  const retryConnection = useCallback(() => {
    if (user?.id) {
      webSocketService.disconnect();
      setConnected(false);
      setConnectionError(null);

      // Try to reconnect
      webSocketService
        .connect(user.id)
        .then(() => {
          setConnected(true);
        })
        .catch((error) => {
          setConnectionError(
            error.message || "Failed to connect to chat server"
          );
        });
    }
  }, [user?.id]);

  const value = {
    conversations,
    activeConversation,
    setActiveConversation,
    messages,
    unreadCounts,
    loading,
    connected,
    connectionError,
    sendMessage,
    sendTypingIndicator,
    isUserOnline,
    isUserTyping,
    getTotalUnreadCount,
    retryConnection,
    refreshConversations: loadConversations,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
};
