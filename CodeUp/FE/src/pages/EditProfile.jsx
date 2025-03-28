import React, { useState, useEffect } from "react";
import AsideMenu from "../components/AsideMenu";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import Alert from "../components/Alert"; // Import the Alert component
import API_URL from "../config/api.js";

const EditProfile = () => {
  const navigate = useNavigate();
  const [existingUser, setExistingUser] = useState({});
  const [user, setUser] = useState({
    username: "",
    email: "",
    location: "",
    bio: "",
    profilePicture: "",
  });
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false); // Add state for success alert

  // Get user ID from token
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

  // Fetch current user data when component mounts
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          `${API_URL}/users/${loggedInUserId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setExistingUser(data);
          setUser(data);
          // Set initial profile picture preview if it exists
          if (data.profilePicture) {
            setImagePreviewUrl(data.profilePicture);
          }
        } else {
          console.error("Error fetching user data");
        }
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      }
    };

    if (loggedInUserId) {
      fetchUserData();
    }
  }, [loggedInUserId]);

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUser((prevUser) => ({ ...prevUser, [name]: value }));
  };

  // Handle file selection without submitting form
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUser((prevUser) => ({ ...prevUser, profilePicture: file }));
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();

    // Append only fields that have changed
    if (user.username && user.username !== existingUser.username) {
      formData.append("username", user.username);
    }
    if (user.email && user.email !== existingUser.email) {
      formData.append("email", user.email);
    }
    if (user.location && user.location !== existingUser.location) {
      formData.append("location", user.location);
    }
    if (user.bio && user.bio !== existingUser.bio) {
      formData.append("bio", user.bio);
    }
    if (user.profilePicture && typeof user.profilePicture !== "string") {
      formData.append("profilePicture", user.profilePicture);
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_URL}/users/${loggedInUserId}`,
        {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        }
      );

      const data = await response.json();
      if (response.ok) {
        setShowSuccessAlert(true);
      } else {
        console.error("Error updating profile:", data.message);
      }
    } catch (error) {
      console.error("Failed to update profile:", error);
    }
  };

  return (
    <div className="flex h-screen">
      <AsideMenu />
      <div className="bg-(--primary) w-full flex flex-col justify-center items-center">
        <h2 className="text-(--tertiary) text-3xl font-bold mb-5">
          Edit Profile
        </h2>

        <form
          onSubmit={handleSubmit}
          className="bg-(--secondary) p-8 rounded-lg shadow-xl w-xs md:w-xl max-w-xl mx-4"
        >
          {showSuccessAlert && (
            <Alert
              message="Profile updated successfully!"
              onConfirm={() => {
                setShowSuccessAlert(false);
                navigate(`/profile/${loggedInUserId}`);
              }}
              isSuccess={true}
            />
          )}
          <div>
            {/* Profile Picture Preview - Always visible */}
            <div className="mb-4">
              <img
                src={
                  imagePreviewUrl ||
                  "https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png"
                }
                alt="Profile Preview"
                className="w-32 h-32 rounded-full object-cover mx-auto border-2"
                style={{ borderColor: "var(--tertiary)" }}
              />
            </div>

            <label
              className="block text-sm font-medium text-center"
              htmlFor="profilePicture"
            >
              <button
                type="button"
                className="mb-2 py-2 px-4 border border-transparent rounded-md shadow-sm hover:bg-(--primary) focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 bg-(--tertiary) hover:text-(--quaternary)"
                onClick={() =>
                  document.getElementById("profilePicture").click()
                }
              >
                {imagePreviewUrl ? "Change Picture" : "Upload Picture"}
              </button>
            </label>
            <input
              type="file"
              id="profilePicture"
              name="profilePicture"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {/* Username */}
          <div>
            <label
              className="mt-5 block text-sm font-medium"
              htmlFor="username"
            >
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={user.username || ""}
              onChange={handleInputChange}
              placeholder="Enter your username"
              className="mt-1 mb-5 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-400 focus:ring-blue-400 bg-white text-black"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium" htmlFor="email">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={user.email || ""}
              onChange={handleInputChange}
              placeholder="Enter your email"
              className="mt-1 mb-5 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-400 focus:ring-blue-400 bg-white text-black"
            />
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium" htmlFor="location">
              Location
            </label>
            <input
              id="location"
              name="location"
              value={user.location || ""}
              onChange={handleInputChange}
              placeholder="Enter your location"
              className="mt-1 mb-5 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-400 focus:ring-blue-400 bg-white text-black"
            />
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-medium" htmlFor="bio">
              Bio
            </label>
            <textarea
              id="bio"
              name="bio"
              value={user.bio || ""}
              rows="4"
              maxLength={100}
              onChange={handleInputChange}
              placeholder="Tell us about yourself"
              className="mt-1 mb-5 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-400 focus:ring-blue-400 bg-white text-black"
            />
          </div>

          {/* Save Changes Button */}
          <button
            type="submit"
            className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm hover:bg-(--primary) focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 bg-(--tertiary) hover:text-(--quaternary)"
          >
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditProfile;
