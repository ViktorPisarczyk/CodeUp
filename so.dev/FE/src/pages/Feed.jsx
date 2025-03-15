import { useState, useEffect, useContext, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import AsideMenu from "../components/AsideMenu";
import Post from "../components/Post";
import logoLM from "../assets/newLogoLM.png";
import logoDM from "../assets/newLogoDM.png";
import { MyContext } from "../context/ThemeContext";
import { IoClose } from "react-icons/io5";
import Alert from "../components/Alert"; // Import the Alert component
import Prism from "prismjs";
import "prismjs/themes/prism-tomorrow.css"; // Choose a theme of your choice
import "prismjs/components/prism-javascript";

const API_URL = "http://localhost:5001";

export default function Feed() {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState("");
  const [newComment, setNewComment] = useState({});
  const [showCommentForm, setShowCommentForm] = useState(null);
  const [imageFiles, setImageFiles] = useState([]); // For multiple pictures
  const [imagePreviewUrls, setImagePreviewUrls] = useState([]); // For multiple previews
  const [codeSnippet, setCodeSnippet] = useState(""); // For the code snippet
  const [isCodeSnippetVisible, setIsCodeSnippetVisible] = useState(false); // To control the visibility of the code snippet textarea
  const [showAddTextAlert, setShowAddTextAlert] = useState(false); // New state for the alert
  const [showMaxImagesAlert, setShowMaxImagesAlert] = useState(false); // Alert for max images limit
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const observer = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
    } else {
      fetchPosts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    Prism.highlightAll();
  }, [posts]);

  const fetchPosts = async (pageNum = 1, append = false) => {
    if (loading) return;

    setLoading(true);
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(`${API_URL}/posts?page=${pageNum}&limit=5`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch posts");
      }

      const data = await response.json();

      if (append) {
        setPosts((prevPosts) => [...prevPosts, ...data.posts]);
      } else {
        setPosts(data.posts || []);
      }

      setHasMore(data.hasMore);
      setPage(data.currentPage);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadMorePosts = useCallback(() => {
    if (!loading && hasMore) {
      fetchPosts(page + 1, true);
    }
  }, [loading, hasMore, page]);

  const lastPostElementRef = useCallback(
    (node) => {
      if (loading) return;

      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasMore) {
            loadMorePosts();
          }
        },
        {
          rootMargin: "100px", // Load more posts when within 100px of the bottom
          threshold: 0.1, // Trigger when at least 10% of the element is visible
        }
      );

      if (node) observer.current.observe(node);
    },
    [loading, hasMore, loadMorePosts]
  );

  const handleLike = async (postId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("You must be logged in to like posts.");
      return;
    }
    
    // Get userId from JWT token for consistency with Post component
    let userId;
    try {
      const decoded = JSON.parse(atob(token.split('.')[1]));
      userId = decoded.id;
    } catch (error) {
      console.error("Error decoding token:", error);
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

      // Update just the liked post without refetching all posts
      setPosts((prevPosts) =>
        prevPosts.map((post) => {
          if (post._id === postId) {
            const isLiked = post.likes.includes(userId);

            return {
              ...post,
              likes: isLiked
                ? post.likes.filter((id) => id !== userId)
                : [...post.likes, userId],
            };
          }
          return post;
        })
      );
    } catch (error) {
      console.error("Error while liking post:", error);
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);

    // Check if adding these files would exceed the limit
    if (imageFiles.length + files.length > 3) {
      setShowMaxImagesAlert(true);
      return;
    }

    // Add new files to existing files
    const newImageFiles = [...imageFiles, ...files];
    setImageFiles(newImageFiles);

    // Create object URLs for new files
    const newPreviewUrls = files.map((file) => URL.createObjectURL(file));
    setImagePreviewUrls([...imagePreviewUrls, ...newPreviewUrls]);
  };

  const removeImage = (index) => {
    const newImageFiles = [...imageFiles];
    const newImagePreviewUrls = [...imagePreviewUrls];
    newImageFiles.splice(index, 1);
    newImagePreviewUrls.splice(index, 1);
    setImageFiles(newImageFiles);
    setImagePreviewUrls(newImagePreviewUrls);
  };

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    if (!newPost.trim() && imageFiles.length === 0) {
      alert("Please enter a text or upload an image.");
      return;
    }

    if (!newPost.trim() && imageFiles.length > 0) {
      setShowAddTextAlert(true);
      return;
    }

    await submitPost(token);
  };

  const submitPost = async (token) => {
    const formData = new FormData();
    formData.append("content", newPost);
    imageFiles.forEach((file) => formData.append("images", file));
    if (codeSnippet.trim()) {
      formData.append("code", codeSnippet);
    }

    try {
      const response = await fetch(`${API_URL}/posts`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to create post");

      setNewPost("");
      setImageFiles([]);
      setImagePreviewUrls([]);
      setCodeSnippet("");
      // Reset to first page and fetch fresh posts
      setPage(1);
      fetchPosts(1, false);
    } catch (error) {
      console.error("Error creating post:", error);
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

    if (!newComment[postId]?.trim()) {
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
          text: newComment[postId],
          post: postId,
          user: userId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add comment");
      }

      setNewComment((prev) => ({
        ...prev,
        [postId]: "",
      }));

      setShowCommentForm(null);

      // Refresh posts to show the new comment
      const currentPage = page;
      fetchPosts(currentPage, false);
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  const toggleCommentForm = (postId) => {
    setShowCommentForm(postId === showCommentForm ? null : postId);
  };

  const { darkMode } = useContext(MyContext);

  return (
    <div
      className="flex flex-row min-h-screen"
      style={{ backgroundColor: "var(--primary)" }}
    >
      <AsideMenu />
      <div className="max-w-2xl mx-auto pt-8 px-4">
        <img src={darkMode ? logoDM : logoLM} alt="logo" />
        <form
          onSubmit={handlePostSubmit}
          className="rounded-lg p-4 mb-6 shadow-md"
          style={{ backgroundColor: "var(--secondary)" }}
        >
          {showAddTextAlert && (
            <Alert
              message="Would you like to add some text to describe your image?"
              onConfirm={() => setShowAddTextAlert(false)}
              onCancel={async () => {
                setShowAddTextAlert(false);
                const token = localStorage.getItem("token");
                await submitPost(token);
              }}
            />
          )}
          {showMaxImagesAlert && (
            <Alert
              message="You can only upload up to 3 images."
              onConfirm={() => setShowMaxImagesAlert(false)}
            />
          )}
          <textarea
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            placeholder="What's on your mind?"
            className="w-full p-2 rounded-md text-black border-gray-300 focus:border-blue-400 focus:ring-blue-400"
            style={{ backgroundColor: "var(--textarea)" }}
            rows="3"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handlePostSubmit(e);
              }
            }}
          />

          {/* Image Preview */}
          {imagePreviewUrls.length > 0 && (
            <div className="relative mt-2 mb-2">
              <div className="flex flex-wrap gap-2">
                {imagePreviewUrls.map((url, index) => (
                  <div key={index} className="relative">
                    <img
                      src={url}
                      alt="Preview"
                      className="h-48 w-auto rounded-lg object-cover"
                    />
                    <button
                      type="button"
                      className="absolute top-2 right-2 text-white rounded-full p-1 hover:opacity-80 transition-colors"
                      style={{ backgroundColor: "var(--quaternary)" }}
                      onClick={() => removeImage(index)}
                    >
                      <IoClose size={20} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2 mt-2">
            <label
              htmlFor="image-upload"
              className="cursor-pointer px-4 py-2 rounded-lg text-white flex items-center gap-2"
              style={{ backgroundColor: "var(--tertiary)" }}
            >
              <span>
                Upload Images{" "}
                {imageFiles.length > 0 && `(${imageFiles.length}/3)`}
              </span>
              <input
                id="image-upload"
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                disabled={imageFiles.length >= 3}
              />
            </label>

            <button
              type="button"
              onClick={() => setIsCodeSnippetVisible(!isCodeSnippetVisible)}
              className="px-4 py-2 text-white rounded-md hover:opacity-80"
              style={{ backgroundColor: "var(--tertiary)" }}
            >
              Attach Code Snippet
            </button>

            {/* Post Button */}
            <button
              type="submit"
              className="px-4 py-2 text-white rounded-md hover:opacity-80 ml-auto"
              style={{ backgroundColor: "var(--tertiary)" }}
            >
              Post
            </button>
          </div>

          {/* Conditionally render code snippet textarea based on state */}
          {isCodeSnippetVisible && (
            <textarea
              value={codeSnippet}
              onChange={(e) => setCodeSnippet(e.target.value)}
              placeholder="Paste your code here..."
              className="w-full p-2 mt-2 text-black rounded-md border-gray-300 focus:border-blue-400 focus:ring-blue-400"
              style={{ backgroundColor: "var(--textarea)" }}
              rows="3"
            />
          )}
        </form>

        <div className="space-y-6">
          {posts && posts.length > 0 ? (
            posts.map((post, index) => {
              if (!post) return null;
              return (
                <div key={post._id}>
                  <Post
                    post={post}
                    handleLike={handleLike}
                    showCommentForm={showCommentForm === post._id}
                    toggleCommentForm={() => toggleCommentForm(post._id)}
                    newComment={newComment}
                    setNewComment={setNewComment}
                    handleCommentSubmit={handleCommentSubmit}
                    fetchPosts={fetchPosts}
                    onDelete={async (postId) => {
                      const token = localStorage.getItem("token");
                      try {
                        const response = await fetch(
                          `${API_URL}/posts/${postId}`,
                          {
                            method: "DELETE",
                            headers: {
                              Authorization: `Bearer ${token}`,
                            },
                          }
                        );
                        if (!response.ok)
                          throw new Error("Failed to delete post");
                        fetchPosts();
                      } catch (error) {
                        console.error("Error deleting post:", error);
                      }
                    }}
                    onEdit={async (postId, newContent) => {
                      const token = localStorage.getItem("token");
                      try {
                        const response = await fetch(
                          `${API_URL}/posts/${postId}`,
                          {
                            method: "PUT",
                            headers: {
                              "Content-Type": "application/json",
                              Authorization: `Bearer ${token}`,
                            },
                            body: JSON.stringify({ content: newContent }),
                          }
                        );
                        if (!response.ok)
                          throw new Error("Failed to edit post");
                        fetchPosts();
                      } catch (error) {
                        console.error("Error editing post:", error);
                      }
                    }}
                    onReport={async (postId) => {
                      const token = localStorage.getItem("token");
                      try {
                        const response = await fetch(
                          `${API_URL}/posts/${postId}/report`,
                          {
                            method: "POST",
                            headers: {
                              Authorization: `Bearer ${token}`,
                            },
                          }
                        );
                        if (!response.ok)
                          throw new Error("Failed to report post");
                      } catch (error) {
                        console.error("Error reporting post:", error);
                      }
                    }}
                    onCommentDelete={async (commentId) => {
                      const token = localStorage.getItem("token");
                      try {
                        const response = await fetch(
                          `${API_URL}/comments/${commentId}`,
                          {
                            method: "DELETE",
                            headers: {
                              Authorization: `Bearer ${token}`,
                            },
                          }
                        );
                        if (!response.ok)
                          throw new Error("Failed to delete comment");
                        fetchPosts();
                      } catch (error) {
                        console.error("Error deleting comment:", error);
                      }
                    }}
                    onCommentEdit={async (commentId, newContent) => {
                      const token = localStorage.getItem("token");
                      try {
                        const response = await fetch(
                          `${API_URL}/comments/${commentId}`,
                          {
                            method: "PUT",
                            headers: {
                              "Content-Type": "application/json",
                              Authorization: `Bearer ${token}`,
                            },
                            body: JSON.stringify({ content: newContent }),
                          }
                        );
                        if (!response.ok)
                          throw new Error("Failed to edit comment");
                        fetchPosts();
                      } catch (error) {
                        console.error("Error editing comment:", error);
                      }
                    }}
                  />
                  {posts.length === index + 1 && (
                    <div ref={lastPostElementRef} className="h-10" />
                  )}
                </div>
              );
            })
          ) : (
            <div className="text-center py-8">
              <p className="text-lg">No posts yet. Be the first to post!</p>
            </div>
          )}
        </div>

        {loading && (
          <div className="flex justify-center my-4">
            <div
              className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin"
              style={{
                borderColor:
                  "var(--tertiary) transparent transparent transparent",
              }}
            ></div>
          </div>
        )}

        {!hasMore && posts.length > 0 && (
          <p className="text-center my-4 text-gray-500">
            No more posts to load
          </p>
        )}
      </div>
    </div>
  );
}

// Add these functions to handle edit, delete, and report
const handleEditPost = (postId) => {
  console.log("Edit post:", postId);
  // Implement edit post functionality
};

const handleDeletePost = (postId) => {
  console.log("Delete post:", postId);
  // Implement delete post functionality
};

const handleReportPost = (postId) => {
  console.log("Report post:", postId);
  // Implement report post functionality
};

const handleDeleteComment = (postId, commentId) => {
  console.log("Delete comment:", commentId, "from post:", postId);
  // Implement delete comment functionality
};

const handleEditComment = (postId, commentId) => {
  console.log("Edit comment:", commentId, "from post:", postId);
  // Implement edit comment functionality
};
