import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AsideMenu from "../components/AsideMenu";

const API_URL = "http://localhost:5000";

export default function Feed() {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState("");
  const [likedPosts, setLikedPosts] = useState({});
  const [showCommentForm, setShowCommentForm] = useState(null); // Track which post is selected for commenting
  const [newComment, setNewComment] = useState({}); // Store new comment for each post
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    } else {
      fetchPosts();
    }
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

      setLikedPosts((prev) => ({
        ...prev,
        [postId]: !prev[postId],
      }));

      fetchPosts();
    } catch (error) {
      console.error("Error while liking post:", error);
    }
  };

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    if (!newPost.trim()) return;
    if (!token) {
      alert("You must be logged in to post.");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/posts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: newPost }),
      });

      if (!response.ok) {
        throw new Error("Failed to create post");
      }

      setNewPost("");
      fetchPosts();
    } catch (error) {
      console.error("Error creating post:", error);
    }
  };

  const handleCommentSubmit = async (postId, e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    if (!newComment[postId]?.trim()) return; // Ensure there's a comment

    if (!token) {
      alert("You must be logged in to comment.");
      return;
    }

    try {
      console.log("Submitting comment:", newComment[postId]); // Debugging log

      const response = await fetch(`${API_URL}/posts/${postId}/comment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text: newComment[postId] }), // Ensure this matches your API structure
      });

      if (!response.ok) {
        throw new Error("Failed to add comment");
      }

      // Clear the comment input
      setNewComment((prev) => ({
        ...prev,
        [postId]: "",
      }));

      // Hide comment form and refetch posts (including comments)
      setShowCommentForm(null);
      fetchPosts();
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  const toggleCommentForm = (postId) => {
    setShowCommentForm(postId === showCommentForm ? null : postId); // Toggle visibility of comment form
  };

  return (
    <div className="flex flex-row divide-x min-h-screen bg-(--primary)">
      <AsideMenu />

      <div className="max-w-2xl mx-auto pt-8 px-4">
        <form
          onSubmit={handlePostSubmit}
          className="bg-(--secondary) rounded-lg p-4 mb-6 shadow-md"
        >
          <textarea
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            placeholder="What's on your mind?"
            className="w-full p-2 rounded-md border-gray-300 focus:border-blue-400 focus:ring-blue-400 bg-(--tertiary)"
            rows="3"
          />
          <div className="mt-2 flex justify-between items-center">
            <button
              type="submit"
              className="px-4 py-2 bg-(--tertiary) rounded-md hover:bg-(--primary)"
            >
              Post
            </button>
          </div>
        </form>

        <div className="space-y-6">
          {posts.length === 0 ? (
            <p>No posts available</p>
          ) : (
            posts.map((post) => (
              <div
                key={post._id}
                className="bg-(--secondary) max-w-300 rounded-lg shadow-md"
              >
                <div className="p-4">
                  <div className="flex items-center mb-2">
                    <div className="w-10 h-10 rounded-full bg-blue-400 flex items-center justify-center text-white">
                      {post.author && post.author.username
                        ? post.author.username[0].toUpperCase()
                        : "?"}
                    </div>
                    <span className="ml-2 font-medium">
                      {post.author ? post.author.username : "Unknown User"}
                    </span>
                  </div>
                  <p>{post.description}</p>{" "}
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
                    <button onClick={() => toggleCommentForm(post._id)}>
                      💬 {post.comments?.length || 0}
                    </button>
                  </div>
                </div>

                {/* Show comments */}
                {post.comments && post.comments.length > 0 && (
                  <div className="border-t border-gray-200 p-4">
                    {post.comments.map((comment) => (
                      <div key={comment._id} className="text-sm">
                        <span className="font-medium">
                          {comment.user?.username}:
                        </span>
                        {comment.text}
                      </div>
                    ))}
                  </div>
                )}

                {/* Comment form toggle */}
                {showCommentForm === post._id && (
                  <div className="p-4 border-t border-gray-200">
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
                        className="w-full p-2 rounded-md border-gray-300 focus:border-blue-400 focus:ring-blue-400 bg-(--tertiary)"
                        rows="3"
                      />
                      <button
                        type="submit"
                        className="mt-2 px-4 py-2 bg-(--tertiary) rounded-md hover:bg-(--primary)"
                      >
                        Comment
                      </button>
                    </form>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
