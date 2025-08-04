import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

import BudgetForm from '../components/budgets/BudgetForm.jsx';
import BudgetList from '../components/budgets/BudgetList.jsx';
import StatusDisplay from '../components/common/StatusDisplay.jsx';

const BudgetsPage = () => {
    const { isAuthenticated, loading: authLoading } = useAuth();
    const navigate = useNavigate();

    const [budgets, setBudgets] = useState([]);
    const [categories, setCategories] = useState([]);
    const [pageLoading, setPageLoading] = useState(true);
    const [error, setError] = useState(null);

    const [filterCategory, setFilterCategory] = useState('');
    const [filterPeriod, setFilterPeriod] = useState('');
    const [filterStartDate, setFilterStartDate] = useState('');
    const [filterEndDate, setFilterEndDate] = useState('');
    const [sortBy, setSortBy] = useState('startdate');
    const [sortOrder, setSortOrder] = useState('desc');


    const fetchCategories = async () => {
        setError(null);
        try {
            const res = await axios.get('http://localhost:5000/categories', {
                withCredentials: true
            });
            if (res.data.success) {
                setCategories(res.data.categories);
            } else {
                setError(res.data.message || 'Failed to fetch categories.');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Error fetching categories.');
            console.error("Fetch categories error:", err);
        }
    };

    const fetchBudgets = async () => {
        setPageLoading(true);
        setError(null);

        try {
            if (categories.length === 0 && !error) {
                await fetchCategories();
            }

            const queryParams = new URLSearchParams();
            if (filterCategory) queryParams.append('category', filterCategory);
            if (filterPeriod) queryParams.append('period', filterPeriod);
            if (filterStartDate) queryParams.append('startDate', filterStartDate);
            if (filterEndDate) queryParams.append('endDate', filterEndDate);
            if (sortBy) queryParams.append('sortBy', sortBy);
            if (sortOrder) queryParams.append('sortOrder', sortOrder);

            const url = `http://localhost:5000/budgets?${queryParams.toString()}`;

            const res = await axios.get(url, {
                withCredentials: true
            });
            if (res.data.success) {
                setBudgets(res.data.budgets);
            } else {
                setError(res.data.message || 'Failed to fetch budgets.');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Error fetching budgets.');
            console.error("BudgetsPage: Fetch budgets error:", err);
        } finally {
            setPageLoading(false);
        }
    };

    const handleBudgetChange = () => {
        fetchCategories();
        fetchBudgets();
    };

    useEffect(() => {
        if (isAuthenticated && !authLoading) {
            fetchCategories();
            fetchBudgets();
        }
    }, [isAuthenticated, authLoading]);

    useEffect(() => {
        if (isAuthenticated && !authLoading) {
            fetchBudgets();
        }
    }, [filterCategory, filterPeriod, filterStartDate, filterEndDate, sortBy, sortOrder]);


    if (authLoading || pageLoading) {
        return <StatusDisplay type="loading" message="Loading budgets and categories..." />;
    }

    if (error) {
        return <StatusDisplay type="error" message={error} onRetry={handleBudgetChange} />;
    }

    const budgetableCategoriesForFilter = categories.filter(cat => cat.type === 'expense');


    return (
        <div className="flex flex-col">
            <div className="bg-white shadow-md rounded-lg p-4 mb-6">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">Filter & Sort Budgets</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div>
                        <label htmlFor="filterCategory" className="block text-gray-700 text-sm font-medium mb-1">Filter by Category</label>
                        <select
                            id="filterCategory"
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">All Categories</option>
                            {budgetableCategoriesForFilter.length > 0 ? (
                                budgetableCategoriesForFilter.map(cat => (
                                    <option key={cat._id} value={cat._id}>
                                        {cat.name}
                                    </option>
                                ))
                            ) : (
                                <option value="" disabled>No expense categories available</option>
                            )}
                        </select>
                    </div>

                    <div>
                        <label htmlFor="filterPeriod" className="block text-gray-700 text-sm font-medium mb-1">Filter by Period</label>
                        <select
                            id="filterPeriod"
                            value={filterPeriod}
                            onChange={(e) => setFilterPeriod(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">All Periods</option>
                            <option value="monthly">Monthly</option>
                            <option value="weekly">Weekly</option>
                            <option value="yearly">Yearly</option>
                        </select>
                    </div>

                    <div>
                        <label htmlFor="filterStartDate" className="block text-gray-700 text-sm font-medium mb-1">From Start Date</label>
                        <input
                            id="filterStartDate"
                            type="date"
                            value={filterStartDate}
                            onChange={(e) => setFilterStartDate(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label htmlFor="filterEndDate" className="block text-gray-700 text-sm font-medium mb-1">To End Date</label>
                        <input
                            id="filterEndDate"
                            type="date"
                            value={filterEndDate}
                            onChange={(e) => setFilterEndDate(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label htmlFor="sortBy" className="block text-gray-700 text-sm font-medium mb-1">Sort By</label>
                        <select
                            id="sortBy"
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="startdate">Start Date</option>
                            <option value="limit">Limit</option>
                            <option value="period">Period</option>
                        </select>
                    </div>

                    <div>
                        <label htmlFor="sortOrder" className="block text-gray-700 text-sm font-medium mb-1">Order</label>
                        <select
                            id="sortOrder"
                            value={sortOrder}
                            onChange={(e) => setSortOrder(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="desc">Descending</option>
                            <option value="asc">Ascending</option>
                        </select>
                    </div>
                </div>
                <button
                    onClick={() => {
                        setFilterCategory('');
                        setFilterPeriod('');
                        setFilterStartDate('');
                        setFilterEndDate('');
                        setSortBy('startdate');
                        setSortOrder('desc');
                    }}
                    className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition duration-200"
                >
                    Reset Filters
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-4">Set New Budget</h2>
                    <BudgetForm categories={categories} onBudgetAdded={handleBudgetChange} />
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md md:col-span-1">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-4">All Budgets</h2>
                    {budgets.length === 0 && !pageLoading ? (
                        <StatusDisplay type="empty" message="No budgets set yet. Set one to start tracking!" emptyActionText="Set a Budget" />
                    ) : (
                        <BudgetList
                            budgets={budgets}
                            categories={categories}
                            onBudgetDeleted={handleBudgetChange}
                            onBudgetUpdated={handleBudgetChange}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default BudgetsPage;