import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_BASE_URL = 'https://finance-backend-production-b00d.up.railway.app';

function Dashboard() {
  const [summary, setSummary] = useState({});
  const [categoryWise, setCategoryWise] = useState({});
  const [recentActivity, setRecentActivity] = useState([]);
  const navigate = useNavigate();

  const token = localStorage.getItem('token');
  const name = localStorage.getItem('name');
  const role = localStorage.getItem('role');
  const headers = { Authorization: `Bearer ${token}` };

  const fetchSummary = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/dashboard/summary`, { headers });
      setSummary(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchCategoryWise = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/dashboard/category-wise`, { headers });
      setCategoryWise(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchRecentActivity = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/dashboard/recent-activity`, { headers });
      setRecentActivity(res.data);
    } catch (err) { console.error(err); }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchSummary();
    fetchCategoryWise();
    fetchRecentActivity();
  }, []);

  const handleLogout = () => { localStorage.clear(); navigate('/login'); };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-blue-600 text-white px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">Finance Dashboard</h1>
        <div className="flex items-center gap-4">
          <span>Welcome, {name} ({role})</span>
          <button onClick={() => navigate('/transactions')} className="bg-white text-blue-600 px-3 py-1 rounded hover:bg-gray-100">Transactions</button>
          <button onClick={handleLogout} className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">Logout</button>
        </div>
      </nav>
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white p-6 rounded-lg shadow text-center">
            <p className="text-gray-500 mb-2">Total Income</p>
            <p className="text-3xl font-bold text-green-500">₹{summary.totalIncome || 0}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow text-center">
            <p className="text-gray-500 mb-2">Total Expense</p>
            <p className="text-3xl font-bold text-red-500">₹{summary.totalExpense || 0}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow text-center">
            <p className="text-gray-500 mb-2">Net Balance</p>
            <p className={`text-3xl font-bold ${summary.netBalance >= 0 ? 'text-blue-500' : 'text-red-500'}`}>₹{summary.netBalance || 0}</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">Category Wise Totals</h2>
            {Object.keys(categoryWise).length === 0 ? <p className="text-gray-400">No data available</p> : (
              Object.entries(categoryWise).map(([category, amount]) => (
                <div key={category} className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">{category}</span>
                  <span className="font-semibold">₹{amount}</span>
                </div>
              ))
            )}
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">Recent Activity</h2>
            {recentActivity.length === 0 ? <p className="text-gray-400">No recent activity</p> : (
              recentActivity.map((item, index) => (
                <div key={index} className="flex justify-between py-2 border-b">
                  <div>
                    <p className="text-gray-700">{item.category}</p>
                    <p className="text-sm text-gray-400">{item.date}</p>
                  </div>
                  <span className={`font-semibold ${item.type === 'INCOME' ? 'text-green-500' : 'text-red-500'}`}>₹{item.amount}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;