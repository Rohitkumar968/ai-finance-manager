const express = require('express');
const { body } = require('express-validator');
const rateLimit = require('express-rate-limit');
const validateRequest = require('../middleware/validateRequest');
const { protect } = require('../middleware/authMiddleware');
const checkAIFeatureEnabled = require('../middleware/aiFeatureGate');
const {
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
} = require('../controllers/aiController');

const router = express.Router();

router.use(protect);
router.use(checkAIFeatureEnabled);

// AI calls hit an external API and cost money - rate limit more strictly than standard routes.
const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 60,
  message: { success: false, message: 'AI request limit reached. Please try again later.' },
});

router.use(aiLimiter);

router.get('/spending-analysis', getSpendingAnalysis);
router.get('/budget-prediction', getBudgetPrediction);
router.get('/savings-suggestions', getSavingsSuggestions);
router.get('/monthly-summary', getMonthlySummary);
router.get('/overspending-alerts', getOverspendingAlerts);
router.get('/recommendations', getRecommendations);
router.get('/reports', getReportHistory);

router.post(
  '/chat',
  [body('message').trim().notEmpty().withMessage('Message is required')],
  validateRequest,
  chatWithAdvisor
);

router.post('/goal-plan/:goalId', planGoal);

router.post(
  '/categorize',
  [body('description').optional().trim(), body('merchant').optional().trim()],
  validateRequest,
  categorizeExpense
);

module.exports = router;
