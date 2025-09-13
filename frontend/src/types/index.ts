// User and Authentication Types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'MEMBER' | 'PARTNER' | 'ADMIN';
  isActive: boolean;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

// Member Types
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
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone: string | null;
  };
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
  partner: {
    id: string;
    businessName: string;
    businessType: string;
    city: string;
    state: string;
  };
  agreement: {
    id: string;
    discountType: string;
    discountValue: number;
    description: string | null;
  };
}

export interface MemberStats {
  totalUsage: number;
  totalSavings: number;
  uniquePartners: number;
  recentUsage: UsageHistory[];
}

// Partner Types
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
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
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

export interface MemberVerification {
  isValid: boolean;
  memberId?: string;
  membershipId?: string;
  memberName?: string;
  membershipType?: string;
  agreementId?: string;
  discountType?: string;
  discountValue?: number;
  description?: string;
  error?: string;
}

export interface PartnerAnalytics {
  totalVerifications: number;
  totalDiscountsApplied: number;
  totalSavings: number;
  monthlyStats: PartnerMonthlyStats[];
  topMembers: TopMember[];
}

export interface PartnerMonthlyStats {
  month: string;
  verifications: number;
  discounts: number;
  savings: number;
}

export interface TopMember {
  memberId: string;
  memberName: string;
  visits: number;
  totalSavings: number;
}

export interface Transaction {
  id: string;
  memberId: string;
  partnerId: string;
  agreementId: string;
  transactionType: string;
  amount: number;
  discountAmount: number;
  finalAmount: number;
  description: string | null;
  status: string;
  processedAt: string | null;
  createdAt: string;
  member: {
    user: {
      firstName: string;
      lastName: string;
      email: string;
    };
  };
  partner: {
    id: string;
    businessName: string;
    businessType: string;
  };
  agreement: {
    discountType: string;
    discountValue: number;
    description: string | null;
  };
}

// Admin Types
export interface AdminProfile {
  id: string;
  adminType: 'SUPER_ADMIN' | 'ADMIN' | 'STAFF';
  permissions: string[];
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
}

export interface SystemStats {
  totalMembers: number;
  totalPartners: number;
  totalTransactions: number;
  totalSavings: number;
  activeMembers: number;
  activePartners: number;
  monthlyGrowth: MonthlyStats[];
}

export interface MonthlyStats {
  month: string;
  members: number;
  partners: number;
  transactions: number;
  savings: number;
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
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone: string | null;
    isActive: boolean;
    createdAt: string;
  };
  _count: {
    usageHistory: number;
    transactions: number;
  };
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
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    isActive: boolean;
    createdAt: string;
  };
  _count: {
    agreements: number;
    transactions: number;
  };
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  details?: any;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Form Types
export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: 'MEMBER' | 'PARTNER' | 'ADMIN';
}

export interface MemberProfileForm {
  location?: string;
}

export interface PartnerProfileForm {
  businessName: string;
  businessType: string;
  description?: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country?: string;
  phone?: string;
  website?: string;
  contactEmail: string;
}

export interface DiscountApplicationForm {
  originalAmount: number;
  description?: string;
}

// UI State Types
export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface MemberState {
  profile: MemberProfile | null;
  partners: PartnerProfile[];
  usageHistory: UsageHistory[];
  stats: MemberStats | null;
  isLoading: boolean;
  error: string | null;
}

export interface PartnerState {
  profile: PartnerProfile | null;
  analytics: PartnerAnalytics | null;
  transactions: Transaction[];
  isLoading: boolean;
  error: string | null;
}

export interface AdminState {
  profile: AdminProfile | null;
  stats: SystemStats | null;
  members: Member[];
  partners: Partner[];
  agreements: PartnershipAgreement[];
  transactions: Transaction[];
  isLoading: boolean;
  error: string | null;
}

// Navigation Types
export interface NavigationItem {
  label: string;
  path: string;
  icon: React.ComponentType;
  roles?: string[];
}

// Chart Types
export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
  }[];
}

// Filter Types
export interface FilterOptions {
  search?: string;
  businessType?: string;
  membershipType?: string;
  duesStatus?: string;
  isVerified?: boolean;
  status?: string;
  transactionType?: string;
  startDate?: string;
  endDate?: string;
}

// Pagination Types
export interface PaginationOptions {
  page: number;
  limit: number;
}

// Error Types
export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

export interface ApiError extends Error {
  status: number;
  data?: any;
}
