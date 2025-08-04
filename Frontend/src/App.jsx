import React from 'react';
import { Routes, Route } from 'react-router-dom';

import Login from './components/auth/Login';
import SignUp from './components/auth/SignUp';

import DashboardPage from './pages/DashboardPage';
import TransactionsPage from './pages/TransactionsPage';
import CategoriesPage from './pages/CategoriesPage';
import BudgetsPage from './pages/BudgetsPage';
import UserProfilePage from './pages/UserProfilePage';

import ProtectedRoute from './components/common/ProtectedRoute';
import MainLayout from './components/layout/MainLayout.jsx';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <MainLayout><DashboardPage /></MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/transactions"
        element={
          <ProtectedRoute>
            <MainLayout><TransactionsPage /></MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/categories"
        element={
          <ProtectedRoute>
            <MainLayout><CategoriesPage /></MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/budgets"
        element={
          <ProtectedRoute>
            <MainLayout><BudgetsPage /></MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <MainLayout><UserProfilePage /></MainLayout>
          </ProtectedRoute>
        }
      />

      <Route path="*" element={
        <div className="flex justify-center items-center min-h-screen bg-gray-100">
          <h1 className="text-3xl font-bold text-red-600">404 - Page Not Found</h1>
        </div>
      } />
    </Routes>
  );
}

export default App;