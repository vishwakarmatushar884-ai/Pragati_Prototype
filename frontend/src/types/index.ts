export type RoleName = 
  | 'ROLE_SUPER_ADMIN' 
  | 'ROLE_MINISTRY_ADMIN' 
  | 'ROLE_PROJECT_MANAGER' 
  | 'ROLE_FIELD_OFFICER' 
  | 'ROLE_AUDITOR' 
  | 'ROLE_VIEWER';

export interface User {
  id: number;
  email: string;
  fullName: string;
  designation?: string;
  ministry?: string;
  department?: string;
  phoneNumber?: string;
  roles: string[];
  role?: string;
}

export interface AuthResponse {
  token: string;
  type: string;
  id: number;
  email: string;
  fullName: string;
  designation: string;
  ministry: string;
  department: string;
  roles: string[];
}

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type ProjectStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'DELAYED' | 'ON_HOLD' | 'COMPLETED';
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface Project {
  id: number;
  projectCode: string;
  code?: string;
  projectName: string;
  name?: string;
  ministry: string;
  department?: string;
  scheme?: string;
  sector: string;
  projectDescription?: string;
  projectManager?: string;
  implementingAgency?: string;
  contractor?: string;
  state: string;
  district?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  startDate: string;
  plannedEndDate: string;
  revisedEndDate?: string;
  actualCompletionDate?: string;
  projectBudget: number;
  budgetCr?: number;
  approvedCost: number;
  plannedCost: number;
  actualCost: number;
  spentCr?: number;
  earnedValue: number;
  physicalProgress: number;
  plannedProgress: number;
  financialProgress: number;
  spi: number;
  cpi: number;
  scheduleVariance: number;
  costVariance: number;
  currentStatus: ProjectStatus;
  priority: Priority;
  riskLevel: RiskLevel;
  healthScore: number;
  aiRiskProbability?: number;
  aiPredictedDelayDays?: number;
  predictedDelayMonths?: number;
  aiExplanationSummary?: string;
  managerId?: number;
  fieldOfficerId?: number;
  createdAt: string;
  lastUpdated: string;
  openIssuesCount?: number;
  criticalIssuesCount?: number;
  overdueMilestonesCount?: number;
  activeAlertsCount?: number;
}

export type ProjectSummaryDTO = Project;

export type MilestoneStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'DELAYED' | 'COMPLETED';

export interface Milestone {
  id: number;
  projectId: number;
  projectName?: string;
  name: string;
  description?: string;
  plannedStartDate: string;
  plannedEndDate: string;
  actualStartDate?: string;
  actualEndDate?: string;
  weightagePercentage: number;
  weightage?: number;
  plannedProgress: number;
  actualProgress: number;
  status: MilestoneStatus;
  responsibleOfficer?: string;
  overdue: boolean;
  delayDays?: number;
  createdAt: string;
  updatedAt?: string;
}

export type MilestoneDTO = Milestone;

export interface FinancialRecord {
  id: number;
  projectId: number;
  projectName?: string;
  fiscalYear: string;
  recordMonth: string;
  plannedExpenditure: number;
  actualExpenditure: number;
  committedExpenditure: number;
  cumulativeExpenditure: number;
  costVariance: number;
  cpiAtRecord: number;
  remarks?: string;
  recordedBy?: string;
  createdAt: string;
}

export type FinancialRecordDTO = FinancialRecord;

export type IssueCategory = 
  | 'LAND' 
  | 'FINANCE' 
  | 'CONTRACTOR' 
  | 'APPROVAL' 
  | 'PROCUREMENT' 
  | 'TECHNICAL' 
  | 'ENVIRONMENT' 
  | 'RESOURCE' 
  | 'LEGAL' 
  | 'LAND_ACQUISITION'
  | 'ENVIRONMENTAL_CLEARANCE'
  | 'CONTRACTOR_DISPUTE'
  | 'FINANCIAL_DELAY'
  | 'SUPPLY_CHAIN'
  | 'REGULATORY'
  | 'WEATHER'
  | 'OTHER';

export type IssuePriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type IssueStatus = 'OPEN' | 'ASSIGNED' | 'IN_PROGRESS' | 'BLOCKED' | 'UNDER_REVIEW' | 'RESOLVED' | 'CLOSED';

export interface IssueComment {
  id: number;
  authorName: string;
  authorRole: string;
  comment?: string;
  content?: string;
  createdAt: string;
}

export type IssueCommentDTO = IssueComment;

export interface Issue {
  id: number;
  projectId: number;
  projectName: string;
  projectCode: string;
  ministry?: string;
  title: string;
  description: string;
  category: IssueCategory | string;
  priority?: IssuePriority | string;
  severity?: string;
  status: IssueStatus | string;
  assignedTo?: string;
  assignedToName?: string;
  assignedToEmail?: string;
  reportedBy?: string;
  createdByName?: string;
  dueDate?: string;
  resolvedDate?: string;
  resolvedAt?: string;
  actionRequired?: string;
  resolution?: string;
  resolutionNotes?: string;
  costImpactCr?: number;
  scheduleImpactDays?: number;
  comments?: IssueComment[];
  createdAt: string;
  updatedAt?: string;
}

export type IssueDTO = Issue;

