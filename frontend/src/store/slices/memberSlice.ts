import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

export interface MemberProfile {
  id: string;
  membershipId: string;
  membershipType: 'STANDARD' | 'PREMIUM' | 'VIP' | 'LIFETIME';
  duesStatus: 'CURRENT' | 'OVERDUE' | 'SUSPENDED' | 'CANCELLED';
  duesAmount: number;
  duesDueDate: string | null;
  qrCode: string;
  qrCodeExpiry: string;
  location: string | null;
  joinedDate: string;
  isActive: boolean;
}

export interface Partner {
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
  agreements: PartnershipAgreement[];
  promotions: Promotion[];
}

export interface PartnershipAgreement {
  id: string;
  agreementType: 'STANDARD' | 'PREMIUM' | 'CUSTOM';
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT' | 'FREE_ITEM' | 'SPECIAL_OFFER';
  discountValue: number;
  description: string | null;
  terms: string | null;
  startDate: string;
  endDate: string | null;
  isActive: boolean;
}

export interface Promotion {
  id: string;
  title: string;
  description: string;
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT' | 'FREE_ITEM' | 'SPECIAL_OFFER';
  discountValue: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  maxUses: number | null;
  currentUses: number;
}

export interface UsageHistory {
  id: string;
  partnerId: string;
  agreementId: string;
  discountAmount: number;
  originalAmount: number;
  finalAmount: number;
  description: string | null;
  usedAt: string;
}

export interface MemberState {
  profile: MemberProfile | null;
  partners: Partner[];
  usageHistory: UsageHistory[];
  isLoading: boolean;
  error: string | null;
}

const initialState: MemberState = {
  profile: null,
  partners: [],
  usageHistory: [],
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchMemberProfile = createAsyncThunk(
  'member/fetchProfile',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { auth: { token: string } };
      const response = await fetch(`${import.meta.env.VITE_API_URL}/members/profile`, {
        headers: {
          'Authorization': `Bearer ${state.auth.token}`,
        },
      });

      if (!response.ok) {
        return rejectWithValue('Failed to fetch member profile');
      }

      return await response.json();
    } catch (error) {
      return rejectWithValue('Network error occurred');
    }
  }
);

export const fetchPartners = createAsyncThunk(
  'member/fetchPartners',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { auth: { token: string } };
      const response = await fetch(`${import.meta.env.VITE_API_URL}/partners`, {
        headers: {
          'Authorization': `Bearer ${state.auth.token}`,
        },
      });

      if (!response.ok) {
        return rejectWithValue('Failed to fetch partners');
      }

      return await response.json();
    } catch (error) {
      return rejectWithValue('Network error occurred');
    }
  }
);

export const fetchUsageHistory = createAsyncThunk(
  'member/fetchUsageHistory',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { auth: { token: string } };
      const response = await fetch(`${import.meta.env.VITE_API_URL}/members/usage-history`, {
        headers: {
          'Authorization': `Bearer ${state.auth.token}`,
        },
      });

      if (!response.ok) {
        return rejectWithValue('Failed to fetch usage history');
      }

      return await response.json();
    } catch (error) {
      return rejectWithValue('Network error occurred');
    }
  }
);

export const generateQRCode = createAsyncThunk(
  'member/generateQRCode',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { auth: { token: string } };
      const response = await fetch(`${import.meta.env.VITE_API_URL}/members/qr-code`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${state.auth.token}`,
        },
      });

      if (!response.ok) {
        return rejectWithValue('Failed to generate QR code');
      }

      return await response.json();
    } catch (error) {
      return rejectWithValue('Network error occurred');
    }
  }
);

const memberSlice = createSlice({
  name: 'member',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    updateProfile: (state, action: PayloadAction<Partial<MemberProfile>>) => {
      if (state.profile) {
        state.profile = { ...state.profile, ...action.payload };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch member profile
      .addCase(fetchMemberProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMemberProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.profile = action.payload;
        state.error = null;
      })
      .addCase(fetchMemberProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch partners
      .addCase(fetchPartners.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPartners.fulfilled, (state, action) => {
        state.isLoading = false;
        state.partners = action.payload;
        state.error = null;
      })
      .addCase(fetchPartners.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch usage history
      .addCase(fetchUsageHistory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUsageHistory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.usageHistory = action.payload;
        state.error = null;
      })
      .addCase(fetchUsageHistory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Generate QR code
      .addCase(generateQRCode.fulfilled, (state, action) => {
        if (state.profile) {
          state.profile.qrCode = action.payload.qrCode;
          state.profile.qrCodeExpiry = action.payload.qrCodeExpiry;
        }
      });
  },
});

export const { clearError, updateProfile } = memberSlice.actions;
export default memberSlice.reducer;
