import api from './api';
import type {
  ShopWideDiscountRequest,
  ShopWideDiscountResponse,
  CustomApiResponse,
} from '../types';

export const shopDiscountService = {
  setShopDiscount: async (data: ShopWideDiscountRequest): Promise<ShopWideDiscountResponse> => {
    const res = await api.put<CustomApiResponse<ShopWideDiscountResponse>>(
      '/admin/shop-discount',
      data
    );
    return res.data.data;
  },

  getCurrentShopDiscount: async (): Promise<ShopWideDiscountResponse> => {
    const res = await api.get<CustomApiResponse<ShopWideDiscountResponse>>(
      '/admin/shop-discount/current'
    );
    return res.data.data;
  },

  deactivateShopDiscount: async (id: number): Promise<void> => {
    await api.delete(`/admin/shop-discount/${id}`);
  },
};
