import React, { useState } from 'react';
import axios from 'axios';
import { FiEdit, FiTrash2 } from 'react-icons/fi';
import { ImSpinner2 } from 'react-icons/im';
import { formatCurrency, formatDate } from '../../utils/formatters.js';
import ConfirmModal from '../common/ConfirmModal.jsx';

const TransactionList = ({ transactions, categories, onTransactionDeleted, onTransactionUpdated }) => {
  const [editingTransactionId, setEditingTransactionId] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [deleteLoadingId, setDeleteLoadingId] = useState(null);
  const [editLoadingId, setEditLoadingId] = useState(null);
  const [error, setError] = useState(null);

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [transactionToDeleteId, setTransactionToDeleteId] = useState(null);
  const [transactionToDeleteDescription, setTransactionToDeleteDescription] = useState('');


  const confirmDelete = (id, description) => {
    setTransactionToDeleteId(id);
    setTransactionToDeleteDescription(description || 'this transaction');
    setIsConfirmModalOpen(true);
  };

  const executeDelete = async () => {
    setIsConfirmModalOpen(false);
    if (!transactionToDeleteId) return;

    setError(null);
    setDeleteLoadingId(transactionToDeleteId);
    try {
      await axios.delete(`http://localhost:5000/transactions/${transactionToDeleteId}`, {
        withCredentials: true
      });
      onTransactionDeleted();
    } catch (err) {
      setError(err.response?.data?.message || 'Error deleting transaction.');
      console.error("Delete transaction error:", err);
    } finally {
      setDeleteLoadingId(null);
      setTransactionToDeleteId(null);
      setTransactionToDeleteDescription('');
    }
  };

  const cancelDelete = () => {
    setIsConfirmModalOpen(false);
    setTransactionToDeleteId(null);
    setTransactionToDeleteDescription('');
  };


  const handleDelete = async (id) => {
    confirmDelete(id, transactions.find(t => t._id === id)?.description);
  };

  const handleEditClick = (transaction) => {
    setEditingTransactionId(transaction._id);
    setEditFormData({
      type: transaction.type,
      amount: transaction.amount,
      category: transaction.category ? transaction.category._id : '',
      description: transaction.description || '',
      date: new Date(transaction.date).toISOString().split('T')[0],
      recurring: transaction.recurring
    });
  };

  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setEditLoadingId(editingTransactionId);

    try {
      const res = await axios.put(`http://localhost:5000/transactions/${editingTransactionId}`, {
        ...editFormData,
        amount: parseFloat(editFormData.amount),
      }, { withCredentials: true });

      if (res.data.success) {
        onTransactionUpdated();
        setEditingTransactionId(null);
      } else {
        setError(res.data.message || 'Failed to update transaction.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error updating transaction.');
      console.error("Update transaction error:", err);
    } finally {
      setEditLoadingId(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingTransactionId(null);
    setError(null);
  };

  const getCategoryName = (categoryId) => {
    const cat = categories.find(c => c._id === categoryId);
    return cat ? cat.name : 'Unknown';
  };

  const filteredCategories = categories.filter(cat => cat.type === editFormData.type);


  return (
    <div className="overflow-x-auto">
      {error && (
        <p className="text-red-600 bg-red-50 p-2 rounded-md text-sm text-center border border-red-200 mb-4">
          {error}
        </p>
      )}

      {transactions.length === 0 ? (
        <p className="text-gray-500 italic text-center py-4">No transactions added yet. Add one to see it here!</p>
      ) : (
        <ul className="space-y-4">
          {transactions.map(t => (
            <li
              key={t._id}
              className="p-4 bg-gray-50 rounded-lg border border-gray-200 shadow-sm transition-all duration-200 ease-in-out
                         flex flex-col sm:flex-row justify-between items-start sm:items-center"
            >
              {editingTransactionId === t._id ? (
                <form onSubmit={handleEditSubmit} className="w-full space-y-3">
                  <div>
                    <label htmlFor="edit-type" className="sr-only">Type</label>
                    <select
                      id="edit-type"
                      name="type"
                      value={editFormData.type}
                      onChange={handleEditChange}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="expense">Expense</option>
                      <option value="income">Income</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="edit-amount" className="sr-only">Amount</label>
                    <input
                      id="edit-amount"
                      type="number"
                      name="amount"
                      value={editFormData.amount}
                      onChange={handleEditChange}
                      className="w-full p-2 border rounded-md"
                      placeholder="Amount"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="edit-category" className="sr-only">Category</label>
                    <select
                      id="edit-category"
                      name="category"
                      value={editFormData.category}
                      onChange={handleEditChange}
                      className="w-full p-2 border rounded-md"
                      required
                    >
                      <option value="">Select Category</option>
                      {filteredCategories.map(cat => (
                        <option key={cat._id} value={cat._id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="edit-description" className="sr-only">Description</label>
                    <input
                      id="edit-description"
                      type="text"
                      name="description"
                      value={editFormData.description}
                      onChange={handleEditChange}
                      className="w-full p-2 border rounded-md"
                      placeholder="Description"
                    />
                  </div>

                  <div>
                    <label htmlFor="edit-date" className="sr-only">Date</label>
                    <input
                      id="edit-date"
                      type="date"
                      name="date"
                      value={editFormData.date}
                      onChange={handleEditChange}
                      className="w-full p-2 border rounded-md"
                      required
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      id="edit-recurring"
                      type="checkbox"
                      name="recurring"
                      checked={editFormData.recurring}
                      onChange={handleEditChange}
                      className="mr-2 h-4 w-4"
                    />
                    <label htmlFor="edit-recurring" className="text-gray-700">Recurring</label>
                  </div>

                  <div className="flex justify-end space-x-2 mt-4">
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition"
                      disabled={editLoadingId === t._id}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition flex items-center gap-1"
                      disabled={editLoadingId === t._id}
                    >
                      {editLoadingId === t._id ? <ImSpinner2 className="animate-spin" /> : <FiEdit />} Update
                    </button>
                  </div>
                </form>
              ) : (
                <div className="w-full flex flex-col sm:flex-row justify-between items-start sm:items-center">
                  <div className="mb-2 sm:mb-0">
                    <p className="font-semibold text-gray-800 text-lg">
                      {t.description || 'No Description'} -{' '}
                      <span className={`font-bold ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(t.amount)}
                      </span>
                    </p>
                    <p className="text-sm text-gray-600">
                      Category: {t.category ? t.category.name : 'Unknown'} |{' '}
                      Date: {formatDate(t.date)}
                      {t.recurring && <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">Recurring</span>}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditClick(t)}
                      className="text-blue-500 hover:text-blue-700 text-sm p-2 rounded-md hover:bg-blue-100 transition"
                    >
                      <FiEdit size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(t._id)}
                      className="text-red-500 hover:text-red-700 text-sm p-2 rounded-md hover:bg-red-100 transition flex items-center gap-1"
                      disabled={deleteLoadingId === t._id}
                    >
                      {deleteLoadingId === t._id ? <ImSpinner2 className="animate-spin" /> : <FiTrash2 size={18} />}
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
        message={`Are you sure you want to delete ${transactionToDeleteDescription}? This action cannot be undone.`}
        onConfirm={executeDelete}
        onCancel={cancelDelete}
        confirmText="Delete Transaction"
      />
    </div>
  );
};

export default TransactionList;