import axiosClient from './axiosClient';
import { 
  PortfolioSummary, 
  RiskDistribution, 
  MinistryStat, 
  SectorStat, 
  MonthlyTrendItem, 
  TopRiskProject 
} from '../types';

export const dashboardApi = {
  getPortfolioSummary: async (filters?: { ministry?: string; state?: string; sector?: string; riskLevel?: string }): Promise<PortfolioSummary> => {
    const res = await axiosClient.get<PortfolioSummary>('/dashboard/portfolio', { params: filters });
    return res.data;
  },

  getRiskDistribution: async (filters?: { ministry?: string; state?: string; sector?: string }): Promise<RiskDistribution> => {
    const res = await axiosClient.get<RiskDistribution>('/dashboard/risk-distribution', { params: filters });
    return res.data;
  },

  getMinistryStats: async (): Promise<MinistryStat[]> => {
    const res = await axiosClient.get<MinistryStat[]>('/dashboard/ministries');
    return res.data;
  },

  getSectorStats: async (): Promise<SectorStat[]> => {
    const res = await axiosClient.get<SectorStat[]>('/dashboard/sectors');
    return res.data;
  },

  getTrends: async (projectId?: number): Promise<MonthlyTrendItem[]> => {
    const res = await axiosClient.get<MonthlyTrendItem[]>('/dashboard/trends', { params: { projectId } });
    return res.data;
  },

  getTopRiskProjects: async (limit = 10): Promise<TopRiskProject[]> => {
    const res = await axiosClient.get<TopRiskProject[]>('/dashboard/top-risk', { params: { limit } });
    return res.data;
  }
};
