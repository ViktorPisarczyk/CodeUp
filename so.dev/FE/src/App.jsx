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
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword.jsx";
import EditProfile from "./pages/EditProfile";

function App() {
  return (
    <MyContextProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/feed" element={<Feed />} />
          <Route path="/edit-profile" element={<EditProfile />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </MyContextProvider>
  );
}

export default App;
