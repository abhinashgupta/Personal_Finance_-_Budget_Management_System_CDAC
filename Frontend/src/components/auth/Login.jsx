import React, { useState } from "react";
import { checkValidData } from "../../utils/FormValidation";
import axios from "axios";

import { FiMail, FiLock, FiEye, FiEyeOff } from "react-icons/fi";
import { ImSpinner2 } from "react-icons/im";

import { useAuth } from '../../contexts/AuthContext.jsx';
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const { login: authContextLogin } = useAuth();
   const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    const validationMessage = checkValidData(email, password);
    if (validationMessage) {
      setErrorMessage(validationMessage);
      setIsLoading(false);
      return;
    }

    try {
      const res = await axios.post(
        "http://localhost:5000/auth/login",
        { email, password },
        { withCredentials: true }
      );

      if (res.data.success) {
        authContextLogin(res.data.user);
      } else {
        setErrorMessage(res.data.message || "Login failed. Please check your credentials.");
      }
    } catch (error) {
      const errMsg =
        error.response?.data?.message || "Login failed. Please try again.";
      setErrorMessage(errMsg);
      console.error("Login.jsx: Login error (network/server issue):", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-200 to-indigo-300 relative overflow-hidden p-4 sm:p-8">
      <div className="absolute top-10 left-1/4 w-48 h-48 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
      <div className="absolute bottom-20 right-1/3 w-64 h-64 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
      <div className="absolute top-1/2 left-1/2 w-56 h-56 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>

      <form
        onSubmit={handleLogin}
        className="bg-white p-8 sm:p-10 rounded-3xl shadow-3xl w-full max-w-md backdrop-blur-sm bg-opacity-80
                   border border-blue-100 transform transition-all duration-500 scale-100 hover:scale-105 relative z-10"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-blue-500 rounded-t-3xl"></div>

        <h2 className="text-4xl font-extrabold text-center text-blue-800 mb-8 tracking-tight">
          Welcome Back!
        </h2>

        <div className="mb-6 relative">
          <label htmlFor="email" className="sr-only">Email</label>
          <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            id="email"
            type="email"
            placeholder="Your Email"
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-3 focus:ring-blue-400 focus:border-blue-500
                       transition duration-200 ease-in-out text-gray-800 placeholder-gray-500 text-lg"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setErrorMessage(null); }}
            required
          />
        </div>

        <div className="relative mb-6">
          <label htmlFor="password" className="sr-only">Password</label>
          <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Your Password"
            className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-3 focus:ring-blue-400 focus:border-blue-500
                               transition duration-200 ease-in-out text-gray-800 placeholder-gray-500 text-lg"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setErrorMessage(null); }}
            required
          />
          <span
            className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-500 hover:text-blue-600 transition duration-150"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
          </span>
        </div>

        {errorMessage && (
          <p className="text-red-600 bg-red-50 p-3 rounded-lg text-sm text-center mb-6 animate-pulse border border-red-200">
            {errorMessage}
          </p>
        )}

        <button
          type="submit"
          className={`w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700
                      focus:outline-none focus:ring-3 focus:ring-blue-400 focus:ring-offset-2
                      transition duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-lg
                      ${isLoading ? "opacity-60 cursor-not-allowed flex items-center justify-center gap-2" : ""}`}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <ImSpinner2 className="animate-spin" size={20} /> Logging In...
            </>
          ) : (
            "Login"
          )}
        </button>

        <p className="text-center mt-8 text-base text-gray-700">
          Don’t have an account?{" "}
          <span
            onClick={() => navigate("/signup")}
            className="text-blue-700 hover:underline font-semibold cursor-pointer transition duration-150"
          >
            Sign Up
          </span>
        </p>
      </form>
    </div>
  );
};

export default Login;