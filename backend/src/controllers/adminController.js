const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');
const Goal = require('../models/Goal');
const Notification = require('../models/Notification');
const AIReport = require('../models/AIReport');
const SystemSetting = require('../models/SystemSetting');
const { invalidateSettingsCache } = require('../services/settingsService');
const AppError = require('../utils/AppError');

/**
 * @desc    Get high-level dashboard stats for the admin panel
 * @route   GET /api/admin/stats
 * @access  Private/Admin
 */
const getDashboardStats = asyncHandler(async (req, res) => {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);
  sixMonthsAgo.setHours(0, 0, 0, 0);

  const [
    totalUsers,
    activeUsers,
    newUsersLast30Days,
    totalTransactions,
    totalBudgets,
    totalGoals,
    totalAIReports,
    aiReportsLast30Days,
    volumeResult,
    userGrowthRaw,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ isActive: true }),
    User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
    Transaction.countDocuments(),
    Budget.countDocuments(),
    Goal.countDocuments(),
    AIReport.countDocuments(),
    AIReport.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
    Transaction.aggregate([
      { $group: { _id: '$type', total: { $sum: '$amount' } } },
    ]),
    User.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]),
  ]);

  const volumeTotals = { income: 0, expense: 0 };
  volumeResult.forEach((r) => {
    volumeTotals[r._id] = r.total;
  });

  const userGrowth = userGrowthRaw.map((g) => ({
    label: `${g._id.year}-${String(g._id.month).padStart(2, '0')}`,
    count: g.count,
  }));

  res.status(200).json({
    success: true,
    stats: {
      totalUsers,
      activeUsers,
      inactiveUsers: totalUsers - activeUsers,
      newUsersLast30Days,
      totalTransactions,
      totalBudgets,
      totalGoals,
      totalAIReports,
      aiReportsLast30Days,
      totalPlatformIncome: Math.round((volumeTotals.income || 0) * 100) / 100,
      totalPlatformExpense: Math.round((volumeTotals.expense || 0) * 100) / 100,
      userGrowth,
    },
  });
});

/**
 * @desc    List users with search, filter, sort, pagination
 * @route   GET /api/admin/users
 * @access  Private/Admin
 */
const getUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search, role, isActive, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

  const query = {};
  if (role) query.role = role;
  if (isActive !== undefined) query.isActive = isActive === 'true';
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10)));
  const skip = (pageNum - 1) * limitNum;
  const sortOptions = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

  const [users, total] = await Promise.all([
    User.find(query).sort(sortOptions).skip(skip).limit(limitNum),
    User.countDocuments(query),
  ]);

  res.status(200).json({
    success: true,
    count: users.length,
    total,
    page: pageNum,
    totalPages: Math.ceil(total / limitNum),
    users,
  });
});

/**
 * @desc    Get a single user's detail including their activity counts
 * @route   GET /api/admin/users/:id
 * @access  Private/Admin
 */
const getUserById = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) return next(new AppError('User not found.', 404));

  const [transactionCount, budgetCount, goalCount, aiReportCount] = await Promise.all([
    Transaction.countDocuments({ user: user._id }),
    Budget.countDocuments({ user: user._id }),
    Goal.countDocuments({ user: user._id }),
    AIReport.countDocuments({ user: user._id }),
  ]);

  res.status(200).json({
    success: true,
    user,
    activity: { transactionCount, budgetCount, goalCount, aiReportCount },
  });
});

/**
 * @desc    Update a user's role or active status (RBAC control)
 * @route   PUT /api/admin/users/:id
 * @access  Private/Admin
 */
const updateUser = asyncHandler(async (req, res, next) => {
  if (req.params.id === req.user._id.toString()) {
    return next(new AppError('You cannot change your own role or status from here.', 400));
  }

  const user = await User.findById(req.params.id);
  if (!user) return next(new AppError('User not found.', 404));

  const allowedFields = ['role', 'isActive'];
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) user[field] = req.body[field];
  });

  await user.save({ validateBeforeSave: false });

  res.status(200).json({ success: true, user });
});

/**
 * @desc    Delete a user and cascade-delete their data
 * @route   DELETE /api/admin/users/:id
 * @access  Private/Admin
 */
const deleteUser = asyncHandler(async (req, res, next) => {
  if (req.params.id === req.user._id.toString()) {
    return next(new AppError('You cannot delete your own admin account from here.', 400));
  }

  const user = await User.findById(req.params.id);
  if (!user) return next(new AppError('User not found.', 404));

  await Promise.all([
    Transaction.deleteMany({ user: user._id }),
    Budget.deleteMany({ user: user._id }),
    Goal.deleteMany({ user: user._id }),
    Notification.deleteMany({ user: user._id }),
    AIReport.deleteMany({ user: user._id }),
    user.deleteOne(),
  ]);

  res.status(200).json({ success: true, message: 'User and all associated data deleted.' });
});

/**
 * @desc    List all transactions across all users (admin monitoring)
 * @route   GET /api/admin/transactions
 * @access  Private/Admin
 */
