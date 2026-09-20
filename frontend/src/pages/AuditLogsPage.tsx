import React, { useState, useEffect } from 'react';
import { auditApi } from '../api/auditApi';
import { AuditLogDTO } from '../types';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Modal from '../components/common/Modal';
import EmptyState from '../components/common/EmptyState';
import {
  ShieldCheck,
  Search,
  Filter,
  Calendar,
  User,
  Eye,
  Activity,
  FileCode,
  Lock,
  Globe,
  Tag
} from 'lucide-react';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLogDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');
  const [entityFilter, setEntityFilter] = useState('ALL');

  // Selected Log for JSON payload inspection
  const [selectedLog, setSelectedLog] = useState<AuditLogDTO | null>(null);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const data = await auditApi.getAllLogs();
      setLogs(data);
      setError(null);
    } catch (err: any) {
      console.error('Failed to load audit logs', err);
      setError('Unable to fetch audit logs from secure backend.');
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch =
      (log.action && log.action.toLowerCase().includes(search.toLowerCase())) ||
      (log.userName && log.userName.toLowerCase().includes(search.toLowerCase())) ||
      (log.entityName && log.entityName.toLowerCase().includes(search.toLowerCase())) ||
      (log.details && log.details.toLowerCase().includes(search.toLowerCase()));
    const matchesAction = actionFilter === 'ALL' || log.action === actionFilter;
    const matchesEntity = entityFilter === 'ALL' || log.entityName === entityFilter;
    return matchesSearch && matchesAction && matchesEntity;
  });

  const actions = Array.from(new Set(logs.map(l => l.action))).filter(Boolean);
  const entities = Array.from(new Set(logs.map(l => l.entityName))).filter(Boolean);

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-950/60 text-emerald-300 border border-emerald-900/50 flex items-center gap-1">
              <Lock className="w-3 h-3" />
              Statutory Compliance & Traceability
            </span>
            <span className="text-xs text-slate-400">Append-Only Immutable Ledger</span>
          </div>
          <h1 className="text-2xl font-bold text-white mt-1">
            System Audit Trail & Security Event Logs
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Complete verifiable log of project updates, EVM recalculations, escalations, issue resolutions, and user logins.
          </p>
        </div>

        <button
          onClick={loadLogs}
          className="flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-lg transition-colors self-start md:self-auto"
        >
          <Activity className="w-3.5 h-3.5" />
          Refresh Trail
        </button>
      </div>

      {/* Filters */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search action, officer, or details..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-600"
          />
        </div>

        <div>
          <select
            value={actionFilter}
            onChange={e => setActionFilter(e.target.value)}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100"
          >
            <option value="ALL">All Event Actions ({actions.length})</option>
            {actions.map(act => (
              <option key={act} value={act}>{act}</option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={entityFilter}
            onChange={e => setEntityFilter(e.target.value)}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100"
          >
            <option value="ALL">All Entity Types ({entities.length})</option>
            {entities.map(ent => (
              <option key={ent} value={ent}>{ent}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <LoadingSpinner size="lg" text="Querying immutable audit records..." />
        </div>
      ) : error ? (
        <div className="p-4 bg-red-950/40 border border-red-900/50 rounded-xl text-red-400 text-sm">
          {error}
        </div>
      ) : filteredLogs.length === 0 ? (
        <EmptyState
          title="No Audit Logs Found"
          description="Try broadening your search query or removing filter parameters."
        />
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                <tr>
                  <th className="p-3">Log ID</th>
                  <th className="p-3">Timestamp</th>
                  <th className="p-3">User / Officer</th>
                  <th className="p-3">Action</th>
                  <th className="p-3">Target Entity</th>
                  <th className="p-3">Summary</th>
                  <th className="p-3 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3 font-mono text-slate-400 font-bold">#{log.id}</td>
                    <td className="p-3 font-mono text-slate-300">
                      {log.timestamp ? new Date(log.timestamp).toLocaleString() : 'N/A'}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-1.5 font-semibold text-white">
                        <User className="w-3.5 h-3.5 text-blue-600" />
                        {log.userName || log.userEmail || 'System'}
                      </div>
                      {log.ipAddress && (
                        <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                          <Globe className="w-2.5 h-2.5" />
                          {log.ipAddress}
                        </span>
                      )}
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-md font-mono text-[11px] font-bold ${
                        log.action.includes('CREATE') || log.action.includes('REGISTER')
                          ? 'bg-emerald-950/60 text-emerald-300'
                          : log.action.includes('ESCALAT')
                          ? 'bg-purple-950/60 text-purple-300'
                          : log.action.includes('UPDATE')
                          ? 'bg-blue-950/60 text-blue-300'
                          : log.action.includes('RESOLV')
                          ? 'bg-emerald-950/60 text-emerald-300'
                          : 'bg-slate-800 text-slate-300'
                      }`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="p-3 font-medium text-slate-300">
                      {log.entityName} {log.entityId ? `(#${log.entityId})` : ''}
                    </td>
                    <td className="p-3 text-slate-300 max-w-sm truncate">
                      {log.details || 'Action completed successfully.'}
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-md bg-slate-800 hover:bg-slate-700 text-slate-700 dark:text-slate-200"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedLog && (
        <Modal
          isOpen={!!selectedLog}
          onClose={() => setSelectedLog(null)}
          title={`Audit Record #${selectedLog.id} Details`}
          size="md"
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-400">Timestamp:</span>
                  <p className="font-mono font-semibold text-slate-200">
                    {selectedLog.timestamp ? new Date(selectedLog.timestamp).toISOString() : 'N/A'}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400">Action:</span>
                  <p className="font-mono font-bold text-blue-600">{selectedLog.action}</p>
                </div>
                <div>
                  <span className="text-slate-400">Initiated By:</span>
                  <p className="font-semibold text-slate-200">
                    {selectedLog.userName} ({selectedLog.userEmail || 'System Agent'})
                  </p>
                </div>
                <div>
                  <span className="text-slate-400">Target Entity:</span>
                  <p className="font-semibold text-slate-200">
                    {selectedLog.entityName} ID: {selectedLog.entityId || 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <FileCode className="w-4 h-4 text-slate-500" />
                Raw Event Payload & Audit Remarks
              </h4>
              <div className="p-3 bg-slate-900 text-emerald-400 font-mono rounded-lg overflow-x-auto max-h-60 text-xs">
                {selectedLog.details || 'No extended metadata stored.'}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-1.5 bg-slate-800 text-white rounded-lg text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
