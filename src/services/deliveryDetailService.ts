import api from './api';
import type {
    DeliveryDetailResponse,
    DeliveryDetailRequest,
    CustomApiResponse,
} from '../types';

export const deliveryDetailService = {
    getMyAddresses: async (): Promise<DeliveryDetailResponse[]> => {
        const res = await api.get<CustomApiResponse<DeliveryDetailResponse[]>>(
            '/delivery-detail'
        );
        return res.data.data;
    },

    addAddress: async (
        data: DeliveryDetailRequest
    ): Promise<DeliveryDetailResponse> => {
        const res = await api.post<CustomApiResponse<DeliveryDetailResponse>>(
            '/delivery-detail/add-address',
            data
        );
        return res.data.data;
    },

    updateAddress: async (
        addressId: number,
        data: DeliveryDetailRequest
    ): Promise<DeliveryDetailResponse> => {
        const res = await api.put<CustomApiResponse<DeliveryDetailResponse>>(
            `/delivery-detail/update/${addressId}`,
            data
        );
        return res.data.data;
    },

    deleteAddress: async (addressId: number): Promise<void> => {
        await api.delete(`/delivery-detail/delete/${addressId}`);
    },

    setDefault: async (addressId: number): Promise<void> => {
        await api.put(`/delivery-detail/${addressId}/set-default`);
    },
};
