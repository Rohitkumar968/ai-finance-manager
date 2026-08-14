# AI Finance Manager Pro (MERN Stack)

A premium, production-grade personal finance manager. **Phase 1** delivers the core application
(auth, transactions, budgets, goals, dashboard analytics, dark/light mode). **Phase 2** adds full
**Gemini AI integration** (spending analysis, budget prediction, savings suggestions, monthly
summaries, a financial advisor chatbot, an AI goal planner, auto-categorization, overspending
alerts). **Phase 3** (this update) adds a full **Admin Panel** with role-based access control:
platform dashboard, user management, transaction monitoring, AI usage analytics, system settings,
and broadcast notifications — plus an in-app notification bell for all users. Later phases add
OCR, voice input, PDF/Excel export, Socket.IO real-time push, Google OAuth, and 2FA (see
**Roadmap** below).

---

## What's included so far

- **Backend**: Node.js + Express (MVC architecture), MongoDB Atlas + Mongoose, JWT auth,
  register/login/forgot-password/reset-password, profile management, change password,
  full transaction CRUD (search, filter, sort, pagination), budgets with live spend tracking,
  savings goals with progress tracking, notifications list, centralized error handling, request
  validation, rate limiting, security headers, logging, a full Gemini AI service layer powering
  9 AI endpoints — **plus a complete Admin Panel API**: platform stats, user management (search/
  filter/promote/demote/activate/deactivate/delete with cascade), transaction monitoring across
  all users, AI usage analytics, system settings (maintenance mode, feature toggles, rate limits),
  and broadcast notifications — all gated behind `restrictTo('admin')` RBAC middleware.
- **Frontend**: React 18 + Vite + Tailwind CSS + Redux Toolkit + React Router, dark/light mode,
  glassmorphism cards, loading skeletons, toast notifications, responsive dashboard layout,
  charts (Recharts), transactions table with modal-based add/edit, budgets and goals pages, an
  AI Insights card, a full AI Financial Advisor chat page, an "AI Plan" button on savings goals,
  an "AI Suggest Category" button on transactions — **plus a role-gated Admin section** (5 pages:
  dashboard, users, transactions, AI analytics, settings) only visible/reachable for admin users,
  and a **notification bell** in the navbar so users actually see admin broadcasts and system alerts.

---

## Folder Structure

```
ai-finance-manager/
├── backend/
│   ├── src/
│   │   ├── config/          # db.js (MongoDB connection)
│   │   ├── controllers/     # authController, transactionController, budgetController, goalController, notificationController, aiController, adminController
│   │   ├── middleware/      # authMiddleware, errorMiddleware, validateRequest, aiFeatureGate, maintenanceMiddleware
│   │   ├── models/          # User, Transaction, Budget, Goal, Notification, AIReport, SystemSetting
│   │   ├── routes/          # authRoutes, transactionRoutes, budgetRoutes, goalRoutes, notificationRoutes, aiRoutes, adminRoutes
│   │   ├── services/        # geminiService.js, financialContextService.js, settingsService.js
│   │   ├── scripts/         # setAdmin.js (promote a user to admin from the CLI)
│   │   ├── utils/           # logger, AppError, generateToken, sendEmail
│   │   ├── app.js           # Express app config
│   │   └── server.js        # Entry point
│   ├── logs/
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── app/store.js             # Redux store
│   │   ├── features/auth/           # authSlice
│   │   ├── features/transactions/   # transactionSlice
│   │   ├── features/ui/             # uiSlice (theme, sidebar)
│   │   ├── features/ai/             # aiSlice (all AI feature thunks)
│   │   ├── features/admin/          # adminSlice (all admin panel thunks)
│   │   ├── features/notifications/  # notificationSlice
│   │   ├── components/layout/       # Sidebar, Navbar, DashboardLayout, AuthLayout
│   │   ├── components/ui/           # StatCard, TransactionModal, AIInsightsCard, NotificationBell
│   │   ├── pages/                   # Login, Register, Forgot/Reset, Dashboard, Transactions, Budgets, Goals, Profile, AIAdvisor, NotFound
│   │   ├── pages/admin/             # AdminDashboardPage, AdminUsersPage, AdminTransactionsPage, AdminAIAnalyticsPage, AdminSettingsPage
│   │   ├── routes/ProtectedRoute.jsx, AdminRoute.jsx
│   │   ├── hooks/useThemeEffect.js
│   │   ├── utils/apiClient.js, formatters.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── tailwind.config.js
│   ├── vite.config.js
│   ├── netlify.toml / vercel.json
│   └── .env.example
├── render.yaml
└── README.md
```

