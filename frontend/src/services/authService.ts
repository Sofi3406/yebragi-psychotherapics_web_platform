import api from './api';

export interface RegisterData {
  email: string;
  password: string;
  fullName: string;
  role?: 'PATIENT' | 'THERAPIST' | 'ADMIN';
}

export interface LoginData {
  email: string;
  password: string;
}

export interface VerifyData {
  email: string;
  otp: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    fullName: string;
    role: string;
    isVerified: boolean;
  };
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: string;
  isVerified: boolean;
}

export const authService = {
  register: async (data: RegisterData) => {
    const response = await api.post<AuthResponse>('/api/v1/auth/register', data);
    return response.data;
  },

  login: async (data: LoginData) => {
    const response = await api.post<AuthResponse>('/api/v1/auth/login', data);
    return response.data;
  },

  verify: async (data: VerifyData) => {
    const response = await api.post<AuthResponse>('/api/v1/auth/verify', data);
    return response.data;
  },

  resendOtp: async (email: string) => {
    const response = await api.post('/api/v1/auth/resend-otp', { email });
    return response.data;
  },

  refresh: async (refreshToken: string) => {
    const response = await api.post<{ accessToken: string }>('/api/v1/auth/refresh', {
      refreshToken,
    });
    return response.data;
  },
};
