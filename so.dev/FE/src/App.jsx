import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import "./App.css";

import Login from "./pages/Login";
import Feed from "./pages/Feed";
import MyContextProvider from "./context/ThemeContext";

function App() {
  return (
    <MyContextProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/feed" element={<Feed />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </MyContextProvider>
  );
}

export default App;
