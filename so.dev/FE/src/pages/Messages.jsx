import { useState, useEffect, useRef } from "react";
import { jwtDecode } from "jwt-decode";
import { useLocation } from "react-router-dom";
import AsideMenu from "../components/AsideMenu";
import Alert from "../components/Alert";
import { IoSend } from "react-icons/io5";
import { BsThreeDotsVertical } from "react-icons/bs";
import { FaTrash } from "react-icons/fa";

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
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [slidingConversationId, setSlidingConversationId] = useState(null);
  const [showConfirmAlert, setShowConfirmAlert] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [conversationToDelete, setConversationToDelete] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const slidingMenuRef = useRef(null);

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

  useEffect(() => {
    setCurrentUserId(getUserIdFromToken());
  }, []);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Fetch conversations
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        // Only show loading state on initial load, not during refreshes
        if (conversations.length === 0) {
          setIsLoading(true);
        }

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

        setConversations((prevConversations) => {
          // If we already have conversations, merge with new data
          if (prevConversations.length > 0) {
            const updatedConversations = [...prevConversations];

            // Update existing conversations with new data
            data.forEach((newConv) => {
              // Handle case where user might be null (deleted account)
              if (!newConv.user) {
                newConv.user = {
                  _id: "deleted",
                  username: "Deleted User",
                  profilePicture: null,
                };
              }

              const existingIndex = updatedConversations.findIndex(
                (conv) => conv.id === newConv.id
              );
              if (existingIndex !== -1) {
                updatedConversations[existingIndex] = newConv;
              } else {
                // Add new conversation
                updatedConversations.push(newConv);
              }
            });

            // Sort by most recent
            updatedConversations.sort(
              (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
            );

            return updatedConversations;
          }

          // Handle case where user might be null (deleted account) in initial data
          return data.map((conv) => {
            if (!conv.user) {
              return {
                ...conv,
                user: {
                  _id: "deleted",
                  username: "Deleted User",
                  profilePicture: null,
                },
              };
            }
            return conv;
          });
        });

        // Store conversations in localStorage for the AsideMenu to access
        localStorage.setItem("conversations", JSON.stringify(data));

        // Check if we need to select a specific conversation from route state
        if (location.state?.activeConversation) {
          const conversationId = location.state.activeConversation;
          const conversation = data.find((conv) => conv.id === conversationId);
          if (conversation) {
            setSelectedConversation(conversation);
            // Clear the location state to prevent reselecting on future renders
            window.history.replaceState({}, document.title);
          }
        }

        if (conversations.length === 0) {
          setIsLoading(false);
        }
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
  }, [currentUserId, location.state?.activeConversation, conversations.length]);

  // Poll for new messages in the background
  useEffect(() => {
    if (!currentUserId) return;

    const checkForNewMessages = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        // Fetch conversations to check for new messages
        const response = await fetch(`${API_URL}/messages/conversations`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) return;

        const data = await response.json();

        // Check if there are any unread messages
        const hasUnread = data.some((conv) => conv.unread > 0);

        if (hasUnread) {
          // Update localStorage with the latest conversations
          localStorage.setItem("conversations", JSON.stringify(data));

          // Dispatch event to notify AsideMenu about new messages
          const event = new CustomEvent("newMessage");
          window.dispatchEvent(event);

          // If we're in a conversation, update that conversation's messages
          if (selectedConversation) {
            // Only refresh messages if they're for the current conversation
            const currentConv = data.find(
              (conv) => conv.id === selectedConversation.id
            );
            if (currentConv && currentConv.unread > 0) {
              fetchMessages(selectedConversation.id);
            }
          }

          // Update conversations state if needed
          setConversations((prevConversations) => {
            // Don't update if we're already showing the latest data
            if (
              prevConversations.length === data.length &&
              prevConversations.every((conv) => {
                const newConv = data.find((c) => c.id === conv.id);
                return newConv && conv.timestamp === newConv.timestamp;
              })
            ) {
              return prevConversations;
            }

            // Preserve selected conversation state
            return data.map((newConv) => {
              if (
                selectedConversation &&
                newConv.id === selectedConversation.id
              ) {
                return { ...newConv, isSelected: true };
              }
              return newConv;
            });
          });
        }
      } catch (error) {
        console.error("Error checking for new messages:", error);
      }
    };

    // Check for new messages every 5 seconds
    const intervalId = setInterval(checkForNewMessages, 5000);

    // Clean up interval on unmount
    return () => clearInterval(intervalId);
  }, [currentUserId, selectedConversation]);

  // Fetch messages when a conversation is selected
  const fetchMessages = async (conversationId) => {
    if (!conversationId) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found");

      const response = await fetch(
        `${API_URL}/messages/conversations/${conversationId}/messages`,
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

      // Process messages to mark deleted messages and handle deleted users
      const processedMessages = data.map((message) => {
        // Check if this is a deleted message
        if (message.text === "This message was deleted") {
          return { ...message, isDeleted: true };
        }

        // Handle case where sender might be null (deleted account)
        if (!message.sender) {
          return {
            ...message,
            sender: {
              _id: "deleted",
              username: "Deleted User",
              profilePicture: null,
            },
          };
        }

        return message;
      });

      setMessages(processedMessages);

      // Mark messages as read
      await fetch(`${API_URL}/messages/conversations/${conversationId}/read`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Update unread count in conversations list
      setConversations((prevConversations) => {
        const updatedConversations = prevConversations.map((conv) =>
          conv.id === conversationId ? { ...conv, unread: 0 } : conv
        );

        // Update localStorage with the updated conversations
        localStorage.setItem(
          "conversations",
          JSON.stringify(updatedConversations)
        );

        return updatedConversations;
      });

      // Dispatch custom event to notify AsideMenu that a conversation has been opened
      const event = new CustomEvent("conversationOpened", {
        detail: { conversationId },
      });
      window.dispatchEvent(event);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.id);
    }
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

  // Handle dropdown toggle
  const toggleDropdown = (messageId) => {
    if (activeDropdown === messageId) {
      setActiveDropdown(null);
    } else {
      setActiveDropdown(messageId);
    }
  };

  // Toggle conversation action slider
  const toggleConversationSlider = (conversationId, e) => {
    e.stopPropagation();
    if (slidingConversationId === conversationId) {
      setSlidingConversationId(null);
    } else {
      setSlidingConversationId(conversationId);
    }
  };

  // Show confirmation alert for conversation deletion
  const confirmDeleteConversation = (conversationId, e) => {
    e.stopPropagation();
    setConversationToDelete(conversationId);
    setShowConfirmAlert(true);
  };

  // Delete message for me only
  const deleteMessageForMe = async (messageId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found");

      const response = await fetch(
        `${API_URL}/messages/${messageId}/delete-for-me`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete message");
      }

      // Remove message from UI
      setMessages((prevMessages) =>
        prevMessages.filter((msg) => msg._id !== messageId)
      );

      setActiveDropdown(null);
    } catch (error) {
      console.error("Error deleting message:", error);
      setError("Failed to delete message. Please try again.");
    }
  };

  // Delete message for everyone
  const deleteMessageForEveryone = async (messageId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found");

      const response = await fetch(
        `${API_URL}/messages/${messageId}/delete-for-everyone`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete message for everyone");
      }

      // Update message in UI to show "Message deleted"
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg._id === messageId
            ? { ...msg, text: "This message was deleted", isDeleted: true }
            : msg
        )
      );

      setActiveDropdown(null);
    } catch (error) {
      console.error("Error deleting message for everyone:", error);
      setError("Failed to delete message. Please try again.");
    }
  };

  // Delete conversation for current user only
  const deleteConversationForMe = async (conversationId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await fetch(
        `${API_URL}/messages/conversations/${conversationId}/delete`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete conversation");
      }

      // Remove the conversation from the UI for the current user only
      setConversations((prevConversations) =>
        prevConversations.filter((conv) => conv.id !== conversationId)
      );

      // If the deleted conversation was selected, clear the selection
      if (selectedConversation && selectedConversation.id === conversationId) {
        setSelectedConversation(null);
        setMessages([]);
      }

      // Update localStorage
      const updatedConversations = conversations.filter(
        (conv) => conv.id !== conversationId
      );
      localStorage.setItem(
        "conversations",
        JSON.stringify(updatedConversations)
      );

      // Reset states
      setSlidingConversationId(null);
      setShowConfirmAlert(false);

      // Show success alert
      setSuccessMessage("Conversation deleted from your inbox");
      setShowSuccessAlert(true);
    } catch (error) {
      console.error("Error deleting conversation:", error);
    }
  };

  // Add click outside listener to close sliding menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      // If the sliding menu is open and the click is outside of it
      if (
        slidingConversationId &&
        slidingMenuRef.current &&
        !slidingMenuRef.current.contains(event.target)
      ) {
        setSlidingConversationId(null);
      }
    };

    // Add event listener
    document.addEventListener("mousedown", handleClickOutside);

    // Clean up
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [slidingConversationId]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Only close if clicking outside of any dropdown
      if (
        activeDropdown &&
        !event.target.closest(".message-dropdown-container")
      ) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [activeDropdown]);

  return (
    <div
      className="flex min-h-screen"
      style={{ backgroundColor: "var(--primary)" }}
    >
      <AsideMenu />
      <div className="flex-1 flex flex-col">
        <div className="flex h-screen overflow-hidden">
          {/* Conversations List */}
          <div
            className="w-1/3 border-r flex flex-col"
            style={{
              backgroundColor: "var(--secondary)",
              maxWidth: "350px",
            }}
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
                className="w-full p-2 rounded-md text-black focus:outline-none"
                style={{ backgroundColor: "var(--textarea)" }}
              />
            </div>
            <div className="overflow-y-auto overflow-x-hidden flex-1">
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
                    className={`relative flex items-center p-4 border-b cursor-pointer hover:opacity-80 ${
                      selectedConversation?.id === conversation.id
                        ? "bg-opacity-20"
                        : ""
                    }`}
                    style={{
                      borderColor: "var(--quaternary)",
                      backgroundColor:
                        selectedConversation?.id === conversation.id
                          ? "var(--tertiary)"
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
                    <div
                      className="ml-2 relative"
                      onClick={(e) =>
                        toggleConversationSlider(conversation.id, e)
                      }
                    >
                      <BsThreeDotsVertical
                        size={16}
                        className="cursor-pointer opacity-70 hover:opacity-100"
                      />
                      <div
                        ref={
                          slidingConversationId === conversation.id
                            ? slidingMenuRef
                            : null
                        }
                        className={`absolute right-0 top-0 flex items-center transition-all duration-300 ease-in-out ${
                          slidingConversationId === conversation.id
                            ? "opacity-100 translate-x-0"
                            : "opacity-0 translate-x-12"
                        }`}
                        style={{
                          pointerEvents:
                            slidingConversationId === conversation.id
                              ? "auto"
                              : "none",
                          zIndex: 10,
                        }}
                      >
                        <div
                          className="p-2 rounded-full bg-red-600 text-white cursor-pointer"
                          onClick={(e) =>
                            confirmDeleteConversation(conversation.id, e)
                          }
                        >
                          <FaTrash size={14} />
                        </div>
                      </div>
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
            style={{
              backgroundColor: "var(--primary)",
              maxWidth: "calc(100% - 350px)",
            }}
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
                      {selectedConversation.user._id === "deleted" && (
                        <span className="ml-2 text-sm opacity-70">
                          (account deleted)
                        </span>
                      )}
                    </h3>
                  </div>
                </div>

                {/* Messages */}
                <div
                  className="flex-1 overflow-y-auto p-4"
                  style={{
                    backgroundColor: "var(--primary)",
                    height: "calc(100vh - 140px)",
                  }}
                >
                  {messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full opacity-70">
                      <p>No messages yet. Start the conversation!</p>
                    </div>
                  ) : (
                    messages.map((message) => {
                      // Ensure sender exists, if not, create a fallback
                      const sender = message.sender || {
                        _id: "deleted",
                        username: "Deleted User",
                        profilePicture: null,
                      };

                      return (
                        <div
                          key={message._id}
                          className={`mb-4 max-w-[70%] ${
                            sender._id === currentUserId ? "ml-auto" : "mr-auto"
                          }`}
                          style={{
                            maxWidth: "400px",
                          }}
                        >
                          <div
                            className={`p-3 rounded-lg ${
                              sender._id === currentUserId
                                ? "rounded-tr-none text-white"
                                : "rounded-tl-none"
                            } ${message.isDeleted ? "italic opacity-60" : ""}`}
                            style={{
                              backgroundColor:
                                sender._id === currentUserId
                                  ? "var(--tertiary)"
                                  : "var(--secondary)",
                              wordBreak: "break-word",
                              overflowWrap: "break-word",
                            }}
                          >
                            <div className="flex justify-between items-start">
                              <div className="pr-6 whitespace-pre-wrap">
                                {message.text}
                              </div>
                              <div
                                className="relative ml-2 message-dropdown-container"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleDropdown(message._id);
                                }}
                              >
                                <BsThreeDotsVertical
                                  size={16}
                                  className="cursor-pointer opacity-70 hover:opacity-100"
                                />
                                {activeDropdown === message._id && (
                                  <div
                                    className={`absolute ${
                                      sender._id === currentUserId
                                        ? "right-0"
                                        : "left-0"
                                    } bg-white shadow-md rounded p-1 z-10 mt-1 w-40 text-black message-dropdown-container`}
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    {sender._id === currentUserId ? (
                                      <>
                                        <button
                                          className="flex items-center w-full text-left p-2 hover:bg-gray-100 rounded"
                                          onClick={() =>
                                            deleteMessageForMe(message._id)
                                          }
                                        >
                                          <FaTrash className="mr-2" />
                                          Delete for me
                                        </button>
                                        <button
                                          className="flex items-center w-full text-left p-2 hover:bg-gray-100 rounded"
                                          onClick={() =>
                                            deleteMessageForEveryone(
                                              message._id
                                            )
                                          }
                                        >
                                          <FaTrash className="mr-2" />
                                          Delete for everyone
                                        </button>
                                      </>
                                    ) : (
                                      <button
                                        className="flex items-center w-full text-left p-2 hover:bg-gray-100 rounded"
                                        onClick={() =>
                                          deleteMessageForMe(message._id)
                                        }
                                      >
                                        <FaTrash className="mr-2" />
                                        Delete for me
                                      </button>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          <div
                            className={`text-xs mt-1 opacity-70 ${
                              sender._id === currentUserId ? "text-right" : ""
                            }`}
                          >
                            {formatTime(message.createdAt)}
                          </div>
                        </div>
                      );
                    })
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
                    className="flex-1 p-2 rounded-l-md text-black focus:outline-none"
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

      {/* Confirmation Alert */}
      {showConfirmAlert && (
        <Alert
          message="Are you sure you want to delete this conversation? It will be removed from your inbox only. The other person will still be able to see it."
          onConfirm={() => deleteConversationForMe(conversationToDelete)}
          onCancel={() => {
            setShowConfirmAlert(false);
            setConversationToDelete(null);
          }}
        />
      )}

      {/* Success Alert */}
      {showSuccessAlert && (
        <Alert
          message={successMessage}
          onConfirm={() => setShowSuccessAlert(false)}
          isSuccess={true}
        />
      )}
    </div>
  );
};

export default Messages;
