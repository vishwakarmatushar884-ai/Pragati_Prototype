import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { ShieldAlert } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <LoadingSpinner size="lg" text="Authenticating PRAGATI session..." />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const userRoles = user.roles || (user.role ? [`ROLE_${user.role}`, user.role] : []);
  const userPrimaryRole = userRoles[0]?.replace('ROLE_', '') || user.role || 'VIEWER';

  if (allowedRoles && allowedRoles.length > 0) {
    const hasPermission = allowedRoles.some(role => 
      userRoles.includes(role) || 
      userRoles.includes(`ROLE_${role}`) || 
      userPrimaryRole === role
    );

    if (!hasPermission) {
      return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mb-3">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-white">Access Denied (403)</h2>
          <p className="text-xs text-slate-400 mt-1 max-w-sm">
            Your active role (<strong className="font-mono text-blue-400">{userPrimaryRole}</strong>) does not possess sufficient privileges to view this administrative module.
          </p>
        </div>
      );
    }
  }

  return <>{children}</>;
}
