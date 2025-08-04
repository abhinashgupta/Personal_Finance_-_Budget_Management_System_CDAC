import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../../api"; // Use the central apiClient
import { FiMail } from "react-icons/fi";
import { ImSpinner2 } from "react-icons/im";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsLoading(true);

    if (!email) {
      setErrorMessage("Email address is required.");
      setIsLoading(false);
      return;
    }

    try {
      // Use apiClient and remove withCredentials
      const res = await apiClient.post("/auth/forgot-password", { email });

      if (res.data.success) {
        setSuccessMessage(
          res.data.message ||
            "If an account with that email exists, a password reset link has been sent."
        );
        setEmail("");
      } else {
        setErrorMessage(
          res.data.message || "Failed to send reset link. Please try again."
        );
      }
    } catch (error) {
      const errMsg =
        error.response?.data?.message ||
        "Failed to send reset link. Please try again later.";
      setErrorMessage(errMsg);
      console.error("Forgot password error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-indigo-200 to-purple-300 relative overflow-hidden p-4 sm:p-8">
      {/* Background elements */}
      <div className="absolute top-10 left-1/4 w-48 h-48 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
      <div className="absolute bottom-20 right-1/3 w-64 h-64 bg-violet-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
      <div className="absolute top-1/2 left-1/2 w-56 h-56 bg-fuchsia-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>

      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 sm:p-10 rounded-3xl shadow-3xl w-full max-w-md backdrop-blur-sm bg-opacity-80
                           border border-indigo-100 transform transition-all duration-500 scale-100 hover:scale-105 relative z-10"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-indigo-500 rounded-t-3xl"></div>

        <h2 className="text-4xl font-extrabold text-center text-indigo-800 mb-8 tracking-tight">
          Forgot Password?
        </h2>
        <p className="text-center text-gray-700 mb-6">
          Enter your email address and we'll send you a link to reset your
          password.
        </p>

        {successMessage && (
          <p className="text-green-600 bg-green-50 p-3 rounded-lg text-sm text-center mb-6 border border-green-200">
            {successMessage}
          </p>
        )}
        {errorMessage && (
          <p className="text-red-600 bg-red-50 p-3 rounded-lg text-sm text-center mb-6 animate-pulse border border-red-200">
            {errorMessage}
          </p>
        )}

        <div className="mb-6 relative">
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
            placeholder="Your Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-3 focus:ring-indigo-400 focus:border-indigo-500 transition duration-200 ease-in-out text-gray-800 placeholder-gray-500 text-lg"
            required
          />
        </div>

        <button
          type="submit"
          className={`w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700
                               focus:outline-none focus:ring-3 focus:ring-indigo-400 focus:ring-offset-2
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
              <ImSpinner2 className="animate-spin" size={20} /> Sending...
            </>
          ) : (
            "Send Reset Link"
          )}
        </button>

        <p className="text-center mt-8 text-base text-gray-700">
          <span
            onClick={() => navigate("/")}
            className="text-indigo-700 hover:underline font-semibold cursor-pointer transition duration-150"
          >
            Back to Login
          </span>
        </p>
      </form>
    </div>
  );
};

export default ForgotPasswordPage;
