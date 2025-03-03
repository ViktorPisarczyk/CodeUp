import { useState } from "react";
import PropTypes from "prop-types";
import { BsThreeDots } from "react-icons/bs";

const Post = ({
  post,
  handleLike,
  showCommentForm,
  toggleCommentForm,
  newComment,
  setNewComment,
  handleCommentSubmit,
  userId,
  onDelete,
  onEdit,
  onReport,
}) => {
  const [showDropdown, setShowDropdown] = useState(false);

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  return (
    <div
      className="rounded-lg relative shadow-md p-4"
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
        <span className="ml-2 font-bold">
          {post.author ? post.author.username : "Unknown User"}
        </span>
      </div>

      <BsThreeDots
        className="absolute right-4 top-4 cursor-pointer hover:opacity-70"
        onClick={toggleDropdown}
      />
      {showDropdown && (
        <div
          className="absolute right-4 top-6 rounded-lg shadow-lg py-2 z-10"
          style={{ backgroundColor: "var(--tertiary)", minWidth: "150px" }}
        >
          {post.author?._id === userId ? (
            <>
              <button
                className="w-full text-left px-4 py-2 hover:opacity-70"
                onClick={() => {
                  onEdit(post._id);
                  setShowDropdown(false);
                }}
              >
                Edit Post
              </button>
              <button
                className="w-full text-left px-4 py-2 hover:opacity-70"
                onClick={() => {
                  onDelete(post._id);
                  setShowDropdown(false);
                }}
              >
                Delete Post
              </button>
            </>
          ) : (
            <button
              className="w-full text-left px-4 py-2 hover:opacity-70"
              onClick={() => {
                onReport(post._id);
                setShowDropdown(false);
              }}
            >
              Report Post
            </button>
          )}
        </div>
      )}

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
              value={newComment[post._id] || ""}
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
    author: PropTypes.shape({
      _id: PropTypes.string,
      username: PropTypes.string,
      profilePicture: PropTypes.string,
    }),
    image: PropTypes.string,
    likes: PropTypes.array,
    comments: PropTypes.array,
  }).isRequired,
  handleLike: PropTypes.func.isRequired,
  showCommentForm: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
  toggleCommentForm: PropTypes.func.isRequired,
  newComment: PropTypes.object.isRequired,
  setNewComment: PropTypes.func.isRequired,
  handleCommentSubmit: PropTypes.func.isRequired,
  userId: PropTypes.string.isRequired,
  onDelete: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  onReport: PropTypes.func.isRequired,
};

export default Post;
