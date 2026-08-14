# 💰 AI Finance Manager

## 🚀 Live Project

### 🌐 Live Application

[https://rohit-ai-finance-manager.vercel.app]

### ⚙️ Backend API

[https://ai-finance-manager-j1gg.onrender.com]

### ❤️ Project

*AI Finance Manager*

---

## 📌 About The Project

AI Finance Manager Pro is a modern, full-stack personal finance management application designed to help users take control of their financial activities.

Users can manage transactions, create budgets, track savings goals, analyze spending patterns and receive AI-powered financial recommendations.

The platform also includes a complete **Admin Panel with Role-Based Access Control (RBAC)** for managing users, transactions, AI usage and system settings.

---

## ✨ Key Features

### 🔐 Authentication

- User Registration
- User Login
- JWT Authentication
- Logout
- Forgot Password
- Reset Password
- Profile Management
- Change Password
- Protected Routes
- Role-Based Access Control

### 💳 Transaction Management

- Add income and expenses
- Edit transactions
- Delete transactions
- Search transactions
- Filter transactions
- Sort transactions
- Pagination
- Transaction categories
- Income and expense tracking
- Financial summaries

### 📊 Dashboard & Analytics

- Total income
- Total expenses
- Current balance
- Spending analytics
- Category-wise expense breakdown
- Interactive charts
- Recent transactions
- Responsive dashboard

### 💰 Budget Management

- Create budgets
- Edit budgets
- Delete budgets
- Track spending
- Live budget progress
- Budget utilization
- Overspending detection

### 🎯 Savings Goals

- Create savings goals
- Set target amount
- Track progress
- Contribution tracking
- Goal deadlines
- Progress visualization
- AI-powered goal planning

---

## 🤖 AI Financial Assistant

AI Finance Manager includes AI-powered financial intelligence to help users understand and improve their financial habits.

### AI Features

- 🧠 Spending Analysis
- 📈 Budget Prediction
- 💡 Savings Suggestions
- 📅 Monthly Financial Summary
- 🤝 AI Financial Advisor Chatbot
- 🎯 AI Goal Planner
- 🏷️ Automatic Expense Categorization
- ⚠️ Overspending Alerts
- 📋 AI Financial Reports
- 💬 Personalized Financial Recommendations

---

## 👑 Admin Panel

The application includes a secure admin dashboard protected by Role-Based Access Control.

### Admin Features

- Platform Dashboard
- User Management
- Search Users
- Filter Users
- Promote / Demote Users
- Activate / Deactivate Users
- Delete Users
- Transaction Monitoring
- AI Usage Analytics
- AI Reports
- System Settings
- Maintenance Mode
- Feature Toggles
- Rate Limit Settings
- Broadcast Notifications

Only users with the `admin` role can access admin functionality.

---

## 🔔 Notification System

Users can receive and manage application notifications.

- Notification Bell
- Notification List
- Mark as Read
- Mark All as Read
- Admin Broadcast Notifications
- System Alerts

---

# 🛠️ Tech Stack

## Frontend

- React 18
- Vite
- Tailwind CSS
- Redux Toolkit
- React Router
- Axios
- Recharts
- Responsive Design
- Dark / Light Mode
- Glassmorphism UI

## Backend

- Node.js
- Express.js
- MongoDB
- MongoDB Atlas
- Mongoose
- JWT
- bcrypt
- Nodemailer
- Express Validator
- Rate Limiting
- Security Headers
- Winston / Logging

## AI

- Google Gemini API
- AI Financial Analysis
- AI Recommendations
- AI Chatbot
- AI Categorization
- AI Goal Planning

## Deployment

- Vercel — Frontend
- Render — Backend
- MongoDB Atlas — Database
- GitHub — Source Control

---

# 🖥️ Application Architecture

```text
                     ┌─────────────────────────┐
                     │        User / Admin      │
                     └────────────┬────────────┘
                                  │
                                  ▼
                     ┌─────────────────────────┐
                     │     React + Vite        │
                     │     Frontend            │
                     │     Vercel              │
                     └────────────┬────────────┘
                                  │
                                  │ REST API
                                  ▼
                     ┌─────────────────────────┐
                     │     Node.js + Express   │
                     │     Backend             │
                     │     Render              │
                     └───────┬─────────┬───────┘
                             │         │
                  ┌──────────┘         └──────────┐
                  ▼                               ▼
        ┌─────────────────┐             ┌─────────────────┐
        │  MongoDB Atlas  │             │   AI Service    │
        │    Database     │             │   Gemini API    │
        └─────────────────┘             └─────────────────┘
```

---

# 📁 Project Structure

```text
ai-finance-manager/
│
├── backend/
│   ├── src/
│   │   │
│   │   ├── config/
│   │   │   └── db.js
│   │   │
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── transactionController.js
│   │   │   ├── budgetController.js
│   │   │   ├── goalController.js
│   │   │   ├── notificationController.js
│   │   │   ├── aiController.js
│   │   │   └── adminController.js
│   │   │
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js
│   │   │   ├── errorMiddleware.js
│   │   │   ├── validateRequest.js
│   │   │   ├── aiFeatureGate.js
│   │   │   └── maintenanceMiddleware.js
│   │   │
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   ├── Transaction.js
│   │   │   ├── Budget.js
│   │   │   ├── Goal.js
│   │   │   ├── Notification.js
│   │   │   ├── AIReport.js
│   │   │   └── SystemSetting.js
│   │   │
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── transactionRoutes.js
│   │   │   ├── budgetRoutes.js
│   │   │   ├── goalRoutes.js
│   │   │   ├── notificationRoutes.js
│   │   │   ├── aiRoutes.js
│   │   │   └── adminRoutes.js
│   │   │
│   │   ├── services/
│   │   │   ├── geminiService.js
│   │   │   ├── financialContextService.js
│   │   │   └── settingsService.js
│   │   │
│   │   ├── scripts/
│   │   │   └── setAdmin.js
│   │   │
│   │   ├── utils/
│   │   │   ├── logger.js
│   │   │   ├── AppError.js
│   │   │   ├── generateToken.js
│   │   │   └── sendEmail.js
│   │   │
│   │   ├── app.js
│   │   └── server.js
│   │
│   ├── logs/
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   │
│   │   ├── app/
│   │   │   └── store.js
│   │   │
│   │   ├── features/
│   │   │   ├── auth/
│   │   │   ├── transactions/
│   │   │   ├── ui/
│   │   │   ├── ai/
│   │   │   ├── admin/
│   │   │   └── notifications/
│   │   │
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   └── ui/
│   │   │
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Transactions.jsx
│   │   │   ├── Budgets.jsx
│   │   │   ├── Goals.jsx
│   │   │   ├── Profile.jsx
│   │   │   ├── AIAdvisor.jsx
│   │   │   └── admin/
│   │   │       ├── AdminDashboardPage.jsx
│   │   │       ├── AdminUsersPage.jsx
│   │   │       ├── AdminTransactionsPage.jsx
│   │   │       ├── AdminAIAnalyticsPage.jsx
│   │   │       └── AdminSettingsPage.jsx
│   │   │
│   │   ├── routes/
│   │   │   ├── ProtectedRoute.jsx
│   │   │   └── AdminRoute.jsx
│   │   │
│   │   ├── hooks/
│   │   │   └── useThemeEffect.js
│   │   │
│   │   ├── utils/
│   │   │   ├── apiClient.js
│   │   │   └── formatters.js
│   │   │
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   ├── .env.example
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── vercel.json
│   └── package.json
│
├── render.yaml
├── README.md
└── .gitignore
```

---

# 📄 License

This project is developed for educational and portfolio purposes.

---

# 👨‍💻 Author

## Rohit Kumar

**MERN Stack Developer | Full Stack Developer |**

### 🌐 Live Project

**[AI Finance Manager Pro](https://rohit-ai-finance-manager.vercel.app/)**

### ⚙️ Backend API

**[Render Backend](https://ai-finance-manager-j1gg.onrender.com/)**

---

<p align="center">
  Built with ❤️ by <strong>Rohit Kumar</strong>
</p>

<p align="center">
  ⭐ If you like this project, consider giving it a star on GitHub!
</p>