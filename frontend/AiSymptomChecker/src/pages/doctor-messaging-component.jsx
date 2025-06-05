"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import {
  messagingAPI,
  createWebSocketConnection,
} from "../services/messaging-api";
import {
  MessageCircle,
  Send,
  UserCircle,
  Phone,
  Video,
  MoreVertical,
  Search,
} from "lucide-react";

const DoctorMessaging = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConversations();
    connectWebSocket();

    return () => {
      if (socket) {
        socket.close();
      }
    };
  }, []);

  const connectWebSocket = () => {
    const newSocket = createWebSocketConnection(
      user.id,
      "doctor",
      handleWebSocketMessage,
      () => setIsConnected(true),
      () => setIsConnected(false)
    );
    setSocket(newSocket);
  };

  const handleWebSocketMessage = (messageData) => {
    switch (messageData.type) {
      case "message":
        if (
          activeConversation &&
          (messageData.senderId === activeConversation.patientId ||
            messageData.receiverId === activeConversation.patientId)
        ) {
          setMessages((prev) => [...prev, messageData]);
        }
        // Update conversation list with new message
        updateConversationWithNewMessage(messageData);
        break;
      case "message_history":
        setMessages(messageData.messages || []);
        break;
      default:
        console.log("Unknown message type:", messageData.type);
    }
  };

  const updateConversationWithNewMessage = (messageData) => {
    setConversations((prev) =>
      prev.map((conv) => {
        if (
          conv.patientId === messageData.senderId ||
          conv.patientId === messageData.receiverId
        ) {
          return {
            ...conv,
            lastMessage: messageData.content,
            lastMessageTime: messageData.timestamp,
            unreadCount:
              conv.patientId === messageData.senderId
                ? conv.unreadCount + 1
                : 0,
          };
        }
        return conv;
      })
    );
  };

  const fetchConversations = async () => {
    try {
      const response = await messagingAPI.getMyConversations();
      setConversations(response.data || []);
    } catch (error) {
      console.error("Error fetching conversations:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadConversationHistory = async (conversation) => {
    setActiveConversation(conversation);
    try {
      const response = await messagingAPI.getConversationHistory(
        conversation.patientId,
        user.doctorId
      );
      setMessages(response.data || []);

      // Mark messages as read
      await messagingAPI.markAsRead(conversation.id);

      // Update conversation unread count
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === conversation.id ? { ...conv, unreadCount: 0 } : conv
        )
      );
    } catch (error) {
      console.error("Error loading conversation history:", error);
    }
  };

  const sendMessage = async () => {
    if (!socket || !newMessage.trim() || !activeConversation) return;

    const messageData = {
      type: "message",
      senderId: user.id,
      senderName: user.userName,
      senderType: "doctor",
      receiverId: activeConversation.patientId,
      receiverName: activeConversation.patientName,
      receiverType: "patient",
      content: newMessage.trim(),
      timestamp: new Date().toISOString(),
    };

    try {
      // Send via WebSocket for real-time delivery
      socket.send(JSON.stringify(messageData));

      // Also save to database via API
      await messagingAPI.sendMessage(messageData);

      // Add to local messages
      setMessages((prev) => [...prev, messageData]);
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const filteredConversations = conversations.filter((conv) =>
    conv.patientName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 h-[600px] flex">
      {/* Conversations Sidebar */}
      <div className="w-1/3 border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Messages</h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search patients..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <MessageCircle className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p>No conversations yet</p>
            </div>
          ) : (
            filteredConversations.map((conversation) => (
              <div
                key={conversation.id}
                onClick={() => loadConversationHistory(conversation)}
                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                  activeConversation?.id === conversation.id
                    ? "bg-blue-50 border-blue-200"
                    : ""
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    <UserCircle className="h-6 w-6 text-gray-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-900 truncate">
                        {conversation.patientName}
                      </h4>
                      {conversation.unreadCount > 0 && (
                        <span className="bg-blue-600 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                          {conversation.unreadCount}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 truncate">
                      {conversation.lastMessage || "No messages yet"}
                    </p>
                    <p className="text-xs text-gray-400">
                      {conversation.lastMessageTime &&
                        new Date(
                          conversation.lastMessageTime
                        ).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {activeConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    <UserCircle className="h-6 w-6 text-gray-500" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {activeConversation.patientName}
                    </h4>
                    <div className="flex items-center">
                      <div
                        className={`w-2 h-2 rounded-full mr-2 ${
                          isConnected ? "bg-green-400" : "bg-red-400"
                        }`}
                      ></div>
                      <span className="text-xs text-gray-500">
                        {isConnected ? "Connected" : "Disconnected"}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                    <Phone className="h-4 w-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                    <Video className="h-4 w-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                    <MoreVertical className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="text-center py-8">
                  <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">
                    No messages in this conversation
                  </p>
                </div>
              ) : (
                messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${
                      message.senderId === user.id
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.senderId === user.id
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-900"
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p
                        className={`text-xs mt-1 ${
                          message.senderId === user.id
                            ? "text-blue-100"
                            : "text-gray-500"
                        }`}
                      >
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={!isConnected}
                />
                <button
                  onClick={sendMessage}
                  disabled={!isConnected || !newMessage.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Select a conversation
              </h3>
              <p className="text-gray-500">
                Choose a patient from the sidebar to start messaging
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorMessaging;
