import { Conversation } from "../models/conversationModel.js";
import { Message } from "../models/messageModel.js";
import { User } from "../models/userModel.js";
import mongoose from "mongoose";

// Get all conversations for a user
export const getUserConversations = async (req, res) => {
  try {
    // Fix: Access user ID correctly from the JWT token
    const userId = req.user;

    // Find all conversations where the user is a participant
    // and the conversation is not deleted for this user
    const conversations = await Conversation.find({
      participants: userId,
      deletedFor: { $ne: userId } // Exclude conversations deleted by this user
    })
    .populate({
      path: "participants",
      select: "username profilePicture _id",
      match: { _id: { $ne: userId } } // Only populate other participants
    })
    .populate({
      path: "lastMessage",
      select: "text createdAt read sender"
    })
    .sort({ updatedAt: -1 }); // Sort by most recent activity

    // Format the conversations for the client
    const formattedConversations = await Promise.all(
      conversations.map(async (conversation) => {
        // Get unread count
        const unreadCount = await Message.countDocuments({
          conversationId: conversation._id,
          read: false,
          sender: { $ne: userId }
        });

        // Get the other participant (for 1-on-1 conversations)
        const otherParticipant = conversation.participants[0];

        return {
          id: conversation._id,
          user: otherParticipant,
          lastMessage: conversation.lastMessage ? conversation.lastMessage.text : null,
          timestamp: conversation.lastMessage ? conversation.lastMessage.createdAt : conversation.updatedAt,
          unread: unreadCount
        };
      })
    );

    res.status(200).json(formattedConversations);
  } catch (error) {
    console.error("Error getting conversations:", error);
    res.status(500).json({ message: "Failed to get conversations" });
  }
};

// Get messages for a specific conversation
export const getConversationMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user;

    // Verify the user is part of this conversation
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: userId
    });

    if (!conversation) {
      return res.status(403).json({ message: "Not authorized to view this conversation" });
    }

    // Get messages that haven't been deleted for this user
    const messages = await Message.find({ 
      conversationId,
      deletedFor: { $ne: userId } // Exclude messages deleted for this user
    })
      .sort({ createdAt: 1 })
      .populate({
        path: "sender",
        select: "username profilePicture _id"
      });

    // Mark messages as read
    await Message.updateMany(
      { 
        conversationId,
        sender: { $ne: userId },
        read: false
      },
      { read: true }
    );

    res.status(200).json(messages);
  } catch (error) {
    console.error("Error getting messages:", error);
    res.status(500).json({ message: "Failed to get messages" });
  }
};

// Create or get a conversation between two users
export const getOrCreateConversation = async (req, res) => {
  try {
    const { participantId } = req.params;
    // Fix: Access user ID correctly from the JWT token
    const userId = req.user;

    console.log(`Creating/getting conversation between ${userId} and ${participantId}`);

    // Ensure we're not creating a conversation with ourselves
    if (participantId === userId) {
      return res.status(400).json({ message: "Cannot create conversation with yourself" });
    }

    // Check if participant exists
    const participant = await User.findById(participantId);
    if (!participant) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find existing conversation with these participants
    const conversations = await Conversation.find({
      participants: { 
        $all: [
          new mongoose.Types.ObjectId(userId),
          new mongoose.Types.ObjectId(participantId)
        ]
      }
    }).populate({
      path: "participants",
      select: "username profilePicture _id",
      match: { _id: { $ne: userId } }
    });

    console.log(`Found ${conversations.length} existing conversations`);
    
    let conversation;
    
    // If conversations exist, use the first one
    if (conversations.length > 0) {
      conversation = conversations[0];
      console.log(`Using existing conversation: ${conversation._id}`);
    } else {
      // Create a new conversation
      conversation = new Conversation({
        participants: [
          new mongoose.Types.ObjectId(userId),
          new mongoose.Types.ObjectId(participantId)
        ],
        updatedAt: new Date()
      });
      
      await conversation.save();
      console.log(`Created new conversation: ${conversation._id}`);
      
      // Populate the new conversation
      conversation = await Conversation.findById(conversation._id)
        .populate({
          path: "participants",
          select: "username profilePicture _id",
          match: { _id: { $ne: userId } }
        });
    }

    // Ensure we have a populated participant
    if (!conversation.participants || conversation.participants.length === 0) {
      console.log("No participants found, repopulating");
      
      // Try to repopulate
      conversation = await Conversation.findById(conversation._id)
        .populate({
          path: "participants",
          select: "username profilePicture _id",
          match: { _id: { $ne: userId } }
        });
        
      if (!conversation.participants || conversation.participants.length === 0) {
        return res.status(500).json({ message: "Failed to populate conversation participants" });
      }
    }

    res.status(200).json({
      id: conversation._id,
      user: conversation.participants[0],
      lastMessage: null,
      timestamp: conversation.updatedAt,
      unread: 0
    });
  } catch (error) {
    console.error("Error creating conversation:", error);
    res.status(500).json({ message: "Failed to create conversation: " + error.message });
  }
};

