import api from './api';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: string;
  isVerified: boolean;
  therapistProfile?: {
    id: string;
    bio?: string;
    licenseNumber?: string;
    specializations?: Array<{
      specialization: {
        id: string;
        name: string;
        description?: string;
      };
    }>;
  };
}

export const userService = {
  getProfile: async () => {
    const response = await api.get<UserProfile>('/api/users/me');
    return response.data;
  },

  updateProfile: async (data: Partial<UserProfile>) => {
    const response = await api.put<UserProfile>('/api/users/profile', data);
    return response.data;
  },
};



