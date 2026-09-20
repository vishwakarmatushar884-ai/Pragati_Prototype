import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { settingsApi } from '../api/settingsApi';
import LoadingSpinner from '../components/common/LoadingSpinner';
import {
  Sliders,
  Clock,
  Database,
  Save,
  RotateCcw,
  CheckCircle2,
  Layers
} from 'lucide-react';

export default function SettingsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Settings State
  const [spiCritical, setSpiCritical] = useState(0.80);
  const [spiWarning, setSpiWarning] = useState(0.95);
  const [cpiCritical, setCpiCritical] = useState(0.80);
  const [cpiWarning, setCpiWarning] = useState(0.95);

  // Health Score Weights
  const [weights, setWeights] = useState({
    schedule: 30,
    cost: 25,
    milestone: 20,
    issues: 15,
    recency: 10
  });

  // Escalation Timers
  const [escalationL1Mins, setEscalationL1Mins] = useState(5);
  const [escalationL2Mins, setEscalationL2Mins] = useState(10);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const settingsMap = await settingsApi.getSettings();
      if (settingsMap.thresholds?.['spi.critical']) setSpiCritical(parseFloat(settingsMap.thresholds['spi.critical']));
      if (settingsMap.thresholds?.['spi.warning']) setSpiWarning(parseFloat(settingsMap.thresholds['spi.warning']));
      if (settingsMap.thresholds?.['cpi.critical']) setCpiCritical(parseFloat(settingsMap.thresholds['cpi.critical']));
      if (settingsMap.thresholds?.['cpi.warning']) setCpiWarning(parseFloat(settingsMap.thresholds['cpi.warning']));
      if (settingsMap.general?.['escalation.l1.minutes']) setEscalationL1Mins(parseInt(settingsMap.general['escalation.l1.minutes']));
      if (settingsMap.general?.['escalation.l2.minutes']) setEscalationL2Mins(parseInt(settingsMap.general['escalation.l2.minutes']));
      if (settingsMap.weights) {
        setWeights({
          schedule: settingsMap.weights['schedule'] || 30,
          cost: settingsMap.weights['cost'] || 25,
          milestone: settingsMap.weights['milestone'] || 20,
          issues: settingsMap.weights['issues'] || 15,
          recency: settingsMap.weights['recency'] || 10
        });
      }
    } catch (err) {
      console.log('Using default settings fallback');
    } finally {
      setLoading(false);
    }
  };

  const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (totalWeight !== 100) {
      alert('Health score weights must sum exactly to 100%!');
      return;
    }

    setSaveLoading(true);
    try {
      await settingsApi.updateSettings({
        thresholds: {
          'spi.critical': spiCritical.toString(),
          'spi.warning': spiWarning.toString(),
          'cpi.critical': cpiCritical.toString(),
          'cpi.warning': cpiWarning.toString(),
        },
        weights: weights,
        general: {
          'escalation.l1.minutes': escalationL1Mins.toString(),
          'escalation.l2.minutes': escalationL2Mins.toString(),
        }
      });

      setSuccessMsg('System configuration and calibration parameters updated successfully.');
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err) {
      alert('Failed to update system settings.');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleResetDefaults = () => {
    setSpiCritical(0.80);
    setSpiWarning(0.95);
    setCpiCritical(0.80);
    setCpiWarning(0.95);
    setWeights({ schedule: 30, cost: 25, milestone: 20, issues: 15, recency: 10 });
    setEscalationL1Mins(5);
    setEscalationL2Mins(10);
  };

  const userRole = user?.roles?.[0]?.replace('ROLE_', '') || user?.role || 'VIEWER';
  const isSuperAdmin = userRole === 'SUPER_ADMIN' || userRole === 'MINISTRY_ADMIN';

  return (
    <div className="space-y-6 animate-fadeIn pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-300">
              System Administration
            </span>
            <span className="text-xs text-slate-400">Calibration & Protocol Control</span>
          </div>
          <h1 className="text-2xl font-bold text-white mt-1">
            Platform Thresholds & Engine Parameters
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Configure EVM variance boundaries, health score weightage models, and automated escalation timers.
          </p>
        </div>

        {isSuperAdmin && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleResetDefaults}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Defaults
            </button>
            <button
              onClick={handleSave}
              disabled={saveLoading || totalWeight !== 100}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-all disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              {saveLoading ? 'Saving...' : 'Save Parameters'}
            </button>
          </div>
        )}
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-950/40 border border-emerald-900/50 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          {successMsg}
        </div>
      )}

      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <LoadingSpinner size="lg" text="Loading platform configuration..." />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* EVM Thresholds Card */}
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <Sliders className="w-5 h-5 text-blue-500" />
              <div>
                <h3 className="text-sm font-bold text-white">
                  Earned Value Management (EVM) Thresholds
                </h3>
                <p className="text-xs text-slate-400">
                  Defines trigger points for SPI and CPI risk classifications.
                </p>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-slate-300 mb-1">
                    SPI Critical Limit (Red):
                  </label>
                  <input
                    type="number"
                    step="0.05"
                    min="0.5"
                    max="0.9"
                    disabled={!isSuperAdmin}
                    value={spiCritical}
                    onChange={e => setSpiCritical(parseFloat(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg font-mono font-bold text-red-600"
                  />
                  <span className="text-[10px] text-slate-400">SPI below this is classified as CRITICAL</span>
                </div>

                <div>
                  <label className="block font-medium text-slate-300 mb-1">
                    SPI Warning Limit (Amber):
                  </label>
                  <input
                    type="number"
                    step="0.05"
                    min="0.8"
                    max="1.0"
                    disabled={!isSuperAdmin}
                    value={spiWarning}
                    onChange={e => setSpiWarning(parseFloat(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg font-mono font-bold text-amber-600"
                  />
                  <span className="text-[10px] text-slate-400">SPI between critical & warning is MEDIUM</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block font-medium text-slate-300 mb-1">
                    CPI Critical Limit (Red):
                  </label>
                  <input
                    type="number"
                    step="0.05"
                    min="0.5"
                    max="0.9"
                    disabled={!isSuperAdmin}
                    value={cpiCritical}
                    onChange={e => setCpiCritical(parseFloat(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg font-mono font-bold text-red-600"
                  />
                  <span className="text-[10px] text-slate-400">Cost overrun &gt; 20%</span>
                </div>

                <div>
                  <label className="block font-medium text-slate-300 mb-1">
                    CPI Warning Limit (Amber):
                  </label>
                  <input
                    type="number"
                    step="0.05"
                    min="0.8"
                    max="1.0"
                    disabled={!isSuperAdmin}
                    value={cpiWarning}
                    onChange={e => setCpiWarning(parseFloat(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg font-mono font-bold text-amber-600"
                  />
                  <span className="text-[10px] text-slate-400">Cost overrun 5%–20%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Health Score Component Weights */}
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-purple-600" />
                <div>
                  <h3 className="text-sm font-bold text-white">
                    Project Health Score Calibration (0–100)
                  </h3>
                  <p className="text-xs text-slate-400">
                    Weights must sum to exactly 100%.
                  </p>
                </div>
              </div>
              <span className={`px-2.5 py-1 rounded-md text-xs font-bold font-mono ${
                totalWeight === 100 ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
              }`}>
                Sum: {totalWeight}%
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="font-medium text-slate-300">Schedule Health Weight (SPI Component):</span>
                  <span className="font-mono font-bold text-white">{weights.schedule}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="50"
                  disabled={!isSuperAdmin}
                  value={weights.schedule}
                  onChange={e => setWeights({ ...weights, schedule: parseInt(e.target.value) })}
                  className="w-full h-1.5 bg-slate-700 rounded-lg accent-blue-500"
                />
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="font-medium text-slate-300">Cost Health Weight (CPI Component):</span>
                  <span className="font-mono font-bold text-white">{weights.cost}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="50"
                  disabled={!isSuperAdmin}
                  value={weights.cost}
                  onChange={e => setWeights({ ...weights, cost: parseInt(e.target.value) })}
                  className="w-full h-1.5 bg-slate-700 rounded-lg accent-blue-500"
                />
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="font-medium text-slate-300">Milestone Completion Weight:</span>
                  <span className="font-mono font-bold text-white">{weights.milestone}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="40"
                  disabled={!isSuperAdmin}
                  value={weights.milestone}
                  onChange={e => setWeights({ ...weights, milestone: parseInt(e.target.value) })}
                  className="w-full h-1.5 bg-slate-700 rounded-lg accent-blue-500"
                />
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="font-medium text-slate-300">Unresolved Issues Penalty Weight:</span>
                  <span className="font-mono font-bold text-white">{weights.issues}%</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="30"
                  disabled={!isSuperAdmin}
                  value={weights.issues}
                  onChange={e => setWeights({ ...weights, issues: parseInt(e.target.value) })}
                  className="w-full h-1.5 bg-slate-700 rounded-lg accent-blue-500"
                />
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="font-medium text-slate-300">Telemetry Recency Weight:</span>
                  <span className="font-mono font-bold text-white">{weights.recency}%</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="20"
                  disabled={!isSuperAdmin}
                  value={weights.recency}
                  onChange={e => setWeights({ ...weights, recency: parseInt(e.target.value) })}
                  className="w-full h-1.5 bg-slate-700 rounded-lg accent-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Two-Level Escalation Scheduler Timers */}
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <Clock className="w-5 h-5 text-amber-500" />
              <div>
                <h3 className="text-sm font-bold text-white">
                  Automated Escalation Protocol Timers
                </h3>
                <p className="text-xs text-slate-400">
                  Configured in minutes for accelerated demonstration speed.
                </p>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-slate-300 mb-1">
                    Level 1 Escalation (Ministry):
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      max="120"
                      disabled={!isSuperAdmin}
                      value={escalationL1Mins}
                      onChange={e => setEscalationL1Mins(parseInt(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg font-mono"
                    />
                    <span className="text-slate-400 font-semibold">mins</span>
                  </div>
                  <span className="text-[10px] text-slate-400">If Field Officer fails to acknowledge</span>
                </div>

                <div>
                  <label className="block font-medium text-slate-300 mb-1">
                    Level 2 Escalation (Apex):
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="2"
                      max="240"
                      disabled={!isSuperAdmin}
                      value={escalationL2Mins}
                      onChange={e => setEscalationL2Mins(parseInt(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg font-mono"
                    />
                    <span className="text-slate-400 font-semibold">mins</span>
                  </div>
                  <span className="text-[10px] text-slate-400">If unresolved after ministry alert</span>
                </div>
              </div>

              <div className="p-3 bg-amber-950/30 border border-amber-900/50 rounded-lg text-amber-300 text-[11px]">
                <strong>System Protocol Note:</strong> The background escalation scheduler checks for overdue alerts every 60 seconds. In production, these parameters map to 24 hours and 72 hours respectively.
              </div>
            </div>
          </div>

          {/* System Environment & Status */}
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <Database className="w-5 h-5 text-emerald-500" />
              <div>
                <h3 className="text-sm font-bold text-white">
                  Platform Runtime & Architecture Diagnostics
                </h3>
                <p className="text-xs text-slate-400">
                  Active backend services, microservice endpoints, and versions.
                </p>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between p-2 rounded-lg bg-slate-950">
                <span className="text-slate-500">Backend Core:</span>
                <span className="font-mono font-semibold text-slate-200">Spring Boot 3.3.2 (Java 21/26)</span>
              </div>

              <div className="flex justify-between p-2 rounded-lg bg-slate-950">
                <span className="text-slate-500">ML Intelligence Service:</span>
                <span className="font-mono font-semibold text-purple-600 dark:text-purple-400">FastAPI + XGBoost + SHAP (Port 8000)</span>
              </div>

              <div className="flex justify-between p-2 rounded-lg bg-slate-950">
                <span className="text-slate-500">Database Engine:</span>
                <span className="font-mono font-semibold text-emerald-400">H2 Dev (Postgres Prod Ready)</span>
              </div>

              <div className="flex justify-between p-2 rounded-lg bg-slate-950">
                <span className="text-slate-500">Security Architecture:</span>
                <span className="font-mono font-semibold text-slate-200">Stateless JWT + 6-Tier RBAC</span>
              </div>

              <div className="flex justify-between p-2 rounded-lg bg-slate-950">
                <span className="text-slate-500">System Code:</span>
                <span className="font-mono font-bold text-amber-500">PRAGATI-CORE-2026</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
