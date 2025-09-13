import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { apiService } from '../../services/api';
import { AdminProfile, SystemStats, Member, Partner, PartnershipAgreement, Transaction, AdminState } from '../../types';

const initialState: AdminState = {
  profile: null,
  stats: null,
  members: [],
  partners: [],
  agreements: [],
  transactions: [],
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchAdminProfile = createAsyncThunk(
  'admin/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.getAdminProfile();
      return response.data as AdminProfile;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch admin profile');
    }
  }
);

export const fetchSystemStats = createAsyncThunk(
  'admin/fetchSystemStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.getSystemStats();
      return response.data as SystemStats;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch system stats');
    }
  }
);

export const fetchMembers = createAsyncThunk(
  'admin/fetchMembers',
  async (params: { page?: number; limit?: number; search?: string; membershipType?: string; duesStatus?: string } = {}, { rejectWithValue }) => {
    try {
      const response = await apiService.getAllMembers(
        params.page || 1,
        params.limit || 20,
        params.search,
        params.membershipType,
        params.duesStatus
      );
      return response.data as Member[];
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch members');
    }
  }
);

export const fetchPartners = createAsyncThunk(
  'admin/fetchPartners',
  async (params: { page?: number; limit?: number; search?: string; businessType?: string; isVerified?: boolean } = {}, { rejectWithValue }) => {
    try {
      const response = await apiService.getAllPartners(
        params.page || 1,
        params.limit || 20,
        params.search,
        params.businessType,
        params.isVerified
      );
      return response.data as Partner[];
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch partners');
    }
  }
);

export const updateMember = createAsyncThunk(
  'admin/updateMember',
  async ({ memberId, updates }: { memberId: string; updates: any }, { rejectWithValue }) => {
    try {
      const response = await apiService.updateMember(memberId, updates);
      return response.data as Member;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update member');
    }
  }
);

export const updatePartner = createAsyncThunk(
  'admin/updatePartner',
  async ({ partnerId, updates }: { partnerId: string; updates: any }, { rejectWithValue }) => {
    try {
      const response = await apiService.updatePartner(partnerId, updates);
      return response.data as Partner;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update partner');
    }
  }
);

export const createPartnershipAgreement = createAsyncThunk(
  'admin/createPartnershipAgreement',
  async (agreementData: any, { rejectWithValue }) => {
    try {
      const response = await apiService.createPartnershipAgreement(agreementData);
      return response.data as PartnershipAgreement;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create partnership agreement');
    }
  }
);

export const fetchPartnershipAgreements = createAsyncThunk(
  'admin/fetchPartnershipAgreements',
  async (params: { page?: number; limit?: number; partnerId?: string; isActive?: boolean } = {}, { rejectWithValue }) => {
    try {
      const response = await apiService.getPartnershipAgreements(
        params.page || 1,
        params.limit || 20,
        params.partnerId,
        params.isActive
      );
      return response.data as PartnershipAgreement[];
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch partnership agreements');
    }
  }
);

export const updatePartnershipAgreement = createAsyncThunk(
  'admin/updatePartnershipAgreement',
  async ({ agreementId, updates }: { agreementId: string; updates: any }, { rejectWithValue }) => {
    try {
      const response = await apiService.updatePartnershipAgreement(agreementId, updates);
      return response.data as PartnershipAgreement;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update partnership agreement');
    }
  }
);

export const fetchSystemTransactions = createAsyncThunk(
  'admin/fetchSystemTransactions',
  async (params: { page?: number; limit?: number; status?: string; transactionType?: string; startDate?: string; endDate?: string } = {}, { rejectWithValue }) => {
    try {
      const response = await apiService.getSystemTransactions(
        params.page || 1,
        params.limit || 20,
        params.status,
        params.transactionType,
        params.startDate,
        params.endDate
      );
      return response.data as Transaction[];
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch system transactions');
    }
  }
);

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    updateProfile: (state, action: PayloadAction<Partial<AdminProfile>>) => {
      if (state.profile) {
        state.profile = { ...state.profile, ...action.payload };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch admin profile
      .addCase(fetchAdminProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAdminProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.profile = action.payload;
        state.error = null;
      })
      .addCase(fetchAdminProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch system stats
      .addCase(fetchSystemStats.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSystemStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.stats = action.payload;
        state.error = null;
      })
      .addCase(fetchSystemStats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch members
      .addCase(fetchMembers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMembers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.members = action.payload;
        state.error = null;
      })
      .addCase(fetchMembers.rejected, (state, action) => {
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
      // Update member
      .addCase(updateMember.fulfilled, (state, action) => {
        const index = state.members.findIndex(member => member.id === action.payload.id);
        if (index !== -1) {
          state.members[index] = action.payload;
        }
      })
      // Update partner
      .addCase(updatePartner.fulfilled, (state, action) => {
        const index = state.partners.findIndex(partner => partner.id === action.payload.id);
        if (index !== -1) {
          state.partners[index] = action.payload;
        }
      })
      // Create partnership agreement
      .addCase(createPartnershipAgreement.fulfilled, (state, action) => {
        state.agreements.push(action.payload);
      })
      // Fetch partnership agreements
      .addCase(fetchPartnershipAgreements.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPartnershipAgreements.fulfilled, (state, action) => {
        state.isLoading = false;
        state.agreements = action.payload;
        state.error = null;
      })
      .addCase(fetchPartnershipAgreements.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Update partnership agreement
      .addCase(updatePartnershipAgreement.fulfilled, (state, action) => {
        const index = state.agreements.findIndex(agreement => agreement.id === action.payload.id);
        if (index !== -1) {
          state.agreements[index] = action.payload;
        }
      })
      // Fetch system transactions
      .addCase(fetchSystemTransactions.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSystemTransactions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.transactions = action.payload;
        state.error = null;
      })
      .addCase(fetchSystemTransactions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, updateProfile } = adminSlice.actions;
export default adminSlice.reducer;