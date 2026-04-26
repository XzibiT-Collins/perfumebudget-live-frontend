import api from './api';
import type {
    FeatureFlagResponse,
    FeatureFlagUpdateRequest,
    CustomApiResponse,
} from '../types';

export const featureFlagService = {
    getFeatureFlags: async (): Promise<FeatureFlagResponse[]> => {
        const res = await api.get<CustomApiResponse<FeatureFlagResponse[]>>('/admin/feature-flags');
        return res.data.data;
    },

    getFeatureFlag: async (featureKey: string): Promise<FeatureFlagResponse> => {
        const res = await api.get<CustomApiResponse<FeatureFlagResponse>>(`/admin/feature-flags/${featureKey}`);
        return res.data.data;
    },

    updateFeatureFlag: async (featureKey: string, data: FeatureFlagUpdateRequest): Promise<FeatureFlagResponse> => {
        const res = await api.patch<CustomApiResponse<FeatureFlagResponse>>(`/admin/feature-flags/${featureKey}`, data);
        return res.data.data;
    },
};
