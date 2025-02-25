import { Comment } from "../models/commentModel.js";
import { Post } from "../models/postModel.js";

export const createComment = async (req, res, next) => {
  try {
    const { post, text } = req.body;
    const userId = req.token.id;

    if (!post || !text) {
      return res.status(400).json({ message: "Post ID and text are required" });
    }

    const newComment = await Comment.create({
      post: post,
      user: userId,
      text,
    });

    // Add the comment ID to the post's comments array
    await Post.findByIdAndUpdate(post, {
      $push: { comments: newComment._id },
    });

    res.status(201).json(newComment);
  } catch (error) {
    next(error);
  }
};

export const getComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id).populate(
      "user",
      "username"
    );

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    res.status(200).json(comment);
  } catch (error) {
    next(error);
  }
};

export const getAllComments = async (req, res, next) => {
  try {
    const comments = await Comment.find({ post: req.params.post }).populate(
      "user",
      "username"
    );

    res.status(200).json(comments);
  } catch (error) {
    next(error);
  }
};

export const updateComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Check if the user is the owner or an admin
    if (
      comment.user.toString() !== req.token.id &&
      req.token.role !== "admin"
    ) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    comment.text = req.body.text || comment.text;
    await comment.save();

    res.status(200).json(comment);
  } catch (error) {
    next(error);
  }
};

export const deleteComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Check if the user is the owner or an admin
    if (
      comment.user.toString() !== req.token.id &&
      req.token.role !== "admin"
    ) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await comment.deleteOne();

    // Remove the comment reference from the Post model
    await Post.findByIdAndUpdate(comment.post, {
      $pull: { comments: comment._id },
    });

    res.status(200).json({ message: "Comment deleted successfully" });
  } catch (error) {
    next(error);
  }
};
