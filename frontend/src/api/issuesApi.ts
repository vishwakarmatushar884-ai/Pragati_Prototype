import axiosClient from './axiosClient';
import { Issue, IssueComment } from '../types';

export interface IssueFilters {
  projectId?: number;
  status?: string;
  priority?: string;
  category?: string;
}

export const issuesApi = {
  getIssues: async (filters?: IssueFilters): Promise<Issue[]> => {
    const res = await axiosClient.get<Issue[]>('/issues', { params: filters });
    return res.data;
  },

  getAllIssues: async (): Promise<Issue[]> => {
    const res = await axiosClient.get<Issue[]>('/issues');
    return res.data;
  },

  getIssueById: async (id: number): Promise<Issue> => {
    const res = await axiosClient.get<Issue>(`/issues/${id}`);
    return res.data;
  },

  createIssue: async (arg1: number | Partial<Issue>, arg2?: Partial<Issue>): Promise<Issue> => {
    let payload: any;
    if (typeof arg1 === 'number' && arg2) {
      payload = { ...arg2, projectId: arg1 };
    } else {
      payload = { ...(arg1 as any) };
    }
    if (payload.severity && !payload.priority) {
      payload.priority = payload.severity;
    }
    if (payload.assignedToName && !payload.assignedTo) {
      payload.assignedTo = payload.assignedToName;
    }
    const res = await axiosClient.post<Issue>('/issues', payload);
    return res.data;
  },

  updateIssue: async (id: number, data: Partial<Issue>): Promise<Issue> => {
    const res = await axiosClient.put<Issue>(`/issues/${id}`, data);
    return res.data;
  },

  resolveIssue: async (id: number, resolution?: string): Promise<Issue> => {
    const res = await axiosClient.post<Issue>(`/issues/${id}/resolve`, {
      resolution: resolution || 'Issue resolved by project authority'
    });
    return res.data;
  },

  addComment: async (issueId: number, content: string): Promise<IssueComment> => {
    const res = await axiosClient.post<IssueComment>(`/issues/${issueId}/comments`, { content });
    return res.data;
  }
};
