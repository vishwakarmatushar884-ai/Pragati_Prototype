import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Printer, 
  Layers, 
  AlertTriangle, 
  CheckSquare, 
  FileSpreadsheet
} from 'lucide-react';
import { projectsApi } from '../api/projectsApi';
import { Project, Milestone } from '../types';
import { RiskBadge, StatusBadge } from '../components/common/Badge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

type ReportType = 'EXECUTIVE' | 'SECTOR' | 'RISK' | 'PROJECT_SCORECARD';

export const ReportsPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [reportType, setReportType] = useState<ReportType>('EXECUTIVE');
  const [sectorFilter, setSectorFilter] = useState<string>('ALL');
  const [stateFilter, setStateFilter] = useState<string>('ALL');
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [projectMilestones, setProjectMilestones] = useState<Milestone[]>([]);

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    if (reportType === 'PROJECT_SCORECARD' && selectedProjectId) {
      loadProjectDetail(selectedProjectId);
    }
  }, [reportType, selectedProjectId]);

  const loadProjects = async () => {
    try {
      const data = await projectsApi.getProjects();
      setProjects(data);
      if (data.length > 0) {
        setSelectedProjectId(data[0].id);
      }
    } catch (err) {
      console.error('Failed to load projects', err);
    } finally {
      setLoading(false);
    }
  };

  const loadProjectDetail = async (id: number) => {
    setLoading(true);
    try {
      const [proj, miles] = await Promise.all([
        projectsApi.getProjectById(id),
        projectsApi.getMilestones(id).catch(() => [])
      ]);
      setSelectedProject(proj);
      setProjectMilestones(miles);
    } catch (err) {
      console.error('Failed to load project details for scorecard', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredProjects = projects.filter(p => {
    const matchSector = sectorFilter === 'ALL' || p.sector === sectorFilter;
    const matchState = stateFilter === 'ALL' || p.state === stateFilter;
    return matchSector && matchState;
  });

  const exportCSV = () => {
    const headers = [
      'Project Code',
      'Project Name',
      'Ministry',
      'Sector',
      'State',
      'Sanctioned Budget (Cr)',
      'Actual Cost (Cr)',
      'Physical Progress %',
      'Planned Progress %',
      'SPI',
      'CPI',
      'Health Score',
      'Risk Level',
      'Status'
    ];

    const rows = filteredProjects.map(p => [
      p.projectCode || p.code,
      `"${(p.projectName || p.name || '').replace(/"/g, '""')}"`,
      `"${(p.ministry || '').replace(/"/g, '""')}"`,
      p.sector,
      p.state,
      p.projectBudget || p.budgetCr,
      p.actualCost || p.spentCr,
      p.physicalProgress,
      p.plannedProgress,
      p.spi,
      p.cpi,
      p.healthScore,
      p.riskLevel,
      p.currentStatus
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `PRAGATI_Project_Monitoring_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  const sectors = Array.from(new Set(projects.map(p => p.sector))).filter(Boolean);
  const states = Array.from(new Set(projects.map(p => p.state))).filter(Boolean);

  const totalBudget = filteredProjects.reduce((acc, p) => acc + (p.projectBudget || p.budgetCr || 0), 0);
  const totalActual = filteredProjects.reduce((acc, p) => acc + (p.actualCost || p.spentCr || 0), 0);
  const avgSpi = filteredProjects.length > 0 
    ? (filteredProjects.reduce((acc, p) => acc + (p.spi || 1), 0) / filteredProjects.length).toFixed(2) 
    : '1.00';
  const avgCpi = filteredProjects.length > 0 
    ? (filteredProjects.reduce((acc, p) => acc + (p.cpi || 1), 0) / filteredProjects.length).toFixed(2) 
    : '1.00';

  return (
    <div className="space-y-6 animate-fadeIn pb-16">
      {/* Header (Hidden during Print) */}
      <div className="print:hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/30">
              Audit & Governance
            </span>
            <span className="text-xs text-slate-400">Official Report Engine</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight mt-1">
            Executive Project Performance & Statutory Reports
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Generate, filter, print, and export high-fidelity EVM scorecards, sector summaries, and delay digests.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-emerald-600/20 transition-all"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white text-xs font-semibold rounded-xl shadow-lg transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Save PDF</span>
          </button>
        </div>
      </div>

      {/* Report Type Selector & Filter Bar (Hidden during Print) */}
      <div className="print:hidden p-4 bg-slate-900/80 border border-slate-800 rounded-2xl shadow-xl space-y-4">
        {/* Type Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3">
          {[
            { id: 'EXECUTIVE', label: 'Executive Portfolio Digest', icon: FileText },
            { id: 'SECTOR', label: 'Sector-Wise EVM Analysis', icon: Layers },
            { id: 'RISK', label: 'High Risk & Delay Digest', icon: AlertTriangle },
            { id: 'PROJECT_SCORECARD', label: 'Project Detailed Scorecard', icon: CheckSquare }
          ].map(tab => {
            const Icon = tab.icon;
            const active = reportType === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setReportType(tab.id as any)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                  active
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Filter Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {reportType === 'PROJECT_SCORECARD' ? (
            <div className="sm:col-span-3">
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Select Infrastructure Project for Scorecard:
              </label>
              <select
                value={selectedProjectId || ''}
                onChange={e => setSelectedProjectId(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-blue-500"
              >
                {projects.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.projectCode || p.code} - {p.projectName || p.name} ({p.sector}, {p.state})
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Sector Filter</label>
                <select
                  value={sectorFilter}
                  onChange={e => setSectorFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                >
                  <option value="ALL">All Sectors ({sectors.length})</option>
                  {sectors.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">State / UT Filter</label>
                <select
                  value={stateFilter}
                  onChange={e => setStateFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                >
                  <option value="ALL">All States ({states.length})</option>
                  {states.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div className="flex items-end">
                <div className="text-xs text-slate-400 py-2">
                  Matching: <strong className="text-slate-100">{filteredProjects.length}</strong> of {projects.length} projects
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Report Document Sheet (Unified Dark & Print-ready) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6 print:bg-white print:text-black print:border-none print:shadow-none print:p-0">
        {/* Official Header */}
        <div className="border-b-2 border-slate-800 print:border-black pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-amber-500/10 border-2 border-amber-500/80 flex items-center justify-center font-bold text-amber-400 text-lg shrink-0">
              IN
            </div>
            <div>
              <h2 className="text-xs uppercase tracking-widest text-slate-400 print:text-slate-700 font-bold">
                Government of India • Cabinet Secretariat & NITI Aayog
              </h2>
              <h1 className="text-lg sm:text-xl font-extrabold text-white print:text-black">
                PRAGATI – Integrated Project Monitoring Performance Report
              </h1>
            </div>
          </div>

          <div className="text-left sm:text-right text-xs text-slate-400 print:text-slate-600 space-y-0.5">
            <p>Generated: <strong className="text-slate-200 print:text-black">{new Date().toLocaleString('en-IN')}</strong></p>
            <p>Classification: <strong className="text-emerald-400 font-mono">OFFICIAL USE ONLY</strong></p>
            <p>System Ref: <span className="font-mono text-slate-300">PRAGATI-GOV-CENTRAL</span></p>
          </div>
        </div>

        {/* Dynamic Summary Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl print:bg-slate-100 print:border-slate-300">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Filtered Projects:</span>
            <span className="text-2xl font-black text-white print:text-black mt-1 block">{filteredProjects.length}</span>
          </div>
          <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl print:bg-slate-100 print:border-slate-300">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Total Sanctioned Budget:</span>
            <span className="text-2xl font-black text-emerald-400 print:text-emerald-700 mt-1 block">
              ₹{totalBudget.toLocaleString('en-IN')} Cr
            </span>
          </div>
          <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl print:bg-slate-100 print:border-slate-300">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Total Expenditure:</span>
            <span className="text-2xl font-black text-blue-400 print:text-blue-700 mt-1 block">
              ₹{totalActual.toLocaleString('en-IN')} Cr
            </span>
          </div>
          <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl print:bg-slate-100 print:border-slate-300">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Average Portfolio SPI / CPI:</span>
            <span className="text-2xl font-black text-amber-400 print:text-amber-700 mt-1 block">
              {avgSpi} / {avgCpi}
            </span>
          </div>
        </div>

        {loading ? (
          <LoadingSpinner message="Assembling statutory performance tables..." />
        ) : reportType === 'PROJECT_SCORECARD' && selectedProject ? (
          /* Detailed Single Project Scorecard */
          <div className="space-y-6">
            <div className="p-5 bg-slate-950/70 rounded-xl border border-slate-800 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">Project Name:</span>
                <p className="font-bold text-white text-sm mt-0.5">{selectedProject.projectName || selectedProject.name}</p>
                <span className="text-[10px] font-mono text-blue-400">{selectedProject.projectCode || selectedProject.code}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Sector / State:</span>
                <p className="font-semibold text-slate-200 mt-0.5">{selectedProject.sector} • {selectedProject.state}</p>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Budget Sanctioned:</span>
                <p className="font-bold text-emerald-400 mt-0.5">₹{selectedProject.projectBudget || selectedProject.budgetCr} Cr</p>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Current Status / Risk:</span>
                <div className="flex items-center gap-2 mt-1">
                  <StatusBadge status={selectedProject.currentStatus} />
                  <RiskBadge risk={selectedProject.riskLevel} />
                </div>
              </div>
            </div>

            {/* EVM Performance Table */}
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-2">
                Earned Value Management (EVM) Parameter Breakdown
              </h3>
              <div className="overflow-x-auto rounded-xl border border-slate-800">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="p-3">Parameter</th>
                      <th className="p-3">Value</th>
                      <th className="p-3">Benchmark</th>
                      <th className="p-3">Analysis & Variance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-200">
                    <tr>
                      <td className="p-3 font-semibold text-white">Schedule Performance Index (SPI)</td>
                      <td className={`p-3 font-bold ${(selectedProject.spi || 1) >= 0.95 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {selectedProject.spi?.toFixed(2)}
                      </td>
                      <td className="p-3 text-slate-400">≥ 1.00 (Nominal)</td>
                      <td className="p-3 text-slate-300">
                        {(selectedProject.spi || 1) >= 1.0 ? 'Ahead of baseline master schedule' : 'Schedule slippage detected'}
                      </td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-white">Cost Performance Index (CPI)</td>
                      <td className={`p-3 font-bold ${(selectedProject.cpi || 1) >= 0.95 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {selectedProject.cpi?.toFixed(2)}
                      </td>
                      <td className="p-3 text-slate-400">≥ 1.00 (Nominal)</td>
                      <td className="p-3 text-slate-300">
                        {(selectedProject.cpi || 1) >= 1.0 ? 'Expenditure within budgeted allocation' : 'Cost efficiency degradation'}
                      </td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-white">Physical vs Planned Progress</td>
                      <td className="p-3 font-bold text-white">
                        {selectedProject.physicalProgress}% / {selectedProject.plannedProgress}%
                      </td>
                      <td className="p-3 text-slate-400">Variance = {(selectedProject.physicalProgress - selectedProject.plannedProgress).toFixed(1)}%</td>
                      <td className="p-3 text-slate-300">
                        {selectedProject.physicalProgress >= selectedProject.plannedProgress ? 'On or ahead of schedule' : 'Physical milestone lag'}
                      </td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-white">Health Score (0-100)</td>
                      <td className="p-3 font-bold text-blue-400">{selectedProject.healthScore}/100</td>
                      <td className="p-3 text-slate-400">Target ≥ 80</td>
                      <td className="p-3 text-slate-300">
                        {selectedProject.healthScore >= 80 ? 'Healthy execution envelope' : 'Requires intervention'}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Milestones Audit Table */}
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-2">
                Work Breakdown Structure (WBS) Milestone Track Record
              </h3>
              <div className="overflow-x-auto rounded-xl border border-slate-800">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="p-3">Milestone Name</th>
                      <th className="p-3">Weightage</th>
                      <th className="p-3">Target Completion</th>
                      <th className="p-3">Actual Progress</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-200">
                    {projectMilestones.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-4 text-center text-slate-500">No milestones recorded</td>
                      </tr>
                    ) : (
                      projectMilestones.map(m => (
                        <tr key={m.id} className="hover:bg-slate-800/40">
                          <td className="p-3 font-semibold text-white">{m.name}</td>
                          <td className="p-3 text-slate-300">{m.weightagePercentage || m.weightage}%</td>
                          <td className="p-3 text-slate-400">{m.plannedEndDate}</td>
                          <td className="p-3 font-bold text-white">{m.actualProgress}%</td>
                          <td className="p-3"><StatusBadge status={m.status} /></td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          /* Multi-Project Master Ledger Table */
          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-3 font-bold uppercase tracking-wider text-[11px]">Code</th>
                  <th className="p-3 font-bold uppercase tracking-wider text-[11px]">Project Name</th>
                  <th className="p-3 font-bold uppercase tracking-wider text-[11px]">Sector</th>
                  <th className="p-3 font-bold uppercase tracking-wider text-[11px]">State</th>
                  <th className="p-3 font-bold uppercase tracking-wider text-[11px]">Budget</th>
                  <th className="p-3 font-bold uppercase tracking-wider text-[11px]">Physical %</th>
                  <th className="p-3 font-bold uppercase tracking-wider text-[11px]">SPI</th>
                  <th className="p-3 font-bold uppercase tracking-wider text-[11px]">CPI</th>
                  <th className="p-3 font-bold uppercase tracking-wider text-[11px]">Health</th>
                  <th className="p-3 font-bold uppercase tracking-wider text-[11px]">Risk</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-slate-200">
                {filteredProjects.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="p-8 text-center text-slate-500">
                      No infrastructure projects match the selected sector/state filters.
                    </td>
                  </tr>
                ) : (
                  filteredProjects.map(p => (
                    <tr key={p.id} className="hover:bg-slate-800/50 transition-colors">
                      <td className="p-3 font-mono text-[11px] text-blue-400 font-bold whitespace-nowrap">
                        {p.projectCode || p.code}
                      </td>
                      <td className="p-3 font-semibold text-white max-w-xs">
                        <div className="truncate">{p.projectName || p.name}</div>
                        <div className="text-[10px] text-slate-400 truncate">{p.ministry}</div>
                      </td>
                      <td className="p-3 text-slate-300">{p.sector}</td>
                      <td className="p-3 text-slate-300">{p.state}</td>
                      <td className="p-3 font-semibold text-slate-100 whitespace-nowrap">
                        ₹{p.projectBudget || p.budgetCr} Cr
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-12 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                            <div 
                              className={`h-1.5 rounded-full ${p.physicalProgress >= 100 ? 'bg-emerald-400' : 'bg-blue-500'}`}
                              style={{ width: `${Math.min(100, p.physicalProgress)}%` }}
                            />
                          </div>
                          <span className="font-bold text-white">{p.physicalProgress}%</span>
                        </div>
                      </td>
                      <td className={`p-3 font-bold whitespace-nowrap ${(p.spi || 1) >= 0.95 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {p.spi?.toFixed(2)}
                      </td>
                      <td className={`p-3 font-bold whitespace-nowrap ${(p.cpi || 1) >= 0.95 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {p.cpi?.toFixed(2)}
                      </td>
                      <td className="p-3 font-bold text-slate-200">
                        {p.healthScore}/100
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        <RiskBadge risk={p.riskLevel} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Statutory Report Sign-off Block */}
        <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 text-xs text-slate-400">
          <div>
            <p className="font-semibold text-slate-300">Audited By: Nodal Statistical Officer</p>
            <p className="text-[10px] text-slate-500">Ministry of Statistics and Programme Implementation (MoSPI)</p>
          </div>
          <div className="text-left sm:text-right">
            <div className="h-8 border-b border-dashed border-slate-700 w-48 mb-1"></div>
            <p className="font-semibold text-slate-300">Authorized Signatory / PMO Observer</p>
            <p className="text-[10px] text-slate-500">Government of India</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
