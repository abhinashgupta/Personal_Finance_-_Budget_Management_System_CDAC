import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import apiClient from "../../api"; 
import { ImSpinner2 } from "react-icons/im";
import { FiMail, FiCheckCircle } from "react-icons/fi";

const VerifyEmailPage = () => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Get email from the URL query string
    const searchParams = new URLSearchParams(location.search);
    const emailFromUrl = searchParams.get("email");
    if (emailFromUrl) {
      setEmail(emailFromUrl);
    } else {
      setErrorMessage("Email missing. Please register again to verify.");
      setTimeout(() => navigate("/signup"), 3000);
    }
  }, [location, navigate]);

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsLoading(true);

    if (!email || !otp) {
      setErrorMessage("Email and OTP are required.");
      setIsLoading(false);
      return;
    }

    try {
      const res = await apiClient.post("/auth/verify-email-otp", {
        email,
        otp,
      });

      if (res.data.success) {
        setSuccessMessage(
          res.data.message || "Email verified successfully! You can now log in."
        );
        setOtp("");
        setTimeout(() => navigate("/"), 3000); 
      } else {
        setErrorMessage(
          res.data.message || "OTP verification failed. Please try again."
        );
      }
    } catch (error) {
      const errMsg =
        error.response?.data?.message ||
        "OTP verification failed. Please try again later.";
      setErrorMessage(errMsg);
      console.error("OTP verification error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setIsResending(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!email) {
      setErrorMessage("Email is missing. Cannot resend OTP.");
      setIsResending(false);
      return;
    }

    try {
      const res = await apiClient.post("/auth/send-verification-otp", {
        email,
      });

      if (res.data.success) {
        setSuccessMessage(
          res.data.message || "A new OTP has been sent to your email."
        );
      } else {
        setErrorMessage(
          res.data.message || "Failed to resend OTP. Please try again."
        );
      }
    } catch (error) {
      const errMsg =
        error.response?.data?.message ||
        "Failed to resend OTP. Please try again later.";
      setErrorMessage(errMsg);
      console.error("Resend OTP error:", error);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-green-100 to-teal-200 relative overflow-hidden p-4 sm:p-8">

      <div className="absolute top-10 left-1/4 w-48 h-48 bg-green-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
      <div className="absolute bottom-20 right-1/3 w-64 h-64 bg-teal-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
      <div className="absolute top-1/2 left-1/2 w-56 h-56 bg-lime-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>

      <form
        onSubmit={handleVerifyOtp}
        className="bg-white p-8 sm:p-10 rounded-3xl shadow-3xl w-full max-w-md backdrop-blur-sm bg-opacity-80
                           border border-green-100 transform transition-all duration-500 scale-100 hover:scale-105 relative z-10"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-green-500 rounded-t-3xl"></div>
        <h2 className="text-4xl font-extrabold text-center text-green-800 mb-8 tracking-tight">
          Verify Your Email
        </h2>
        <p className="text-center text-gray-700 mb-6">
          An OTP has been sent to{" "}
          <span className="font-semibold text-blue-700">{email}</span>. Please
          enter it below.
        </p>

        {successMessage && (
          <p className="text-green-600 bg-green-50 p-3 rounded-lg text-sm text-center mb-6 border border-green-200 flex items-center gap-2 justify-center">
            <FiCheckCircle size={18} /> {successMessage}
          </p>
        )}
        {errorMessage && (
          <p className="text-red-600 bg-red-50 p-3 rounded-lg text-sm text-center mb-6 animate-pulse border border-red-200">
            {errorMessage}
          </p>
        )}

        <div className="mb-6 relative">
          <label htmlFor="otp" className="sr-only">
            OTP
          </label>
          <FiMail
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            id="otp"
            type="text"
            maxLength="6"
            placeholder="Enter 6-digit OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-3 focus:ring-green-400 focus:border-green-500 transition duration-200 ease-in-out text-gray-800 placeholder-gray-500 text-lg tracking-widest text-center"
            required
          />
        </div>

        <button
          type="submit"
          className={`w-full bg-green-600 text-white font-bold py-3 rounded-xl hover:bg-green-700
                               focus:outline-none focus:ring-3 focus:ring-green-400 focus:ring-offset-2
                               transition duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-lg
                               ${
                                 isLoading
                                   ? "opacity-60 cursor-not-allowed flex items-center justify-center gap-2"
                                   : ""
                               }`}
          disabled={isLoading || isResending}
        >
          {isLoading ? (
            <>
              <ImSpinner2 className="animate-spin" size={20} /> Verifying...
            </>
          ) : (
            "Verify OTP"
          )}
        </button>

        <p className="text-center mt-5 text-base text-gray-700">
          Didn't receive OTP?{" "}
          <button
            type="button"
            onClick={handleResendOtp}
            className={`font-semibold text-green-700 hover:underline transition duration-150
                                   ${
                                     isResending
                                       ? "opacity-60 cursor-not-allowed"
                                       : ""
                                   }`}
            disabled={isResending || isLoading}
          >
            {isResending ? "Resending..." : "Resend OTP"}
          </button>
        </p>
      </form>
    </div>
  );
};

export default VerifyEmailPage;
