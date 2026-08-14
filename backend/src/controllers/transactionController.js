const asyncHandler = require('express-async-handler');
const Transaction = require('../models/Transaction');
const AppError = require('../utils/AppError');

/**
 * @desc    Create a new transaction (income or expense)
 * @route   POST /api/transactions
 * @access  Private
 */
const createTransaction = asyncHandler(async (req, res) => {
  const {
    type,
    amount,
    category,
    tags,
    description,
    merchant,
    date,
    paymentMethod,
    receiptUrl,
    isRecurring,
    source,
  } = req.body;

  const transaction = await Transaction.create({
    user: req.user._id,
    type,
    amount,
    category,
    tags,
    description,
    merchant,
    date: date || Date.now(),
    paymentMethod,
    receiptUrl,
    isRecurring,
    source: source || 'manual',
  });

  res.status(201).json({ success: true, transaction });
});

/**
 * @desc    Get transactions with search, filters, sorting, and pagination
 * @route   GET /api/transactions
 * @query   page, limit, search, type, category, tags, startDate, endDate, minAmount, maxAmount, sortBy, sortOrder
 * @access  Private
 */
const getTransactions = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    search,
    type,
    category,
    tags,
    startDate,
    endDate,
    minAmount,
    maxAmount,
    sortBy = 'date',
    sortOrder = 'desc',
  } = req.query;

  const query = { user: req.user._id };

  if (type) query.type = type;
  if (category) query.category = category;
  if (tags) query.tags = { $in: tags.split(',') };

  if (startDate || endDate) {
    query.date = {};
    if (startDate) query.date.$gte = new Date(startDate);
    if (endDate) query.date.$lte = new Date(endDate);
  }

  if (minAmount || maxAmount) {
    query.amount = {};
    if (minAmount) query.amount.$gte = Number(minAmount);
    if (maxAmount) query.amount.$lte = Number(maxAmount);
  }

  if (search) {
    query.$or = [
      { description: { $regex: search, $options: 'i' } },
      { merchant: { $regex: search, $options: 'i' } },
      { category: { $regex: search, $options: 'i' } },
    ];
  }

  const sortDirection = sortOrder === 'asc' ? 1 : -1;
  const sortOptions = { [sortBy]: sortDirection };

  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10)));
  const skip = (pageNum - 1) * limitNum;

  const [transactions, total] = await Promise.all([
    Transaction.find(query).sort(sortOptions).skip(skip).limit(limitNum),
    Transaction.countDocuments(query),
  ]);

  res.status(200).json({
    success: true,
    count: transactions.length,
    total,
    page: pageNum,
    totalPages: Math.ceil(total / limitNum),
    transactions,
  });
});

/**
 * @desc    Get a single transaction by id
 * @route   GET /api/transactions/:id
 * @access  Private
 */
const getTransactionById = asyncHandler(async (req, res, next) => {
  const transaction = await Transaction.findOne({ _id: req.params.id, user: req.user._id });

  if (!transaction) {
    return next(new AppError('Transaction not found.', 404));
  }

  res.status(200).json({ success: true, transaction });
});

/**
 * @desc    Update a transaction
 * @route   PUT /api/transactions/:id
 * @access  Private
 */
const updateTransaction = asyncHandler(async (req, res, next) => {
  let transaction = await Transaction.findOne({ _id: req.params.id, user: req.user._id });

  if (!transaction) {
    return next(new AppError('Transaction not found.', 404));
  }

  const allowedFields = [
    'type',
    'amount',
    'category',
    'tags',
    'description',
    'merchant',
    'date',
    'paymentMethod',
    'receiptUrl',
    'isRecurring',
  ];

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) transaction[field] = req.body[field];
  });

  await transaction.save();

  res.status(200).json({ success: true, transaction });
});

/**
 * @desc    Delete a transaction
 * @route   DELETE /api/transactions/:id
 * @access  Private
 */
const deleteTransaction = asyncHandler(async (req, res, next) => {
  const transaction = await Transaction.findOneAndDelete({ _id: req.params.id, user: req.user._id });

  if (!transaction) {
    return next(new AppError('Transaction not found.', 404));
  }

  res.status(200).json({ success: true, message: 'Transaction deleted successfully.' });
});

/**
 * @desc    Get dashboard summary: total income, expenses, savings, balance
 * @route   GET /api/transactions/summary
 * @access  Private
 */
const getSummary = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const results = await Transaction.aggregate([
    { $match: { user: userId } },
    {
      $group: {
        _id: '$type',
        total: { $sum: '$amount' },
      },
    },
  ]);

  const totals = { income: 0, expense: 0 };
  results.forEach((r) => {
    totals[r._id] = r.total;
  });

  const balance = totals.income - totals.expense;
  const savings = balance > 0 ? balance : 0;

  res.status(200).json({
    success: true,
    summary: {
      totalIncome: totals.income,
      totalExpenses: totals.expense,
      totalSavings: savings,
      currentBalance: balance,
    },
  });
});

/**
 * @desc    Get category-wise breakdown (for pie chart)
 * @route   GET /api/transactions/category-breakdown
 * @access  Private
 */
const getCategoryBreakdown = asyncHandler(async (req, res) => {
  const { type = 'expense' } = req.query;

  const breakdown = await Transaction.aggregate([
    { $match: { user: req.user._id, type } },
    {
      $group: {
        _id: '$category',
        total: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
    { $sort: { total: -1 } },
  ]);

  res.status(200).json({ success: true, breakdown });
});

module.exports = {
  createTransaction,
  getTransactions,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
  getSummary,
  getCategoryBreakdown,
};
