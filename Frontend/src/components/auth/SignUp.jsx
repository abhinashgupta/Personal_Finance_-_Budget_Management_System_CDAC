import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { checkValidData } from "../../utils/FormValidation";
import apiClient from "../../api"; // Use the central apiClient for requests

import { FiMail, FiLock, FiUser, FiEye, FiEyeOff } from "react-icons/fi";
import { ImSpinner2 } from "react-icons/im";

const SignUp = () => {
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    const validationMessage = checkValidData(email, password);
    if (validationMessage) {
      setErrorMessage(validationMessage);
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("❌ Passwords do not match!");
      setIsLoading(false);
      return;
    }

    try {
      // Use apiClient for the registration request
      const res = await apiClient.post("/auth/register", {
        firstname,
        lastname,
        email,
        password,
      });

      if (res.data.success) {
        // On success, navigate to the verification page with the user's email
        navigate(`/verify-email?email=${email}`);
      } else {
        setErrorMessage(
          res.data.message || "Registration failed. Please try again."
        );
      }
    } catch (error) {
      const errMsg =
        error.response?.data?.message ||
        "Registration failed. Please try again.";
      setErrorMessage(errMsg);
      console.error("Sign Up error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-purple-200 to-pink-300 relative overflow-hidden p-4 sm:p-8">
      {/* Background elements */}
      <div className="absolute top-5 left-1/3 w-40 h-40 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-0"></div>
      <div className="absolute bottom-10 right-1/4 w-56 h-56 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
      <div className="absolute top-1/4 right-1/2 w-48 h-48 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>

      <form
        onSubmit={handleSignUp}
        className="bg-white p-8 sm:p-10 rounded-3xl shadow-3xl w-full max-w-md backdrop-blur-sm bg-opacity-80
                           border border-purple-100 transform transition-all duration-500 scale-100 hover:scale-105 relative z-10"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-purple-500 rounded-t-3xl"></div>
        <h2 className="text-4xl font-extrabold text-center text-purple-800 mb-8 tracking-tight">
          Create Account
        </h2>

        {/* Input fields for user details */}
        <div className="mb-4 relative">
          <label htmlFor="firstname" className="sr-only">
            First Name
          </label>
          <FiUser
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            id="firstname"
            type="text"
            placeholder="First Name"
            value={firstname}
            onChange={(e) => {
              setFirstname(e.target.value);
              setErrorMessage(null);
            }}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-3 focus:ring-purple-400 focus:border-purple-500 transition duration-200 ease-in-out text-gray-800 placeholder-gray-500 text-lg"
            required
          />
        </div>
        <div className="mb-4 relative">
          <label htmlFor="lastname" className="sr-only">
            Last Name
          </label>
          <FiUser
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            id="lastname"
            type="text"
            placeholder="Last Name"
            value={lastname}
            onChange={(e) => {
              setLastname(e.target.value);
              setErrorMessage(null);
            }}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-3 focus:ring-purple-400 focus:border-purple-500 transition duration-200 ease-in-out text-gray-800 placeholder-gray-500 text-lg"
            required
          />
        </div>
        <div className="mb-4 relative">
          <label htmlFor="email" className="sr-only">
            Email
          </label>
          <FiMail
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            id="email"
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setErrorMessage(null);
            }}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-3 focus:ring-purple-400 focus:border-purple-500 transition duration-200 ease-in-out text-gray-800 placeholder-gray-500 text-lg"
            required
          />
        </div>
        <div className="relative mb-4">
          <label htmlFor="password" className="sr-only">
            Password
          </label>
          <FiLock
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setErrorMessage(null);
            }}
            className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-3 focus:ring-purple-400 focus:border-purple-500 transition duration-200 ease-in-out text-gray-800 placeholder-gray-500 text-lg"
            required
          />
          <span
            className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-500 hover:text-purple-600 transition duration-150"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
          </span>
        </div>
        <div className="relative mb-6">
          <label htmlFor="confirmPassword" className="sr-only">
            Confirm Password
          </label>
          <FiLock
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            id="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              setErrorMessage(null);
            }}
            className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-3 focus:ring-purple-400 focus:border-purple-500 transition duration-200 ease-in-out text-gray-800 placeholder-gray-500 text-lg"
            required
          />
          <span
            className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-500 hover:text-purple-600 transition duration-150"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            {showConfirmPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
          </span>
        </div>

        {errorMessage && (
          <p className="text-red-600 bg-red-50 p-3 rounded-lg text-sm text-center mb-6 animate-pulse border border-red-200">
            {errorMessage}
          </p>
        )}

        <button
          type="submit"
          className={`w-full bg-purple-600 text-white font-bold py-3 rounded-xl hover:bg-purple-700
                               focus:outline-none focus:ring-3 focus:ring-purple-400 focus:ring-offset-2
                               transition duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-lg
                               ${
                                 isLoading
                                   ? "opacity-60 cursor-not-allowed flex items-center justify-center gap-2"
                                   : ""
                               }`}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <ImSpinner2 className="animate-spin" size={20} /> Signing Up...
            </>
          ) : (
            "Sign Up"
          )}
        </button>

        <p className="text-center mt-8 text-base text-gray-700">
          Already have an account?{" "}
          <span
            onClick={() => navigate("/")}
            className="text-purple-700 hover:underline font-semibold cursor-pointer transition duration-150"
          >
            Login
          </span>
        </p>
      </form>
    </div>
  );
};

export default SignUp;
