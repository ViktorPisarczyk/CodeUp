
import { useContext } from "react";
import { MyContext } from "../context/ThemeContext";
import DarkModeToggle from "react-dark-mode-toggle";

const Toggle = () => {
  const { darkMode, setDarkMode } = useContext(MyContext);
  return (
    <>
    <DarkModeToggle
      onChange={() => setDarkMode((prev) => !prev)}
      checked={darkMode}
      size={50}
      className="ml-2"
    />
    </>
  );
};
export default Toggle;
