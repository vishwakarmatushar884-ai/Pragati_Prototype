import React, { useState } from 'react';
import { Sparkles, RefreshCw, UserCheck, Check, ShieldAlert } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { mockApiAdapter } from '../../api/mockApiAdapter';

export const DemoModeBanner: React.FC = () => {
  const { user, switchDemoRole } = useAuth();
  const [isResetting, setIsResetting] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleReset = () => {
    setIsResetting(true);
    mockApiAdapter.resetDemoData();
    setResetSuccess(true);
    setTimeout(() => {
      window.location.reload();
    }, 600);
  };

  const quickRoles = [
    { email: 'admin@pragati.demo', label: 'PMO Admin (IAS)', color: 'border-purple-500/50 bg-purple-500/10 text-purple-300' },
    { email: 'ministry@pragati.demo', label: 'Ministry Admin', color: 'border-blue-500/50 bg-blue-500/10 text-blue-300' },
    { email: 'manager@pragati.demo', label: 'NHAI Manager', color: 'border-amber-500/50 bg-amber-500/10 text-amber-300' },
    { email: 'field@pragati.demo', label: 'Field Engineer', color: 'border-emerald-500/50 bg-emerald-500/10 text-emerald-300' },
    { email: 'auditor@pragati.demo', label: 'CAG Auditor', color: 'border-indigo-500/50 bg-indigo-500/10 text-indigo-300' },
  ];

  return (
    <div className="bg-slate-900/90 border-b border-blue-500/30 text-xs px-3 py-1.5 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        {/* Status indicator */}
        <div className="flex items-center space-x-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-semibold text-emerald-400 uppercase tracking-wider text-[11px] flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400 inline" />
            Standalone Prototype Mode
          </span>
          <span className="hidden sm:inline text-slate-400 text-[11px]">
            • 20 National Infrastructure Projects Active
          </span>
        </div>

        {/* Quick Role Switcher */}
        <div className="flex items-center flex-wrap gap-1.5">
          <span className="text-slate-400 text-[11px] hidden md:inline flex items-center gap-1">
            <UserCheck className="w-3 h-3 inline" /> Switch Role:
          </span>
          {quickRoles.map((r) => {
            const isActive = user?.email === r.email;
            return (
              <button
                key={r.email}
                onClick={() => switchDemoRole(r.email)}
                className={`px-2 py-0.5 rounded text-[10px] font-medium border transition-all ${
                  isActive
                    ? `${r.color} ring-1 ring-white/30 font-bold`
                    : 'border-slate-800 bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
                title={`Switch active session to ${r.label}`}
              >
                {isActive ? '✓ ' : ''}{r.label}
              </button>
            );
          })}

          {/* Reset Demo Data Button */}
          <button
            onClick={handleReset}
            disabled={isResetting}
            className="ml-1 px-2 py-0.5 rounded text-[10px] font-medium border border-rose-500/40 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 transition-all flex items-center gap-1"
            title="Reset all projects, issues, and alerts to default clean demo state"
          >
            {resetSuccess ? (
              <>
                <Check className="w-2.5 h-2.5 text-emerald-400" /> Reset!
              </>
            ) : (
              <>
                <RefreshCw className={`w-2.5 h-2.5 ${isResetting ? 'animate-spin' : ''}`} /> Reset Data
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
