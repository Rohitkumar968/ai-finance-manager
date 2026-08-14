const asyncHandler = require('express-async-handler');
const AppError = require('../utils/AppError');
const AIReport = require('../models/AIReport');
const Budget = require('../models/Budget');
const Goal = require('../models/Goal');
const Transaction = require('../models/Transaction');
const Notification = require('../models/Notification');
const gemini = require('../services/geminiService');
const { buildFinancialContext, getAverageMonthlySavings } = require('../services/financialContextService');

// Kept in sync with CATEGORIES in frontend/src/components/ui/TransactionModal.jsx
// so AI-suggested categories always match an existing dropdown option.
const COMMON_CATEGORIES = [
  'Food & Dining', 'Groceries', 'Transportation', 'Housing', 'Utilities', 'Entertainment',
  'Healthcare', 'Shopping', 'Education', 'Travel', 'Salary', 'Freelance', 'Investment', 'Other',
];

/** Wraps AI_NOT_CONFIGURED errors as a clean 503 instead of a 500. */
const handleAIError = (error, next) => {
  if (error.code === 'AI_NOT_CONFIGURED') {
    return next(new AppError(error.message, 503));
  }
  return next(new AppError(error.message || 'AI request failed.', 502));
};

/**
 * @desc    AI spending analysis over the last 30 days
 * @route   GET /api/ai/spending-analysis
 * @access  Private
 */
const getSpendingAnalysis = asyncHandler(async (req, res, next) => {
  try {
    const context = await buildFinancialContext(req.user._id, 30);

    const prompt = `You are a personal finance analyst. Analyze this user's last 30 days of financial activity and give a short, specific spending analysis (max 150 words, plain text, no markdown headers).

Financial data (JSON):
${JSON.stringify(context)}

Cover: overall spending pattern, the single biggest spending category and whether that seems reasonable, and one notable trend or anomaly. Be direct and concrete, use actual numbers from the data, and address the user as "you".`;

    const content = await gemini.generateContent(prompt, { temperature: 0.6, maxOutputTokens: 400 });

    const report = await AIReport.create({
      user: req.user._id,
      type: 'spending_analysis',
      periodStart: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      periodEnd: new Date(),
      content,
    });

    res.status(200).json({ success: true, report });
  } catch (error) {
    handleAIError(error, next);
  }
});

/**
 * @desc    AI budget prediction for next month based on spending history
 * @route   GET /api/ai/budget-prediction
 * @access  Private
 */
const getBudgetPrediction = asyncHandler(async (req, res, next) => {
  try {
    const context = await buildFinancialContext(req.user._id, 90);

    const prompt = `You are a budgeting assistant. Based on the last 90 days of spending data below, predict a realistic monthly budget for next month, broken down by the top categories present in the data.

Financial data (JSON):
${JSON.stringify(context)}

Respond ONLY with valid JSON in this exact shape, no markdown, no prose:
{
  "predictedMonthlyIncome": number,
  "predictedMonthlyExpense": number,
  "categoryBudgets": [{ "category": string, "suggestedLimit": number, "reasoning": string }],
  "summary": string (max 40 words)
}`;

    const raw = await gemini.generateContent(prompt, { temperature: 0.4, maxOutputTokens: 700 });
    const parsed = gemini.extractJSON(raw);

    const report = await AIReport.create({
      user: req.user._id,
      type: 'budget_prediction',
      periodStart: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
      periodEnd: new Date(),
      content: parsed.summary || 'Budget prediction generated.',
      rawResponse: parsed,
    });

    res.status(200).json({ success: true, report, prediction: parsed });
  } catch (error) {
    handleAIError(error, next);
  }
});

/**
 * @desc    AI personalized savings suggestions
 * @route   GET /api/ai/savings-suggestions
 * @access  Private
 */
const getSavingsSuggestions = asyncHandler(async (req, res, next) => {
  try {
    const context = await buildFinancialContext(req.user._id, 30);

    const prompt = `You are a savings coach. Based on this user's last 30 days of financial data, suggest 3 concrete, actionable ways they could save more money, tailored to their actual top spending categories.

Financial data (JSON):
${JSON.stringify(context)}

Respond ONLY with valid JSON in this exact shape, no markdown:
{
  "suggestions": [{ "title": string, "detail": string (max 30 words), "estimatedMonthlySavings": number }]
}`;

    const raw = await gemini.generateContent(prompt, { temperature: 0.7, maxOutputTokens: 500 });
    const parsed = gemini.extractJSON(raw);

    const report = await AIReport.create({
      user: req.user._id,
      type: 'savings_suggestion',
      periodStart: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      periodEnd: new Date(),
      content: `${parsed.suggestions?.length || 0} savings suggestions generated.`,
      rawResponse: parsed,
    });

    res.status(200).json({ success: true, report, suggestions: parsed.suggestions || [] });
  } catch (error) {
    handleAIError(error, next);
  }
});

