import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";

// import { fileURLToPath } from "url";
// import { dirname, join } from "path";
// import { mkdir } from "fs/promises";
// import multer from "multer";

// Import routes & middleware
import { userRouter } from "./routes/userRouter.js";
import { postRouter } from "./routes/postRouter.js";
import { commentRouter } from "./routes/commentRouter.js";
import { imageRouter } from "./routes/imageRouter.js";
import { errorHandler, notFound } from "./middlewares/errors.js";

const app = express();

dotenv.config();
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 5000;

// const __dirname = dirname(fileURLToPath(import.meta.url));

// Serve uploaded files statically
// app.use("/uploads", express.static(join(__dirname, "uploads")));

// API Routes
app.use("/users", userRouter);
app.use("/posts", postRouter);
app.use("/comments", commentRouter);
app.use("/images", imageRouter);

// Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

// MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// Start Server
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
