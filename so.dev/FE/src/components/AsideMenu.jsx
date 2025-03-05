import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { FaGear } from "react-icons/fa6";
import { CgProfile } from "react-icons/cg";
import { IoLogOutOutline } from "react-icons/io5";
import { MdHome } from "react-icons/md";
import { MyContext } from "../context/ThemeContext";
import { motion } from "framer-motion";
import Toggle from "./Toggle";
import ChatBot from "./ChatBot";

const AsideMenu = () => {
  const navigate = useNavigate();
  const { darkMode } = useContext(MyContext);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const logoutHandler = async () => {
    try {
      await fetch("http://localhost:5001/users/logout", {
        method: "POST",
        credentials: "include",
      });

      localStorage.removeItem("token");
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="flex flex-col sticky max-w-50 h-screen top-0 bg-(--secondary)">
      <img
        className="sticky top-0 rounded-full box-content self-center h-20 w-20 p-4"
        src="https://img.freepik.com/free-vector/smiling-young-man-illustration_1308-173524.jpg?t=st=1739442424~exp=1739446024~hmac=8fdf51934914a44f0c6c6e31f4896f6b8d3ce8e30f70a496347ede2af6634fad&w=740"
        alt="avatar"
      />
      <button
        onClick={() => navigate("/feed")}
        className="flex items-center pl-5  h-10 hover:bg-(--primary) rounded-full"
      >
        <MdHome
          className="mr-2"
          size={24}
          color={darkMode ? "white" : "black"}
        />{" "}
        Home
      </button>
      <button
        onClick={() => navigate("/profile")}
        className="flex items-center  pl-5  h-10 hover:bg-(--primary) rounded-full"
      >
        <CgProfile
          className="mr-2"
          size={24}
          color={darkMode ? "white" : "black"}
        />{" "}
        Profile
      </button>

      <button
        onClick={() => setIsSettingsOpen(!isSettingsOpen)}
        className="flex items-center pl-5  h-10 hover:bg-(--primary) rounded-full"
      >
        <FaGear
          className="mr-2"
          size={24}
          color={darkMode ? "white" : "black"}
        />
        Settings
      </button>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{
          height: isSettingsOpen ? "auto" : 0,
          opacity: isSettingsOpen ? 1 : 0,
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="overflow-hidden flex flex-col items-start sm:pl-9"
      >
        <button
          onClick={() => navigate("/edit-profile")}
          className="h-10 pl-3 w-full text-left hover:bg-(--primary) rounded-full"
        >
          Edit Profile
        </button>
        <button className="h-10 pl-3 w-full text-left hover:bg-(--primary) rounded-full">
          Privacy
        </button>
        <button className="h-10 pl-3 w-full text-left hover:bg-(--primary) rounded-full">
          Notification
        </button>
        <button
          onClick={() => setIsChatOpen(true)}
          className="h-10 pl-3 w-full text-left hover:bg-(--primary) rounded-full"
        >
          Help
        </button>
        <button className="h-10 pl-3 w-full text-left hover:bg-(--primary) rounded-full">
          About
        </button>
        <Toggle />
      </motion.div>
      <ChatBot isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
      <button
        onClick={logoutHandler}
        className="flex absolute bottom-0 left-3 items-center justify-center h-10 hover:bg-(--primary) rounded-full"
      >
        <IoLogOutOutline size={24} color={darkMode ? "white" : "black"} />
        Logout
      </button>
    </div>
  );
};

export default AsideMenu;
