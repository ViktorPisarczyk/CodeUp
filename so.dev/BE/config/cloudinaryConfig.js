import "dotenv/config";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer Storage for Cloudinary
export const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "uploads",
    allowedFormats: ["jpeg", "png", "jpg"],
  },
});
/* const storage = multerStorageCloudinary({
  cloudinary: cloudinary,
  folder: "Home", // Folder in Cloudinary (optional)
  allowedFormats: ["jpg", "jpeg", "png", "gif", "webp", "svg"], // Accepted formats
}); */

export const upload = multer({ storage });
export { cloudinary };
export default async function handler (req, res) {
 const {image} = JSON.parse(req.body);
 const results = await cloudinary.uploader.upload(image); 
  res.status(200).json(results);
}

