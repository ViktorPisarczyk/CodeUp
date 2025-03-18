import { useState, useEffect, useRef } from "react";
import { jwtDecode } from "jwt-decode";
import { useLocation } from "react-router-dom";
import AsideMenu from "../components/AsideMenu";
import { IoSend } from "react-icons/io5";

const API_URL = "http://localhost:5001";

const Messages = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const location = useLocation();

  // Get user ID from token
  const getUserIdFromToken = () => {
    const token = localStorage.getItem("token");
    if (!token) return null;

    try {
      const decoded = jwtDecode(token);
      return decoded.id;
    } catch (error) {
      console.error("Invalid token", error);
      return null;
    }
  };

  const currentUserId = getUserIdFromToken();

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Fetch conversations
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No token found");

        const response = await fetch(`${API_URL}/messages/conversations`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch conversations");
        }

        const data = await response.json();
        setConversations(data);
        
        // Store conversations in localStorage for the AsideMenu to access
        localStorage.setItem("conversations", JSON.stringify(data));

        // Check if we need to select a specific conversation from route state
        if (location.state?.activeConversation) {
          const conversationId = location.state.activeConversation;
          const conversation = data.find((conv) => conv.id === conversationId);
          if (conversation) {
            setSelectedConversation(conversation);
          }
        }

        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching conversations:", error);
        setError("Failed to load conversations. Please try again later.");
        setIsLoading(false);
      }
    };

    if (currentUserId) {
      fetchConversations();
      
      // Set up polling for conversations every 15 seconds to update unread counts
      const intervalId = setInterval(fetchConversations, 15000);
      
      // Clean up interval on unmount
      return () => clearInterval(intervalId);
    }
  }, [currentUserId, location.state]);

  // Fetch messages when a conversation is selected
  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedConversation) return;

      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No token found");

        const response = await fetch(
          `${API_URL}/messages/conversations/${selectedConversation.id}/messages`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch messages");
        }

        const data = await response.json();
        setMessages(data);

        // Mark messages as read
        await fetch(
          `${API_URL}/messages/conversations/${selectedConversation.id}/read`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // Update unread count in conversations list
        setConversations((prevConversations) => {
          const updatedConversations = prevConversations.map((conv) =>
            conv.id === selectedConversation.id ? { ...conv, unread: 0 } : conv
          );
          
          // Update localStorage with the updated conversations
          localStorage.setItem("conversations", JSON.stringify(updatedConversations));
          
          return updatedConversations;
        });
        
        // Dispatch custom event to notify AsideMenu that a conversation has been opened
        const event = new CustomEvent("conversationOpened", {
          detail: { conversationId: selectedConversation.id }
        });
        window.dispatchEvent(event);
      } catch (error) {
        console.error("Error fetching messages:", error);
        setError("Failed to load messages. Please try again later.");
      }
    };

    fetchMessages();
  }, [selectedConversation]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found");

      // Add message to UI immediately (optimistic update)
      const tempMessage = {
        _id: `temp-${Date.now()}`,
        sender: {
          _id: currentUserId,
        },
        text: newMessage,
        createdAt: new Date().toISOString(),
        read: true,
      };

      setMessages((prev) => [...prev, tempMessage]);
      setNewMessage("");

      // Send message to server
      const response = await fetch(
        `${API_URL}/messages/conversations/${selectedConversation.id}/messages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ text: newMessage }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      const sentMessage = await response.json();

      // Replace temp message with actual message from server
      setMessages((prev) =>
        prev.map((msg) => (msg._id === tempMessage._id ? sentMessage : msg))
      );

      // Update conversation with new last message
      setConversations((prevConversations) =>
        prevConversations.map((conv) =>
          conv.id === selectedConversation.id
            ? {
                ...conv,
                lastMessage: newMessage,
                timestamp: new Date().toISOString(),
              }
            : conv
        )
      );
    } catch (error) {
      console.error("Error sending message:", error);
      setError("Failed to send message. Please try again.");

      // Remove the temporary message if sending failed
      setMessages((prev) =>
        prev.filter((msg) => msg._id !== `temp-${Date.now()}`)
      );
    }
  };

  // Start a new conversation with a user
  // This function is currently not used but kept for future implementation of the new message feature
  // eslint-disable-next-line no-unused-vars
  const startConversation = async (userId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found");

      const response = await fetch(
        `${API_URL}/messages/conversations/user/${userId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to create conversation");
      }

      const newConversation = await response.json();

      // Add to conversations if not already present
      setConversations((prev) => {
        const exists = prev.some((conv) => conv.id === newConversation.id);
        if (!exists) {
          return [newConversation, ...prev];
        }
        return prev;
      });

      // Select the new conversation
      setSelectedConversation(newConversation);
    } catch (error) {
      console.error("Error creating conversation:", error);
      setError("Failed to start conversation. Please try again later.");
    }
  };

  const filteredConversations = conversations.filter((conversation) =>
    conversation.user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Format timestamp
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (diffInDays === 1) {
      return "Yesterday";
    } else if (diffInDays < 7) {
      return date.toLocaleDateString([], { weekday: "short" });
    } else {
      return date.toLocaleDateString([], { month: "short", day: "numeric" });
    }
  };

  return (
    <div
      className="flex min-h-screen"
      style={{ backgroundColor: "var(--primary)" }}
    >
      <AsideMenu />
      <div className="flex-1 flex flex-col">
        <div className="flex h-screen">
          {/* Conversations List */}
          <div
            className="w-1/3 border-r"
            style={{ backgroundColor: "var(--secondary)" }}
          >
            <div
              className="p-4 border-b"
              style={{ borderColor: "var(--quaternary)" }}
            >
              <h2 className="text-xl font-semibold mb-4">Messages</h2>
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-2 rounded-md text-black"
                style={{ backgroundColor: "var(--textarea)" }}
              />
            </div>
            <div className="overflow-y-auto h-[calc(100vh-80px)]">
              {isLoading ? (
                <div className="flex justify-center items-center h-32">
                  <div
                    className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2"
                    style={{ borderColor: "var(--tertiary)" }}
                  ></div>
                </div>
              ) : error ? (
                <div className="text-center p-4 text-red-500">{error}</div>
              ) : filteredConversations.length > 0 ? (
                filteredConversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    className={`flex items-center p-4 border-b cursor-pointer hover:opacity-80 ${
                      selectedConversation?.id === conversation.id
                        ? "bg-opacity-20"
                        : ""
                    }`}
                    style={{
                      borderColor: "var(--quaternary)",
                      backgroundColor:
                        selectedConversation?.id === conversation.id
                          ? "var(--quaternary)"
                          : "transparent",
                    }}
                    onClick={() => setSelectedConversation(conversation)}
                  >
                    <div className="relative">
                      {conversation.user.profilePicture ? (
                        <img
                          src={conversation.user.profilePicture}
                          alt={conversation.user.username}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div
                          className="w-12 h-12 rounded-full flex items-center justify-center text-white"
                          style={{ backgroundColor: "var(--tertiary)" }}
                        >
                          {conversation.user.username[0].toUpperCase()}
                        </div>
                      )}
                      {conversation.unread > 0 && (
                        <div
                          className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs text-white"
                          style={{ backgroundColor: "var(--tertiary)" }}
                        >
                          {conversation.unread}
                        </div>
                      )}
                    </div>
                    <div className="ml-3 flex-1 overflow-hidden">
                      <div className="flex justify-between items-center">
                        <h3 className="font-semibold truncate">
                          {conversation.user.username}
                        </h3>
                        <span className="text-xs opacity-70">
                          {formatTime(conversation.timestamp)}
                        </span>
                      </div>
                      <p
                        className={`text-sm truncate ${
                          conversation.unread > 0
                            ? "font-semibold"
                            : "opacity-70"
                        }`}
                      >
                        {conversation.lastMessage}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center p-4 opacity-70">
                  No conversations found
                </div>
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div
            className="w-2/3 flex flex-col"
            style={{ backgroundColor: "var(--primary)" }}
          >
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <div
                  className="p-4 border-b flex items-center"
                  style={{
                    backgroundColor: "var(--secondary)",
                    borderColor: "var(--quaternary)",
                  }}
                >
                  {selectedConversation.user.profilePicture ? (
                    <img
                      src={selectedConversation.user.profilePicture}
                      alt={selectedConversation.user.username}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white"
                      style={{ backgroundColor: "var(--tertiary)" }}
                    >
                      {selectedConversation.user.username[0].toUpperCase()}
                    </div>
                  )}
                  <div className="ml-3">
                    <h3 className="font-semibold">
                      {selectedConversation.user.username}
                    </h3>
                  </div>
                </div>

                {/* Messages */}
                <div
                  className="flex-1 overflow-y-auto p-4"
                  style={{ backgroundColor: "var(--primary)" }}
                >
                  {messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full opacity-70">
                      <p>No messages yet. Start the conversation!</p>
                    </div>
                  ) : (
                    messages.map((message) => (
                      <div
                        key={message._id}
                        className={`mb-4 max-w-[70%] ${
                          message.sender._id === currentUserId
                            ? "ml-auto"
                            : "mr-auto"
                        }`}
                      >
                        <div
                          className={`p-3 rounded-lg ${
                            message.sender._id === currentUserId
                              ? "rounded-tr-none text-white"
                              : "rounded-tl-none"
                          }`}
                          style={{
                            backgroundColor:
                              message.sender._id === currentUserId
                                ? "var(--tertiary)"
                                : "var(--secondary)",
                          }}
                        >
                          {message.text}
                        </div>
                        <div
                          className={`text-xs mt-1 opacity-70 ${
                            message.sender._id === currentUserId
                              ? "text-right"
                              : ""
                          }`}
                        >
                          {formatTime(message.createdAt)}
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <form
                  onSubmit={handleSendMessage}
                  className="p-4 border-t flex items-center"
                  style={{
                    backgroundColor: "var(--secondary)",
                    borderColor: "var(--quaternary)",
                  }}
                >
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 p-2 rounded-l-md text-black"
                    style={{ backgroundColor: "var(--textarea)" }}
                  />
                  <button
                    type="submit"
                    className="p-2 rounded-r-md text-white flex items-center justify-center"
                    style={{ backgroundColor: "var(--tertiary)" }}
                    disabled={!newMessage.trim()}
                  >
                    <IoSend size={20} />
                  </button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center opacity-70">
                <div className="text-center p-8">
                  <h3 className="text-xl font-semibold mb-2">
                    Select a conversation
                  </h3>
                  <p>Choose a conversation from the list to start messaging</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;
