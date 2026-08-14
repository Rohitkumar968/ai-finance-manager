const express = require('express');
const { body } = require('express-validator');
const validateRequest = require('../middleware/validateRequest');
const { protect } = require('../middleware/authMiddleware');
const { createBudget, getBudgets, updateBudget, deleteBudget } = require('../controllers/budgetController');

const router = express.Router();

router.use(protect);

router
  .route('/')
  .get(getBudgets)
  .post(
    [
      body('category').trim().notEmpty().withMessage('Category is required'),
      body('limitAmount').isFloat({ gt: 0 }).withMessage('Limit amount must be greater than 0'),
      body('year').isInt({ min: 2000 }).withMessage('Valid year is required'),
    ],
    validateRequest,
    createBudget
  );

router.route('/:id').put(updateBudget).delete(deleteBudget);

module.exports = router;
