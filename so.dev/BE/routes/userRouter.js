import { Router } from "express";
import {
  deleteUser,
  getSingleUser,
  getUsers,
  login,
  logout,
  signup,
  updateUser,
} from "../controllers/userController.js";
import { protect } from "../middlewares/auth.js";
import { uploadProfileImage } from "../config/cloudinaryConfig.js";

export const userRouter = Router();

userRouter.route("/signup").post(signup);
userRouter.route("/login").post(login);
userRouter.route("/logout").post(logout);
userRouter.route("/").get(getUsers);
userRouter
  .route("/:id")
  .get(protect, getSingleUser)
  .delete(protect, deleteUser)
  .patch(protect, uploadProfileImage.single("profilePicture"), updateUser);
