import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext.jsx";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import CategoryForm from "../components/categories/CategoryForm.jsx";
import CategoryList from "../components/categories/CategoryList.jsx";
import StatusDisplay from "../components/common/StatusDisplay.jsx";

const CategoriesPage = () => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filterType, setFilterType] = useState("");
  const [filterName, setFilterName] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");

  const fetchCategories = async () => {
    setPageLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams();
      if (filterType) queryParams.append("type", filterType);
      if (filterName) queryParams.append("name", filterName);
      if (sortBy) queryParams.append("sortBy", sortBy);
      if (sortOrder) queryParams.append("sortOrder", sortOrder);

      queryParams.append("timestamp", Date.now());

      const url = `https://personal-finance-budget-management-c4th.onrender.com/categories?${queryParams.toString()}`;

      const res = await axios.get(url, {
        withCredentials: true,
      });
      if (res.data.success) {
        setCategories(res.data.categories);
      } else {
        setError(res.data.message || "Failed to fetch categories.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Error fetching categories.");
      console.error("CategoriesPage: Fetch categories error:", err);
    } finally {
      setPageLoading(false);
    }
  };

  const handleCategoryChange = () => {
    fetchCategories();
  };

  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      fetchCategories();
    }
  }, [isAuthenticated, authLoading, filterType, filterName, sortBy, sortOrder]);

  if (authLoading || pageLoading) {
    return <StatusDisplay type="loading" message="Loading categories..." />;
  }

  if (error) {
    return (
      <StatusDisplay
        type="error"
        message={error}
        onRetry={handleCategoryChange}
      />
    );
  }

  return (
    <div className="flex flex-col">
      <div className="bg-white shadow-md rounded-lg p-4 mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          Filter & Sort Categories
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label
              htmlFor="filterType"
              className="block text-gray-700 text-sm font-medium mb-1"
            >
              Filter by Type
            </label>
            <select
              id="filterType"
              value={filterType}
              onChange={(e) => {
                setFilterType(e.target.value);
              }}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Types</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="filterName"
              className="block text-gray-700 text-sm font-medium mb-1"
            >
              Search by Name
            </label>
            <input
              id="filterName"
              type="text"
              placeholder="e.g., Groceries"
              value={filterName}
              onChange={(e) => {
                setFilterName(e.target.value);
              }}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor="sortBy"
              className="block text-gray-700 text-sm font-medium mb-1"
            >
              Sort By
            </label>
            <select
              id="sortBy"
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
              }}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="name">Name</option>
              <option value="type">Type</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="sortOrder"
              className="block text-gray-700 text-sm font-medium mb-1"
            >
              Order
            </label>
            <select
              id="sortOrder"
              value={sortOrder}
              onChange={(e) => {
                setSortOrder(e.target.value);
              }}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </div>
        </div>
        <button
          onClick={() => {
            setFilterType("");
            setFilterName("");
            setSortBy("name");
            setSortOrder("asc");
          }}
          className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition duration-200"
        >
          Reset Filters
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Add New Category
          </h2>
          <CategoryForm onCategoryAdded={handleCategoryChange} />
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md md:col-span-1">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            All Categories
          </h2>
          {categories.length === 0 && !pageLoading ? (
            <StatusDisplay
              type="empty"
              message="No categories match your criteria. Try adjusting filters or add a new category!"
              emptyActionText="Add a Category"
            />
          ) : (
            <CategoryList
              categories={categories}
              onCategoryDeleted={handleCategoryChange}
              onCategoryUpdated={handleCategoryChange}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoriesPage;
