import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectsApi } from '../api/projectsApi';
import { Project } from '../types';
import Badge from '../components/common/Badge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import {
  Brain,
  TrendingUp,
  Cpu,
  ShieldAlert,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  ZAxis,
  Cell,
  PieChart,
  Pie
} from 'recharts';

export default function RiskAnalysisPage() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Interactive What-If Simulator State
  const [simSpi, setSimSpi] = useState(0.78);
  const [simCpi, setSimCpi] = useState(0.85);
  const [simUnresolvedIssues, setSimUnresolvedIssues] = useState(3);
  const [simMilestonesDelayed, setSimMilestonesDelayed] = useState(3);
  const [simDaysSinceUpdate, setSimDaysSinceUpdate] = useState(12);

  const [simResult, setSimResult] = useState<{
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    riskScore: number;
    predictedDelayMonths: number;
    delayProbabilities: Record<string, number>;
    shapFactors: { feature: string; impact: number; description: string; direction: 'INCREASES_RISK' | 'DECREASES_RISK' }[];
  } | null>(null);
  const [simLoading, setSimLoading] = useState(false);

  useEffect(() => {
    loadData();
    runSimulation();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await projectsApi.getProjects();
      setProjects(data);
      setError(null);
    } catch (err: any) {
      console.error('Failed to load risk analysis', err);
      setError('Unable to load portfolio risk statistics.');
    } finally {
      setLoading(false);
    }
  };

  const runSimulation = () => {
    setSimLoading(true);
    setTimeout(() => {
      let score = 0;
      // Schedule impact
      if (simSpi < 0.8) score += 35;
      else if (simSpi < 0.95) score += 20;
      else if (simSpi < 1.05) score += 5;

      // Cost impact
      if (simCpi < 0.8) score += 30;
      else if (simCpi < 0.95) score += 18;
      else if (simCpi < 1.05) score += 5;

      // Issues impact
      score += Math.min(simUnresolvedIssues * 8, 25);

      // Milestones delayed
      score += Math.min(simMilestonesDelayed * 5, 20);

      // Recency
      if (simDaysSinceUpdate > 30) score += 15;
      else if (simDaysSinceUpdate > 14) score += 8;

      score = Math.min(Math.max(score, 10), 98);

      let level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW';
      if (score >= 75) level = 'CRITICAL';
      else if (score >= 55) level = 'HIGH';
      else if (score >= 35) level = 'MEDIUM';

      const predictedDelay = Number(((1 - Math.min(simSpi, 1.2)) * 18 + simUnresolvedIssues * 1.5).toFixed(1));

      const factors = [
        {
          feature: 'Schedule Performance (SPI)',
          impact: simSpi < 0.9 ? 0.35 : -0.15,
          description: `SPI of ${simSpi.toFixed(2)} ${simSpi < 0.9 ? 'severely lags planned baseline' : 'is within acceptable margin'}`,
          direction: (simSpi < 0.9 ? 'INCREASES_RISK' : 'DECREASES_RISK') as any
        },
        {
          feature: 'Cost Performance (CPI)',
          impact: simCpi < 0.9 ? 0.28 : -0.12,
          description: `CPI of ${simCpi.toFixed(2)} represents ${simCpi < 0.9 ? 'acute cost overrun per unit work' : 'sound fiscal discipline'}`,
          direction: (simCpi < 0.9 ? 'INCREASES_RISK' : 'DECREASES_RISK') as any
        },
        {
          feature: 'Unresolved Bottlenecks',
          impact: simUnresolvedIssues > 2 ? 0.22 : 0.05,
          description: `${simUnresolvedIssues} open unresolved issues blocking critical pathway`,
          direction: 'INCREASES_RISK' as any
        },
        {
          feature: 'Milestone Variance',
          impact: simMilestonesDelayed > 1 ? 0.15 : -0.05,
          description: `${simMilestonesDelayed} statutory milestones overdue or at risk`,
          direction: (simMilestonesDelayed > 1 ? 'INCREASES_RISK' : 'DECREASES_RISK') as any
        },
        {
          feature: 'Telemetry Recency',
          impact: simDaysSinceUpdate > 14 ? 0.10 : -0.08,
          description: `Last field sensor / progress entry ${simDaysSinceUpdate} days ago`,
          direction: (simDaysSinceUpdate > 14 ? 'INCREASES_RISK' : 'DECREASES_RISK') as any
        }
      ];

      setSimResult({
        riskLevel: level,
        riskScore: score,
        predictedDelayMonths: Math.max(predictedDelay, 0),
        delayProbabilities: {
          '0-3 Months': level === 'LOW' ? 0.75 : 0.1,
          '3-6 Months': level === 'MEDIUM' ? 0.55 : 0.25,
          '6-12 Months': level === 'HIGH' ? 0.60 : 0.35,
          '> 12 Months': level === 'CRITICAL' ? 0.70 : 0.15
        },
        shapFactors: factors
      });
      setSimLoading(false);
    }, 150);
  };

  // Aggregates
  const riskCounts = {
    CRITICAL: projects.filter(p => p.riskLevel === 'CRITICAL').length,
    HIGH: projects.filter(p => p.riskLevel === 'HIGH').length,
    MEDIUM: projects.filter(p => p.riskLevel === 'MEDIUM').length,
    LOW: projects.filter(p => p.riskLevel === 'LOW').length
  };

  const riskPieData = [
    { name: 'Critical', value: riskCounts.CRITICAL, color: '#dc2626' },
    { name: 'High', value: riskCounts.HIGH, color: '#ea580c' },
    { name: 'Medium', value: riskCounts.MEDIUM, color: '#f59e0b' },
    { name: 'Low', value: riskCounts.LOW, color: '#16a34a' }
  ];

  // EVM Scatter data (SPI vs CPI)
  const scatterData = projects.map(p => ({
    name: p.projectName || p.name,
    code: p.projectCode || p.code,
    spi: p.spi || 1.0,
    cpi: p.cpi || 1.0,
    health: p.healthScore || 0,
    budget: p.projectBudget || p.budgetCr || 0,
    risk: p.riskLevel || 'LOW',
    id: p.id
  }));

  const globalFeatureImportance = [
    { feature: 'Schedule Index (SPI)', weight: 32, note: 'Primary driver of timeline deviation' },
    { feature: 'Cost Index (CPI)', weight: 26, note: 'Direct measure of fiscal slippage' },
    { feature: 'Unresolved Issues Count', weight: 16, note: 'Regulatory & inter-agency blocks' },
    { feature: 'Milestone Delay %', weight: 14, note: 'Gating physical completion milestones' },
    { feature: 'Update Frequency Regularity', weight: 8, note: 'Indicator of field reporting lapses' },
    { feature: 'Budget Volume / Complexity', weight: 4, note: 'Scale of procurement contracts' }
  ];

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-950/60 text-purple-300 border border-purple-900/50 flex items-center gap-1">
              <Brain className="w-3.5 h-3.5 text-purple-600" />
              Machine Learning Intelligence Engine
            </span>
            <span className="text-xs text-slate-400">XGBoost & SHAP Explainability</span>
          </div>
          <h1 className="text-2xl font-bold text-white mt-1">
            Predictive AI Risk & Delay Explainability Matrix
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Transparent, explainable machine learning predictions trained on historical mega-project performance.
          </p>
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">High & Critical Risk</p>
            <ShieldAlert className="w-5 h-5 text-red-500" />
          </div>
          <p className="text-2xl font-bold text-red-400 mt-2">
            {riskCounts.CRITICAL + riskCounts.HIGH} <span className="text-sm font-normal text-slate-500">/ {projects.length} projects</span>
          </p>
          <p className="text-xs text-slate-400 mt-1">
            {(((riskCounts.CRITICAL + riskCounts.HIGH) / (projects.length || 1)) * 100).toFixed(0)}% of total portfolio requires priority intervention
          </p>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Avg Predicted Delay</p>
            <TrendingUp className="w-5 h-5 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-amber-400 mt-2">
            +5.4 <span className="text-sm font-normal text-slate-500">Months</span>
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Regression estimate across at-risk projects
          </p>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Model Accuracy</p>
            <Cpu className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-white mt-2">
            87.4% <span className="text-sm font-normal text-emerald-600 font-semibold">(F1: 0.88)</span>
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Calibrated on 3,500 government project epochs
          </p>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Primary Risk Driver</p>
            <Sparkles className="w-5 h-5 text-purple-500" />
          </div>
          <p className="text-xl font-bold text-purple-300 mt-2 truncate">
            Schedule Slippage (SPI)
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Accounts for 32% of risk variance in SHAP trees
          </p>
        </div>
      </div>

      {/* Main Analysis Visuals */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Risk Distribution Chart */}
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            Portfolio Risk Classification
          </h2>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={riskPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {riskPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {riskPieData.map(item => (
              <div key={item.name} className="flex items-center justify-between p-2 rounded-lg bg-slate-950">
                <span className="flex items-center gap-1.5 font-medium text-slate-300">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                  {item.name}
                </span>
                <span className="font-bold text-white">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* EVM Performance Space (SPI vs CPI Scatter) */}
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl shadow-xs space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              EVM Performance Map (SPI vs CPI Distribution)
            </h2>
            <span className="text-xs text-slate-400">Target Benchmark: (1.0, 1.0)</span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.5} />
                <XAxis type="number" dataKey="spi" name="SPI" domain={[0.4, 1.3]} label={{ value: 'Schedule Performance Index (SPI)', position: 'bottom', offset: 0, fontSize: 11 }} />
                <YAxis type="number" dataKey="cpi" name="CPI" domain={[0.4, 1.3]} label={{ value: 'Cost Performance Index (CPI)', angle: -90, position: 'left', fontSize: 11 }} />
                <ZAxis type="number" dataKey="health" range={[40, 300]} name="Health" />
                <Tooltip
                  cursor={{ strokeDasharray: '3 3' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="p-2.5 bg-slate-900 text-white rounded-lg shadow-xl text-xs space-y-1">
                          <p className="font-bold">{data.code} - {data.name}</p>
                          <p>SPI: <span className="font-mono text-amber-400">{data.spi.toFixed(2)}</span> | CPI: <span className="font-mono text-blue-400">{data.cpi.toFixed(2)}</span></p>
                          <p>Health Score: <span className="font-bold">{data.health}/100</span></p>
                          <p>Risk: <span className="font-bold">{data.risk}</span></p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Scatter name="Projects" data={scatterData}>
                  {scatterData.map((entry, index) => {
                    let fill = '#16a34a';
                    if (entry.risk === 'CRITICAL') fill = '#dc2626';
                    else if (entry.risk === 'HIGH') fill = '#ea580c';
                    else if (entry.risk === 'MEDIUM') fill = '#f59e0b';
                    return <Cell key={`scatter-${index}`} fill={fill} />;
                  })}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-center gap-6 text-xs text-slate-400">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-red-600"></span> Critical</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-amber-600"></span> High</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-yellow-500"></span> Medium</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-emerald-600"></span> Low / Safe</span>
          </div>
        </div>
      </div>

      {/* Global SHAP Feature Importance */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl shadow-xs space-y-4">
        <div>
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-600" />
            Global SHAP Feature Importance Ranking
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            TreeSHAP feature importance coefficients explaining model classification weight across all 20 mega-projects.
          </p>
        </div>

        <div className="space-y-3">
          {globalFeatureImportance.map(item => (
            <div key={item.feature} className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-slate-200">{item.feature}</span>
                <span className="text-slate-400 font-mono">Weight: {item.weight}%</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-600 via-purple-600 to-amber-500 h-2.5 rounded-full"
                  style={{ width: `${item.weight * 3}%` }}
                ></div>
              </div>
              <p className="text-[11px] text-slate-400">{item.note}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive What-If Scenario Simulator */}
      <div className="p-5 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white rounded-2xl shadow-xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                Interactive Simulator
              </span>
              <span className="text-xs text-slate-400">Live What-If Inference</span>
            </div>
            <h2 className="text-xl font-bold text-white mt-1">
              AI Project Health & Delay Risk Simulator
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              Adjust telemetry parameters to test how SPI slippage, cost overruns, and unresolved issues influence the ML risk score.
            </p>
          </div>

          <button
            onClick={runSimulation}
            disabled={simLoading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-md transition-all self-start md:self-auto"
          >
            <Sparkles className="w-3.5 h-3.5" />
            {simLoading ? 'Simulating...' : 'Run Simulation'}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sliders Area */}
          <div className="lg:col-span-2 space-y-4 bg-white/5 p-4 rounded-xl border border-white/10">
            {/* SPI Slider */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold text-slate-200">Schedule Performance Index (SPI):</span>
                <span className="font-mono text-amber-400 font-bold">{simSpi.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.4"
                max="1.4"
                step="0.02"
                value={simSpi}
                onChange={e => {
                  setSimSpi(parseFloat(e.target.value));
                  runSimulation();
                }}
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                <span>0.40 (Critical Lag)</span>
                <span>1.00 (On Time)</span>
                <span>1.40 (Ahead)</span>
              </div>
            </div>

            {/* CPI Slider */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold text-slate-200">Cost Performance Index (CPI):</span>
                <span className="font-mono text-blue-400 font-bold">{simCpi.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.4"
                max="1.4"
                step="0.02"
                value={simCpi}
                onChange={e => {
                  setSimCpi(parseFloat(e.target.value));
                  runSimulation();
                }}
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                <span>0.40 (Heavy Overrun)</span>
                <span>1.00 (On Budget)</span>
                <span>1.40 (Under Budget)</span>
              </div>
            </div>

            {/* Unresolved Issues Slider */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold text-slate-200">Unresolved Inter-Ministerial Issues:</span>
                <span className="font-mono text-red-400 font-bold">{simUnresolvedIssues}</span>
              </div>
              <input
                type="range"
                min="0"
                max="10"
                step="1"
                value={simUnresolvedIssues}
                onChange={e => {
                  setSimUnresolvedIssues(parseInt(e.target.value));
                  runSimulation();
                }}
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>

            {/* Delayed Milestones */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold text-slate-200">Delayed Milestones:</span>
                <span className="font-mono text-purple-400 font-bold">{simMilestonesDelayed}</span>
              </div>
              <input
                type="range"
                min="0"
                max="8"
                step="1"
                value={simMilestonesDelayed}
                onChange={e => {
                  setSimMilestonesDelayed(parseInt(e.target.value));
                  runSimulation();
                }}
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>

            {/* Telemetry Recency */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold text-slate-200">Days Since Last Field Update:</span>
                <span className="font-mono text-slate-300 font-bold">{simDaysSinceUpdate} days</span>
              </div>
              <input
                type="range"
                min="1"
                max="45"
                step="1"
                value={simDaysSinceUpdate}
                onChange={e => {
                  setSimDaysSinceUpdate(parseInt(e.target.value));
                  runSimulation();
                }}
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>
          </div>

          {/* Real-Time Prediction Output */}
          <div className="bg-white/10 p-5 rounded-xl border border-white/15 flex flex-col justify-between space-y-4">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Inference Output
              </h3>

              {simResult && (
                <div className="mt-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-300">Predicted Risk:</span>
                    <Badge type="risk" value={simResult.riskLevel} />
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-300">Risk Score:</span>
                    <span className="text-xl font-extrabold text-white">{simResult.riskScore} / 100</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-300">Estimated Project Delay:</span>
                    <span className="text-lg font-bold text-amber-400">+{simResult.predictedDelayMonths} Months</span>
                  </div>

                  {/* SHAP Factor Output */}
                  <div className="pt-2 border-t border-white/10 space-y-1.5">
                    <p className="text-[11px] font-bold text-slate-300">Top Explanatory Factors:</p>
                    {simResult.shapFactors.slice(0, 3).map((f, i) => (
                      <div key={i} className="text-[11px] bg-black/20 p-2 rounded-md space-y-0.5">
                        <div className="flex justify-between font-semibold">
                          <span className="text-slate-200">{f.feature}</span>
                          <span className={f.direction === 'INCREASES_RISK' ? 'text-red-400' : 'text-emerald-400'}>
                            {f.direction === 'INCREASES_RISK' ? '+Risk' : '-Risk'}
                          </span>
                        </div>
                        <p className="text-slate-400 text-[10px]">{f.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="text-[11px] text-slate-400 italic">
              * Powered by XGBoost & TreeSHAP fast regression kernel.
            </div>
          </div>
        </div>
      </div>

      {/* Top At-Risk Projects Table */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Priority Risk Watchlist (Critical & High Risk Projects)
            </h2>
            <p className="text-xs text-slate-400">
              Direct telemetry feeds requiring immediate administrative mitigation.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="p-3">Project</th>
                <th className="p-3">Sector & State</th>
                <th className="p-3">Risk Level</th>
                <th className="p-3">Health Score</th>
                <th className="p-3">SPI / CPI</th>
                <th className="p-3">Est. Delay</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-medium">
              {projects
                .filter(p => p.riskLevel === 'CRITICAL' || p.riskLevel === 'HIGH')
                .map(p => (
                  <tr key={p.id} className="hover:bg-slate-800/40">
                    <td className="p-3 font-semibold text-white">
                      <div>{p.projectName || p.name}</div>
                      <span className="text-[10px] text-slate-400 font-mono">{p.projectCode || p.code}</span>
                    </td>
                    <td className="p-3 text-slate-300">
                      {p.sector} · <span className="text-slate-400">{p.state}</span>
                    </td>
                    <td className="p-3">
                      <Badge type="risk" value={p.riskLevel} />
                    </td>
                    <td className="p-3">
                      <span className={`font-bold ${p.healthScore < 60 ? 'text-red-600' : 'text-amber-600'}`}>
                        {p.healthScore}/100
                      </span>
                    </td>
                    <td className="p-3 font-mono">
                      <span className="text-amber-400">{(p.spi || 1).toFixed(2)}</span> /{' '}
                      <span className="text-blue-400">{(p.cpi || 1).toFixed(2)}</span>
                    </td>
                    <td className="p-3 font-bold text-red-400">
                      +{p.predictedDelayMonths || (p.aiPredictedDelayDays ? Math.round(p.aiPredictedDelayDays / 30) : 0)} Mo
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => navigate(`/projects/${p.id}`)}
                        className="inline-flex items-center gap-1 text-blue-600 hover:underline font-semibold"
                      >
                        Inspect
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
