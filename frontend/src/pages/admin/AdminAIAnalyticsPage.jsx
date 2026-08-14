import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import { fetchAIAnalytics } from '../../features/admin/adminSlice';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6', '#ec4899'];

const AdminAIAnalyticsPage = () => {
  const dispatch = useDispatch();
  const { aiAnalytics, isLoading, error } = useSelector((state) => state.admin);

  useEffect(() => {
    dispatch(fetchAIAnalytics());
  }, [dispatch]);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  const totalReports = aiAnalytics.byType.reduce((sum, t) => sum + t.count, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">AI Usage Analytics</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">{totalReports} AI reports generated platform-wide</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="glass-card p-6">
          <h2 className="mb-4 text-lg font-semibold">Reports by Feature Type</h2>
          {isLoading ? (
            <div className="skeleton h-64 w-full" />
          ) : aiAnalytics.byType.length === 0 ? (
            <p className="py-12 text-center text-sm text-gray-500">No AI usage yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={aiAnalytics.byType}
                  dataKey="count"
                  nameKey="type"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  label={(entry) => entry.type}
                >
                  {aiAnalytics.byType.map((entry, index) => (
                    <Cell key={entry.type} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="glass-card p-6">
          <h2 className="mb-4 text-lg font-semibold">Daily Trend (Last 30 Days)</h2>
          {isLoading ? (
            <div className="skeleton h-64 w-full" />
          ) : aiAnalytics.dailyTrend.length === 0 ? (
            <p className="py-12 text-center text-sm text-gray-500">No AI usage yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={aiAnalytics.dailyTrend}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="glass-card p-6">
        <h2 className="mb-4 text-lg font-semibold">Top AI Users</h2>
        {isLoading ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="skeleton h-10 w-full" />
            ))}
          </div>
        ) : aiAnalytics.topUsers.length === 0 ? (
          <p className="py-8 text-center text-sm text-gray-500">No AI usage yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800 text-left text-gray-500">
                <th className="py-2 pr-4 font-medium">Name</th>
                <th className="py-2 pr-4 font-medium">Email</th>
                <th className="py-2 pr-4 font-medium text-right">AI Requests</th>
              </tr>
            </thead>
            <tbody>
              {aiAnalytics.topUsers.map((u, idx) => (
                <tr key={idx} className="border-b border-gray-100 dark:border-gray-900">
                  <td className="py-3 pr-4 font-medium">{u.name}</td>
                  <td className="py-3 pr-4 text-gray-500">{u.email}</td>
                  <td className="py-3 pr-4 text-right font-semibold">{u.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminAIAnalyticsPage;
