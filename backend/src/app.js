const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');

const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const checkMaintenanceMode = require('./middleware/maintenanceMiddleware');
const logger = require('./utils/logger');

const authRoutes = require('./routes/authRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const budgetRoutes = require('./routes/budgetRoutes');
const goalRoutes = require('./routes/goalRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const aiRoutes = require('./routes/aiRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

// Trust Render's reverse proxy
app.set('trust proxy', 1);

// Security headers
app.use(helmet());

// CORS - allow both local development and live frontend
const allowedOrigins = [
  'https://rohit-ai-finance-manager.vercel.app',
  'http://localhost:5173',
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests without an Origin header
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Data sanitization against NoSQL query injection & XSS
app.use(mongoSanitize());
app.use(xss());

// Request logging
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
} else {
  app.use(
    morgan('combined', {
      stream: {
        write: (message) => logger.info(message.trim()),
      },
    })
  );
}

// Global rate limiter
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api', globalLimiter);

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'AI Finance Manager API is running.',
  });
});

// Maintenance mode gate
app.use(checkMaintenanceMode);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/admin', adminRoutes);

// 404 + error handling (must be last)
app.use(notFound);
app.use(errorHandler);

module.exports = app;