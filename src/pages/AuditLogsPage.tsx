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
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Fingerprint,
  Link as LinkIcon,
  Cpu,
} from 'lucide-react';
import api from '../services/api';
import { AuditLogItem } from '../types';
import { Modal } from '../components/common/Modal';

export const AuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState('All');
  const [entityFilter, setEntityFilter] = useState('All');
  const [search, setSearch] = useState('');

  // Cryptographic Verification Modal state
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [simulateTamper, setSimulateTamper] = useState(false);
  const [integrityReport, setIntegrityReport] = useState<any | null>(null);

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

  const runIntegrityVerification = async (tamper: boolean = false) => {
    try {
      setVerifying(true);
      const res = await api.get('/audit-logs/verify-integrity', {
        params: { simulateTamper: tamper ? 'true' : 'false' },
      });
      setIntegrityReport(res.data);
    } catch (err) {
      console.error('Failed to verify audit chain:', err);
    } finally {
      setVerifying(false);
    }
  };

  const handleOpenVerifyModal = () => {
    setVerifyModalOpen(true);
    setSimulateTamper(false);
    runIntegrityVerification(false);
  };

  const handleToggleTamperSimulation = () => {
    const nextVal = !simulateTamper;
    setSimulateTamper(nextVal);
    runIntegrityVerification(nextVal);
  };

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

        <div className="flex items-center gap-2">
          {/* Cryptographic Proof Trigger */}
          <button
            onClick={handleOpenVerifyModal}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-300" />
            <span>Verify SHA-256 Hash Chain</span>
          </button>

          <button
            onClick={fetchLogs}
            className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors self-start sm:self-auto"
            title="Refresh Logs"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
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
          <span className="text-slate-400 font-mono">Server Time Sync: NTP IST · SHA-256 Chained</span>
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

      {/* Cryptographic Hash Chain Verification Modal */}
      {verifyModalOpen && (
        <Modal
          isOpen={verifyModalOpen}
          onClose={() => setVerifyModalOpen(false)}
          title="Cryptographic Hash Chain & Merkle Audit Trail Verification"
          size="2xl"
        >
          <div className="space-y-4">
            <p className="text-xs text-slate-500">
              Each administrative action is sealed into a tamper-evident SHA-256 hash chain linked to its predecessor block. Any unauthorized modification to row data breaks the chain at that exact block.
            </p>

            {verifying ? (
              <div className="py-12 flex flex-col items-center justify-center space-y-3">
                <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
                <p className="text-xs font-semibold text-slate-600">
                  Computing SHA-256 block digest across complete history...
                </p>
              </div>
            ) : integrityReport ? (
              <div className="space-y-4">
                {/* Proof Banner */}
                <div
                  className={`p-4 rounded-xl border flex items-start justify-between gap-3 ${
                    integrityReport.status === 'VERIFIED'
                      ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950'
                      : 'bg-rose-50/90 border-rose-300 text-rose-950'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {integrityReport.status === 'VERIFIED' ? (
                      <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle className="w-6 h-6 text-rose-600 flex-shrink-0 mt-0.5 animate-bounce" />
                    )}
                    <div>
                      <h4 className="text-sm font-bold">
                        {integrityReport.status === 'VERIFIED'
                          ? 'Ledger Integrity Verified: 100% Tamper-Evident'
                          : `Tampering Detected at Block #${integrityReport.tamperedBlockIndex}!`}
                      </h4>
                      <p className="text-xs mt-0.5 opacity-90">
                        {integrityReport.status === 'VERIFIED'
                          ? `All ${integrityReport.totalBlocksVerified} audit blocks have been validated using the ${integrityReport.algorithm}. No state modifications or sequence collisions detected.`
                          : `The cryptographic hash of Block #${integrityReport.tamperedBlockIndex} does not match its predecessor hash. A direct database modification was intercepted.`}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-extrabold uppercase ${
                        integrityReport.status === 'VERIFIED'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-rose-600 text-white animate-pulse'
                      }`}
                    >
                      {integrityReport.chainIntegrity}
                    </span>
                  </div>
                </div>

                {/* Hashes Summary Card */}
                <div className="p-3.5 bg-slate-900 rounded-xl text-white font-mono text-[11px] space-y-2">
                  <div className="flex justify-between items-center pb-1.5 border-b border-slate-800">
                    <span className="text-slate-400">Algorithm:</span>
                    <span className="text-amber-400 font-bold">{integrityReport.algorithm}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Genesis Block Seed:</span>
                    <span className="text-slate-300 break-all">{integrityReport.genesisHash}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Latest Verified Block Root Hash:</span>
                    <span className="text-emerald-400 font-bold break-all">{integrityReport.latestBlockHash}</span>
                  </div>
                </div>

                {/* Interactive Demonstration of Tamper Resistance */}
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">
                      Auditor Evaluation Simulator
                    </span>
                    <p className="text-[11px] text-slate-500">
                      Test system security by simulating an unauthorized SQL tampering attempt on Block #3.
                    </p>
                  </div>
                  <button
                    onClick={handleToggleTamperSimulation}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm ${
                      simulateTamper
                        ? 'bg-emerald-700 hover:bg-emerald-800 text-white'
                        : 'bg-rose-600 hover:bg-rose-700 text-white'
                    }`}
                  >
                    {simulateTamper ? '✓ Restore Original Ledger' : 'Simulate DB Tampering Attack'}
                  </button>
                </div>

                {/* Sample Blocks Chain List */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                    Recent Block Chain Linkages (Last 5 Entries):
                  </span>
                  <div className="space-y-1.5 max-h-48 overflow-y-auto">
                    {(integrityReport.sampleBlocks || []).map((b: any) => (
                      <div
                        key={b.index}
                        className={`p-2 rounded-lg border text-xs font-mono flex items-center justify-between ${
                          b.isValid
                            ? 'bg-white border-slate-200 text-slate-700'
                            : 'bg-rose-100 border-rose-300 text-rose-900 font-bold'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span className="px-1.5 py-0.5 bg-slate-100 rounded text-[10px] font-bold">
                            #{b.index}
                          </span>
                          <span className="font-sans font-semibold text-slate-900 truncate">
                            {b.action}
                          </span>
                          <span className="text-slate-400 text-[10px] truncate">
                            by {b.userName}
                          </span>
                        </div>
                        <div className="text-right flex-shrink-0 text-[10px]">
                          <span className="text-slate-400">Hash: </span>
                          <span className={b.isValid ? 'text-blue-700 font-bold' : 'text-rose-700 font-bold'}>
                            {b.blockHash.slice(0, 16)}...
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}

            {/* Footer */}
            <div className="flex justify-end pt-2 border-t border-slate-200">
              <button
                onClick={() => setVerifyModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold"
              >
                Close Verification Modal
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
