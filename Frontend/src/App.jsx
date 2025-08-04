import React from "react";
import { Routes, Route } from "react-router-dom";

// --- Import all components and pages ---

// Auth components
import Login from "./components/auth/Login";
import SignUp from "./components/auth/SignUp";

// New auth pages
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage.jsx";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage.jsx";
import VerifyEmailPage from "./pages/auth/VerifyEmailPage.jsx";

// Main application pages
import DashboardPage from "./pages/DashboardPage";
import TransactionsPage from "./pages/TransactionsPage";
import CategoriesPage from "./pages/CategoriesPage";
import BudgetsPage from "./pages/BudgetsPage";
import UserProfilePage from "./pages/UserProfilePage";

// Layout and routing helpers
import ProtectedRoute from "./components/common/ProtectedRoute";
import MainLayout from "./components/layout/MainLayout.jsx";

function App() {
  return (
    <Routes>
      {/* --- Public Authentication Routes --- */}
      <Route path="/" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      {/* Note the ":token" part for the reset password route */}
      <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

      {/* --- Protected Application Routes --- */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <MainLayout>
              <DashboardPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/transactions"
        element={
          <ProtectedRoute>
            <MainLayout>
              <TransactionsPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/categories"
        element={
          <ProtectedRoute>
            <MainLayout>
              <CategoriesPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/budgets"
        element={
          <ProtectedRoute>
            <MainLayout>
              <BudgetsPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <MainLayout>
              <UserProfilePage />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      {/* --- Catch-all 404 Not Found Route --- */}
      <Route
        path="*"
        element={
          <div className="flex justify-center items-center min-h-screen bg-gray-100">
            <h1 className="text-3xl font-bold text-red-600">
              404 - Page Not Found
            </h1>
          </div>
        }
      />
    </Routes>
  );
}

export default App;
