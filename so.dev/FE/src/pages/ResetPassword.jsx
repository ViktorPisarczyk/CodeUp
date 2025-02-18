import { useNavigate } from "react-router-dom";
import { useState } from "react";
import Toggle from "../components/Toggle";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    validationCode: null,
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    navigate("/login");
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-(--primary)">
      <div className=" bg-(--tertiary) p-8 rounded-lg shadow-xl w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-8 text-(--text)">
          Reset Password
        </h1>
        <Toggle />

        <form onSubmit={handleSubmit} className="text-(--text) space-y-4">
          <div>
            <label className="block text-sm font-medium">Validation Code</label>
            <input
              type="number"
              name="validationCode"
              value={formData.validationCode}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-400 focus:ring-blue-400 bg-white text-black"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium">New Password</label>
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

          <div>
            <label className="block text-sm font-medium">
              Confirm Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              maxLength={20}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-400 focus:ring-blue-400 bg-white text-black"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-(--secondary) text-(--text) py-2 px-4 rounded-md hover:bg-(--primary) focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50"
          >
            Reset password
          </button>
        </form>
      </div>
    </div>
  );
}
