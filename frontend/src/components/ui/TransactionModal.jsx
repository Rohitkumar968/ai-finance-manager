import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import { categorizeExpense } from '../../features/ai/aiSlice';

const CATEGORIES = [
  'Food & Dining',
  'Groceries',
  'Transportation',
  'Housing',
  'Utilities',
  'Entertainment',
  'Healthcare',
  'Shopping',
  'Education',
  'Travel',
  'Salary',
  'Freelance',
  'Investment',
  'Other',
];

const emptyForm = {
  type: 'expense',
  amount: '',
  category: '',
  description: '',
  merchant: '',
  date: new Date().toISOString().slice(0, 10),
  paymentMethod: 'card',
  tags: '',
};

const TransactionModal = ({ isOpen, onClose, onSubmit, initialData }) => {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState(emptyForm);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [aiCategorized, setAiCategorized] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        type: initialData.type,
        amount: initialData.amount,
        category: initialData.category,
        description: initialData.description || '',
        merchant: initialData.merchant || '',
        date: new Date(initialData.date).toISOString().slice(0, 10),
        paymentMethod: initialData.paymentMethod || 'card',
        tags: (initialData.tags || []).join(', '),
      });
    } else {
      setFormData(emptyForm);
    }
    setAiCategorized(false);
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    if (e.target.name === 'category') setAiCategorized(false);
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSuggestCategory = async () => {
    if (!formData.description && !formData.merchant) {
      toast.error('Add a description or merchant first so AI has something to work with.');
      return;
    }
    setIsSuggesting(true);
    try {
      const result = await dispatch(
        categorizeExpense({
          description: formData.description,
          merchant: formData.merchant,
          amount: formData.amount,
        })
      ).unwrap();
      setFormData((prev) => ({ ...prev, category: result.category }));
      setAiCategorized(true);
      toast.success(`AI suggests: ${result.category}`);
    } catch (err) {
      toast.error(err || 'Could not suggest a category.');
    } finally {
      setIsSuggesting(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      amount: parseFloat(formData.amount),
      tags: formData.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      source: aiCategorized ? 'ai' : 'manual',
      aiCategorized,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="glass-card w-full max-w-lg bg-white dark:bg-gray-900 p-6">
        <h2 className="mb-5 text-lg font-semibold">
          {initialData ? 'Edit Transaction' : 'Add Transaction'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: 'expense' })}
              className={`rounded-xl border py-2.5 text-sm font-semibold transition-colors ${
                formData.type === 'expense'
                  ? 'border-danger-500 bg-red-50 text-danger-600 dark:bg-red-500/10'
                  : 'border-gray-300 dark:border-gray-700 text-gray-500'
              }`}
            >
              Expense
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: 'income' })}
              className={`rounded-xl border py-2.5 text-sm font-semibold transition-colors ${
                formData.type === 'income'
                  ? 'border-success-500 bg-emerald-50 text-success-600 dark:bg-emerald-500/10'
                  : 'border-gray-300 dark:border-gray-700 text-gray-500'
              }`}
            >
              Income
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium">Amount</label>
              <input
                type="number"
                step="0.01"
                name="amount"
                required
                className="input-field"
                placeholder="0.00"
                value={formData.amount}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Date</label>
              <input
                type="date"
                name="date"
                required
                className="input-field"
                value={formData.date}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">Merchant</label>
            <input
              type="text"
              name="merchant"
              className="input-field"
              placeholder="e.g. Amazon, Starbucks"
              value={formData.merchant}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">Description</label>
            <input
              type="text"
              name="description"
              className="input-field"
              placeholder="Optional note"
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="block text-sm font-medium">Category</label>
              <button
                type="button"
                onClick={handleSuggestCategory}
                disabled={isSuggesting}
                className="flex items-center gap-1 text-xs font-semibold text-primary-600 hover:text-primary-700 disabled:opacity-50"
              >
                {isSuggesting ? 'Thinking…' : '✨ Suggest with AI'}
              </button>
            </div>
            <select name="category" required className="input-field" value={formData.category} onChange={handleChange}>
              <option value="">Select a category</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            {aiCategorized && (
              <p className="mt-1 text-xs text-primary-600">✨ AI-suggested category applied</p>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">Tags (comma separated)</label>
            <input
              type="text"
              name="tags"
              className="input-field"
              placeholder="e.g. work, recurring"
              value={formData.tags}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">Payment Method</label>
            <select name="paymentMethod" className="input-field" value={formData.paymentMethod} onChange={handleChange}>
              <option value="cash">Cash</option>
              <option value="card">Card</option>
              <option value="upi">UPI</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" className="btn-primary flex-1">
              {initialData ? 'Save Changes' : 'Add Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransactionModal;
