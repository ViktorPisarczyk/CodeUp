import { Router } from "express";
import { upload } from "../config/cloudinaryConfig.js";
import {
  uploadImage,
  uploadProfilePicture,
  getAllImages,
  deleteImage,
} from "../controllers/imageController.js";
import { protect } from "../middlewares/auth.js";

export const imageRouter = Router();

imageRouter.route("/").post(upload.single("image"), uploadImage);
imageRouter.route("/").get(getAllImages);
imageRouter
  .route("/upload")
  .post(protect, upload.single("profilePicture"), uploadProfilePicture);
imageRouter.route("/:id").delete(deleteImage);
