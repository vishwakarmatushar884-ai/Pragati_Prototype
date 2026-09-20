import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Menu, 
  Search, 
  Bell, 
  UserCheck, 
  Clock, 
  ExternalLink,
  ChevronDown,
  CheckCircle2,
  AlertTriangle,
  Layers
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { projectsApi } from '../api/projectsApi';
import { Project } from '../types';

interface NavbarProps {
  onToggleSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const { user, switchDemoRole, isViewer } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const navigate = useNavigate();

  const [currentTime, setCurrentTime] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<Project[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isNotifOpen, setIsNotifOpen] = useState<boolean>(false);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState<boolean>(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const roleRef = useRef<HTMLDivElement>(null);

  // Live IST Clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Global search autocomplete
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.trim().length >= 2) {
        try {
          const results = await projectsApi.getProjects({ query: searchQuery.trim() });
          setSearchResults(results.slice(0, 6));
          setIsSearchOpen(true);
        } catch (e) {
          console.error(e);
        }
      } else {
        setSearchResults([]);
        setIsSearchOpen(false);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
      if (roleRef.current && !roleRef.current.contains(event.target as Node)) {
        setIsRoleDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const demoAccounts = [
    { email: 'admin@pragati.demo', role: 'SUPER_ADMIN', name: 'Shri Rajesh Verma, IAS (Cabinet Sec)' },
    { email: 'ministry@pragati.demo', role: 'MINISTRY_ADMIN', name: 'Dr. Sunita Deshmukh (Joint Sec MORTH)' },
    { email: 'manager@pragati.demo', role: 'PROJECT_MANAGER', name: 'Vikramaditya Rao (Project Director NHAI)' },
    { email: 'field@pragati.demo', role: 'FIELD_OFFICER', name: 'Ananya Sharma (Field Resident Eng)' },
    { email: 'auditor@pragati.demo', role: 'AUDITOR', name: 'K. S. Narayanan (CAG Infrastructure)' },
    { email: 'viewer@pragati.demo', role: 'VIEWER', name: 'Public / Stakeholder Observer' },
  ];

  return (
    <header className="sticky top-0 z-30 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
      {/* India Tricolor Header Stripe */}
      <div className="tricolor-stripe" />

      <div className="px-4 lg:px-6 py-2.5 flex items-center justify-between gap-4">
        {/* Left Section: Mobile Menu & Live Context */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400 font-medium">
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-slate-300 font-semibold">{currentTime}</span>
            <span className="text-slate-600">|</span>
            <span className="text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded text-[10px] font-bold">
              LIVE SYSTEM
            </span>
          </div>
        </div>

        {/* Middle Section: Global Search Input */}
        <div ref={searchRef} className="relative flex-1 max-w-md hidden md:block">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search projects by name, code, ministry, state..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchQuery.length >= 2 && setIsSearchOpen(true)}
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-9 pr-4 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
            />
          </div>

          {/* Autocomplete Dropdown */}
          {isSearchOpen && searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1.5 glass-dropdown rounded-xl border border-slate-700/80 shadow-2xl overflow-hidden z-50">
              <div className="p-2 border-b border-slate-800 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Matching Projects ({searchResults.length})
              </div>
              <div className="max-h-64 overflow-y-auto">
                {searchResults.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      setIsSearchOpen(false);
                      setSearchQuery('');
                      navigate(`/projects/${p.id}`);
                    }}
                    className="w-full text-left p-2.5 hover:bg-slate-800/60 border-b border-slate-800/50 flex items-center justify-between group transition-colors"
                  >
                    <div>
                      <p className="text-xs font-semibold text-slate-200 group-hover:text-blue-400">
                        {p.projectName}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {p.projectCode} • {p.ministry} ({p.state})
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                        SPI: {p.spi}
                      </span>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-blue-400" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Section: Role Switcher, Notifications, User */}
        <div className="flex items-center gap-3">
          {/* Quick Role Switcher for National Demo */}
          <div ref={roleRef} className="relative">
            <button
              onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
              className="flex items-center gap-2 px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 rounded-xl text-xs font-medium text-slate-200 transition-colors"
              title="Fast-switch demo user roles"
            >
              <UserCheck className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden sm:inline font-semibold text-blue-300">
                {user?.roles?.[0]?.replace('ROLE_', '') || 'ROLE'}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {isRoleDropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-72 glass-dropdown rounded-xl border border-slate-700/80 shadow-2xl p-2 z-50">
                <div className="px-2 py-1 text-[10px] font-bold text-amber-400 uppercase tracking-wider border-b border-slate-800 mb-1">
                  ⚡ Fast Role Switcher
                </div>
                {demoAccounts.map((acc) => (
                  <button
                    key={acc.email}
                    onClick={async () => {
                      setIsRoleDropdownOpen(false);
                      await switchDemoRole(acc.email);
                    }}
                    className={`w-full text-left p-2 rounded-lg text-xs flex items-center justify-between hover:bg-slate-800 transition-colors ${
                      user?.email === acc.email ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30' : 'text-slate-300'
                    }`}
                  >
                    <div>
                      <p className="font-bold text-[11px]">{acc.role}</p>
                      <p className="text-[10px] text-slate-400 truncate max-w-[200px]">{acc.name}</p>
                    </div>
                    {user?.email === acc.email && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Notification Center */}
          <div ref={notifRef} className="relative">
            <button
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="relative p-2 rounded-xl text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 transition-colors"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white rounded-full text-[10px] font-black flex items-center justify-center animate-bounce shadow-md">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {isNotifOpen && (
              <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 glass-dropdown rounded-2xl border border-slate-700/80 shadow-2xl overflow-hidden z-50">
                <div className="p-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-white">Notifications</span>
                    {unreadCount > 0 && (
                      <span className="px-1.5 py-0.5 bg-rose-500/20 text-rose-300 text-[10px] font-bold rounded-full border border-rose-500/30">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-xs text-blue-400 hover:text-blue-300 font-medium"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/60">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-400">
                      No notifications at this time
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => {
                          markAsRead(n.id);
                          if (n.relatedProjectId) {
                            setIsNotifOpen(false);
                            navigate(`/projects/${n.relatedProjectId}`);
                          }
                        }}
                        className={`p-3 text-left hover:bg-slate-800/50 cursor-pointer transition-colors ${
                          !n.isRead ? 'bg-blue-950/20' : ''
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          <div className="p-1.5 rounded-lg bg-slate-800 mt-0.5">
                            {n.type === 'ALERT' || n.type === 'ESCALATION' ? (
                              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                            ) : (
                              <Layers className="w-3.5 h-3.5 text-blue-400" />
                            )}
                          </div>
                          <div className="flex-1 overflow-hidden">
                            <p className="text-xs font-semibold text-slate-200 truncate">{n.title}</p>
                            <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5">{n.message}</p>
                            <p className="text-[9px] text-slate-500 mt-1">
                              {new Date(n.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
