import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IoClose } from "react-icons/io5";
import { IoSend } from "react-icons/io5";
import Alert from "./Alert";
import PropTypes from "prop-types";

const ChatBot = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState([
    {
      text: "Hello! I'm your AI assistant. How can I help you today?",
      isBot: true,
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const messagesEndRef = useRef(null);

  // Scroll to bottom of messages when new messages are added
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    // Add user message
    const userMessage = { text: input, isBot: false };
    setMessages((prev) => [...prev, userMessage]);
    
    const userInput = input;
    setInput("");
    setIsLoading(true);

    try {
      // Call the Together AI API
      const response = await fetch("https://api.together.xyz/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${import.meta.env.VITE_TOGETHER_API_KEY || ""}`,
        },
        body: JSON.stringify({
          model: "mistralai/Mixtral-8x7B-Instruct-v0.1",
          messages: [
            {
              role: "system",
              content: "You are a helpful assistant for a programming Q&A platform called so.dev. Keep your answers concise, technical, and focused on programming topics. Provide code examples when appropriate."
            },
            {
              role: "user",
              content: userInput
            }
          ],
          max_tokens: 500,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      
      // Add bot response
      setMessages((prev) => [
        ...prev,
        {
          text: data.choices[0].message.content.trim(),
          isBot: true,
        },
      ]);
    } catch (error) {
      console.error("Error calling Together AI API:", error);
      setError("Sorry, I couldn't process your request. Please try again later.");
      setShowErrorAlert(true);
      
      // Add fallback response
      setMessages((prev) => [
        ...prev,
        {
          text: "I'm having trouble connecting to my knowledge base right now. Please try again in a moment.",
          isBot: true,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleErrorAlertClose = () => {
    setShowErrorAlert(false);
    setError(null);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-20 right-4 w-80 h-96 bg-(--secondary) rounded-lg shadow-lg flex flex-col"
        >
          {showErrorAlert && (
            <Alert
              message={error || "An error occurred. Please try again."}
              onConfirm={handleErrorAlertClose}
              isSuccess={false}
            />
          )}
          
          {/* Header */}
          <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
            <h3 className="text-lg font-semibold">AI Help Assistant</h3>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
            >
              <IoClose size={20} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`mb-4 ${message.isBot ? "text-left" : "text-right"}`}
              >
                <div
                  className={`inline-block p-3 rounded-lg ${
                    message.isBot ? "bg-(--tertiary)" : "bg-(--primary)"
                  }`}
                >
                  {message.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="mb-4 text-left">
                <div className="inline-block p-3 rounded-lg bg-(--tertiary)">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 rounded-full bg-gray-300 animate-bounce"></div>
                    <div className="w-2 h-2 rounded-full bg-gray-300 animate-bounce delay-100"></div>
                    <div className="w-2 h-2 rounded-full bg-gray-300 animate-bounce delay-200"></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t dark:border-gray-700">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSend()}
                placeholder="Type your message..."
                className="flex-1 p-2 border bg-(--primary) rounded-lg focus:outline-none focus:border-blue-500"
                disabled={isLoading}
              />
              <button
                onClick={handleSend}
                className="p-2 text-white rounded-lg hover:opacity-80"
                style={{ backgroundColor: "var(--tertiary)" }}
                disabled={isLoading}
              >
                <IoSend size={20} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

ChatBot.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default ChatBot;
