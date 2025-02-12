import express from 'express';
import Post from '../models/Post.js';
import Comment from '../models/Comments.js';
import {authMiddleware} from '../middlewares/auth.js';

// Add comment

router.Post('/:id/comment', authMiddleware, async (req, res) => {
    try { 
        const {text, parentCommentId} = req.body;
        const {postId} = req.params;

// Create new comment

const newComment = new Comment({
    text,
    author: req.user.id,
    post: postId,
    parentComment: parentCommentId || null
});

await newComment.save();

// If it's a reply, update parent comment
if (parentCommentId) {
    const parentComment = await Comment.findById(parentCommentId);
    parentComment.replies.push(newComment._id);
    await parentComment.save();
} else {
    const post = await Post.findById(postId);
    post.comments.push(newComment._id);
    await post.save();
}

res.status(201).json(newComment);
} catch (error) {
res.status(500).json({ error: 'Error adding comment' });
}
});

//  Get Comments for a Post
router.get('/:postId', async (req, res) => {
try {
const { postId } = req.params;
const comments = await Comment.find({ post: postId }).populate('author', 'nickname');
res.json(comments);
} catch (error) {
res.status(500).json({ error: 'Error fetching comments' });
}
});

export default router;