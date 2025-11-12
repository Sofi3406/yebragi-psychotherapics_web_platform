import api from './api';

export interface InitiatePaymentData {
  appointmentId: string;
  amount: number;
  currency?: string;
}

export interface PaymentResponse {
  checkoutUrl: string;
  txRef: string;
  status: string;
}

export const paymentService = {
  initiate: async (data: InitiatePaymentData) => {
    const response = await api.post<PaymentResponse>('/api/v1/payments/initiate', data);
    return response.data;
  },
};







