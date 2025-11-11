import api from './api';

export interface ChatMessage {
  message: string;
}

export interface ChatResponse {
  response: string;
  conversationId?: string;
}

export const chatService = {
  sendMessage: async (message: string) => {
    const response = await api.post<ChatResponse>('/api/v1/chat/message', {
      message,
    });
    return response.data;
  },
};



