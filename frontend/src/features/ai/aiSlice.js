import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../../utils/apiClient';

const initialState = {
  spendingAnalysis: null,
  budgetPrediction: null,
  savingsSuggestions: [],
  monthlySummary: null,
  recommendations: [],
  overspendingAlerts: { breaches: [], message: '' },
  chatHistory: [], // [{ role: 'user' | 'model', content: string }]
  isChatLoading: false,
  isLoading: false,
  error: null,
};

const extractErrorMessage = (err) =>
  err.response?.data?.message || 'AI request failed. Please try again.';

export const fetchSpendingAnalysis = createAsyncThunk(
  'ai/fetchSpendingAnalysis',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.get('/ai/spending-analysis');
      return data.report;
    } catch (err) {
      return rejectWithValue(extractErrorMessage(err));
    }
  }
);

export const fetchBudgetPrediction = createAsyncThunk(
  'ai/fetchBudgetPrediction',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.get('/ai/budget-prediction');
      return data.prediction;
    } catch (err) {
      return rejectWithValue(extractErrorMessage(err));
    }
  }
);

export const fetchSavingsSuggestions = createAsyncThunk(
  'ai/fetchSavingsSuggestions',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.get('/ai/savings-suggestions');
      return data.suggestions;
    } catch (err) {
      return rejectWithValue(extractErrorMessage(err));
    }
  }
);

export const fetchMonthlySummary = createAsyncThunk(
  'ai/fetchMonthlySummary',
  async ({ month, year } = {}, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.get('/ai/monthly-summary', { params: { month, year } });
      return data.report;
    } catch (err) {
      return rejectWithValue(extractErrorMessage(err));
    }
  }
);

export const fetchRecommendations = createAsyncThunk(
  'ai/fetchRecommendations',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.get('/ai/recommendations');
      return data.recommendations;
    } catch (err) {
      return rejectWithValue(extractErrorMessage(err));
    }
  }
);

export const fetchOverspendingAlerts = createAsyncThunk(
  'ai/fetchOverspendingAlerts',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.get('/ai/overspending-alerts');
      return { breaches: data.breaches || [], message: data.message || '' };
    } catch (err) {
      return rejectWithValue(extractErrorMessage(err));
    }
  }
);

export const planGoal = createAsyncThunk(
  'ai/planGoal',
  async (goalId, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.post(`/ai/goal-plan/${goalId}`);
      return { goalId, plan: data.plan };
    } catch (err) {
      return rejectWithValue(extractErrorMessage(err));
    }
  }
);

export const categorizeExpense = createAsyncThunk(
  'ai/categorizeExpense',
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.post('/ai/categorize', payload);
      return data;
    } catch (err) {
      return rejectWithValue(extractErrorMessage(err));
    }
  }
);

export const sendChatMessage = createAsyncThunk(
  'ai/sendChatMessage',
  async (message, { getState, rejectWithValue }) => {
    try {
      const history = getState().ai.chatHistory;
      const { data } = await apiClient.post('/ai/chat', { message, history });
      return { userMessage: message, reply: data.reply };
    } catch (err) {
      return rejectWithValue(extractErrorMessage(err));
    }
  }
);

const aiSlice = createSlice({
  name: 'ai',
  initialState,
  reducers: {
    clearChat: (state) => {
      state.chatHistory = [];
    },
    clearAIError: (state) => {
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
      .addCase(fetchSpendingAnalysis.pending, pending)
      .addCase(fetchSpendingAnalysis.fulfilled, (state, action) => {
        state.isLoading = false;
        state.spendingAnalysis = action.payload;
      })
      .addCase(fetchSpendingAnalysis.rejected, rejected)

      .addCase(fetchBudgetPrediction.pending, pending)
      .addCase(fetchBudgetPrediction.fulfilled, (state, action) => {
        state.isLoading = false;
        state.budgetPrediction = action.payload;
      })
      .addCase(fetchBudgetPrediction.rejected, rejected)

      .addCase(fetchSavingsSuggestions.pending, pending)
      .addCase(fetchSavingsSuggestions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.savingsSuggestions = action.payload;
      })
      .addCase(fetchSavingsSuggestions.rejected, rejected)

      .addCase(fetchMonthlySummary.pending, pending)
      .addCase(fetchMonthlySummary.fulfilled, (state, action) => {
        state.isLoading = false;
        state.monthlySummary = action.payload;
      })
      .addCase(fetchMonthlySummary.rejected, rejected)

      .addCase(fetchRecommendations.pending, pending)
      .addCase(fetchRecommendations.fulfilled, (state, action) => {
        state.isLoading = false;
        state.recommendations = action.payload;
      })
      .addCase(fetchRecommendations.rejected, rejected)

      .addCase(fetchOverspendingAlerts.fulfilled, (state, action) => {
        state.overspendingAlerts = action.payload;
      })

      .addCase(planGoal.fulfilled, (state) => {
        state.isLoading = false;
      })

      .addCase(sendChatMessage.pending, (state) => {
        state.isChatLoading = true;
        state.error = null;
      })
      .addCase(sendChatMessage.fulfilled, (state, action) => {
        state.isChatLoading = false;
        state.chatHistory.push({ role: 'user', content: action.payload.userMessage });
        state.chatHistory.push({ role: 'model', content: action.payload.reply });
      })
      .addCase(sendChatMessage.rejected, (state, action) => {
        state.isChatLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearChat, clearAIError } = aiSlice.actions;
export default aiSlice.reducer;
