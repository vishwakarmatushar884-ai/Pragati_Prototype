import React from 'react';
import { RiskLevel, ProjectStatus, Priority, AlertSeverity } from '../../types';

interface BadgeProps {
  children?: React.ReactNode;
  type?: 'risk' | 'status' | 'severity' | 'escalation';
  value?: any;
  className?: string;
}

export const RiskBadge: React.FC<{ risk: RiskLevel | string; showDot?: boolean; className?: string }> = ({ risk, showDot = true, className = '' }) => {
  const r = (risk || 'LOW').toUpperCase();
  const styles: Record<string, string> = {
    LOW: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    MEDIUM: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    HIGH: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
    CRITICAL: 'bg-rose-500/15 text-rose-400 border-rose-500/40 animate-pulse',
  };

  const dots: Record<string, string> = {
    LOW: 'bg-emerald-400',
    MEDIUM: 'bg-amber-400',
    HIGH: 'bg-orange-400',
    CRITICAL: 'bg-rose-500',
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${styles[r] || styles.LOW} ${className}`}>
      {showDot && <span className={`w-1.5 h-1.5 rounded-full ${dots[r] || dots.LOW}`} />}
      {r} RISK
    </span>
  );
};

export const StatusBadge: React.FC<{ status: ProjectStatus | string; className?: string }> = ({ status, className = '' }) => {
  const styles: Record<string, string> = {
    IN_PROGRESS: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    ON_TRACK: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    DELAYED: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    ON_HOLD: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    COMPLETED: 'bg-teal-500/10 text-teal-300 border-teal-500/30',
    NOT_STARTED: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
    OPEN: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    ASSIGNED: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
    UNDER_REVIEW: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    RESOLVED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    CLOSED: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
    TRIGGERED: 'bg-rose-500/10 text-rose-400 border-rose-500/30 animate-pulse',
    ACKNOWLEDGED: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    ESCALATED: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium border ${styles[status] || 'bg-slate-700 text-slate-300 border-slate-600'} ${className}`}>
      {status ? String(status).replace(/_/g, ' ') : 'UNKNOWN'}
    </span>
  );
};

export const EscalationBadge: React.FC<{ level: number | string }> = ({ level }) => {
  const lvl = String(level);
  if (lvl === '2' || lvl.includes('APEX') || lvl.includes('LEVEL_2')) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded bg-purple-950/80 text-purple-300 border border-purple-600/50 text-xs font-bold animate-pulse">
        LEVEL 2 • APEX COMMITTEE
      </span>
    );
  }
  if (lvl === '1' || lvl.includes('MINISTRY') || lvl.includes('LEVEL_1')) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded bg-orange-950/80 text-orange-300 border border-orange-600/50 text-xs font-semibold">
        LEVEL 1 • MINISTRY ADMIN
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 text-xs font-medium">
      LEVEL 0 • PROJECT OFFICER
    </span>
  );
};

export const SeverityBadge: React.FC<{ severity: AlertSeverity | Priority | string }> = ({ severity }) => {
  const styles: Record<string, string> = {
    INFO: 'bg-blue-900/30 text-blue-300 border-blue-700/50',
    LOW: 'bg-slate-800 text-slate-300 border-slate-700',
    WARNING: 'bg-amber-900/30 text-amber-300 border-amber-700/50',
    MEDIUM: 'bg-amber-900/30 text-amber-300 border-amber-700/50',
    HIGH: 'bg-orange-900/30 text-orange-300 border-orange-700/50',
    CRITICAL: 'bg-rose-950/50 text-rose-300 border-rose-600/60 font-semibold',
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs border ${styles[severity] || 'bg-slate-800 text-slate-300'}`}>
      {severity}
    </span>
  );
};

const Badge: React.FC<BadgeProps> = ({ children, type, value, className = '' }) => {
  if (type === 'risk') return <RiskBadge risk={value} className={className} />;
  if (type === 'status') return <StatusBadge status={value} className={className} />;
  if (type === 'severity') return <SeverityBadge severity={value} />;
  if (type === 'escalation') return <EscalationBadge level={value} />;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700 ${className}`}>
      {children || value}
    </span>
  );
};

export default Badge;
