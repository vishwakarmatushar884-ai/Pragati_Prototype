import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { issuesApi } from '../api/issuesApi';
import { projectsApi } from '../api/projectsApi';
import { Issue, Project, IssueComment } from '../types';
import Badge from '../components/common/Badge';
import Modal from '../components/common/Modal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import {
  AlertTriangle,
  CheckCircle2,
  Plus,
  Filter,
  Search,
  MessageSquare,
  UserCheck,
  Calendar,
  Send,
  Building2,
  Tag,
  CheckCircle
} from 'lucide-react';

export default function IssuesPage() {
  const { user } = useAuth();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [projectFilter, setProjectFilter] = useState<number | 'ALL'>('ALL');

  // Selected Issue for Detail / Comments Modal
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [commentText, setCommentText] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);

  // Create Issue Modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    projectId: 0,
    title: '',
    description: '',
    category: 'TECHNICAL',
    priority: 'HIGH',
    assignedTo: '',
    actionRequired: '',
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });
  const [createLoading, setCreateLoading] = useState(false);

  // Resolve Modal
  const [resolveModalIssue, setResolveModalIssue] = useState<Issue | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [resolveLoading, setResolveLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [issuesData, projectsData] = await Promise.all([
        issuesApi.getAllIssues(),
        projectsApi.getProjects()
      ]);
      setIssues(issuesData);
      setProjects(projectsData);
      if (projectsData.length > 0 && createForm.projectId === 0) {
        setCreateForm(prev => ({ ...prev, projectId: projectsData[0].id }));
      }
      setError(null);
    } catch (err: any) {
      console.error('Failed to load issues', err);
      setError('Unable to fetch portfolio issues. Please check backend connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.projectId) {
      alert('Please select a project');
      return;
    }
    setCreateLoading(true);
    try {
      await issuesApi.createIssue(createForm as any);
      setIsCreateOpen(false);
      setCreateForm({
        projectId: projects[0]?.id || 0,
        title: '',
        description: '',
        category: 'TECHNICAL',
        priority: 'HIGH',
        assignedTo: '',
        actionRequired: '',
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      });
      await loadData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to register issue.');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIssue || !commentText.trim()) return;
    setCommentLoading(true);
    try {
      const newComment = await issuesApi.addComment(selectedIssue.id, commentText);
      const updatedIssue = {
        ...selectedIssue,
        comments: [...(selectedIssue.comments || []), newComment]
      };
      setSelectedIssue(updatedIssue);
      setIssues(prev => prev.map(item => item.id === selectedIssue.id ? updatedIssue : item));
      setCommentText('');
    } catch (err: any) {
      alert('Failed to post comment.');
    } finally {
      setCommentLoading(false);
    }
  };

  const handleResolveIssue = async () => {
    if (!resolveModalIssue) return;
    setResolveLoading(true);
    try {
      const updated = await issuesApi.resolveIssue(resolveModalIssue.id, resolutionNotes);
      setIssues(prev => prev.map(item => item.id === resolveModalIssue.id ? updated : item));
      if (selectedIssue && selectedIssue.id === resolveModalIssue.id) {
        setSelectedIssue(updated);
      }
      setResolveModalIssue(null);
      setResolutionNotes('');
    } catch (err: any) {
      alert('Failed to resolve issue.');
    } finally {
      setResolveLoading(false);
    }
  };

  const filteredIssues = issues.filter(issue => {
    const title = issue.title || '';
    const projName = issue.projectName || '';
    const desc = issue.description || '';
    const matchesSearch =
      title.toLowerCase().includes(search.toLowerCase()) ||
      projName.toLowerCase().includes(search.toLowerCase()) ||
      desc.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || issue.status === statusFilter;
    const matchesPriority = priorityFilter === 'ALL' || (issue.priority || issue.severity) === priorityFilter;
    const matchesCategory = categoryFilter === 'ALL' || issue.category === categoryFilter;
    const matchesProject = projectFilter === 'ALL' || issue.projectId === projectFilter;
    return matchesSearch && matchesStatus && matchesPriority && matchesCategory && matchesProject;
  });

  const counts = {
    total: issues.length,
    open: issues.filter(i => i.status === 'OPEN').length,
    inProgress: issues.filter(i => i.status === 'IN_PROGRESS' || i.status === 'ASSIGNED').length,
    critical: issues.filter(i => (i.priority === 'CRITICAL' || i.severity === 'CRITICAL') && i.status !== 'RESOLVED' && i.status !== 'CLOSED').length,
    resolved: issues.filter(i => i.status === 'RESOLVED' || i.status === 'CLOSED').length
  };

  const userRole = user?.roles?.[0]?.replace('ROLE_', '') || user?.role || 'VIEWER';
  const canCreate = userRole !== 'VIEWER' && userRole !== 'AUDITOR';
  const canResolve = userRole !== 'VIEWER';

  const categories = [
    { id: 'ALL', label: 'All Categories' },
    { id: 'LAND', label: 'Land Acquisition' },
    { id: 'ENVIRONMENT', label: 'Environmental' },
    { id: 'CONTRACTOR', label: 'Contractor Dispute' },
    { id: 'FINANCE', label: 'Financial Delay' },
    { id: 'APPROVAL', label: 'Inter-Agency Approval' },
    { id: 'PROCUREMENT', label: 'Procurement / Supply' },
    { id: 'TECHNICAL', label: 'Technical / Design' },
    { id: 'RESOURCE', label: 'Resource / Manpower' },
    { id: 'LEGAL', label: 'Legal / Arbitration' },
    { id: 'OTHER', label: 'Other Bottlenecks' }
  ];

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-400 border border-red-900/50">
              Action Pipeline
            </span>
            <span className="text-xs text-slate-400">Live Inter-Ministerial Resolver</span>
          </div>
          <h1 className="text-2xl font-bold text-white mt-1">
            Portfolio Issue Tracker & Resolution Pipeline
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Log bottlenecks, land acquisition hurdles, environmental clearances, and track collaborative resolutions.
          </p>
        </div>

        {canCreate && (
          <button
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-500 text-white text-sm font-semibold rounded-lg shadow-md hover:shadow-lg transition-all"
          >
            <Plus className="w-4 h-4" />
            Raise New Issue
          </button>
        )}
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl shadow-xs">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Issues</p>
          <p className="text-2xl font-bold text-white mt-1">{counts.total}</p>
        </div>
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl shadow-xs">
          <p className="text-xs font-medium text-red-400 uppercase tracking-wider">Critical Unresolved</p>
          <p className="text-2xl font-bold text-red-400 mt-1">{counts.critical}</p>
        </div>
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl shadow-xs">
          <p className="text-xs font-medium text-amber-400 uppercase tracking-wider">Open</p>
          <p className="text-2xl font-bold text-amber-400 mt-1">{counts.open}</p>
        </div>
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl shadow-xs">
          <p className="text-xs font-medium text-blue-400 uppercase tracking-wider">In Progress</p>
          <p className="text-2xl font-bold text-blue-400 mt-1">{counts.inProgress}</p>
        </div>
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl shadow-xs">
          <p className="text-xs font-medium text-emerald-400 uppercase tracking-wider">Resolved</p>
          <p className="text-2xl font-bold text-emerald-400 mt-1">{counts.resolved}</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl shadow-xs space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {/* Search */}
          <div className="relative md:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by title, project, or description..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-950/80 border border-slate-800 rounded-lg text-sm text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-600"
            />
          </div>

          {/* Project Filter */}
          <div>
            <select
              value={projectFilter}
              onChange={e => setProjectFilter(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-950/80 border border-slate-800 rounded-lg text-sm text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-600"
            >
              <option value="ALL">All Projects ({projects.length})</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.projectCode || p.code} - {(p.projectName || p.name || '').slice(0, 24)}...</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950/80 border border-slate-800 rounded-lg text-sm text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-600"
            >
              <option value="ALL">All Statuses</option>
              <option value="OPEN">Open</option>
              <option value="ASSIGNED">Assigned</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="BLOCKED">Blocked</option>
              <option value="RESOLVED">Resolved</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <select
              value={priorityFilter}
              onChange={e => setPriorityFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950/80 border border-slate-800 rounded-lg text-sm text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-600"
            >
              <option value="ALL">All Priorities</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pt-1 text-xs">
          <span className="text-slate-400 font-medium whitespace-nowrap flex items-center gap-1">
            <Filter className="w-3 h-3" /> Category:
          </span>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setCategoryFilter(cat.id)}
              className={`px-2.5 py-1 rounded-full font-medium transition-colors whitespace-nowrap ${
                categoryFilter === cat.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <LoadingSpinner size="lg" text="Loading issue records..." />
        </div>
      ) : error ? (
        <div className="p-4 bg-red-950/40 border border-red-900/50 rounded-xl text-red-400 text-sm">
          {error}
        </div>
      ) : filteredIssues.length === 0 ? (
        <EmptyState
          title="No Issues Match Your Filters"
          description="Try broadening your search criteria or create a new issue for an active project."
          actionText={canCreate ? 'Raise New Issue' : undefined}
          onAction={() => setIsCreateOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {filteredIssues.map(issue => (
            <div
              key={issue.id}
              className={`p-4 bg-slate-900 border rounded-xl shadow-xs hover:shadow-md transition-all ${
                (issue.priority === 'CRITICAL' || issue.severity === 'CRITICAL') && issue.status !== 'RESOLVED'
                  ? 'border-red-900/60 bg-red-950/20'
                  : 'border-slate-800'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                {/* Left: Info */}
                <div className="space-y-1.5 max-w-3xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-slate-400">
                      #{issue.id}
                    </span>
                    <Badge type="severity" value={issue.priority || issue.severity || 'MEDIUM'} />
                    <Badge type="status" value={issue.status} />
                    <span className="text-xs px-2 py-0.5 rounded-md font-medium bg-slate-800 text-slate-300">
                      {String(issue.category).replace(/_/g, ' ')}
                    </span>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Building2 className="w-3 h-3" />
                      <strong className="text-slate-300">{issue.projectCode}</strong> - {issue.projectName}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white">
                    {issue.title}
                  </h3>

                  <p className="text-sm text-slate-300 line-clamp-2">
                    {issue.description || 'No detailed description provided.'}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
                    {(issue.assignedTo || issue.assignedToName) && (
                      <span className="flex items-center gap-1 font-medium text-slate-300">
                        <UserCheck className="w-3.5 h-3.5 text-blue-500" />
                        {issue.assignedTo || issue.assignedToName}
                      </span>
                    )}
                    {issue.dueDate && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        Target: {issue.dueDate}
                      </span>
                    )}
                    <span className="flex items-center gap-1 text-slate-400">
                      <MessageSquare className="w-3 h-3" />
                      {issue.comments?.length || 0} remarks logged
                    </span>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 self-end lg:self-center">
                  <button
                    onClick={() => setSelectedIssue(issue)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    Discussion & Remarks
                  </button>

                  {canResolve && issue.status !== 'RESOLVED' && issue.status !== 'CLOSED' && (
                    <button
                      onClick={() => setResolveModalIssue(issue)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 transition-colors"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Resolve
                    </button>
                  )}
                </div>
              </div>

              {(issue.resolution || issue.resolutionNotes) && (
                <div className="mt-3 p-2.5 bg-emerald-950/30 border border-emerald-900/50 rounded-lg text-xs text-emerald-300">
                  <strong>Resolution:</strong> {issue.resolution || issue.resolutionNotes} {issue.resolvedDate ? `(Resolved on ${issue.resolvedDate})` : ''}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Discussion & Comments Modal */}
      {selectedIssue && (
        <Modal
          isOpen={!!selectedIssue}
          onClose={() => setSelectedIssue(null)}
          title={`Issue #${selectedIssue.id}: ${selectedIssue.title}`}
          size="lg"
        >
          <div className="space-y-4">
            <div className="p-3 bg-slate-950/70 rounded-lg border border-slate-800 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="font-semibold text-slate-300">
                  {selectedIssue.projectCode} - {selectedIssue.projectName}
                </span>
                <div className="flex items-center gap-2">
                  <Badge type="severity" value={selectedIssue.priority || selectedIssue.severity || 'MEDIUM'} />
                  <Badge type="status" value={selectedIssue.status} />
                </div>
              </div>
              <p className="text-xs text-slate-300">
                {selectedIssue.description}
              </p>
              <div className="flex flex-wrap gap-4 text-xs text-slate-400 pt-1 border-t border-slate-800">
                <span>Assigned: <strong>{selectedIssue.assignedTo || selectedIssue.assignedToName || 'Unassigned'}</strong></span>
                <span>Category: <strong>{String(selectedIssue.category).replace(/_/g, ' ')}</strong></span>
                <span>Logged by: <strong>{selectedIssue.reportedBy || selectedIssue.createdByName || 'Officer'}</strong></span>
              </div>
            </div>

            {/* Comments Thread */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Inter-Agency Remarks & Action Log ({selectedIssue.comments?.length || 0})
              </h4>

              <div className="max-h-60 overflow-y-auto space-y-2.5 pr-1">
                {(!selectedIssue.comments || selectedIssue.comments.length === 0) ? (
                  <p className="text-xs text-slate-400 italic py-2">No remarks posted yet.</p>
                ) : (
                  selectedIssue.comments.map((c, idx) => (
                    <div key={c.id || idx} className="p-2.5 bg-slate-800 rounded-lg border border-slate-800 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                          {c.authorName} <span className="text-[10px] text-slate-400 font-normal">({c.authorRole})</span>
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : ''}
                        </span>
                      </div>
                      <p className="text-slate-300 pl-3.5">
                        {c.content || c.comment}
                      </p>
                    </div>
                  ))
                )}
              </div>

              {/* Comment Input */}
              {userRole !== 'VIEWER' && (
                <form onSubmit={handleAddComment} className="flex gap-2 pt-2 border-t border-slate-800">
                  <input
                    type="text"
                    placeholder="Type official remark or resolution progress..."
                    value={commentText}
                    onChange={e => setCommentText(e.target.value)}
                    className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                  />
                  <button
                    type="submit"
                    disabled={commentLoading || !commentText.trim()}
                    className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1 disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Send
                  </button>
                </form>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* Raise New Issue Modal */}
      {isCreateOpen && (
        <Modal
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          title="Raise Inter-Ministerial / Operational Issue"
          size="md"
        >
          <form onSubmit={handleCreateIssue} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Target Project *</label>
              <select
                required
                value={createForm.projectId}
                onChange={e => setCreateForm(prev => ({ ...prev, projectId: Number(e.target.value) }))}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100"
              >
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.projectCode || p.code} - {p.projectName || p.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Issue Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. Forest Clearance pending from MoEFCC for Section 4"
                value={createForm.title}
                onChange={e => setCreateForm(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Category *</label>
                <select
                  value={createForm.category}
                  onChange={e => setCreateForm(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100"
                >
                  <option value="LAND">Land Acquisition</option>
                  <option value="ENVIRONMENT">Environmental Clearance</option>
                  <option value="CONTRACTOR">Contractor Dispute</option>
                  <option value="FINANCE">Financial Delay</option>
                  <option value="APPROVAL">Inter-Agency Approval</option>
                  <option value="PROCUREMENT">Procurement & Supply</option>
                  <option value="TECHNICAL">Technical / Design</option>
                  <option value="RESOURCE">Resource / Manpower</option>
                  <option value="LEGAL">Legal / Arbitration</option>
                  <option value="OTHER">Other Issues</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Priority *</label>
                <select
                  value={createForm.priority}
                  onChange={e => setCreateForm(prev => ({ ...prev, priority: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100"
                >
                  <option value="CRITICAL">Critical (Blocks critical path)</option>
                  <option value="HIGH">High (Major delay expected)</option>
                  <option value="MEDIUM">Medium (Manageable)</option>
                  <option value="LOW">Low (Minor observation)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Description & Root Cause *</label>
              <textarea
                rows={3}
                required
                placeholder="Detail the impediment, authorities involved, and necessary administrative actions..."
                value={createForm.description}
                onChange={e => setCreateForm(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Assigned Officer / Agency</label>
                <input
                  type="text"
                  placeholder="e.g. S. K. Verma (Director)"
                  value={createForm.assignedTo}
                  onChange={e => setCreateForm(prev => ({ ...prev, assignedTo: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Target Resolution Date</label>
                <input
                  type="date"
                  value={createForm.dueDate}
                  onChange={e => setCreateForm(prev => ({ ...prev, dueDate: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-800 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createLoading}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg disabled:opacity-50"
              >
                {createLoading ? 'Submitting...' : 'Register Issue'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Resolve Issue Modal */}
      {resolveModalIssue && (
        <Modal
          isOpen={!!resolveModalIssue}
          onClose={() => setResolveModalIssue(null)}
          title={`Mark Issue #${resolveModalIssue.id} as Resolved`}
          size="sm"
        >
          <div className="space-y-3">
            <p className="text-xs text-slate-300">
              Provide resolution summary, clearance order reference, or mitigating actions taken for audit trail compliance.
            </p>

            <textarea
              rows={3}
              required
              placeholder="e.g. Stage-1 MoEFCC clearance granted vide memo no. FC-2026/89. Work resumed on Section 4."
              value={resolutionNotes}
              onChange={e => setResolutionNotes(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100"
            />

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setResolveModalIssue(null)}
                className="px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-800 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={resolveLoading || !resolutionNotes.trim()}
                onClick={handleResolveIssue}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg disabled:opacity-50"
              >
                {resolveLoading ? 'Resolving...' : 'Confirm Resolution'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
