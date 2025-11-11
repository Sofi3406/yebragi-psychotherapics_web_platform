import api from './api';

export interface MeetJob {
  jobId: string;
  status: string;
  appointmentId: string;
}

export interface MeetLinkResponse {
  meetLink: string;
}

export const meetService = {
  createMeet: async (appointmentId: string) => {
    const response = await api.post<MeetJob>('/api/meet', { appointmentId });
    return response.data;
  },

  getMeetLink: async (appointmentId: string) => {
    const response = await api.get<MeetLinkResponse>(
      `/api/meet/appointment/${appointmentId}`
    );
    return response.data;
  },

  getJobStatus: async (jobId: string) => {
    const response = await api.get<MeetJob>(`/api/meet/${jobId}`);
    return response.data;
  },
};



