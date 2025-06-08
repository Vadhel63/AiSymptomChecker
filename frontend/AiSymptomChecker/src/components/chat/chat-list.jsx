"use client";

import { useState } from "react";
import { useChat } from "../../contexts/ChatContext";
import { useAuth } from "../../contexts/AuthContext";
import { Search, MessageCircle, UserCircle } from "lucide-react";

const ChatList = ({ onSelectConversation }) => {
  const { user } = useAuth(); // Get user from AuthContext instead of props
  const {
    conversations,
    activeConversation,
    setActiveConversation,
    unreadCounts,
    isUserOnline,
    loading,
  } = useChat();

  const [searchTerm, setSearchTerm] = useState("");

  const filteredConversations = conversations.filter((conversation) =>
    conversation.otherUser.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleConversationSelect = (conversation) => {
    setActiveConversation(conversation.otherUser);
    if (onSelectConversation) {
      onSelectConversation();
    }
  };

  const formatLastMessageTime = (timestamp) => {
    if (!timestamp) return "";

    const now = new Date();
    const messageTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now - messageTime) / (1000 * 60));

    if (diffInMinutes < 1) return "now";
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
    return messageTime.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-800 mb-3">Messages</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search conversations..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 p-4">
            <MessageCircle className="h-12 w-12 mb-2 text-gray-300" />
            <p className="text-center">
              {searchTerm
                ? "No conversations match your search"
                : "No conversations yet. Start chatting!"}
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {filteredConversations.map((conversation) => {
              const isActive =
                activeConversation?.id === conversation.otherUser.id;
              const unreadCount = unreadCounts[conversation.otherUser.id] || 0;
              const online = isUserOnline(conversation.otherUser.id);

              return (
                <li
                  key={conversation.otherUser.id}
                  className={`cursor-pointer hover:bg-gray-50 transition-colors ${
                    isActive ? "bg-blue-50" : ""
                  }`}
                  onClick={() => handleConversationSelect(conversation)}
                >
                  <div className="flex items-center p-4">
                    <div className="relative mr-3">
                      <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                        {conversation.otherUser.imageUrl ? (
                          <img
                            src={
                              conversation.otherUser.imageUrl ||
                              "/placeholder.svg"
                            }
                            alt={conversation.otherUser.name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <UserCircle className="w-12 h-12 text-gray-500" />
                        )}
                      </div>
                      {online && (
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="text-sm font-medium text-gray-900 truncate">
                          {conversation.otherUser.name}
                        </h3>
                        {conversation.timestamp && (
                          <span className="text-xs text-gray-500">
                            {formatLastMessageTime(conversation.timestamp)}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-500 truncate max-w-[180px]">
                          {conversation.lastMessage || "No messages yet"}
                        </p>
                        {unreadCount > 0 && (
                          <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-medium text-white bg-blue-600 rounded-full">
                            {unreadCount > 99 ? "99+" : unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ChatList;
