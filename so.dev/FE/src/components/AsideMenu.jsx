import { useState, useContext, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaGear } from "react-icons/fa6";
import { CgProfile } from "react-icons/cg";
import { IoLogOutOutline } from "react-icons/io5";
import { MdHome } from "react-icons/md";
import { BiMessageSquareDots } from "react-icons/bi";
import { MyContext } from "../context/ThemeContext";
import { motion, AnimatePresence } from "framer-motion";
import { jwtDecode } from "jwt-decode";
import Toggle from "./Toggle";
import ChatBot from "./ChatBot";
import onlyLogoLM from "../assets/NewOnlyLogoLM.png";
import onlyLogoDM from "../assets/NewOnlyLogoDM.png";
import { FaBars } from "react-icons/fa";
import API_URL from "../config/api.js";

const AsideMenu = () => {
  const navigate = useNavigate();
  const { darkMode } = useContext(MyContext);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [menuToggle, setMenuToggle] = useState(window.innerWidth >= 640);
  const cachedUserData = JSON.parse(localStorage.getItem("userData")) || {};
  const [userData, setUserData] = useState(cachedUserData);
  const [hasUnreadMessages, setHasUnreadMessages] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

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
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      await fetch(`${API_URL}/users/logout`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
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

  // Fetch user data
  useEffect(() => {
    if (!loggedInUserId) return;

    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          return;
        }

        const response = await fetch(
          `${API_URL}/users/${loggedInUserId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch user data");
        }

        const data = await response.json();
        setUserData(data);
        localStorage.setItem("userData", JSON.stringify(data));
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, [loggedInUserId]);

  // Check for unread messages
  useEffect(() => {
    if (!loggedInUserId) return;

    const checkUnreadMessages = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        // Always fetch from API to ensure we have the latest data
        const response = await fetch(
          `${API_URL}/messages/conversations`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          console.error("Failed to fetch conversations");
          return;
        }

        const conversations = await response.json();

        // Store conversations in localStorage for future use
        localStorage.setItem("conversations", JSON.stringify(conversations));

        // Check if any conversation has unread messages
        const hasUnread = conversations.some((conv) => conv.unread > 0);
        const unread = conversations.reduce(
          (acc, conv) => acc + (conv.unread || 0),
          0
        );

        setHasUnreadMessages(hasUnread);
        setUnreadCount(unread);
      } catch (error) {
        console.error("Error checking unread messages:", error);
      }
    };

    // Check initially
    checkUnreadMessages();

    // Set up interval to check periodically (every 10 seconds)
    const intervalId = setInterval(checkUnreadMessages, 10000);

    // Listen for conversation opened events
    const handleConversationOpened = (event) => {
      // Update the unread count immediately when a conversation is opened
      checkUnreadMessages();
    };

    // Create a custom event for new messages
    const handleNewMessage = () => {
      checkUnreadMessages();
    };

    // Register the event listeners
    window.addEventListener("conversationOpened", handleConversationOpened);
    window.addEventListener("newMessage", handleNewMessage);

    // Also listen for localStorage changes
    const handleStorageChange = (e) => {
      if (e.key === "conversations") {
        checkUnreadMessages();
      }
    };
    window.addEventListener("storage", handleStorageChange);

    // Clean up interval and event listeners on unmount
    return () => {
      clearInterval(intervalId);
      window.removeEventListener(
        "conversationOpened",
        handleConversationOpened
      );
      window.removeEventListener("newMessage", handleNewMessage);
      window.removeEventListener("storage", handleStorageChange);
    };
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
          <Link to={`/feed`} className="flex justify-center mt-5 mb-5">
            <img
              src={darkMode ? onlyLogoDM : onlyLogoLM}
              alt="logo"
              className="size-20"
            />
          </Link>

          <Link
            to={`/profile/${loggedInUserId}`}
            className="w-30 h-30 rounded-full  bg-blue-400 flex items-center self-center text-center justify-center text-white"
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

          <p className="text-center mt-4 mb-2">
            Welcome back, <br />
            <Link to={`/profile/${loggedInUserId}`}>
              <strong> {userData.username}</strong>!
            </Link>
          </p>

          <button
            onClick={() => handleNavigation("/feed")}
            className="flex items-center pl-5 h-10 rounded-full hover:bg-[var(--primarySoft)]"
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
            className="flex items-center pl-5 h-10 rounded-full hover:bg-[var(--primarySoft)]"
          >
            <CgProfile
              className="mr-2"
              size={24}
              color={darkMode ? "white" : "black"}
            />
            Profile
          </button>
          <button
            onClick={() => handleNavigation("/messages")}
            className="flex items-center pl-5 h-10 rounded-full hover:bg-[var(--primarySoft)]"
          >
            <BiMessageSquareDots
              className="mr-2"
              size={20}
              color={darkMode ? "white" : "black"}
            />
            Messages
            {hasUnreadMessages && (
              <span className="inline-flex items-center justify-center ml-1 min-w-5 h-5 px-1 bg-red-500 rounded-full text-white text-xs font-bold">
                {unreadCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            className="flex items-center pl-5 h-10 rounded-full hover:bg-[var(--primarySoft)]"
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
              className="h-10 pl-3 w-full text-left hover:bg-[var(--primarySoft)] rounded-full"
            >
              Edit Profile
            </button>

            <button
            onClick={() => handleNavigation("/privacy")} 
            className="h-10 pl-3 w-full text-left hover:bg-[var(--primarySoft)] rounded-full">

              Privacy
            </button>
            <button
              onClick={() => setIsChatOpen(true)}
              className="h-10 pl-3 w-full text-left hover:bg-[var(--primarySoft)] rounded-full"
            >
              Help
            </button>
            <button
              onClick={() => handleNavigation("/about")}
              className="h-10 pl-3 w-full text-left hover:bg-[var(--primarySoft)] rounded-full"
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
            className="flex absolute bottom-5 pl-5 w-full items-center h-10 hover:bg-[var(--primarySoft)] rounded-full"
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
