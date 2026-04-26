import api from './api';
import type {
  WalkInOrderRequest,
  WalkInOrderResponse,
  CustomerSearchResponse,
  PageResponse,
  CustomApiResponse,
} from '../types';

export const walkInService = {
  placeOrder: async (request: WalkInOrderRequest): Promise<WalkInOrderResponse> => {
    const res = await api.post<CustomApiResponse<WalkInOrderResponse>>(
      '/admin/walk-in/order',
      request
    );
    return res.data.data;
  },

  searchCustomers: async (query: string): Promise<CustomerSearchResponse[]> => {
    const res = await api.get<CustomApiResponse<CustomerSearchResponse[]>>(
      '/admin/walk-in/customers/search',
      { params: { query } }
    );
    return res.data.data;
  },

  getOrders: async (
    page = 0,
    size = 10,
    date?: string
  ): Promise<PageResponse<WalkInOrderResponse>> => {
    const params: any = { page, size };
    if (date) params.date = date;
    const res = await api.get<CustomApiResponse<PageResponse<WalkInOrderResponse>>>(
      '/admin/walk-in/orders',
      { params }
    );
    return res.data.data;
  },

  getOrder: async (orderNumber: string): Promise<WalkInOrderResponse> => {
    const res = await api.get<CustomApiResponse<WalkInOrderResponse>>(
      `/admin/walk-in/orders/${orderNumber}`
    );
    return res.data.data;
  },

  markReceiptPrinted: async (orderNumber: string): Promise<void> => {
    await api.patch<CustomApiResponse<void>>(
      `/admin/walk-in/orders/${orderNumber}/receipt-printed`
    );
  },
};
