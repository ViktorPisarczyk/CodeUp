import { useContext } from "react";
import { MyContext } from "../context/ThemeContext";

function Toggle() {
  const { darkMode, setDarkMode } = useContext(MyContext);

  return (
    <div className="wrapper">
      <label className="switch">
        <input
          type="checkbox"
          onChange={() => setDarkMode((prev) => !prev)}
          checked={darkMode}
        />
        <span className="slider round"></span>
      </label>
    </div>
  );
}

export default Toggle;
