import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {Wallet,ArrowDownCircle,PiggyBank,Landmark,} from "lucide-react";
import StatCard from '../components/ui/StatCard';
import AIInsightsCard from '../components/ui/AIInsightsCard';
import {fetchSummary,fetchCategoryBreakdown,fetchTransactions,} from '../features/transactions/transactionSlice';
import {PieChart,Pie,Cell,ResponsiveContainer,Tooltip,Legend,BarChart,Bar,XAxis,YAxis,CartesianGrid,LineChart,Line,} from "recharts";

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6', '#ec4899'];

const formatCurrency = (value, currency = 'USD') =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(value || 0);

const DashboardPage = () => {
  const dispatch = useDispatch();
  const { summary, categoryBreakdown, items, isLoading } = useSelector((state) => state.transactions);
  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
    dispatch(fetchSummary());
    dispatch(fetchCategoryBreakdown('expense'));
    dispatch(fetchTransactions({ limit: 5, sortBy: 'date', sortOrder: 'desc' }));
  }, [dispatch]);

  const currency = user?.currency || 'USD';
  const monthlyData = [
  { month: "Jan", expense: 420 },
  { month: "Feb", expense: 680 },
  { month: "Mar", expense: 510 },
  { month: "Apr", expense: 890 },
  { month: "May", expense: 720 },
  { month: "Jun", expense: 950 },
];

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500 p-8 text-white shadow-2xl">
     <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-3xl"></div>

    <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
    <div>
      <h1 className="text-4xl font-bold">
        Welcome back, {user?.name?.split(" ")[0]} 👋
      </h1>

      <p className="mt-2 text-blue-100">
        Track your finances smarter with AI-powered insights.
      </p>
    </div>

    <div className="rounded-2xl bg-white/10 backdrop-blur-md p-6">
      <p className="text-sm text-blue-100">Current Balance</p>

      <h2 className="mt-2 text-3xl font-bold">
        {formatCurrency(summary.currentBalance, currency)}
      </h2>

      <p className="mt-2 text-green-300 font-medium">
        ▲ +8% from last month
      </p>
      </div>
      </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
         label="Total Income"
        value={formatCurrency(summary.totalIncome, currency)}
        icon={<Wallet size={28} />}
        accent="success"
        trend="+18%"
        isLoading={isLoading}
       />

      <StatCard
      label="Total Expenses"
      value={formatCurrency(summary.totalExpenses, currency)}
      icon={<ArrowDownCircle size={28} />}
      accent="danger"
      trend="-4%"
      isLoading={isLoading}
      />

    <StatCard
     label="Total Savings"
     value={formatCurrency(summary.totalSavings, currency)}
     icon={<PiggyBank size={28} />}
     accent="primary"
     trend="+12%"
     isLoading={isLoading}
    />

    <StatCard
    label="Current Balance"
    value={formatCurrency(summary.currentBalance, currency)}
    icon={<Landmark size={28} />}
    accent="primary"
    trend="+8%"
    isLoading={isLoading}
     />
      
      </div>

      <AIInsightsCard />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="glass-card p-6">
          <h2 className="mb-4 text-lg font-semibold">Spending by Category</h2>
          {categoryBreakdown.length === 0 ? (
            <p className="py-12 text-center text-sm text-gray-500">No expense data yet. Add a transaction to see insights.</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={categoryBreakdown}
                  dataKey="total"
                  nameKey="_id"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  label={(entry) => entry._id}
                >
                  {categoryBreakdown.map((entry, index) => (
                    <Cell key={entry._id} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value, currency)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="glass-card p-6">
          <h2 className="mb-4 text-lg font-semibold">Income vs Expense</h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart
              data={[
                { name: 'This Period', Income: summary.totalIncome, Expense: summary.totalExpenses },
              ]}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(value, currency)} />
              <Legend />
              <Bar dataKey="Income" fill="#10b981" radius={[6, 6, 0, 0]} />
              <Bar dataKey="Expense" fill="#ef4444" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="glass-card p-6 lg:col-span-2">
  <h2 className="mb-4 text-lg font-semibold">
    Monthly Spending Trend
  </h2>

  <ResponsiveContainer width="100%" height={300}>
    <LineChart data={monthlyData}>
      <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
      <XAxis dataKey="month" />
      <YAxis />
      <Tooltip />
      <Legend />
      <Line
        type="monotone"
        dataKey="expense"
        stroke="#6366f1"
        strokeWidth={3}
      />
    </LineChart>
  </ResponsiveContainer>
</div>
      </div>

      <div className="glass-card p-6">
        <h2 className="mb-4 text-lg font-semibold">Recent Transactions</h2>
        {items.length === 0 ? (
          <p className="py-8 text-center text-sm text-gray-500">No transactions yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-800 text-left text-gray-500">
                  <th className="py-2 pr-4 font-medium">Date</th>
                  <th className="py-2 pr-4 font-medium">Category</th>
                  <th className="py-2 pr-4 font-medium">Description</th>
                  <th className="py-2 pr-4 font-medium text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {items.map((t) => (
                  <tr key={t._id} className="border-b border-gray-100 dark:border-gray-900">
                    <td className="py-3 pr-4 text-gray-500">{new Date(t.date).toLocaleDateString()}</td>
                    <td className="py-3 pr-4">{t.category}</td>
                    <td className="py-3 pr-4 text-gray-500">{t.description || '—'}</td>
                    <td
                      className={`py-3 pr-4 text-right font-semibold ${
                        t.type === 'income' ? 'text-success-600' : 'text-danger-600'
                      }`}
                    >
                      {t.type === 'income' ? '+' : '-'}
                      {formatCurrency(t.amount, currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
