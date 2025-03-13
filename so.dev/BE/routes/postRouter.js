import { Router } from "express";
import {
  createPost,
  getPosts,
  getPostById,
  updatePost,
  deletePost,
  likePost,
  commentOnPost,
} from "../controllers/postController.js";
import { protect } from "../middlewares/auth.js";
import { uploadPostImage, uploadMultiplePostImages } from "../config/cloudinaryConfig.js";

export const postRouter = Router();

// Support both single image and multiple images
postRouter.route("/").post(uploadMultiplePostImages, createPost);
postRouter.route("/").get(getPosts);
postRouter
  .route("/:id")
  .get(getPostById)
  .patch(protect, updatePost)
  .delete(protect, deletePost);
postRouter.route("/:id/like").post(protect, likePost);
postRouter.route("/:id/comment").post(protect, commentOnPost);
