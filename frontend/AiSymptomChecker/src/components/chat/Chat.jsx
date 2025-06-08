"use client";

import { useState, useEffect } from "react";
import { useChat } from "../../contexts/ChatContext";
import ChatList from "./chat-list";
import ChatWindow from "./ChatWindow";
import { MessageSquare, AlertTriangle, RefreshCw } from "lucide-react";

const Chat = () => {
  const {
    activeConversation,
    connected,
    connectionError,
    retryConnection,
    conversations,
    refreshConversations,
  } = useChat();
  const [showMobileList, setShowMobileList] = useState(true);

  useEffect(() => {
    if (activeConversation) {
      setShowMobileList(false);
    }
  }, [activeConversation]);

  return (
    <div className="flex flex-col h-full">
      {/* Connection Error Banner */}
      {connectionError && (
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-4">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-amber-500 mr-2" />
            <div className="flex-1">
              <p className="text-sm text-amber-700">
                Chat connection error: {connectionError}
              </p>
              <p className="text-xs text-amber-600 mt-1">
                Messages will be sent using fallback method. Some features may
                be limited.
              </p>
            </div>
            <button
              onClick={retryConnection}
              className="px-3 py-1 bg-amber-100 hover:bg-amber-200 text-amber-800 rounded-md text-xs flex items-center"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Mobile Toggle */}
      <div className="md:hidden flex justify-between items-center mb-4">
        <button
          onClick={() => setShowMobileList(true)}
          className={`px-4 py-2 rounded-lg flex items-center ${
            showMobileList
              ? "bg-indigo-600 text-white"
              : "bg-gray-100 text-gray-700"
          }`}
        >
          <MessageSquare className="h-4 w-4 mr-2" />
          Conversations
        </button>

        {activeConversation && (
          <button
            onClick={() => setShowMobileList(false)}
            className={`px-4 py-2 rounded-lg ${
              !showMobileList
                ? "bg-indigo-600 text-white"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            {activeConversation.name || "Chat"}
          </button>
        )}
      </div>

      {/* Chat Interface */}
      <div className="flex flex-1 overflow-hidden bg-white rounded-lg shadow">
        {/* Chat List - Hidden on mobile when conversation is active */}
        <div
          className={`${
            showMobileList ? "flex" : "hidden"
          } md:flex md:w-1/3 lg:w-1/4 border-r border-gray-200 flex-col`}
        >
          <ChatList onSelectConversation={() => setShowMobileList(false)} />
        </div>

        {/* Chat Window - Hidden on mobile when showing conversation list */}
        <div
          className={`${
            !showMobileList ? "flex" : "hidden"
          } md:flex flex-1 flex-col`}
        >
          {activeConversation ? (
            <ChatWindow />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-6 bg-gray-50">
              <MessageSquare className="h-16 w-16 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">
                No conversation selected
              </h3>
              <p className="text-gray-500 text-center mb-4">
                Select a conversation from the list or start a new one
              </p>
              {conversations.length === 0 && (
                <button
                  onClick={refreshConversations}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm flex items-center"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh Conversations
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;
