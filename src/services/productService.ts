import api from './api';
import type {
    ProductListing,
    ProductDetailsPageResponse,
    ProductDetails,
    PageResponse,
    CustomApiResponse,
    ProductFamilyResponse,
    AvailableUomsResponse,
    StockConversionRequest,
    ConversionResponse,
    ProductVariantSummaryResponse,
} from '../types';

export const productService = {
    getListings: async (
        page = 0,
        size = 9
    ): Promise<PageResponse<ProductListing>> => {
        const res = await api.get('/product/listing', {
            params: { page, size },
        });
        return res.data.data;
    },

    getFeatured: async (): Promise<ProductListing[]> => {
        const res = await api.get<CustomApiResponse<ProductListing[]>>(
            '/product/featured'
        );
        return res.data.data;
    },

    getAdminListings: async (
        page = 0,
        size = 9
    ): Promise<PageResponse<ProductListing>> => {
        const res = await api.get('/product/admin/listing', {
            params: { page, size },
        });
        return res.data.data;
    },

    search: async (
        params: {
            categoryId?: number;
            searchTerm?: string;
            page?: number;
            size?: number;
            sort?: string;
        }
    ): Promise<PageResponse<ProductListing>> => {
        const res = await api.get('/product/search', { params });
        return res.data.data;
    },

    adminSearch: async (
        params: {
            categoryId?: number;
            searchTerm?: string;
            page?: number;
            size?: number;
            sort?: string;
        }
    ): Promise<PageResponse<ProductListing>> => {
        const res = await api.get('/product/admin/search', { params });
        return res.data.data;
    },

    getBySlug: async (slug: string): Promise<ProductDetailsPageResponse> => {
        const res = await api.get<CustomApiResponse<ProductDetailsPageResponse>>(
            `/product/${slug}`
        );
        return res.data.data;
    },

    getById: async (productId: number): Promise<ProductDetails> => {
        const res = await api.get<CustomApiResponse<ProductDetails>>(
            `/product/main/${productId}`
        );
        return res.data.data;
    },

    create: async (formData: FormData): Promise<ProductDetails> => {
        const res = await api.post<CustomApiResponse<ProductDetails>>(
            '/product/add-product',
            formData,
            { headers: { 'Content-Type': 'multipart/form-data' } }
        );
        return res.data.data;
    },

    update: async (
        productId: number,
        formData: FormData
    ): Promise<ProductDetails> => {
        const res = await api.put<CustomApiResponse<ProductDetails>>(
            `/product/update/${productId}`,
            formData,
            { headers: { 'Content-Type': 'multipart/form-data' } }
        );
        return res.data.data;
    },

    delete: async (productId: number): Promise<void> => {
        await api.delete(`/product/delete/${productId}`);
    },

    getFamilies: async (): Promise<ProductFamilyResponse[]> => {
        const res = await api.get<CustomApiResponse<ProductFamilyResponse[]>>(
            '/admin/product-families'
        );
        return res.data.data;
    },

    getAvailableUoms: async (familyId: number): Promise<AvailableUomsResponse> => {
        const res = await api.get<CustomApiResponse<AvailableUomsResponse>>(
            `/admin/product-families/${familyId}/available-uoms`
        );
        return res.data.data;
    },

    forwardConversion: async (
        data: StockConversionRequest
    ): Promise<ConversionResponse> => {
        const res = await api.post<CustomApiResponse<ConversionResponse>>(
            '/admin/stock-conversions/forward',
            data
        );
        return res.data.data;
    },

    reverseConversion: async (
        data: StockConversionRequest
    ): Promise<ConversionResponse> => {
        const res = await api.post<CustomApiResponse<ConversionResponse>>(
            '/admin/stock-conversions/reverse',
            data
        );
        return res.data.data;
    },

    getReverseConversionTargetVariants: async (
        sourceProductId: number
    ): Promise<ProductVariantSummaryResponse[]> => {
        const res = await api.get<CustomApiResponse<ProductVariantSummaryResponse[]>>(
            `/admin/stock-conversions/reverse/${sourceProductId}/variants`
        );
        return res.data.data;
    },
};
