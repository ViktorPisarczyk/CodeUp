import { useState } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { BsThreeDots } from "react-icons/bs";
import { IoClose } from "react-icons/io5";
import { jwtDecode } from "jwt-decode";

const Post = ({
  post,
  handleLike,
  showCommentForm,
  toggleCommentForm,
  newComment,
  setNewComment,
  handleCommentSubmit,
  onEdit,
  onReport,
  onCommentDelete,
  onCommentEdit,
  onCommentReport,
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeCommentDropdown, setActiveCommentDropdown] = useState(null);

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
    setActiveCommentDropdown(null); // Close any open comment dropdowns
  };

  const toggleCommentDropdown = (commentId) => {
    setActiveCommentDropdown(
      activeCommentDropdown === commentId ? null : commentId
    );
    setShowDropdown(false); // Close post dropdown if open
  };

  const getUserIdFromToken = () => {
    const token = localStorage.getItem("token");
    if (!token) return null;

    try {
      const decoded = jwtDecode(token);
      return decoded.id;
    } catch (error) {
      console.error("Invalid token", error);
      return null;
    }
  };

  const loggedInUserId = getUserIdFromToken();

  const onDelete = async (postId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5001/posts/${postId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to delete post");
      }

      alert("Post deleted successfully!");
    } catch (error) {
      console.error("Error deleting post:", error);
      alert(error.message);
    }
  };

  return (
    <div
      className="rounded-lg relative shadow-md p-4"
      style={{ backgroundColor: "var(--secondary)" }}
    >
      <div className="flex items-center mb-2">
        <Link
          to={`/profile/${post.author._id}`}
          className="w-10 h-10 rounded-full overflow-hidden"
        >
          <div className="w-10 h-10 rounded-full bg-blue-400 flex items-center justify-center text-white">
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
        </Link>
        <Link to={`/profile/${post.author._id}`} className="ml-2 font-bold">
          {post.author ? post.author.username : "Unknown User"}
        </Link>
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
          <div className="flex justify-end px-2">
            <IoClose
              className="cursor-pointer hover:opacity-70 text-xl"
              onClick={() => setShowDropdown(false)}
            />
          </div>
          {post.author?._id === loggedInUserId ? (
            <div>
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
            </div>
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
          {post.likes.includes(loggedInUserId) ? "❤️" : "🩶"} {post.likes.length}
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
              className="w-full p-2 rounded-md text-black border-gray-300 focus:border-blue-400 focus:ring-blue-400"
              style={{ backgroundColor: "var(--textarea)" }}
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
                  className="text-sm flex items-center space-x-2 mb-2 relative"
                >
                  {/* Commenter Profile Picture */}
                  <Link
                    to={`/profile/${comment.user._id}`}
                    className="w-8 h-8 rounded-full overflow-hidden"
                  >
                    <div className="w-8 h-8 rounded-full bg-blue-400 flex items-center justify-center text-white">
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
                  </Link>

                  {/* Commenter Username */}
                  <Link
                    to={`/profile/${comment.user._id}`}
                    className="font-bold"
                  >
                    {comment.user?.username}
                  </Link>

                  <span>{comment.text}</span>

                  <BsThreeDots
                    className="ml-2 cursor-pointer hover:opacity-70"
                    onClick={() => toggleCommentDropdown(comment._id)}
                  />

                  {activeCommentDropdown === comment._id && (
                    <div
                      className="absolute left-0 top-0 rounded-lg shadow-lg py-2 z-10"
                      style={{
                        backgroundColor: "var(--tertiary)",
                        minWidth: "150px",
                      }}
                    >
                      <div className="flex justify-end px-2">
                        <IoClose
                          className="cursor-pointer hover:opacity-70 text-xl"
                          onClick={() => setActiveCommentDropdown(null)}
                        />
                      </div>
                      {comment.user?._id === loggedInUserId ? (
                        <>
                          <button
                            className="w-full text-left px-4 py-2 hover:opacity-70"
                            onClick={() => {
                              onCommentEdit(post._id, comment._id);
                              setActiveCommentDropdown(null);
                            }}
                          >
                            Edit Comment
                          </button>
                          <button
                            className="w-full text-left px-4 py-2 hover:opacity-70"
                            onClick={() => {
                              onCommentDelete(post._id, comment._id);
                              setActiveCommentDropdown(null);
                            }}
                          >
                            Delete Comment
                          </button>
                        </>
                      ) : (
                        <button
                          className="w-full text-left px-4 py-2 hover:opacity-70"
                          onClick={() => {
                            onCommentReport(post._id, comment._id);
                            setActiveCommentDropdown(null);
                          }}
                        >
                          Report Comment
                        </button>
                      )}
                    </div>
                  )}
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
      _id: PropTypes.string.isRequired,
      username: PropTypes.string,
      profilePicture: PropTypes.string,
    }),
    image: PropTypes.string,
    likes: PropTypes.array,
    comments: PropTypes.arrayOf(
      PropTypes.shape({
        _id: PropTypes.string.isRequired,
        text: PropTypes.string.isRequired,
        user: PropTypes.shape({
          _id: PropTypes.string,
          username: PropTypes.string,
          profilePicture: PropTypes.string,
        }),
      })
    ),
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
  onCommentDelete: PropTypes.func.isRequired,
  onCommentEdit: PropTypes.func.isRequired,
  onCommentReport: PropTypes.func.isRequired,
};

export default Post;
