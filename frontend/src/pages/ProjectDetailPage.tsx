import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Building2, 
  MapPin, 
  Calendar, 
  IndianRupee, 
  Activity, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  FileText, 
  MessageSquare, 
  Layers, 
  ArrowLeft,
  Plus,
  TrendingUp,
  RefreshCw,
  UploadCloud,
  ChevronRight,
  ShieldCheck,
  Send,
  AlertCircle
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  CartesianGrid 
} from 'recharts';
import { projectsApi } from '../api/projectsApi';
import { issuesApi } from '../api/issuesApi';
import { alertsApi } from '../api/alertsApi';
import { 
  Project, 
  Milestone, 
  FinancialRecord, 
  Issue, 
  Alert, 
  MLExplainResponse, 
  DocumentItem, 
  AuditLogItem 
} from '../types';
import { RiskBadge, StatusBadge, EscalationBadge, SeverityBadge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import { useAuth } from '../context/AuthContext';

export const ProjectDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const projectId = Number(id);
  const navigate = useNavigate();
  const { user, isViewer } = useAuth();

  const [project, setProject] = useState<Project | null>(null);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [financials, setFinancials] = useState<FinancialRecord[]>([]);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [aiExplanation, setAiExplanation] = useState<MLExplainResponse | null>(null);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Tab State (10+ tabs)
  const [activeTab, setActiveTab] = useState<
    'overview' | 'evm' | 'milestones' | 'financials' | 'issues' | 'ai' | 'alerts' | 'map' | 'documents' | 'audit'
  >('overview');

  // Modals
  const [isProgressModalOpen, setIsProgressModalOpen] = useState<boolean>(false);
  const [isMilestoneModalOpen, setIsMilestoneModalOpen] = useState<boolean>(false);
  const [isFinancialModalOpen, setIsFinancialModalOpen] = useState<boolean>(false);
  const [isIssueModalOpen, setIsIssueModalOpen] = useState<boolean>(false);
  const [isResolveIssueModalOpen, setIsResolveIssueModalOpen] = useState<boolean>(false);
  const [isResolveAlertModalOpen, setIsResolveAlertModalOpen] = useState<boolean>(false);
  const [selectedAlertId, setSelectedAlertId] = useState<number | null>(null);
  const [alertResolutionNotes, setAlertResolutionNotes] = useState<string>('');
  const [selectedIssueId, setSelectedIssueId] = useState<number | null>(null);
  const [newComment, setNewComment] = useState<string>('');

  // Form states
  const [progressForm, setProgressForm] = useState({
    physicalProgress: 0,
    plannedProgress: 0,
    actualCost: 0,
    remarks: '',
  });

  const [milestoneForm, setMilestoneForm] = useState({
    name: '',
    description: '',
    plannedStartDate: '',
    plannedEndDate: '',
    weightagePercentage: 20,
    responsibleOfficer: '',
  });

  const [financialForm, setFinancialForm] = useState({
    fiscalYear: '2024-25',
    recordMonth: '2025-03',
    plannedExpenditure: 0,
    actualExpenditure: 0,
    remarks: '',
  });

  const [issueForm, setIssueForm] = useState({
    title: '',
    description: '',
    category: 'LAND',
    priority: 'HIGH',
    assignedTo: '',
    dueDate: '',
    actionRequired: '',
  });

  const [resolutionText, setResolutionText] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [recalculatingAi, setRecalculatingAi] = useState<boolean>(false);

  const fetchProjectData = async () => {
    if (!projectId) return;
    setLoading(true);
    try {
      const [projData, mileData, finData, issueData, alertData, docData] = await Promise.all([
        projectsApi.getProjectById(projectId),
        projectsApi.getMilestones(projectId),
        projectsApi.getFinancials(projectId),
        issuesApi.getIssues({ projectId }),
        alertsApi.getAlerts({ projectId }),
        projectsApi.getDocuments(projectId),
      ]);

      setProject(projData);
      setMilestones(mileData);
      setFinancials(finData);
      setIssues(issueData);
      setAlerts(alertData);
      setDocuments(docData);

      setProgressForm({
        physicalProgress: projData.physicalProgress,
        plannedProgress: projData.plannedProgress,
        actualCost: projData.actualCost,
        remarks: '',
      });

      // Load AI Explanation
      try {
        const aiData = await projectsApi.getRiskExplanation(projectId);
        setAiExplanation(aiData);
      } catch (e) {
        console.error('Failed to load AI explanation', e);
      }
    } catch (err) {
      console.error('Failed to load project details', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectData();
  }, [projectId]);

  // Handle Progress Update (National Core Pipeline)
  const handleProgressUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const updated = await projectsApi.updateProgress(projectId, progressForm);
      setProject(updated);
      setIsProgressModalOpen(false);
      // Refresh all project tabs
      fetchProjectData();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  // Trigger manual AI recalculate
  const handleRecalculateAi = async () => {
    setRecalculatingAi(true);
    try {
      const updated = await projectsApi.recalculateRisk(projectId);
      setProject(updated);
      const aiData = await projectsApi.getRiskExplanation(projectId);
      setAiExplanation(aiData);
    } catch (err) {
      console.error(err);
    } finally {
      setRecalculatingAi(false);
    }
  };

  // Add Milestone
  const handleAddMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await projectsApi.createMilestone(projectId, milestoneForm as any);
      setIsMilestoneModalOpen(false);
      const list = await projectsApi.getMilestones(projectId);
      setMilestones(list);
    } finally {
      setSubmitting(false);
    }
  };

  // Add Financial Entry
  const handleAddFinancial = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await projectsApi.addFinancialRecord(projectId, financialForm);
      setIsFinancialModalOpen(false);
      fetchProjectData();
    } finally {
      setSubmitting(false);
    }
  };

  // Create Issue
  const handleCreateIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await issuesApi.createIssue({ ...issueForm, projectId } as any);
      setIsIssueModalOpen(false);
      const list = await issuesApi.getIssues({ projectId });
      setIssues(list);
    } finally {
      setSubmitting(false);
    }
  };

  // Resolve Issue
  const handleResolveIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIssueId) return;
    setSubmitting(true);
    try {
      await issuesApi.resolveIssue(selectedIssueId, resolutionText);
      setIsResolveIssueModalOpen(false);
      const list = await issuesApi.getIssues({ projectId });
      setIssues(list);
    } finally {
      setSubmitting(false);
    }
  };

  // Add Comment to issue
  const handleAddComment = async (issueId: number) => {
    if (!newComment.trim()) return;
    try {
      await issuesApi.addComment(issueId, newComment);
      setNewComment('');
      const list = await issuesApi.getIssues({ projectId });
      setIssues(list);
    } catch (e) {
      console.error(e);
    }
  };

  // Acknowledge Alert
  const handleAcknowledgeAlert = async (alertId: number) => {
    try {
      await alertsApi.acknowledgeAlert(alertId);
      const list = await alertsApi.getAlerts({ projectId });
      setAlerts(list);
    } catch (e) {
      console.error(e);
    }
  };

  // Resolve Alert
  const handleResolveAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAlertId) return;
    setSubmitting(true);
    try {
      await alertsApi.resolveAlert(selectedAlertId, alertResolutionNotes || 'Alert resolved via project dashboard');
      setIsResolveAlertModalOpen(false);
      setAlertResolutionNotes('');
      const list = await alertsApi.getAlerts({ projectId });
      setAlerts(list);
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  // Escalate Alert
  const handleEscalateAlert = async (alertId: number) => {
    try {
      await alertsApi.escalateAlert(alertId, 'Urgent escalation requested via management dashboard');
      const list = await alertsApi.getAlerts({ projectId });
      setAlerts(list);
    } catch (e) {
      console.error(e);
    }
  };

  if (loading || !project) {
    return <LoadingSpinner message="Fetching live project analytics & EVM parameters..." />;
  }

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'evm', label: 'EVM Performance' },
    { id: 'milestones', label: `Milestones (${milestones.length})` },
    { id: 'financials', label: 'Financials' },
    { id: 'issues', label: `Issues (${issues.length})` },
    { id: 'ai', label: 'AI Risk & SHAP' },
    { id: 'alerts', label: `Alerts (${alerts.length})` },
    { id: 'map', label: 'GIS Location' },
    { id: 'documents', label: `Documents (${documents.length})` },
  ];

  return (
    <div className="space-y-6">
      {/* Top Breadcrumbs & Back Button */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/projects')}
          className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>Projects</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span>{project.sector}</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-blue-400 font-bold">{project.projectCode}</span>
          </div>
        </div>
      </div>

      {/* Hero Project Header Card */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800/80 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-extrabold px-2.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 tracking-wider">
                {project.projectCode}
              </span>
              <StatusBadge status={project.currentStatus} />
              <RiskBadge risk={project.riskLevel} />
              <span className="text-xs text-slate-400">
                Last updated {new Date(project.lastUpdated).toLocaleDateString('en-IN')}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {project.projectName}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300">
              <span className="flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-slate-400" />
                {project.ministry}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-slate-400" />
                {project.district}, {project.state}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-slate-400" />
                {project.startDate} to {project.plannedEndDate}
              </span>
            </div>
          </div>

          {/* Right Metrics: Health Score Gauge & Actions */}
          <div className="flex items-center gap-4 self-start lg:self-center">
            {/* Health Score Circular Badge */}
            <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-700/80 text-center min-w-[100px] shadow-lg">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Health Score</p>
              <p className={`text-3xl font-black mt-0.5 ${
                project.healthScore < 40 ? 'text-rose-400' : project.healthScore < 60 ? 'text-orange-400' : 'text-emerald-400'
              }`}>
                {project.healthScore}
                <span className="text-xs text-slate-500 font-semibold">/100</span>
              </p>
            </div>

            {!isViewer && (
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => setIsProgressModalOpen(true)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition-all"
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>Update Progress</span>
                </button>
                <button
                  onClick={handleRecalculateAi}
                  disabled={recalculatingAi}
                  className="px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${recalculatingAi ? 'animate-spin' : ''}`} />
                  <span>AI Risk Check</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="flex items-center gap-1.5 mt-6 pt-4 border-t border-slate-800 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* TAB CONTENT AREA */}

      {/* 1. OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* EVM Top Summary Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="glass-card p-4 rounded-xl border border-slate-800">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Schedule Index (SPI)</p>
              <p className={`text-2xl font-black mt-1 ${project.spi < 0.85 ? 'text-rose-400' : 'text-emerald-400'}`}>
                {project.spi}
              </p>
              <p className="text-[10px] text-slate-400 mt-1">
                {project.spi < 1.0 ? `${((1.0 - project.spi) * 100).toFixed(1)}% behind plan` : 'On / Ahead of Schedule'}
              </p>
            </div>

            <div className="glass-card p-4 rounded-xl border border-slate-800">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Cost Index (CPI)</p>
              <p className={`text-2xl font-black mt-1 ${project.cpi < 0.85 ? 'text-rose-400' : 'text-emerald-400'}`}>
                {project.cpi}
              </p>
              <p className="text-[10px] text-slate-400 mt-1">
                {project.cpi < 1.0 ? `${((1.0 - project.cpi) * 100).toFixed(1)}% cost variance` : 'Within Budget Allocation'}
              </p>
            </div>

            <div className="glass-card p-4 rounded-xl border border-slate-800">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Approved Budget</p>
              <p className="text-2xl font-black text-white mt-1">₹{project.projectBudget} Cr</p>
              <p className="text-[10px] text-slate-400 mt-1">Spent: ₹{project.actualCost} Cr ({project.financialProgress}%)</p>
            </div>

            <div className="glass-card p-4 rounded-xl border border-slate-800">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Physical Progress</p>
              <p className="text-2xl font-black text-blue-400 mt-1">{project.physicalProgress}%</p>
              <p className="text-[10px] text-slate-400 mt-1">Planned Target: {project.plannedProgress}%</p>
            </div>
          </div>

          {/* AI Insights Banner */}
          {aiExplanation && (
            <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-950/40 via-purple-950/30 to-slate-900 border border-blue-500/30 flex items-start gap-4">
              <div className="p-2.5 rounded-xl bg-blue-500/20 text-blue-400 shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-white">AI Real-Time Risk Intelligence</h4>
                  <RiskBadge risk={aiExplanation.risk_level} />
                  <span className="text-xs font-bold text-rose-300 bg-rose-950/60 px-2 py-0.5 rounded border border-rose-800/40">
                    Est. Delay: +{aiExplanation.predicted_delay_days} days
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{aiExplanation.ai_summary}</p>
              </div>
            </div>
          )}

          {/* Project Details Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-2">
                Executive Metadata & Scope
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                {project.projectDescription || 'No description recorded.'}
              </p>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-500 font-semibold block">Scheme</span>
                  <span className="text-slate-200 font-medium">{project.scheme || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-semibold block">Implementing Agency</span>
                  <span className="text-slate-200 font-medium">{project.implementingAgency || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-semibold block">Primary Contractor</span>
                  <span className="text-slate-200 font-medium">{project.contractor || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-semibold block">Project Manager</span>
                  <span className="text-slate-200 font-medium">{project.projectManager || 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Critical Open Issues & Alerts */}
            <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h3 className="text-sm font-bold text-white">Active Alerts & Critical Blockers</h3>
                <span className="text-xs text-slate-400">{alerts.length} alerts • {issues.length} issues</span>
              </div>

              <div className="space-y-2.5 max-h-56 overflow-y-auto">
                {alerts.length === 0 && issues.length === 0 ? (
                  <p className="text-xs text-slate-400">No active alerts or critical blockers recorded.</p>
                ) : (
                  alerts.slice(0, 3).map((a) => (
                    <div key={a.id} className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start gap-3">
                      <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      <div className="flex-1 overflow-hidden">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-bold text-white">{a.alertType}</span>
                          <EscalationBadge level={a.escalationLevel} />
                        </div>
                        <p className="text-[11px] text-slate-300 mt-1 line-clamp-1">{a.message}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. EVM PERFORMANCE TAB */}
      {activeTab === 'evm' && (
        <div className="space-y-6">
          <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white">Earned Value Management (EVM) Core Parameters</h3>
            <p className="text-xs text-slate-400">
              Standardized ISO/Government project management formulas computed automatically on each field update
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-xs text-blue-400 font-bold">Planned Value (PV)</span>
                <p className="text-2xl font-black text-white mt-1">₹{project.plannedCost} Cr</p>
                <p className="text-[11px] text-slate-400 mt-1">PV = (Planned Progress % / 100) × Budget</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-xs text-emerald-400 font-bold">Earned Value (EV)</span>
                <p className="text-2xl font-black text-white mt-1">₹{project.earnedValue} Cr</p>
                <p className="text-[11px] text-slate-400 mt-1">EV = (Physical Progress % / 100) × Budget</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-xs text-amber-400 font-bold">Actual Cost (AC)</span>
                <p className="text-2xl font-black text-white mt-1">₹{project.actualCost} Cr</p>
                <p className="text-[11px] text-slate-400 mt-1">Cumulative real expenditure incurred</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300">Schedule Variance (SV = EV - PV)</span>
                  <span className={`text-sm font-black ${project.scheduleVariance < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                    ₹{project.scheduleVariance} Cr
                  </span>
                </div>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800">
                  <span className="text-xs font-bold text-slate-300">Schedule Index (SPI = EV / PV)</span>
                  <span className={`text-base font-black ${project.spi < 0.85 ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {project.spi}
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300">Cost Variance (CV = EV - AC)</span>
                  <span className={`text-sm font-black ${project.costVariance < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                    ₹{project.costVariance} Cr
                  </span>
                </div>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800">
                  <span className="text-xs font-bold text-slate-300">Cost Index (CPI = EV / AC)</span>
                  <span className={`text-base font-black ${project.cpi < 0.85 ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {project.cpi}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. MILESTONES TAB */}
      {activeTab === 'milestones' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-white">Project Work Breakdown & Milestone Delivery</h3>
            {!isViewer && (
              <button
                onClick={() => setIsMilestoneModalOpen(true)}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Milestone</span>
              </button>
            )}
          </div>

          <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden divide-y divide-slate-800">
            {milestones.map((m) => (
              <div key={m.id} className="p-4 space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-slate-100">{m.name}</h4>
                      <StatusBadge status={m.status} />
                      {m.overdue && (
                        <span className="text-[10px] font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                          OVERDUE
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">{m.description}</p>
                  </div>
                  <span className="text-xs font-bold text-slate-300">Weight: {m.weightagePercentage}%</span>
                </div>

                <div className="flex items-center gap-4 text-[11px] text-slate-400">
                  <span>Target: {m.plannedStartDate} to {m.plannedEndDate}</span>
                  <span>Responsible: {m.responsibleOfficer || 'N/A'}</span>
                  <span>Progress: <strong className="text-blue-400">{m.actualProgress}%</strong></span>
                </div>

                <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: `${m.actualProgress}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. FINANCIALS TAB */}
      {activeTab === 'financials' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-white">Monthly Expenditure Records</h3>
            {!isViewer && (
              <button
                onClick={() => setIsFinancialModalOpen(true)}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Expenditure Entry</span>
              </button>
            )}
          </div>

          {financials.length > 0 && (
            <div className="glass-card p-5 rounded-2xl border border-slate-800">
              <h4 className="text-xs font-bold text-slate-300 mb-3">Planned vs Actual Monthly Expenditure (₹ Cr)</h4>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={financials}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="recordMonth" stroke="#64748b" fontSize={11} />
                    <YAxis stroke="#64748b" fontSize={11} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }}
                      itemStyle={{ color: '#fff' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                    <Bar dataKey="plannedExpenditure" name="Planned Spend" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="actualExpenditure" name="Actual Spend" fill="#10B981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 text-slate-400 border-b border-slate-800 font-semibold uppercase text-[10px]">
                <tr>
                  <th className="px-4 py-3">Month</th>
                  <th className="px-4 py-3">Planned (Cr)</th>
                  <th className="px-4 py-3">Actual (Cr)</th>
                  <th className="px-4 py-3">Cumulative (Cr)</th>
                  <th className="px-4 py-3">Variance</th>
                  <th className="px-4 py-3">CPI</th>
                  <th className="px-4 py-3">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {financials.map((f) => (
                  <tr key={f.id} className="hover:bg-slate-800/40">
                    <td className="px-4 py-3 font-bold text-slate-200">{f.recordMonth}</td>
                    <td className="px-4 py-3 text-slate-300">₹{f.plannedExpenditure}</td>
                    <td className="px-4 py-3 font-semibold text-emerald-400">₹{f.actualExpenditure}</td>
                    <td className="px-4 py-3 text-slate-300">₹{f.cumulativeExpenditure}</td>
                    <td className={`px-4 py-3 font-bold ${f.costVariance < 0 ? 'text-rose-400' : 'text-slate-300'}`}>
                      ₹{f.costVariance}
                    </td>
                    <td className="px-4 py-3 text-slate-200 font-semibold">{f.cpiAtRecord}</td>
                    <td className="px-4 py-3 text-slate-400 max-w-xs truncate">{f.remarks || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. ISSUES TAB */}
      {activeTab === 'issues' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-white">Issues & Field Roadblocks</h3>
            {!isViewer && (
              <button
                onClick={() => setIsIssueModalOpen(true)}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Report Issue</span>
              </button>
            )}
          </div>

          <div className="space-y-3">
            {issues.length === 0 ? (
              <EmptyState title="No Issues Reported" description="Project currently has zero reported blockers." />
            ) : (
              issues.map((i) => (
                <div key={i.id} className="glass-card p-4 rounded-2xl border border-slate-800 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <SeverityBadge severity={i.priority} />
                        <span className="text-xs font-bold text-blue-400">{i.category}</span>
                        <StatusBadge status={i.status} />
                      </div>
                      <h4 className="text-sm font-bold text-white mt-1.5">{i.title}</h4>
                      <p className="text-xs text-slate-300 mt-0.5">{i.description}</p>
                    </div>

                    {i.status !== 'RESOLVED' && !isViewer && (
                      <button
                        onClick={() => {
                          setSelectedIssueId(i.id);
                          setIsResolveIssueModalOpen(true);
                        }}
                        className="px-3 py-1 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs font-bold transition-colors"
                      >
                        Resolve Issue
                      </button>
                    )}
                  </div>

                  {i.actionRequired && (
                    <div className="p-2.5 rounded-xl bg-slate-900 text-xs text-amber-300 border border-amber-500/20">
                      <strong>Action Required:</strong> {i.actionRequired}
                    </div>
                  )}

                  {i.resolution && (
                    <div className="p-2.5 rounded-xl bg-emerald-950/40 text-xs text-emerald-300 border border-emerald-500/30">
                      <strong>Resolution:</strong> {i.resolution} (Resolved on {i.resolvedDate})
                    </div>
                  )}

                  {/* Comments thread */}
                  <div className="pt-2 border-t border-slate-800 space-y-2">
                    {i.comments && i.comments.length > 0 && (
                      <div className="space-y-1.5 max-h-40 overflow-y-auto">
                        {i.comments.map((c) => (
                          <div key={c.id} className="p-2 rounded-lg bg-slate-900/60 text-xs text-slate-300">
                            <span className="font-bold text-blue-300">{c.authorName}:</span> {c.content}
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex gap-2 pt-1">
                      <input
                        type="text"
                        placeholder="Add discussion comment..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        className="flex-1 bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                      />
                      <button
                        onClick={() => handleAddComment(i.id)}
                        className="p-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 6. AI RISK & SHAP EXPLANATION TAB */}
      {activeTab === 'ai' && aiExplanation && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-950/40 via-purple-950/30 to-slate-900 border border-purple-500/30 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Sparkles className="w-6 h-6 text-purple-400" />
                <div>
                  <h3 className="text-base font-bold text-white">XGBoost & SHAP Explainable AI Analysis</h3>
                  <p className="text-xs text-slate-400">Trained on 3,500+ synthetic infrastructure projects dataset</p>
                </div>
              </div>
              <RiskBadge risk={aiExplanation.risk_level} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
                <span className="text-xs text-slate-400 font-bold uppercase">Risk Probability</span>
                <p className="text-2xl font-black text-purple-400 mt-1">
                  {(aiExplanation.risk_probability * 100).toFixed(0)}%
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
                <span className="text-xs text-slate-400 font-bold uppercase">Predicted Delay</span>
                <p className="text-2xl font-black text-rose-400 mt-1">
                  +{aiExplanation.predicted_delay_days} Days
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
                <span className="text-xs text-slate-400 font-bold uppercase">Delay Probability</span>
                <p className="text-2xl font-black text-amber-400 mt-1">
                  {(aiExplanation.delay_probability * 100).toFixed(0)}%
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-200 bg-slate-900/60 p-3.5 rounded-xl border border-slate-800 leading-relaxed">
              {aiExplanation.ai_summary}
            </p>
          </div>

          {/* SHAP Feature Contribution Ranking */}
          <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-3">
            <h4 className="text-sm font-bold text-white">SHAP Factor Attribution (Why AI predicted this risk level)</h4>
            <div className="space-y-2">
              {aiExplanation.feature_contributions?.map((fc, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className={`w-2 h-2 rounded-full ${fc.direction === 'RISK_INCREASING' ? 'bg-rose-400' : 'bg-emerald-400'}`} />
                    <span className="text-xs font-semibold text-slate-200">{fc.description}</span>
                  </div>
                  <span className={`text-xs font-bold ${fc.direction === 'RISK_INCREASING' ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {fc.impact > 0 ? `+${fc.impact}` : fc.impact}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 7. ALERTS TAB & 2-LEVEL ESCALATION */}
      {activeTab === 'alerts' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-white">Automated Alerts & 2-Level Escalation Timeline</h3>
          </div>

          <div className="space-y-3">
            {alerts.length === 0 ? (
              <EmptyState title="No Active Alerts" description="Project performance is currently within normal thresholds." />
            ) : (
              alerts.map((a) => (
                <div key={a.id} className="glass-card p-5 rounded-2xl border border-slate-800 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <SeverityBadge severity={a.severity} />
                      <span className="text-sm font-bold text-white">{a.alertType}</span>
                      <EscalationBadge level={a.escalationLevel} />
                    </div>
                    <span className="text-xs text-slate-400 font-medium">
                      Triggered {new Date(a.createdAt).toLocaleString('en-IN')}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300">{a.message}</p>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
                    <span className="text-slate-400">Assigned: <strong className="text-slate-200">{a.assignedTo || 'Officer'}</strong></span>

                    <div className="flex items-center gap-2">
                      {a.status === 'NEW' && !isViewer && (
                        <button
                          onClick={() => handleAcknowledgeAlert(a.id)}
                          className="px-2.5 py-1 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 rounded-lg text-xs font-semibold"
                        >
                          Acknowledge
                        </button>
                      )}

                      {a.status !== 'RESOLVED' && !String(a.escalationLevel).includes('APEX') && !String(a.escalationLevel).includes('2') && !isViewer && (
                        <button
                          onClick={() => handleEscalateAlert(a.id)}
                          className="px-2.5 py-1 bg-orange-600/20 hover:bg-orange-600/30 text-orange-300 border border-orange-500/30 rounded-lg text-xs font-semibold"
                        >
                          Escalate Up
                        </button>
                      )}

                      {a.status !== 'RESOLVED' && !isViewer && (
                        <button
                          onClick={() => {
                            setSelectedAlertId(a.id);
                            setIsResolveAlertModalOpen(true);
                          }}
                          className="px-2.5 py-1 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 rounded-lg text-xs font-semibold"
                        >
                          Resolve Alert
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Escalation History Timeline */}
                  {a.escalationHistory && a.escalationHistory.length > 0 && (
                    <div className="p-3 rounded-xl bg-slate-900 border border-purple-500/20 space-y-1.5">
                      <p className="text-[10px] font-bold text-purple-300 uppercase tracking-wider">Escalation Audit Trail</p>
                      {a.escalationHistory.map((h) => (
                        <div key={h.id} className="text-[11px] text-slate-300 flex items-center justify-between">
                          <span>Level {h.fromLevel} → Level {h.toLevel} to <strong>{h.escalatedToRole}</strong> ({h.escalationReason})</span>
                          <span className="text-[10px] text-slate-500">{new Date(h.escalatedAt).toLocaleTimeString('en-IN')}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 8. GIS MAP TAB */}
      {activeTab === 'map' && (
        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <MapPin className="w-4 h-4 text-rose-400" />
              GIS Coordinates: {project.latitude}, {project.longitude}
            </h3>
            <span className="text-xs text-slate-400">{project.location || project.district}</span>
          </div>

          <div className="h-80 rounded-xl overflow-hidden border border-slate-700 bg-slate-900 flex flex-col items-center justify-center p-6 text-center">
            <MapPin className="w-10 h-10 text-rose-400 animate-bounce mb-2" />
            <h4 className="text-base font-bold text-white">{project.projectName}</h4>
            <p className="text-xs text-slate-400 max-w-md mt-1">
              Geocoded at Lat {project.latitude}° N, Lng {project.longitude}° E ({project.state}). Use the global GIS India Map module for full pan-India multi-layer exploration.
            </p>
            <button
              onClick={() => navigate('/map')}
              className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-lg"
            >
              Open Full-Screen GIS Map
            </button>
          </div>
        </div>
      )}

      {/* 9. DOCUMENTS TAB */}
      {activeTab === 'documents' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-white">Project DPR, Tenders & Technical Approvals</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {documents.map((doc) => (
              <div key={doc.id} className="glass-card p-4 rounded-xl border border-slate-800 flex items-start gap-3">
                <FileText className="w-8 h-8 text-blue-400 shrink-0 mt-0.5" />
                <div className="overflow-hidden">
                  <h4 className="text-xs font-bold text-white truncate">{doc.title}</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">{doc.documentType} • Uploaded by {doc.uploadedBy}</p>
                  <a
                    href={doc.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-blue-400 hover:text-blue-300 font-semibold mt-2 inline-block"
                  >
                    View Document →
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PROGRESS UPDATE MODAL */}
      <Modal
        isOpen={isProgressModalOpen}
        onClose={() => setIsProgressModalOpen(false)}
        title="Field Progress & Expenditure Submission"
        subtitle="Recalculates EVM SPI/CPI, Health Score, Anomaly Engine, ML Risk, and Alert Escalations"
        maxWidth="lg"
      >
        <form onSubmit={handleProgressUpdate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Actual Physical Progress % (0 - 100) *
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="100"
              required
              value={progressForm.physicalProgress}
              onChange={(e) => setProgressForm({ ...progressForm, physicalProgress: parseFloat(e.target.value) || 0 })}
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Planned Physical Progress Target %
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="100"
              value={progressForm.plannedProgress}
              onChange={(e) => setProgressForm({ ...progressForm, plannedProgress: parseFloat(e.target.value) || 0 })}
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Cumulative Actual Cost (₹ Crores)
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              value={progressForm.actualCost}
              onChange={(e) => setProgressForm({ ...progressForm, actualCost: parseFloat(e.target.value) || 0 })}
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Site Inspection Remarks
            </label>
            <textarea
              rows={3}
              value={progressForm.remarks}
              onChange={(e) => setProgressForm({ ...progressForm, remarks: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsProgressModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-semibold text-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white shadow-lg"
            >
              {submitting ? 'Executing Pipeline...' : 'Submit & Execute Workflow'}
            </button>
          </div>
        </form>
      </Modal>

      {/* CREATE ISSUE MODAL */}
      <Modal
        isOpen={isIssueModalOpen}
        onClose={() => setIsIssueModalOpen(false)}
        title="Report Field Issue / Blocker"
        subtitle="Log issue to assign responsible authority and track resolution action"
        maxWidth="lg"
      >
        <form onSubmit={handleCreateIssue} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Issue Title *</label>
            <input
              type="text"
              required
              value={issueForm.title}
              onChange={(e) => setIssueForm({ ...issueForm, title: e.target.value })}
              placeholder="e.g. Forest clearance delay for 12 km stretch"
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
              <select
                value={issueForm.category}
                onChange={(e) => setIssueForm({ ...issueForm, category: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white"
              >
                <option value="LAND">Land Acquisition</option>
                <option value="FINANCE">Finance / Cashflow</option>
                <option value="CONTRACTOR">Contractor</option>
                <option value="APPROVAL">Statutory Approval</option>
                <option value="PROCUREMENT">Procurement</option>
                <option value="TECHNICAL">Technical / Design</option>
                <option value="ENVIRONMENT">Environmental</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Priority</label>
              <select
                value={issueForm.priority}
                onChange={(e) => setIssueForm({ ...issueForm, priority: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Description *</label>
            <textarea
              rows={3}
              required
              value={issueForm.description}
              onChange={(e) => setIssueForm({ ...issueForm, description: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Action Required</label>
            <input
              type="text"
              value={issueForm.actionRequired}
              onChange={(e) => setIssueForm({ ...issueForm, actionRequired: e.target.value })}
              placeholder="e.g. Joint site inspection with DFO"
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsIssueModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-semibold text-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white"
            >
              {submitting ? 'Logging Issue...' : 'Log Issue'}
            </button>
          </div>
        </form>
      </Modal>

      {/* RESOLVE ALERT MODAL */}
      <Modal
        isOpen={isResolveAlertModalOpen}
        onClose={() => setIsResolveAlertModalOpen(false)}
        title="Resolve Anomaly Alert"
        subtitle="Provide resolution actions taken to mitigate this anomaly"
        maxWidth="md"
      >
        <form onSubmit={handleResolveAlert} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Resolution Summary *</label>
            <textarea
              rows={4}
              required
              value={alertResolutionNotes}
              onChange={(e) => setAlertResolutionNotes(e.target.value)}
              placeholder="Detail the corrective actions taken (e.g. Additional equipment mobilized, revised schedule approved)..."
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsResolveAlertModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-semibold text-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white shadow-lg shadow-emerald-900/30"
            >
              {submitting ? 'Resolving...' : 'Confirm Resolution'}
            </button>
          </div>
        </form>
      </Modal>

      {/* RESOLVE ISSUE MODAL */}
      <Modal
        isOpen={isResolveIssueModalOpen}
        onClose={() => setIsResolveIssueModalOpen(false)}
        title="Resolve Issue"
        subtitle="Document root-cause mitigation and resolution actions"
        maxWidth="md"
      >
        <form onSubmit={handleResolveIssue} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Resolution Summary *</label>
            <textarea
              rows={4}
              required
              value={resolutionText}
              onChange={(e) => setResolutionText(e.target.value)}
              placeholder="e.g. Clearance granted by State Board following joint survey. Work resumed on Section 3."
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsResolveIssueModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-semibold text-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white shadow-lg"
            >
              Mark Resolved
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