const getAllTransactions = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 15,
    search,
    type,
    category,
    startDate,
    endDate,
    sortBy = 'date',
    sortOrder = 'desc',
  } = req.query;

  const query = {};
  if (type) query.type = type;
  if (category) query.category = category;
  if (startDate || endDate) {
    query.date = {};
    if (startDate) query.date.$gte = new Date(startDate);
    if (endDate) query.date.$lte = new Date(endDate);
  }
  if (search) {
    query.$or = [
      { description: { $regex: search, $options: 'i' } },
      { merchant: { $regex: search, $options: 'i' } },
      { category: { $regex: search, $options: 'i' } },
    ];
  }

  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10)));
  const skip = (pageNum - 1) * limitNum;
  const sortOptions = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

  const [transactions, total] = await Promise.all([
    Transaction.find(query).populate('user', 'name email').sort(sortOptions).skip(skip).limit(limitNum),
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
 * @desc    Platform-wide transaction stats for the admin monitoring view
 * @route   GET /api/admin/transactions/stats
 * @access  Private/Admin
 */
const getTransactionStats = asyncHandler(async (req, res) => {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [topCategories, dailyVolume] = await Promise.all([
    Transaction.aggregate([
      { $match: { type: 'expense' } },
      { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $sort: { total: -1 } },
      { $limit: 8 },
    ]),
    Transaction.aggregate([
      { $match: { date: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
  ]);

  res.status(200).json({
    success: true,
    topCategories,
    dailyVolume: dailyVolume.map((d) => ({ date: d._id, total: d.total, count: d.count })),
  });
});

/**
 * @desc    AI usage analytics - report counts by type, daily trend, top users
 * @route   GET /api/admin/ai-analytics
 * @access  Private/Admin
 */
const getAIUsageAnalytics = asyncHandler(async (req, res) => {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [byType, dailyTrend, topUsersRaw] = await Promise.all([
    AIReport.aggregate([{ $group: { _id: '$type', count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
    AIReport.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
    AIReport.aggregate([
      { $group: { _id: '$user', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
      { $unwind: '$user' },
      { $project: { count: 1, 'user.name': 1, 'user.email': 1 } },
    ]),
  ]);

  res.status(200).json({
    success: true,
    byType: byType.map((t) => ({ type: t._id, count: t.count })),
    dailyTrend: dailyTrend.map((d) => ({ date: d._id, count: d.count })),
    topUsers: topUsersRaw.map((u) => ({ name: u.user.name, email: u.user.email, count: u.count })),
  });
});

/**
 * @desc    Get system settings (creates default singleton on first access)
 * @route   GET /api/admin/settings
 * @access  Private/Admin
 */
const getSystemSettings = asyncHandler(async (req, res) => {
  const settings = await SystemSetting.getSingleton();
  res.status(200).json({ success: true, settings });
});

/**
 * @desc    Update system settings
 * @route   PUT /api/admin/settings
 * @access  Private/Admin
 */
const updateSystemSettings = asyncHandler(async (req, res) => {
  const settings = await SystemSetting.getSingleton();

  const allowedFields = [
    'maintenanceMode',
    'allowRegistrations',
    'aiFeaturesEnabled',
    'maxAIRequestsPerHourPerUser',
    'announcementMessage',
  ];
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) settings[field] = req.body[field];
  });
  settings.updatedBy = req.user._id;

  await settings.save();
  invalidateSettingsCache();

  res.status(200).json({ success: true, settings });
});

/**
 * @desc    Broadcast a system notification to all users or a specific list
 * @route   POST /api/admin/notifications/broadcast
 * @access  Private/Admin
 */
const broadcastNotification = asyncHandler(async (req, res, next) => {
  const { title, message, userIds } = req.body;

  if (!title || !message) {
    return next(new AppError('Title and message are required.', 400));
  }

  let targetUserIds = userIds;
  if (!targetUserIds || targetUserIds.length === 0) {
    const allUsers = await User.find({ isActive: true }).select('_id');
    targetUserIds = allUsers.map((u) => u._id);
  }

  const notifications = targetUserIds.map((userId) => ({
    user: userId,
    type: 'system',
    title,
    message,
  }));

  await Notification.insertMany(notifications);

  res.status(201).json({
    success: true,
    message: `Notification sent to ${notifications.length} user(s).`,
  });
});

/**
 * @desc    Browse AI-generated reports across all users (admin Reports view)
 * @route   GET /api/admin/reports
 * @access  Private/Admin
 */
const getAllAIReports = asyncHandler(async (req, res) => {
  const { page = 1, limit = 15, type } = req.query;

  const query = {};
  if (type) query.type = type;

  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10)));
  const skip = (pageNum - 1) * limitNum;

  const [reports, total] = await Promise.all([
    AIReport.find(query)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum),
    AIReport.countDocuments(query),
  ]);

  res.status(200).json({
    success: true,
    count: reports.length,
    total,
    page: pageNum,
    totalPages: Math.ceil(total / limitNum),
    reports,
  });
});

module.exports = {
  getDashboardStats,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  getAllTransactions,
  getTransactionStats,
  getAIUsageAnalytics,
  getAllAIReports,
  getSystemSettings,
  updateSystemSettings,
  broadcastNotification,
};
