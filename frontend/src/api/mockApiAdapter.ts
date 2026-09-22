import {
  Project,
  Milestone,
  FinancialRecord,
  Issue,
  Alert,
  AuditLogItem,
  NotificationItem,
  SystemSettings,
  PortfolioSummary,
  RiskDistribution,
  MinistryStat,
  SectorStat,
  TopRiskProject,
  MLExplainResponse,
  AuthResponse,
  User
} from '../types';
import { ReportSummaryResponse } from './reportsApi';
import {
  DEMO_USERS,
  INITIAL_PROJECTS,
  INITIAL_MILESTONES,
  INITIAL_ALERTS,
  INITIAL_ISSUES,
  INITIAL_FINANCIALS,
  INITIAL_ANOMALIES,
  INITIAL_AUDIT_LOGS,
  INITIAL_NOTIFICATIONS,
  INITIAL_SETTINGS,
  MOCK_TRENDS
} from './mockData';

const STORAGE_KEYS = {
  PROJECTS: 'pragati_demo_projects',
  MILESTONES: 'pragati_demo_milestones',
  ALERTS: 'pragati_demo_alerts',
  ISSUES: 'pragati_demo_issues',
  FINANCIALS: 'pragati_demo_financials',
  AUDIT_LOGS: 'pragati_demo_audit_logs',
  NOTIFICATIONS: 'pragati_demo_notifications',
  SETTINGS: 'pragati_demo_settings'
};

function loadStorage<T>(key: string, defaultVal: T): T {
  try {
    const item = localStorage.getItem(key);
    if (!item) {
      localStorage.setItem(key, JSON.stringify(defaultVal));
      return JSON.parse(JSON.stringify(defaultVal));
    }
    return JSON.parse(item);
  } catch {
    return defaultVal;
  }
}

function saveStorage<T>(key: string, val: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (err) {
    console.warn(`Failed to persist ${key} in localStorage`, err);
  }
}

