import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

export interface AdminProfile {
  id: string;
  adminType: 'SUPER_ADMIN' | 'ADMIN' | 'STAFF';
  permissions: string[];
}

export interface SystemStats {
  totalMembers: number;
  totalPartners: number;
  totalTransactions: number;
  totalSavings: number;
  activeMembers: number;
  activePartners: number;
  monthlyGrowth: {
    month: string;
    members: number;
    partners: number;
    transactions: number;
    savings: number;
  }[];
}

export interface Member {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  membershipId: string;
  membershipType: string;
  duesStatus: string;
  duesAmount: number;
  duesDueDate: string | null;
  isActive: boolean;
  joinedDate: string;
}

export interface Partner {
  id: string;
  email: string;
  businessName: string;
  businessType: string;
  city: string;
  state: string;
  isActive: boolean;
  isVerified: boolean;
  partnershipDate: string;
}

export interface AdminState {
  profile: AdminProfile | null;
  stats: SystemStats | null;
  members: Member[];
  partners: Partner[];
  isLoading: boolean;
  error: string | null;
}

const initialState: AdminState = {
  profile: null,
  stats: null,
  members: [],
  partners: [],
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchAdminProfile = createAsyncThunk(
  'admin/fetchProfile',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { auth: { token: string } };
      const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/profile`, {
        headers: {
          'Authorization': `Bearer ${state.auth.token}`,
        },
      });

      if (!response.ok) {
        return rejectWithValue('Failed to fetch admin profile');
      }

      return await response.json();
    } catch (error) {
      return rejectWithValue('Network error occurred');
    }
  }
);

export const fetchSystemStats = createAsyncThunk(
  'admin/fetchSystemStats',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { auth: { token: string } };
      const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/stats`, {
        headers: {
          'Authorization': `Bearer ${state.auth.token}`,
        },
      });

      if (!response.ok) {
        return rejectWithValue('Failed to fetch system stats');
      }

      return await response.json();
    } catch (error) {
      return rejectWithValue('Network error occurred');
    }
  }
);

export const fetchMembers = createAsyncThunk(
  'admin/fetchMembers',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { auth: { token: string } };
      const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/members`, {
        headers: {
          'Authorization': `Bearer ${state.auth.token}`,
        },
      });

      if (!response.ok) {
        return rejectWithValue('Failed to fetch members');
      }

      return await response.json();
    } catch (error) {
      return rejectWithValue('Network error occurred');
    }
  }
);

export const fetchPartners = createAsyncThunk(
  'admin/fetchPartners',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { auth: { token: string } };
      const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/partners`, {
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

export const updateMember = createAsyncThunk(
  'admin/updateMember',
  async ({ memberId, updates }: { memberId: string; updates: Partial<Member> }, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { auth: { token: string } };
      const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/members/${memberId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${state.auth.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        return rejectWithValue('Failed to update member');
      }

      return await response.json();
    } catch (error) {
      return rejectWithValue('Network error occurred');
    }
  }
);

export const updatePartner = createAsyncThunk(
  'admin/updatePartner',
  async ({ partnerId, updates }: { partnerId: string; updates: Partial<Partner> }, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { auth: { token: string } };
      const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/partners/${partnerId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${state.auth.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        return rejectWithValue('Failed to update partner');
      }

      return await response.json();
    } catch (error) {
      return rejectWithValue('Network error occurred');
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
      });
  },
});

export const { clearError, updateProfile } = adminSlice.actions;
export default adminSlice.reducer;
