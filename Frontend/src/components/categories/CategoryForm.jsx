import React, { useState } from "react";
import axios from "axios";
import { ImSpinner2 } from "react-icons/im";

import apiClient from "../../api";

const CategoryForm = ({ onCategoryAdded }) => {
  const [name, setName] = useState("");
  const [type, setType] = useState("expense");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    if (!name || !type) {
      setError("Category name and type are required.");
      setIsLoading(false);
      return;
    }

    try {
      const res = await apiClient.post(
        "/categories",
        {
          name,
          type,
        }
       
      );

      if (res.data.success) {
        console.log("Category added:", res.data.category);
        onCategoryAdded();
        setName("");
        setType("expense");
      } else {
        setError(res.data.message || "Failed to add category.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Error adding category.");
      console.error("Add category error:", err);
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
          htmlFor="categoryName"
          className="block text-gray-700 font-medium mb-1"
        >
          Category Name
        </label>
        <input
          id="categoryName"
          type="text"
          placeholder="e.g., Groceries, Salary"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label
          htmlFor="categoryType"
          className="block text-gray-700 font-medium mb-1"
        >
          Type
        </label>
        <select
          id="categoryType"
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        >
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </select>
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
            <ImSpinner2 className="animate-spin" /> Adding...
          </>
        ) : (
          "Add Category"
        )}
      </button>
    </form>
  );
};

export default CategoryForm;
