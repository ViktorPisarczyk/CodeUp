import express  from 'express';
import Post from '../models/Post.js';
import Comment from '../models/Comments.js';
import {authMiddleware} from '../middlewares/auth.js';

const router = express.Router();

//Create post

router.post ('/', authMiddleware, async (req, res) => { 
    try {
        const {tittle,code,description} = req.body;
        const newPost = new Post({tittle, code , description, author: req.user._id});
        await newPost.save();
        res.status(201).json(newPost);
    } catch (error) {
        res.status(500).json({message: 'Error creating post'});
    }
});

//Get all posts
router.get('/', async (req, res) => {
    try {
        const posts = await Post.find().populate('author', 'username');
        res.status(200).json(posts);
    } catch (error) {
        res.status(500).json({message: 'Error getting posts'});
    }
});
export default router;