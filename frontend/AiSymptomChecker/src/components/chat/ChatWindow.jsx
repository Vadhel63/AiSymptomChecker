"use client";

import { useState, useRef, useEffect } from "react";
import { useChat } from "../../contexts/ChatContext";
import { useAuth } from "../../contexts/AuthContext";
import {
  Send,
  UserCircle,
  ArrowLeft,
  Paperclip,
  Smile,
  Check,
  CheckCheck,
  Clock,
  AlertCircle,
  Phone,
  Video,
  MoreVertical,
  ImageIcon,
  FileText,
  X,
} from "lucide-react";

const ChatWindow = ({ onBack }) => {
  const { user } = useAuth();
  const {
    activeConversation,
    setActiveConversation,
    messages,
    sendMessage,
    sendTypingIndicator,
    isUserOnline,
    isUserTyping,
    connected,
  } = useChat();

  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showFileMenu, setShowFileMenu] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Common emojis for quick access
  const commonEmojis = [
    "😊",
    "😂",
    "❤️",
    "👍",
    "👎",
    "😢",
    "😮",
    "😡",
    "🙏",
    "👏",
    "🎉",
    "💯",
    "🔥",
    "⭐",
    "✅",
    "❌",
    "⚡",
    "💊",
    "🏥",
    "👨‍⚕️",
  ];

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input when conversation changes
  useEffect(() => {
    if (activeConversation) {
      inputRef.current?.focus();
    }
  }, [activeConversation]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if ((!newMessage.trim() && !selectedFile) || sending) return;

    setSending(true);

    let messageContent = newMessage;
    if (selectedFile) {
      messageContent = selectedFile.type.startsWith("image/")
        ? `📷 Image: ${selectedFile.name}`
        : `📎 File: ${selectedFile.name}`;
    }

    const success = await sendMessage(messageContent);

    if (success) {
      setNewMessage("");
      setSelectedFile(null);
      sendTypingIndicator(false);
    }

    setSending(false);
  };

  const handleInputChange = (e) => {
    setNewMessage(e.target.value);

    // Send typing indicator
    sendTypingIndicator(true);

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Stop typing indicator after 1 second of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      sendTypingIndicator(false);
    }, 1000);
  };

  const handleEmojiClick = (emoji) => {
    setNewMessage((prev) => prev + emoji);
    setShowEmojiPicker(false);
    inputRef.current?.focus();
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert("File size must be less than 10MB");
        return;
      }
      setSelectedFile(file);
      setShowFileMenu(false);
    }
  };

  const removeSelectedFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString();
    }
  };

  const renderMessageStatus = (message) => {
    if (message.senderId !== user?.id) return null;

    switch (message.status) {
      case "SENDING":
        return <Clock className="h-3 w-3 text-gray-400" />;
      case "SENT":
        return <Check className="h-3 w-3 text-gray-400" />;
      case "DELIVERED":
        return <CheckCheck className="h-3 w-3 text-gray-400" />;
      case "READ":
        return <CheckCheck className="h-3 w-3 text-blue-500" />;
      case "FAILED":
        return <AlertCircle className="h-3 w-3 text-red-500" />;
      default:
        return null;
    }
  };

  if (!activeConversation) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-gray-50 text-gray-500">
        <UserCircle className="h-16 w-16 mb-4 text-gray-300" />
        <h3 className="text-xl font-medium text-gray-700 mb-2">
          No conversation selected
        </h3>
        <p className="text-center px-4">
          Select a conversation from the list to start chatting
        </p>
      </div>
    );
  }

  const isOnline = isUserOnline(activeConversation.id);
  const isTyping = isUserTyping(activeConversation.id);

  // Group messages by date
  const groupedMessages = messages.reduce((groups, message) => {
    const date = formatDate(message.timestamp);
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {});

  return (
    <div className="h-full flex flex-col bg-white relative">
      {/* Chat Header */}
      <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between bg-white shadow-sm">
        <div className="flex items-center">
          {onBack && (
            <button
              className="md:hidden mr-2 p-1 rounded-full hover:bg-gray-100"
              onClick={onBack}
            >
              <ArrowLeft className="h-5 w-5 text-gray-500" />
            </button>
          )}

          <div className="relative mr-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              {activeConversation.imageUrl ? (
                <img
                  src={activeConversation.imageUrl || "/placeholder.svg"}
                  alt={activeConversation.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <UserCircle className="w-10 h-10 text-white" />
              )}
            </div>
            {isOnline && (
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white"></span>
            )}
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-900">
              {activeConversation.name}
            </h3>
            <p className="text-xs text-gray-500">
              {isTyping ? (
                <span className="text-green-600 flex items-center">
                  <span className="animate-pulse">●</span>
                  <span className="ml-1">Typing...</span>
                </span>
              ) : isOnline ? (
                "Online"
              ) : (
                "Offline"
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors">
            <MoreVertical className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Connection Status */}
      {!connected && (
        <div className="px-4 py-2 bg-yellow-50 border-b border-yellow-200">
          <p className="text-xs text-yellow-800 text-center flex items-center justify-center">
            <span className="animate-spin rounded-full h-3 w-3 border-b border-yellow-600 mr-2"></span>
            Connecting to chat server...
          </p>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 bg-gradient-to-b from-gray-50 to-white">
        {Object.keys(groupedMessages).length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mb-4">
              <UserCircle className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-center px-4 text-gray-600">
              No messages yet. Start the conversation!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(groupedMessages).map(([date, dateMessages]) => (
              <div key={date}>
                {/* Date separator */}
                <div className="flex items-center justify-center my-4">
                  <div className="bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full shadow-sm">
                    {date}
                  </div>
                </div>

                {/* Messages for this date */}
                <div className="space-y-3">
                  {dateMessages.map((message, index) => {
                    const isOwnMessage = message.senderId === user?.id;
                    const showAvatar =
                      !isOwnMessage &&
                      (index === 0 ||
                        dateMessages[index - 1]?.senderId !== message.senderId);

                    return (
                      <div
                        key={message.id || index}
                        className={`flex ${
                          isOwnMessage ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`flex items-end space-x-2 max-w-[75%] ${
                            isOwnMessage
                              ? "flex-row-reverse space-x-reverse"
                              : ""
                          }`}
                        >
                          {/* Avatar */}
                          {showAvatar && !isOwnMessage && (
                            <div className="w-6 h-6 bg-gradient-to-r from-gray-300 to-gray-400 rounded-full flex items-center justify-center flex-shrink-0">
                              <UserCircle className="w-6 h-6 text-white" />
                            </div>
                          )}
                          {!showAvatar && !isOwnMessage && (
                            <div className="w-6 h-6 flex-shrink-0"></div>
                          )}

                          {/* Message bubble */}
                          <div
                            className={`rounded-2xl px-4 py-2 shadow-sm ${
                              isOwnMessage
                                ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-br-md"
                                : "bg-white text-gray-800 border border-gray-200 rounded-bl-md"
                            }`}
                          >
                            <p className="text-sm leading-relaxed">
                              {message.content}
                            </p>
                            <div
                              className={`flex items-center justify-end mt-1 space-x-1 ${
                                isOwnMessage ? "text-blue-100" : "text-gray-400"
                              }`}
                            >
                              <span className="text-xs">
                                {formatTime(message.timestamp)}
                              </span>
                              {renderMessageStatus(message)}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* File Preview */}
      {selectedFile && (
        <div className="px-4 py-2 bg-blue-50 border-t border-blue-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {selectedFile.type.startsWith("image/") ? (
                <ImageIcon className="h-4 w-4 text-blue-600" />
              ) : (
                <FileText className="h-4 w-4 text-blue-600" />
              )}
              <span className="text-sm text-blue-800">{selectedFile.name}</span>
            </div>
            <button
              onClick={removeSelectedFile}
              className="text-blue-600 hover:text-blue-800"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Emoji Picker */}
      {showEmojiPicker && (
        <div className="absolute bottom-16 left-4 bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-10">
          <div className="grid grid-cols-5 gap-2">
            {commonEmojis.map((emoji, index) => (
              <button
                key={index}
                onClick={() => handleEmojiClick(emoji)}
                className="text-xl hover:bg-gray-100 rounded p-1 transition-colors"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* File Menu */}
      {showFileMenu && (
        <div className="absolute bottom-16 left-4 bg-white border border-gray-200 rounded-lg shadow-lg p-2 z-10">
          <button
            onClick={() => {
              fileInputRef.current?.click();
              setShowFileMenu(false);
            }}
            className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
          >
            <ImageIcon className="h-4 w-4" />
            <span>Photo</span>
          </button>
          <button
            onClick={() => {
              fileInputRef.current?.click();
              setShowFileMenu(false);
            }}
            className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
          >
            <FileText className="h-4 w-4" />
            <span>Document</span>
          </button>
        </div>
      )}

      {/* Message Input */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <form
          onSubmit={handleSendMessage}
          className="flex items-center space-x-2"
        >
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setShowFileMenu(!showFileMenu);
                setShowEmojiPicker(false);
              }}
              className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors"
            >
              <Paperclip className="h-5 w-5" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.pdf,.doc,.docx,.txt"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              placeholder="Type a message..."
              className="w-full py-3 px-4 pr-12 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
              value={newMessage}
              onChange={handleInputChange}
              disabled={!connected || sending}
            />
            <button
              type="button"
              onClick={() => {
                setShowEmojiPicker(!showEmojiPicker);
                setShowFileMenu(false);
              }}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors"
            >
              <Smile className="h-5 w-5" />
            </button>
          </div>

          <button
            type="submit"
            className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 shadow-lg"
            disabled={
              (!newMessage.trim() && !selectedFile) || !connected || sending
            }
          >
            {sending ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <Send className="h-5 w-5" />
            )}
          </button>
        </form>
      </div>

      {/* Click outside handlers */}
      {(showEmojiPicker || showFileMenu) && (
        <div
          className="fixed inset-0 z-5"
          onClick={() => {
            setShowEmojiPicker(false);
            setShowFileMenu(false);
          }}
        />
      )}
    </div>
  );
};

export default ChatWindow;
