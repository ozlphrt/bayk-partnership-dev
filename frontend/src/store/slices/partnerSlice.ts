import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { apiService } from '../../services/api';
import { PartnerProfile, MemberVerification, PartnerAnalytics, Transaction, PartnerState } from '../../types';

const initialState: PartnerState = {
  profile: null,
  analytics: null,
  transactions: [],
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchPartnerProfile = createAsyncThunk(
  'partner/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.getPartnerProfile();
      return response.data as PartnerProfile;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch partner profile');
    }
  }
);

export const updatePartnerProfile = createAsyncThunk(
  'partner/updateProfile',
  async (profileData: any, { rejectWithValue }) => {
    try {
      const response = await apiService.updatePartnerProfile(profileData);
      return response.data as PartnerProfile;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update partner profile');
    }
  }
);

export const verifyMember = createAsyncThunk(
  'partner/verifyMember',
  async (qrCode: string, { rejectWithValue }) => {
    try {
      const response = await apiService.verifyMember(qrCode);
      return response.data as MemberVerification;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Member verification failed');
    }
  }
);

export const applyDiscount = createAsyncThunk(
  'partner/applyDiscount',
  async (discountData: {
    memberId: string;
    agreementId: string;
    originalAmount: number;
    description?: string;
  }, { rejectWithValue }) => {
    try {
      const response = await apiService.applyDiscount(discountData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to apply discount');
    }
  }
);

export const fetchAnalytics = createAsyncThunk(
  'partner/fetchAnalytics',
  async (period: number = 30, { rejectWithValue }) => {
    try {
      const response = await apiService.getPartnerAnalytics(period);
      return response.data as PartnerAnalytics;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch analytics');
    }
  }
);

export const fetchTransactions = createAsyncThunk(
  'partner/fetchTransactions',
  async (params: { page?: number; limit?: number; status?: string } = {}, { rejectWithValue }) => {
    try {
      const response = await apiService.getPartnerTransactions(
        params.page || 1,
        params.limit || 20,
        params.status
      );
      return response.data as Transaction[];
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch transactions');
    }
  }
);

const partnerSlice = createSlice({
  name: 'partner',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    updateProfile: (state, action: PayloadAction<Partial<PartnerProfile>>) => {
      if (state.profile) {
        state.profile = { ...state.profile, ...action.payload };
      }
    },
    clearVerification: (state) => {
      // Clear any verification state if needed
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch partner profile
      .addCase(fetchPartnerProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPartnerProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.profile = action.payload;
        state.error = null;
      })
      .addCase(fetchPartnerProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Update partner profile
      .addCase(updatePartnerProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updatePartnerProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.profile = action.payload;
        state.error = null;
      })
      .addCase(updatePartnerProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Verify member
      .addCase(verifyMember.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(verifyMember.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(verifyMember.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Apply discount
      .addCase(applyDiscount.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(applyDiscount.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(applyDiscount.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch analytics
      .addCase(fetchAnalytics.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAnalytics.fulfilled, (state, action) => {
        state.isLoading = false;
        state.analytics = action.payload;
        state.error = null;
      })
      .addCase(fetchAnalytics.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch transactions
      .addCase(fetchTransactions.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.transactions = action.payload;
        state.error = null;
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, updateProfile, clearVerification } = partnerSlice.actions;
export default partnerSlice.reducer;