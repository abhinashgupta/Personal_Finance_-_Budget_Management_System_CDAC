import React, { createContext, useState, useEffect, useContext } from "react";
// ⬇️ 1. Import your new apiClient
import apiClient from "../api"; // Adjust path if necessary
import { useNavigate } from "react-router-dom";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const checkAuthStatus = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      setLoading(false);
      setIsAuthenticated(false);
      setUser(null);
      return;
    }

    setLoading(true);
    try {
      // ⬇️ 2. Use apiClient here. It automatically adds the token.
      const res = await apiClient.get("/users/profile");

      if (res.data.success) {
        setUser(res.data.user);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem("authToken"); // Clean up invalid token
      }
    } catch (error) {
      console.error(
        "AuthContext: Authentication check failed:",
        error.response?.data?.message || error.message
      );
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem("authToken"); // Clean up invalid token
    } finally {
      setLoading(false);
    }
  };

  const login = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
    navigate("/dashboard");
  };

  const logout = () => {
    // ⬇️ 3. Clear the token from localStorage on logout
    localStorage.removeItem("authToken");
    setUser(null);
    setIsAuthenticated(false);
    navigate("/");
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const authContextValue = {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
    checkAuthStatus,
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
