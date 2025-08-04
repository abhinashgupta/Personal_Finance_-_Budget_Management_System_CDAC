import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom"; // Import useParams to get token from URL
import apiClient from "../../api"; // Use the central apiClient
import { FiLock, FiEye, FiEyeOff } from "react-icons/fi";
import { ImSpinner2 } from "react-icons/im";
import { checkValidData } from "../../utils/FormValidation";

const ResetPasswordPage = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const { token } = useParams(); // Get the token directly from the URL path
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsLoading(true);

    if (!token) {
      setErrorMessage("Password reset token is missing or invalid.");
      setIsLoading(false);
      return;
    }

    const passwordValidationMessage = checkValidData(
      "test@example.com",
      newPassword
    );
    if (
      passwordValidationMessage &&
      passwordValidationMessage !== "❌ Email is not valid!"
    ) {
      setErrorMessage(passwordValidationMessage);
      setIsLoading(false);
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setErrorMessage("New passwords do not match.");
      setIsLoading(false);
      return;
    }

    try {
      // Use apiClient and send the request to the correct endpoint
      const res = await apiClient.post(`/auth/reset-password/${token}`, {
        newPassword,
        confirmNewPassword,
      });

      if (res.data.success) {
        setSuccessMessage(
          res.data.message ||
            "Password has been successfully reset. You can now log in."
        );
        setNewPassword("");
        setConfirmNewPassword("");
        setTimeout(() => navigate("/"), 3000); // Redirect to login after a delay
      } else {
        setErrorMessage(
          res.data.message ||
            "Failed to reset password. Token might be invalid or expired."
        );
      }
    } catch (error) {
      const errMsg =
        error.response?.data?.message ||
        "Failed to reset password. Please try again later.";
      setErrorMessage(errMsg);
      console.error("Reset password error:", error);
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
          Reset Password
        </h2>

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

        {/* Password input fields */}
        <div className="mb-4 relative">
          <label htmlFor="newPassword" className="sr-only">
            New Password
          </label>
          <FiLock
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            id="newPassword"
            type={showNewPassword ? "text" : "password"}
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => {
              setNewPassword(e.target.value);
              setErrorMessage(null);
            }}
            className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-3 focus:ring-indigo-400 focus:border-indigo-500"
            required
          />
          <span
            className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer"
            onClick={() => setShowNewPassword(!showNewPassword)}
          >
            {showNewPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
          </span>
        </div>
        <div className="mb-6 relative">
          <label htmlFor="confirmNewPassword" className="sr-only">
            Confirm New Password
          </label>
          <FiLock
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            id="confirmNewPassword"
            type={showConfirmNewPassword ? "text" : "password"}
            placeholder="Confirm New Password"
            value={confirmNewPassword}
            onChange={(e) => {
              setConfirmNewPassword(e.target.value);
              setErrorMessage(null);
            }}
            className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-3 focus:ring-indigo-400 focus:border-indigo-500"
            required
          />
          <span
            className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer"
            onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
          >
            {showConfirmNewPassword ? (
              <FiEyeOff size={20} />
            ) : (
              <FiEye size={20} />
            )}
          </span>
        </div>

        <button
          type="submit"
          className={`w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition duration-300 ${
            isLoading ? "opacity-60 cursor-not-allowed" : ""
          }`}
          disabled={isLoading}
        >
          {isLoading ? (
            <ImSpinner2 className="animate-spin mx-auto" size={24} />
          ) : (
            "Reset Password"
          )}
        </button>
      </form>
    </div>
  );
};

export default ResetPasswordPage;
