import { useState, useEffect, useRef } from "react";
import { jwtDecode } from "jwt-decode";
import AsideMenu from "../components/AsideMenu";
import { IoSend } from "react-icons/io5";

const Messages = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef(null);

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

  // Load conversations
  useEffect(() => {
    // This will be replaced with actual API call
    const mockConversations = [
      {
        id: "1",
        user: {
          _id: "user1",
          username: "Jane Smith",
          profilePicture: "https://randomuser.me/api/portraits/women/65.jpg"
        },
        lastMessage: "Hey, how's your project going?",
        timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 minutes ago
        unread: 2
      },
      {
        id: "2",
        user: {
          _id: "user2",
          username: "John Doe",
          profilePicture: "https://randomuser.me/api/portraits/men/32.jpg"
        },
        lastMessage: "Thanks for your help yesterday!",
        timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // 1 hour ago
        unread: 0
      },
      {
        id: "3",
        user: {
          _id: "user3",
          username: "Alex Johnson",
          profilePicture: "https://randomuser.me/api/portraits/men/44.jpg"
        },
        lastMessage: "Do you have time to review my code?",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), // 3 hours ago
        unread: 1
      }
    ];

    setConversations(mockConversations);
    setIsLoading(false);
  }, []);

  // Load messages when a conversation is selected
  useEffect(() => {
    if (selectedConversation) {
      // This will be replaced with actual API call
      const mockMessages = [
        {
          id: "m1",
          senderId: currentUserId,
          text: "Hi there!",
          timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString() // 30 minutes ago
        },
        {
          id: "m2",
          senderId: selectedConversation.user._id,
          text: "Hey! How are you?",
          timestamp: new Date(Date.now() - 1000 * 60 * 25).toISOString() // 25 minutes ago
        },
        {
          id: "m3",
          senderId: currentUserId,
          text: "I'm good, working on that React project we discussed.",
          timestamp: new Date(Date.now() - 1000 * 60 * 20).toISOString() // 20 minutes ago
        },
        {
          id: "m4",
          senderId: selectedConversation.user._id,
          text: "That sounds great! How's it going so far?",
          timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString() // 15 minutes ago
        },
        {
          id: "m5",
          senderId: currentUserId,
          text: "Making progress! I've got the basic components set up.",
          timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString() // 10 minutes ago
        },
        {
          id: "m6",
          senderId: selectedConversation.user._id,
          text: selectedConversation.lastMessage,
          timestamp: selectedConversation.timestamp
        }
      ];

      setMessages(mockMessages);
      
      // Mark as read (will be implemented with API)
      setConversations(prevConversations => 
        prevConversations.map(conv => 
          conv.id === selectedConversation.id 
            ? { ...conv, unread: 0 } 
            : conv
        )
      );
    }
  }, [selectedConversation, currentUserId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    // Add message to UI immediately (optimistic update)
    const newMsg = {
      id: `temp-${Date.now()}`,
      senderId: currentUserId,
      text: newMessage,
      timestamp: new Date().toISOString()
    };

    setMessages([...messages, newMsg]);

    // Update conversation with new last message
    setConversations(prevConversations => 
      prevConversations.map(conv => 
        conv.id === selectedConversation.id 
          ? { 
              ...conv, 
              lastMessage: newMessage,
              timestamp: new Date().toISOString()
            } 
          : conv
      )
    );

    // Clear input
    setNewMessage("");

    // This is where you would send the message to the API
    // For now, we're just updating the UI
  };

  const filteredConversations = conversations.filter(conversation => 
    conversation.user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Format timestamp
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInDays === 1) {
      return 'Yesterday';
    } else if (diffInDays < 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: "var(--primary)" }}>
      <AsideMenu />
      <div className="flex-1 flex flex-col">
        <div className="flex h-screen">
          {/* Conversations List */}
          <div className="w-1/3 border-r" style={{ backgroundColor: "var(--secondary)" }}>
            <div className="p-4 border-b" style={{ borderColor: "var(--quaternary)" }}>
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
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2" style={{ borderColor: "var(--tertiary)" }}></div>
                </div>
              ) : filteredConversations.length > 0 ? (
                filteredConversations.map(conversation => (
                  <div
                    key={conversation.id}
                    className={`flex items-center p-4 border-b cursor-pointer hover:opacity-80 ${
                      selectedConversation?.id === conversation.id ? 'bg-opacity-20' : ''
                    }`}
                    style={{ 
                      borderColor: "var(--quaternary)",
                      backgroundColor: selectedConversation?.id === conversation.id ? "var(--quaternary)" : "transparent"
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
                        <h3 className="font-semibold truncate">{conversation.user.username}</h3>
                        <span className="text-xs opacity-70">{formatTime(conversation.timestamp)}</span>
                      </div>
                      <p className={`text-sm truncate ${conversation.unread > 0 ? 'font-semibold' : 'opacity-70'}`}>
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
          <div className="w-2/3 flex flex-col" style={{ backgroundColor: "var(--primary)" }}>
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b flex items-center" style={{ backgroundColor: "var(--secondary)", borderColor: "var(--quaternary)" }}>
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
                    <h3 className="font-semibold">{selectedConversation.user.username}</h3>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4" style={{ backgroundColor: "var(--primary)" }}>
                  {messages.map(message => (
                    <div
                      key={message.id}
                      className={`mb-4 max-w-[70%] ${
                        message.senderId === currentUserId
                          ? 'ml-auto'
                          : 'mr-auto'
                      }`}
                    >
                      <div
                        className={`p-3 rounded-lg ${
                          message.senderId === currentUserId
                            ? 'rounded-tr-none text-white'
                            : 'rounded-tl-none'
                        }`}
                        style={{ 
                          backgroundColor: message.senderId === currentUserId 
                            ? "var(--tertiary)" 
                            : "var(--secondary)" 
                        }}
                      >
                        {message.text}
                      </div>
                      <div
                        className={`text-xs mt-1 opacity-70 ${
                          message.senderId === currentUserId ? 'text-right' : ''
                        }`}
                      >
                        {formatTime(message.timestamp)}
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <form 
                  onSubmit={handleSendMessage}
                  className="p-4 border-t flex items-center"
                  style={{ backgroundColor: "var(--secondary)", borderColor: "var(--quaternary)" }}
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
                  <h3 className="text-xl font-semibold mb-2">Select a conversation</h3>
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
