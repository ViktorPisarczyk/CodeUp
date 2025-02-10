import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import multer from 'multer';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import User from './models/User.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const __dirname = dirname(fileURLToPath(import.meta.url));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || '***REMOVED***/')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Multer configuration for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, join(__dirname, 'uploads'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(join(__dirname, 'uploads')));

// Login endpoint
app.post('/api/login', async (req, res) => {
    try {
      const { identifier, password } = req.body;
  
      // Find user by email or nickname
      const user = await User.findOne({
        $or: [
          { email: identifier.toLowerCase() },
          { nickname: identifier }
        ]
      });
  
      if (!user) {
        return res.status(401).json({
          error: 'Invalid credentials'
        });
      }
  
      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({
          error: 'Invalid credentials'
        });
      }
  
      // Return user data without password
      const { password: _, ...userWithoutPassword } = user.toObject();
      res.json(userWithoutPassword);
  
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Server error during login' });
    }
  });
  

// Registration endpoint
app.post('/api/register', upload.single('profilePicture'), async (req, res) => {
  try {
    const {
      nickname,
      firstName,
      lastName,
      email,
      password,
      confirmPassword
    } = req.body;

    // Validation
    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { nickname }]
    });

    if (existingUser) {
      return res.status(400).json({
        error: 'User with this email or nickname already exists'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const user = new User({
      nickname,
      firstName,
      lastName,
      email,
      password: hashedPassword,
      profilePicture: req.file ? `/uploads/${req.file.filename}` : ''
    });

    await user.save();

    // Return success without password
    const { password: _, ...userWithoutPassword } = user.toObject();
    res.status(201).json(userWithoutPassword);

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Server error during registration' });
  }
});

// Create uploads directory if it doesn't exist
import { mkdir } from 'fs/promises';
try {
  await mkdir(join(__dirname, 'uploads'), { recursive: true });
} catch (err) {
  console.error('Error creating uploads directory:', err);
}

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});