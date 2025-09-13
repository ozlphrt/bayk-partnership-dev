import { Request } from 'express';
import { User, Member, Partner, Admin } from '@prisma/client';

// Extended Request interface with user data
export interface AuthenticatedRequest extends Request {
  user?: User & {
    memberProfile?: Member;
    partnerProfile?: Partner;
    adminProfile?: Admin;
  };
}

// JWT Payload interface
export interface JWTPayload {
  userId: string;
  email: string;
  role: 'MEMBER' | 'PARTNER' | 'ADMIN';
  iat?: number;
  exp?: number;
}

// Authentication interfaces
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: 'MEMBER' | 'PARTNER' | 'ADMIN';
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    isActive: boolean;
  };
  token: string;
  refreshToken: string;
}

// QR Code interfaces
export interface QRCodeData {
  memberId: string;
  membershipId: string;
  timestamp: number;
  signature: string;
}

export interface QRCodeVerification {
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

// Member interfaces
export interface MemberProfile {
  id: string;
  membershipId: string;
  membershipType: string;
  duesStatus: string;
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

// Partner interfaces
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
}

// Transaction interfaces
export interface TransactionRequest {
  memberId: string;
  agreementId: string;
  originalAmount: number;
  description?: string;
}

export interface TransactionResponse {
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
}

// Analytics interfaces
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

// API Response interfaces
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
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

// Error interfaces
export interface AppError extends Error {
  statusCode: number;
  isOperational: boolean;
}

// Validation interfaces
export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

// File upload interfaces
export interface FileUpload {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

// Email interfaces
export interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  template?: string;
  context?: Record<string, any>;
}

// Socket.io interfaces
export interface SocketData {
  userId: string;
  role: string;
  partnerId?: string;
}

export interface SocketEvents {
  'member-verified': (data: { memberId: string; partnerId: string; timestamp: string }) => void;
  'new-partner': (data: { partnerId: string; businessName: string }) => void;
  'promotion-updated': (data: { partnerId: string; promotionId: string }) => void;
  'system-announcement': (data: { title: string; message: string; timestamp: string }) => void;
}
