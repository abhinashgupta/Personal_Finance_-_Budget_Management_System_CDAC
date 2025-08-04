import React, { useState } from "react";
import axios from "axios";
import { FiEdit, FiTrash2, FiAlertCircle } from "react-icons/fi";
import { ImSpinner2 } from "react-icons/im";
import { FaRupeeSign } from "react-icons/fa";
import { formatCurrency, formatDate } from "../../utils/formatters.js";
import ConfirmModal from "../common/ConfirmModal.jsx";

import apiClient from "../../api.js";

const BudgetList = ({
  budgets,
  categories,
  onBudgetDeleted,
  onBudgetUpdated,
}) => {
  const [editingBudgetId, setEditingBudgetId] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [deleteLoadingId, setDeleteLoadingId] = useState(null);
  const [editLoadingId, setEditLoadingId] = useState(null);
  const [error, setError] = useState(null);

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [budgetToDeleteId, setBudgetToDeleteId] = useState(null);
  const [budgetToDeleteCategoryName, setBudgetToDeleteCategoryName] =
    useState("");

  const confirmDelete = (id, categoryName) => {
    setBudgetToDeleteId(id);
    setBudgetToDeleteCategoryName(categoryName);
    setIsConfirmModalOpen(true);
  };

  const executeDelete = async () => {
    setIsConfirmModalOpen(false);
    if (!budgetToDeleteId) return;

    setError(null);
    setDeleteLoadingId(budgetToDeleteId);
    try {
      await apiClient.delete(
        `/budgets/${budgetToDeleteId}`,
        
      );
      onBudgetDeleted();
    } catch (err) {
      setError(err.response?.data?.message || "Error deleting budget.");
      console.error("Delete budget error:", err);
    } finally {
      setDeleteLoadingId(null);
      setBudgetToDeleteId(null);
      setBudgetToDeleteCategoryName("");
    }
  };

  const cancelDelete = () => {
    setIsConfirmModalOpen(false);
    setBudgetToDeleteId(null);
    setBudgetToDeleteCategoryName("");
  };

  const handleDelete = async (id) => {
    confirmDelete(
      id,
      getCategoryName(
        budgets.find((b) => b._id === id)?.category?._id ||
          budgets.find((b) => b._id === id)?.category
      )
    );
  };

  const handleEditClick = (budget) => {
    setEditingBudgetId(budget._id);
    setEditFormData({
      limit: budget.limit,
      category: budget.category ? budget.category._id : "",
      period: budget.period,
      startdate: new Date(budget.startdate).toISOString().split("T")[0],
      enddate: new Date(budget.enddate).toISOString().split("T")[0],
    });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setEditLoadingId(editingBudgetId);

    if (
      !editFormData.limit ||
      !editFormData.category ||
      !editFormData.period ||
      !editFormData.startdate ||
      !editFormData.enddate
    ) {
      setError("Please fill all required fields for budget update.");
      setEditLoadingId(null);
      return;
    }
    if (parseFloat(editFormData.limit) <= 0) {
      setError("Budget limit must be a positive number.");
      setEditLoadingId(null);
      return;
    }
    if (new Date(editFormData.startdate) >= new Date(editFormData.enddate)) {
      setError("Start date must be before end date for budget.");
      setEditLoadingId(null);
      return;
    }

    try {
      const res = await apiClient.put(
        `/budgets/${editingBudgetId}`,
        {
          ...editFormData,
          limit: parseFloat(editFormData.limit),
        }
      );

      if (res.data.success) {
        onBudgetUpdated();
        setEditingBudgetId(null);
      } else {
        setError(res.data.message || "Failed to update budget.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Error updating budget.");
      console.error("Update budget error:", err);
    } finally {
      setEditLoadingId(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingBudgetId(null);
    setError(null);
  };

  const getCategoryName = (categoryId) => {
    const cat = categories.find((c) => c._id === categoryId);
    return cat ? cat.name : "Unknown";
  };

  const budgetableCategories = categories.filter(
    (cat) => cat.type === "expense"
  );

  return (
    <div>
      {error && (
        <p className="text-red-600 bg-red-50 p-2 rounded-md text-sm text-center border border-red-200 mb-4">
          {error}
        </p>
      )}

      {budgets.length === 0 ? (
        <p className="text-gray-500 italic text-center py-4">
          No budgets set yet. Set one to see it here!
        </p>
      ) : (
        <ul className="space-y-3">
          {budgets.map((b) => (
            <li
              key={b._id}
              className="p-3 rounded-lg shadow-sm transition-all duration-200 ease-in-out
                         flex flex-col sm:flex-row justify-between items-start sm:items-center
                         border
                         ${b.isOverBudget ? 'bg-red-100 border-red-300' : 'bg-purple-50 border-purple-100'}"
            >
              {editingBudgetId === b._id ? (
                <form onSubmit={handleEditSubmit} className="w-full space-y-2">
                  <div>
                    <label htmlFor="edit-budget-category" className="sr-only">
                      Category
                    </label>
                    <select
                      id="edit-budget-category"
                      name="category"
                      value={editFormData.category}
                      onChange={handleEditChange}
                      className="w-full p-2 border rounded-md"
                      required
                    >
                      <option value="">Select Category</option>
                      {budgetableCategories.map((cat) => (
                        <option key={cat._id} value={cat._id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="edit-budget-limit" className="sr-only">
                      Limit
                    </label>
                    <input
                      id="edit-budget-limit"
                      type="number"
                      name="limit"
                      value={editFormData.limit}
                      onChange={(e) =>
                        setEditFormData((prev) => ({
                          ...prev,
                          limit: e.target.value,
                        }))
                      }
                      className="w-full p-2 border rounded-md"
                      placeholder="Limit"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="edit-budget-period" className="sr-only">
                      Period
                    </label>
                    <select
                      id="edit-budget-period"
                      name="period"
                      value={editFormData.period}
                      onChange={handleEditChange}
                      className="w-full p-2 border rounded-md"
                      required
                    >
                      <option value="monthly">Monthly</option>
                      <option value="weekly">Weekly</option>
                      <option value="yearly">Yearly</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="edit-budget-startdate" className="sr-only">
                      Start Date
                    </label>
                    <input
                      id="edit-budget-startdate"
                      type="date"
                      name="startdate"
                      value={editFormData.startdate}
                      onChange={handleEditChange}
                      className="w-full p-2 border rounded-md"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="edit-budget-enddate" className="sr-only">
                      End Date
                    </label>
                    <input
                      id="edit-budget-enddate"
                      type="date"
                      name="enddate"
                      value={editFormData.enddate}
                      onChange={handleEditChange}
                      className="w-full p-2 border rounded-md"
                      required
                    />
                  </div>

                  <div className="flex justify-end space-x-2 mt-3">
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="px-3 py-1 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition"
                      disabled={editLoadingId === b._id}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition flex items-center gap-1"
                      disabled={editLoadingId === b._id}
                    >
                      {editLoadingId === b._id ? (
                        <ImSpinner2 className="animate-spin" />
                      ) : (
                        <FiEdit size={16} />
                      )}{" "}
                      Update
                    </button>
                  </div>
                </form>
              ) : (
                <div className="w-full flex flex-col sm:flex-row justify-between items-start sm:items-center">
                  <div className="mb-2 sm:mb-0 flex-1">
                    <p className="font-semibold text-gray-800 text-lg">
                      {getCategoryName(b.category?._id || b.category)} -{" "}
                      <span className="font-bold text-purple-600">
                        Limit: {formatCurrency(b.limit)}
                      </span>
                    </p>
                    <p className="text-sm text-gray-600">
                      Period:{" "}
                      {b.period.charAt(0).toUpperCase() + b.period.slice(1)} |{" "}
                      {formatDate(b.startdate)} - {formatDate(b.enddate)}
                    </p>
                    {/* Budget vs Actual Display */}
                    <div className="mt-1 flex items-center">
                      <span className="text-sm font-medium text-gray-700 mr-2">
                        Actual Spent:
                      </span>
                      <span
                        className={`font-semibold ${
                          b.isOverBudget ? "text-red-700" : "text-gray-900"
                        }`}
                      >
                        {formatCurrency(b.actualSpent)}
                      </span>
                      <span className="ml-2 text-sm font-medium text-gray-700 mr-2">
                        Remaining:
                      </span>
                      <span
                        className={`font-bold ${
                          b.isOverBudget ? "text-red-700" : "text-blue-600"
                        }`}
                      >
                        {formatCurrency(b.remaining)}
                      </span>
                      {b.isOverBudget && (
                        <FiAlertCircle
                          size={18}
                          className="ml-2 text-red-700"
                          title="You are over budget!"
                        />
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-2 mt-2 sm:mt-0">
                    <button
                      onClick={() => handleEditClick(b)}
                      className="text-blue-500 hover:text-blue-700 text-sm p-2 rounded-md hover:bg-blue-100 transition"
                    >
                      <FiEdit size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(b._id)}
                      className="text-red-500 hover:text-red-700 text-sm p-2 rounded-md hover:bg-red-100 transition flex items-center gap-1"
                      disabled={deleteLoadingId === b._id}
                    >
                      {deleteLoadingId === b._id ? (
                        <ImSpinner2 className="animate-spin" />
                      ) : (
                        <FiTrash2 size={18} />
                      )}
                    </button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
      {/* CONFIRMATION MODAL FOR DELETION */}
      <ConfirmModal
        isOpen={isConfirmModalOpen}
        message={`Are you sure you want to delete the budget for ${getCategoryName(
          budgetToDeleteCategoryName
        )}?`}
        onConfirm={executeDelete}
        onCancel={cancelDelete}
        confirmText="Delete Budget"
      />
    </div>
  );
};

export default BudgetList;
