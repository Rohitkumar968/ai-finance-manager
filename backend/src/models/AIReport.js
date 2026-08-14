const mongoose = require('mongoose');

const aiReportSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: [
        'spending_analysis',
        'budget_prediction',
        'savings_suggestion',
        'monthly_summary',
        'goal_plan',
        'overspending_alert',
        'recommendation',
      ],
      required: true,
    },
    periodStart: Date,
    periodEnd: Date,
    content: {
      type: String,
      required: true,
    },
    rawResponse: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    model: {
      type: String,
      default: 'gemini-pro',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('AIReport', aiReportSchema);
