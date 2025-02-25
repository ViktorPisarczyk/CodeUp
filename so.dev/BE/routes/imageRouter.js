import { Router } from "express";
import { upload } from "../config/cloudinaryConfig.js";
import {
  uploadImage,
  getAllImages,
  deleteImage,
} from "../controllers/imageController.js";

export const imageRouter = Router();

imageRouter.route("/").post(upload.single("image"), uploadImage);
imageRouter.route("/").get(getAllImages);
imageRouter.route("/:id").delete(deleteImage);
