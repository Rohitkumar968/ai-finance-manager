import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { fetchAllTransactions, fetchTransactionStats } from '../../features/admin/adminSlice';

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value || 0);

const AdminTransactionsPage = () => {
  const dispatch = useDispatch();
  const {
    allTransactions,
    transactionsTotal,
    transactionsPage,
    transactionsTotalPages,
    transactionStats,
    isLoading,
    error,
  } = useSelector((state) => state.admin);

  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    dispatch(fetchTransactionStats());
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchAllTransactions({ page, limit: 15, search: search || undefined, type: type || undefined }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, page, type]);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    dispatch(fetchAllTransactions({ page: 1, limit: 15, search: search || undefined, type: type || undefined }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Transaction Monitoring</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">{transactionsTotal} total transactions across the platform</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="glass-card p-6">
          <h2 className="mb-4 text-lg font-semibold">Top Spending Categories (Platform-wide)</h2>
          {transactionStats.topCategories.length === 0 ? (
            <p className="py-12 text-center text-sm text-gray-500">No data yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={transactionStats.topCategories} layout="vertical" margin={{ left: 24 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis type="number" />
                <YAxis type="category" dataKey="_id" width={100} />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Bar dataKey="total" fill="#6366f1" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="glass-card p-6">
          <h2 className="mb-4 text-lg font-semibold">Daily Volume (Last 30 Days)</h2>
          {transactionStats.dailyVolume.length === 0 ? (
            <p className="py-12 text-center text-sm text-gray-500">No data yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={transactionStats.dailyVolume}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend />
                <Bar dataKey="total" name="Volume" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <form onSubmit={handleSearchSubmit} className="flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Search description, merchant, category…"
          className="input-field max-w-xs"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="input-field max-w-[160px]"
          value={type}
          onChange={(e) => {
            setType(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All types</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
        <button type="submit" className="btn-secondary">
          Search
        </button>
      </form>

      <div className="glass-card overflow-x-auto p-4">
        {isLoading ? (
          <div className="space-y-2">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="skeleton h-12 w-full" />
            ))}
          </div>
        ) : allTransactions.length === 0 ? (
          <p className="py-12 text-center text-sm text-gray-500">No transactions found.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800 text-left text-gray-500">
                <th className="py-2 pr-4 font-medium">Date</th>
                <th className="py-2 pr-4 font-medium">User</th>
                <th className="py-2 pr-4 font-medium">Category</th>
                <th className="py-2 pr-4 font-medium">Description</th>
                <th className="py-2 pr-4 font-medium text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {allTransactions.map((t) => (
                <tr key={t._id} className="border-b border-gray-100 dark:border-gray-900">
                  <td className="py-3 pr-4 text-gray-500">{new Date(t.date).toLocaleDateString()}</td>
                  <td className="py-3 pr-4">
                    <p className="font-medium">{t.user?.name || 'Unknown'}</p>
                    <p className="text-xs text-gray-500">{t.user?.email}</p>
                  </td>
                  <td className="py-3 pr-4">{t.category}</td>
                  <td className="py-3 pr-4 text-gray-500">{t.description || '—'}</td>
                  <td
                    className={`py-3 pr-4 text-right font-semibold ${
                      t.type === 'income' ? 'text-success-600' : 'text-danger-600'
                    }`}
                  >
                    {t.type === 'income' ? '+' : '-'}
                    {formatCurrency(t.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {transactionsTotalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            disabled={transactionsPage <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="btn-secondary !py-1.5 !px-3 text-xs disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-sm text-gray-500">
            Page {transactionsPage} of {transactionsTotalPages}
          </span>
          <button
            disabled={transactionsPage >= transactionsTotalPages}
            onClick={() => setPage((p) => Math.min(transactionsTotalPages, p + 1))}
            className="btn-secondary !py-1.5 !px-3 text-xs disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminTransactionsPage;
