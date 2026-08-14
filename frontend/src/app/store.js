import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import transactionReducer from '../features/transactions/transactionSlice';
import uiReducer from '../features/ui/uiSlice';
import aiReducer from '../features/ai/aiSlice';
import adminReducer from '../features/admin/adminSlice';
import notificationReducer from '../features/notifications/notificationSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    transactions: transactionReducer,
    ui: uiReducer,
    ai: aiReducer,
    admin: adminReducer,
    notifications: notificationReducer,
  },
});
