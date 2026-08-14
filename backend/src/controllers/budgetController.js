const asyncHandler = require('express-async-handler');
const Budget = require('../models/Budget');
const Transaction = require('../models/Transaction');
const AppError = require('../utils/AppError');

/**
 * @desc    Create a budget (overall or category-based, monthly or yearly)
 * @route   POST /api/budgets
 * @access  Private
 */
const createBudget = asyncHandler(async (req, res) => {
  const { category, limitAmount, period, month, year, alertThresholdPercent } = req.body;

  const budget = await Budget.create({
    user: req.user._id,
    category,
    limitAmount,
    period,
    month,
    year,
    alertThresholdPercent,
  });

  res.status(201).json({ success: true, budget });
});

/**
 * @desc    Get all budgets for logged-in user, with computed spent amount & progress
 * @route   GET /api/budgets
 * @access  Private
 */
const getBudgets = asyncHandler(async (req, res) => {
  const { month, year } = req.query;

  const query = { user: req.user._id };
  if (month) query.month = Number(month);
  if (year) query.year = Number(year);

  const budgets = await Budget.find(query).sort({ createdAt: -1 });

  const budgetsWithProgress = await Promise.all(
    budgets.map(async (budget) => {
      const matchStage = {
        user: req.user._id,
        type: 'expense',
        category: budget.category,
      };

      if (budget.period === 'monthly' && budget.month) {
        const start = new Date(budget.year, budget.month - 1, 1);
        const end = new Date(budget.year, budget.month, 1);
        matchStage.date = { $gte: start, $lt: end };
      } else {
        const start = new Date(budget.year, 0, 1);
        const end = new Date(budget.year + 1, 0, 1);
        matchStage.date = { $gte: start, $lt: end };
      }

      const result = await Transaction.aggregate([
        { $match: matchStage },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]);

      const spent = result[0]?.total || 0;
      const percentUsed = budget.limitAmount > 0 ? Math.round((spent / budget.limitAmount) * 100) : 0;

      return {
        ...budget.toObject(),
        spent,
        remaining: Math.max(0, budget.limitAmount - spent),
        percentUsed,
        isOverBudget: spent > budget.limitAmount,
      };
    })
  );

  res.status(200).json({ success: true, budgets: budgetsWithProgress });
});

/**
 * @desc    Update a budget
 * @route   PUT /api/budgets/:id
 * @access  Private
 */
const updateBudget = asyncHandler(async (req, res, next) => {
  const budget = await Budget.findOne({ _id: req.params.id, user: req.user._id });
  if (!budget) return next(new AppError('Budget not found.', 404));

  const allowedFields = ['category', 'limitAmount', 'period', 'month', 'year', 'alertThresholdPercent'];
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) budget[field] = req.body[field];
  });

  await budget.save();
  res.status(200).json({ success: true, budget });
});

/**
 * @desc    Delete a budget
 * @route   DELETE /api/budgets/:id
 * @access  Private
 */
const deleteBudget = asyncHandler(async (req, res, next) => {
  const budget = await Budget.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  if (!budget) return next(new AppError('Budget not found.', 404));
  res.status(200).json({ success: true, message: 'Budget deleted successfully.' });
});

module.exports = { createBudget, getBudgets, updateBudget, deleteBudget };
