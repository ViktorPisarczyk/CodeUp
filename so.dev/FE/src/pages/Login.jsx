import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import logoLM from "../assets/newLogoLM.png";
import logoDM from "../assets/newLogoDM.png";
import { MyContext } from "../context/ThemeContext";
import Alert from "../components/Alert";

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    username: "",
  });
  const [alert, setAlert] = useState({
    show: false,
    message: "",
    isSuccess: true,
  });
  const navigate = useNavigate();

  const closeAlert = () => {
    setAlert({ show: false, message: "", isSuccess: true });
  };

  const loginHandler = async (e) => {
    e.preventDefault();

    const data = {
      email: formData.email,
      password: formData.password,
    };

    try {
      const response = await fetch("http://localhost:5001/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const result = await response.json();

        localStorage.setItem("token", result.token);

        navigate("/feed");
      } else {
        const errorData = await response.json();

        if (errorData.message === "Email not found") {
          setAlert({
            show: true,
            message:
              "The email you entered does not exist. Please check and try again.",
            isSuccess: false,
          });
        } else if (errorData.message === "Incorrect password") {
          setAlert({
            show: true,
            message: "The password you entered is incorrect. Please try again.",
            isSuccess: false,
          });
        } else {
          setAlert({
            show: true,
            message:
              "Login failed: " + (errorData.message || "Invalid credentials."),
            isSuccess: false,
          });
        }

        console.error("Login failed:", errorData.message);
      }
    } catch (error) {
      setAlert({
        show: true,
        message: "An error occurred during login. Please try again later.",
        isSuccess: false,
      });
      console.error("Error during login:", error);
    }
  };

  const signupHandler = async (e) => {
    e.preventDefault();

    const data = {
      username: formData.username,
      email: formData.email,
      password: formData.password,
    };

    try {
      const response = await fetch("http://localhost:5001/users/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const result = await response.json();

        localStorage.setItem("token", result.token);

        setAlert({
          show: true,
          message: "Sign up successful!",
          isSuccess: true,
        });
        setTimeout(() => {
          navigate("/login");
        }, 1000);
      } else {
        const errorData = await response.json();
        console.error("Signup failed:", errorData.message);

        // Check for duplicate email error
        if (
          errorData.message &&
          errorData.message.includes("E11000 duplicate key error")
        ) {
          setAlert({
            show: true,
            message:
              "This email is already linked to an existing account. Please use another email.",
            isSuccess: false,
          });
        } else {
          setAlert({
            show: true,
            message: errorData.message,
            isSuccess: false,
          });
        }
      }
    } catch (error) {
      console.error("Error during signup:", error);
      setAlert({
        show: true,
        message: "Something went wrong. Please try again.",
        isSuccess: false,
      });
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const { darkMode } = useContext(MyContext);

  return (
    <div className="min-h-screen flex flex-col items-center  bg-(--primary)">
      <div>
        <img src={darkMode ? logoDM : logoLM} alt="logo" className="w-200" />
      </div>
      <div className=" bg-(--tertiary) p-8 rounded-lg shadow-xl w-full mt-5 max-w-md">
        <h1 className="text-3xl font-bold text-center mb-8 text-(--text)">
          {isLogin ? "Welcome Back!" : "Join Code Up"}
        </h1>

        <form
          onSubmit={isLogin ? loginHandler : signupHandler}
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
            {isLogin ? "Forgot password?" : ""}
          </button>
        </div>

        <div className="mt-4 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm  hover:bg-(--primary) focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500   bg-(--secondary) hover:text-(--quaternary)"
          >
            {isLogin ? "Create an account" : "To the Login"}
          </button>
        </div>
      </div>
      {alert.show && (
        <Alert
          message={alert.message}
          onConfirm={closeAlert}
          isSuccess={alert.isSuccess}
        />
      )}
    </div>
  );
}
