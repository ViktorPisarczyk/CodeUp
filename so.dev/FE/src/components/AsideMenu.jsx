import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { FaGear } from "react-icons/fa6";
import { IoLogOutOutline } from "react-icons/io5";
import { MyContext } from "../context/ThemeContext";
import { motion } from "framer-motion";
import Toggle from "./Toggle";

const AsideMenu = () => {
  const navigate = useNavigate();
  const { darkMode } = useContext(MyContext);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <div className="flex flex-col sticky w-50 h-screen top-0 bg-(--secondary)">
      <div className="flex flex-col content-center space-y-6 h-200">
        <img
          className="sticky top-0 rounded-full box-content self-center h-20 w-20 p-4"
          src="https://img.freepik.com/free-vector/smiling-young-man-illustration_1308-173524.jpg?t=st=1739442424~exp=1739446024~hmac=8fdf51934914a44f0c6c6e31f4896f6b8d3ce8e30f70a496347ede2af6634fad&w=740"
          alt="avatar"
        />
        <button
          onClick={() => navigate("/feed")}
          className="h-10 hover:bg-(--primary) rounded-full"
        >
          Home
        </button>
        <button
          onClick={() => navigate("/profile")}
          className="h-10 hover:bg-(--primary) rounded-full"
        >
          Profile
        </button>
      </div>
      <div className="flex flex-col sticky top-200 space-y-6">
        <button
          onClick={() => setIsSettingsOpen(!isSettingsOpen)}
          className="flex items-center justify-start ml-3 h-10 hover:bg-(--primary) rounded-full"
        >
          <FaGear className="mr-2" size={24} color={darkMode ? "white" : "black"} />
          Settings
        </button>
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: isSettingsOpen ? "auto" : 0, opacity: isSettingsOpen ? 1 : 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="overflow-hidden"
        >
          <button className="w-full  h-10 hover:bg-(--primary) rounded-full">Edit Profile</button>
          <button className="w-full h-10 hover:bg-(--primary) rounded-full">Privacy</button>
          <button className="w-full h-10 hover:bg-(--primary) rounded-full">Notification Settings</button>
          <button className="w-full h-10 hover:bg-(--primary) rounded-full">Help & Support</button>
          <button className="w-full h-10 hover:bg-(--primary) rounded-full">About</button>
          <Toggle/>
        </motion.div>
        <button className="flex items-center justify-center h-10 hover:bg-(--primary) rounded-full">
          <IoLogOutOutline size={24} color={darkMode ? "white" : "black"} />
          Logout
        </button>
      </div>
    </div>
  );
};

export default AsideMenu;
