import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import AsideMenu from "../components/AsideMenu";
import Post from "../components/Post";
import { jwtDecode } from "jwt-decode";
import logoLM from "../assets/newLogoLM.png";
import logoDM from "../assets/newLogoDM.png";
import { MyContext } from "../context/ThemeContext";

const API_URL = "http://localhost:5001";

export default function Feed() {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState("");
  const [newComment, setNewComment] = useState({});
  const [showCommentForm, setShowCommentForm] = useState(null);
  const [imageFile, setImageFile] = useState(null); // For the picture
  const [codeSnippet, setCodeSnippet] = useState(""); // For the code snippet
  const [isCodeSnippetVisible, setIsCodeSnippetVisible] = useState(false); // To control the visibility of the code snippet textarea
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

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    if (!newPost.trim()) {
      alert("Please enter a text.");
      return;
    }

    const formData = new FormData();
    formData.append("content", newPost);
    if (imageFile) {
      formData.append("image", imageFile);
    }
    if (codeSnippet.trim()) {
      formData.append("codeSnippet", codeSnippet);
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
      setCodeSnippet("");
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

  const userId = getUserIdFromToken();
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
          <textarea
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            placeholder="What's on your mind?"
            className="w-full p-2 rounded-md text-black border-gray-300 focus:border-blue-400 focus:ring-blue-400"
            style={{ backgroundColor: "var(--textarea)" }}
            rows="3"
          />
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
                onChange={(e) => setImageFile(e.target.files[0])}
                className="hidden"
              />

              <button
                type="button"
                onClick={() => setIsCodeSnippetVisible(!isCodeSnippetVisible)} // Toggle the visibility of code snippet
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

          {/* Conditionally render code snippet textarea based on state, moved below the button */}
          {isCodeSnippetVisible && (
            <textarea
              value={codeSnippet}
              onChange={(e) => setCodeSnippet(e.target.value)}
              placeholder="Add your code snippet"
              className="w-full p-2 mt-2 text-black rounded-md border-gray-300 focus:border-blue-400 focus:ring-blue-400"
              style={{ backgroundColor: "var(--textarea)" }}
              rows="4"
            />
          )}
        </form>

        <div className="space-y-6">
          {posts && posts.length > 0 ? (
            posts.map((post) => (
              post && (
                <Post
                  key={post._id}
                  post={post}
                  handleLike={handleLike}
                  showCommentForm={showCommentForm === post._id}
                  toggleCommentForm={() => toggleCommentForm(post._id)}
                  newComment={newComment[post._id] || ""}
                  setNewComment={(value) =>
                    setNewComment((prev) => ({ ...prev, [post._id]: value }))
                  }
                  handleCommentSubmit={(e) => handleCommentSubmit(post._id, e)}
                  fetchPosts={fetchPosts}
                  onDelete={async (postId) => {
                    const token = localStorage.getItem("token");
                    try {
                      const response = await fetch(`${API_URL}/posts/${postId}`, {
                        method: "DELETE",
                        headers: {
                          Authorization: `Bearer ${token}`,
                        },
                      });
                      if (!response.ok) throw new Error("Failed to delete post");
                      fetchPosts();
                    } catch (error) {
                      console.error("Error deleting post:", error);
                    }
                  }}
                  onEdit={async (postId, newContent) => {
                    const token = localStorage.getItem("token");
                    try {
                      const response = await fetch(`${API_URL}/posts/${postId}`, {
                        method: "PUT",
                        headers: {
                          "Content-Type": "application/json",
                          Authorization: `Bearer ${token}`,
                        },
                        body: JSON.stringify({ content: newContent }),
                      });
                      if (!response.ok) throw new Error("Failed to edit post");
                      fetchPosts();
                    } catch (error) {
                      console.error("Error editing post:", error);
                    }
                  }}
                  onReport={async (postId) => {
                    const token = localStorage.getItem("token");
                    try {
                      const response = await fetch(`${API_URL}/posts/${postId}/report`, {
                        method: "POST",
                        headers: {
                          Authorization: `Bearer ${token}`,
                        },
                      });
                      if (!response.ok) throw new Error("Failed to report post");
                    } catch (error) {
                      console.error("Error reporting post:", error);
                    }
                  }}
                  onCommentDelete={async (commentId) => {
                    const token = localStorage.getItem("token");
                    try {
                      const response = await fetch(`${API_URL}/comments/${commentId}`, {
                        method: "DELETE",
                        headers: {
                          Authorization: `Bearer ${token}`,
                        },
                      });
                      if (!response.ok) throw new Error("Failed to delete comment");
                      fetchPosts();
                    } catch (error) {
                      console.error("Error deleting comment:", error);
                    }
                  }}
                  onCommentEdit={async (commentId, newContent) => {
                    const token = localStorage.getItem("token");
                    try {
                      const response = await fetch(`${API_URL}/comments/${commentId}`, {
                        method: "PUT",
                        headers: {
                          "Content-Type": "application/json",
                          Authorization: `Bearer ${token}`,
                        },
                        body: JSON.stringify({ content: newContent }),
                      });
                      if (!response.ok) throw new Error("Failed to edit comment");
                      fetchPosts();
                    } catch (error) {
                      console.error("Error editing comment:", error);
                    }
                  }}
                />
              )
            ))
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
