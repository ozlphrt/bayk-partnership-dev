import { ApiResponse } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

class ApiService {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.loadToken();
  }

  private loadToken() {
    this.token = localStorage.getItem('token');
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    if (this.token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${this.token}`,
      };
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new ApiError(
          data.error || data.message || 'Request failed',
          response.status,
          data
        );
      }

      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      
      // Network or other errors
      throw new ApiError(
        'Network error occurred',
        0,
        { originalError: error }
      );
    }
  }

  // Authentication methods
  async login(email: string, password: string) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    if (response.data?.token) {
      this.setToken(response.data.token);
    }
    
    return response;
  }

  async register(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    role: 'MEMBER' | 'PARTNER' | 'ADMIN';
  }) {
    const response = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    
    if (response.data?.token) {
      this.setToken(response.data.token);
    }
    
    return response;
  }

  async refreshToken(refreshToken: string) {
    const response = await this.request('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
    
    if (response.data?.token) {
      this.setToken(response.data.token);
    }
    
    return response;
  }

  async logout() {
    try {
      await this.request('/auth/logout', {
        method: 'POST',
      });
    } finally {
      this.setToken(null);
    }
  }

  async getProfile() {
    return this.request('/auth/profile');
  }

  async updateProfile(profileData: any) {
    return this.request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  // Member methods
  async getMemberProfile() {
    return this.request('/members/profile');
  }

  async updateMemberProfile(profileData: any) {
    return this.request('/members/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  async getMemberQRCode() {
    return this.request('/members/qr-code');
  }

  async regenerateQRCode() {
    return this.request('/members/qr-code/regenerate', {
      method: 'POST',
    });
  }

  async getUsageHistory(page = 1, limit = 20) {
    return this.request(`/members/usage-history?page=${page}&limit=${limit}`);
  }

  async getMemberStats() {
    return this.request('/members/stats');
  }

  async getAvailablePartners(page = 1, limit = 20, search?: string, businessType?: string) {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    
    if (search) params.append('search', search);
    if (businessType) params.append('businessType', businessType);
    
    return this.request(`/members/partners?${params.toString()}`);
  }

  // Partner methods
  async getPartnerProfile() {
    return this.request('/partners/profile');
  }

  async updatePartnerProfile(profileData: any) {
    return this.request('/partners/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  async verifyMember(qrCode: string) {
    return this.request('/partners/verify-member', {
      method: 'POST',
      body: JSON.stringify({ qrCode }),
    });
  }

  async applyDiscount(discountData: {
    memberId: string;
    agreementId: string;
    originalAmount: number;
    description?: string;
  }) {
    return this.request('/partners/apply-discount', {
      method: 'POST',
      body: JSON.stringify(discountData),
    });
  }

  async getPartnerAnalytics(period = 30) {
    return this.request(`/partners/analytics?period=${period}`);
  }

  async getPartnerTransactions(page = 1, limit = 20, status?: string) {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    
    if (status) params.append('status', status);
    
    return this.request(`/partners/transactions?${params.toString()}`);
  }

  // Admin methods
  async getAdminProfile() {
    return this.request('/admin/profile');
  }

  async getSystemStats() {
    return this.request('/admin/stats');
  }

  async getAllMembers(page = 1, limit = 20, search?: string, membershipType?: string, duesStatus?: string) {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    
    if (search) params.append('search', search);
    if (membershipType) params.append('membershipType', membershipType);
    if (duesStatus) params.append('duesStatus', duesStatus);
    
    return this.request(`/admin/members?${params.toString()}`);
  }

  async getAllPartners(page = 1, limit = 20, search?: string, businessType?: string, isVerified?: boolean) {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    
    if (search) params.append('search', search);
    if (businessType) params.append('businessType', businessType);
    if (isVerified !== undefined) params.append('isVerified', isVerified.toString());
    
    return this.request(`/admin/partners?${params.toString()}`);
  }

  async updateMember(memberId: string, updates: any) {
    return this.request(`/admin/members/${memberId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async updatePartner(partnerId: string, updates: any) {
    return this.request(`/admin/partners/${partnerId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async createPartnershipAgreement(agreementData: any) {
    return this.request('/admin/agreements', {
      method: 'POST',
      body: JSON.stringify(agreementData),
    });
  }

  async getPartnershipAgreements(page = 1, limit = 20, partnerId?: string, isActive?: boolean) {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    
    if (partnerId) params.append('partnerId', partnerId);
    if (isActive !== undefined) params.append('isActive', isActive.toString());
    
    return this.request(`/admin/agreements?${params.toString()}`);
  }

  async updatePartnershipAgreement(agreementId: string, updates: any) {
    return this.request(`/admin/agreements/${agreementId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async getSystemTransactions(page = 1, limit = 20, status?: string, transactionType?: string, startDate?: string, endDate?: string) {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    
    if (status) params.append('status', status);
    if (transactionType) params.append('transactionType', transactionType);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    return this.request(`/admin/transactions?${params.toString()}`);
  }
}

export const apiService = new ApiService(API_BASE_URL);
export { ApiError };
