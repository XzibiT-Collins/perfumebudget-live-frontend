import api from './api';
import type {
    CategoryResponse,
    CategoryRequest,
    CustomApiResponse,
} from '../types';

export const categoryService = {
    getAll: async (): Promise<CategoryResponse[]> => {
        const res = await api.get<CustomApiResponse<CategoryResponse[]>>(
            '/category/all'
        );
        return res.data.data;
    },

    getById: async (categoryId: number): Promise<CategoryResponse> => {
        const res = await api.get<CustomApiResponse<CategoryResponse>>(
            `/category/${categoryId}`
        );
        return res.data.data;
    },

    create: async (data: CategoryRequest): Promise<CategoryResponse> => {
        const res = await api.post<CustomApiResponse<CategoryResponse>>(
            '/category/add-category',
            data
        );
        return res.data.data;
    },

    update: async (
        categoryId: number,
        data: CategoryRequest
    ): Promise<CategoryResponse> => {
        const res = await api.put<CustomApiResponse<CategoryResponse>>(
            `/category/update/${categoryId}`,
            data
        );
        return res.data.data;
    },

    delete: async (categoryId: number): Promise<void> => {
        await api.delete(`/category/delete/${categoryId}`);
    },
};