// Send a message
export const sendMessage = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { conversationId } = req.params;
    const { text } = req.body;
    // Fix: Access user ID correctly from the JWT token
    const userId = req.user;

    if (!text || !text.trim()) {
      return res.status(400).json({ message: "Message text is required" });
    }

    // Verify the user is part of this conversation
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: userId
    });

    if (!conversation) {
      return res.status(403).json({ message: "Not authorized to send messages in this conversation" });
    }

    // Create the message
    const message = await Message.create([{
      conversationId,
      sender: userId,
      text: text.trim(),
      read: false
    }], { session });

    // Update the conversation's lastMessage and updatedAt
    await Conversation.findByIdAndUpdate(
      conversationId,
      {
        lastMessage: message[0]._id,
        updatedAt: new Date()
      },
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    // Populate sender info before sending response
    const populatedMessage = await Message.findById(message[0]._id)
      .populate({
        path: "sender",
        select: "username profilePicture _id"
      });

    res.status(201).json(populatedMessage);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Error sending message:", error);
    res.status(500).json({ message: "Failed to send message" });
  }
};

// Mark messages as read
export const markMessagesAsRead = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user;

    // Verify the user is part of this conversation
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: userId
    });

    if (!conversation) {
      return res.status(403).json({ message: "Not authorized to access this conversation" });
    }

    // Mark all messages from other participants as read
    await Message.updateMany(
      { 
        conversationId,
        sender: { $ne: userId },
        read: false
      },
      { read: true }
    );

    res.status(200).json({ message: "Messages marked as read" });
  } catch (error) {
    console.error("Error marking messages as read:", error);
    res.status(500).json({ message: "Failed to mark messages as read" });
  }
};

// Delete message for me only
export const deleteMessageForMe = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user;

    // Find the message
    const message = await Message.findById(messageId);
    
    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    // Verify the user is part of the conversation
    const conversation = await Conversation.findOne({
      _id: message.conversationId,
      participants: userId
    });

    if (!conversation) {
      return res.status(403).json({ message: "Not authorized to delete this message" });
    }

    // Add user to deletedFor array if not already there
    if (!message.deletedFor.includes(userId)) {
      message.deletedFor.push(userId);
      await message.save();
    }

    res.status(200).json({ message: "Message deleted for you" });
  } catch (error) {
    console.error("Error deleting message:", error);
    res.status(500).json({ message: "Failed to delete message" });
  }
};

// Delete message for everyone
export const deleteMessageForEveryone = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user;

    // Find the message
    const message = await Message.findById(messageId);
    
    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    // Verify the user is the sender of the message
    if (message.sender.toString() !== userId) {
      return res.status(403).json({ message: "Only the sender can delete a message for everyone" });
    }

    // Set message as deleted for everyone
    message.deletedForEveryone = true;
    message.text = "This message was deleted";
    await message.save();

    res.status(200).json({ message: "Message deleted for everyone" });
  } catch (error) {
    console.error("Error deleting message for everyone:", error);
    res.status(500).json({ message: "Failed to delete message for everyone" });
  }
};

// Delete conversation for current user only
export const deleteConversationForMe = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user;

    // Verify the user is part of this conversation
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: userId
    });

    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found or you are not a participant" });
    }

    // We don't actually delete the conversation, just hide it for this user
    // by adding them to a 'deletedFor' array
    await Conversation.findByIdAndUpdate(
      conversationId,
      { $addToSet: { deletedFor: userId } }
    );

    // Mark all messages in this conversation as deleted for this user
    await Message.updateMany(
      { conversationId },
      { $addToSet: { deletedFor: userId } }
    );

    res.status(200).json({ message: "Conversation deleted for you" });
  } catch (error) {
    console.error("Error deleting conversation:", error);
    res.status(500).json({ message: "Failed to delete conversation" });
  }
};
