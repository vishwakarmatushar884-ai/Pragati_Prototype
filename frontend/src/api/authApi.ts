import axiosClient from './axiosClient';
import { AuthResponse, User } from '../types';

export const authApi = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const res = await axiosClient.post<AuthResponse>('/auth/login', { email, password });
    return res.data;
  },
  getCurrentUser: async (): Promise<User> => {
    const res = await axiosClient.get<User>('/auth/me');
    return res.data;
  },
};
