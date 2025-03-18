import { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { BsThreeDots } from "react-icons/bs";
import { IoClose } from "react-icons/io5";
import { jwtDecode } from "jwt-decode";
import { SlBubbles } from "react-icons/sl";
import { CiHeart } from "react-icons/ci";
import { FaHeart } from "react-icons/fa";
import { FaCopy, FaCheck, FaCode } from "react-icons/fa";
import Alert from "./Alert";
import Prism from "prismjs";
import "prismjs/themes/prism-tomorrow.css";
import { IoImage } from "react-icons/io5";

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
  // Add state for edit post modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editedContent, setEditedContent] = useState("");
  const [editedCodeSnippet, setEditedCodeSnippet] = useState("");
  const [editedImageFiles, setEditedImageFiles] = useState([]);
  const [editedImagePreviewUrls, setEditedImagePreviewUrls] = useState([]);
  const [isCodeSnippetVisible, setIsCodeSnippetVisible] = useState(false);
  const [isEditLoading, setIsEditLoading] = useState(false);
  const [showMaxImagesAlert, setShowMaxImagesAlert] = useState(false);
  // Add a timer ref to prevent auto-closing of success alert
  const successAlertTimerRef = useRef(null);
  const successCallbackRef = useRef(null);

  useEffect(() => {
    Prism.highlightAll();
  }, []);

  // Clear any existing timers when component unmounts
  useEffect(() => {
    return () => {
      if (successAlertTimerRef.current) {
        clearTimeout(successAlertTimerRef.current);
      }
    };
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

  const showSuccessAlertWithMessage = (message) => {
    // Clear any existing timer to prevent auto-closing
    if (successAlertTimerRef.current) {
      clearTimeout(successAlertTimerRef.current);
    }

    setSuccessMessage(message);
    setShowSuccessAlert(true);
  };

  const handleDeleteConfirm = async (postId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("You need to be logged in to delete a post.");
        return;
      }

      // If onDelete prop is provided, use it, otherwise perform delete directly
      if (onDelete) {
        // Store the original onDelete function
        const originalOnDelete = onDelete;

        // Call the API directly to delete the post
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
        showSuccessAlertWithMessage("Post deleted successfully!");

        // We'll call the original onDelete in handleSuccessConfirm
        successCallbackRef.current = () => originalOnDelete(postId);
      } else {
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
        showSuccessAlertWithMessage("Post deleted successfully!");
      }
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };

  // Add function to handle edit post click
  const handleEditClick = () => {
    setEditedContent(post.content);
    setEditedCodeSnippet(post.code || "");
    setIsCodeSnippetVisible(!!post.code);

    // Initialize image previews if the post has images
    if (post.images && post.images.length > 0) {
      setEditedImagePreviewUrls(post.images);
    } else if (post.image) {
      // For backward compatibility
      setEditedImagePreviewUrls([post.image]);
    } else {
      setEditedImagePreviewUrls([]);
    }

    setEditedImageFiles([]);
    setShowEditModal(true);
    setShowDropdown(false);
  };

  // Add function to toggle code snippet visibility
  const toggleCodeSnippetVisibility = () => {
    setIsCodeSnippetVisible(!isCodeSnippetVisible);
  };

  // Add function to handle image change in edit mode
  const handleEditImageChange = (e) => {
    const files = Array.from(e.target.files);

    // Check if adding these files would exceed the limit
    if (
      editedImageFiles.length + files.length + editedImagePreviewUrls.length >
      3
    ) {
      setShowMaxImagesAlert(true);
      return;
    }

    // Add new files to existing files
    const newImageFiles = [...editedImageFiles, ...files];
    setEditedImageFiles(newImageFiles);

    // Create object URLs for new files
    const newPreviewUrls = files.map((file) => URL.createObjectURL(file));
    setEditedImagePreviewUrls([...editedImagePreviewUrls, ...newPreviewUrls]);
  };

  // Add function to remove image in edit mode
  const removeEditImage = (index) => {
    // Check if removing an existing image or a new image
    if (index < editedImagePreviewUrls.length) {
      const newImagePreviewUrls = [...editedImagePreviewUrls];
      newImagePreviewUrls.splice(index, 1);
      setEditedImagePreviewUrls(newImagePreviewUrls);
    }

    // If removing a new image file
    if (index >= editedImagePreviewUrls.length - editedImageFiles.length) {
      const fileIndex =
        index - (editedImagePreviewUrls.length - editedImageFiles.length);
      if (fileIndex >= 0 && fileIndex < editedImageFiles.length) {
        const newImageFiles = [...editedImageFiles];
        newImageFiles.splice(fileIndex, 1);
        setEditedImageFiles(newImageFiles);
      }
    }
  };

  // Add function to handle edit post submit
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setIsEditLoading(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("You need to be logged in to edit a post.");
        setIsEditLoading(false);
        return;
      }

      // We need to use FormData for image uploads
      const formData = new FormData();
      formData.append("content", editedContent);
      formData.append("code", isCodeSnippetVisible ? editedCodeSnippet : "");

      // Add new image files if any
      editedImageFiles.forEach((file) => {
        formData.append("images", file);
      });

      // Add existing images that weren't removed
      if (editedImagePreviewUrls.length > 0) {
        // Only include existing images that weren't newly uploaded
        const existingImages = editedImagePreviewUrls.slice(
          0,
          editedImagePreviewUrls.length - editedImageFiles.length
        );

        if (existingImages.length > 0) {
          formData.append("existingImages", JSON.stringify(existingImages));
        }
      }

      // Make PATCH request to update the post
      const response = await fetch(`http://localhost:5001/posts/${post._id}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to update post");
      }

      // Close the modal and show success message
      setShowEditModal(false);
      showSuccessAlertWithMessage("Post updated successfully!");

      // Refresh posts
      if (fetchPosts) {
        fetchPosts();
      } else if (fetchUserPosts) {
        fetchUserPosts();
      }
    } catch (error) {
      console.error("Error updating post:", error);
      // Show error message to user
      alert(`Error updating post: ${error.message}`);
    } finally {
      setIsEditLoading(false);
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
      showSuccessAlertWithMessage("Post reported successfully!");
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

      // If onCommentDelete prop is provided, use it, otherwise perform delete directly
      if (onCommentDelete) {
        // Store the original onCommentDelete function
        const originalOnCommentDelete = onCommentDelete;

        // Call the API directly to delete the comment
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
        showSuccessAlertWithMessage("Comment deleted successfully!");

        // We'll call the original onCommentDelete in handleSuccessConfirm
        successCallbackRef.current = () =>
          originalOnCommentDelete(selectedCommentId);
      } else {
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
        showSuccessAlertWithMessage("Comment deleted successfully!");
      }
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
      showSuccessAlertWithMessage("Comment reported successfully!");
    } catch (error) {
      console.error("Error reporting comment:", error);
    }
  };

  const handleSuccessConfirm = () => {
    setShowSuccessAlert(false);
    setSelectedCommentId(null);

    // Clear any existing timer
    if (successAlertTimerRef.current) {
      clearTimeout(successAlertTimerRef.current);
      successAlertTimerRef.current = null;
    }

    // Refresh posts list
    if (fetchPosts) {
      fetchPosts();
    } else if (fetchUserPosts) {
      fetchUserPosts();
    }

    // Call the stored onDelete function if it exists
    if (successCallbackRef.current) {
      successCallbackRef.current();
      successCallbackRef.current = null;
    }
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
      className="rounded-lg relative max-w-full  shadow-md p-4 mb-4"
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
      {/* Edit Post Modal */}
      {showEditModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
        >
          <div
            className="relative rounded-lg p-6 shadow-xl max-w-md w-full mx-4"
            style={{ backgroundColor: "var(--secondary)" }}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Edit Post</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <IoClose size={24} />
              </button>
            </div>
            <form onSubmit={handleEditSubmit}>
              <textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                className="w-full p-2 rounded-md text-black border-gray-300 focus:border-blue-400 focus:ring-blue-400 mb-4"
                style={{ backgroundColor: "var(--textarea)" }}
                rows="6"
                placeholder="Edit your post..."
              />
              <div className="flex mb-4">
                <button
                  type="button"
                  onClick={toggleCodeSnippetVisibility}
                  className="flex items-center justify-center px-4 py-2 rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100 cursor-pointer font-semibold text-sm"
                >
                  <FaCode className="mr-2" size={16} />
                  {isCodeSnippetVisible
                    ? "Hide Code Snippet"
                    : "Add Code Snippet"}
                </button>
              </div>
              {isCodeSnippetVisible && (
                <textarea
                  value={editedCodeSnippet}
                  onChange={(e) => setEditedCodeSnippet(e.target.value)}
                  className="w-full p-2 rounded-md text-black border-gray-300 focus:border-blue-400 focus:ring-blue-400 mb-4"
                  style={{ backgroundColor: "var(--textarea)" }}
                  rows="6"
                  placeholder="Edit your code snippet..."
                />
              )}
            </form>
            <div className="mt-4">
              <label className="inline-block w-full">
                <span className="sr-only">Add Images</span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleEditImageChange}
                  className="hidden"
                />
                <div className="flex items-center justify-center px-4 py-2 rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100 cursor-pointer font-semibold text-sm">
                  <IoImage className="mr-2" size={20} /> Add Images
                </div>
              </label>
              {editedImagePreviewUrls.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {editedImagePreviewUrls.map((imageUrl, index) => (
                    <div key={index} className="relative">
                      <img
                        src={imageUrl}
                        alt="Edited post image"
                        className="w-full h-40 object-cover rounded-md"
                      />
                      <button
                        onClick={() => removeEditImage(index)}
                        className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md hover:bg-gray-100"
                      >
                        <IoClose size={20} className="text-red-500" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Buttons moved to bottom */}
            <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 rounded-md text-white"
                style={{ backgroundColor: "var(--quaternary)" }}
              >
                Cancel
              </button>
              <button
                onClick={handleEditSubmit}
                className="px-4 py-2 rounded-md text-white flex items-center"
                style={{ backgroundColor: "var(--tertiary)" }}
                disabled={isEditLoading}
              >
                {isEditLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin mr-2"></div>
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Max Images Alert */}
      {showMaxImagesAlert && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-xl font-semibold mb-4">
              Maximum Images Reached
            </h3>
            <p className="mb-4">
              You can only upload a maximum of 3 images per post.
            </p>
            <div className="flex justify-end">
              <button
                onClick={() => setShowMaxImagesAlert(false)}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                OK
              </button>
            </div>
          </div>
        </div>
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
              className="w-10 h-10 rounded-full object-cover"
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
                  onClick={handleEditClick}
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
      <p className="mt-4 mb-4 whitespace-pre-wrap break-words">
        {post.content}
      </p>

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
        <div className="relative max-w-full mb-4 overflow-auto">
          <pre className="bg-gray-100 p-4  max-w-full overflow-x-auto whitespace-pre-wrap break-words rounded-md ">
            <code className="language-javascript">{post.code}</code>
          </pre>
          <button
            onClick={copyCodeToClipboard}
            className="absolute top-4 right-2 p-2 rounded-md text-white"
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
                      {comment.user ? (
                        <Link
                          to={`/profile/${comment.user._id}`}
                          className="w-8 h-8 rounded-full overflow-hidden"
                        >
                          <div className="w-8 h-8 rounded-full bg-blue-400 flex items-center justify-center text-white">
                            {comment.user.profilePicture ? (
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
                            )}
                          </div>
                        </Link>
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-blue-400 flex items-center justify-center text-white">
                          <span className="text-xl">?</span>
                        </div>
                      )}

                      {/* Commenter Username */}
                      {comment.user ? (
                        <Link
                          to={`/profile/${comment.user._id}`}
                          className="font-bold"
                        >
                          {comment.user.username}
                        </Link>
                      ) : (
                        <span className="font-bold">Deleted User</span>
                      )}

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
  onReport: PropTypes.func.isRequired,
  onCommentDelete: PropTypes.func.isRequired,
  onCommentEdit: PropTypes.func.isRequired,
  fetchPosts: PropTypes.func.isRequired,
  fetchUserPosts: PropTypes.func.isRequired,
};

export default Post;
