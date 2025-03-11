import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AsideMenu from "../components/AsideMenu";
import { jwtDecode } from "jwt-decode";
import Post from "../components/Post";

function Profile() {
  const { id } = useParams();
  const [user, setUser] = useState({});
  const [posts, setPosts] = useState([]);
  const [showCommentForm, setShowCommentForm] = useState(null);
  const [newComment, setNewComment] = useState({});

  const navigate = useNavigate();

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
  const userId = id || loggedInUserId;

  const fetchUserPosts = async () => {
    if (!userId) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found");

      const response = await fetch("http://localhost:5001/posts", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to fetch posts");

      const data = await response.json();

      const userPosts = data.filter((post) => post.author._id === userId);

      setPosts(userPosts);
    } catch (error) {
      console.error("Error fetching posts", error);
    }
  };

  useEffect(() => {
    if (!loggedInUserId) {
      navigate("/login");
      return;
    }

    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No token found");

        const response = await fetch(`http://localhost:5001/users/${userId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error("Failed to fetch user data");
        const data = await response.json();
        setUser(data);
      } catch (error) {
        console.error("Error fetching user data", error);
      }
    };

    fetchUserData();
    fetchUserPosts();
  }, [id]);

  const handleLike = async (postId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("You must be logged in to like posts.");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5001/posts/${postId}/like`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error("Failed to like the post");

      fetchUserPosts();
    } catch (error) {
      console.error("Error while liking post:", error);
    }
  };

  const handleCommentSubmit = async (postId, e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");
    const userId = loggedInUserId;

    if (!token) {
      alert("You must be logged in to comment.");
      return;
    }

    if (!newComment[postId]?.trim()) {
      alert("Please enter a comment.");
      return;
    }

    try {
      const response = await fetch(`http://localhost:5001/comments`, {
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

      if (!response.ok) throw new Error("Failed to add comment");

      setNewComment((prev) => ({
        ...prev,
        [postId]: "",
      }));

      setShowCommentForm(null);
      fetchUserPosts();
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  const toggleCommentForm = (postId) => {
    setShowCommentForm(postId === showCommentForm ? null : postId);
  };

  return (
    <div className="flex flex-row min-h-full bg-(--primary)">
      <AsideMenu />

      <div className="flex flex-col mx-auto w-full max-w-2xl px-4">

        {/* Profile Section */}
        <div className="flex flex-col md:flex-row pb-10  items-center relative rounded-xl p-5 my-10 bg-(--secondary)">
          <div className="flex flex-col items-center md:items-start md:w-1/3">
            {/* Profile Picture */}
            <img
              className="rounded-full h-32 w-32 md:h-40 md:w-40 object-cover"
              src={
                user.profilePicture ||
                "https://cdn.pixabay.com/photo/2016/08/08/09/17/avatar-1577909_1280.png"
              } // Fallback if profile picture is not set
              alt="avatar"
            />
          </div>
          <div className="mt-4 md:mt-0 md:ml-8 text-center md:text-left">
            <h2 className="text-2xl md:text-3xl font-semibold mb-2">
              {user.username || "User"}
            </h2>
            <h4 className="text-lg ">
              {user.location || "Please add your location"}
            </h4>
            <p className="mt-4 ">
              {user.bio || "This user has not updated their bio yet."}
            </p>
            {loggedInUserId === userId && (
              <button
                onClick={() => navigate("/edit-profile")}
                className="hover:bg-(--primary) absolute bottom-3 right-3 rounded-md"
              >
                Edit Profile
              </button>
            )}
          </div>
        </div>

        {/* Posts Section */}
        <div className="w-full divide-y divide-gray-300">
          <div className="mt-10 mb-6">
            <h1 className="text-3xl mb-2 font-bold">Posts</h1>
          </div>

          {/* Posts List */}
          <div className="space-y-6">
            {posts.length === 0 ? (
              <p>No posts available</p>
            ) : (
              posts.map((post) => (
                <Post
                  key={post._id}
                  post={post}
                  handleLike={handleLike}
                  showCommentForm={showCommentForm}
                  toggleCommentForm={toggleCommentForm}
                  newComment={newComment}
                  setNewComment={setNewComment}
                  handleCommentSubmit={handleCommentSubmit}
                  userId={userId}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
