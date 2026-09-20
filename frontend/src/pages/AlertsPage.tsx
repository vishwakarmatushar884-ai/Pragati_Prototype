import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { alertsApi } from '../api/alertsApi';
import { Alert, EscalationHistory } from '../types';
import Badge from '../components/common/Badge';
import Modal from '../components/common/Modal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import {
  Bell,
  AlertTriangle,
  Flame,
  ArrowUpRight,
  CheckCircle,
  Eye,
  ShieldAlert,
  Clock,
  Send,
  Building2,
  TrendingUp,
  Activity,
  CheckCircle2
} from 'lucide-react';

export default function AlertsPage() {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter state
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [levelFilter, setLevelFilter] = useState('ALL');

  // Action Modals
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [ackModalAlert, setAckModalAlert] = useState<Alert | null>(null);
  const [ackNotes, setAckNotes] = useState('');

  const [escalateModalAlert, setEscalateModalAlert] = useState<Alert | null>(null);
  const [escalateReason, setEscalateReason] = useState('');

  const [resolveModalAlert, setResolveModalAlert] = useState<Alert | null>(null);
  const [resolveNotes, setResolveNotes] = useState('');

  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    setLoading(true);
    try {
      const data = await alertsApi.getAllAlerts();
      setAlerts(data);
      setError(null);
    } catch (err: any) {
      console.error('Failed to load alerts', err);
      setError('Unable to fetch active alerts. Check backend service.');
    } finally {
      setLoading(false);
    }
  };

  const handleAcknowledge = async () => {
    if (!ackModalAlert) return;
    setActionLoading(true);
    try {
      const data = await alertsApi.acknowledgeAlert(ackModalAlert.id, ackNotes);
      setAlerts(prev => prev.map(a => a.id === ackModalAlert.id ? data : a));
      setAckModalAlert(null);
      setAckNotes('');
    } catch (err: any) {
      alert('Failed to acknowledge alert.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleEscalate = async () => {
    if (!escalateModalAlert) return;
    setActionLoading(true);
    try {
      const data = await alertsApi.escalateAlert(escalateModalAlert.id, escalateReason);
      setAlerts(prev => prev.map(a => a.id === escalateModalAlert.id ? data : a));
      setEscalateModalAlert(null);
      setEscalateReason('');
    } catch (err: any) {
      alert('Failed to escalate alert.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleResolve = async () => {
    if (!resolveModalAlert) return;
    setActionLoading(true);
    try {
      const data = await alertsApi.resolveAlert(resolveModalAlert.id, resolveNotes);
      setAlerts(prev => prev.map(a => a.id === resolveModalAlert.id ? data : a));
      setResolveModalAlert(null);
      setResolveNotes('');
    } catch (err: any) {
      alert('Failed to resolve alert.');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredAlerts = alerts.filter(a => {
    const title = a.title || a.alertType || '';
    const projName = a.projectName || '';
    const projCode = a.projectCode || '';
    const msg = a.message || '';
    const matchesSearch =
      title.toLowerCase().includes(search.toLowerCase()) ||
      projName.toLowerCase().includes(search.toLowerCase()) ||
      projCode.toLowerCase().includes(search.toLowerCase()) ||
      msg.toLowerCase().includes(search.toLowerCase());
    const matchesSeverity = severityFilter === 'ALL' || a.severity === severityFilter;
    const matchesStatus = statusFilter === 'ALL' || a.status === statusFilter;
    const lvlStr = String(a.escalationLevel ?? '0');
    const matchesLevel = levelFilter === 'ALL' || 
      lvlStr === levelFilter ||
      (levelFilter === 'LEVEL_0_FIELD' && (lvlStr === '0' || lvlStr.includes('0') || lvlStr.includes('FIELD'))) ||
      (levelFilter === 'LEVEL_1_MINISTRY' && (lvlStr === '1' || lvlStr.includes('1') || lvlStr.includes('MINISTRY'))) ||
      (levelFilter === 'LEVEL_2_APEX' && (lvlStr === '2' || lvlStr.includes('2') || lvlStr.includes('APEX')));
    return matchesSearch && matchesSeverity && matchesStatus && matchesLevel;
  });

  const counts = {
    total: alerts.length,
    critical: alerts.filter(a => a.severity === 'CRITICAL' && a.status !== 'RESOLVED').length,
    apex: alerts.filter(a => (String(a.escalationLevel).includes('2') || String(a.escalationLevel).includes('APEX')) && a.status !== 'RESOLVED').length,
    ministry: alerts.filter(a => (String(a.escalationLevel).includes('1') || String(a.escalationLevel).includes('MINISTRY')) && a.status !== 'RESOLVED').length,
    field: alerts.filter(a => (!a.escalationLevel || String(a.escalationLevel).includes('0') || String(a.escalationLevel).includes('FIELD')) && a.status !== 'RESOLVED').length,
    resolved: alerts.filter(a => a.status === 'RESOLVED').length
  };

  const userRole = user?.roles?.[0]?.replace('ROLE_', '') || user?.role || 'VIEWER';
  const canAction = userRole !== 'VIEWER';

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-400 border border-red-900/50 flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 animate-pulse text-red-600" />
              Automated Anomaly Watch
            </span>
            <span className="text-xs text-slate-400">Two-Level Protocol Active</span>
          </div>
          <h1 className="text-2xl font-bold text-white mt-1">
            Emergency Alert & Multi-Level Escalation Command
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Real-time anomaly triggers, automated time-based escalation ladder (Field → Ministry → Apex), and resolution audits.
          </p>
        </div>

        <button
          onClick={loadAlerts}
          className="flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-lg transition-colors self-start md:self-auto"
        >
          <Activity className="w-3.5 h-3.5" />
          Refresh Live Stream
        </button>
      </div>

      {/* Escalation Hierarchy Status Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl shadow-xs">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Triggers</p>
          <p className="text-2xl font-bold text-white mt-1">{counts.total}</p>
        </div>

        <div className="p-3.5 bg-slate-900 border border-red-200 dark:border-red-900/60 rounded-xl shadow-xs bg-red-50/10 dark:bg-red-950/10">
          <p className="text-[11px] font-semibold text-red-400 uppercase tracking-wider flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" /> Critical Open
          </p>
          <p className="text-2xl font-bold text-red-400 mt-1">{counts.critical}</p>
        </div>

        <div className="p-3.5 bg-slate-900 border border-purple-200 dark:border-purple-900/60 rounded-xl shadow-xs bg-purple-50/10 dark:bg-purple-950/10">
          <p className="text-[11px] font-semibold text-purple-300 uppercase tracking-wider flex items-center gap-1">
            <ShieldAlert className="w-3.5 h-3.5" /> Level 2 (Apex)
          </p>
          <p className="text-2xl font-bold text-purple-300 mt-1">{counts.apex}</p>
        </div>

        <div className="p-3.5 bg-slate-900 border border-amber-900/60 rounded-xl shadow-xs bg-amber-50/10 dark:bg-amber-950/10">
          <p className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> Level 1 (Ministry)
          </p>
          <p className="text-2xl font-bold text-amber-400 mt-1">{counts.ministry}</p>
        </div>

        <div className="p-3.5 bg-slate-900 border border-blue-900/60 rounded-xl shadow-xs bg-blue-50/10 dark:bg-blue-950/10">
          <p className="text-[11px] font-semibold text-blue-300 uppercase tracking-wider flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> Level 0 (Field)
          </p>
          <p className="text-2xl font-bold text-blue-300 mt-1">{counts.field}</p>
        </div>

        <div className="p-3.5 bg-slate-900 border border-emerald-900/60 rounded-xl shadow-xs bg-emerald-50/10 dark:bg-emerald-950/10">
          <p className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
            <CheckCircle className="w-3.5 h-3.5" /> Resolved
          </p>
          <p className="text-2xl font-bold text-emerald-400 mt-1">{counts.resolved}</p>
        </div>
      </div>

      {/* Escalation Workflow Explainer Banner */}
      <div className="p-3.5 bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-xl shadow-md flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-500 shrink-0">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-amber-500 uppercase tracking-wider">Automated Escalation Rule:</span>
            <span className="text-slate-300 ml-1.5">
              Field Officer (Level 0) → Unacknowledged &gt; 5 min escalates to Ministry Admin (Level 1) → Unresolved &gt; 10 min escalates to Apex Monitoring Committee (Level 2).
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="px-2 py-1 rounded-md bg-white/10 text-white font-mono text-[10px]">
            Scheduler: Active (1 min cycle)
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl shadow-xs grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        <div className="relative">
          <input
            type="text"
            placeholder="Search alerts, project code, or message..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-3 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-600"
          />
        </div>

        <div>
          <select
            value={severityFilter}
            onChange={e => setSeverityFilter(e.target.value)}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100"
          >
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100"
          >
            <option value="ALL">All Statuses</option>
            <option value="NEW">New / Triggered</option>
            <option value="ACKNOWLEDGED">Acknowledged</option>
            <option value="ESCALATED">Escalated</option>
            <option value="RESOLVED">Resolved</option>
          </select>
        </div>

        <div>
          <select
            value={levelFilter}
            onChange={e => setLevelFilter(e.target.value)}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100"
          >
            <option value="ALL">All Escalation Levels</option>
            <option value="LEVEL_0_FIELD">Level 0: Field Officer</option>
            <option value="LEVEL_1_MINISTRY">Level 1: Ministry Admin</option>
            <option value="LEVEL_2_APEX">Level 2: Apex Committee</option>
          </select>
        </div>
      </div>

      {/* Alert Cards */}
      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <LoadingSpinner size="lg" text="Loading active anomaly alerts..." />
        </div>
      ) : error ? (
        <div className="p-4 bg-red-950/40 border border-red-900/50 rounded-xl text-red-400 text-sm">
          {error}
        </div>
      ) : filteredAlerts.length === 0 ? (
        <EmptyState
          title="No Alerts Match Filter Criteria"
          description="All infrastructure projects are operating within nominal thresholds, or your filters excluded current items."
        />
      ) : (
        <div className="space-y-3">
          {filteredAlerts.map(alert => {
            const lvl = String(alert.escalationLevel ?? '0');
            const isApex = lvl.includes('2') || lvl.includes('APEX');
            const isMinistry = lvl.includes('1') || lvl.includes('MINISTRY');
            const levelLabel = isApex ? 'LEVEL 2 • APEX COMMITTEE' : isMinistry ? 'LEVEL 1 • MINISTRY ADMIN' : 'LEVEL 0 • FIELD OFFICER';

            return (
              <div
                key={alert.id}
                className={`p-4 bg-slate-900 border rounded-xl shadow-xs transition-all ${
                  alert.status === 'RESOLVED'
                    ? 'border-emerald-900/40 opacity-75'
                    : isApex
                    ? 'border-purple-900/70 bg-purple-950/20'
                    : alert.severity === 'CRITICAL'
                    ? 'border-red-900/70 bg-red-950/20'
                    : 'border-slate-800'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                  {/* Left info */}
                  <div className="space-y-1.5 max-w-3xl">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-mono font-bold text-slate-400">
                        ALERT-#{alert.id}
                      </span>
                      <Badge type="severity" value={alert.severity} />
                      <Badge type="status" value={alert.status} />
                      <span className={`text-[11px] px-2 py-0.5 rounded-md font-semibold ${
                        isApex
                          ? 'bg-purple-900/50 text-purple-300 border border-purple-800'
                          : isMinistry
                          ? 'bg-amber-900/50 text-amber-300 border border-amber-800'
                          : 'bg-blue-900/50 text-blue-300 border border-blue-800'
                      }`}>
                        {levelLabel}
                      </span>
                      {alert.alertType && (
                        <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-mono">
                          {alert.alertType}
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      {alert.title || alert.alertType}
                    </h3>

                    <p className="text-sm text-slate-300">
                      {alert.message}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
                      <span className="flex items-center gap-1 font-semibold text-slate-300">
                        <Building2 className="w-3.5 h-3.5 text-blue-600" />
                        {alert.projectCode} - {alert.projectName}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        Triggered: {alert.createdAt ? new Date(alert.createdAt).toLocaleString() : 'N/A'}
                      </span>
                      {alert.acknowledgedBy && (
                        <span className="text-blue-400">
                          Ack: {alert.acknowledgedBy} ({alert.acknowledgedAt ? new Date(alert.acknowledgedAt).toLocaleDateString() : ''})
                        </span>
                      )}
                      {(alert.escalationHistory?.length || 0) > 0 && (
                        <span className="text-purple-600 dark:text-purple-400 font-medium">
                          {alert.escalationHistory?.length} Escalation Events
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right Action buttons */}
                  <div className="flex flex-wrap items-center gap-2 self-start lg:self-center">
                    <button
                      onClick={() => setSelectedAlert(alert)}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Timeline ({alert.escalationHistory?.length || 0})
                    </button>

                    {canAction && alert.status !== 'RESOLVED' && (
                      <>
                        {alert.status === 'NEW' && (
                          <button
                            onClick={() => setAckModalAlert(alert)}
                            className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 transition-colors"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Acknowledge
                          </button>
                        )}

                        {!isApex && (
                          <button
                            onClick={() => {
                              setEscalateModalAlert(alert);
                              setEscalateReason('Urgent inter-ministerial coordination required');
                            }}
                            className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-purple-50 dark:bg-purple-950/50 hover:bg-purple-100 text-purple-300 border border-purple-200 dark:border-purple-800 transition-colors"
                          >
                            <ArrowUpRight className="w-3.5 h-3.5" />
                            Escalate Up
                          </button>
                        )}

                        <button
                          onClick={() => setResolveModalAlert(alert)}
                          className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 transition-colors"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          Resolve
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {alert.resolutionNotes && (
                  <div className="mt-3 p-2.5 bg-emerald-950/30 border border-emerald-900/50 rounded-lg text-xs text-emerald-300">
                    <strong>Resolution:</strong> {alert.resolutionNotes} {alert.resolvedBy ? `(Resolved by ${alert.resolvedBy})` : ''}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Escalation Timeline Modal */}
      {selectedAlert && (
        <Modal
          isOpen={!!selectedAlert}
          onClose={() => setSelectedAlert(null)}
          title={`Alert History & Escalation Trail: ${selectedAlert.title || selectedAlert.alertType}`}
          size="lg"
        >
          <div className="space-y-4">
            <div className="p-3 bg-slate-950/70 rounded-lg border border-slate-800 space-y-1.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-slate-200">
                  {selectedAlert.projectCode} - {selectedAlert.projectName}
                </span>
                <span className="font-mono">Status: {selectedAlert.status}</span>
              </div>
              <p className="text-slate-400">{selectedAlert.message}</p>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Escalation Trail & Logged Actions
              </h4>

              {(!selectedAlert.escalationHistory || selectedAlert.escalationHistory.length === 0) ? (
                <p className="text-xs text-slate-400 italic py-2">No manual or scheduled escalations recorded yet.</p>
              ) : (
                <div className="relative pl-6 space-y-4 before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-700">
                  {selectedAlert.escalationHistory.map((hist, idx) => (
                    <div key={hist.id || idx} className="relative text-xs space-y-1">
                      <span className="absolute -left-6 top-1 w-3.5 h-3.5 rounded-full bg-blue-600 border-2 border-slate-900"></span>
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-200">
                          Level {hist.fromLevel} → Level {hist.toLevel} ({hist.escalatedToRole || 'Authority'})
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {hist.escalatedAt ? new Date(hist.escalatedAt).toLocaleString() : ''}
                        </span>
                      </div>
                      <p className="text-slate-300">
                        <strong>Reason:</strong> {hist.escalationReason || hist.reason || 'Escalated by protocol'}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Assigned to: {hist.escalatedToUser || 'Competent Authority'}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* Acknowledge Modal */}
      {ackModalAlert && (
        <Modal
          isOpen={!!ackModalAlert}
          onClose={() => setAckModalAlert(null)}
          title={`Acknowledge Alert #${ackModalAlert.id}`}
          size="sm"
        >
          <div className="space-y-3 text-xs">
            <p className="text-slate-300">
              Acknowledging indicates that the competent authority has taken notice and assigned immediate field mitigation.
            </p>
            <textarea
              rows={3}
              placeholder="e.g. Field inspection team dispatched to site. Mobilizing standby resources."
              value={ackNotes}
              onChange={e => setAckNotes(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setAckModalAlert(null)}
                className="px-3 py-1.5 text-slate-300 hover:bg-slate-800 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={handleAcknowledge}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg disabled:opacity-50"
              >
                {actionLoading ? 'Saving...' : 'Confirm Acknowledge'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Escalate Modal */}
      {escalateModalAlert && (
        <Modal
          isOpen={!!escalateModalAlert}
          onClose={() => setEscalateModalAlert(null)}
          title={`Escalate Alert #${escalateModalAlert.id} to Senior Authority`}
          size="sm"
        >
          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-medium text-slate-300 mb-1">Justification / Urgency Reason *</label>
              <textarea
                rows={3}
                required
                placeholder="e.g. Critical path delayed by 3 weeks due to inter-state grid synchronization stall. Ministry intervention required."
                value={escalateReason}
                onChange={e => setEscalateReason(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEscalateModalAlert(null)}
                className="px-3 py-1.5 text-slate-300 hover:bg-slate-800 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionLoading || !escalateReason.trim()}
                onClick={handleEscalate}
                className="px-4 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg disabled:opacity-50"
              >
                {actionLoading ? 'Escalating...' : 'Dispatch Escalation'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Resolve Modal */}
      {resolveModalAlert && (
        <Modal
          isOpen={!!resolveModalAlert}
          onClose={() => setResolveModalAlert(null)}
          title={`Resolve Alert #${resolveModalAlert.id}`}
          size="sm"
        >
          <div className="space-y-3 text-xs">
            <p className="text-slate-300">
              Enter corrective actions taken and verification references to conclude this alert lifecycle.
            </p>
            <textarea
              rows={3}
              required
              placeholder="e.g. Additional equipment mobilized; SPI restored to 0.94. Anomaly condition cleared."
              value={resolveNotes}
              onChange={e => setResolveNotes(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setResolveModalAlert(null)}
                className="px-3 py-1.5 text-slate-300 hover:bg-slate-800 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionLoading || !resolveNotes.trim()}
                onClick={handleResolve}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg disabled:opacity-50"
              >
                {actionLoading ? 'Resolving...' : 'Confirm Resolution'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
