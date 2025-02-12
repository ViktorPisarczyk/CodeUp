
import mongoose from "mongoose";

const CommentSchema = new mongoose.Schema({
    post: {type: mongoose.Schema.Types.ObjectId, ref: "Post", required: true},
    author: {type: mongoose.Schema.Types.ObjectId, ref: "User", required: true},
    text: {type: String, required: true},
    parantComment: {type: mongoose.Schema.Types.ObjectId, ref: "Comment, default: null"},
    replies: [{type: mongoose.Schema.Types.ObjectId, ref: "Comment"}],
}, {timestamps: true});

export default mongoose.model("Comment", CommentSchema);