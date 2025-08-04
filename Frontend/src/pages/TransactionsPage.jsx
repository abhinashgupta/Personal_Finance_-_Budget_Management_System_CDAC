import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext.jsx";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import apiClient from "../api";

import TransactionForm from "../components/transactions/TransactionForm.jsx";
import TransactionList from "../components/transactions/TransactionList.jsx";
import StatusDisplay from "../components/common/StatusDisplay.jsx";

const TransactionsPage = () => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filterType, setFilterType] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");

  const fetchCategories = async () => {
    setError(null);
    try {
      const res = await apiClient.get(
  "/categories",
        
      );
      if (res.data.success) {
        setCategories(res.data.categories);
      } else {
        setError(res.data.message || "Failed to fetch categories.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Error fetching categories.");
      console.error("Fetch categories error:", err);
    }
  };

  const fetchTransactions = async () => {
    setPageLoading(true);
    setError(null);

    try {
      const queryParams = new URLSearchParams();
      if (filterType) queryParams.append("type", filterType);
      if (filterCategory) queryParams.append("category", filterCategory);
      if (filterStartDate) queryParams.append("startDate", filterStartDate);
      if (filterEndDate) queryParams.append("endDate", filterEndDate);
      if (sortBy) queryParams.append("sortBy", sortBy);
      if (sortOrder) queryParams.append("sortOrder", sortOrder);

      const res = await apiClient.get(
        `/transactions?${queryParams.toString()}`
      );
      if (res.data.success) {
        setTransactions(res.data.transactions);
      } else {
        setError(res.data.message || "Failed to fetch transactions.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Error fetching transactions.");
      console.error("Fetch transactions error:", err);
    } finally {
      setPageLoading(false);
    }
  };

  const fetchBudgets = async () => {
    setError(null);
    try {
      const res = await apiClient.get(
        "/budgets"
      
      );
      if (res.data.success) {
        setBudgets(res.data.budgets);
      } else {
        setError(res.data.message || "Failed to fetch budgets.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Error fetching budgets.");
      console.error("Fetch budgets error:", err);
    }
  };

  const handleDataChange = () => {
    fetchTransactions();
    fetchBudgets();
  };

  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      fetchCategories();
      fetchTransactions();
      fetchBudgets();
    }
  }, [isAuthenticated, authLoading]);

  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      fetchTransactions();
      fetchBudgets();
    }
  }, [
    filterType,
    filterCategory,
    filterStartDate,
    filterEndDate,
    sortBy,
    sortOrder,
  ]);

  if (authLoading || pageLoading) {
    return (
      <StatusDisplay
        type="loading"
        message="Loading transactions, categories, and budgets..."
      />
    );
  }

  if (error) {
    return (
      <StatusDisplay type="error" message={error} onRetry={handleDataChange} />
    );
  }

  const allCategoriesForFilter = [...categories];

  return (
    <div className="flex flex-col">
      <div className="bg-white shadow-md rounded-lg p-4 mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          Filter & Sort Transactions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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
              htmlFor="filterCategory"
              className="block text-gray-700 text-sm font-medium mb-1"
            >
              Filter by Category
            </label>
            <select
              id="filterCategory"
              value={filterCategory}
              onChange={(e) => {
                setFilterCategory(e.target.value);
              }}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Categories</option>
              {allCategoriesForFilter.length > 0 ? (
                allCategoriesForFilter.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name} ({cat.type})
                  </option>
                ))
              ) : (
                <option value="" disabled>
                  No categories available
                </option>
              )}
            </select>
          </div>

          <div>
            <label
              htmlFor="filterStartDate"
              className="block text-gray-700 text-sm font-medium mb-1"
            >
              From Date
            </label>
            <input
              id="filterStartDate"
              type="date"
              value={filterStartDate}
              onChange={(e) => {
                setFilterStartDate(e.target.value);
              }}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor="filterEndDate"
              className="block text-gray-700 text-sm font-medium mb-1"
            >
              To Date
            </label>
            <input
              id="filterEndDate"
              type="date"
              value={filterEndDate}
              onChange={(e) => {
                setFilterEndDate(e.target.value);
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
              <option value="date">Date</option>
              <option value="amount">Amount</option>
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
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
          </div>
        </div>
        <button
          onClick={() => {
            setFilterType("");
            setFilterCategory("");
            setFilterStartDate("");
            setFilterEndDate("");
            setSortBy("date");
            setSortOrder("desc");
          }}
          className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition duration-200"
        >
          Reset Filters
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Add New Transaction
          </h2>
          <TransactionForm
            categories={categories}
            budgets={budgets}
            onTransactionAdded={handleDataChange}
          />
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md md:col-span-1">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            All Transactions
          </h2>
          {transactions.length === 0 && !pageLoading ? (
            <StatusDisplay
              type="empty"
              message="No transactions match your criteria. Try adjusting filters or add a new transaction!"
              emptyActionText="Add a Transaction"
            />
          ) : (
            <TransactionList
              transactions={transactions}
              categories={categories}
              onTransactionDeleted={handleDataChange}
              onTransactionUpdated={handleDataChange}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default TransactionsPage;
