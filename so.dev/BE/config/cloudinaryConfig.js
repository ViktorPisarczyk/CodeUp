import "dotenv/config";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Storage for Post Images
const postStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "uploads", // Folder for post images
    allowedFormats: ["jpeg", "png", "jpg"],
  },
});

// Storage for Profile Pictures
const profileStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "profilePictures", // Separate folder for profile pictures
    allowedFormats: ["jpeg", "png", "jpg"],
  },
});

export const uploadPostImage = multer({ storage: postStorage });
export const uploadMultiplePostImages = multer({ storage: postStorage }).array(
  "images",
  3
);
export const uploadProfileImage = multer({ storage: profileStorage });

export { cloudinary };

// API Endpoint to Handle Image Uploads
export default async function handler(req, res) {
  try {
    const { image, type } = JSON.parse(req.body);
    const folder = type === "profile" ? "profilePictures" : "uploads";

    const results = await cloudinary.uploader.upload(image, {
      folder,
    });

    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ error: "Image upload failed", details: error });
  }
}
