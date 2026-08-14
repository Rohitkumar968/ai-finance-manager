const Transaction = require('../models/Transaction');

/**
 * Builds a compact financial summary for a user over the last N days,
 * used as grounding context for AI prompts.
 */
const buildFinancialContext = async (userId, days = 30) => {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const transactions = await Transaction.find({ user: userId, date: { $gte: since } })
    .sort({ date: -1 })
    .limit(300);

  let totalIncome = 0;
  let totalExpense = 0;
  const categoryTotals = {};

  transactions.forEach((t) => {
    if (t.type === 'income') {
      totalIncome += t.amount;
    } else {
      totalExpense += t.amount;
      categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
    }
  });

  const topCategories = Object.entries(categoryTotals)
    .map(([category, total]) => ({ category, total: Math.round(total * 100) / 100 }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 8);

  return {
    periodDays: days,
    transactionCount: transactions.length,
    totalIncome: Math.round(totalIncome * 100) / 100,
    totalExpense: Math.round(totalExpense * 100) / 100,
    balance: Math.round((totalIncome - totalExpense) * 100) / 100,
    topCategories,
    recentTransactions: transactions.slice(0, 15).map((t) => ({
      type: t.type,
      amount: t.amount,
      category: t.category,
      merchant: t.merchant,
      date: t.date,
    })),
  };
};

/**
 * Computes average monthly net savings (income - expense) over the last N months.
 * Used by the AI Goal Planner to estimate realistic contribution capacity.
 */
const getAverageMonthlySavings = async (userId, months = 3) => {
  const since = new Date();
  since.setMonth(since.getMonth() - months);

  const results = await Transaction.aggregate([
    { $match: { user: userId, date: { $gte: since } } },
    {
      $group: {
        _id: { year: { $year: '$date' }, month: { $month: '$date' }, type: '$type' },
        total: { $sum: '$amount' },
      },
    },
  ]);

  const monthly = {};
  results.forEach((r) => {
    const key = `${r._id.year}-${r._id.month}`;
    if (!monthly[key]) monthly[key] = { income: 0, expense: 0 };
    monthly[key][r._id.type] = r.total;
  });

  const netByMonth = Object.values(monthly).map((m) => m.income - m.expense);
  if (netByMonth.length === 0) return 0;

  const avg = netByMonth.reduce((sum, n) => sum + n, 0) / netByMonth.length;
  return Math.round(avg * 100) / 100;
};

module.exports = { buildFinancialContext, getAverageMonthlySavings };
