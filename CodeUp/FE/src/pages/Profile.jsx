import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AsideMenu from "../components/AsideMenu";
import { jwtDecode } from "jwt-decode";
import Post from "../components/Post";
import { BsThreeDots } from "react-icons/bs";
import { IoClose } from "react-icons/io5";
import { FiMessageSquare } from "react-icons/fi";
import Alert from "../components/Alert";
import API_URL from "../config/api.js";

function Profile() {
  const { id } = useParams();
  const [user, setUser] = useState({});
  const [posts, setPosts] = useState([]);
  const [showCommentForm, setShowCommentForm] = useState({});
  const [newComment, setNewComment] = useState({});
  const [showDropdown, setShowDropdown] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [showReportAlert, setShowReportAlert] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

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

  const fetchUserPosts = useCallback(async () => {
    if (!userId) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found");

      const response = await fetch(
        `${API_URL}/posts/user/${userId}?populate=comments`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch user posts");

      const userPosts = await response.json();

      setPosts(userPosts);
    } catch (error) {
      console.error("Error fetching user posts", error);
    }
  }, [userId]);

  useEffect(() => {
    if (!loggedInUserId) {
      navigate("/login");
      return;
    }

    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No token found");

        const response = await fetch(`${API_URL}/users/${userId}`, {
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
  }, [id, userId, loggedInUserId, navigate, fetchUserPosts]);

  const handleLike = async (postId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("You must be logged in to like posts.");
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/posts/${postId}/like`,
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

    const commentText = newComment[postId]?.trim();
    if (!commentText) {
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
          text: commentText,
          post: postId,
          user: userId,
        }),
      });

      if (!response.ok) throw new Error("Failed to add comment");

      setNewComment((prev) => ({
        ...prev,
        [postId]: "",
      }));

      setShowCommentForm((prev) => ({
        ...prev,
        [postId]: false,
      }));

      fetchUserPosts();
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  const toggleCommentForm = (postId) => {
    setShowCommentForm((prev) => ({
      ...prev,
      [postId]: !prev[postId], // Toggle only the clicked post
    }));
  };

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const handleDeleteAccount = () => {
    setShowDeleteAlert(true);
    setShowDropdown(false);
  };

  const handleReportUser = () => {
    setShowReportAlert(true);
    setShowDropdown(false);
  };

  const handleDeleteConfirm = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("You need to be logged in to delete your account.");
        return;
      }

      const response = await fetch(
        `${API_URL}/users/${loggedInUserId}`,
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
        throw new Error(data.message || "Failed to delete account");
      }

      setShowDeleteAlert(false);
      setSuccessMessage("Account deleted successfully!");
      setShowSuccessAlert(true);

      // Clear local storage and redirect to login after a short delay
      setTimeout(() => {
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        navigate("/login");
      }, 2000);
    } catch (error) {
      console.error("Error deleting account:", error);
    }
  };

  const handleReportConfirm = async () => {
    try {
      setShowReportAlert(false);
      setSuccessMessage("User reported successfully!");
      setShowSuccessAlert(true);
    } catch (error) {
      console.error("Error reporting user:", error);
    }
  };

  const handleSuccessConfirm = () => {
    setShowSuccessAlert(false);
  };

  const startConversation = async () => {
    if (!userId || userId === loggedInUserId) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("You must be logged in to send messages.");
        return;
      }

      console.log("Starting conversation with user ID:", userId);

      const response = await fetch(
        `${API_URL}/messages/conversations/user/${userId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error creating conversation:", errorData);
        throw new Error(errorData.message || "Failed to create conversation");
      }

      const conversation = await response.json();
      console.log("Conversation created/retrieved:", conversation);

      // Navigate to messages page with this conversation open
      navigate("/messages", { state: { activeConversation: conversation.id } });
    } catch (error) {
      console.error("Error in startConversation:", error);
      alert(
        `Failed to start conversation: ${
          error.message || "Please try again later"
        }`
      );
    }
  };

  return (
    <div className="flex flex-row min-h-full bg-(--primary)">
      <AsideMenu />

      <div className="flex flex-col mx-auto w-full max-w-2xl px-4">
        {/* Alert Components */}
        {showSuccessAlert && (
          <Alert
            message={successMessage}
            onConfirm={handleSuccessConfirm}
            onCancel={handleSuccessConfirm}
            isSuccess={true}
          />
        )}
        {showDeleteAlert && (
          <Alert
            message="Are you sure you want to delete your account? This action cannot be undone."
            onConfirm={handleDeleteConfirm}
            onCancel={() => setShowDeleteAlert(false)}
          />
        )}
        {showReportAlert && (
          <Alert
            message="Are you sure you want to report this user?"
            onConfirm={handleReportConfirm}
            onCancel={() => setShowReportAlert(false)}
          />
        )}

        {/* Profile Section */}
        <div className="flex flex-col md:flex-row pb-10  items-center relative rounded-xl p-5 my-10 bg-(--secondary)">
          <div className="flex flex-col items-center md:items-start md:w-1/3">
            {/* Profile Picture */}
            <img
              className="rounded-full h-32 w-32 md:h-40 md:w-40 object-cover"
              src={
                user.profilePicture ||
                "https://cdn.pixabay.com/photo/2016/08/08/09/17/avatar-1577909_1280.png"
              }
              alt="avatar"
            />
          </div>
          <div className="mt-4 md:mt-0 md:ml-8 text-center md:text-left">
            <h2 className="text-2xl md:text-3xl font-semibold mb-2">
              {user.username || "User"}
            </h2>
            <h4 className="text-lg ">
              {user.location || "This user has not updated their location yet."}
            </h4>
            <p className="mt-4 ">
              {user.bio || "This user has not updated their bio yet."}
            </p>

            {/* Message Button - Only show when viewing someone else's profile */}
            {userId !== loggedInUserId && (
              <button
                onClick={startConversation}
                className="mt-4 flex items-center gap-2 px-4 py-2 rounded-md text-white"
                style={{ backgroundColor: "var(--tertiary)" }}
              >
                <FiMessageSquare />
                <span>Message</span>
              </button>
            )}
            {/* Three Dots Menu */}
            <div className="absolute top-4 right-4">
              <BsThreeDots
                className="cursor-pointer hover:opacity-70 text-xl"
                onClick={toggleDropdown}
              />

              {showDropdown && (
                <>
                  <div
                    className="fixed inset-0 z-32"
                    onClick={() => setShowDropdown(false)}
                  />
                  <div
                    className="absolute right-0 top-8 rounded-lg shadow-lg py-2 z-33"
                    style={{
                      backgroundColor: "var(--tertiary)",
                      minWidth: "150px",
                    }}
                  >
                    {loggedInUserId === userId ? (
                      <>
                        <button
                          className="w-full text-white text-left px-4 py-1 hover:opacity-70"
                          onClick={() => {
                            navigate("/edit-profile");
                            setShowDropdown(false);
                          }}
                        >
                          Edit Profile
                        </button>
                        <button
                          className="w-full text-left text-white px-4 py-1 hover:opacity-70"
                          onClick={handleDeleteAccount}
                        >
                          Delete Account
                        </button>
                      </>
                    ) : (
                      <button
                        className="w-full text-left px-4 text-white py-2 hover:opacity-70"
                        onClick={handleReportUser}
                      >
                        Report User
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Posts Section */}
        <div className="w-full divide-y divide-gray-300">
          <div className="mt-10 mb-6">
            <h1 className="text-3xl mb-2 font-bold">
              Posts by {user.username || "User"}
            </h1>
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
                  showCommentForm={showCommentForm[post._id] || false}
                  toggleCommentForm={() => toggleCommentForm(post._id)}
                  newComment={newComment}
                  setNewComment={setNewComment}
                  handleCommentSubmit={handleCommentSubmit}
                  userId={userId}
                  fetchUserPosts={fetchUserPosts}
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