/**
 * @desc    AI-generated monthly summary narrative
 * @route   GET /api/ai/monthly-summary?month=&year=
 * @access  Private
 */
const getMonthlySummary = asyncHandler(async (req, res, next) => {
  try {
    const now = new Date();
    const month = parseInt(req.query.month, 10) || now.getMonth() + 1;
    const year = parseInt(req.query.year, 10) || now.getFullYear();

    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 1);

    const transactions = await Transaction.find({
      user: req.user._id,
      date: { $gte: start, $lt: end },
    }).sort({ date: -1 });

    const totalIncome = transactions.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const totalExpense = transactions.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

    const categoryTotals = {};
    transactions
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
      });

    const prompt = `You are a financial reporting assistant. Write a friendly, concise monthly summary (max 120 words, plain text, no markdown) for ${month}/${year} based on this data:

Total income: ${totalIncome}
Total expense: ${totalExpense}
Net: ${totalIncome - totalExpense}
Transaction count: ${transactions.length}
Category breakdown: ${JSON.stringify(categoryTotals)}

Mention the net result, the top spending category, and end with one piece of encouragement or advice.`;

    const content = await gemini.generateContent(prompt, { temperature: 0.6, maxOutputTokens: 350 });

    const report = await AIReport.create({
      user: req.user._id,
      type: 'monthly_summary',
      periodStart: start,
      periodEnd: end,
      content,
      rawResponse: { totalIncome, totalExpense, categoryTotals, transactionCount: transactions.length },
    });

    res.status(200).json({ success: true, report });
  } catch (error) {
    handleAIError(error, next);
  }
});

/**
 * @desc    AI financial advisor chatbot (stateless per request; frontend maintains history)
 * @route   POST /api/ai/chat
 * @body    { message: string, history: Array<{role, content}> }
 * @access  Private
 */
const chatWithAdvisor = asyncHandler(async (req, res, next) => {
  const { message, history = [] } = req.body;

  if (!message || !message.trim()) {
    return next(new AppError('Message is required.', 400));
  }

  try {
    const context = await buildFinancialContext(req.user._id, 30);

    const systemContext = `You are a helpful, friendly personal financial advisor embedded in a finance app called AI Finance Manager Pro. The user's name is ${req.user.name}. Here is a summary of their last 30 days of financial activity to ground your answers: ${JSON.stringify(
      context
    )}. Keep answers concise (under 120 words unless the user asks for detail), practical, and specific to their data when relevant. You are not a licensed financial advisor and should note that for major decisions (investing, taxes, loans) the user should consult a professional.`;

    const reply = await gemini.generateChatReply(history, message, { systemContext, temperature: 0.7 });

    res.status(200).json({ success: true, reply });
  } catch (error) {
    handleAIError(error, next);
  }
});

/**
 * @desc    AI goal planner - suggests a monthly contribution plan for a savings goal
 * @route   POST /api/ai/goal-plan/:goalId
 * @access  Private
 */
const planGoal = asyncHandler(async (req, res, next) => {
  const goal = await Goal.findOne({ _id: req.params.goalId, user: req.user._id });
  if (!goal) return next(new AppError('Goal not found.', 404));

  try {
    const avgMonthlySavings = await getAverageMonthlySavings(req.user._id, 3);
    const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);

    const prompt = `You are a financial goal-planning assistant. Help the user plan how to reach this savings goal:

Goal: "${goal.title}" (type: ${goal.type})
Target amount: ${goal.targetAmount}
Current amount saved: ${goal.currentAmount}
Remaining needed: ${remaining}
Deadline: ${goal.deadline ? goal.deadline.toISOString().split('T')[0] : 'not set'}
User's average net monthly savings (last 3 months): ${avgMonthlySavings}

Respond ONLY with valid JSON in this exact shape, no markdown:
{
  "suggestedMonthlyContribution": number,
  "estimatedMonthsToComplete": number,
  "isDeadlineRealistic": boolean,
  "tips": [string, string, string]
}`;

    const raw = await gemini.generateContent(prompt, { temperature: 0.5, maxOutputTokens: 500 });
    const parsed = gemini.extractJSON(raw);

    const report = await AIReport.create({
      user: req.user._id,
      type: 'goal_plan',
      content: `Goal plan generated for "${goal.title}".`,
      rawResponse: { goalId: goal._id, ...parsed },
    });

    res.status(200).json({ success: true, report, plan: parsed });
  } catch (error) {
    handleAIError(error, next);
  }
});

/**
 * @desc    AI auto-categorization for a transaction description/merchant
 * @route   POST /api/ai/categorize
 * @body    { description, merchant, amount }
 * @access  Private
 */
