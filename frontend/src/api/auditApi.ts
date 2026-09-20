import axiosClient from './axiosClient';
import { AuditLogItem, NotificationItem } from '../types';

export const auditApi = {
  getAuditLogs: async (params?: { userEmail?: string; action?: string; entityType?: string; startDate?: string; endDate?: string }): Promise<AuditLogItem[]> => {
    const res = await axiosClient.get<AuditLogItem[]>('/audit', { params });
    return res.data;
  },

  getAllLogs: async (): Promise<AuditLogItem[]> => {
    const res = await axiosClient.get<AuditLogItem[]>('/audit');
    return res.data;
  }
};

export const notificationsApi = {
  getNotifications: async (): Promise<NotificationItem[]> => {
    const res = await axiosClient.get<NotificationItem[]>('/notifications');
    return res.data;
  },

  getUnreadCount: async (): Promise<number> => {
    const res = await axiosClient.get<{ unreadCount: number }>('/notifications/unread-count');
    return res.data.unreadCount;
  },

  markAsRead: async (id: number): Promise<void> => {
    await axiosClient.put(`/notifications/${id}/read`);
  },

  markAllAsRead: async (): Promise<void> => {
    await axiosClient.put('/notifications/read-all');
  }
};
