import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Download,
  Calendar,
  Building,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RefreshCw,
  Printer,
  FileSpreadsheet,
  MapPin,
  ShieldAlert,
} from 'lucide-react';
import { GisHotspotMap } from '../components/analytics/GisHotspotMap';
import { ExecutiveDossierModal } from '../components/analytics/ExecutiveDossierModal';
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

export const AnalyticsPage: React.FC = () => {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('FY 2025-26');
  const [executiveDossierOpen, setExecutiveDossierOpen] = useState(false);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await api.get('/analytics');
      setData(res.data);
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const handleExportCSV = () => {
    if (!data) return;
    const headers = ['Institution Name', 'Permanent ID', 'State', 'Total Complaints', 'Pending', 'Resolved'];
    const rows = (data.topInstitutions || []).map((i: any) => [
      `"${i.name}"`,
      i.aicteId,
      i.state,
      i.totalComplaints,
      i.pendingComplaints,
      i.resolvedComplaints,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e: any[]) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `AICTE_AUGMS_Institution_Grievance_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading || !data) {
    return (
      <div className="py-20 flex justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const s = data.summary;
  const COLORS = ['#2563eb', '#f59e0b', '#10b981', '#8b5cf6', '#ec4899', '#06b6d4'];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm no-print">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">AICTE Executive Analytics & Regulatory Reports</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Systemic institutional compliance metrics, inter-bureau resolution velocity, and multi-bureau collision trends.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
          >
            <option value="FY 2025-26">FY 2025-26 (Current)</option>
            <option value="FY 2024-25">FY 2024-25 (Audited)</option>
            <option value="Past 90 Days">Past 90 Days</option>
          </select>
          <button
            onClick={() => setExecutiveDossierOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs shadow-sm transition-all"
            title="Generate AICTE Council / EC Board Meeting Dossier"
          >
            <ShieldAlert className="w-4 h-4 text-purple-300" />
            <span>EC Board Dossier</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors"
            title="Download CSV Dataset"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-colors"
            title="Print or Save PDF"
          >
            <Printer className="w-4 h-4" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* High-Level Statutory Performance KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Docket Inward</span>
          <div className="text-2xl font-black text-slate-900 mt-1">{s.totalComplaints}</div>
          <span className="text-[11px] text-emerald-600 font-semibold">{s.resolutionRate}% Overall Disposal Rate</span>
        </div>
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Avg Resolution Speed</span>
          <div className="text-2xl font-black text-blue-700 mt-1">{s.averageResolutionDays} Days</div>
          <span className="text-[11px] text-slate-500">Target SLA: 30 Days</span>
        </div>
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Overdue (SLA Breached)</span>
          <div className="text-2xl font-black text-rose-600 mt-1">{s.overdueComplaints}</div>
          <span className="text-[11px] text-rose-600 font-medium">Escalated to Bureau Heads</span>
        </div>
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Cross-Bureau Collisions</span>
          <div className="text-2xl font-black text-amber-600 mt-1">{s.totalOverlaps}</div>
          <span className="text-[11px] text-amber-700 font-semibold">{s.confirmedOverlaps} Confirmed Joint Inquiries</span>
        </div>
      </div>

      {/* Geospatial Hotspot Map */}
      <div className="space-y-3">
        <GisHotspotMap />
      </div>

      {/* Visual Charts Row 1: Line trends & Category Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trend Chart */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Monthly Receipt vs Disposal Trends</h3>
              <p className="text-xs text-slate-500">6-Month longitudinal grievance tracking</p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.monthlyTrends || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Line type="monotone" dataKey="received" name="Inward Grievances" stroke="#2563eb" strokeWidth={2.5} />
                <Line type="monotone" dataKey="resolved" name="Resolved Cases" stroke="#10b981" strokeWidth={2.5} />
                <Line type="monotone" dataKey="overdue" name="SLA Breaches" stroke="#ef4444" strokeWidth={2} strokeDasharray="3 3" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown Bar Chart */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Complaints by Regulatory Violation Category</h3>
              <p className="text-xs text-slate-500">Distribution across major non-compliance areas</p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data.categoryDistribution || []}
                layout="vertical"
                margin={{ top: 10, right: 20, left: 40, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: '#334155' }} width={120} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="count" name="Grievances" fill="#4f46e5" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Visual Charts Row 2: Inward Channel & Bureau Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Inward Channel Pie Chart */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Inward Submission Channels</h3>
            <p className="text-xs text-slate-500">Distribution of portals & sources</p>
          </div>
          <div className="h-56 relative my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.sourceDistribution || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  dataKey="count"
                >
                  {(data.sourceDistribution || []).map((_entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {(data.sourceDistribution || []).map((s: any, idx: number) => (
              <div key={idx} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                <span className="text-slate-600 truncate">{s.name}:</span>
                <span className="font-bold text-slate-900 ml-auto">{s.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bureau Performance Table / Chart */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Bureau Resolution Rate & Disposal SLA</h3>
              <p className="text-xs text-slate-500">Bureau efficiency comparison</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-semibold">
                <tr>
                  <th className="py-2.5 px-3">Bureau Code</th>
                  <th className="py-2.5 px-3">Bureau Name</th>
                  <th className="py-2.5 px-3 text-center">Total Inward</th>
                  <th className="py-2.5 px-3 text-center">Resolved</th>
                  <th className="py-2.5 px-3 text-center">Disposal Rate</th>
                  <th className="py-2.5 px-3 text-right">Avg SLA (Days)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(data.bureauPerformance || []).map((b: any) => (
                  <tr key={b.bureauCode} className="hover:bg-slate-50">
                    <td className="py-3 px-3 font-mono font-bold text-blue-700">{b.bureauCode}</td>
                    <td className="py-3 px-3 font-semibold text-slate-900">{b.bureauName}</td>
                    <td className="py-3 px-3 text-center font-bold text-slate-800">{b.total}</td>
                    <td className="py-3 px-3 text-center font-semibold text-emerald-700">{b.resolved}</td>
                    <td className="py-3 px-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-16 bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${b.rate}%` }} />
                        </div>
                        <span className="font-bold text-slate-800">{b.rate}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-slate-700">{b.avgDays}d</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Top Grievance Hotspots Table (Institutions with Most Inquiries) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between text-xs">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Institutional Grievance Hotspots</h3>
            <p className="text-slate-500">Institutions receiving highest volume of concurrent complaints</p>
          </div>
          <span className="text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full font-bold">
            Priority Vigilance Watchlist
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/75 border-b border-slate-200 text-slate-600 uppercase font-semibold">
              <tr>
                <th className="py-3 px-4">AICTE ID</th>
                <th className="py-3 px-4">Institution Name</th>
                <th className="py-3 px-4">State</th>
                <th className="py-3 px-4 text-center">Total Inward</th>
                <th className="py-3 px-4 text-center">Active Inquiries</th>
                <th className="py-3 px-4 text-center">Resolved Cases</th>
                <th className="py-3 px-4 text-right">Risk Assessment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {(data.topInstitutions || []).map((inst: any) => (
                <tr key={inst.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-mono font-bold text-blue-700">{inst.aicteId}</td>
                  <td className="py-3 px-4 font-bold text-slate-900">{inst.name}</td>
                  <td className="py-3 px-4 text-slate-600">{inst.state}</td>
                  <td className="py-3 px-4 text-center font-bold text-slate-900">{inst.totalComplaints}</td>
                  <td className="py-3 px-4 text-center">
                    <span className="px-2 py-0.5 rounded font-bold bg-amber-50 text-amber-800 border border-amber-200">
                      {inst.pendingComplaints}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center font-semibold text-emerald-700">{inst.resolvedComplaints}</td>
                  <td className="py-3 px-4 text-right">
                    <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                      inst.pendingComplaints > 2 ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {inst.pendingComplaints > 2 ? 'High Scrutiny' : 'Monitored'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Executive Board Meeting Dossier Modal */}
      <ExecutiveDossierModal
        isOpen={executiveDossierOpen}
        onClose={() => setExecutiveDossierOpen(false)}
        analyticsData={data}
      />
    </div>
  );
};
