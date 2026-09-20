import axiosClient from './axiosClient';
import { Project, PortfolioSummary } from '../types';

export interface ReportSummaryResponse {
  reportType: string;
  generatedAt: string;
  generatedBy: string;
  filtersApplied: Record<string, string>;
  summary: PortfolioSummary;
  projects: Project[];
}

export const reportsApi = {
  generateReport: async (params: { reportType?: string; ministry?: string; state?: string; sector?: string; riskLevel?: string }): Promise<ReportSummaryResponse> => {
    const res = await axiosClient.get<ReportSummaryResponse>('/reports/generate', { params });
    return res.data;
  },

  downloadCsv: async (params: { reportType?: string; ministry?: string; state?: string; sector?: string; riskLevel?: string }): Promise<Blob> => {
    const res = await axiosClient.get('/reports/export/csv', {
      params,
      responseType: 'blob',
    });
    return res.data;
  }
};
