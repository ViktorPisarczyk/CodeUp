import { useState, useEffect } from "react";
import PropTypes from "prop-types";

const API_URL = "http://localhost:5001";

export default function Post({ post, onPostUpdate }) {
  const [newComment, setNewComment] = useState("");
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [likedPosts, setLikedPosts] = useState({});

  // Initialize like status when post changes
  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (userId && post.likes) {
      setLikedPosts((prev) => ({
        ...prev,
        [post._id]: post.likes.includes(userId),
      }));
    }
  }, [post._id, post.likes]);

  const handleLike = async (postId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("You must be logged in to like posts.");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/posts/${postId}/like`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to like the post");
      }

      setLikedPosts((prev) => ({
        ...prev,
        [postId]: !prev[postId],
      }));

      onPostUpdate();
    } catch (error) {
      console.error("Error while liking post:", error);
      alert("Failed to update like status. Please try again.");
    }
  };

  const handleCommentSubmit = async (postId, e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");

    if (!token) {
      alert("You must be logged in to comment.");
      return;
    }

    if (!newComment.trim()) {
      alert("Please enter a comment.");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          text: newComment,
          post: postId,
          user: userId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add comment");
      }

      setNewComment("");
      setShowCommentForm(false);
      onPostUpdate();
    } catch (error) {
      console.error("Error adding comment:", error);
      alert("Failed to add comment. Please try again.");
    }
  };

  return (
    <div
      className="rounded-lg shadow-md p-4"
      style={{ backgroundColor: "var(--secondary)" }}
    >
      <div className="flex items-center mb-2">
        <div className="w-10 h-10 rounded-full bg-blue-400 flex items-center justify-center text-white overflow-hidden">
          {post.author?.profilePicture ? (
            <img
              src={post.author.profilePicture}
              alt="Profile"
              className="w-full h-full object-cover rounded-full"
            />
          ) : (
            <span>
              {post.author?.username
                ? post.author.username[0].toUpperCase()
                : "?"}
            </span>
          )}
        </div>
        <span className="ml-2 font-medium">
          {post.author ? post.author.username : "Unknown User"}
        </span>
      </div>

      <p>{post.content}</p>
      {post.image && (
        <img
          src={post.image}
          alt="Post content"
          className="rounded-md w-full mb-4"
        />
      )}

      <div className="flex items-center space-x-4">
        <button onClick={() => handleLike(post._id)}>
          {likedPosts[post._id] ? "🩶" : "❤️"} {post.likes.length}
        </button>
        <button onClick={() => setShowCommentForm(!showCommentForm)}>
          💬 {post.comments?.length || 0}
        </button>
      </div>

      {showCommentForm && (
        <div className="border-t border-gray-200 p-4">
          <form onSubmit={(e) => handleCommentSubmit(post._id, e)}>
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment"
              className="w-full p-2 rounded-md border-gray-300 focus:border-blue-400 focus:ring-blue-400"
              style={{ backgroundColor: "var(--tertiary)" }}
              rows="3"
            />
            <button
              type="submit"
              className="mt-2 px-4 py-2 mb-3 rounded-md hover:opacity-80"
              style={{ backgroundColor: "var(--tertiary)" }}
            >
              Comment
            </button>
          </form>
          {post.comments && post.comments.length > 0 && (
            <div>
              {post.comments.map((comment) => (
                <div
                  key={comment._id}
                  className="text-m flex items-center space-x-2 mb-2"
                >
                  <div className="w-8 h-8 rounded-full bg-blue-400 flex items-center justify-center text-white overflow-hidden">
                    {comment.user?.profilePicture ? (
                      <img
                        src={comment.user.profilePicture}
                        alt="Profile"
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : (
                      <span>
                        {comment.user?.username
                          ? comment.user.username[0].toUpperCase()
                          : "?"}
                      </span>
                    )}
                  </div>
                  <span className="font-medium">{comment.user?.username}</span>
                  <span>{comment.text}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

Post.propTypes = {
  post: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    content: PropTypes.string.isRequired,
    image: PropTypes.string,
    likes: PropTypes.array.isRequired,
    comments: PropTypes.array,
    author: PropTypes.shape({
      username: PropTypes.string,
      profilePicture: PropTypes.string,
    }),
  }).isRequired,
  onPostUpdate: PropTypes.func.isRequired,
};
