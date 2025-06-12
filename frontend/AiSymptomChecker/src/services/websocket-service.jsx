import { Client } from "@stomp/stompjs";

import SockJS from "sockjs-client";

class WebSocketService {
  constructor() {
    this.client = null;
    this.connected = false;
    this.subscriptions = new Map();
    this.messageHandlers = new Map();
    this.connectionPromise = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.userId = null;
  }

  connect(userId) {
    if (this.connected || this.connectionPromise) {
      return this.connectionPromise;
    }

    this.connectionPromise = new Promise((resolve, reject) => {
      try {
        // Get the authentication token
        const token = localStorage.getItem("token");

        const socket = new SockJS("https://aisymptomchecker.onrender.com/chat");

        this.client = new Client({
          webSocketFactory: () => socket,
          connectHeaders: {
            Authorization: token ? `Bearer ${token}` : "",
            userId: userId.toString(),
          },
          debug: (str) => {
            console.log("STOMP Debug:", str);
          },
          reconnectDelay: 5000,
          heartbeatIncoming: 4000,
          heartbeatOutgoing: 4000,
        });

        this.client.onConnect = (frame) => {
          console.log("Connected to WebSocket:", frame);
          this.connected = true;
          this.reconnectAttempts = 0;
          this.userId = userId;

          // Add user to online users
          this.addUser(userId);

          // Subscribe to user-specific messages
          this.subscribeToUserMessages(userId);

          // Subscribe to online status updates
          this.subscribeToOnlineStatus();

          resolve();
        };

        this.client.onStompError = (frame) => {
          console.error("STOMP error:", frame);
          this.connected = false;
          reject(
            new Error(
              `WebSocket connection failed: ${
                frame.headers?.message || "Unknown error"
              }`
            )
          );
        };

        this.client.onWebSocketClose = (event) => {
          console.log("WebSocket connection closed", event);
          this.connected = false;

          // Handle reconnection
          if (this.reconnectAttempts < this.maxReconnectAttempts) {
            console.log(
              `Attempting to reconnect (${this.reconnectAttempts + 1}/${
                this.maxReconnectAttempts
              })...`
            );
            this.reconnectAttempts++;
            setTimeout(() => {
              this.connectionPromise = null;
              this.connect(userId);
            }, 3000);
          }
        };

        this.client.activate();
      } catch (error) {
        console.error("Error connecting to WebSocket:", error);
        this.connected = false;
        reject(error);
      }
    });

    return this.connectionPromise;
  }

  disconnect() {
    if (this.client) {
      this.client.deactivate();
      this.connected = false;
      this.connectionPromise = null;
      this.subscriptions.clear();
      this.messageHandlers.clear();
      this.userId = null;
    }
  }

  addUser(userId) {
    if (!this.connected || !this.client) return;

    try {
      this.client.publish({
        destination: "/app/chat.addUser",
        body: JSON.stringify({ userId }),
        headers: {
          "content-type": "application/json",
        },
      });
    } catch (error) {
      console.error("Error adding user:", error);
    }
  }

  subscribeToUserMessages(userId) {
    if (!this.connected || !this.client) return null;

    try {
      const destination = `/topic/user/${userId}`;
      const subscription = this.client.subscribe(destination, (message) => {
        try {
          const messageData = JSON.parse(message.body);
          console.log("Received message:", messageData);

          // Handle different message types
          switch (messageData.type) {
            case "new_message":
              this.handleMessage("message", messageData);
              break;
            case "typing_status":
              this.handleMessage("typing", messageData);
              break;
            case "user_status":
              this.handleMessage("online-status", messageData);
              break;
            case "delivery_receipt":
              this.handleMessage("delivery", messageData);
              break;
            case "read_receipt":
              this.handleMessage("read", messageData);
              break;
            default:
              console.log("Unknown message type:", messageData.type);
          }
        } catch (error) {
          console.error("Error processing message:", error);
        }
      });

      this.subscriptions.set("messages", subscription);
      return subscription;
    } catch (error) {
      console.error("Error subscribing to messages:", error);
      return null;
    }
  }

  subscribeToOnlineStatus() {
    if (!this.connected || !this.client) return null;

    try {
      const destination = "/topic/user-status";
      const subscription = this.client.subscribe(destination, (message) => {
        try {
          const statusData = JSON.parse(message.body);
          this.handleMessage("online-status", statusData);
        } catch (error) {
          console.error("Error processing online status:", error);
        }
      });

      this.subscriptions.set("online-status", subscription);
      return subscription;
    } catch (error) {
      console.error("Error subscribing to online status:", error);
      return null;
    }
  }

  sendMessage(receiverId, content) {
    if (!this.connected || !this.client) {
      console.error("WebSocket not connected");
      return false;
    }

    try {
      const messageData = {
        receiverId,
        content,
      };

      this.client.publish({
        destination: "/app/chat.sendMessage",
        body: JSON.stringify(messageData),
        headers: {
          "content-type": "application/json",
        },
      });

      return true;
    } catch (error) {
      console.error("Error sending message:", error);
      return false;
    }
  }

  sendTypingIndicator(receiverId, isTyping) {
    if (!this.connected || !this.client) return false;

    try {
      const typingData = {
        senderId: this.userId,
        receiverId,
        isTyping,
      };

      this.client.publish({
        destination: "/app/chat.typing",
        body: JSON.stringify(typingData),
        headers: {
          "content-type": "application/json",
        },
      });

      return true;
    } catch (error) {
      console.error("Error sending typing indicator:", error);
      return false;
    }
  }

  markMessageAsRead(senderId, receiverId) {
    if (!this.connected || !this.client) return false;

    try {
      const readData = {
        senderId,
        receiverId,
      };

      this.client.publish({
        destination: "/app/chat.markRead",
        body: JSON.stringify(readData),
        headers: {
          "content-type": "application/json",
        },
      });

      return true;
    } catch (error) {
      console.error("Error marking message as read:", error);
      return false;
    }
  }

  onMessage(type, handler) {
    if (!this.messageHandlers.has(type)) {
      this.messageHandlers.set(type, []);
    }
    this.messageHandlers.get(type).push(handler);
  }

  offMessage(type, handler) {
    if (this.messageHandlers.has(type)) {
      const handlers = this.messageHandlers.get(type);
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  handleMessage(type, data) {
    if (this.messageHandlers.has(type)) {
      this.messageHandlers.get(type).forEach((handler) => {
        try {
          handler(data);
        } catch (error) {
          console.error("Error in message handler:", error);
        }
      });
    }
  }

  isConnected() {
    return this.connected;
  }
}

export const webSocketService = new WebSocketService();
