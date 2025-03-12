import { useState, useEffect, useContext } from "react";
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
  const [imageFile, setImageFile] = useState(null); // For the picture
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
  const [codeSnippet, setCodeSnippet] = useState(""); // For the code snippet
  const [isCodeSnippetVisible, setIsCodeSnippetVisible] = useState(false); // To control the visibility of the code snippet textarea
  const [showAddTextAlert, setShowAddTextAlert] = useState(false); // New state for the alert
  const [showSuccessAlert, setShowSuccessAlert] = useState(false); // New state for the success alert
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

  const fetchPosts = async () => {
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(`${API_URL}/posts`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch posts");
      }

      const data = await response.json();
      setPosts(data || []);
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  };

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

      fetchPosts();
    } catch (error) {
      console.error("Error while liking post:", error);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreviewUrl(null);
  };

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    if (!newPost.trim() && !imageFile) {
      alert("Please enter a text or upload an image.");
      return;
    }

    if (!newPost.trim() && imageFile) {
      setShowAddTextAlert(true);
      return;
    }

    await submitPost(token);
  };

  const submitPost = async (token) => {
    const formData = new FormData();
    formData.append("content", newPost);
    if (imageFile) {
      formData.append("image", imageFile);
    }
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
      setImageFile(null);
      setImagePreviewUrl(null);
      setCodeSnippet("");
      setShowSuccessAlert(true);
      fetchPosts();
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
      fetchPosts();
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
          {showSuccessAlert && (
            <Alert
              message="Post created successfully!"
              onConfirm={() => setShowSuccessAlert(false)}
              isSuccess={true}
            />
          )}
          <textarea
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            placeholder="What's on your mind?"
            className="w-full p-2 rounded-md text-black border-gray-300 focus:border-blue-400 focus:ring-blue-400"
            style={{ backgroundColor: "var(--textarea)" }}
            rows="3"
          />

          {/* Image Preview */}
          {imagePreviewUrl && (
            <div className="relative mt-2 mb-2">
              <img
                src={imagePreviewUrl}
                alt="Preview"
                className="max-h-48 rounded-lg object-cover"
              />
              <button
                type="button"
                onClick={removeImage}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                style={{ backgroundColor: "var(--quaternary)" }}
              >
                <IoClose size={20} />
              </button>
            </div>
          )}

          <div className="mt-2 flex items-center justify-between">
            {/* Buttons to Attach Picture, Code Snippet, and Post */}
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => document.getElementById("image-upload").click()}
                className="px-4 py-2 text-white rounded-md hover:opacity-80"
                style={{ backgroundColor: "var(--tertiary)" }}
              >
                Attach Picture
              </button>
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />

              <button
                type="button"
                onClick={() => setIsCodeSnippetVisible(!isCodeSnippetVisible)}
                className="px-4 py-2 text-white rounded-md hover:opacity-80"
                style={{ backgroundColor: "var(--tertiary)" }}
              >
                Attach Code Snippet
              </button>
            </div>

            {/* Post Button */}
            <button
              type="submit"
              className="px-4 py-2 ml-3 text-white rounded-md hover:opacity-80"
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
            posts.map(
              (post) =>
                post && (
                  <Post
                    key={post._id}
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
                )
            )
          ) : (
            <div
              className="text-center p-4 rounded-lg"
              style={{ backgroundColor: "var(--secondary)" }}
            >
              No posts available
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
