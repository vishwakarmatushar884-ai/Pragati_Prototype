import axiosClient from './axiosClient';
import { Alert } from '../types';

export interface AlertFilters {
  status?: string;
  severity?: string;
  projectId?: number;
}

export const alertsApi = {
  getAlerts: async (filters?: AlertFilters): Promise<Alert[]> => {
    const res = await axiosClient.get<Alert[]>('/alerts', { params: filters });
    return res.data;
  },

  getAllAlerts: async (): Promise<Alert[]> => {
    const res = await axiosClient.get<Alert[]>('/alerts');
    return res.data;
  },

  getAlertById: async (id: number): Promise<Alert> => {
    const res = await axiosClient.get<Alert>(`/alerts/${id}`);
    return res.data;
  },

  acknowledgeAlert: async (id: number, notes?: string): Promise<Alert> => {
    const res = await axiosClient.post<Alert>(`/alerts/${id}/acknowledge`);
    return res.data;
  },

  resolveAlert: async (id: number, resolutionNotes?: string): Promise<Alert> => {
    const res = await axiosClient.post<Alert>(`/alerts/${id}/resolve`, {
      resolutionNotes: resolutionNotes || 'Alert investigated and resolved by project team'
    });
    return res.data;
  },

  escalateAlert: async (id: number, targetLevelOrReason?: string, reason?: string): Promise<Alert> => {
    const actualReason = reason || targetLevelOrReason || 'Manual escalation triggered via management command center';
    const res = await axiosClient.post<Alert>(`/alerts/${id}/escalate`, { reason: actualReason });
    return res.data;
  }
};
