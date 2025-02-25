import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AsideMenu from "../components/AsideMenu";

const API_URL = "http://localhost:5000";

export default function Feed() {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState("");
  const [likedPosts, setLikedPosts] = useState({});
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
      // console.log(data);

      setPosts(data || []);
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  };
  console.log(posts);
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

    if (!newPost.trim()) {
      alert("Please enter a text.");
      return;
    }
    if (!token) {
      alert("You must be logged in to post.");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/posts`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: newPost }),
      });
      console.log(response);
      if (!response.ok) {
        throw new Error("Failed to create post");
      }

      setNewPost("");
      fetchPosts();
    } catch (error) {
      console.error("Error creating post:", error);
    }
  };

  return (
  <div className="flex flex-row divide-x min-h-screen" style={{ backgroundColor: "var(--primary)" }}>
    <AsideMenu />

    <div className="max-w-2xl mx-auto pt-8 px-4">
      <form
        onSubmit={handlePostSubmit}
        className="rounded-lg p-4 mb-6 shadow-md"
        style={{ backgroundColor: "var(--secondary)" }}
      >
        <textarea
          value={newPost}
          onChange={(e) => setNewPost(e.target.value)}
          placeholder="What's on your mind?"
          className="w-full p-2 rounded-md border-gray-300 focus:border-blue-400 focus:ring-blue-400"
          style={{ backgroundColor: "var(--tertiary)" }}
          rows="3"
        />
        <div className="mt-2 flex justify-between items-center">
          <button
            type="submit"
            className="px-4 py-2 rounded-md hover:opacity-80"
            style={{ backgroundColor: "var(--tertiary)" }}
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
            <div key={post._id} className="rounded-lg shadow-md p-4" style={{ backgroundColor: "var(--secondary)" }}>
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
                      {post.author?.username ? post.author.username[0].toUpperCase() : "?"}
                    </span>
                  )}
                </div>
                <span className="ml-2 font-medium">{post.author ? post.author.username : "Unknown User"}</span>
              </div>

              <p>{post.content}</p>
              {post.image && (
                <img src={post.image} alt="Post content" className="rounded-md w-full mb-4" />
              )}

              <div className="flex items-center space-x-4">
                <button onClick={() => handleLike(post._id)}>
                  {likedPosts[post._id] ? "🩶" : "❤️"} ({post.likes.length})
                </button>
                <span>💬 {post.comments?.length || 0}</span>
              </div>

              {post.comments && post.comments.length > 0 && (
                <div className="border-t border-gray-200 p-4">
                  {post.comments.map((comment) => (
                    <div key={comment._id} className="text-sm flex items-center space-x-2 mb-2">
                      <div className="w-8 h-8 rounded-full bg-blue-400 flex items-center justify-center text-white overflow-hidden">
                        {comment.user?.profilePicture ? (
                          <img
                            src={comment.user.profilePicture}
                            alt="Profile"
                            className="w-full h-full object-cover rounded-full"
                          />
                        ) : (
                          <span>
                            {comment.user?.username ? comment.user.username[0].toUpperCase() : "?"}
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
          ))
        )}
      </div>
    </div>
  </div>
);
}