import { Router } from "express";
import {
  requestPasswordReset,
  resetPassword,
} from "../controllers/authController.js";

export const authRouter = Router();

authRouter.route("/reset-password").post(requestPasswordReset);
authRouter.route("/new-password/:token").post(resetPassword); // Update password
