import api from './api';
import { 
  CustomApiResponse, 
  PageResponse, 
  NotificationResponse, 
  UnreadNotificationCountResponse 
} from '../types';

const notificationService = {
  getNotifications: async (page = 0, size = 10): Promise<CustomApiResponse<PageResponse<NotificationResponse>>> => {
    const response = await api.get<CustomApiResponse<PageResponse<NotificationResponse>>>(
      `/admin/notifications?page=${page}&size=${size}`
    );
    return response.data;
  },

  getUnreadCount: async (): Promise<CustomApiResponse<UnreadNotificationCountResponse>> => {
    const response = await api.get<CustomApiResponse<UnreadNotificationCountResponse>>(
      '/admin/notifications/unread-count'
    );
    return response.data;
  },

  markAsRead: async (recipientId: number): Promise<CustomApiResponse<NotificationResponse>> => {
    const response = await api.patch<CustomApiResponse<NotificationResponse>>(
      `/admin/notifications/${recipientId}/read`
    );
    return response.data;
  },

  markAllAsRead: async (): Promise<void> => {
    await api.patch('/admin/notifications/read-all');
  },
};

export default notificationService;
