import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import { MainLayout } from '../layouts/MainLayout';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';
import { ProjectsPage } from '../pages/ProjectsPage';
import { ProjectDetailPage } from '../pages/ProjectDetailPage';
import { GISMapPage } from '../pages/GISMapPage';
import IssuesPage from '../pages/IssuesPage';
import AlertsPage from '../pages/AlertsPage';
import RiskAnalysisPage from '../pages/RiskAnalysisPage';
import ReportsPage from '../pages/ReportsPage';
import AuditLogsPage from '../pages/AuditLogsPage';
import SettingsPage from '../pages/SettingsPage';
import NotFoundPage from '../pages/NotFoundPage';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Login Route */}
      <Route path="/login" element={<LoginPage />} />

      {/* Protected Routes inside MainLayout */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="projects" element={<ProjectsPage />} />
        <Route path="projects/:id" element={<ProjectDetailPage />} />
        <Route path="map" element={<GISMapPage />} />
        <Route path="issues" element={<IssuesPage />} />
        <Route path="alerts" element={<AlertsPage />} />
        <Route path="risk" element={<RiskAnalysisPage />} />
        <Route path="risk-ai" element={<Navigate to="/risk" replace />} />
        <Route path="reports" element={<ReportsPage />} />

        {/* Auditor & Admin restricted routes */}
        <Route
          path="audit"
          element={
            <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'MINISTRY_ADMIN', 'AUDITOR']}>
              <AuditLogsPage />
            </ProtectedRoute>
          }
        />

        {/* Settings */}
        <Route
          path="settings"
          element={
            <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'MINISTRY_ADMIN']}>
              <SettingsPage />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<NotFoundPage />} />
      </Route>

      {/* Global Fallback */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
