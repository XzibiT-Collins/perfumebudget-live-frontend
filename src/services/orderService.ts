import api from './api';
import type {
    OrderResponse,
    OrderListResponse,
    OrderStatusUpdateRequest,
    PageResponse,
    CustomApiResponse,
} from '../types';

export const orderService = {
    getMyOrders: async (
        page = 0,
        size = 10
    ): Promise<PageResponse<OrderListResponse>> => {
        const res = await api.get<CustomApiResponse<PageResponse<OrderListResponse>>>(
            '/order/my-orders',
            { params: { page, size } }
        );
        return res.data.data;
    },

    getAllOrders: async (
        page = 0,
        size = 10,
        paymentStatus?: string,
        orderStatus?: string
    ): Promise<PageResponse<OrderListResponse>> => {
        const params: any = { page, size };
        if (paymentStatus) params.paymentStatus = paymentStatus;
        if (orderStatus) params.orderStatus = orderStatus;
        const res = await api.get<CustomApiResponse<PageResponse<OrderListResponse>>>(
            '/order/all',
            { params }
        );
        return res.data.data;
    },

    getOrder: async (orderNumber: string): Promise<OrderResponse> => {
        const res = await api.get<CustomApiResponse<OrderResponse>>(
            `/order/${orderNumber}`
        );
        return res.data.data;
    },

    updateStatus: async (
        orderNumber: string,
        orderStatus: OrderStatusUpdateRequest['orderStatus']
    ): Promise<OrderResponse> => {
        const res = await api.put<CustomApiResponse<OrderResponse>>(
            `/order/update-order-status/${orderNumber}`,
            { orderStatus } satisfies OrderStatusUpdateRequest
        );
        return res.data.data;
    },
};
