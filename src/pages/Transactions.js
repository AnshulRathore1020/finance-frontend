import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_BASE_URL = 'https://finance-backend-production-b00d.up.railway.app';

function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [filterType, setFilterType] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [form, setForm] = useState({ amount: '', type: 'INCOME', category: '', date: '', description: '' });

  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  const headers = { Authorization: `Bearer ${token}` };

  const fetchTransactions = async () => {
    try {
      let url = `${API_BASE_URL}/api/transactions?`;
      if (filterType) url += `type=${filterType}&`;
      if (filterCategory) url += `category=${filterCategory}`;
      const res = await axios.get(url, { headers });
      setTransactions(res.data);
    } catch (err) { setError('Failed to fetch transactions'); }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchTransactions(); }, [filterType, filterCategory]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await axios.put(`${API_BASE_URL}/api/transactions/${editId}`, form, { headers });
        setSuccess('Transaction updated!');
      } else {
        await axios.post(`${API_BASE_URL}/api/transactions`, form, { headers });
        setSuccess('Transaction created!');
      }
      setForm({ amount: '', type: 'INCOME', category: '', date: '', description: '' });
      setEditId(null);
      setShowForm(false);
      fetchTransactions();
    } catch (err) { setError(err.response?.data?.error || 'Operation failed'); }
  };

  const handleEdit = (t) => {
    setForm({ amount: t.amount, type: t.type, category: t.category, date: t.date, description: t.description || '' });
    setEditId(t.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure?')) return;
    try {
      await axios.delete(`${API_BASE_URL}/api/transactions/${id}`, { headers });
      setSuccess('Transaction deleted!');
      fetchTransactions();
    } catch (err) { setError('Delete failed'); }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-blue-600 text-white px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">Transactions</h1>
        <div className="flex gap-3">
          <button onClick={() => navigate('/dashboard')} className="bg-white text-blue-600 px-3 py-1 rounded hover:bg-gray-100">Dashboard</button>
          <button onClick={() => { localStorage.clear(); navigate('/login'); }} className="bg-red-500 px-3 py-1 rounded hover:bg-red-600">Logout</button>
        </div>
      </nav>
      <div className="p-6">
        {error && <div className="bg-red-100 text-red-600 p-3 rounded mb-4">{error}</div>}
        {success && <div className="bg-green-100 text-green-600 p-3 rounded mb-4">{success}</div>}
        <div className="flex flex-wrap gap-3 mb-6">
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="border rounded px-3 py-2">
            <option value="">All Types</option>
            <option value="INCOME">Income</option>
            <option value="EXPENSE">Expense</option>
          </select>
          <input type="text" placeholder="Filter by category" value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)} className="border rounded px-3 py-2" />
          {(role === 'ADMIN' || role === 'ANALYST') && (
            <button onClick={() => { setShowForm(!showForm); setEditId(null); setForm({ amount: '', type: 'INCOME', category: '', date: '', description: '' }); }}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              {showForm ? 'Cancel' : '+ Add Transaction'}
            </button>
          )}
        </div>
        {showForm && (
          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <h2 className="text-lg font-semibold mb-4">{editId ? 'Edit Transaction' : 'New Transaction'}</h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 mb-1">Amount</label>
                <input type="number" required value={form.amount} onChange={(e) => setForm({...form, amount: e.target.value})} className="w-full border rounded px-3 py-2" placeholder="Enter amount" />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Type</label>
                <select value={form.type} onChange={(e) => setForm({...form, type: e.target.value})} className="w-full border rounded px-3 py-2">
                  <option value="INCOME">Income</option>
                  <option value="EXPENSE">Expense</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Category</label>
                <input type="text" required value={form.category} onChange={(e) => setForm({...form, category: e.target.value})} className="w-full border rounded px-3 py-2" placeholder="e.g. Food, Salary" />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Date</label>
                <input type="date" required value={form.date} onChange={(e) => setForm({...form, date: e.target.value})} className="w-full border rounded px-3 py-2" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-gray-700 mb-1">Description</label>
                <input type="text" value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} className="w-full border rounded px-3 py-2" placeholder="Optional description" />
              </div>
              <div className="md:col-span-2">
                <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">{editId ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        )}
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-gray-600">Date</th>
                <th className="px-4 py-3 text-left text-gray-600">Category</th>
                <th className="px-4 py-3 text-left text-gray-600">Type</th>
                <th className="px-4 py-3 text-left text-gray-600">Amount</th>
                <th className="px-4 py-3 text-left text-gray-600">Description</th>
                {(role === 'ADMIN' || role === 'ANALYST') && <th className="px-4 py-3 text-left text-gray-600">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {transactions.length === 0 ? (
                <tr><td colSpan="6" className="px-4 py-6 text-center text-gray-400">No transactions found</td></tr>
              ) : (
                transactions.map((t) => (
                  <tr key={t.id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3">{t.date}</td>
                    <td className="px-4 py-3">{t.category}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-sm font-medium ${t.type === 'INCOME' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>{t.type}</span>
                    </td>
                    <td className="px-4 py-3 font-semibold">₹{t.amount}</td>
                    <td className="px-4 py-3 text-gray-500">{t.description || '-'}</td>
                    {(role === 'ADMIN' || role === 'ANALYST') && (
                      <td className="px-4 py-3">
                        <button onClick={() => handleEdit(t)} className="text-blue-600 hover:underline mr-3">Edit</button>
                        {role === 'ADMIN' && <button onClick={() => handleDelete(t.id)} className="text-red-600 hover:underline">Delete</button>}
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Transactions;