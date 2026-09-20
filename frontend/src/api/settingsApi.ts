import axiosClient from './axiosClient';
import { SystemSettings } from '../types';

export const settingsApi = {
  getSettings: async (): Promise<SystemSettings> => {
    const res = await axiosClient.get<SystemSettings>('/settings');
    return res.data;
  },

  updateSettings: async (settings: SystemSettings): Promise<void> => {
    await axiosClient.put('/settings', settings);
  }
};
