import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { apiService } from '../../services/api';
import { MemberProfile, PartnerProfile, UsageHistory, MemberStats, MemberState } from '../../types';

const initialState: MemberState = {
  profile: null,
  partners: [],
  usageHistory: [],
  stats: null,
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchMemberProfile = createAsyncThunk(
  'member/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.getMemberProfile();
      return response.data as MemberProfile;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch member profile');
    }
  }
);

export const updateMemberProfile = createAsyncThunk(
  'member/updateProfile',
  async (profileData: any, { rejectWithValue }) => {
    try {
      const response = await apiService.updateMemberProfile(profileData);
      return response.data as MemberProfile;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update member profile');
    }
  }
);

export const fetchPartners = createAsyncThunk(
  'member/fetchPartners',
  async (params: { page?: number; limit?: number; search?: string; businessType?: string } = {}, { rejectWithValue }) => {
    try {
      const response = await apiService.getAvailablePartners(
        params.page || 1,
        params.limit || 20,
        params.search,
        params.businessType
      );
      return response.data as PartnerProfile[];
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch partners');
    }
  }
);

export const fetchUsageHistory = createAsyncThunk(
  'member/fetchUsageHistory',
  async (params: { page?: number; limit?: number } = {}, { rejectWithValue }) => {
    try {
      const response = await apiService.getUsageHistory(params.page || 1, params.limit || 20);
      return response.data as UsageHistory[];
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch usage history');
    }
  }
);

export const fetchMemberStats = createAsyncThunk(
  'member/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.getMemberStats();
      return response.data as MemberStats;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch member stats');
    }
  }
);

export const generateQRCode = createAsyncThunk(
  'member/generateQRCode',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.getMemberQRCode();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to generate QR code');
    }
  }
);

export const regenerateQRCode = createAsyncThunk(
  'member/regenerateQRCode',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.regenerateQRCode();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to regenerate QR code');
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
      // Update member profile
      .addCase(updateMemberProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateMemberProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.profile = action.payload;
        state.error = null;
      })
      .addCase(updateMemberProfile.rejected, (state, action) => {
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
      // Fetch member stats
      .addCase(fetchMemberStats.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMemberStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.stats = action.payload;
        state.error = null;
      })
      .addCase(fetchMemberStats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Generate QR code
      .addCase(generateQRCode.fulfilled, (state, action) => {
        if (state.profile) {
          state.profile.qrCode = action.payload.qrCode;
          state.profile.qrCodeExpiry = action.payload.expiry;
        }
      })
      // Regenerate QR code
      .addCase(regenerateQRCode.fulfilled, (state, action) => {
        if (state.profile) {
          state.profile.qrCode = action.payload.qrCode;
          state.profile.qrCodeExpiry = action.payload.expiry;
        }
      });
  },
});

export const { clearError, updateProfile } = memberSlice.actions;
export default memberSlice.reducer;