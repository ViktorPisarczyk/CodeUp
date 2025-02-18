import { useNavigate } from "react-router-dom";
import { FaGear } from "react-icons/fa6";
import { useContext } from "react";
import { MyContext } from "../context/ThemeContext";
import { IoLogOutOutline } from "react-icons/io5";

const AsideMenu = () => {
  const navigate = useNavigate();
  const { darkMode } = useContext(MyContext);

  return (
    <div className="flex flex-col sticky w-50 h-screen top-0 bg-(--secondary)">
      <div className="flex flex-col content-center space-y-6  h-200">
        <img
          className="sticky top-0 rounded-full box-content self-center h-20 w-20 p-4 "
          src="https://img.freepik.com/free-vector/smiling-young-man-illustration_1308-173524.jpg?t=st=1739442424~exp=1739446024~hmac=8fdf51934914a44f0c6c6e31f4896f6b8d3ce8e30f70a496347ede2af6634fad&w=740"
          alt="avatar"
        />
        <button
          onClick={() => navigate("/feed")}
          className=" h-10 hover:bg-(--primary) rounded-full"
        >
          Home
        </button>
        <button
          onClick={() => navigate("/profile")}
          className=" h-10 hover:bg-(--primary) rounded-full"
        >
          Profile
        </button>
      </div>
      <div className="flex flex-col sticky top-200 space-y-6">
        <button className=" flex items-center  h-10 hover:bg-(--primary) rounded-full">
          <FaGear
            className="mr-2 ml-3"
            size={24}
            color={darkMode ? "white" : "black"}
          />{" "}
          Settings
        </button>
        <button className=" flex items-center  h-10 hover:bg-(--primary) rounded-full">
          <IoLogOutOutline size={24} color={darkMode ? "white" : "black"} />{" "}
          Logout
        </button>
      </div>
    </div>
  );
};

export default AsideMenu;
