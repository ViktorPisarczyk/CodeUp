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

// Ensure participants are unique in the conversation
conversationSchema.index({ participants: 1 }, { unique: true });

export const Conversation = model("Conversation", conversationSchema);
