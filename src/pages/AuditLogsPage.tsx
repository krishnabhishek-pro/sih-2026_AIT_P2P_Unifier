import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Search,
  Filter,
  RefreshCw,
  Clock,
  User,
  Activity,
  Download,
  Lock,
} from 'lucide-react';
import api from '../services/api';
import { AuditLogItem } from '../types';

export const AuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState('All');
  const [entityFilter, setEntityFilter] = useState('All');
  const [search, setSearch] = useState('');

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await api.get('/audit-logs', {
        params: {
          action: actionFilter !== 'All' ? actionFilter : undefined,
          entityType: entityFilter !== 'All' ? entityFilter : undefined,
          limit: 100,
        },
      });
      setLogs(res.data);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [actionFilter, entityFilter]);

  const filteredLogs = logs.filter((l) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      l.userName.toLowerCase().includes(q) ||
      l.details.toLowerCase().includes(q) ||
      l.action.toLowerCase().includes(q) ||
      (l.entityId && l.entityId.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Vigilance Audit Trail & Activity Logs</h2>
            <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
              <Lock className="w-3 h-3" />
              <span>Immutable Ledger</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Cryptographically timestamped log of all status transitions, inter-bureau case reallocations, and overlap decisions.
          </p>
        </div>

        <button
          onClick={fetchLogs}
          className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors self-start sm:self-auto"
          title="Refresh Logs"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by official name, entity ID, or activity description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-semibold w-full sm:w-auto"
          >
            <option value="All">All Regulatory Actions</option>
            <option value="LOGIN">LOGIN</option>
            <option value="COMPLAINT_STATUS_UPDATED">STATUS UPDATES</option>
            <option value="OVERLAP_CONFIRMED">OVERLAP CONFIRMED</option>
            <option value="OVERLAP_REJECTED">OVERLAP REJECTED</option>
            <option value="BUREAU_TRANSFERRED">BUREAU TRANSFERS</option>
            <option value="OFFICER_REASSIGNED">OFFICER ASSIGNED</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between text-xs">
          <span className="font-bold text-slate-900">Recorded Activity Logs ({filteredLogs.length})</span>
          <span className="text-slate-400 font-mono">Server Time Sync: NTP IST</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/75 border-b border-slate-200 text-slate-600 uppercase font-semibold">
              <tr>
                <th className="py-3 px-4">Timestamp (IST)</th>
                <th className="py-3 px-4">Authorized Official</th>
                <th className="py-3 px-4">Action Type</th>
                <th className="py-3 px-4">Entity Type</th>
                <th className="py-3 px-4">Entity / Case Ref</th>
                <th className="py-3 px-4">Operation Substance</th>
                <th className="py-3 px-4 text-right">Node IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500 font-medium">
                    Querying audit trail records...
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500 font-medium">
                    No audit records found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  let actionBadge = 'bg-slate-100 text-slate-800 border-slate-200';
                  if (log.action.includes('CONFIRMED')) actionBadge = 'bg-blue-50 text-blue-800 border-blue-200 font-bold';
                  else if (log.action.includes('REJECTED')) actionBadge = 'bg-rose-50 text-rose-800 border-rose-200';
                  else if (log.action.includes('TRANSFER')) actionBadge = 'bg-purple-50 text-purple-800 border-purple-200';
                  else if (log.action.includes('STATUS')) actionBadge = 'bg-amber-50 text-amber-800 border-amber-200';

                  return (
                    <tr key={log.id} className="hover:bg-slate-50">
                      <td className="py-3 px-4 whitespace-nowrap font-mono text-slate-500">
                        {new Date(log.createdAt).toLocaleString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <p className="font-bold text-slate-900">{log.userName}</p>
                        <p className="text-[10px] text-slate-400">{log.userRole.replace(/_/g, ' ')}</p>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded text-[10px] border ${actionBadge}`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600 whitespace-nowrap font-semibold">
                        {log.entityType}
                      </td>
                      <td className="py-3 px-4 font-mono font-semibold text-blue-700 whitespace-nowrap">
                        {log.entityId || 'N/A'}
                      </td>
                      <td className="py-3 px-4 text-slate-700 max-w-md">
                        {log.details}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-[11px] text-slate-400 whitespace-nowrap">
                        {log.ipAddress}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

