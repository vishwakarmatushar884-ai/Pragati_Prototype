import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, 
  IndianRupee, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Layers, 
  Activity,
  Filter,
  RefreshCw,
  ExternalLink,
  ShieldAlert,
  ArrowUpRight
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  AreaChart, 
  Area, 
  CartesianGrid 
} from 'recharts';
import { dashboardApi } from '../api/dashboardApi';
import { PortfolioSummary, RiskDistribution, MinistryStat, SectorStat, MonthlyTrendItem, TopRiskProject } from '../types';
import { StatCard } from '../components/common/StatCard';
import { RiskBadge, StatusBadge } from '../components/common/Badge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();

  // Filters
  const [selectedMinistry, setSelectedMinistry] = useState<string>('');
  const [selectedState, setSelectedState] = useState<string>('');
  const [selectedSector, setSelectedSector] = useState<string>('');
  const [selectedRisk, setSelectedRisk] = useState<string>('');

  // Dashboard States
  const [summary, setSummary] = useState<PortfolioSummary | null>(null);
  const [riskDist, setRiskDist] = useState<RiskDistribution | null>(null);
  const [ministryStats, setMinistryStats] = useState<MinistryStat[]>([]);
  const [sectorStats, setSectorStats] = useState<SectorStat[]>([]);
  const [trends, setTrends] = useState<MonthlyTrendItem[]>([]);
  const [topRiskProjects, setTopRiskProjects] = useState<TopRiskProject[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const filterParams = {
        ministry: selectedMinistry || undefined,
        state: selectedState || undefined,
        sector: selectedSector || undefined,
        riskLevel: selectedRisk || undefined,
      };

      const [sum, dist, minStats, secStats, trendData, topRisk] = await Promise.all([
        dashboardApi.getPortfolioSummary(filterParams),
        dashboardApi.getRiskDistribution({
          ministry: selectedMinistry || undefined,
          state: selectedState || undefined,
          sector: selectedSector || undefined,
        }),
        dashboardApi.getMinistryStats(),
        dashboardApi.getSectorStats(),
        dashboardApi.getTrends(),
        dashboardApi.getTopRiskProjects(10),
      ]);

      setSummary(sum);
      setRiskDist(dist);
      setMinistryStats(minStats);
      setSectorStats(secStats);
      setTrends(trendData);
      setTopRiskProjects(topRisk);
    } catch (err) {
      console.error('Failed to load dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [selectedMinistry, selectedState, selectedSector, selectedRisk]);

  const resetFilters = () => {
    setSelectedMinistry('');
    setSelectedState('');
    setSelectedSector('');
    setSelectedRisk('');
  };

  const riskPieData = riskDist
    ? [
        { name: 'Low Risk', value: riskDist.low, color: '#10B981' },
        { name: 'Medium Risk', value: riskDist.medium, color: '#F59E0B' },
        { name: 'High Risk', value: riskDist.high, color: '#F97316' },
        { name: 'Critical Risk', value: riskDist.critical, color: '#EF4444' },
      ]
    : [];

  const ministriesList = [
    'Ministry of Road Transport and Highways',
    'Ministry of Railways',
    'Ministry of Jal Shakti',
    'Ministry of New and Renewable Energy',
    'Ministry of Housing and Urban Affairs',
    'Ministry of Health and Family Welfare',
    'Ministry of Education',
    'Ministry of Rural Development',
    'Ministry of Communications',
  ];

  const statesList = [
    'Madhya Pradesh',
    'Uttar Pradesh',
    'Rajasthan',
    'Maharashtra',
    'Gujarat',
    'Karnataka',
    'Tamil Nadu',
    'Bihar',
    'Odisha',
    'Assam',
  ];

  const sectorsList = [
    'Highways',
    'Railways',
    'Water Supply',
    'Power',
    'Urban Development',
    'Healthcare',
    'Education',
    'Rural Development',
    'Irrigation',
    'Digital Infrastructure',
  ];

  return (
    <div className="space-y-6">
      {/* Page Title & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-white tracking-tight">Executive Portfolio Dashboard</h1>
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
              NATIONAL PMO
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time multi-ministry performance tracking, Earned Value metrics, and proactive risk detection
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchDashboardData}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs font-semibold text-slate-300 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => navigate('/map')}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-blue-600/20 transition-all"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>GIS Map View</span>
          </button>
        </div>
      </div>

      {/* Global Filter Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800/80">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
            <Filter className="w-3.5 h-3.5 text-blue-400" />
            <span>Multi-Attribute Filter Controls</span>
          </div>
          {(selectedMinistry || selectedState || selectedSector || selectedRisk) && (
            <button
              onClick={resetFilters}
              className="text-xs text-amber-400 hover:text-amber-300 font-semibold transition-colors"
            >
              Reset Filters
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Ministry Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">Ministry</label>
            <select
              value={selectedMinistry}
              onChange={(e) => setSelectedMinistry(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
            >
              <option value="">All Ministries</option>
              {ministriesList.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          {/* State Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">State</label>
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
            >
              <option value="">All States</option>
              {statesList.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Sector Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">Sector</label>
            <select
              value={selectedSector}
              onChange={(e) => setSelectedSector(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
            >
              <option value="">All Sectors</option>
              {sectorsList.map((sec) => (
                <option key={sec} value={sec}>
                  {sec}
                </option>
              ))}
            </select>
          </div>

          {/* Risk Level Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">Risk Category</label>
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
          </div>
        </div>
      </div>

      {loading && !summary ? (
        <LoadingSpinner />
      ) : (
        <>
          {/* Top KPI Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Monitored Projects"
              value={summary?.totalProjects || 0}
              subtitle={`${summary?.onTrackProjects || 0} On Track • ${summary?.delayedProjects || 0} Delayed`}
              icon={<Layers className="w-5 h-5" />}
              highlightColor="blue"
              onClick={() => navigate('/projects')}
            />
            <StatCard
              title="Total Approved Budget"
              value={`₹${(summary?.totalApprovedBudget || 0).toLocaleString('en-IN')} Cr`}
              subtitle={`Actual Spend: ₹${(summary?.totalActualExpenditure || 0).toLocaleString('en-IN')} Cr`}
              icon={<IndianRupee className="w-5 h-5" />}
              highlightColor="emerald"
            />
            <StatCard
              title="Average Physical Progress"
              value={`${summary?.averagePhysicalProgress || 0}%`}
              subtitle={`Planned Target: ${summary?.averagePlannedProgress || 0}%`}
              icon={<TrendingUp className="w-5 h-5" />}
              highlightColor="amber"
            />
            <StatCard
              title="Portfolio EVM Health"
              value={`SPI: ${summary?.averageSpi || 1.0} | CPI: ${summary?.averageCpi || 1.0}`}
              subtitle={`${summary?.criticalRiskCount || 0} Critical • ${summary?.highRiskCount || 0} High Risk`}
              icon={<Activity className="w-5 h-5" />}
              highlightColor={summary?.criticalRiskCount ? 'rose' : 'purple'}
              onClick={() => navigate('/risk')}
            />
          </div>

          {/* Secondary Operational KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">Open Issues</p>
                <p className="text-lg font-extrabold text-slate-100">{summary?.openIssuesCount || 0}</p>
              </div>
              <span className="text-[10px] font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                {summary?.criticalIssuesCount || 0} Critical
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">Active Alerts</p>
                <p className="text-lg font-extrabold text-slate-100">{summary?.unresolvedAlertsCount || 0}</p>
              </div>
              <span className="text-[10px] font-bold text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/20">
                Escalations Active
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">Detected Anomalies</p>
                <p className="text-lg font-extrabold text-slate-100">{summary?.activeAnomaliesCount || 0}</p>
              </div>
              <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                AI Detected
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">Completed Works</p>
                <p className="text-lg font-extrabold text-emerald-400">{summary?.completedProjects || 0}</p>
              </div>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
          </div>

          {/* Visual Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Risk Distribution Donut */}
            <div className="lg:col-span-4 glass-card p-5 rounded-2xl border border-slate-800/80 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-400" />
                  Portfolio Risk Classification
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">EVM threshold & AI risk distribution</p>
              </div>

              <div className="h-60 flex items-center justify-center my-2">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={riskPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={85}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {riskPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }}
                      itemStyle={{ color: '#fff' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80 text-xs">
                {riskPieData.map((r) => (
                  <div key={r.name} className="flex items-center justify-between p-1.5 rounded-lg bg-slate-900/60">
                    <span className="flex items-center gap-1.5 text-slate-300">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: r.color }} />
                      {r.name}
                    </span>
                    <span className="font-bold text-white">{r.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Ministry Breakdown Bar Chart */}
            <div className="lg:col-span-8 glass-card p-5 rounded-2xl border border-slate-800/80">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-blue-400" />
                    Ministry-wise Budget vs Expenditure (₹ Cr)
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">Approved allocation vs live cumulative expenditure</p>
                </div>
              </div>

              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={ministryStats.slice(0, 6)} margin={{ top: 10, right: 10, left: -10, bottom: 25 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis
                      dataKey="ministry"
                      stroke="#64748b"
                      fontSize={10}
                      tickFormatter={(val) => val.replace('Ministry of ', '').substring(0, 12) + '...'}
                      angle={-15}
                      textAnchor="end"
                    />
                    <YAxis stroke="#64748b" fontSize={10} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }}
                      itemStyle={{ color: '#fff' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                    <Bar dataKey="totalBudget" name="Approved Budget (Cr)" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="totalExpenditure" name="Actual Expenditure (Cr)" fill="#10B981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Monthly Trends Area Chart */}
          <div className="glass-card p-5 rounded-2xl border border-slate-800/80">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  Planned vs Actual Performance Trends
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Historical physical progress & EVM velocity curve</p>
              </div>
            </div>

            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trends} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorPlanned" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} unit="%" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Area type="monotone" dataKey="plannedProgress" name="Planned Target %" stroke="#3B82F6" strokeWidth={2} fillOpacity={1} fill="url(#colorPlanned)" />
                  <Area type="monotone" dataKey="actualProgress" name="Actual Physical %" stroke="#10B981" strokeWidth={2} fillOpacity={1} fill="url(#colorActual)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top 10 At-Risk Projects Table */}
          <div className="glass-card rounded-2xl border border-slate-800/80 overflow-hidden">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  Critical & High-Risk Projects Watchlist
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Ranked by Project Health Score and AI delay forecast</p>
              </div>
              <button
                onClick={() => navigate('/projects')}
                className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1"
              >
                <span>View All Projects</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/80 text-slate-400 border-b border-slate-800 font-semibold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="px-5 py-3.5">Project Code & Name</th>
                    <th className="px-4 py-3.5">Ministry / State</th>
                    <th className="px-4 py-3.5">Risk Level</th>
                    <th className="px-4 py-3.5 text-center">Health Score</th>
                    <th className="px-4 py-3.5 text-center">SPI</th>
                    <th className="px-4 py-3.5 text-center">CPI</th>
                    <th className="px-4 py-3.5">Physical %</th>
                    <th className="px-4 py-3.5">AI Delay Est.</th>
                    <th className="px-5 py-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {topRiskProjects.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-5 py-3.5">
                        <p className="font-bold text-slate-100">{p.projectName}</p>
                        <p className="text-[10px] text-slate-400">{p.projectCode}</p>
                      </td>
                      <td className="px-4 py-3.5 text-slate-300">
                        <p className="truncate max-w-[180px]">{p.ministry}</p>
                        <p className="text-[10px] text-slate-400">{p.state}</p>
                      </td>
                      <td className="px-4 py-3.5">
                        <RiskBadge risk={p.riskLevel} />
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <span className={`px-2 py-0.5 rounded font-black text-xs ${
                          p.healthScore < 40 ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' :
                          p.healthScore < 60 ? 'bg-orange-500/20 text-orange-300 border border-orange-500/40' :
                          'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        }`}>
                          {p.healthScore}/100
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-center font-semibold text-slate-200">{p.spi}</td>
                      <td className="px-4 py-3.5 text-center font-semibold text-slate-200">{p.cpi}</td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                            <div className="h-full bg-blue-500 rounded-full" style={{ width: `${p.physicalProgress}%` }} />
                          </div>
                          <span className="text-[11px] font-semibold text-slate-300">{p.physicalProgress}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="text-[11px] font-bold text-rose-400">
                          +{p.aiPredictedDelayDays} days
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <button
                          onClick={() => navigate(`/projects/${p.id}`)}
                          className="px-2.5 py-1 rounded-lg bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/30 text-blue-300 text-xs font-semibold transition-colors inline-flex items-center gap-1"
                        >
                          <span>Open</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
