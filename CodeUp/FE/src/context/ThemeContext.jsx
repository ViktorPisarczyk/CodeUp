import { createContext, useState, useEffect } from "react";
export const MyContext = createContext();
export default function MyContextProvider({ children }) {
  // Initialize state with local storage value if it exists
  const [darkMode, setDarkMode] = useState(() => {
    const savedMode = localStorage.getItem("darkMode");
    return savedMode ? JSON.parse(savedMode) : true; // Default to true (dark mode)
  });
  // Save to local storage whenever darkMode changes
  useEffect(() => {
    localStorage.setItem("darkMode", JSON.stringify(darkMode));
    document.body.classList.toggle("dark", darkMode);
    document.body.classList.toggle("light", !darkMode);
  }, [darkMode]);

  return (
    <MyContext.Provider value={{ darkMode, setDarkMode }}>
      {children}
    </MyContext.Provider>
  );
}
