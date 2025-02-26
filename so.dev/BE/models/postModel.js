import { Schema, model } from "mongoose";

const postSchema = new Schema(
  {
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    code: {
      type: String,
    },
    image: {
      type: String,
    },
    likes: [],
    comments: [
      {
        type: Schema.Types.ObjectId,
        ref: "Comment",
      },
    ],
  },
  { timestamps: true }
);

export const Post = model("Post", postSchema);
