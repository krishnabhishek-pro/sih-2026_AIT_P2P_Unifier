import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertOctagon,
  GitCompareArrows,
  Search,
  Eye,
  ArrowRight,
  TrendingUp,
  Building,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import api from '../services/api';
import { MetricCard } from '../components/common/MetricCard';
import { StatusBadge } from '../components/common/StatusBadge';
import { PriorityBadge } from '../components/common/PriorityBadge';
import { BureauBadge } from '../components/common/BureauBadge';
import { SlaEscalationBar } from '../components/common/SlaEscalationBar';
import { ComplaintDetailsModal } from './ComplaintDetailsModal';
import { DashboardStats, Complaint } from '../types';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedComplaintId, setSelectedComplaintId] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await api.get('/dashboard/stats');
      setStats(res.data);
    } catch (err) {
      console.error('Failed to load dashboard statistics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-sm font-semibold text-slate-600">Loading AICTE Grievance Monitoring Data...</p>
        </div>
      </div>
    );
  }

  const metrics = stats?.metrics || {
    totalComplaints: 50,
    pendingComplaints: 7,
    underReview: 27,
    resolvedComplaints: 7,
    overdueComplaints: 9,
    potentialOverlaps: 2,
    confirmedOverlaps: 1,
  };

  return (
    <div className="space-y-6">
      {/* Top Welcome & Quick Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">AICTE Central Grievance Monitoring Desk</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time inter-bureau tracking, statutory compliance, and collision detection across technical institutions.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => navigate('/hearings')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 font-bold text-xs transition-all"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Joint Hearings</span>
          </button>
          <button
            onClick={() => navigate('/analytics')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 font-bold text-xs transition-all"
          >
            <span>GIS Hotspots</span>
          </button>
          <button
            onClick={() => navigate('/overlaps')}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-sm transition-all"
          >
            <GitCompareArrows className="w-4 h-4" />
            <span>Overlap Center ({metrics.potentialOverlaps})</span>
          </button>
          <button
            onClick={fetchStats}
            className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
            title="Refresh Live Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 1. Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        <MetricCard
          title="Total Complaints"
          value={metrics.totalComplaints}
          subtitle="All bureaus combined"
          icon={FileText}
          variant="default"
          onClick={() => navigate('/complaints')}
        />
        <MetricCard
          title="Pending Initial"
          value={metrics.pendingComplaints}
          subtitle="Awaiting allocation"
          icon={Clock}
          variant="amber"
          onClick={() => navigate('/complaints?status=PENDING')}
        />
        <MetricCard
          title="Under Review"
          value={metrics.underReview}
          subtitle="Active investigation"
          icon={TrendingUp}
          variant="blue"
          onClick={() => navigate('/complaints?status=UNDER_REVIEW')}
        />
        <MetricCard
          title="Resolved Cases"
          value={metrics.resolvedComplaints}
          subtitle="Closed satisfactorily"
          icon={CheckCircle2}
          variant="emerald"
          onClick={() => navigate('/complaints?status=RESOLVED')}
        />
        <MetricCard
          title="Overdue (SLA)"
          value={metrics.overdueComplaints}
          subtitle=">30 days resolution"
          icon={AlertOctagon}
          variant="rose"
          alert={metrics.overdueComplaints > 0}
          onClick={() => navigate('/complaints?status=OVERDUE')}
        />
        <MetricCard
          title="Potential Overlaps"
          value={metrics.potentialOverlaps}
          subtitle="Cross-bureau collision"
          icon={GitCompareArrows}
          variant="purple"
          alert={metrics.potentialOverlaps > 0}
          onClick={() => navigate('/overlaps')}
        />
      </div>

      {/* 2. Visual Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* A. Complaint Trends (Line Chart) */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Complaint Inward vs Resolution Trends</h3>
              <p className="text-xs text-slate-500">Monthly receipt volume compared with disposal rate</p>
            </div>
            <span className="text-[11px] font-semibold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-md">
              Past 6 Months
            </span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats?.trendData || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px',
                    border: 'none',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Line type="monotone" dataKey="received" name="Received Inward" stroke="#2563eb" strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="resolved" name="Resolved / Closed" stroke="#10b981" strokeWidth={2.5} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="overdue" name="SLA Overdue" stroke="#ef4444" strokeWidth={2} strokeDasharray="4 4" dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* C. Complaint Status Distribution (Donut Chart) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Current Status Distribution</h3>
            <p className="text-xs text-slate-500">Distribution across active procedural stages</p>
          </div>
          <div className="h-56 relative my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats?.statusDistribution || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {(stats?.statusDistribution || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px',
                    border: 'none',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-black text-slate-900">{metrics.totalComplaints}</span>
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Grievances</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {(stats?.statusDistribution || []).map((s, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: s.color }} />
                <span className="text-slate-600 truncate">{s.name}:</span>
                <span className="font-bold text-slate-900 ml-auto">{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* B. Bureau-wise Distribution (Bar Chart) */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Bureau-wise Caseload & Redressal Status</h3>
            <p className="text-xs text-slate-500">Comparison of cases across Approval, Academic, Regulation, and Regional Bureaus</p>
          </div>
          <button
            onClick={() => navigate('/bureaus')}
            className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1"
          >
            <span>Bureau Details</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="h-60">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats?.bureauDistribution || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="bureauCode" tick={{ fontSize: 12, fill: '#475569', fontWeight: 600 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '12px',
                  border: 'none',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
              <Bar dataKey="total" name="Total Inward" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="pending" name="Active / Pending" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              <Bar dataKey="resolved" name="Resolved" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="overdue" name="Overdue" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* E. Overlap Alerts Notification Widget */}
      {stats?.overlapAlerts && stats.overlapAlerts.length > 0 && (
        <div className="bg-gradient-to-r from-amber-500/10 via-amber-50 to-orange-50 p-5 rounded-2xl border border-amber-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-amber-500 text-white rounded-lg shadow-sm">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-amber-950">
                  Cross-Bureau Overlap Alerts ({stats.overlapAlerts.length} Potential Multi-Bureau Cases Detected)
                </h3>
                <p className="text-xs text-amber-800">
                  Multiple Bureaus are currently processing parallel grievances against the same institution.
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate('/overlaps')}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-sm transition-colors whitespace-nowrap self-start sm:self-auto"
            >
              Open Overlap Center
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
            {stats.overlapAlerts.slice(0, 2).map((ov: any) => (
              <div key={ov.id} className="bg-white/90 p-3.5 rounded-xl border border-amber-200/80 shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-900 truncate max-w-[220px]">
                    {ov.institutionName}
                  </span>
                  <span className="text-xs font-black px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200">
                    {ov.matchScore}% Correlation
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-slate-600 mb-2">
                  <span className="bg-slate-100 px-2 py-0.5 rounded font-mono font-medium">{ov.c1.complaintNo} ({ov.c1.bureauCode})</span>
                  <span>↔</span>
                  <span className="bg-slate-100 px-2 py-0.5 rounded font-mono font-medium">{ov.c2.complaintNo} ({ov.c2.bureauCode})</span>
                </div>
                <p className="text-[11px] text-slate-500 line-clamp-1 italic">
                  {ov.reasons?.[0] || 'Potential correlation across departmental investigations'}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* D. Recent Complaints Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Recent Complaints & Cases</h3>
            <p className="text-xs text-slate-500">Latest grievances received at AICTE central registry</p>
          </div>
          <button
            onClick={() => navigate('/complaints')}
            className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1"
          >
            <span>View All Cases</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/75 border-b border-slate-200 text-slate-600 uppercase font-semibold">
              <tr>
                <th className="py-3 px-4">Complaint ID</th>
                <th className="py-3 px-4">Institution Name</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Assigned Bureau</th>
                <th className="py-3 px-4 w-36">Statutory SLA (30d)</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Current Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {(stats?.recentComplaints || []).map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4 font-mono font-semibold text-blue-700">{c.complaintNo}</td>
                  <td className="py-3 px-4 max-w-xs">
                    <p className="font-semibold text-slate-900 truncate">{c.institution.name}</p>
                    <p className="text-[10px] text-slate-400 font-mono">ID: {c.institution.aicteId}</p>
                  </td>
                  <td className="py-3 px-4 text-slate-600 max-w-[180px] truncate">{c.category}</td>
                  <td className="py-3 px-4">
                    <BureauBadge code={c.bureau.code} name={c.bureau.name} />
                  </td>
                  <td className="py-3 px-4 w-36">
                    <SlaEscalationBar complaint={c} variant="compact" />
                  </td>
                  <td className="py-3 px-4">
                    <PriorityBadge priority={c.priority} />
                  </td>
                  <td className="py-3 px-4">
                    <StatusBadge status={c.status} size="sm" />
                  </td>
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <button
                      onClick={() => setSelectedComplaintId(c.id)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 font-medium transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Details</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Complaint Details Modal */}
      {selectedComplaintId && (
        <ComplaintDetailsModal
          complaintId={selectedComplaintId}
          onClose={() => setSelectedComplaintId(null)}
          onUpdate={fetchStats}
        />
      )}
    </div>
  );
};

