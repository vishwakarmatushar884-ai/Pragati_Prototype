import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Layers, 
  MapPin, 
  Sparkles, 
  Bell, 
  AlertTriangle,
  FileText, 
  History, 
  Settings, 
  LogOut,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
  const { user, logout, isSuperAdmin, isAuditor } = useAuth();
  const navigate = useNavigate();

  const { isViewer, isMinistryAdmin } = useAuth();

  // Public / Viewer only gets access to public-facing transparency modules
  const navItems = isViewer
    ? [
        { name: 'Public Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { name: 'Projects Hub', path: '/projects', icon: Layers },
        { name: 'GIS India Map', path: '/map', icon: MapPin },
        { name: 'Executive Reports', path: '/reports', icon: FileText },
      ]
    : [
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { name: 'Projects Hub', path: '/projects', icon: Layers },
        { name: 'GIS India Map', path: '/map', icon: MapPin },
        { name: 'Risk & AI Engine', path: '/risk', icon: Sparkles },
        { name: 'Alerts & Escalations', path: '/alerts', icon: AlertTriangle },
        { name: 'Issues Tracker', path: '/issues', icon: Bell },
        { name: 'Executive Reports', path: '/reports', icon: FileText },
      ];

  if (!isViewer && (isSuperAdmin || isAuditor)) {
    navItems.push({ name: 'Audit Trail', path: '/audit', icon: History });
  }

  if (!isViewer && (isSuperAdmin || isMinistryAdmin)) {
    navItems.push({ name: 'Admin Settings', path: '/settings', icon: Settings });
  }

  return (
    <aside
      className={`fixed top-0 left-0 z-40 h-screen transition-transform ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 w-64 bg-slate-950 border-r border-slate-800/80 flex flex-col justify-between`}
    >
      <div>
        {/* Government of India & Platform Brand Header */}
        <div className="p-5 border-b border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 via-white to-emerald-600 p-0.5 shadow-lg shadow-amber-500/10">
            <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-emerald-400 text-lg">
              P
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-white text-base tracking-wider">PRAGATI</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded">
                v2.0
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium tracking-tight truncate">Govt of India Project Monitor</p>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-190px)]">
          <div className="px-3 py-2 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
            Monitoring Modules
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20 font-semibold'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.name}</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 opacity-50" />
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* User Card & Logout */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-900/40">
        <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between mb-2">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-blue-950 border border-blue-600/40 flex items-center justify-center text-xs font-bold text-blue-300 shrink-0">
              {user?.fullName?.charAt(0) || 'U'}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-slate-200 truncate">{user?.fullName || 'Official'}</p>
              <p className="text-[10px] text-blue-400 font-medium truncate">
                {user?.roles?.[0]?.replace('ROLE_', '') || 'VIEWER'}
              </p>
            </div>
          </div>
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
        </div>

        <button
          onClick={() => {
            logout();
            navigate('/login');
          }}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-500/10 border border-rose-500/20 rounded-xl transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
