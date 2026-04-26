import api from './api';
import type { CustomApiResponse, TaxCalculationResult, TaxRequest, TaxResponse } from '../types';

export const taxService = {
    /**
     * Calculate taxes and discounts for a given subtotal and optional coupon code.
     * GET /api/v1/tax?subtotal={subtotal}&couponCode={couponCode}
     */
    calculateTax: async (subtotal: number, couponCode?: string): Promise<TaxCalculationResult> => {
        const res = await api.get<CustomApiResponse<TaxCalculationResult>>(
            '/tax',
            { params: { subtotal, couponCode } }
        );
        return res.data.data;
    },

    /**
     * Get all configured taxes (admin).
     * GET /api/v1/tax/all
     */
    getAll: async (): Promise<TaxResponse[]> => {
        const res = await api.get<CustomApiResponse<TaxResponse[]>>('/tax/all');
        return res.data.data;
    },

    /**
     * Get a single tax by ID (admin).
     * GET /api/v1/tax/{taxId}
     */
    getById: async (taxId: number): Promise<TaxResponse> => {
        const res = await api.get<CustomApiResponse<TaxResponse>>(`/tax/${taxId}`);
        return res.data.data;
    },

    /**
     * Create a new tax (admin).
     * POST /api/v1/tax/add-tax
     */
    create: async (data: TaxRequest): Promise<TaxResponse> => {
        const res = await api.post<CustomApiResponse<TaxResponse>>('/tax/add-tax', data);
        return res.data.data;
    },

    /**
     * Update an existing tax (admin).
     * PUT /api/v1/tax/update/{taxId}
     */
    update: async (taxId: number, data: TaxRequest): Promise<TaxResponse> => {
        const res = await api.put<CustomApiResponse<TaxResponse>>(`/tax/update/${taxId}`, data);
        return res.data.data;
    },

    /**
     * Delete a tax (admin).
     * DELETE /api/v1/tax/delete/{taxId}
     */
    delete: async (taxId: number): Promise<void> => {
        await api.delete(`/tax/delete/${taxId}`);
    },
};
