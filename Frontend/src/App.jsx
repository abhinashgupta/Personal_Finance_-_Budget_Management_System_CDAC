import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Navbar from "./components/Navbar";
import Dashboard from "./components/Dashboard";
import Income from "./components/Income";
import Expense from "./components/Expense";
import Budget from "./components/Budget";
import Setting from "./components/Setting";
import Login from "./components/Login";
import SignUp from "./components/SignUp";

const App = () => {
  return (
    <BrowserRouter>
      <Header /> {/* Top header bar */}
      <div className="flex">
        <Navbar /> {/* Sidebar */}
        <div className="flex-1 p-6">
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/income" element={<Income />} />
            <Route path="/expense" element={<Expense />} />
            <Route path="/budget" element={<Budget />} />
            <Route path="/setting" element={<Setting />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
};

export default App;
