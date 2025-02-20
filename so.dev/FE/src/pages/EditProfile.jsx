import React, { useState } from "react";
import AsideMenu from "../components/AsideMenu";
import { useNavigate } from "react-router-dom";

const EditProfile = () => {
  const [user, setUser] = useState({
    firstname: "",
    lastname: "",
    username: "",
    email: "",
    location: "",
    role: "",
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
    // Handle form submission (e.g., send data to backend)
    console.log("Profile updated:", user);
  };

  return (
    <div className="bg-(--primary) h-screen flex flex-col justify-center items-center">
      <h2 className="text-(--tertiary) text-3xl font-bold mb-5">
        Edit Profile
      </h2>
      <form
        onSubmit={handleSubmit}
        className="bg-(--secondary) p-8 rounded-lg shadow-xl w-full max-w-md"
      >
        <div className="">
          <label className="block text-sm font-medium" htmlFor="profilePicture">
            + Change Picture
          </label>
          <input
            type="file"
            id="profilePicture"
            name="profilePicture"
            accept="image/*"
            onChange={handleFileChange}
          />
        </div>

        <div className="form-group">
          <label className="mt-5 block text-sm font-medium" htmlFor="firstName">
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

        <div className="form-group">
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

        <div className="form-group">
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

        <div className="form-group">
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

        <div className="form-group">
          <label className="block text-sm font-medium" htmlFor="location">
            Location
          </label>
          <textarea
            id="location"
            name="location"
            value={user.location}
            onChange={handleInputChange}
            placeholder="Enter your location"
            className="mt-1 mb-5 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-400 focus:ring-blue-400 bg-white text-black"
          />
        </div>

        <div className="form-group">
          <label className="block text-sm font-medium" htmlFor="role">
            Role
          </label>
          <input
            type="text"
            id="role"
            name="role"
            value={user.role}
            onChange={handleInputChange}
            placeholder="Enter your role"
            className="mt-1 mb-5 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-400 focus:ring-blue-400 bg-white text-black"
          />
        </div>

        <div className="form-group">
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
          onClick={() => navigate("/profile")}
          type="submit"
          className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm  hover:bg-(--primary) focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500   bg-(--primary) hover:text-(--quaternary)"
        >
          Save Changes
        </button>
      </form>
    </div>
  );
};

export default EditProfile;
