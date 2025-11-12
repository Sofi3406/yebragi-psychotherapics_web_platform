import api from './api';

export interface Therapist {
  id: string;
  user: {
    id: string;
    fullName: string;
    email: string;
  };
  bio?: string;
  licenseNumber?: string;
  specializations?: Array<{
    specialization: {
      name: string;
      description?: string;
    };
  }>;
  availability?: Array<{
    id: string;
    startTime: string;
    endTime: string;
    isBooked: boolean;
  }>;
}

export interface TherapistListResponse {
  therapists: Therapist[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface AvailabilitySlot {
  id: string;
  startTime: string;
  endTime: string;
  isBooked: boolean;
}

export interface CreateAvailabilityData {
  startTime: string;
  endTime: string;
}

export const therapistService = {
  list: async (params?: { search?: string; specialization?: string; page?: number; limit?: number }) => {
    const response = await api.get<TherapistListResponse>('/api/v1/therapists', { params });
    return response.data;
  },

  getOne: async (id: string) => {
    const response = await api.get<Therapist>(`/api/v1/therapists/${id}`);
    return response.data;
  },

  getAvailability: async (id: string, startDate?: string, endDate?: string) => {
    const response = await api.get<{ slots: AvailabilitySlot[] }>(`/api/v1/therapists/${id}/availability`, {
      params: { startDate, endDate },
    });
    return response.data;
  },

  createAvailability: async (data: CreateAvailabilityData) => {
    const response = await api.post<AvailabilitySlot>('/api/v1/therapists/availability', data);
    return response.data;
  },

  deleteAvailability: async (slotId: string) => {
    const response = await api.delete(`/api/v1/therapists/availability/${slotId}`);
    return response.data;
  },
};




