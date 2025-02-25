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

export const postRouter = Router();

postRouter.route("/").post(createPost);
postRouter.route("/").get(getPosts);
postRouter
  .route("/:id")
  .get(getPostById)
  .patch(protect, updatePost)
  .delete(protect, deletePost);
postRouter.route("/:id/like").post(protect, likePost);
postRouter.route("/:id/comment").post(protect, commentOnPost);
