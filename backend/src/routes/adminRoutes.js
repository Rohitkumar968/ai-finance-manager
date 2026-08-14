const express = require('express');
const { body } = require('express-validator');
const validateRequest = require('../middleware/validateRequest');
const { protect, restrictTo } = require('../middleware/authMiddleware');
const {
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
} = require('../controllers/adminController');

const router = express.Router();

// Every route below requires a logged-in user with the 'admin' role.
router.use(protect, restrictTo('admin'));

router.get('/stats', getDashboardStats);

router.get('/users', getUsers);
router
  .route('/users/:id')
  .get(getUserById)
  .put(
    [
      body('role').optional().isIn(['user', 'admin']).withMessage('Role must be user or admin'),
      body('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
    ],
    validateRequest,
    updateUser
  )
  .delete(deleteUser);

router.get('/transactions', getAllTransactions);
router.get('/transactions/stats', getTransactionStats);

router.get('/ai-analytics', getAIUsageAnalytics);
router.get('/reports', getAllAIReports);

router
  .route('/settings')
  .get(getSystemSettings)
  .put(
    [
      body('maxAIRequestsPerHourPerUser').optional().isInt({ min: 1 }),
      body('announcementMessage').optional().isString().isLength({ max: 500 }),
    ],
    validateRequest,
    updateSystemSettings
  );

router.post(
  '/notifications/broadcast',
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('message').trim().notEmpty().withMessage('Message is required'),
  ],
  validateRequest,
  broadcastNotification
);

module.exports = router;
