import api from './api';

export interface AvailabilitySlot {
  id: string;
  startTime: string;
  endTime: string;
  isBooked: boolean;
  therapist: {
    id: string;
    user: {
      id: string;
      fullName: string;
      email: string;
    };
    bio?: string;
    specializations?: Array<{
      specialization: {
        name: string;
      };
    }>;
  };
}

export interface Appointment {
  id: string;
  patientId: string;
  therapistId: string;
  slotId: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  meetLink?: string;
  createdAt: string;
  updatedAt: string;
  slot: AvailabilitySlot;
  therapist: {
    id: string;
    user: {
      fullName: string;
      email: string;
    };
    bio?: string;
  };
  patient?: {
    id: string;
    fullName: string;
    email: string;
  };
  payment?: {
    id: string;
    status: string;
    amount: number;
  };
}

export interface CreateAppointmentData {
  therapistId: string;
  slotId: string;
}

export interface AppointmentStats {
  total: number;
  confirmed: number;
  pending: number;
  cancelled: number;
  upcoming: number;
}

export interface AppointmentListResponse {
  appointments: Appointment[];
  stats: AppointmentStats;
}

export const appointmentService = {
  create: async (data: CreateAppointmentData) => {
    const response = await api.post<Appointment>('/api/v1/appointments', data);
    return response.data;
  },

  list: async () => {
    const response = await api.get<AppointmentListResponse>('/api/v1/appointments');
    return response.data;
  },

  getOne: async (id: string) => {
    const response = await api.get<Appointment>(`/api/v1/appointments/${id}`);
    return response.data;
  },

  update: async (id: string, data: Partial<Appointment>) => {
    const response = await api.put<Appointment>(`/api/v1/appointments/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/api/v1/appointments/${id}`);
    return response.data;
  },

  accept: async (id: string) => {
    const response = await api.post<Appointment>(`/api/v1/appointments/${id}/accept`);
    return response.data;
  },

  decline: async (id: string) => {
    const response = await api.post<Appointment>(`/api/v1/appointments/${id}/decline`);
    return response.data;
  },

  complete: async (id: string) => {
    const response = await api.post<Appointment>(`/api/v1/appointments/${id}/complete`);
    return response.data;
  },
};