const categorizeExpense = asyncHandler(async (req, res, next) => {
  const { description = '', merchant = '', amount } = req.body;

  if (!description && !merchant) {
    return next(new AppError('Provide a description or merchant to categorize.', 400));
  }

  try {
    const prompt = `Categorize this expense into exactly one of these categories: ${COMMON_CATEGORIES.join(', ')}.

Description: "${description}"
Merchant: "${merchant}"
Amount: ${amount || 'unknown'}

Respond ONLY with valid JSON, no markdown: { "category": string (must be one of the list above), "confidence": number (0 to 1) }`;

    const raw = await gemini.generateContent(prompt, { temperature: 0.2, maxOutputTokens: 100 });
    const parsed = gemini.extractJSON(raw);

    if (!COMMON_CATEGORIES.includes(parsed.category)) {
      parsed.category = 'Other';
      parsed.confidence = 0.3;
    }

    res.status(200).json({ success: true, ...parsed });
  } catch (error) {
    handleAIError(error, next);
  }
});

/**
 * @desc    Check all budgets for overspending and generate an AI alert + notifications
 * @route   GET /api/ai/overspending-alerts
 * @access  Private
 */
const getOverspendingAlerts = asyncHandler(async (req, res, next) => {
  const now = new Date();
  const budgets = await Budget.find({
    user: req.user._id,
    year: now.getFullYear(),
    $or: [{ month: now.getMonth() + 1 }, { period: 'yearly' }],
  });

  const breaches = [];

  for (const budget of budgets) {
    const matchStage = { user: req.user._id, type: 'expense', category: budget.category };

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
    const percentUsed = budget.limitAmount > 0 ? (spent / budget.limitAmount) * 100 : 0;

    if (percentUsed >= budget.alertThresholdPercent) {
      breaches.push({ category: budget.category, limit: budget.limitAmount, spent, percentUsed: Math.round(percentUsed) });
    }
  }

  if (breaches.length === 0) {
    return res.status(200).json({ success: true, breaches: [], message: 'No budget overspending detected.' });
  }

  try {
    const prompt = `You are a budgeting alert assistant. The user has exceeded or is close to exceeding these budget limits:

${JSON.stringify(breaches)}

Write a short (max 80 words), direct, non-judgmental alert message summarizing the overspending and one practical suggestion. Plain text, no markdown.`;

    const message = await gemini.generateContent(prompt, { temperature: 0.5, maxOutputTokens: 200 });

    await AIReport.create({
      user: req.user._id,
      type: 'overspending_alert',
      content: message,
      rawResponse: { breaches },
    });

    await Notification.create({
      user: req.user._id,
      type: 'budget_limit_warning',
      title: 'Budget Alert',
      message,
      meta: { breaches },
    });

    res.status(200).json({ success: true, breaches, message });
  } catch (error) {
    handleAIError(error, next);
  }
});

/**
 * @desc    AI personalized recommendations (general financial health tips)
 * @route   GET /api/ai/recommendations
 * @access  Private
 */
const getRecommendations = asyncHandler(async (req, res, next) => {
  try {
    const context = await buildFinancialContext(req.user._id, 60);
    const goals = await Goal.find({ user: req.user._id, isCompleted: false }).limit(5);

    const prompt = `You are a personal finance advisor. Based on this user's financial data and active goals, give 3 personalized recommendations to improve their financial health.

Financial data (JSON): ${JSON.stringify(context)}
Active goals: ${JSON.stringify(goals.map((g) => ({ title: g.title, target: g.targetAmount, current: g.currentAmount })))}

Respond ONLY with valid JSON, no markdown:
{ "recommendations": [{ "title": string, "detail": string (max 30 words), "priority": "high"|"medium"|"low" }] }`;

    const raw = await gemini.generateContent(prompt, { temperature: 0.7, maxOutputTokens: 500 });
    const parsed = gemini.extractJSON(raw);

    const report = await AIReport.create({
      user: req.user._id,
      type: 'recommendation',
      content: `${parsed.recommendations?.length || 0} recommendations generated.`,
      rawResponse: parsed,
    });

    res.status(200).json({ success: true, report, recommendations: parsed.recommendations || [] });
  } catch (error) {
    handleAIError(error, next);
  }
});

/**
 * @desc    Get saved AI report history
 * @route   GET /api/ai/reports?type=
 * @access  Private
 */
const getReportHistory = asyncHandler(async (req, res) => {
  const query = { user: req.user._id };
  if (req.query.type) query.type = req.query.type;

  const reports = await AIReport.find(query).sort({ createdAt: -1 }).limit(30);
  res.status(200).json({ success: true, reports });
});

module.exports = {
  getSpendingAnalysis,
  getBudgetPrediction,
  getSavingsSuggestions,
  getMonthlySummary,
  chatWithAdvisor,
  planGoal,
  categorizeExpense,
  getOverspendingAlerts,
  getRecommendations,
  getReportHistory,
};
