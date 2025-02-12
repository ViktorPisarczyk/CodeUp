import { Post } from "../models/postModel.js";
import { User } from "../models/userModel.js";

export const createPost = async (req, res, next) => {
  try {
    const { content, image } = req.body;
    const userId = req.user.id;

    if (!content) {
      const error = new Error("Content is required.");
      error.status = 400;
      throw error;
    }

    const newPost = await Post.create({
      author: userId,
      content,
      image,
    });

    res.status(201).send(newPost);
  } catch (error) {
    next(error);
  }
};

export const getPosts = async (req, res, next) => {
  try {
    const posts = await Post.find()
      .populate("author", "username profilePicture")
      .populate("comments.user", "username profilePicture")
      .sort({ createdAt: -1 });

    res.status(200).send(posts);
  } catch (error) {
    next(error);
  }
};

export const getPostById = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate("author", "username profilePicture")
      .populate("comments.user", "username profilePicture");

    if (!post) {
      const error = new Error("Post not found.");
      error.status = 404;
      throw error;
    }

    res.status(200).send(post);
  } catch (error) {
    next(error);
  }
};

export const updatePost = async (req, res, next) => {
  try {
    const { content, image } = req.body;
    const userId = req.user.id;

    const post = await Post.findById(req.params.id);

    if (!post) {
      const error = new Error("Post not found.");
      error.status = 404;
      throw error;
    }

    if (post.author.toString() !== userId) {
      const error = new Error(
        "Unauthorized: You can only update your own post."
      );
      error.status = 403;
      throw error;
    }

    post.content = content || post.content;
    post.image = image || post.image;

    await post.save();

    res.status(200).send(post);
  } catch (error) {
    next(error);
  }
};

export const deletePost = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const post = await Post.findById(req.params.id);

    if (!post) {
      const error = new Error("Post not found.");
      error.status = 404;
      throw error;
    }

    if (post.author.toString() !== userId) {
      const error = new Error(
        "Unauthorized: You can only delete your own post."
      );
      error.status = 403;
      throw error;
    }

    await post.deleteOne();
    res.status(200).send({ message: "Post deleted successfully!" });
  } catch (error) {
    next(error);
  }
};

export const likePost = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const post = await Post.findById(req.params.id);

    if (!post) {
      const error = new Error("Post not found.");
      error.status = 404;
      throw error;
    }

    if (post.likes.includes(userId)) {
      post.likes = post.likes.filter((id) => id.toString() !== userId);
    } else {
      post.likes.push(userId);
    }

    await post.save();
    res.status(200).send(post);
  } catch (error) {
    next(error);
  }
};

export const commentOnPost = async (req, res, next) => {
  try {
    const { text } = req.body;
    const userId = req.user.id;

    if (!text) {
      const error = new Error("Comment cannot be empty.");
      error.status = 400;
      throw error;
    }

    const post = await Post.findById(req.params.id);
    if (!post) {
      const error = new Error("Post not found.");
      error.status = 404;
      throw error;
    }

    const newComment = { user: userId, text };
    post.comments.push(newComment);
    await post.save();

    res.status(201).send(post);
  } catch (error) {
    next(error);
  }
};
