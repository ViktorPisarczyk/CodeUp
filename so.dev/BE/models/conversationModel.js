import { Schema, model } from "mongoose";

const conversationSchema = new Schema(
  {
    participants: [{
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    }],
    lastMessage: {
      type: Schema.Types.ObjectId,
      ref: "Message"
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

// DO NOT add a unique index on participants
// This was causing issues with conversation creation

// Add a pre-save hook to always sort participants for consistency
conversationSchema.pre('save', function(next) {
  // Sort participants by their string representation
  if (this.participants && this.participants.length > 0) {
    this.participants.sort();
  }
  next();
});

export const Conversation = model("Conversation", conversationSchema);
