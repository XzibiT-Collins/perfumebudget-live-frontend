import api from './api';
import type {
    CouponRequest,
    CouponDetailResponse,
    CouponListResponse,
    PageResponse,
    CustomApiResponse,
} from '../types';

export const couponService = {
    getAll: async (
        page = 0,
        size = 10
    ): Promise<PageResponse<CouponListResponse>> => {
        const res = await api.get<CustomApiResponse<PageResponse<CouponListResponse>>>(
            '/coupon/all',
            { params: { page, size } }
        );
        return res.data.data;
    },

    getById: async (couponId: number): Promise<CouponDetailResponse> => {
        const res = await api.get<CustomApiResponse<CouponDetailResponse>>(
            `/coupon/${couponId}`
        );
        return res.data.data;
    },

    create: async (data: CouponRequest): Promise<CouponDetailResponse> => {
        const res = await api.post<CustomApiResponse<CouponDetailResponse>>(
            '/coupon/add-coupon',
            data
        );
        return res.data.data;
    },
};
