import { Router } from "express";
import {
  createPost,
  getPosts,
  getPostById,
  getPostsByUser,
  updatePost,
  deletePost,
  likePost,
  commentOnPost,
} from "../controllers/postController.js";
import { protect } from "../middlewares/auth.js";
import { uploadMultiplePostImages } from "../config/cloudinaryConfig.js";

export const postRouter = Router();

postRouter.route("/").post(uploadMultiplePostImages, createPost);
postRouter.route("/").get(getPosts);

postRouter.route("/user/:userId").get(getPostsByUser);

postRouter
  .route("/:id")
  .get(getPostById)
  .patch(protect, updatePost)
  .delete(protect, deletePost);

postRouter.route("/:id/like").post(protect, likePost);
postRouter.route("/:id/comment").post(protect, commentOnPost);
