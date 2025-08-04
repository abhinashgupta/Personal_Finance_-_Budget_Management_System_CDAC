import React, { useState, useEffect } from "react";
import axios from "axios";
import { ImSpinner2 } from "react-icons/im";
import { FaRupeeSign } from "react-icons/fa";

import apiClient from "../../api";

const BudgetForm = ({ categories, onBudgetAdded }) => {
  const [limit, setLimit] = useState("");
  const [category, setCategory] = useState("");
  const [period, setPeriod] = useState("monthly");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const budgetableCategories = categories.filter(
    (cat) => cat.type === "expense"
  );

  useEffect(() => {
    if (!budgetableCategories.some((cat) => cat._id === category)) {
      setCategory("");
    }
  }, [budgetableCategories, category]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    if (!limit || !category || !period || !startDate || !endDate) {
      setError("Please fill all required fields.");
      setIsLoading(false);
      return;
    }
    if (parseFloat(limit) <= 0) {
      setError("Budget limit must be a positive number.");
      setIsLoading(false);
      return;
    }
    if (!category) {
      setError("Please select a valid category for the budget.");
      setIsLoading(false);
      return;
    }
    if (new Date(startDate) >= new Date(endDate)) {
      setError("Start date must be before end date.");
      setIsLoading(false);
      return;
    }

    try {
      const res = await apiClient.post(
        "/budgets",
        {
          limit: parseFloat(limit),
          category,
          period,
          startdate: startDate,
          enddate: endDate,
        }
       
      );

      if (res.data.success) {
        console.log("Budget added:", res.data.budget);
        onBudgetAdded();
        setLimit("");
        setCategory("");
        setPeriod("monthly");
        setStartDate("");
        setEndDate("");
      } else {
        setError(res.data.message || "Failed to set budget.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Error setting budget.");
      console.error("Set budget error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <p className="text-red-600 bg-red-50 p-2 rounded-md text-sm text-center border border-red-200">
          {error}
        </p>
      )}

      <div>
        <label
          htmlFor="budgetCategory"
          className="block text-gray-700 font-medium mb-1"
        >
          Category
        </label>
        <select
          id="budgetCategory"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        >
          <option value="">Select a category for budget</option>
          {budgetableCategories.length > 0 ? (
            budgetableCategories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))
          ) : (
            <option value="" disabled>
              No expense categories available. Please create one.
            </option>
          )}
        </select>
      </div>

      <div>
        <label
          htmlFor="budgetLimit"
          className="block text-gray-700 font-medium mb-1"
        >
          Budget Limit
        </label>
        <div className="relative">
          <FaRupeeSign
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            id="budgetLimit"
            type="number"
            placeholder="e.g., 5000"
            value={limit}
            onChange={(e) => setLimit(e.target.value)}
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="budgetPeriod"
          className="block text-gray-700 font-medium mb-1"
        >
          Period
        </label>
        <select
          id="budgetPeriod"
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        >
          <option value="monthly">Monthly</option>
          <option value="weekly">Weekly</option>
          <option value="yearly">Yearly</option>
        </select>
      </div>

      <div>
        <label
          htmlFor="budgetStartDate"
          className="block text-gray-700 font-medium mb-1"
        >
          Start Date
        </label>
        <input
          id="budgetStartDate"
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label
          htmlFor="budgetEndDate"
          className="block text-gray-700 font-medium mb-1"
        >
          End Date
        </label>
        <input
          id="budgetEndDate"
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <button
        type="submit"
        className={`w-full bg-blue-600 text-white font-semibold py-2 rounded-md hover:bg-blue-700 transition duration-200
                     ${
                       isLoading
                         ? "opacity-60 cursor-not-allowed flex items-center justify-center gap-2"
                         : ""
                     }`}
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <ImSpinner2 className="animate-spin" /> Setting Budget...
          </>
        ) : (
          "Set Budget"
        )}
      </button>
    </form>
  );
};

export default BudgetForm;