---

## Prerequisites

- Node.js 18+ and npm
- A MongoDB Atlas cluster (free tier is fine) — get a connection string
- An SMTP account for sending emails (Gmail App Password, Mailtrap, or SendGrid SMTP)
- A **Gemini API key** (free tier available at [aistudio.google.com/apikey](https://aistudio.google.com/apikey)) for AI features

---

## 1. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env` and fill in:

- `MONGO_URI` — your MongoDB Atlas connection string
- `JWT_SECRET` — any long random string (e.g. `openssl rand -hex 32`)
- `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` / `FROM_EMAIL` — for password reset emails
- `GEMINI_API_KEY` — get a free key at [aistudio.google.com/apikey](https://aistudio.google.com/apikey) to enable all `/api/ai/*` routes. Without it, AI routes return a clean `503` explaining AI isn't configured — the rest of the app works fine.
- `GEMINI_MODEL` — defaults to `gemini-2.0-flash` (fast + free-tier friendly); change if you have access to another model
- `CLIENT_URL` — `http://localhost:5173` for local dev

Run the server:

```bash
npm run dev
```

The API will be available at `http://localhost:5000/api`. Check `GET /api/health` to confirm it's running.

---

## 2. Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
```

Edit `.env`:

- `VITE_API_URL=http://localhost:5000/api`

Run the dev server:

```bash
npm run dev
```

Visit `http://localhost:5173`, register a new account, and start adding transactions.

---

## 3. Building for Production

```bash
cd frontend
npm run build
```

This outputs static files to `frontend/dist`, ready to deploy to Netlify or Vercel.

```bash
cd backend
npm start
```

Runs the compiled-free Node server directly (no build step needed for the backend).

---

## Deployment

### Backend → Render
1. Push this repo to GitHub.
2. In Render, create a new **Web Service**, point it at the repo, and set root directory to `backend`.
3. Build command: `npm install`. Start command: `npm start`.
4. Add all environment variables from `backend/.env.example` in the Render dashboard.
5. A ready-made `render.yaml` blueprint is included at the project root — Render can auto-detect it via "New Blueprint Instance".

### Frontend → Netlify or Vercel
1. Point the site at the `frontend` directory.
2. Build command: `npm run build`. Publish directory: `dist`.
3. Add `VITE_API_URL` env var pointing to your deployed Render backend URL, e.g. `https://your-app.onrender.com/api`.
4. `netlify.toml` and `vercel.json` are included with SPA redirect rules already configured.

---

## API Endpoints (Phase 1)

| Method | Endpoint                          | Description                          | Auth |
|--------|------------------------------------|---------------------------------------|------|
| POST   | /api/auth/register                 | Register new user                     | No   |
| POST   | /api/auth/login                    | Login                                 | No   |
| POST   | /api/auth/logout                   | Logout                                | Yes  |
| GET    | /api/auth/me                       | Get current user profile              | Yes  |
| PUT    | /api/auth/profile                  | Update profile                        | Yes  |
| PUT    | /api/auth/change-password          | Change password                       | Yes  |
| POST   | /api/auth/forgot-password          | Request password reset email          | No   |
| PUT    | /api/auth/reset-password/:token    | Reset password with token             | No   |
| GET    | /api/transactions                  | List transactions (search/filter/sort/paginate) | Yes |
| POST   | /api/transactions                  | Create transaction                    | Yes  |
| GET    | /api/transactions/:id              | Get single transaction                | Yes  |
| PUT    | /api/transactions/:id              | Update transaction                    | Yes  |
| DELETE | /api/transactions/:id              | Delete transaction                    | Yes  |
| GET    | /api/transactions/summary          | Dashboard totals                      | Yes  |
| GET    | /api/transactions/category-breakdown | Pie chart data                      | Yes  |
| GET/POST/PUT/DELETE | /api/budgets          | Budget CRUD + live progress            | Yes  |
| GET/POST/PUT/DELETE | /api/goals            | Goals CRUD + progress                  | Yes  |
| GET    | /api/notifications                 | List notifications                    | Yes  |
| PUT    | /api/notifications/:id/read        | Mark one as read                      | Yes  |
| PUT    | /api/notifications/read-all        | Mark all as read                      | Yes  |
| GET    | /api/ai/spending-analysis          | AI analysis of last 30 days           | Yes  |
| GET    | /api/ai/budget-prediction          | AI predicted next-month budget        | Yes  |
| GET    | /api/ai/savings-suggestions        | AI savings suggestions                | Yes  |
| GET    | /api/ai/monthly-summary?month=&year= | AI narrative monthly summary        | Yes  |
| GET    | /api/ai/recommendations            | AI personalized recommendations       | Yes  |
| GET    | /api/ai/overspending-alerts        | Check budgets + AI alert message      | Yes  |
| GET    | /api/ai/reports?type=               | Saved AI report history              | Yes  |
| POST   | /api/ai/chat                        | Financial advisor chatbot message    | Yes  |
| POST   | /api/ai/goal-plan/:goalId          | AI contribution plan for a goal       | Yes  |
| POST   | /api/ai/categorize                  | AI category suggestion for an expense | Yes  |
| GET    | /api/admin/stats                    | Platform-wide dashboard stats          | Admin |
| GET    | /api/admin/users                    | List/search/filter users               | Admin |
| GET    | /api/admin/users/:id                | User detail + activity counts          | Admin |
| PUT    | /api/admin/users/:id                | Update role / active status (RBAC)     | Admin |
| DELETE | /api/admin/users/:id                | Delete user + cascade their data       | Admin |
| GET    | /api/admin/transactions             | All transactions across all users      | Admin |
| GET    | /api/admin/transactions/stats       | Platform transaction charts data       | Admin |
| GET    | /api/admin/ai-analytics             | AI usage by type/day/top users         | Admin |
| GET    | /api/admin/reports                  | Browse AI reports across all users     | Admin |
| GET/PUT | /api/admin/settings                 | System settings (maintenance, toggles) | Admin |
| POST   | /api/admin/notifications/broadcast  | Send a notification to all/some users  | Admin |

All `/api/ai/*` routes are rate-limited to 60 requests/hour per IP and return a `503` with a clear
message if `GEMINI_API_KEY` is not set, instead of a confusing failure. All `/api/admin/*` routes
require `role: 'admin'` on the authenticated user (enforced by `restrictTo('admin')` middleware).

### Making a user an admin

There's no public signup path to the admin role by design. Promote an existing registered user
from the command line:

```bash
cd backend
npm run set-admin -- youremail@example.com
```

Then log out and back in on the frontend — the Admin section appears in the sidebar automatically
once `user.role === 'admin'`.

---

## Roadmap — remaining phases

This is being delivered incrementally.

- ✅ **Phase 1** — Core app: auth, transactions, budgets, goals, dashboard, dark/light mode.
- ✅ **Phase 2** — AI integration (Gemini): spending analysis, budget prediction, savings
  suggestions, monthly summary, financial advisor chatbot, goal planner, auto-categorization,
  overspending alerts.
- ✅ **Phase 3** — Admin Panel: dashboard, user management (RBAC), transaction monitoring,
  AI usage analytics, system settings (maintenance mode, registration/AI toggles), broadcast
  notifications, and a notification bell for all users.

Next up, in order:

4. **OCR receipt scanner** (Tesseract.js + Cloudinary upload): extract amount/date/merchant, auto-create expense.
5. **Voice features** (Web Speech API): voice expense entry, voice commands.
6. **Reports**: PDF export (jsPDF), Excel export (SheetJS), emailed monthly reports.
7. **Real-time notifications** (Socket.IO): push budget alerts, bill/goal reminders, and admin
   broadcasts live instead of only on next page load/poll.
8. **Google OAuth login** and **Two-Factor Authentication**.
9. **Deployment hardening & test suite**.

Ask for the next phase whenever you're ready, and it'll build directly on this codebase.

---

## Notes

- This sandbox environment has no outbound network access, so `npm install` could not be run here —
  run it locally or in your CI/CD pipeline. All backend files have been verified with `node --check`
  for syntax correctness.
- Never commit your real `.env` file — only `.env.example` files are included.
