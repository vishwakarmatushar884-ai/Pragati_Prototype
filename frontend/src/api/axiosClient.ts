import axios, { AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { mockApiAdapter } from './mockApiAdapter';

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || '/api';
const FORCE_DEMO_MODE = (import.meta as any).env?.VITE_DEMO_MODE === 'true';

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 8000,
});

// Helper to notify app of demo mode status
function triggerDemoModeNotice() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('pragati-demo-active', { detail: { active: true } }));
  }
}

// Request interceptor to attach JWT Token
axiosClient.interceptors.request.use(
  async (config) => {
    const token = localStorage.getItem('pragati_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // If explicitly in forced demo mode, handle immediately
    if (FORCE_DEMO_MODE) {
      triggerDemoModeNotice();
      const mockResult = await handleMockRouting(config);
      if (mockResult !== undefined) {
        // Return a mock adapter response
        return Promise.reject({
          __isMockResponse: true,
          mockData: mockResult,
          config
        });
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor with auto-fallback to Demo Mock Adapter
axiosClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    // Check if it was a pre-routed mock rejection
    if (error.__isMockResponse) {
      return {
        data: error.mockData,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: error.config,
      } as AxiosResponse;
    }

    const config = error.config;
    // If network error, 404 not found (e.g. static host without backend API), or server error
    const isNetworkOr404 =
      !error.response ||
      error.code === 'ERR_NETWORK' ||
      error.code === 'ECONNABORTED' ||
      error.response?.status === 404 ||
      error.response?.status === 502 ||
      error.response?.status === 503;

    if (config && isNetworkOr404) {
      triggerDemoModeNotice();
      try {
        const mockResult = await handleMockRouting(config);
        if (mockResult !== undefined) {
          return {
            data: mockResult,
            status: 200,
            statusText: 'OK (Demo Mock)',
            headers: {},
            config,
          } as AxiosResponse;
        }
      } catch (mockErr) {
        console.warn('Mock routing error', mockErr);
      }
    }

    if (error.response && error.response.status === 401) {
      if (!window.location.pathname.includes('/login')) {
        localStorage.removeItem('pragati_token');
        localStorage.removeItem('pragati_user');
        window.location.href = '/login?session_expired=true';
      }
    }

    return Promise.reject(error);
  }
);

// Router mapping for Mock API
async function handleMockRouting(config: InternalAxiosRequestConfig): Promise<any> {
  const rawUrl = config.url || '';
  // Normalize url by removing base if present
  const cleanUrl = rawUrl.replace(/^\/api/, '').split('?')[0];
  const method = (config.method || 'get').toLowerCase();
  let body: any = {};
  if (config.data) {
    body = typeof config.data === 'string' ? JSON.parse(config.data || '{}') : config.data;
  }
  const params = config.params || {};

  // 1. Auth
  if (cleanUrl === '/auth/login' && method === 'post') {
    return mockApiAdapter.login(body.email, body.password);
  }
  if (cleanUrl === '/auth/me' && method === 'get') {
    return mockApiAdapter.getCurrentUser();
  }

  // 2. Dashboard
  if (cleanUrl === '/dashboard/portfolio') {
    return mockApiAdapter.getPortfolioSummary(params);
  }
  if (cleanUrl === '/dashboard/risk-distribution') {
    return mockApiAdapter.getRiskDistribution(params);
  }
  if (cleanUrl === '/dashboard/ministries') {
    return mockApiAdapter.getMinistryStats();
  }
  if (cleanUrl === '/dashboard/sectors') {
    return mockApiAdapter.getSectorStats();
  }
  if (cleanUrl === '/dashboard/trends') {
    return mockApiAdapter.getTrends(params.projectId);
  }
  if (cleanUrl === '/dashboard/top-risk') {
    return mockApiAdapter.getTopRiskProjects(params.limit);
  }

  // 3. Projects
  if (cleanUrl === '/projects' && method === 'get') {
    return mockApiAdapter.getProjects(params);
  }
  if (cleanUrl === '/projects' && method === 'post') {
    return mockApiAdapter.createProject(body);
  }
  // /projects/:id/progress
  const progressMatch = cleanUrl.match(/^\/projects\/(\d+)\/progress$/);
  if (progressMatch && method === 'post') {
    return mockApiAdapter.updateProgress(Number(progressMatch[1]), body);
  }
  // /projects/:id/milestones
  const projMilestonesMatch = cleanUrl.match(/^\/projects\/(\d+)\/milestones$/);
  if (projMilestonesMatch) {
    if (method === 'get') return mockApiAdapter.getMilestones(Number(projMilestonesMatch[1]));
    if (method === 'post') return mockApiAdapter.createMilestone(Number(projMilestonesMatch[1]), body);
  }
  // /milestones/:id
  const milestoneMatch = cleanUrl.match(/^\/milestones\/(\d+)$/);
  if (milestoneMatch && method === 'put') {
    return mockApiAdapter.updateMilestone(Number(milestoneMatch[1]), body);
  }
  // /projects/:id/financials
  const financialsMatch = cleanUrl.match(/^\/projects\/(\d+)\/financials$/);
  if (financialsMatch) {
    if (method === 'get') return mockApiAdapter.getFinancials(Number(financialsMatch[1]));
    if (method === 'post') return mockApiAdapter.addFinancialRecord(Number(financialsMatch[1]), body);
  }
  // /projects/:id/documents
  const docsMatch = cleanUrl.match(/^\/projects\/(\d+)\/documents$/);
  if (docsMatch) {
    return [];
  }
  // /risks/projects/:id
  const riskExpMatch = cleanUrl.match(/^\/risks\/projects\/(\d+)$/);
  if (riskExpMatch && method === 'get') {
    return mockApiAdapter.getRiskExplanation(Number(riskExpMatch[1]));
  }
  // /risks/projects/:id/recalculate
  const riskRecalcMatch = cleanUrl.match(/^\/risks\/projects\/(\d+)\/recalculate$/);
  if (riskRecalcMatch && method === 'post') {
    return mockApiAdapter.recalculateRisk(Number(riskRecalcMatch[1]));
  }
  // /projects/:id
  const singleProjMatch = cleanUrl.match(/^\/projects\/(\d+)$/);
  if (singleProjMatch) {
    const pId = Number(singleProjMatch[1]);
    if (method === 'get') return mockApiAdapter.getProjectById(pId);
    if (method === 'put') return mockApiAdapter.updateProject(pId, body);
    if (method === 'delete') return mockApiAdapter.deleteProject(pId);
  }

  // 4. Alerts
  if (cleanUrl === '/alerts' && method === 'get') {
    return mockApiAdapter.getAlerts(params);
  }
  const alertAckMatch = cleanUrl.match(/^\/alerts\/(\d+)\/acknowledge$/);
  if (alertAckMatch && method === 'post') {
    return mockApiAdapter.acknowledgeAlert(Number(alertAckMatch[1]));
  }
  const alertResolveMatch = cleanUrl.match(/^\/alerts\/(\d+)\/resolve$/);
  if (alertResolveMatch && method === 'post') {
    return mockApiAdapter.resolveAlert(Number(alertResolveMatch[1]), body?.resolutionNotes);
  }
  const alertEscalateMatch = cleanUrl.match(/^\/alerts\/(\d+)\/escalate$/);
  if (alertEscalateMatch && method === 'post') {
    return mockApiAdapter.escalateAlert(Number(alertEscalateMatch[1]), body?.reason);
  }
  const singleAlertMatch = cleanUrl.match(/^\/alerts\/(\d+)$/);
  if (singleAlertMatch && method === 'get') {
    const alerts = await mockApiAdapter.getAlerts({ id: Number(singleAlertMatch[1]) });
    return alerts[0] || null;
  }

  // 5. Issues
  if (cleanUrl === '/issues' && method === 'get') {
    return mockApiAdapter.getIssues(params);
  }
  if (cleanUrl === '/issues' && method === 'post') {
    return mockApiAdapter.createIssue(body);
  }
  const issueResolveMatch = cleanUrl.match(/^\/issues\/(\d+)\/resolve$/);
  if (issueResolveMatch && method === 'post') {
    return mockApiAdapter.resolveIssue(Number(issueResolveMatch[1]), body?.resolution);
  }
  const issueCommentMatch = cleanUrl.match(/^\/issues\/(\d+)\/comments$/);
  if (issueCommentMatch && method === 'post') {
    return mockApiAdapter.addComment(Number(issueCommentMatch[1]), body?.content);
  }
  const singleIssueMatch = cleanUrl.match(/^\/issues\/(\d+)$/);
  if (singleIssueMatch) {
    const iId = Number(singleIssueMatch[1]);
    if (method === 'get') return mockApiAdapter.getIssueById(iId);
    if (method === 'put') return mockApiAdapter.updateIssue(iId, body);
  }

  // 6. Audit & Notifications
  if (cleanUrl === '/audit' && method === 'get') {
    return mockApiAdapter.getAuditLogs(params);
  }
  if (cleanUrl === '/notifications' && method === 'get') {
    return mockApiAdapter.getNotifications();
  }
  if (cleanUrl === '/notifications/unread-count' && method === 'get') {
    const unreadCount = await mockApiAdapter.getUnreadCount();
    return { unreadCount };
  }
  const notifReadMatch = cleanUrl.match(/^\/notifications\/(\d+)\/read$/);
  if (notifReadMatch && method === 'put') {
    return mockApiAdapter.markAsRead(Number(notifReadMatch[1]));
  }
  if (cleanUrl === '/notifications/read-all' && method === 'put') {
    return mockApiAdapter.markAllAsRead();
  }

  // 7. Settings
  if (cleanUrl === '/settings') {
    if (method === 'get') return mockApiAdapter.getSettings();
    if (method === 'put') return mockApiAdapter.updateSettings(body);
  }

  // 8. Reports
  if (cleanUrl === '/reports/generate') {
    return mockApiAdapter.generateReport(params);
  }
  if (cleanUrl === '/reports/export/csv') {
    const csvContent = 'Project Code,Project Name,Ministry,State,Budget(Cr),Progress,Status,Risk\n' +
      'PRG-HWY-2023-001,Atal Tunnel Rohtang,MORTH,Himachal Pradesh,3200,100%,COMPLETED,LOW\n' +
      'PRG-RLY-2024-003,Rishikesh-Karanprayag T-8,Railways,Uttarakhand,3800,48%,DELAYED,CRITICAL';
    return new Blob([csvContent], { type: 'text/csv' });
  }

  return undefined;
}

export default axiosClient;
