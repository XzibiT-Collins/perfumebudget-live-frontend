import api from './api';
import type {
  CustomApiResponse,
  FrontDeskPermissionTemplateResponse,
  FrontDeskPermissionTemplateUpdateRequest,
  FrontDeskUserSummaryResponse,
  CreateFrontDeskUserRequest,
  UpdateFrontDeskUserRequest,
  FrontDeskUserPermissionsResponse,
  FrontDeskUserPermissionOverrideUpdateRequest,
} from '../types';

export const frontDeskService = {
  // --- Default Template ---
  getDefaultTemplate: async (): Promise<FrontDeskPermissionTemplateResponse> => {
    const res = await api.get<CustomApiResponse<FrontDeskPermissionTemplateResponse>>(
      '/admin/front-desk/template'
    );
    return res.data.data;
  },

  updateDefaultTemplate: async (
    data: FrontDeskPermissionTemplateUpdateRequest
  ): Promise<FrontDeskPermissionTemplateResponse> => {
    const res = await api.put<CustomApiResponse<FrontDeskPermissionTemplateResponse>>(
      '/admin/front-desk/template',
      data
    );
    return res.data.data;
  },

  // --- Front Desk Users ---
  getFrontDeskUsers: async (): Promise<FrontDeskUserSummaryResponse[]> => {
    const res = await api.get<CustomApiResponse<FrontDeskUserSummaryResponse[]>>(
      '/admin/front-desk/users'
    );
    return res.data.data;
  },

  createFrontDeskUser: async (
    data: CreateFrontDeskUserRequest
  ): Promise<FrontDeskUserSummaryResponse> => {
    const res = await api.post<CustomApiResponse<FrontDeskUserSummaryResponse>>(
      '/admin/front-desk/users',
      data
    );
    return res.data.data;
  },

  assignUserToFrontDesk: async (userId: number): Promise<FrontDeskUserSummaryResponse> => {
    const res = await api.patch<CustomApiResponse<FrontDeskUserSummaryResponse>>(
      `/admin/front-desk/users/${userId}/assign`
    );
    return res.data.data;
  },

  updateFrontDeskUser: async (
    userId: number,
    data: UpdateFrontDeskUserRequest
  ): Promise<FrontDeskUserSummaryResponse> => {
    const payload: UpdateFrontDeskUserRequest = {
      ...data,
      password: data.password?.trim() ? data.password.trim() : undefined,
    };

    const res = await api.patch<CustomApiResponse<FrontDeskUserSummaryResponse>>(
      `/admin/front-desk/users/${userId}`,
      payload
    );
    return res.data.data;
  },

  // --- User Permission Overrides ---
  getUserPermissions: async (userId: number): Promise<FrontDeskUserPermissionsResponse> => {
    const res = await api.get<CustomApiResponse<FrontDeskUserPermissionsResponse>>(
      `/admin/front-desk/users/${userId}/permissions`
    );
    return res.data.data;
  },

  updateUserPermissions: async (
    userId: number,
    data: FrontDeskUserPermissionOverrideUpdateRequest
  ): Promise<FrontDeskUserPermissionsResponse> => {
    const res = await api.put<CustomApiResponse<FrontDeskUserPermissionsResponse>>(
      `/admin/front-desk/users/${userId}/permissions`,
      data
    );
    return res.data.data;
  },
};
