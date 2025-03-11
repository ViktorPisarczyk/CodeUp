import { Post } from "../models/postModel.js";
import { Comment } from "../models/commentModel.js";
import { verifyToken } from "../middlewares/jwt.js";
import { User } from "../models/userModel.js";

export const createPost = async (req, res, next) => {
  try {
    const { content, code } = req.body;
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      throw new Error("You must be logged in to post.");
    }

    const decoded_token = await verifyToken(token);
    const user = await User.findById(decoded_token.id);
    if (!user) throw new Error("Invalid user.");

    const imageUrl = req.file ? req.file.path : null; // Get the Cloudinary URL

    const newPost = await Post.create({
      author: user._id,
      content,
      code,
      image: imageUrl,
    });

    res.status(201).json(newPost);
  } catch (error) {
    next(error);
  }
};

export const getPosts = async (req, res, next) => {
  try {
    const posts = await Post.find()
      .populate("author", "username profilePicture")
      .populate({
        path: "comments",
        populate: {
          path: "user",
          select: "username profilePicture",
        },
      })
      .sort({ createdAt: -1 });

    res.status(200).json(posts);
  } catch (error) {
    next(error);
  }
};

export const getPostById = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate("author", "username profilePicture")
      .populate({
        path: "comments",
        populate: { path: "user", select: "username profilePicture" },
      });

    if (!post) {
      return res.status(404).json({ message: "Post not found." });
    }

    res.status(200).json(post);
  } catch (error) {
    next(error);
  }
};

export const updatePost = async (req, res, next) => {
  try {
    const { content, image, code } = req.body;
    const userId = req.token.id;

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found." });
    }

    if (post.author.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "Unauthorized: You can only update your own post." });
    }

    post.content = content || post.content;
    post.image = image || post.image;
    post.code = code || post.code;

    await post.save();

    res.status(200).json(post);
  } catch (error) {
    next(error);
  }
};

export const deletePost = async (req, res, next) => {
  try {
    const userId = req.user;

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found." });
    }

    if (post.author.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "Unauthorized: You can only delete your own post." });
    }

    await Comment.deleteMany({ post: post._id });

    await post.deleteOne();

    res
      .status(200)
      .json({ message: "Post and its comments deleted successfully!" });
  } catch (error) {
    next(error);
  }
};

export const likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      console.error("Post not found!");
      return res.status(404).json({ message: "Post not found" });
    }

    if (!req.user) {
      console.error("User ID is undefined!");
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const userId = req.user.toString();

    const hasLiked = post.likes.includes(userId);

    if (hasLiked) {
      post.likes = post.likes.filter((like) => like !== userId);
    } else {
      post.likes.push(userId);
    }

    await post.save();

    res.json({
      success: true,
    });
  } catch (error) {
    console.error("Error in likePost:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

export const commentOnPost = async (req, res, next) => {
  try {
    const { text } = req.body;
    const userId = req.token.id;

    if (!text) {
      return res.status(400).json({ message: "Comment cannot be empty." });
    }

    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found." });
    }

    const newComment = await Comment.create({
      user: userId,
      post: post._id,
      text,
    });

    post.comments.push(newComment._id);
    await post.save();

    res.status(201).json(newComment);
  } catch (error) {
    next(error);
  }
};
