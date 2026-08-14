const express = require('express');
const { body } = require('express-validator');
const validateRequest = require('../middleware/validateRequest');
const { protect } = require('../middleware/authMiddleware');
const {
  createTransaction,
  getTransactions,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
  getSummary,
  getCategoryBreakdown,
} = require('../controllers/transactionController');

const router = express.Router();

router.use(protect);

router.get('/summary', getSummary);
router.get('/category-breakdown', getCategoryBreakdown);

router
  .route('/')
  .get(getTransactions)
  .post(
    [
      body('type').isIn(['income', 'expense']).withMessage('Type must be income or expense'),
      body('amount').isFloat({ gt: 0 }).withMessage('Amount must be greater than 0'),
      body('category').trim().notEmpty().withMessage('Category is required'),
    ],
    validateRequest,
    createTransaction
  );

router
  .route('/:id')
  .get(getTransactionById)
  .put(updateTransaction)
  .delete(deleteTransaction);

module.exports = router;
