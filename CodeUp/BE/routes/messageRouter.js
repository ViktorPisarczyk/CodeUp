import express from "express";
import { protect } from "../middlewares/auth.js";
import {
  getUserConversations,
  getConversationMessages,
  getOrCreateConversation,
  sendMessage,
  markMessagesAsRead,
  deleteMessageForMe,
  deleteMessageForEveryone,
  deleteConversationForMe
} from "../controllers/messageController.js";

export const messageRouter = express.Router();

// Apply JWT verification middleware to all routes
messageRouter.use(protect);

// Get all conversations for the current user
messageRouter.get("/conversations", getUserConversations);

// Get or create a conversation with another user
messageRouter.get("/conversations/user/:participantId", getOrCreateConversation);

// Get messages for a specific conversation
messageRouter.get("/conversations/:conversationId/messages", getConversationMessages);

// Send a message in a conversation
messageRouter.post("/conversations/:conversationId/messages", sendMessage);

// Mark messages as read
messageRouter.put("/conversations/:conversationId/read", markMessagesAsRead);

// Delete message for me only
messageRouter.delete("/:messageId/delete-for-me", deleteMessageForMe);

// Delete message for everyone
messageRouter.delete("/:messageId/delete-for-everyone", deleteMessageForEveryone);

// Delete conversation for current user only
messageRouter.delete("/conversations/:conversationId/delete", deleteConversationForMe);
