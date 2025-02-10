import { motion } from "framer-motion";
import { FiMoon, FiSun } from "react-icons/fi";
import { useContext } from "react";
import { MyContext } from "../context/ThemeContext";
const TOGGLE_CLASSES =
  "text-sm font-medium flex items-center gap-2 px-3 md:pl-3 md:pr-3.5 py-3 md:py-1.5 transition-colors relative z-10";
const Toggle = () => {
  const { darkMode, setDarkMode } = useContext(MyContext);
  return (
    <div
      className={`absolute top-10 right-10 grid  place-content-center bg-transparent border-[2px] ${
        darkMode ? "border-white" : "border-tertiary"
      } rounded-full`}
    >
      <SliderToggle darkMode={darkMode} setDarkMode={setDarkMode} />
    </div>
  );
};
const SliderToggle = ({ darkMode, setDarkMode }) => {
  return (
    <div className="relative flex w-fit items-center rounded-full">
      <button
        className={`${TOGGLE_CLASSES} ${
          darkMode ? "text-gray-600" : "text-white"
        }`}
        onClick={() => {
          setDarkMode(false);
        }}
      >
        <FiSun className="relative z-10 text-lg md:text-sm" />
        <span className="relative z-10">Light</span>
      </button>
      <button
        className={`${TOGGLE_CLASSES} ${
          darkMode ? "text-white" : "text-slate-800"
        }`}
        onClick={() => {
          setDarkMode(true);
        }}
      >
        <FiMoon className="relative z-10 text-lg md:text-sm" />
        <span className="relative z-10">Dark</span>
      </button>
      <div
        className={`absolute inset-0 z-0 flex ${
          darkMode ? "justify-end" : "justify-start"
        }`}
      >
        <motion.span
          layout
          transition={{ type: "spring", damping: 15, stiffness: 250 }}
          className="h-full w-1/2 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600"
        />
      </div>
    </div>
  );
};
export default Toggle;
