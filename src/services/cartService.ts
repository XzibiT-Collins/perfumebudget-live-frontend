import api from './api';
import type {
    CartResponse,
    CartItemRequest,
    CartItemResponse,
    CartItemUpdateRequest,
    PopulateCartItemRequest,
    CustomApiResponse,
    PaystackInitiateTransactionResponse,
} from '../types';

export const cartService = {
    getCart: async (): Promise<CartResponse> => {
        const res = await api.get<CustomApiResponse<CartResponse>>('/cart');
        return res.data.data;
    },

    clearCart: async (): Promise<void> => {
        await api.delete('/cart/clear');
    },

    checkout: async (
        couponCode?: string
    ): Promise<PaystackInitiateTransactionResponse> => {
        const params = couponCode ? { couponCode } : {};
        const res = await api.post<
            CustomApiResponse<PaystackInitiateTransactionResponse>
        >('/cart/checkout', null, { params });
        return res.data.data;
    },

    populateFromLocal: async (
        cartItems: CartItemRequest[]
    ): Promise<CartResponse> => {
        const payload: PopulateCartItemRequest = { cartItems };
        const res = await api.post<CustomApiResponse<CartResponse>>(
            '/cart/populate',
            payload
        );
        return res.data.data;
    },
};

export const cartItemService = {
    addItem: async (
        productId: number,
        quantity: number
    ): Promise<CartItemResponse> => {
        const payload: CartItemRequest = { productId, quantity };
        const res = await api.post<CustomApiResponse<CartItemResponse>>(
            '/cart/items/add-item',
            payload
        );
        return res.data.data;
    },

    updateItem: async (
        cartItemId: number,
        quantity: number
    ): Promise<CartItemResponse> => {
        const payload: CartItemUpdateRequest = { quantity };
        const res = await api.put<CustomApiResponse<CartItemResponse>>(
            `/cart/items/update/${cartItemId}`,
            payload
        );
        return res.data.data;
    },

    removeItem: async (cartItemId: number): Promise<void> => {
        await api.delete(`/cart/items/remove/${cartItemId}`);
    },
};
