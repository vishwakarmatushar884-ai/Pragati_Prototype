import React from 'react';
import { Link } from 'react-router-dom';
import { Home, AlertTriangle } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <div className="w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center mb-4 border border-amber-300 dark:border-amber-800">
        <AlertTriangle className="w-8 h-8" />
      </div>
      <h1 className="text-4xl font-extrabold text-white">404</h1>
      <h2 className="text-xl font-bold text-slate-200 mt-2">Resource Not Found</h2>
      <p className="text-sm text-slate-400 mt-1 max-w-md">
        The requested PRAGATI project monitoring resource, scorecard, or telemetry route does not exist.
      </p>
      <Link
        to="/dashboard"
        className="mt-6 flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-all"
      >
        <Home className="w-4 h-4" />
        Return to Executive Dashboard
      </Link>
    </div>
  );
}
