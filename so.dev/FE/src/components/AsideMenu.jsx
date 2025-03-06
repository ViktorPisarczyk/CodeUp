import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaGear } from "react-icons/fa6";
import { CgProfile } from "react-icons/cg";
import { IoLogOutOutline } from "react-icons/io5";
import { MdHome } from "react-icons/md";
import { MyContext } from "../context/ThemeContext";
import { motion, AnimatePresence } from "framer-motion";
import { jwtDecode } from "jwt-decode";
import Toggle from "./Toggle";
import ChatBot from "./ChatBot";
import onlyLogoLM from "../assets/onlyLogoLM.png";
import onlyLogoDM from "../assets/onlyLogoDM.png";
import { FaBars } from "react-icons/fa";

const AsideMenu = () => {
  const navigate = useNavigate();
  const { darkMode } = useContext(MyContext);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [menuToggle, setMenuToggle] = useState(window.innerWidth >= 640);

  // Update menuToggle based on screen size
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 640) {
        // 640px is sm breakpoint in Tailwind
        setMenuToggle(true);
      }
    };

    // Initial check
    handleResize();

    // Add event listener
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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

  const handleMenuToggle = () => {
    setMenuToggle(!menuToggle);
  };

  return (

    <>

      <button
        onClick={handleMenuToggle}
        className="block sm:hidden fixed top-4 right-4 z-50"
      >
        <FaBars size={25} />
      </button>

      <AnimatePresence>
        <motion.div
          initial={{ x: "-100%" }}
          animate={{ x: menuToggle ? 0 : "-100%" }}
          exit={{ x: "-100%" }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className={`flex flex-col fixed sm:sticky w-64 sm:w-50 h-screen top-0 left-0 bg-(--secondary) z-40 
            ${menuToggle ? "block" : "hidden sm:flex"}`}
        >
          <img
            src={darkMode ? onlyLogoDM : onlyLogoLM}
            alt="logo"
            className="size-20 self-center mt-5 mb-10"
          />

          <img
            className="sticky top-0 rounded-full box-content self-center h-20 w-20 p-4"
            src="https://img.freepik.com/free-vector/smiling-young-man-illustration_1308-173524.jpg?t=st=1739442424~exp=1739446024~hmac=8fdf51934914a44f0c6c6e31f4896f6b8d3ce8e30f70a496347ede2af6634fad&w=740"
            alt="avatar"
          />
          <button
            onClick={() => {
              navigate("/feed");
              setMenuToggle(false);
            }}
            className="flex items-center pl-5 h-10 hover:bg-(--primary) rounded-full"
          >
            <MdHome
              className="mr-2"
              size={24}
              color={darkMode ? "white" : "black"}
            />
            Home
          </button>
          <button
            onClick={() => {
              navigate(`/profile/${loggedInUserId}`);
              setMenuToggle(false);
            }}
            className="flex items-center pl-5 h-10 hover:bg-(--primary) rounded-full"
          >
            <CgProfile
              className="mr-2"
              size={24}
              color={darkMode ? "white" : "black"}
            />
            Profile
          </button>
          <button
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            className="flex items-center pl-5 h-10 hover:bg-(--primary) rounded-full"
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
            className="overflow-hidden flex flex-col items-start pl-9"
          >
            <button
              onClick={() => {
                navigate("/edit-profile");
                setMenuToggle(false);
              }}
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
            onClick={() => {
              logoutHandler();
              setMenuToggle(false);
            }}
            className="flex absolute bottom-0 left-3 items-center justify-center h-10 hover:bg-(--primary) rounded-full"
          >
            <IoLogOutOutline size={24} color={darkMode ? "white" : "black"} />
            Logout
          </button>
        </motion.div>
      </AnimatePresence>

      {/* Overlay for mobile */}
      {menuToggle && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          exit={{ opacity: 0 }}
          onClick={handleMenuToggle}
          className="fixed inset-0 bg-black z-30 sm:hidden"
        />
      )}
    </>
  );
};

export default AsideMenu;
