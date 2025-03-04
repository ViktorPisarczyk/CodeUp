import React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";

const Post = ({
  post,
  handleLike,
  showCommentForm,
  toggleCommentForm,
  newComment,
  setNewComment,
  handleCommentSubmit,
  userId,
}) => {
  return (
    <div
      className="rounded-lg shadow-md p-4"
      style={{ backgroundColor: "var(--secondary)" }}
    >
      <Link to={`/profile/${post.author._id}`}>
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
          <span className="ml-2 font-bold">
            {post.author ? post.author.username : "Unknown User"}
          </span>
        </div>
      </Link>

      {/* Post Content */}
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
          {post.likes.includes(userId) ? "❤️" : "🩶"} {post.likes.length}
        </button>
        <button onClick={() => toggleCommentForm(post._id)}>
          💬 {post.comments?.length || 0}
        </button>
      </div>

      {showCommentForm === post._id && (
        <div className="border-t border-gray-200 p-4">
          <form onSubmit={(e) => handleCommentSubmit(post._id, e)}>
            <textarea
              value={newComment?.[post._id] || ""}
              onChange={(e) =>
                setNewComment({
                  ...newComment,
                  [post._id]: e.target.value,
                })
              }
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
                  className="text-sm flex items-center space-x-2 mb-2"
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
                  <span className="font-bold">{comment.user?.username}</span>
                  <span>{comment.text}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

Post.propTypes = {
  post: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    content: PropTypes.string.isRequired,
    image: PropTypes.string,
    author: PropTypes.shape({
      _id: PropTypes.string.isRequired, // Added required _id
      username: PropTypes.string,
      profilePicture: PropTypes.string,
    }),
    likes: PropTypes.array.isRequired,
    comments: PropTypes.arrayOf(
      PropTypes.shape({
        _id: PropTypes.string.isRequired,
        text: PropTypes.string.isRequired,
        user: PropTypes.shape({
          username: PropTypes.string,
          profilePicture: PropTypes.string,
        }),
      })
    ),
  }).isRequired,
  handleLike: PropTypes.func.isRequired,
  showCommentForm: PropTypes.string,
  toggleCommentForm: PropTypes.func.isRequired,
  newComment: PropTypes.object.isRequired,
  setNewComment: PropTypes.func.isRequired,
  handleCommentSubmit: PropTypes.func.isRequired,
  userId: PropTypes.string.isRequired,
};

export default Post;
