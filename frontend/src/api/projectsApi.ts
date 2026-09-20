import axiosClient from './axiosClient';
import { Project, Milestone, FinancialRecord, DocumentItem, MLExplainResponse } from '../types';

export interface ProjectFilters {
  ministry?: string;
  state?: string;
  sector?: string;
  riskLevel?: string;
  status?: string;
  query?: string;
}

export const projectsApi = {
  getProjects: async (filters?: ProjectFilters): Promise<Project[]> => {
    const res = await axiosClient.get<Project[]>('/projects', { params: filters });
    return res.data;
  },

  getProjectById: async (id: number): Promise<Project> => {
    const res = await axiosClient.get<Project>(`/projects/${id}`);
    return res.data;
  },

  createProject: async (projectData: Partial<Project>): Promise<Project> => {
    const res = await axiosClient.post<Project>('/projects', projectData);
    return res.data;
  },

  updateProject: async (id: number, projectData: Partial<Project>): Promise<Project> => {
    const res = await axiosClient.put<Project>(`/projects/${id}`, projectData);
    return res.data;
  },

  deleteProject: async (id: number): Promise<void> => {
    await axiosClient.delete(`/projects/${id}`);
  },

  updateProgress: async (id: number, data: { physicalProgress: number; plannedProgress?: number; actualCost?: number; remarks?: string; sitePhotoUrl?: string }): Promise<Project> => {
    const res = await axiosClient.post<Project>(`/projects/${id}/progress`, data);
    return res.data;
  },

  getMilestones: async (projectId: number): Promise<Milestone[]> => {
    const res = await axiosClient.get<Milestone[]>(`/projects/${projectId}/milestones`);
    return res.data;
  },

  createMilestone: async (projectId: number, milestoneData: Partial<Milestone>): Promise<Milestone> => {
    const res = await axiosClient.post<Milestone>(`/projects/${projectId}/milestones`, milestoneData);
    return res.data;
  },

  updateMilestone: async (milestoneId: number, data: Partial<Milestone>): Promise<Milestone> => {
    const res = await axiosClient.put<Milestone>(`/milestones/${milestoneId}`, data);
    return res.data;
  },

  getFinancials: async (projectId: number): Promise<FinancialRecord[]> => {
    const res = await axiosClient.get<FinancialRecord[]>(`/projects/${projectId}/financials`);
    return res.data;
  },

  addFinancialRecord: async (projectId: number, data: Partial<FinancialRecord>): Promise<FinancialRecord> => {
    const res = await axiosClient.post<FinancialRecord>(`/projects/${projectId}/financials`, data);
    return res.data;
  },

  getRiskExplanation: async (projectId: number): Promise<MLExplainResponse> => {
    const res = await axiosClient.get<MLExplainResponse>(`/risks/projects/${projectId}`);
    return res.data;
  },

  recalculateRisk: async (projectId: number): Promise<Project> => {
    const res = await axiosClient.post<Project>(`/risks/projects/${projectId}/recalculate`);
    return res.data;
  },

  getDocuments: async (projectId: number): Promise<DocumentItem[]> => {
    const res = await axiosClient.get<DocumentItem[]>(`/projects/${projectId}/documents`);
    return res.data;
  },

  addDocument: async (projectId: number, doc: Partial<DocumentItem>): Promise<DocumentItem> => {
    const res = await axiosClient.post<DocumentItem>(`/projects/${projectId}/documents`, doc);
    return res.data;
  }
};
