import React, { useState } from "react";
import AsideMenu from "../components/AsideMenu";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const EditProfile = () => {
  const [user, setUser] = useState({
    firstname: "",
    lastname: "",
    username: "",
    email: "",
    location: "",
    bio: "",
    profilePicture: "",
  });

  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUser({ ...user, [name]: value });
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setUser({ ...user, [name]: files[0] });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
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

  return (
    <div className="flex">
      <AsideMenu />
      <div className="bg-(--primary)  w-full flex flex-col justify-center items-center">
        <h2 className="text-(--tertiary) text-3xl font-bold mb-5">
          Edit Profile
        </h2>
        <form
          onSubmit={handleSubmit}
          className="bg-(--secondary) p-8 rounded-lg shadow-xl w-xs md:w-xl max-w-xl mx-4 "
        >
          <div>
            <label
              className="block text-sm font-medium"
              htmlFor="profilePicture"
            >
              <button className="mb-2 py-2 px-4 border border-transparent rounded-md shadow-sm  hover:bg-(--primary) focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500   bg-(--tertiary) hover:text-(--quaternary)">
                Upload Picture
              </button>
            </label>
            <input
              type="file"
              id="profilePicture"
              name="profilePicture"
              accept="image/*"
              onChange={handleFileChange}
            />
          </div>

          <div>
            <label
              className="mt-5 block text-sm font-medium"
              htmlFor="firstName"
            >
              First Name
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={user.firstname}
              onChange={handleInputChange}
              placeholder="Enter your First Name"
              className="mt-1 mb-5 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-400 focus:ring-blue-400 bg-white text-black"
            />
          </div>

          <div>
            <label className="block text-sm font-medium" htmlFor="lastName">
              Last Name
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={user.lastname}
              onChange={handleInputChange}
              placeholder="Enter your Last Name"
              className="mt-1 mb-5 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-400 focus:ring-blue-400 bg-white text-black"
            />
          </div>

          <div>
            <label className="block text-sm font-medium" htmlFor="username">
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={user.username}
              onChange={handleInputChange}
              placeholder="Enter your username"
              className="mt-1 mb-5 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-400 focus:ring-blue-400 bg-white text-black"
            />
          </div>

          <div>
            <label className="block text-sm font-medium" htmlFor="email">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={user.email}
              onChange={handleInputChange}
              placeholder="Enter your email"
              className="mt-1 mb-5 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-400 focus:ring-blue-400 bg-white text-black"
            />
          </div>

          <div>
            <label className="block text-sm font-medium" htmlFor="location">
              Location
            </label>
            <input
              id="location"
              name="location"
              value={user.location}
              onChange={handleInputChange}
              placeholder="Enter your location"
              className="mt-1 mb-5 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-400 focus:ring-blue-400 bg-white text-black"
            />
          </div>

          <div>
            <label className="block text-sm font-medium" htmlFor="bio">
              Bio
            </label>
            <textarea
              id="bio"
              name="bio"
              value={user.bio}
              rows="4"
              maxLength={100}
              onChange={handleInputChange}
              placeholder="Tell us about yourself"
              className="mt-1 mb-5 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-400 focus:ring-blue-400 bg-white text-black"
            />
          </div>

          <button
            onClick={() => navigate(`/profile/${loggedInUserId}`)}
            type="submit"
            className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm  hover:bg-(--primary) focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500   bg-(--tertiary) hover:text-(--quaternary)"
          >
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditProfile;
