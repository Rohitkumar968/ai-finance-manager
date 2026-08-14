const asyncHandler = require('express-async-handler');
const Goal = require('../models/Goal');
const AppError = require('../utils/AppError');

/**
 * @desc    Create a savings goal
 * @route   POST /api/goals
 * @access  Private
 */
const createGoal = asyncHandler(async (req, res) => {
  const { title, type, targetAmount, currentAmount, deadline, icon } = req.body;

  const goal = await Goal.create({
    user: req.user._id,
    title,
    type,
    targetAmount,
    currentAmount,
    deadline,
    icon,
  });

  res.status(201).json({ success: true, goal });
});

/**
 * @desc    Get all goals for logged-in user
 * @route   GET /api/goals
 * @access  Private
 */
const getGoals = asyncHandler(async (req, res) => {
  const goals = await Goal.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.status(200).json({ success: true, goals });
});

/**
 * @desc    Update a goal (including contributing funds toward it)
 * @route   PUT /api/goals/:id
 * @access  Private
 */
const updateGoal = asyncHandler(async (req, res, next) => {
  const goal = await Goal.findOne({ _id: req.params.id, user: req.user._id });
  if (!goal) return next(new AppError('Goal not found.', 404));

  const allowedFields = ['title', 'type', 'targetAmount', 'currentAmount', 'deadline', 'icon'];
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) goal[field] = req.body[field];
  });

  if (goal.currentAmount >= goal.targetAmount) {
    goal.isCompleted = true;
  }

  await goal.save();
  res.status(200).json({ success: true, goal });
});

/**
 * @desc    Delete a goal
 * @route   DELETE /api/goals/:id
 * @access  Private
 */
const deleteGoal = asyncHandler(async (req, res, next) => {
  const goal = await Goal.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  if (!goal) return next(new AppError('Goal not found.', 404));
  res.status(200).json({ success: true, message: 'Goal deleted successfully.' });
});

module.exports = { createGoal, getGoals, updateGoal, deleteGoal };
