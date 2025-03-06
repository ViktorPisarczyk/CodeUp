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
import multer from "multer";

export const postRouter = Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage: storage });

postRouter.route("/").post(upload.single("image"), createPost);
postRouter.route("/").get(getPosts);
postRouter
  .route("/:id")
  .get(getPostById)
  .patch(protect, updatePost)
  .delete(protect, deletePost);
postRouter.route("/:id/like").post(protect, likePost);
postRouter.route("/:id/comment").post(protect, commentOnPost);
