import { useNavigate } from "react-router-dom";
import { useState, useContext } from "react";
import logoLM from "../assets/finalLogoLM.png";
import logoDM from "../assets/finalLogoDM.png";
import { MyContext } from "../context/ThemeContext";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    navigate("/reset-password");
  };

  const { darkMode } = useContext(MyContext);

  return (
    <div className="min-h-screen flex flex-col items-center bg-(--primary)">
      <div>
        <img src={darkMode ? logoDM : logoLM} alt="logo" className="w-200" />
      </div>
      <div className=" bg-(--tertiary) p-8 rounded-lg shadow-xl w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-8 text-(--text)">
          Forgot Password
        </h1>

        <h2 className="text-sm font-medium text-center mb-8 text-(--text)">
          Enter your email to reset the password
        </h2>
        <form onSubmit={handleSubmit} className="text-(--text) space-y-4">
          <div>
            <label className="block text-sm font-medium">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-400 focus:ring-blue-400 bg-white text-black"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-(--secondary) text-(--text) py-2 px-4 rounded-md hover:bg-(--primary) focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50"
          >
            Send Validation code
          </button>
        </form>
      </div>
    </div>
  );
}
