import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Toggle from "../components/Toggle";

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    username: "",
  });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = {
      email: formData.email,
      password: formData.password,
    };

    try {
      const response = await fetch("http://localhost:5000/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const result = await response.json();
        console.log("Login successful", result);
        // You can redirect or update state here based on the result
      } else {
        const errorData = await response.json();
        console.error("Login failed:", errorData.message);
        // Show error message in your UI
      }
    } catch (error) {
      console.error("Error during login:", error);
      // Handle network or other errors
    }
    navigate("/feed");
  };

  const handleSubmitSignup = async (e) => {
    e.preventDefault();

    const data = {
      username: formData.username,
      email: formData.email,
      password: formData.password,
    };

    try {
      const response = await fetch("http://localhost:5000/users/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const result = await response.json();
        console.log("Signup successful", result);
        // You can redirect or update state here based on the result
      } else {
        const errorData = await response.json();
        console.error("Signup failed:", errorData.message);
        // Show error message in your UI
      }
    } catch (error) {
      console.error("Error during signup:", error);
      // Handle network or other errors
    }
    navigate("/feed");
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-(--primary)">
      <div className=" bg-(--tertiary) p-8 rounded-lg shadow-xl w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-8 text-(--text)">
          {isLogin ? "Welcome Back!" : "Join So.Dev"}
        </h1>
        <Toggle />
        <form
          onSubmit={isLogin ? handleSubmit : handleSubmitSignup}
          className="text-(--text) space-y-4"
        >
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium">Username</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                maxLength={20}
                className="mt-1 block w-full rounded-md  border-gray-300 shadow-sm focus:border-blue-400 focus:ring-blue-400 bg-white text-black "
                required={!isLogin}
              />
            </div>
          )}

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

          <div>
            <label className="block text-sm font-medium">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              maxLength={20}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-400 focus:ring-blue-400 bg-white text-black"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm  hover:bg-(--primary) focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500   bg-(--secondary) hover:text-(--quaternary)"
          >
            {isLogin ? "Sign In" : "Sign Up"}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            onClick={() => navigate("/forgot-password")}
            className=" hover:text-(--primary)  "
          >
            Forgot Password?
          </button>
        </div>

        <div className="mt-4 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className=" hover:text-(--primary)  "
          >
            {isLogin
              ? "Need an account? Sign up"
              : "Already have an account? Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
}
