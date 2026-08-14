import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../../utils/apiClient';

const initialState = {
  items: [],
  total: 0,
  page: 1,
  totalPages: 1,
  summary: { totalIncome: 0, totalExpenses: 0, totalSavings: 0, currentBalance: 0 },
  categoryBreakdown: [],
  isLoading: false,
  error: null,
};

export const fetchTransactions = createAsyncThunk(
  'transactions/fetchAll',
  async (params = {}, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.get('/transactions', { params });
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to load transactions');
    }
  }
);

export const fetchSummary = createAsyncThunk('transactions/fetchSummary', async (_, { rejectWithValue }) => {
  try {
    const { data } = await apiClient.get('/transactions/summary');
    return data.summary;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to load summary');
  }
});

export const fetchCategoryBreakdown = createAsyncThunk(
  'transactions/fetchCategoryBreakdown',
  async (type = 'expense', { rejectWithValue }) => {
    try {
      const { data } = await apiClient.get('/transactions/category-breakdown', { params: { type } });
      return data.breakdown;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to load breakdown');
    }
  }
);

export const createTransaction = createAsyncThunk(
  'transactions/create',
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.post('/transactions', payload);
      return data.transaction;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to create transaction');
    }
  }
);

export const updateTransaction = createAsyncThunk(
  'transactions/update',
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.put(`/transactions/${id}`, payload);
      return data.transaction;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update transaction');
    }
  }
);

export const deleteTransaction = createAsyncThunk(
  'transactions/delete',
  async (id, { rejectWithValue }) => {
    try {
      await apiClient.delete(`/transactions/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to delete transaction');
    }
  }
);

const transactionSlice = createSlice({
  name: 'transactions',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTransactions.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload.transactions;
        state.total = action.payload.total;
        state.page = action.payload.page;
        state.totalPages = action.payload.totalPages;
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchSummary.fulfilled, (state, action) => {
        state.summary = action.payload;
      })
      .addCase(fetchCategoryBreakdown.fulfilled, (state, action) => {
        state.categoryBreakdown = action.payload;
      })
      .addCase(createTransaction.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
        state.total += 1;
      })
      .addCase(updateTransaction.fulfilled, (state, action) => {
        const idx = state.items.findIndex((t) => t._id === action.payload._id);
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(deleteTransaction.fulfilled, (state, action) => {
        state.items = state.items.filter((t) => t._id !== action.payload);
        state.total = Math.max(0, state.total - 1);
      });
  },
});

export default transactionSlice.reducer;
