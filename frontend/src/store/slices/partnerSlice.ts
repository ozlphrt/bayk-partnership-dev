import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

export interface PartnerProfile {
  id: string;
  businessName: string;
  businessType: string;
  description: string | null;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string | null;
  website: string | null;
  contactEmail: string;
  isActive: boolean;
  isVerified: boolean;
  partnershipDate: string;
}

export interface MemberVerification {
  id: string;
  memberId: string;
  memberName: string;
  membershipId: string;
  membershipType: string;
  qrCode: string;
  isValid: boolean;
  verifiedAt: string | null;
}

export interface PartnerAnalytics {
  totalVerifications: number;
  totalDiscountsApplied: number;
  totalSavings: number;
  monthlyStats: {
    month: string;
    verifications: number;
    discounts: number;
    savings: number;
  }[];
  topMembers: {
    memberId: string;
    memberName: string;
    visits: number;
    totalSavings: number;
  }[];
}

export interface PartnerState {
  profile: PartnerProfile | null;
  analytics: PartnerAnalytics | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: PartnerState = {
  profile: null,
  analytics: null,
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchPartnerProfile = createAsyncThunk(
  'partner/fetchProfile',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { auth: { token: string } };
      const response = await fetch(`${import.meta.env.VITE_API_URL}/partners/profile`, {
        headers: {
          'Authorization': `Bearer ${state.auth.token}`,
        },
      });

      if (!response.ok) {
        return rejectWithValue('Failed to fetch partner profile');
      }

      return await response.json();
    } catch (error) {
      return rejectWithValue('Network error occurred');
    }
  }
);

export const verifyMember = createAsyncThunk(
  'partner/verifyMember',
  async (qrCode: string, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { auth: { token: string } };
      const response = await fetch(`${import.meta.env.VITE_API_URL}/partners/verify-member`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${state.auth.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ qrCode }),
      });

      if (!response.ok) {
        const error = await response.json();
        return rejectWithValue(error.message || 'Member verification failed');
      }

      return await response.json();
    } catch (error) {
      return rejectWithValue('Network error occurred');
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
  }, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { auth: { token: string } };
      const response = await fetch(`${import.meta.env.VITE_API_URL}/partners/apply-discount`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${state.auth.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(discountData),
      });

      if (!response.ok) {
        const error = await response.json();
        return rejectWithValue(error.message || 'Failed to apply discount');
      }

      return await response.json();
    } catch (error) {
      return rejectWithValue('Network error occurred');
    }
  }
);

export const fetchAnalytics = createAsyncThunk(
  'partner/fetchAnalytics',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { auth: { token: string } };
      const response = await fetch(`${import.meta.env.VITE_API_URL}/partners/analytics`, {
        headers: {
          'Authorization': `Bearer ${state.auth.token}`,
        },
      });

      if (!response.ok) {
        return rejectWithValue('Failed to fetch analytics');
      }

      return await response.json();
    } catch (error) {
      return rejectWithValue('Network error occurred');
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
      .addCase(applyDiscount.fulfilled, (state) => {
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
      });
  },
});

export const { clearError, updateProfile } = partnerSlice.actions;
export default partnerSlice.reducer;
