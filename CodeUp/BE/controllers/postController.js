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

    // Handle multiple images
    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      imageUrls = req.files.map((file) => file.path);
    }

    // For backward compatibility
    const imageUrl = req.file ? req.file.path : null;

    const newPost = await Post.create({
      author: user._id,
      content,
      code,
      image: imageUrl || (imageUrls.length > 0 ? imageUrls[0] : null), // For backward compatibility
      images: imageUrls,
    });

    res.status(201).json(newPost);
  } catch (error) {
    next(error);
  }
};

export const getPosts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    const posts = await Post.find()
      .populate("author", "username profilePicture")
      .populate({
        path: "comments",
        populate: {
          path: "user",
          select: "username profilePicture",
        },
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalPosts = await Post.countDocuments();
    const hasMore = totalPosts > skip + posts.length;

    res.status(200).json({
      posts,
      hasMore,
      currentPage: page,
      totalPages: Math.ceil(totalPosts / limit),
    });
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
    const { content, code, existingImages } = req.body;
    const userId = req.user;

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found." });
    }

    if (post.author.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "Unauthorized: You can only update your own post." });
    }

    // Update text content and code
    post.content = content || post.content;
    post.code = code !== undefined ? code : post.code;

    // Handle image updates
    let updatedImages = [];
    
    // 1. Handle existing images if provided
    if (existingImages) {
      try {
        const parsedExistingImages = typeof existingImages === 'string' 
          ? JSON.parse(existingImages) 
          : existingImages;
        
        if (Array.isArray(parsedExistingImages)) {
          updatedImages = [...parsedExistingImages];
        } else if (parsedExistingImages) {
          updatedImages = [parsedExistingImages];
        }
      } catch (error) {
        console.error("Error parsing existing images:", error);
      }
    }
    
    // 2. Add newly uploaded images if any
    if (req.files && req.files.length > 0) {
      const newImageUrls = req.files.map(file => file.path);
      updatedImages = [...updatedImages, ...newImageUrls];
    }
    
    // 3. Update the post with the final image list
    post.images = updatedImages;
    
    // 4. Set the main image (for backward compatibility)
    post.image = updatedImages.length > 0 ? updatedImages[0] : null;

    // Save the updated post
    const updatedPost = await post.save();
    
    // Populate author information for the response
    await updatedPost.populate("author", "username profilePicture");

    res.status(200).json(updatedPost);
  } catch (error) {
    console.error("Error updating post:", error);
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
    const userId = req.user;

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

    // Populate user info for the response
    await newComment.populate("user", "username profilePicture");

    res.status(201).json(newComment);
  } catch (error) {
    next(error);
  }
};

export const getPostsByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const posts = await Post.find({ author: userId })
      .populate("author", "username profilePicture") // Populate post author
      .populate({
        path: "comments", // Populate comments
        populate: {
          path: "user", // Populate comment author (since it's 'user' in the Comment model)
          select: "username profilePicture",
        },
      })
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (error) {
    console.error("Error fetching user posts:", error.message, error.stack);
    res.status(500).json({ message: "Error fetching user posts" });
  }
};
