import { useEffect } from 'react';
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
} from 'recharts';
import StatCard from '../../components/ui/StatCard';
import { fetchAdminStats } from '../../features/admin/adminSlice';

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value || 0);

const AdminDashboardPage = () => {
  const dispatch = useDispatch();
  const { stats, isLoading, error } = useSelector((state) => state.admin);

  useEffect(() => {
    dispatch(fetchAdminStats());
  }, [dispatch]);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Platform-wide overview</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Users" value={stats?.totalUsers ?? '—'} icon="👥" accent="primary" isLoading={isLoading} />
        <StatCard label="Active Users" value={stats?.activeUsers ?? '—'} icon="✅" accent="success" isLoading={isLoading} />
        <StatCard
          label="New Users (30d)"
          value={stats?.newUsersLast30Days ?? '—'}
          icon="🆕"
          accent="primary"
          isLoading={isLoading}
        />
        <StatCard
          label="Total Transactions"
          value={stats?.totalTransactions ?? '—'}
          icon="💳"
          accent="primary"
          isLoading={isLoading}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Platform Income"
          value={formatCurrency(stats?.totalPlatformIncome)}
          icon="⬆️"
          accent="success"
          isLoading={isLoading}
        />
        <StatCard
          label="Platform Expenses"
          value={formatCurrency(stats?.totalPlatformExpense)}
          icon="⬇️"
          accent="danger"
          isLoading={isLoading}
        />
        <StatCard label="Total AI Reports" value={stats?.totalAIReports ?? '—'} icon="✨" accent="primary" isLoading={isLoading} />
        <StatCard
          label="AI Reports (30d)"
          value={stats?.aiReportsLast30Days ?? '—'}
          icon="📈"
          accent="primary"
          isLoading={isLoading}
        />
      </div>

      <div className="glass-card p-6">
        <h2 className="mb-4 text-lg font-semibold">User Growth (Last 6 Months)</h2>
        {isLoading ? (
          <div className="skeleton h-64 w-full" />
        ) : !stats?.userGrowth?.length ? (
          <p className="py-12 text-center text-sm text-gray-500">Not enough data yet.</p>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={stats.userGrowth}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="label" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" name="New Users" fill="#6366f1" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default AdminDashboardPage;
