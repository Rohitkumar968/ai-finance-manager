import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../../utils/apiClient';

const initialState = {
  stats: null,
  users: [],
  usersTotal: 0,
  usersPage: 1,
  usersTotalPages: 1,
  allTransactions: [],
  transactionsTotal: 0,
  transactionsPage: 1,
  transactionsTotalPages: 1,
  transactionStats: { topCategories: [], dailyVolume: [] },
  aiAnalytics: { byType: [], dailyTrend: [], topUsers: [] },
  settings: null,
  isLoading: false,
  error: null,
};

const extractErrorMessage = (err) => err.response?.data?.message || 'Admin request failed.';

export const fetchAdminStats = createAsyncThunk('admin/fetchStats', async (_, { rejectWithValue }) => {
  try {
    const { data } = await apiClient.get('/admin/stats');
    return data.stats;
  } catch (err) {
    return rejectWithValue(extractErrorMessage(err));
  }
});

export const fetchUsers = createAsyncThunk('admin/fetchUsers', async (params = {}, { rejectWithValue }) => {
  try {
    const { data } = await apiClient.get('/admin/users', { params });
    return data;
  } catch (err) {
    return rejectWithValue(extractErrorMessage(err));
  }
});

export const updateUser = createAsyncThunk(
  'admin/updateUser',
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.put(`/admin/users/${id}`, payload);
      return data.user;
    } catch (err) {
      return rejectWithValue(extractErrorMessage(err));
    }
  }
);

export const deleteUser = createAsyncThunk('admin/deleteUser', async (id, { rejectWithValue }) => {
  try {
    await apiClient.delete(`/admin/users/${id}`);
    return id;
  } catch (err) {
    return rejectWithValue(extractErrorMessage(err));
  }
});

export const fetchAllTransactions = createAsyncThunk(
  'admin/fetchAllTransactions',
  async (params = {}, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.get('/admin/transactions', { params });
      return data;
    } catch (err) {
      return rejectWithValue(extractErrorMessage(err));
    }
  }
);

export const fetchTransactionStats = createAsyncThunk(
  'admin/fetchTransactionStats',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.get('/admin/transactions/stats');
      return data;
    } catch (err) {
      return rejectWithValue(extractErrorMessage(err));
    }
  }
);

export const fetchAIAnalytics = createAsyncThunk('admin/fetchAIAnalytics', async (_, { rejectWithValue }) => {
  try {
    const { data } = await apiClient.get('/admin/ai-analytics');
    return data;
  } catch (err) {
    return rejectWithValue(extractErrorMessage(err));
  }
});

export const fetchSystemSettings = createAsyncThunk(
  'admin/fetchSystemSettings',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.get('/admin/settings');
      return data.settings;
    } catch (err) {
      return rejectWithValue(extractErrorMessage(err));
    }
  }
);

export const updateSystemSettings = createAsyncThunk(
  'admin/updateSystemSettings',
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.put('/admin/settings', payload);
      return data.settings;
    } catch (err) {
      return rejectWithValue(extractErrorMessage(err));
    }
  }
);

export const broadcastNotification = createAsyncThunk(
  'admin/broadcastNotification',
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.post('/admin/notifications/broadcast', payload);
      return data.message;
    } catch (err) {
      return rejectWithValue(extractErrorMessage(err));
    }
  }
);

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    clearAdminError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    const pending = (state) => {
      state.isLoading = true;
      state.error = null;
    };
    const rejected = (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    };

    builder
      .addCase(fetchAdminStats.pending, pending)
      .addCase(fetchAdminStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.stats = action.payload;
      })
      .addCase(fetchAdminStats.rejected, rejected)

      .addCase(fetchUsers.pending, pending)
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.users = action.payload.users;
        state.usersTotal = action.payload.total;
        state.usersPage = action.payload.page;
        state.usersTotalPages = action.payload.totalPages;
      })
      .addCase(fetchUsers.rejected, rejected)

      .addCase(updateUser.fulfilled, (state, action) => {
        const idx = state.users.findIndex((u) => u._id === action.payload._id);
        if (idx !== -1) state.users[idx] = action.payload;
      })

      .addCase(deleteUser.fulfilled, (state, action) => {
        state.users = state.users.filter((u) => u._id !== action.payload);
        state.usersTotal = Math.max(0, state.usersTotal - 1);
      })

      .addCase(fetchAllTransactions.pending, pending)
      .addCase(fetchAllTransactions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.allTransactions = action.payload.transactions;
        state.transactionsTotal = action.payload.total;
        state.transactionsPage = action.payload.page;
        state.transactionsTotalPages = action.payload.totalPages;
      })
      .addCase(fetchAllTransactions.rejected, rejected)

      .addCase(fetchTransactionStats.fulfilled, (state, action) => {
        state.transactionStats = { topCategories: action.payload.topCategories, dailyVolume: action.payload.dailyVolume };
      })

      .addCase(fetchAIAnalytics.fulfilled, (state, action) => {
        state.aiAnalytics = {
          byType: action.payload.byType,
          dailyTrend: action.payload.dailyTrend,
          topUsers: action.payload.topUsers,
        };
      })

      .addCase(fetchSystemSettings.fulfilled, (state, action) => {
        state.settings = action.payload;
      })

      .addCase(updateSystemSettings.fulfilled, (state, action) => {
        state.settings = action.payload;
      });
  },
});

export const { clearAdminError } = adminSlice.actions;
export default adminSlice.reducer;
