import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthResponse, RoleName } from '../types';
import { authApi } from '../api/authApi';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  switchDemoRole: (role: string) => Promise<void>;
  hasRole: (role: RoleName | RoleName[]) => boolean;
  isSuperAdmin: boolean;
  isMinistryAdmin: boolean;
  isProjectManager: boolean;
  isFieldOfficer: boolean;
  isAuditor: boolean;
  isViewer: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('pragati_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('pragati_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const verifyAuth = async () => {
      if (token) {
        try {
          const profile = await authApi.getCurrentUser();
          setUser(profile);
          localStorage.setItem('pragati_user', JSON.stringify(profile));
        } catch (err) {
          console.error("Auth verification failed", err);
          logout();
        }
      }
      setIsLoading(false);
    };
    verifyAuth();
  }, [token]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const resp: AuthResponse = await authApi.login(email, password);
      localStorage.setItem('pragati_token', resp.token);
      const userObj: User = {
        id: resp.id,
        email: resp.email,
        fullName: resp.fullName,
        designation: resp.designation,
        ministry: resp.ministry,
        department: resp.department,
        roles: resp.roles
      };
      localStorage.setItem('pragati_user', JSON.stringify(userObj));
      setToken(resp.token);
      setUser(userObj);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('pragati_token');
    localStorage.removeItem('pragati_user');
    setToken(null);
    setUser(null);
  };

  const switchDemoRole = async (email: string) => {
    await login(email, 'Demo@123');
  };

  const hasRole = (role: RoleName | RoleName[]): boolean => {
    if (!user || !user.roles) return false;
    const checkRoles = Array.isArray(role) ? role : [role];
    return user.roles.some((r) => checkRoles.includes(r as RoleName));
  };

  const isSuperAdmin = hasRole('ROLE_SUPER_ADMIN');
  const isMinistryAdmin = hasRole('ROLE_MINISTRY_ADMIN');
  const isProjectManager = hasRole('ROLE_PROJECT_MANAGER');
  const isFieldOfficer = hasRole('ROLE_FIELD_OFFICER');
  const isAuditor = hasRole('ROLE_AUDITOR');
  const isViewer = hasRole('ROLE_VIEWER');

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        logout,
        switchDemoRole,
        hasRole,
        isSuperAdmin,
        isMinistryAdmin,
        isProjectManager,
        isFieldOfficer,
        isAuditor,
        isViewer
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
