import React, { useState } from 'react';
import axios from 'axios';
import { FiEdit, FiTrash2 } from 'react-icons/fi';
import { ImSpinner2 } from 'react-icons/im';
import ConfirmModal from '../common/ConfirmModal.jsx';

const CategoryList = ({ categories, onCategoryDeleted, onCategoryUpdated }) => {
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [deleteLoadingId, setDeleteLoadingId] = useState(null);
  const [editLoadingId, setEditLoadingId] = useState(null);
  const [error, setError] = useState(null);

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [categoryToDeleteId, setCategoryToDeleteId] = useState(null);
  const [categoryToDeleteName, setCategoryToDeleteName] = useState('');

  const confirmDelete = (id, name) => {
    setCategoryToDeleteId(id);
    setCategoryToDeleteName(name);
    setIsConfirmModalOpen(true);
  };

  const executeDelete = async () => {
    setIsConfirmModalOpen(false);
    if (!categoryToDeleteId) return;

    setError(null);
    setDeleteLoadingId(categoryToDeleteId);
    try {
      await axios.delete(`http://localhost:5000/categories/${categoryToDeleteId}`, {
        withCredentials: true
      });
      onCategoryDeleted();
    } catch (err) {
      setError(err.response?.data?.message || 'Error deleting category.');
      console.error("Delete category error:", err);
    } finally {
      setDeleteLoadingId(null);
      setCategoryToDeleteId(null);
      setCategoryToDeleteName('');
    }
  };

  const cancelDelete = () => {
    setIsConfirmModalOpen(false);
    setCategoryToDeleteId(null);
    setCategoryToDeleteName('');
  };

  const handleDelete = async (id) => {
    confirmDelete(id, categories.find(cat => cat._id === id)?.name);
  };

  const handleEditClick = (category) => {
    setEditingCategoryId(category._id);
    setEditFormData({
      name: category.name,
      type: category.type
    });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setEditLoadingId(editingCategoryId);

    if (!editFormData.name || !editFormData.type) {
        setError('Category name and type are required.');
        setEditLoadingId(null);
        return;
    }
    if (!['income', 'expense'].includes(editFormData.type)) {
        setError('Type must be "income" or "expense".');
        setEditLoadingId(null);
        return;
    }

    try {
      const res = await axios.put(`http://localhost:5000/categories/${editingCategoryId}`, {
        name: editFormData.name,
        type: editFormData.type
      }, { withCredentials: true });

      if (res.data.success) {
        onCategoryUpdated();
        setEditingCategoryId(null);
      } else {
        setError(res.data.message || 'Failed to update category.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error updating category.');
      console.error("Update category error:", err);
    } finally {
      setEditLoadingId(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingCategoryId(null);
    setError(null);
  };

  return (
    <div>
      {error && (
        <p className="text-red-600 bg-red-50 p-2 rounded-md text-sm text-center border border-red-200 mb-4">
          {error}
        </p>
      )}

      {categories.length === 0 ? (
        <p className="text-gray-500 italic text-center py-4">No categories added yet. Add one to see it here!</p>
      ) : (
        <ul className="space-y-3">
          {categories.map(cat => (
            <li
              key={cat._id}
              className="p-3 bg-blue-50 rounded-lg border border-blue-100 shadow-sm transition-all duration-200 ease-in-out
                         flex flex-col sm:flex-row justify-between items-start sm:items-center"
            >
              {editingCategoryId === cat._id ? (
                <form onSubmit={handleEditSubmit} className="w-full space-y-2">
                  <div>
                    <label htmlFor="edit-name" className="sr-only">Category Name</label>
                    <input
                      id="edit-name"
                      type="text"
                      name="name"
                      value={editFormData.name}
                      onChange={handleEditChange}
                      className="w-full p-2 border rounded-md"
                      placeholder="Category Name"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="edit-type" className="sr-only">Type</label>
                    <select
                      id="edit-type"
                      name="type"
                      value={editFormData.type}
                      onChange={handleEditChange}
                      className="w-full p-2 border rounded-md"
                      required
                    >
                      <option value="expense">Expense</option>
                      <option value="income">Income</option>
                    </select>
                  </div>

                  <div className="flex justify-end space-x-2 mt-3">
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="px-3 py-1 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition"
                      disabled={editLoadingId === cat._id}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition flex items-center gap-1"
                      disabled={editLoadingId === cat._id}
                    >
                      {editLoadingId === cat._id ? <ImSpinner2 className="animate-spin" /> : <FiEdit size={16} />} Update
                    </button>
                  </div>
                </form>
              ) : (
                <div className="w-full flex flex-col sm:flex-row justify-between items-start sm:items-center">
                  <div className="mb-2 sm:mb-0">
                    <p className="font-semibold text-gray-800 text-lg">{cat.name}</p>
                    <p className={`text-sm ${cat.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                      {cat.type.charAt(0).toUpperCase() + cat.type.slice(1)}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditClick(cat)}
                      className="text-blue-500 hover:text-blue-700 text-sm p-2 rounded-md hover:bg-blue-100 transition"
                    >
                      <FiEdit size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(cat._id)}
                      className="text-red-500 hover:text-red-700 text-sm p-2 rounded-md hover:bg-red-100 transition flex items-center gap-1"
                      disabled={deleteLoadingId === cat._id}
                    >
                      {deleteLoadingId === cat._id ? <ImSpinner2 className="animate-spin" /> : <FiTrash2 size={18} />}
                    </button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
      <ConfirmModal
        isOpen={isConfirmModalOpen}
        message={`Are you sure you want to delete category "${categoryToDeleteName}"? This may affect associated transactions.`}
        onConfirm={executeDelete}
        onCancel={cancelDelete}
        confirmText="Delete Category"
      />
    </div>
  );
};

export default CategoryList;