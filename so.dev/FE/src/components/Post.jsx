import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { BsThreeDots } from "react-icons/bs";
import { IoClose } from "react-icons/io5";
import { jwtDecode } from "jwt-decode";
import { SlBubbles } from "react-icons/sl";
import { CiHeart } from "react-icons/ci";
import { FaHeart } from "react-icons/fa";
import { FaCopy, FaCheck } from "react-icons/fa";
import Alert from "./Alert";
import Prism from "prismjs";
import "prismjs/themes/prism-tomorrow.css";

const Post = ({
  post,
  handleLike,
  showCommentForm,
  toggleCommentForm,
  newComment,
  setNewComment,
  handleCommentSubmit,
  fetchPosts,
  fetchUserPosts,
  onEdit,
  onDelete,
  onReport,
  onCommentDelete,
  onCommentEdit,
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeCommentDropdown, setActiveCommentDropdown] = useState(null);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [showReportAlert, setShowReportAlert] = useState(false);
  const [showCommentDeleteAlert, setShowCommentDeleteAlert] = useState(false);
  const [showCommentReportAlert, setShowCommentReportAlert] = useState(false);
  const [selectedCommentId, setSelectedCommentId] = useState(null);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [enlargedImage, setEnlargedImage] = useState(null);
  const [codeCopied, setCodeCopied] = useState(false);

  useEffect(() => {
    Prism.highlightAll();
  }, []);

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

  const handleDeleteClick = async () => {
    try {
      setShowDeleteAlert(true);
      setShowDropdown(false);
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };

  const handleDeleteConfirm = async (postId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("You need to be logged in to delete a post.");
        return;
      }

      const response = await fetch(`http://localhost:5001/posts/${postId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to delete post");
      }

      setShowDeleteAlert(false);
      setSuccessMessage("Post deleted successfully!");
      setShowSuccessAlert(true);
      fetchUserPosts();
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };

  const handleReportClick = async () => {
    setShowReportAlert(true);
    setShowDropdown(false);
  };

  const handleReportConfirm = async () => {
    try {
      await onReport(post._id);
      setShowReportAlert(false);
      setSuccessMessage("Post reported successfully!");
      setShowSuccessAlert(true);
    } catch (error) {
      console.error("Error reporting post:", error);
    }
  };

  const handleCommentDeleteClick = async (commentId) => {
    setSelectedCommentId(commentId);
    setShowCommentDeleteAlert(true);
    setActiveCommentDropdown(null);
  };

  const handleCommentDeleteConfirm = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("You need to be logged in to delete a comment.");
        return;
      }

      const response = await fetch(
        `http://localhost:5001/comments/${selectedCommentId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to delete comment");
      }

      setShowCommentDeleteAlert(false);
      setSuccessMessage("Comment deleted successfully!");
      setShowSuccessAlert(true);
      fetchUserPosts();
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  const handleCommentReportClick = async (commentId) => {
    setSelectedCommentId(commentId);
    setShowCommentReportAlert(true);
    setActiveCommentDropdown(null);
  };

  const handleCommentReportConfirm = async () => {
    try {
      setShowCommentReportAlert(false);
      setSuccessMessage("Comment reported successfully!");
      setShowSuccessAlert(true);
    } catch (error) {
      console.error("Error reporting comment:", error);
    }
  };

  const handleSuccessConfirm = () => {
    setShowSuccessAlert(false);
    setSelectedCommentId(null);
    fetchPosts();
  };

  const openImageModal = (imageUrl) => {
    setEnlargedImage(imageUrl);
  };

  const closeImageModal = () => {
    setEnlargedImage(null);
  };

  const copyCodeToClipboard = () => {
    if (post.code) {
      navigator.clipboard
        .writeText(post.code)
        .then(() => {
          setCodeCopied(true);
          setTimeout(() => {
            setCodeCopied(false);
          }, 2000);
        })
        .catch((err) => {
          console.error("Failed to copy code: ", err);
        });
    }
  };

  if (!post || !post.author) {
    return null;
  }

  return (
    <div
      className="rounded-lg relative shadow-md p-4 mb-4"
      style={{ backgroundColor: "var(--secondary)" }}
    >
      {showSuccessAlert && (
        <Alert
          message={successMessage}
          onConfirm={handleSuccessConfirm}
          isSuccess={true}
        />
      )}
      {showDeleteAlert && (
        <Alert
          message="Are you sure you want to delete this post?"
          onConfirm={() => handleDeleteConfirm(post._id)}
          onCancel={() => setShowDeleteAlert(false)}
        />
      )}
      {showReportAlert && (
        <Alert
          message="Are you sure you want to report this post?"
          onConfirm={handleReportConfirm}
          onCancel={() => setShowReportAlert(false)}
        />
      )}
      {showCommentDeleteAlert && (
        <Alert
          message="Are you sure you want to delete this comment?"
          onConfirm={handleCommentDeleteConfirm}
          onCancel={() => setShowCommentDeleteAlert(false)}
        />
      )}
      {showCommentReportAlert && (
        <Alert
          message="Are you sure you want to report this comment?"
          onConfirm={handleCommentReportConfirm}
          onCancel={() => setShowCommentReportAlert(false)}
        />
      )}
      {/* Image Modal */}
      {enlargedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-lg"
          onClick={closeImageModal}
          style={{ backgroundColor: "rgba(255, 255, 255, 0.3)" }}
        >
          <div className="relative max-w-4xl max-h-screen p-4">
            <img
              src={enlargedImage}
              alt="Enlarged post image"
              className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
      <div className="flex items-center">
        <Link
          to={`/profile/${loggedInUserId}`}
          className="w-10 h-10 rounded-full  bg-blue-400 flex items-center self-center text-center justify-center text-white"
        >
          {post.author?.profilePicture ? (
            <img
              src={post.author.profilePicture}
              alt="Profile"
              className="w-10 h-10 rounded-full"
            />
          ) : (
            <span>
              {post.author.username
                ? post.author.username[0].toUpperCase()
                : "?"}
            </span>
          )}
        </Link>

        {post.author ? (
          <Link to={`/profile/${post.author._id}`} className="ml-2 font-bold">
            {post.author.username}
          </Link>
        ) : (
          <span className="ml-2 font-bold text-gray-500">Unknown User</span>
        )}
        <span className="ml-2 text-sm text-gray-500">
          {new Date(post.createdAt).toLocaleString()}
        </span>
      </div>
      <BsThreeDots
        className="absolute right-4 top-4 cursor-pointer hover:opacity-70"
        onClick={toggleDropdown}
      />
      {showDropdown && (
        <>
          <div
            className="fixed inset-0 z-32"
            onClick={() => setShowDropdown(false)}
          />
          <div
            className="absolute right-4 top-8 rounded-lg shadow-lg py-2 z-33"
            style={{ backgroundColor: "var(--tertiary)", minWidth: "150px" }}
          >
            <div className="flex justify-end px-2">
              <IoClose
                className="cursor-pointer text-white hover:opacity-70 text-xl"
                onClick={() => setShowDropdown(false)}
              />
            </div>
            {post.author?._id === loggedInUserId ? (
              <div>
                <button
                  className="w-full text-white text-left px-4 py-2 hover:opacity-70"
                  onClick={() => {
                    onEdit(post._id);
                    setShowDropdown(false);
                  }}
                >
                  Edit Post
                </button>
                <button
                  className="w-full text-left text-white px-4 py-2 hover:opacity-70"
                  onClick={() => handleDeleteClick()}
                >
                  Delete Post
                </button>
              </div>
            ) : (
              <button
                className="w-full text-left px-4 text-white py-2 hover:opacity-70"
                onClick={() => handleReportClick()}
              >
                Report Post
              </button>
            )}
          </div>
        </>
      )}

      {/* Post Content */}
      <p className="mt-4 mb-4">{post.content}</p>

      {/* Display multiple images if available */}
      {post.images && post.images.length > 0 ? (
        <div className="image-gallery mb-4">
          {post.images.length === 1 ? (
            <img
              src={post.images[0]}
              alt="Post content"
              className="rounded-md w-full cursor-pointer"
              onClick={() => openImageModal(post.images[0])}
            />
          ) : post.images.length === 2 ? (
            <div className="grid grid-cols-2 gap-2">
              {post.images.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`Post content ${index + 1}`}
                  className="rounded-md w-full h-48 object-cover cursor-pointer"
                  onClick={() => openImageModal(image)}
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {post.images.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`Post content ${index + 1}`}
                  className="rounded-md w-full h-40 object-cover cursor-pointer"
                  onClick={() => openImageModal(image)}
                />
              ))}
            </div>
          )}
        </div>
      ) : post.image ? (
        // Fallback for backward compatibility
        <img
          src={post.image}
          alt="Post content"
          className="rounded-md w-full mb-4 cursor-pointer"
          onClick={() => openImageModal(post.image)}
        />
      ) : null}

      {post.code && (
        <div className="relative mb-4">
          <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto">
            <code className="language-javascript">{post.code}</code>
          </pre>
          <button
            onClick={copyCodeToClipboard}
            className="absolute top-2 right-2 p-2 rounded-md text-white"
            style={{ backgroundColor: "var(--tertiary)" }}
            title="Copy code to clipboard"
          >
            {codeCopied ? <FaCheck /> : <FaCopy />}
          </button>
        </div>
      )}

      <div className="flex items-center space-x-4 mt-4">
        <button
          className="flex items-center gap-1"
          onClick={() => handleLike(post._id)}
        >
          {post.likes.includes(loggedInUserId) ? (
            <FaHeart className="text-red-500" />
          ) : (
            <CiHeart />
          )}{" "}
          {post.likes.length}
        </button>
        <button className="flex items-center gap-1" onClick={toggleCommentForm}>
          <SlBubbles /> {post.comments?.length || 0}
        </button>
      </div>
      {showCommentForm && (
        <div className="border-t border-gray-200 p-4">
          <form onSubmit={(e) => handleCommentSubmit(post._id, e)}>
            <textarea
              value={newComment[post._id] || ""}
              onChange={(e) =>
                setNewComment((prevNewComment) => ({
                  ...prevNewComment,
                  [post._id]: e.target.value,
                }))
              }
              placeholder="Add a comment"
              className="w-full p-2 rounded-md text-black border-gray-300 focus:border-blue-400 focus:ring-blue-400"
              style={{ backgroundColor: "var(--textarea)" }}
              rows="3"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleCommentSubmit(post._id, e);
                }
              }}
            />
            <button
              type="submit"
              className="mt-2 px-4 py-2 text-white mb-3 rounded-md hover:opacity-80"
              style={{ backgroundColor: "var(--tertiary)" }}
            >
              Comment
            </button>
          </form>

          {post.comments && post.comments.length > 0 && (
            <div>
              {post.comments.map((comment) => (
                <div key={comment._id}>
                  <hr
                    className="border-gray-400 my-4"
                    style={{ opacity: 0.5 }}
                  />
                  <div className="relative">
                    <BsThreeDots
                      className="absolute right-0 top-2 cursor-pointer hover:opacity-70"
                      onClick={() => toggleCommentDropdown(comment._id)}
                    />
                    <div className="text-sm flex items-center space-x-2 mb-2">
                      {/* Commenter Profile Picture */}
                      <Link
                        to={`/profile/${comment.user ? comment.user._id : ""}`}
                        className="w-8 h-8 rounded-full overflow-hidden"
                      >
                        <div className="w-8 h-8 rounded-full bg-blue-400 flex items-center justify-center text-white">
                          {comment.user ? (
                            comment.user.profilePicture ? (
                              <img
                                src={comment.user.profilePicture}
                                alt="Profile"
                                className="w-full h-full object-cover rounded-full"
                              />
                            ) : (
                              <span>
                                {comment.user.username
                                  ? comment.user.username[0].toUpperCase()
                                  : "?"}
                              </span>
                            )
                          ) : (
                            <span className="text-xl">?</span> // Blue circle with a question mark
                          )}
                        </div>
                      </Link>

                      {/* Commenter Username */}
                      <Link
                        to={`/profile/${comment.user ? comment.user._id : ""}`}
                        className="font-bold"
                      >
                        {comment.user ? comment.user.username : "Deleted User"}
                      </Link>

                      <span>{comment.text}</span>
                    </div>

                    {/* Add comment creation date and time */}
                    <div className="text-xs text-gray-500 ml-10 mb-2">
                      {new Date(comment.createdAt).toLocaleString()}
                    </div>

                    {activeCommentDropdown === comment._id && (
                      <>
                        <div
                          className="fixed inset-0 z-32"
                          onClick={() => setActiveCommentDropdown(null)}
                        />
                        <div
                          className="absolute right-0 top-6 rounded-lg shadow-lg py-2 z-35"
                          style={{
                            backgroundColor: "var(--tertiary)",
                            minWidth: "150px",
                          }}
                        >
                          <div className="flex justify-end px-2">
                            <IoClose
                              className="cursor-pointer text-white hover:opacity-70 text-xl"
                              onClick={() => setActiveCommentDropdown(null)}
                            />
                          </div>
                          {comment.user?._id === loggedInUserId ? (
                            <>
                              <button
                                className="w-full text-left text-white px-4 py-2 hover:opacity-70"
                                onClick={() => {
                                  onCommentEdit(post._id, comment._id);
                                  setActiveCommentDropdown(null);
                                }}
                              >
                                Edit Comment
                              </button>
                              <button
                                className="w-full text-left text-white px-4 py-2 hover:opacity-70"
                                onClick={() =>
                                  handleCommentDeleteClick(comment._id)
                                }
                              >
                                Delete Comment
                              </button>
                            </>
                          ) : (
                            <button
                              className="w-full text-left text-white px-4 py-2 hover:opacity-70"
                              onClick={() =>
                                handleCommentReportClick(comment._id)
                              }
                            >
                              Report Comment
                            </button>
                          )}
                        </div>
                      </>
                    )}
                  </div>
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
      profilePicture: PropTypes.string,
      username: PropTypes.string.isRequired,
    }).isRequired,
    images: PropTypes.arrayOf(PropTypes.string),
    image: PropTypes.string,
    code: PropTypes.string,
    comments: PropTypes.arrayOf(
      PropTypes.shape({
        _id: PropTypes.string.isRequired,
        text: PropTypes.string.isRequired,
        user: PropTypes.shape({
          _id: PropTypes.string.isRequired,
          username: PropTypes.string.isRequired,
        }).isRequired,
      })
    ).isRequired,
    likes: PropTypes.arrayOf(PropTypes.string).isRequired,
    createdAt: PropTypes.string.isRequired,
  }).isRequired,
  handleLike: PropTypes.func.isRequired,
  showCommentForm: PropTypes.bool.isRequired,
  toggleCommentForm: PropTypes.func.isRequired,
  newComment: PropTypes.object.isRequired,
  setNewComment: PropTypes.func.isRequired,
  handleCommentSubmit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  onReport: PropTypes.func.isRequired,
  onCommentDelete: PropTypes.func.isRequired,
  onCommentEdit: PropTypes.func.isRequired,
  fetchPosts: PropTypes.func.isRequired,
  fetchUserPosts: PropTypes.func.isRequired,
};

export default Post;
