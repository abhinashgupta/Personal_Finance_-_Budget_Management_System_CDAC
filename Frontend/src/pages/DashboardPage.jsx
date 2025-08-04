import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext.jsx";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import { Chart as ChartJS, registerables } from "chart.js";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import {
  FiArrowUpCircle,
  FiArrowDownCircle,
  FiDollarSign,
} from "react-icons/fi";

import StatusDisplay from "../components/common/StatusDisplay.jsx";
import { formatCurrency } from "../utils/formatters.js";
import { FaRupeeSign } from "react-icons/fa";

ChartJS.register(...registerables);

const DashboardPage = () => {
  const { user, logout, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [barChartData, setBarChartData] = useState(null);
  const [doughnutChartData, setDoughnutChartData] = useState(null);
  const [lineChartData, setLineChartData] = useState(null);
  const [summaryData, setSummaryData] = useState(null);

  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchChartData = async () => {
    setDashboardLoading(true);
    setError(null);
    try {
      const res = await axios.get(
        "https://personal-finance-budget-management-c4th.onrender.com/transactions/charts-data",
        {
          withCredentials: true,
        }
      );

      if (res.data.success) {
        setBarChartData(res.data.barChartData);
        setDoughnutChartData(res.data.doughnutChartData);
        setLineChartData(res.data.lineChartData);
        setSummaryData(res.data.summary);
      } else {
        setError(res.data.message || "Failed to load dashboard data.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Error fetching dashboard data.");
      console.error("Dashboard data fetch error:", err);
    } finally {
      setDashboardLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      fetchChartData();
    }
  }, [isAuthenticated, authLoading]);

  if (authLoading) {
    return (
      <StatusDisplay type="loading" message="Checking authentication..." />
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (dashboardLoading) {
    return (
      <StatusDisplay type="loading" message="Loading your dashboard data..." />
    );
  }

  if (error) {
    return (
      <StatusDisplay type="error" message={error} onRetry={fetchChartData} />
    );
  }

  return (
    <div className="flex flex-col">
      {summaryData && (
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Summary for {summaryData.month}/{summaryData.year}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex flex-col items-center p-4 bg-green-50 rounded-lg shadow-sm border border-green-100">
              <FiArrowUpCircle size={32} className="text-green-500 mb-2" />
              <p className="text-lg font-medium text-gray-700">Total Income</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(summaryData.totalIncome)}
              </p>
            </div>
            <div className="flex flex-col items-center p-4 bg-red-50 rounded-lg shadow-sm border border-red-100">
              <FiArrowDownCircle size={32} className="text-red-500 mb-2" />
              <p className="text-lg font-medium text-gray-700">Total Expense</p>
              <p className="text-2xl font-bold text-red-600">
                {formatCurrency(summaryData.totalExpense)}
              </p>
            </div>
            <div
              className="flex flex-col items-center p-4 rounded-lg shadow-sm border
                            ${summaryData.netSavings >= 0 ? 'bg-blue-50 border-blue-100' : 'bg-orange-50 border-orange-100'}"
            >
              <FaRupeeSign
                size={32}
                className={`mb-2 ${
                  summaryData.netSavings >= 0
                    ? "text-blue-500"
                    : "text-orange-500"
                }`}
              />
              <p className="text-lg font-medium text-gray-700">
                Net Savings/Loss
              </p>
              <p
                className={`text-2xl font-bold ${
                  summaryData.netSavings >= 0
                    ? "text-blue-600"
                    : "text-orange-600"
                }`}
              >
                {formatCurrency(summaryData.netSavings)}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md flex flex-col h-[450px]">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">
            Income vs. Expense Overview (This Year)
          </h2>
          {barChartData?.labels?.length > 0 &&
          barChartData?.datasets[0]?.data.some((d) => d > 0) ? (
            <Bar
              data={barChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { position: "top" },
                  title: { display: false },
                },
              }}
              className="w-full h-full flex-1"
            />
          ) : (
            <div className="flex-1">
              <StatusDisplay
                type="empty"
                message="No income/expense data for charts yet. Add some transactions!"
                emptyActionText="Add Transactions"
                emptyActionPath="/transactions"
              />
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md flex flex-col h-[450px]">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">
            Expenses by Category (Current Month)
          </h2>
          {doughnutChartData?.labels?.length > 0 &&
          doughnutChartData?.datasets[0]?.data.some((d) => d > 0) ? (
            <Doughnut
              data={doughnutChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { position: "bottom" },
                  title: { display: false },
                },
              }}
              className="w-full h-full flex-1"
            />
          ) : (
            <div className="flex-1">
              <StatusDisplay
                type="empty"
                message="No expense data for this month. Add some expenses!"
                emptyActionText="Add Transactions"
                emptyActionPath="/transactions"
              />
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md col-span-1 lg:col-span-2 flex flex-col h-[450px]">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">
            Income Trend (This Year)
          </h2>
          {lineChartData?.labels?.length > 0 &&
          lineChartData?.datasets[0]?.data.some((d) => d > 0) ? (
            <Line
              data={lineChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { position: "top" },
                  title: { display: false },
                },
              }}
              className="w-full h-full flex-1"
            />
          ) : (
            <div className="flex-1">
              <StatusDisplay
                type="empty"
                message="No income data for charts yet. Add some income transactions!"
                emptyActionText="Add Transactions"
                emptyActionPath="/transactions"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
