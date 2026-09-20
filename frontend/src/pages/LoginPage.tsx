import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Shield, Lock, Mail, ArrowRight, CheckCircle2, Sparkles, Building2, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginPage: React.FC = () => {
  const { login, switchDemoRole } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid email or password credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (demoEmail: string) => {
    setError('');
    setLoading(true);
    try {
      await switchDemoRole(demoEmail);
      navigate('/dashboard');
    } catch (err: any) {
      setError('Failed to authenticate with demo credentials.');
    } finally {
      setLoading(false);
    }
  };

  const demoAccounts = [
    {
      role: 'SUPER_ADMIN',
      title: 'Chief PMO Officer (IAS)',
      email: 'admin@pragati.demo',
      desc: 'Full platform administration, apex oversight & escalation clearance',
      badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    },
    {
      role: 'MINISTRY_ADMIN',
      title: 'Joint Secretary (MORTH)',
      email: 'ministry@pragati.demo',
      desc: 'Ministry portfolio governance, Level 1 escalations & DPR approvals',
      badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
    },
    {
      role: 'PROJECT_MANAGER',
      title: 'Project Director (NHAI)',
      email: 'manager@pragati.demo',
      desc: 'Project milestones, EVM monitoring, expenditure & issue resolution',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    },
    {
      role: 'FIELD_OFFICER',
      title: 'Resident Field Engineer',
      email: 'field@pragati.demo',
      desc: 'On-site progress reporting, site inspections & field issue logging',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    },
    {
      role: 'AUDITOR',
      title: 'Principal Auditor (CAG)',
      email: 'auditor@pragati.demo',
      desc: 'Read-only financial compliance inspection & immutable audit logs',
      badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
    },
    {
      role: 'VIEWER',
      title: 'Public / Stakeholder',
      email: 'viewer@pragati.demo',
      desc: 'Executive portfolio dashboard & public transparency viewer',
      badgeColor: 'bg-slate-500/20 text-slate-300 border-slate-500/40',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-between relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Tricolor Bar */}
      <div className="tricolor-stripe" />

      {/* Main Container */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-12 z-10">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Hero Brand Panel */}
          <div className="lg:col-span-6 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Government of India</span>
            </div>

            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 via-white to-emerald-600 p-0.5 shadow-xl shadow-amber-500/20">
                  <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-emerald-400 text-2xl">
                    P
                  </div>
                </div>
                <div>
                  <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">PRAGATI</h1>
                  <p className="text-xs text-amber-400 font-bold tracking-widest uppercase">प्रगति • राष्ट्र निर्माण की गति</p>
                </div>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-200 mt-3">
                Integrated Project Monitoring Platform with Explainable AI Risk Insights
              </h2>
              <p className="text-sm text-slate-400 mt-2 leading-relaxed">
                Centralized real-time monitoring of Government of India infrastructure projects with automated Earned Value Management (EVM), SHAP Explainable AI risk forecasting, and 2-level automated alert escalations.
              </p>
            </div>

            {/* Feature Highlights */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>EVM SPI/CPI Engine</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>SHAP Explainable AI</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>2-Level Auto Escalation</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Interactive GIS Mapping</span>
              </div>
            </div>
          </div>

          {/* Right Login & Demo Role Panel */}
          <div className="lg:col-span-6 space-y-5">
            <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800/80 shadow-2xl">
              <div className="mb-6">
                <h3 className="text-lg font-bold text-white">Government Official Sign In</h3>
                <p className="text-xs text-slate-400 mt-0.5">Enter authorized credentials to access your monitoring dashboard</p>
              </div>

              {searchParams.get('session_expired') && (
                <div className="mb-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs">
                  Your session has expired. Please sign in again.
                </div>
              )}

              {error && (
                <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Official Email ID</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. admin@pragati.demo"
                      className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-sm transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? 'Authenticating...' : 'Sign In to Portal'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {/* Demo Accounts Quick Selection */}
              <div className="mt-6 pt-5 border-t border-slate-800">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    1-Click National Demo Roles
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                  {demoAccounts.map((acc) => (
                    <button
                      key={acc.email}
                      type="button"
                      onClick={() => handleDemoLogin(acc.email)}
                      className="text-left p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 transition-all group"
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${acc.badgeColor}`}>
                          {acc.role}
                        </span>
                        <ArrowRight className="w-3 h-3 text-slate-600 group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all" />
                      </div>
                      <p className="text-xs font-bold text-slate-200 mt-1.5 truncate">{acc.title}</p>
                      <p className="text-[10px] text-slate-400 truncate">{acc.email}</p>
                    </button>
                  ))}
                </div>

                <p className="text-[10px] text-slate-500 italic mt-2.5 text-center">
                  All demo accounts use the same password: Demo@123
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-4 border-t border-slate-900 bg-slate-950/80 text-center text-xs text-slate-500">Government of India</footer>
    </div>
  );
};
