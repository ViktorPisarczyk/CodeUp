import React, { useState, useEffect } from "react";
import AsideMenu from "../components/AsideMenu";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode"; // Make sure you import jwtDecode

// Function to get user ID from token
const getUserIdFromToken = () => {
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    const decoded = jwtDecode(token);
    return decoded.id; // Assuming the JWT contains the 'id' of the user
  } catch (error) {
    console.error("Invalid token", error);
    return null;
  }
};

function Profile() {
  const [user, setUser] = useState({}); // State to hold user data
  const [posts, setPosts] = useState([]); // State to hold posts
  const [loading, setLoading] = useState(false); // Loading state. !!!Set to True later on!!!
  const [error, setError] = useState(null); // Error state

  const navigate = useNavigate();

  const userId = getUserIdFromToken();

  // useEffect(() => {
  //   if (!userId) {
  //     navigate("/login"); // If no user ID, redirect to login page
  //     return;
  //   }

  //   // Fetch user data from backend
  //   const fetchUserData = async () => {
  //     try {
  //       setLoading(true);
  //       const response = await fetch(`http://localhost:5001/users/${userId}`);
  //       if (!response.ok) {
  //         throw new Error("Failed to fetch user data");
  //       }
  //       const data = await response.json();
  //       setUser(data); // Set the user data
  //     } catch (error) {
  //       setError("Error fetching user data");
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchUserData();
  // }, [userId, navigate]);

  const handlePostSubmit = (e) => {
    e.preventDefault();
    if (!newPost.trim()) return;

    const post = {
      id: posts.length + 1,
      username: "currentUser",
      content: newPost,
      likes: 0,
      comments: [],
    };

    setPosts([post, ...posts]);
    setNewPost("");
  };
  console.log(user);
  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="flex flex-row bg-(--primary)">
      <AsideMenu />
      <div className="flex flex-col m-auto w-full max-w-screen-lg px-4">
        {/* Profile Section */}
        <div className="flex flex-col md:flex-row justify-center items-center rounded-xl p-5 my-10 bg-(--secondary)">
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
              {userId.username || "John"} {user.lastname || "Doe"}
            </h2>
            <h4 className="text-lg ">{user.location || "Berlin"}</h4>
            <h4 className="text-lg">{user.role || "Web Developer"}</h4>
            <p className="mt-4 ">
              {user.bio || "This user has not updated their bio yet."}
            </p>
            <button
              onClick={() => navigate("/edit-profile")}
              className="mt-4 px-4 py-2 bg-(--tertiary) text-white rounded-md hover:bg-blue-600"
            >
              Edit Profile
            </button>
          </div>
        </div>

        {/* Posts Section */}
        <div className="w-full divide-y divide-gray-300">
          <div className="mt-10 mb-6">
            <h1 className="text-3xl font-bold">Posts</h1>
            <button className="mt-5 px-6 py-2 bg-(--secondary) rounded-md hover:bg-gray-400">
              Create Post
            </button>
          </div>

          {/* Posts List */}
          <div className="space-y-6">
            {posts.length > 0 ? (
              posts.map((post) => (
                <div
                  key={post.id}
                  className="bg-(--secondary) rounded-lg shadow-md p-4"
                >
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 rounded-full bg-blue-400 dark:bg-purple-500 flex items-center justify-center text-white">
                      {post.username[0].toUpperCase()}
                    </div>
                    <span className="ml-2 font-medium">{post.username}</span>
                  </div>
                  <p className="mb-4">{post.content}</p>
                  {post.image && (
                    <img
                      src={post.image}
                      alt="Post content"
                      className="rounded-md w-full mb-4 object-cover"
                    />
                  )}
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <button className="flex items-center space-x-1">
                      <span>🩶</span>
                      <span>{post.likes}</span>
                    </button>
                    <button className="flex items-center space-x-1">
                      <span>💬</span>
                      <span>{post.comments.length}</span>
                    </button>
                  </div>
                  {post.comments.length > 0 && (
                    <div className="border-t border-gray-200 dark:border-purple-700 p-4">
                      {post.comments.map((comment) => (
                        <div key={comment.id} className="text-sm">
                          <span className="font-medium">
                            {comment.username}:
                          </span>{" "}
                          {comment.content}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div>No posts yet. Be the first to post!</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
