import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import multer from 'multer';
import cookieParser from 'cookie-parser';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { mkdir } from 'fs/promises';

// Import routes & middleware
import { userRouter } from './routes/userRouter.js';
import { recordRouter } from './routes/recordRouter.js';
import { errorHandler, notFound } from './middlewares/error.js';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;
const __dirname = dirname(fileURLToPath(import.meta.url));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Middleware
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());


// Serve uploaded files statically
app.use('/uploads', express.static(join(__dirname, 'uploads')));

// API Routes
app.use('/users', userRouter);
app.use('/records', recordRouter);

// Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

// Start Server
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));