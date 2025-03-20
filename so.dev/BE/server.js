import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import multer from "multer";

// Import routes & middleware
import { userRouter } from "./routes/userRouter.js";
import { postRouter } from "./routes/postRouter.js";
import { commentRouter } from "./routes/commentRouter.js";
import { messageRouter } from "./routes/messageRouter.js";
import { errorHandler, notFound } from "./middlewares/errors.js";
import { authRouter } from "./routes/authRouter.js";

const app = express();
const upload = multer({ dest: "uploads/" });

app.use(
  cors({
    // origin: "http://localhost:5173",
    origin: "https://final-project-h7mg.onrender.com",
    credentials: true,
  })
);
dotenv.config();
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const PORT = process.env.PORT || 5001;

// API Routes
app.use("/users", userRouter);
app.use("/posts", postRouter);
app.use("/comments", commentRouter);
app.use("/auth", authRouter);
app.use("/messages", messageRouter);

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