export const mockApiAdapter = {
  resetDemoData: () => {
    localStorage.removeItem(STORAGE_KEYS.PROJECTS);
    localStorage.removeItem(STORAGE_KEYS.MILESTONES);
    localStorage.removeItem(STORAGE_KEYS.ALERTS);
    localStorage.removeItem(STORAGE_KEYS.ISSUES);
    localStorage.removeItem(STORAGE_KEYS.FINANCIALS);
    localStorage.removeItem(STORAGE_KEYS.AUDIT_LOGS);
    localStorage.removeItem(STORAGE_KEYS.NOTIFICATIONS);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    window.dispatchEvent(new CustomEvent('pragati-demo-data-reset'));
  },

  // AUTH
  login: async (email: string, _password?: string): Promise<AuthResponse> => {
    const demoUser = DEMO_USERS[email] || DEMO_USERS['admin@pragati.demo'];
    const u = demoUser.user;
    return {
      token: demoUser.token,
      type: 'Bearer',
      id: u.id,
      email: u.email,
      fullName: u.fullName,
      designation: u.designation || 'Officer',
      ministry: u.ministry || 'Government of India',
      department: u.department || 'National Command',
      roles: u.roles
    };
  },

  getCurrentUser: async (): Promise<User> => {
    const saved = localStorage.getItem('pragati_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return DEMO_USERS['admin@pragati.demo'].user;
  },

  // PROJECTS
  getProjects: async (filters?: any): Promise<Project[]> => {
    let list: Project[] = loadStorage(STORAGE_KEYS.PROJECTS, INITIAL_PROJECTS);
    if (filters) {
      if (filters.ministry && filters.ministry !== 'ALL') {
        list = list.filter((p) => p.ministry.toLowerCase().includes(filters.ministry.toLowerCase()));
      }
      if (filters.state && filters.state !== 'ALL') {
        list = list.filter((p) => p.state.toLowerCase() === filters.state.toLowerCase());
      }
      if (filters.sector && filters.sector !== 'ALL') {
        list = list.filter((p) => p.sector.toLowerCase() === filters.sector.toLowerCase());
      }
      if (filters.riskLevel && filters.riskLevel !== 'ALL') {
        list = list.filter((p) => p.riskLevel.toUpperCase() === filters.riskLevel.toUpperCase());
      }
      if (filters.status && filters.status !== 'ALL') {
        list = list.filter((p) => p.currentStatus === filters.status);
      }
      if (filters.query) {
        const q = filters.query.toLowerCase();
        list = list.filter(
          (p) =>
            p.projectName.toLowerCase().includes(q) ||
            p.projectCode.toLowerCase().includes(q) ||
            p.state.toLowerCase().includes(q) ||
            p.ministry.toLowerCase().includes(q)
        );
      }
    }
    return list;
  },

  getProjectById: async (id: number): Promise<Project> => {
    const list: Project[] = loadStorage(STORAGE_KEYS.PROJECTS, INITIAL_PROJECTS);
    const item = list.find((p) => p.id === Number(id));
    if (!item) {
      return list[0];
    }
    return item;
  },

  createProject: async (data: Partial<Project>): Promise<Project> => {
    const list: Project[] = loadStorage(STORAGE_KEYS.PROJECTS, INITIAL_PROJECTS);
    const newId = list.length > 0 ? Math.max(...list.map((p) => p.id)) + 1 : 1;
    const newProject: Project = {
      id: newId,
      projectCode: data.projectCode || `PRG-NEW-2024-${String(newId).padStart(3, '0')}`,
      projectName: data.projectName || 'New National Infrastructure Project',
      ministry: data.ministry || 'Ministry of Road Transport and Highways',
      sector: data.sector || 'Highways',
      state: data.state || 'New Delhi',
      district: data.district || 'Central Delhi',
      location: data.location || 'National Capital Corridor',
      latitude: data.latitude || 28.6139,
      longitude: data.longitude || 77.2090,
      startDate: data.startDate || new Date().toISOString().split('T')[0],
      plannedEndDate: data.plannedEndDate || '2026-12-31',
      projectBudget: Number(data.projectBudget) || 1000.0,
      approvedCost: Number(data.approvedCost || data.projectBudget) || 1000.0,
      plannedCost: Number(data.plannedCost) || 500.0,
      actualCost: Number(data.actualCost) || 480.0,
      earnedValue: Number(data.earnedValue) || 490.0,
      physicalProgress: Number(data.physicalProgress) || 50.0,
      plannedProgress: Number(data.plannedProgress) || 50.0,
      financialProgress: Number(data.financialProgress) || 48.0,
      spi: 1.0,
      cpi: 1.0,
      scheduleVariance: 0,
      costVariance: 0,
      currentStatus: (data.currentStatus as any) || 'IN_PROGRESS',
      priority: (data.priority as any) || 'HIGH',
      riskLevel: (data.riskLevel as any) || 'LOW',
      healthScore: 85,
      aiRiskProbability: 0.15,
      aiPredictedDelayDays: 0,
      aiExplanationSummary: 'Baseline parameters established and tracking on schedule.',
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      openIssuesCount: 0,
      criticalIssuesCount: 0,
      overdueMilestonesCount: 0,
      activeAlertsCount: 0
    };
    list.unshift(newProject);
    saveStorage(STORAGE_KEYS.PROJECTS, list);
    return newProject;
  },

  updateProject: async (id: number, data: Partial<Project>): Promise<Project> => {
    const list: Project[] = loadStorage(STORAGE_KEYS.PROJECTS, INITIAL_PROJECTS);
    const idx = list.findIndex((p) => p.id === Number(id));
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...data, lastUpdated: new Date().toISOString() };
      saveStorage(STORAGE_KEYS.PROJECTS, list);
      return list[idx];
    }
    return data as Project;
  },

  deleteProject: async (id: number): Promise<void> => {
    let list: Project[] = loadStorage(STORAGE_KEYS.PROJECTS, INITIAL_PROJECTS);
    list = list.filter((p) => p.id !== Number(id));
    saveStorage(STORAGE_KEYS.PROJECTS, list);
  },

  updateProgress: async (
    id: number,
    data: { physicalProgress: number; plannedProgress?: number; actualCost?: number; remarks?: string }
  ): Promise<Project> => {
    const list: Project[] = loadStorage(STORAGE_KEYS.PROJECTS, INITIAL_PROJECTS);
    const idx = list.findIndex((p) => p.id === Number(id));
    if (idx !== -1) {
      const p = list[idx];
      const newPhysical = data.physicalProgress ?? p.physicalProgress;
      const newPlanned = data.plannedProgress ?? p.plannedProgress;
      const newActualCost = data.actualCost ?? p.actualCost;
      const earnedValue = (newPhysical / 100) * p.approvedCost;
      const plannedCost = (newPlanned / 100) * p.approvedCost;
      const spi = plannedCost > 0 ? Number((earnedValue / plannedCost).toFixed(2)) : 1.0;
      const cpi = newActualCost > 0 ? Number((earnedValue / newActualCost).toFixed(2)) : 1.0;

      let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW';
      let healthScore = 90;
      if (spi < 0.75 || cpi < 0.75) {
        riskLevel = 'CRITICAL';
        healthScore = 30;
      } else if (spi < 0.85 || cpi < 0.85) {
        riskLevel = 'HIGH';
        healthScore = 50;
      } else if (spi < 0.95 || cpi < 0.95) {
        riskLevel = 'MEDIUM';
        healthScore = 70;
      }

      list[idx] = {
        ...p,
        physicalProgress: newPhysical,
        plannedProgress: newPlanned,
        actualCost: newActualCost,
        earnedValue: Number(earnedValue.toFixed(1)),
        plannedCost: Number(plannedCost.toFixed(1)),
        spi,
        cpi,
        riskLevel,
        healthScore,
        lastUpdated: new Date().toISOString()
      };
      saveStorage(STORAGE_KEYS.PROJECTS, list);
      return list[idx];
    }
    return list[0];
  },

  // MILESTONES
  getMilestones: async (projectId: number): Promise<Milestone[]> => {
    const list: Milestone[] = loadStorage(STORAGE_KEYS.MILESTONES, INITIAL_MILESTONES);
    return list.filter((m) => m.projectId === Number(projectId));
  },

  createMilestone: async (projectId: number, data: Partial<Milestone>): Promise<Milestone> => {
    const list: Milestone[] = loadStorage(STORAGE_KEYS.MILESTONES, INITIAL_MILESTONES);
    const newId = list.length > 0 ? Math.max(...list.map((m) => m.id)) + 1 : 1;
    const newMilestone: Milestone = {
      id: newId,
      projectId: Number(projectId),
      name: data.name || 'Key Milestone Task',
      description: data.description || '',
      plannedStartDate: data.plannedStartDate || new Date().toISOString().split('T')[0],
      plannedEndDate: data.plannedEndDate || '2025-12-31',
      weightagePercentage: Number(data.weightagePercentage || data.weightage) || 20,
      plannedProgress: Number(data.plannedProgress) || 0,
      actualProgress: Number(data.actualProgress) || 0,
      status: (data.status as any) || 'IN_PROGRESS',
      responsibleOfficer: data.responsibleOfficer || 'Executive Engineer',
      overdue: false,
      delayDays: 0,
      createdAt: new Date().toISOString()
    };
    list.push(newMilestone);
    saveStorage(STORAGE_KEYS.MILESTONES, list);
    return newMilestone;
  },

  updateMilestone: async (milestoneId: number, data: Partial<Milestone>): Promise<Milestone> => {
    const list: Milestone[] = loadStorage(STORAGE_KEYS.MILESTONES, INITIAL_MILESTONES);
    const idx = list.findIndex((m) => m.id === Number(milestoneId));
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...data, updatedAt: new Date().toISOString() };
      saveStorage(STORAGE_KEYS.MILESTONES, list);
      return list[idx];
    }
    return data as Milestone;
  },

  // FINANCIALS
  getFinancials: async (projectId: number): Promise<FinancialRecord[]> => {
    const list: FinancialRecord[] = loadStorage(STORAGE_KEYS.FINANCIALS, INITIAL_FINANCIALS);
    return list.filter((f) => f.projectId === Number(projectId));
  },

  addFinancialRecord: async (projectId: number, data: Partial<FinancialRecord>): Promise<FinancialRecord> => {
    const list: FinancialRecord[] = loadStorage(STORAGE_KEYS.FINANCIALS, INITIAL_FINANCIALS);
    const newId = list.length > 0 ? Math.max(...list.map((f) => f.id)) + 1 : 1;
    const newRecord: FinancialRecord = {
      id: newId,
      projectId: Number(projectId),
      fiscalYear: data.fiscalYear || 'FY 2024-25',
      recordMonth: data.recordMonth || 'Nov 2024',
      plannedExpenditure: Number(data.plannedExpenditure) || 50.0,
      actualExpenditure: Number(data.actualExpenditure) || 48.0,
      committedExpenditure: Number(data.committedExpenditure) || 60.0,
      cumulativeExpenditure: Number(data.cumulativeExpenditure) || 500.0,
      costVariance: Number(data.costVariance) || 2.0,
      cpiAtRecord: Number(data.cpiAtRecord) || 1.0,
      remarks: data.remarks || 'Monthly milestone expenditure reconciled.',
      recordedBy: 'Finance Wing',
      createdAt: new Date().toISOString()
    };
    list.push(newRecord);
    saveStorage(STORAGE_KEYS.FINANCIALS, list);
    return newRecord;
  },

  // RISK EXPLANATION
  getRiskExplanation: async (projectId: number): Promise<MLExplainResponse> => {
    const p = await mockApiAdapter.getProjectById(projectId);
    return {
      project_id: String(p.id),
      risk_level: p.riskLevel,
      risk_probability: p.aiRiskProbability || (p.riskLevel === 'CRITICAL' ? 0.94 : p.riskLevel === 'HIGH' ? 0.78 : 0.2),
      delay_probability: p.riskLevel === 'CRITICAL' ? 0.92 : 0.35,
      predicted_delay_days: p.aiPredictedDelayDays || (p.riskLevel === 'CRITICAL' ? 95 : p.riskLevel === 'HIGH' ? 45 : 0),
      ai_summary: p.aiExplanationSummary || `Automated AI risk assessment computed based on EVM velocity, contractor milestone compliance, and geospatial delay factors.`,
      top_contributing_factors: [
        `Schedule Performance Index (SPI: ${p.spi}) relative to approved Master Baseline`,
        `Cost Performance Index (CPI: ${p.cpi}) and budget variance trajectory`,
        `Geotechnical / Land acquisition clearance status`,
        `Unresolved active alerts count`
      ],
      feature_contributions: [
        {
          feature: 'Schedule Performance Index (SPI)',
          impact: p.spi < 0.9 ? 0.42 : -0.2,
          direction: p.spi < 0.9 ? 'RISK_INCREASING' : 'RISK_DECREASING',
          description: `Current SPI of ${p.spi} indicates milestone delivery velocity.`
        },
        {
          feature: 'Cost Variance & Overrun Velocity',
          impact: p.cpi < 0.9 ? 0.35 : -0.15,
          direction: p.cpi < 0.9 ? 'RISK_INCREASING' : 'RISK_DECREASING',
          description: `CPI of ${p.cpi} indicates financial expenditure efficiency.`
        },
        {
          feature: 'Active Field Issues & Obstructions',
          impact: (p.openIssuesCount || 0) > 0 ? 0.25 : -0.1,
          direction: (p.openIssuesCount || 0) > 0 ? 'RISK_INCREASING' : 'RISK_DECREASING',
          description: `${p.openIssuesCount || 0} active issues requiring inter-ministerial resolution.`
        }
      ]
    };
  },

  recalculateRisk: async (projectId: number): Promise<Project> => {
    return mockApiAdapter.getProjectById(projectId);
  },

  // ALERTS
  getAlerts: async (filters?: any): Promise<Alert[]> => {
    let list: Alert[] = loadStorage(STORAGE_KEYS.ALERTS, INITIAL_ALERTS);
    if (filters) {
      if (filters.status && filters.status !== 'ALL') {
        list = list.filter((a) => a.status === filters.status);
      }
      if (filters.severity && filters.severity !== 'ALL') {
        list = list.filter((a) => a.severity === filters.severity);
      }
      if (filters.projectId) {
        list = list.filter((a) => a.projectId === Number(filters.projectId));
      }
    }
    return list;
  },

  acknowledgeAlert: async (id: number): Promise<Alert> => {
    const list: Alert[] = loadStorage(STORAGE_KEYS.ALERTS, INITIAL_ALERTS);
    const idx = list.findIndex((a) => a.id === Number(id));
    if (idx !== -1) {
      list[idx] = {
        ...list[idx],
        status: 'ACKNOWLEDGED',
        acknowledgedBy: 'Current User',
        acknowledgedAt: new Date().toISOString()
      };
      saveStorage(STORAGE_KEYS.ALERTS, list);
      return list[idx];
    }
    return list[0];
  },

  resolveAlert: async (id: number, resolutionNotes?: string): Promise<Alert> => {
    const list: Alert[] = loadStorage(STORAGE_KEYS.ALERTS, INITIAL_ALERTS);
    const idx = list.findIndex((a) => a.id === Number(id));
    if (idx !== -1) {
      list[idx] = {
        ...list[idx],
        status: 'RESOLVED',
        resolutionNotes: resolutionNotes || 'Investigated and resolved by project team',
        resolvedBy: 'Current User',
        resolvedAt: new Date().toISOString()
      };
      saveStorage(STORAGE_KEYS.ALERTS, list);
      return list[idx];
    }
    return list[0];
  },

  escalateAlert: async (id: number, reason?: string): Promise<Alert> => {
    const list: Alert[] = loadStorage(STORAGE_KEYS.ALERTS, INITIAL_ALERTS);
    const idx = list.findIndex((a) => a.id === Number(id));
    if (idx !== -1) {
      const currentLvl = Number(list[idx].escalationLevel) || 0;
      const newLvl = Math.min(2, currentLvl + 1);
      list[idx] = {
        ...list[idx],
        status: 'TRIGGERED',
        escalationLevel: newLvl,
        lastEscalatedAt: new Date().toISOString(),
        message: `${list[idx].message} [Manual Escalation to L${newLvl}: ${reason || 'Command Center escalation'}]`
      };
      saveStorage(STORAGE_KEYS.ALERTS, list);
      return list[idx];
    }
    return list[0];
  },

  // ISSUES
  getIssues: async (filters?: any): Promise<Issue[]> => {
    let list: Issue[] = loadStorage(STORAGE_KEYS.ISSUES, INITIAL_ISSUES);
    if (filters) {
      if (filters.status && filters.status !== 'ALL') {
        list = list.filter((i) => i.status === filters.status);
      }
      if (filters.priority && filters.priority !== 'ALL') {
        list = list.filter((i) => (i.priority || i.severity) === filters.priority);
      }
      if (filters.category && filters.category !== 'ALL') {
        list = list.filter((i) => i.category === filters.category);
      }
      if (filters.projectId) {
        list = list.filter((i) => i.projectId === Number(filters.projectId));
      }
    }
    return list;
  },

  getIssueById: async (id: number): Promise<Issue> => {
    const list: Issue[] = loadStorage(STORAGE_KEYS.ISSUES, INITIAL_ISSUES);
    const item = list.find((i) => i.id === Number(id));
    return item || list[0];
  },

  createIssue: async (data: any): Promise<Issue> => {
    const list: Issue[] = loadStorage(STORAGE_KEYS.ISSUES, INITIAL_ISSUES);
    const newId = list.length > 0 ? Math.max(...list.map((i) => i.id)) + 1 : 1;
    const newIssue: Issue = {
      id: newId,
      projectId: Number(data.projectId) || 20,
      projectName: data.projectName || 'Infrastructure Project',
      projectCode: data.projectCode || 'PRG-DEMO',
      ministry: data.ministry || 'Ministry of Railways',
      title: data.title || 'New Field Bottleneck',
      description: data.description || 'Description of field issue',
      category: data.category || 'TECHNICAL',
      priority: data.priority || data.severity || 'HIGH',
      severity: data.severity || data.priority || 'HIGH',
      status: 'OPEN',
      assignedTo: data.assignedTo || 'Project Director',
      assignedToName: data.assignedToName || data.assignedTo || 'Project Director',
      reportedBy: data.reportedBy || 'Field Officer',
      costImpactCr: Number(data.costImpactCr) || 0,
      scheduleImpactDays: Number(data.scheduleImpactDays) || 0,
      createdAt: new Date().toISOString(),
      comments: []
    };
    list.unshift(newIssue);
    saveStorage(STORAGE_KEYS.ISSUES, list);
    return newIssue;
  },

  updateIssue: async (id: number, data: Partial<Issue>): Promise<Issue> => {
    const list: Issue[] = loadStorage(STORAGE_KEYS.ISSUES, INITIAL_ISSUES);
    const idx = list.findIndex((i) => i.id === Number(id));
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...data, updatedAt: new Date().toISOString() };
      saveStorage(STORAGE_KEYS.ISSUES, list);
      return list[idx];
    }
    return data as Issue;
  },

  resolveIssue: async (id: number, resolution?: string): Promise<Issue> => {
    const list: Issue[] = loadStorage(STORAGE_KEYS.ISSUES, INITIAL_ISSUES);
    const idx = list.findIndex((i) => i.id === Number(id));
    if (idx !== -1) {
      list[idx] = {
        ...list[idx],
        status: 'RESOLVED',
        resolution: resolution || 'Issue cleared by project authority',
        resolvedAt: new Date().toISOString()
      };
      saveStorage(STORAGE_KEYS.ISSUES, list);
      return list[idx];
    }
    return list[0];
  },

  addComment: async (issueId: number, content: string): Promise<any> => {
    const list: Issue[] = loadStorage(STORAGE_KEYS.ISSUES, INITIAL_ISSUES);
    const idx = list.findIndex((i) => i.id === Number(issueId));
    const newComment = {
      id: Date.now(),
      authorName: 'Current User',
      authorRole: 'Officer',
      content,
      createdAt: new Date().toISOString()
    };
    if (idx !== -1) {
      list[idx].comments = [...(list[idx].comments || []), newComment];
      saveStorage(STORAGE_KEYS.ISSUES, list);
    }
    return newComment;
  },

  // DASHBOARD
  getPortfolioSummary: async (filters?: any): Promise<PortfolioSummary> => {
    const projects = await mockApiAdapter.getProjects(filters);
    const alerts: Alert[] = loadStorage(STORAGE_KEYS.ALERTS, INITIAL_ALERTS);
    const issues: Issue[] = loadStorage(STORAGE_KEYS.ISSUES, INITIAL_ISSUES);

    const totalApprovedBudget = projects.reduce((acc, p) => acc + (p.approvedCost || p.projectBudget || 0), 0);
    const totalActualExpenditure = projects.reduce((acc, p) => acc + (p.actualCost || 0), 0);
    const totalPlannedCost = projects.reduce((acc, p) => acc + (p.plannedCost || 0), 0);
    const totalEarnedValue = projects.reduce((acc, p) => acc + (p.earnedValue || 0), 0);

    const avgPhysical = projects.length > 0 ? projects.reduce((acc, p) => acc + p.physicalProgress, 0) / projects.length : 0;
    const avgPlanned = projects.length > 0 ? projects.reduce((acc, p) => acc + p.plannedProgress, 0) / projects.length : 0;
    const avgSpi = projects.length > 0 ? projects.reduce((acc, p) => acc + p.spi, 0) / projects.length : 1.0;
    const avgCpi = projects.length > 0 ? projects.reduce((acc, p) => acc + p.cpi, 0) / projects.length : 1.0;

    return {
      totalProjects: projects.length,
      totalApprovedBudget: Number(totalApprovedBudget.toFixed(1)),
      totalActualExpenditure: Number(totalActualExpenditure.toFixed(1)),
      totalPlannedCost: Number(totalPlannedCost.toFixed(1)),
      totalEarnedValue: Number(totalEarnedValue.toFixed(1)),
      averagePhysicalProgress: Number(avgPhysical.toFixed(1)),
      averagePlannedProgress: Number(avgPlanned.toFixed(1)),
      averageSpi: Number(avgSpi.toFixed(2)),
      averageCpi: Number(avgCpi.toFixed(2)),
      onTrackProjects: projects.filter((p) => p.currentStatus === 'IN_PROGRESS' || p.currentStatus === 'COMPLETED').length,
      delayedProjects: projects.filter((p) => p.currentStatus === 'DELAYED').length,
      completedProjects: projects.filter((p) => p.currentStatus === 'COMPLETED').length,
      lowRiskCount: projects.filter((p) => p.riskLevel === 'LOW').length,
      mediumRiskCount: projects.filter((p) => p.riskLevel === 'MEDIUM').length,
      highRiskCount: projects.filter((p) => p.riskLevel === 'HIGH').length,
      criticalRiskCount: projects.filter((p) => p.riskLevel === 'CRITICAL').length,
      openIssuesCount: issues.filter((i) => i.status !== 'RESOLVED' && i.status !== 'CLOSED').length,
      criticalIssuesCount: issues.filter((i) => (i.priority === 'CRITICAL' || i.severity === 'CRITICAL') && i.status !== 'RESOLVED').length,
      unresolvedAlertsCount: alerts.filter((a) => a.status !== 'RESOLVED').length,
      activeAnomaliesCount: INITIAL_ANOMALIES.filter((an) => an.status !== 'RESOLVED').length
    };
  },

  getRiskDistribution: async (filters?: any): Promise<RiskDistribution> => {
    const projects = await mockApiAdapter.getProjects(filters);
    return {
      low: projects.filter((p) => p.riskLevel === 'LOW').length,
      medium: projects.filter((p) => p.riskLevel === 'MEDIUM').length,
      high: projects.filter((p) => p.riskLevel === 'HIGH').length,
      critical: projects.filter((p) => p.riskLevel === 'CRITICAL').length
    };
  },

  getMinistryStats: async (): Promise<MinistryStat[]> => {
    const projects = await mockApiAdapter.getProjects();
    const map = new Map<string, { totalProjects: number; totalBudget: number; totalExpenditure: number; sumProgress: number; highRiskCount: number }>();

    for (const p of projects) {
      const entry = map.get(p.ministry) || { totalProjects: 0, totalBudget: 0, totalExpenditure: 0, sumProgress: 0, highRiskCount: 0 };
      entry.totalProjects += 1;
      entry.totalBudget += p.approvedCost || p.projectBudget || 0;
      entry.totalExpenditure += p.actualCost || 0;
      entry.sumProgress += p.physicalProgress || 0;
      if (p.riskLevel === 'HIGH' || p.riskLevel === 'CRITICAL') {
        entry.highRiskCount += 1;
      }
      map.set(p.ministry, entry);
    }

    return Array.from(map.entries()).map(([ministry, stat]) => ({
      ministry,
      totalProjects: stat.totalProjects,
      totalBudget: Number(stat.totalBudget.toFixed(1)),
      totalExpenditure: Number(stat.totalExpenditure.toFixed(1)),
      avgProgress: Number((stat.sumProgress / stat.totalProjects).toFixed(1)),
      highRiskCount: stat.highRiskCount
    }));
  },

  getSectorStats: async (): Promise<SectorStat[]> => {
    const projects = await mockApiAdapter.getProjects();
    const map = new Map<string, { count: number; totalBudget: number; sumProgress: number }>();

    for (const p of projects) {
      const entry = map.get(p.sector) || { count: 0, totalBudget: 0, sumProgress: 0 };
      entry.count += 1;
      entry.totalBudget += p.approvedCost || p.projectBudget || 0;
      entry.sumProgress += p.physicalProgress || 0;
      map.set(p.sector, entry);
    }

    return Array.from(map.entries()).map(([sector, stat]) => ({
      sector,
      count: stat.count,
      totalBudget: Number(stat.totalBudget.toFixed(1)),
      avgProgress: Number((stat.sumProgress / stat.count).toFixed(1))
    }));
  },

  getTrends: async (_projectId?: number): Promise<any[]> => {
    return MOCK_TRENDS;
  },

  getTopRiskProjects: async (limit = 10): Promise<TopRiskProject[]> => {
    const projects = await mockApiAdapter.getProjects();
    const riskOrder = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
    const sorted = [...projects].sort((a, b) => {
      const scoreA = (riskOrder[a.riskLevel] || 0) * 100 + (100 - a.healthScore);
      const scoreB = (riskOrder[b.riskLevel] || 0) * 100 + (100 - b.healthScore);
      return scoreB - scoreA;
    });

    return sorted.slice(0, limit).map((p) => ({
      id: p.id,
      projectCode: p.projectCode,
      projectName: p.projectName,
      ministry: p.ministry,
      state: p.state,
      riskLevel: p.riskLevel,
      healthScore: p.healthScore,
      spi: p.spi,
      cpi: p.cpi,
      physicalProgress: p.physicalProgress,
      aiPredictedDelayDays: p.aiPredictedDelayDays || 0,
      topRiskFactor: p.aiExplanationSummary || 'Schedule divergence and milestone delay'
    }));
  },

  // AUDIT & NOTIFICATIONS
  getAuditLogs: async (params?: any): Promise<AuditLogItem[]> => {
    let list: AuditLogItem[] = loadStorage(STORAGE_KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS);
    if (params?.action) {
      list = list.filter((l) => l.action.toLowerCase().includes(params.action.toLowerCase()));
    }
    return list;
  },

  getNotifications: async (): Promise<NotificationItem[]> => {
    return loadStorage(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
  },

  getUnreadCount: async (): Promise<number> => {
    const list: NotificationItem[] = loadStorage(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    return list.filter((n) => !n.isRead).length;
  },

  markAsRead: async (id: number): Promise<void> => {
    const list: NotificationItem[] = loadStorage(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    const idx = list.findIndex((n) => n.id === Number(id));
    if (idx !== -1) {
      list[idx].isRead = true;
      saveStorage(STORAGE_KEYS.NOTIFICATIONS, list);
    }
  },

  markAllAsRead: async (): Promise<void> => {
    const list: NotificationItem[] = loadStorage(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    list.forEach((n) => (n.isRead = true));
    saveStorage(STORAGE_KEYS.NOTIFICATIONS, list);
  },

  // SETTINGS
  getSettings: async (): Promise<SystemSettings> => {
    return loadStorage(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
  },

  updateSettings: async (settings: SystemSettings): Promise<void> => {
    saveStorage(STORAGE_KEYS.SETTINGS, settings);
  },

  // REPORTS
  generateReport: async (params: any): Promise<ReportSummaryResponse> => {
    const projects = await mockApiAdapter.getProjects(params);
    const summary = await mockApiAdapter.getPortfolioSummary(params);
    return {
      reportType: params.reportType || 'EXECUTIVE_SUMMARY',
      generatedAt: new Date().toISOString(),
      generatedBy: 'Current Officer (IAS)',
      filtersApplied: params || {},
      summary,
      projects
    };
  }
};
