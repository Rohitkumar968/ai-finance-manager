const express = require('express');
const { body } = require('express-validator');
const validateRequest = require('../middleware/validateRequest');
const { protect } = require('../middleware/authMiddleware');
const { createGoal, getGoals, updateGoal, deleteGoal } = require('../controllers/goalController');

const router = express.Router();

router.use(protect);

router
  .route('/')
  .get(getGoals)
  .post(
    [
      body('title').trim().notEmpty().withMessage('Title is required'),
      body('targetAmount').isFloat({ gt: 0 }).withMessage('Target amount must be greater than 0'),
    ],
    validateRequest,
    createGoal
  );

router.route('/:id').put(updateGoal).delete(deleteGoal);

module.exports = router;