export type AlertSeverity = 'INFO' | 'WARNING' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type AlertStatus = 'NEW' | 'TRIGGERED' | 'ACKNOWLEDGED' | 'IN_PROGRESS' | 'RESOLVED' | 'ESCALATED';

export interface EscalationHistory {
  id: number;
  fromLevel: number | string;
  toLevel: number | string;
  escalationReason?: string;
  reason?: string;
  escalatedToRole?: string;
  escalatedToUser?: string;
  escalatedByName?: string;
  acknowledged?: boolean;
  escalatedAt: string;
}

export type EscalationHistoryDTO = EscalationHistory;

export interface Alert {
  id: number;
  projectId: number;
  projectName: string;
  projectCode: string;
  ministry?: string;
  alertType?: string;
  anomalyType?: string;
  title: string;
  severity: AlertSeverity | string;
  message: string;
  assignedTo?: string;
  status: AlertStatus | string;
  escalationLevel: number | string;
  acknowledgedAt?: string;
  acknowledgedBy?: string;
  acknowledgedByName?: string;
  resolvedAt?: string;
  resolvedBy?: string;
  resolvedByName?: string;
  lastEscalatedAt?: string;
  triggeredAt?: string;
  resolutionNotes?: string;
  createdAt: string;
  escalationHistories?: EscalationHistory[];
  escalationHistory?: EscalationHistory[];
}

export type AlertDTO = Alert;

export type AnomalySeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type AnomalyStatus = 'DETECTED' | 'INVESTIGATING' | 'RESOLVED' | 'DISMISSED';

export interface Anomaly {
  id: number;
  projectId: number;
  projectName?: string;
  projectCode?: string;
  ministry?: string;
  anomalyType: string;
  description: string;
  severity: AnomalySeverity;
  status: AnomalyStatus;
  detectedAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
  resolutionNotes?: string;
}

export interface PortfolioSummary {
  totalProjects: number;
  totalApprovedBudget: number;
  totalActualExpenditure: number;
  totalPlannedCost: number;
  totalEarnedValue: number;
  averagePhysicalProgress: number;
  averagePlannedProgress: number;
  averageSpi: number;
  averageCpi: number;
  onTrackProjects: number;
  delayedProjects: number;
  completedProjects: number;
  lowRiskCount: number;
  mediumRiskCount: number;
  highRiskCount: number;
  criticalRiskCount: number;
  openIssuesCount: number;
  criticalIssuesCount: number;
  unresolvedAlertsCount: number;
  activeAnomaliesCount: number;
}

export interface RiskDistribution {
  low: number;
  medium: number;
  high: number;
  critical: number;
}

export interface MinistryStat {
  ministry: string;
  totalProjects: number;
  totalBudget: number;
  totalExpenditure: number;
  avgProgress: number;
  highRiskCount: number;
}

export interface SectorStat {
  sector: string;
  count: number;
  totalBudget: number;
  avgProgress: number;
}

export interface MonthlyTrendItem {
  month: string;
  plannedProgress: number;
  actualProgress: number;
  plannedSpend: number;
  actualSpend: number;
  spi: number;
  cpi: number;
}

export interface TopRiskProject {
  id: number;
  projectCode: string;
  projectName: string;
  ministry: string;
  state: string;
  riskLevel: RiskLevel;
  healthScore: number;
  spi: number;
  cpi: number;
  physicalProgress: number;
  aiPredictedDelayDays: number;
  topRiskFactor: string;
}

export interface FeatureContribution {
  feature: string;
  value?: any;
  impact: number;
  direction: 'RISK_INCREASING' | 'RISK_DECREASING' | 'INCREASES_RISK' | 'DECREASES_RISK';
  description: string;
}

export interface MLExplainResponse {
  project_id?: string;
  risk_level: RiskLevel;
  risk_probability: number;
  delay_probability: number;
  predicted_delay_days: number;
  ai_summary: string;
  top_contributing_factors: string[];
  feature_contributions: FeatureContribution[];
}

export type MLExplainResponseDTO = MLExplainResponse;
export type MLRiskPredictionDTO = MLExplainResponse;

export interface NotificationItem {
  id: number;
  recipientUser: string;
  title: string;
  message: string;
  type: string;
  relatedProjectId?: number;
  relatedEntityId?: number;
  severity: string;
  isRead: boolean;
  createdAt: string;
}

export interface AuditLogItem {
  id: number;
  userEmail: string;
  userName?: string;
  userRole?: string;
  action: string;
  entityType?: string;
  entityName?: string;
  entityId?: number;
  oldValue?: string;
  newValue?: string;
  details?: string;
  description?: string;
  ipAddress?: string;
  timestamp: string;
}

export type AuditLogDTO = AuditLogItem;

export interface DocumentItem {
  id: number;
  projectId: number;
  projectName?: string;
  title: string;
  documentType: string;
  fileUrl: string;
  fileSize?: number;
  uploadedBy: string;
  uploadedAt: string;
}

export interface SystemSettings {
  thresholds?: Record<string, string>;
  weights?: Record<string, number>;
  general?: Record<string, string>;
  [key: string]: any;
}

export interface ExecutiveReportDTO {
  totalProjects: number;
  totalBudget: number;
  totalExpenditure: number;
  avgSpi: number;
  avgCpi: number;
  criticalProjectsCount: number;
  projects?: Project[];
  [key: string]: any;
}
