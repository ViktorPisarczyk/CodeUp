import { Image } from "../models/imageModel.js";
import { cloudinary } from "../config/cloudinaryConfig.js";

export const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image uploaded" });
    }
      // Upload image to Cloudinary
      const result = await cloudinary.uploader.upload(req.file.path);
    // Create new image entry in database
    const newImage = new Image({
      imageUrl:result.secure_url,
      cloudinaryId:result.public_id
    });

    await newImage.save();
    res.status(201).json({ imageUrl: newImage.imageUrl });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error uploading image", error: error.message });
  }
};

export const getAllImages = async (req, res) => {
  try {
    const images = await Image.find();
    res.status(200).json(images);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error getting images", error: error.message });
  }
};

export const deleteImage = async (req, res) => {
  try {
    const { id } = req.params;

    // Find image in DB
    const image = await Image.findById(id);
    if (!image) {
      return res.status(404).json({ message: "Image not found" });
    }

    // Extract Cloudinary public_id from URL
    const publicId = image.imageUrl.split("/").pop().split(".")[0];

    // Delete image from Cloudinary
    await cloudinary.uploader.destroy(publicId);

    // Remove from database
    await Image.findByIdAndDelete(id);

    res.status(200).json({ message: "Image deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting image", error: error.message });
  }
};
