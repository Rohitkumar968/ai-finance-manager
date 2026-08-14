import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import apiClient from '../utils/apiClient';
import { useSelector } from 'react-redux';

const formatCurrency = (value, currency = 'USD') =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(value || 0);

const emptyForm = {
  category: '',
  limitAmount: '',
  period: 'monthly',
  month: new Date().getMonth() + 1,
  year: new Date().getFullYear(),
  alertThresholdPercent: 80,
};

const BudgetsPage = () => {
  const currency = useSelector((state) => state.auth.user?.currency) || 'USD';
  const [budgets, setBudgets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState(emptyForm);

  const loadBudgets = async () => {
    setIsLoading(true);
    try {
      const { data } = await apiClient.get('/budgets');
      setBudgets(data.budgets);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load budgets');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBudgets();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await apiClient.post('/budgets', {
        ...formData,
        limitAmount: parseFloat(formData.limitAmount),
        month: Number(formData.month),
        year: Number(formData.year),
        alertThresholdPercent: Number(formData.alertThresholdPercent),
      });
      toast.success('Budget created');
      setShowForm(false);
      setFormData(emptyForm);
      loadBudgets();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create budget');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this budget?')) return;
    try {
      await apiClient.delete(`/budgets/${id}`);
      toast.success('Budget deleted');
      loadBudgets();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete budget');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Budgets</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Track spending limits by category</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          {showForm ? 'Cancel' : '+ New Budget'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="glass-card p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium">Category</label>
            <input
              type="text"
              name="category"
              required
              className="input-field"
              placeholder="e.g. Groceries"
              value={formData.category}
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">Limit Amount</label>
            <input
              type="number"
              step="0.01"
              name="limitAmount"
              required
              className="input-field"
              placeholder="500"
              value={formData.limitAmount}
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">Period</label>
            <select name="period" className="input-field" value={formData.period} onChange={handleChange}>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
          {formData.period === 'monthly' && (
            <div>
              <label className="mb-1.5 block text-sm font-medium">Month</label>
              <select name="month" className="input-field" value={formData.month} onChange={handleChange}>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <option key={m} value={m}>
                    {new Date(2000, m - 1).toLocaleString('default', { month: 'long' })}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label className="mb-1.5 block text-sm font-medium">Year</label>
            <input
              type="number"
              name="year"
              required
              className="input-field"
              value={formData.year}
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">Alert Threshold (%)</label>
            <input
              type="number"
              name="alertThresholdPercent"
              min="1"
              max="100"
              className="input-field"
              value={formData.alertThresholdPercent}
              onChange={handleChange}
            />
          </div>
          <div className="sm:col-span-2">
            <button type="submit" className="btn-primary w-full">
              Create Budget
            </button>
          </div>
        </form>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="skeleton h-32 w-full" />
          ))}
        </div>
      ) : budgets.length === 0 ? (
        <p className="py-16 text-center text-sm text-gray-500">No budgets yet. Create one to start tracking.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {budgets.map((b) => (
            <div key={b._id} className="glass-card p-5">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold">{b.category}</h3>
                  <p className="text-xs text-gray-500">
                    {b.period === 'monthly'
                      ? new Date(2000, b.month - 1).toLocaleString('default', { month: 'long' })
                      : 'Yearly'}{' '}
                    {b.year}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(b._id)}
                  className="text-xs font-medium text-danger-600 hover:underline"
                >
                  Delete
                </button>
              </div>
              <div className="mt-4">
                <div className="flex justify-between text-sm mb-1">
                  <span>{formatCurrency(b.spent, currency)} spent</span>
                  <span className="text-gray-500">of {formatCurrency(b.limitAmount, currency)}</span>
                </div>
                <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      b.isOverBudget ? 'bg-danger-500' : 'bg-primary-600'
                    }`}
                    style={{ width: `${Math.min(100, b.percentUsed)}%` }}
                  />
                </div>
                {b.isOverBudget && (
                  <p className="mt-2 text-xs font-medium text-danger-600">⚠️ Over budget!</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BudgetsPage;
