import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Filter, 
  Grid, 
  List, 
  IndianRupee, 
  TrendingUp, 
  ExternalLink, 
  AlertTriangle,
  RefreshCw,
  Clock,
  Building2,
  MapPin,
  Sparkles,
  UploadCloud
} from 'lucide-react';
import { projectsApi } from '../api/projectsApi';
import { Project, RiskLevel } from '../types';
import { RiskBadge, StatusBadge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import { useAuth } from '../context/AuthContext';

export const ProjectsPage: React.FC = () => {
  const navigate = useNavigate();
  const { isViewer, isFieldOfficer, user } = useAuth();

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedMinistry, setSelectedMinistry] = useState<string>('');
  const [selectedState, setSelectedState] = useState<string>('');
  const [selectedSector, setSelectedSector] = useState<string>('');
  const [selectedRisk, setSelectedRisk] = useState<string>('');

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState<boolean>(false);
  const [selectedProjectForUpdate, setSelectedProjectForUpdate] = useState<Project | null>(null);

  // Form states for New Project
  const [createForm, setCreateForm] = useState({
    projectCode: '',
    projectName: '',
    ministry: 'Ministry of Road Transport and Highways',
    department: 'Department of Highways',
    scheme: 'Bharatmala Pariyojana',
    sector: 'Highways',
    projectDescription: '',
    projectManager: 'Vikramaditya Rao, PD',
    implementingAgency: 'NHAI',
    contractor: 'L&T Infrastructure',
    state: 'Madhya Pradesh',
    district: 'Bhopal',
    location: 'Bhopal Bypass Section-IV',
    latitude: 23.2599,
    longitude: 77.4126,
    startDate: '2024-01-15',
    plannedEndDate: '2025-12-31',
    projectBudget: 1200.0,
    priority: 'HIGH',
  });

  // Form states for Progress Update
  const [updateForm, setUpdateForm] = useState({
    physicalProgress: 0,
    plannedProgress: 0,
    actualCost: 0,
    remarks: '',
  });

  const [formError, setFormError] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const data = await projectsApi.getProjects({
        ministry: selectedMinistry || undefined,
        state: selectedState || undefined,
        sector: selectedSector || undefined,
        riskLevel: selectedRisk || undefined,
        query: searchQuery || undefined,
      });
      setProjects(data);
    } catch (err) {
      console.error('Failed to fetch projects', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [selectedMinistry, selectedState, selectedSector, selectedRisk, searchQuery]);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);
    try {
      await projectsApi.createProject(createForm as any);
      setIsCreateModalOpen(false);
      fetchProjects();
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to create project. Please verify inputs.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleProgressUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjectForUpdate) return;
    setFormError('');
    setSubmitting(true);
    try {
      await projectsApi.updateProgress(selectedProjectForUpdate.id, updateForm);
      setIsUpdateModalOpen(false);
      fetchProjects();
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to update progress.');
    } finally {
      setSubmitting(false);
    }
  };

  const openProgressModal = (project: Project, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedProjectForUpdate(project);
    setUpdateForm({
      physicalProgress: project.physicalProgress,
      plannedProgress: project.plannedProgress,
      actualCost: project.actualCost,
      remarks: '',
    });
    setIsUpdateModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-white tracking-tight">Centralized Projects Hub</h1>
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
              {projects.length} Total Projects
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Browse, filter, and inspect detailed performance analytics across all national infrastructure works
          </p>
        </div>

        <div className="flex items-center gap-2">
          {!isViewer && (
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-blue-600/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Project</span>
            </button>
          )}

          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs ${
                viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs ${
                viewMode === 'table' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800/80">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search code, name, district..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <select
            value={selectedSector}
            onChange={(e) => setSelectedSector(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
          >
            <option value="">All Sectors</option>
            <option value="Highways">Highways</option>
            <option value="Railways">Railways</option>
            <option value="Water Supply">Water Supply</option>
            <option value="Power">Power</option>
            <option value="Urban Development">Urban Development</option>
            <option value="Healthcare">Healthcare</option>
            <option value="Education">Education</option>
            <option value="Rural Development">Rural Development</option>
            <option value="Irrigation">Irrigation</option>
            <option value="Digital Infrastructure">Digital Infrastructure</option>
          </select>

          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
          >
            <option value="">All States</option>
            <option value="Madhya Pradesh">Madhya Pradesh</option>
            <option value="Uttar Pradesh">Uttar Pradesh</option>
            <option value="Rajasthan">Rajasthan</option>
            <option value="Maharashtra">Maharashtra</option>
            <option value="Gujarat">Gujarat</option>
            <option value="Karnataka">Karnataka</option>
            <option value="Tamil Nadu">Tamil Nadu</option>
            <option value="Bihar">Bihar</option>
            <option value="Odisha">Odisha</option>
            <option value="Assam">Assam</option>
          </select>

          <select
            value={selectedRisk}
            onChange={(e) => setSelectedRisk(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
          >
            <option value="">All Risk Levels</option>
            <option value="LOW">Low Risk</option>
            <option value="MEDIUM">Medium Risk</option>
            <option value="HIGH">High Risk</option>
            <option value="CRITICAL">Critical Risk</option>
          </select>

          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedMinistry('');
              setSelectedState('');
              setSelectedSector('');
              setSelectedRisk('');
            }}
            className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-xs font-semibold text-slate-300 transition-colors"
          >
            Reset Filters
          </button>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : projects.length === 0 ? (
        <EmptyState
          title="No Projects Match Selection"
          description="Try broadening your filter criteria or search keyword."
          action={
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedState('');
                setSelectedSector('');
                setSelectedRisk('');
              }}
              className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold"
            >
              Clear All Filters
            </button>
          }
        />
      ) : viewMode === 'grid' ? (
        /* Grid View Cards */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((p) => (
            <div
              key={p.id}
              onClick={() => navigate(`/projects/${p.id}`)}
              className="glass-card rounded-2xl p-5 border border-slate-800/80 hover:border-slate-600 hover:shadow-2xl transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div>
                {/* Card Top: Code & Badges */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-slate-900 text-blue-400 border border-slate-800 tracking-wider">
                    {p.projectCode}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <StatusBadge status={p.currentStatus} />
                    <RiskBadge risk={p.riskLevel} />
                  </div>
                </div>

                {/* Project Title */}
                <h3 className="text-base font-bold text-slate-100 group-hover:text-blue-400 transition-colors line-clamp-1">
                  {p.projectName}
                </h3>
                <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-1">
                  <Building2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span className="truncate">{p.ministry}</span>
                </p>
                <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span>{p.district}, {p.state}</span>
                </p>

                {/* Performance & EVM Metrics Chips */}
                <div className="grid grid-cols-4 gap-2 my-4 pt-3 border-t border-slate-800/80 text-center">
                  <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800">
                    <p className="text-[9px] uppercase font-bold text-slate-500">SPI</p>
                    <p className={`text-xs font-black ${p.spi < 0.85 ? 'text-rose-400' : 'text-slate-200'}`}>
                      {p.spi}
                    </p>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800">
                    <p className="text-[9px] uppercase font-bold text-slate-500">CPI</p>
                    <p className={`text-xs font-black ${p.cpi < 0.85 ? 'text-rose-400' : 'text-slate-200'}`}>
                      {p.cpi}
                    </p>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800">
                    <p className="text-[9px] uppercase font-bold text-slate-500">Budget</p>
                    <p className="text-xs font-black text-slate-200">₹{p.projectBudget}Cr</p>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800">
                    <p className="text-[9px] uppercase font-bold text-slate-500">Health</p>
                    <p className={`text-xs font-black ${
                      p.healthScore < 40 ? 'text-rose-400' : p.healthScore < 60 ? 'text-orange-400' : 'text-emerald-400'
                    }`}>
                      {p.healthScore}
                    </p>
                  </div>
                </div>

                {/* Progress Bars */}
                <div className="space-y-2 mb-4">
                  <div>
                    <div className="flex justify-between text-[11px] font-semibold text-slate-300 mb-1">
                      <span>Physical Progress</span>
                      <span>{p.physicalProgress}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: `${p.physicalProgress}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                      <span>Financial Spend</span>
                      <span>₹{p.actualCost} Cr ({p.financialProgress}%)</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${p.financialProgress}%` }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                {!isViewer && (
                  <button
                    onClick={(e) => openProgressModal(p, e)}
                    className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-xs font-semibold text-blue-300 transition-colors flex items-center gap-1.5"
                  >
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>Update Progress</span>
                  </button>
                )}

                <button
                  onClick={() => navigate(`/projects/${p.id}`)}
                  className="px-3 py-1.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 text-xs font-semibold flex items-center gap-1 ml-auto"
                >
                  <span>Dashboard</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Table View */
        <div className="glass-card rounded-2xl border border-slate-800/80 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 text-slate-400 border-b border-slate-800 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-5 py-3.5">Code & Project Name</th>
                  <th className="px-4 py-3.5">Sector</th>
                  <th className="px-4 py-3.5">State / Location</th>
                  <th className="px-4 py-3.5">Risk</th>
                  <th className="px-4 py-3.5 text-center">Health</th>
                  <th className="px-4 py-3.5 text-center">SPI / CPI</th>
                  <th className="px-4 py-3.5">Budget / Actual</th>
                  <th className="px-4 py-3.5">Physical %</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {projects.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-5 py-3.5">
                      <p className="font-bold text-slate-100">{p.projectName}</p>
                      <p className="text-[10px] text-slate-400">{p.projectCode}</p>
                    </td>
                    <td className="px-4 py-3.5 text-slate-300 font-medium">{p.sector}</td>
                    <td className="px-4 py-3.5 text-slate-300">
                      <p>{p.state}</p>
                      <p className="text-[10px] text-slate-400">{p.district}</p>
                    </td>
                    <td className="px-4 py-3.5">
                      <RiskBadge risk={p.riskLevel} />
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <span className={`px-2 py-0.5 rounded font-black text-xs ${
                        p.healthScore < 40 ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' :
                        p.healthScore < 60 ? 'bg-orange-500/20 text-orange-300 border border-orange-500/40' :
                        'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      }`}>
                        {p.healthScore}/100
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-center font-semibold text-slate-200">
                      {p.spi} / {p.cpi}
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="font-semibold text-slate-200">₹{p.projectBudget} Cr</p>
                      <p className="text-[10px] text-slate-400">Spend: ₹{p.actualCost} Cr</p>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                          <div className="h-full bg-blue-500 rounded-full" style={{ width: `${p.physicalProgress}%` }} />
                        </div>
                        <span className="font-semibold text-slate-200">{p.physicalProgress}%</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {!isViewer && (
                          <button
                            onClick={(e) => openProgressModal(p, e)}
                            className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-blue-300 text-xs font-medium"
                          >
                            Update
                          </button>
                        )}
                        <button
                          onClick={() => navigate(`/projects/${p.id}`)}
                          className="px-2.5 py-1 rounded bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 text-xs font-semibold"
                        >
                          View
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE PROJECT MODAL */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Register New Infrastructure Project"
        subtitle="Initiate centralized data monitoring for a new government work"
        maxWidth="3xl"
      >
        {formError && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
            {formError}
          </div>
        )}

        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Project Code *</label>
              <input
                type="text"
                required
                value={createForm.projectCode}
                onChange={(e) => setCreateForm({ ...createForm, projectCode: e.target.value })}
                placeholder="e.g. PRG-HWY-2025-009"
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Project Name *</label>
              <input
                type="text"
                required
                value={createForm.projectName}
                onChange={(e) => setCreateForm({ ...createForm, projectName: e.target.value })}
                placeholder="e.g. Jabalpur Ring Road 4-Laning"
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Ministry *</label>
              <input
                type="text"
                required
                value={createForm.ministry}
                onChange={(e) => setCreateForm({ ...createForm, ministry: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Sector *</label>
              <input
                type="text"
                required
                value={createForm.sector}
                onChange={(e) => setCreateForm({ ...createForm, sector: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">State *</label>
              <input
                type="text"
                required
                value={createForm.state}
                onChange={(e) => setCreateForm({ ...createForm, state: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">District</label>
              <input
                type="text"
                value={createForm.district}
                onChange={(e) => setCreateForm({ ...createForm, district: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Approved Budget (₹ Crores) *</label>
              <input
                type="number"
                step="0.1"
                required
                value={createForm.projectBudget}
                onChange={(e) => setCreateForm({ ...createForm, projectBudget: parseFloat(e.target.value) || 0 })}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Priority</label>
              <select
                value={createForm.priority}
                onChange={(e) => setCreateForm({ ...createForm, priority: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Start Date *</label>
              <input
                type="date"
                required
                value={createForm.startDate}
                onChange={(e) => setCreateForm({ ...createForm, startDate: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Planned End Date *</label>
              <input
                type="date"
                required
                value={createForm.plannedEndDate}
                onChange={(e) => setCreateForm({ ...createForm, plannedEndDate: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Latitude</label>
              <input
                type="number"
                step="0.0001"
                value={createForm.latitude}
                onChange={(e) => setCreateForm({ ...createForm, latitude: parseFloat(e.target.value) || 0 })}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Longitude</label>
              <input
                type="number"
                step="0.0001"
                value={createForm.longitude}
                onChange={(e) => setCreateForm({ ...createForm, longitude: parseFloat(e.target.value) || 0 })}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Project Description</label>
            <textarea
              rows={3}
              value={createForm.projectDescription}
              onChange={(e) => setCreateForm({ ...createForm, projectDescription: e.target.value })}
              placeholder="Provide strategic scope, road length, capacity, or targeted beneficiaries..."
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white transition-all shadow-lg shadow-blue-600/20"
            >
              {submitting ? 'Creating...' : 'Register Project'}
            </button>
          </div>
        </form>
      </Modal>

      {/* QUICK PROGRESS UPDATE MODAL (National Demonstration Workflow) */}
      <Modal
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        title={`Field Progress Update: ${selectedProjectForUpdate?.projectCode}`}
        subtitle="Submit verified physical progress & cost. Recalculates EVM, Anomaly, ML Risk, and Alerts in real-time."
        maxWidth="lg"
      >
        {formError && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
            {formError}
          </div>
        )}

        <form onSubmit={handleProgressUpdateSubmit} className="space-y-4">
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1 text-xs">
            <p className="font-bold text-slate-200">{selectedProjectForUpdate?.projectName}</p>
            <p className="text-slate-400">
              Current Recorded Progress: <span className="font-bold text-blue-400">{selectedProjectForUpdate?.physicalProgress}%</span> • Actual Cost: <span className="font-bold text-emerald-400">₹{selectedProjectForUpdate?.actualCost} Cr</span>
            </p>
          </div>

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
              value={updateForm.physicalProgress}
              onChange={(e) => setUpdateForm({ ...updateForm, physicalProgress: parseFloat(e.target.value) || 0 })}
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
              value={updateForm.plannedProgress}
              onChange={(e) => setUpdateForm({ ...updateForm, plannedProgress: parseFloat(e.target.value) || 0 })}
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Cumulative Actual Expenditure (₹ Crores)
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              value={updateForm.actualCost}
              onChange={(e) => setUpdateForm({ ...updateForm, actualCost: parseFloat(e.target.value) || 0 })}
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Field Inspection Remarks & Observations
            </label>
            <textarea
              rows={3}
              value={updateForm.remarks}
              onChange={(e) => setUpdateForm({ ...updateForm, remarks: e.target.value })}
              placeholder="e.g. Culvert foundations poured. Monsoon rain causing slight sub-base slippage..."
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsUpdateModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white transition-all shadow-lg shadow-emerald-600/20"
            >
              {submitting ? 'Recalculating...' : 'Submit & Execute Workflow'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
