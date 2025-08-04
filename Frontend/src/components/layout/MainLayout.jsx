import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { FiHome, FiBarChart2, FiList, FiSettings, FiLogOut } from 'react-icons/fi';
import { FaRupeeSign } from 'react-icons/fa';

const MainLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: FiHome },
    { name: 'Transactions', path: '/transactions', icon: FaRupeeSign },
    { name: 'Categories', path: '/categories', icon: FiList },
    { name: 'Budgets', path: '/budgets', icon: FiBarChart2 },
    { name: 'Profile', path: '/profile', icon: FiSettings },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <header className="bg-white shadow-md p-4 mb-6 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <span className="text-2xl font-bold text-blue-700 cursor-pointer" onClick={() => navigate('/dashboard')}>
              💰 FinTrack
            </span>
          </div>

          <div className="flex items-center space-x-4">
            {user && (
              <div className="flex items-center space-x-2">
                <img
                  src={user.avatar || 'https://cdn-icons-png.flaticon.com/512/149/149071.png'}
                  alt="User Avatar"
                  className="w-8 h-8 rounded-full border border-blue-300"
                />
                <span className="font-semibold text-gray-700 hidden sm:inline">{user.firstname}</span>
              </div>
            )}
            <button
              onClick={logout}
              className="flex items-center px-3 py-2 bg-red-500 text-white text-sm rounded-md shadow hover:bg-red-600 transition duration-200"
            >
              <FiLogOut className="mr-1" /> Logout
            </button>
          </div>
        </div>

        <nav className="mt-4 flex justify-around flex-wrap gap-2 sm:gap-4 border-t pt-3 border-gray-200">
          {navLinks.map((link) => (
            <button
              key={link.name}
              onClick={() => navigate(link.path)}
              className="flex items-center justify-center sm:flex-initial flex-1 min-w-[100px] sm:min-w-0
                          px-3 py-2 bg-blue-100 text-blue-700 rounded-md font-medium text-sm
                          hover:bg-blue-200 hover:text-blue-800 transition duration-200 shadow-sm
                          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            >
              <link.icon className="mr-1" size={16} /> {link.name}
            </button>
          ))}
        </nav>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6">
        {children}
      </main>

      <footer className="bg-white shadow-inner p-4 text-center text-gray-500 text-sm mt-8">
        &copy; {new Date().getFullYear()} FinTrack. All rights reserved.
      </footer>
    </div>
  );
};

export default MainLayout;