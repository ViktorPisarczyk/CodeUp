import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import postRoutes from './routes/postRoutes.js';
import commentRoutes from './routes/commentRoutes.js';

// import { fileURLToPath } from "url";
// import { dirname, join } from "path";
// import { mkdir } from "fs/promises";
// import multer from "multer";

// Import routes & middleware
import { userRouter } from "./routes/userRouter.js";
// import { recordRouter } from "./routes/recordRouter.js";
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
// app.use("/records", recordRouter);

// Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

// Use Routes
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);

// MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// Start Server
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
