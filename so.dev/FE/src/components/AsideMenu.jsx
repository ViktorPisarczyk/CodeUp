import { useState, useContext, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaGear } from "react-icons/fa6";
import { CgProfile } from "react-icons/cg";
import { IoLogOutOutline } from "react-icons/io5";
import { MdHome } from "react-icons/md";
import { MyContext } from "../context/ThemeContext";
import { motion, AnimatePresence } from "framer-motion";
import { jwtDecode } from "jwt-decode";
import Toggle from "./Toggle";
import ChatBot from "./ChatBot";
import onlyLogoLM from "../assets/NewOnlyLogoLM.png";
import onlyLogoDM from "../assets/NewOnlyLogoDM.png";
import { FaBars } from "react-icons/fa";

const AsideMenu = () => {
  const navigate = useNavigate();
  const { darkMode } = useContext(MyContext);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [menuToggle, setMenuToggle] = useState(window.innerWidth >= 640);
  const cachedUserData = JSON.parse(localStorage.getItem("userData")) || {};
  const [userData, setUserData] = useState(cachedUserData);

  // Update menuToggle based on screen size
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 640) {
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

  // Handle navigation and preserve menu state on larger screens
  const handleNavigation = (path) => {
    navigate(path);
    if (window.innerWidth < 640) {
      setMenuToggle(false);
    }
  };

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

  useEffect(() => {
    if (!loggedInUserId) return;

    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No token found");

        const response = await fetch(
          `http://localhost:5001/users/${loggedInUserId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!response.ok) throw new Error("Failed to fetch user data");

        const data = await response.json();
        setUserData(data);
        localStorage.setItem("userData", JSON.stringify(data));
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, [loggedInUserId]);

  const handleMenuToggle = () => {
    setMenuToggle(!menuToggle);
  };

  return (
    <div>
      <button
        onClick={handleMenuToggle}
        className="block sm:hidden fixed top-4 right-4 z-50"
      >
        <FaBars size={25} />
      </button>

      <AnimatePresence>
        <motion.div
          initial={{ x: window.innerWidth < 640 ? "-100%" : 0 }}
          animate={{
            x: menuToggle ? 0 : window.innerWidth < 640 ? "-100%" : 0,
          }}
          exit={{ x: window.innerWidth < 640 ? "-100%" : 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className={`flex flex-col fixed sm:sticky w-64 sm:w-50 h-screen top-0 left-0 bg-(--secondary) z-31 
            ${menuToggle ? "block" : "hidden sm:flex"}`}
        >
          <Link to={`/feed`} className="size-15 mt-2 ml-2 mb-10">
            <img src={darkMode ? onlyLogoDM : onlyLogoLM} alt="logo" />
          </Link>

          <Link
            to={`/profile/${loggedInUserId}`}
            className="w-20 h-20 rounded-full  bg-blue-400 flex items-center self-center text-center justify-center text-white"
          >
            {userData?.profilePicture ? (
              <img
                src={userData.profilePicture}
                alt="Profile"
                className="w-full h-full object-cover rounded-full"
              />
            ) : (
              <span>
                {userData?.username ? userData.username[0].toUpperCase() : "?"}
              </span>
            )}
          </Link>

          <p className="text-center mt-4 mb-5">
            Welcome back, <br />
            <Link to={`/profile/${loggedInUserId}`}>
              <strong> {userData.username}</strong>!
            </Link>
          </p>

          <button
            onClick={() => handleNavigation("/feed")}
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
            onClick={() => handleNavigation(`/profile/${loggedInUserId}`)}
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
              onClick={() => handleNavigation("/edit-profile")}
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
            <button
              onClick={() => handleNavigation("/about")}
              className="h-10 pl-3 w-full text-left hover:bg-(--primary) rounded-full"
            >
              About
            </button>

            <Toggle />
          </motion.div>
          <ChatBot isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
          <button
            onClick={async () => {
              await logoutHandler();
              if (window.innerWidth < 640) {
                setMenuToggle(false);
              }
            }}
            className="flex absolute bottom-5 pl-5 w-full items-center h-10 hover:bg-(--primary) rounded-full"
          >
            <IoLogOutOutline
              className="mr-1"
              size={24}
              color={darkMode ? "white" : "black"}
            />
            Logout
          </button>
        </motion.div>
      </AnimatePresence>

      {/* Overlay for mobile */}
      {menuToggle && (
        <motion.div
          initial={{ backdropFilter: "blur(0px)" }}
          animate={{ backdropFilter: "blur(5px)" }}
          exit={{ backdropFilter: "blur(0px)" }}
          onClick={handleMenuToggle}
          className="fixed inset-0 bg-black/30 z-30 sm:hidden backdrop-blur-md"
        />
      )}
    </div>
  );
};

export default AsideMenu;
