import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  FileText,
  Search,
  Filter,
  PlusCircle,
  Eye,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Download,
  AlertTriangle,
} from 'lucide-react';
import api from '../services/api';
import { StatusBadge } from '../components/common/StatusBadge';
import { PriorityBadge } from '../components/common/PriorityBadge';
import { BureauBadge } from '../components/common/BureauBadge';
import { SlaEscalationBar } from '../components/common/SlaEscalationBar';
import { ComplaintDetailsModal } from './ComplaintDetailsModal';
import { RegisterComplaintModal } from './RegisterComplaintModal';
import { Complaint } from '../types';

export const ComplaintsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);

  // Filters
  const [search, setSearch] = useState<string>(searchParams.get('search') || '');
  const [bureau, setBureau] = useState<string>(searchParams.get('bureau') || 'All');
  const [status, setStatus] = useState<string>(searchParams.get('status') || 'All');
  const [priority, setPriority] = useState<string>('All');
  const [category, setCategory] = useState<string>('All');
  const [sortBy, setSortBy] = useState<string>('dateReceived');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Modal triggers
  const [selectedComplaintId, setSelectedComplaintId] = useState<string | null>(null);
  const [isRegisterOpen, setIsRegisterOpen] = useState<boolean>(false);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const res = await api.get('/complaints', {
        params: {
          search: search || undefined,
          bureau: bureau !== 'All' ? bureau : undefined,
          status: status !== 'All' ? status : undefined,
          priority: priority !== 'All' ? priority : undefined,
          category: category !== 'All' ? category : undefined,
          page,
          limit: 15,
          sortBy,
          sortOrder,
        },
      });
      setComplaints(res.data.complaints);
      setTotal(res.data.pagination.total);
      setTotalPages(res.data.pagination.totalPages);
    } catch (err) {
      console.error('Failed to load complaints:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [page, bureau, status, priority, category, sortBy, sortOrder]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchComplaints();
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">AICTE Master Grievance Registry</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Inter-bureau monitoring docket with statutory SLAs and active investigation tracking.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsRegisterOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Register Inward Grievance</span>
          </button>
          <button
            onClick={fetchComplaints}
            className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
            title="Refresh List"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Complaint No (e.g. 0001), Institution, or keyword..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
          <button
            type="submit"
            className="w-full md:w-auto px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs shadow-sm transition-colors"
          >
            Search
          </button>
        </form>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="block text-slate-500 font-semibold mb-1">Bureau</label>
            <select
              value={bureau}
              onChange={(e) => {
                setBureau(e.target.value);
                setPage(1);
              }}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium"
            >
              <option value="All">All Bureaus</option>
              <option value="AB">Approval Bureau (AB)</option>
              <option value="PAPB">Policy & Academic (PAPB)</option>
              <option value="RGRB">Regulation & Grievance (RGRB)</option>
              <option value="ROAC">Regional Affairs (ROAC)</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-500 font-semibold mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium"
            >
              <option value="All">All Statuses</option>
              <option value="PENDING">Pending Scrutiny</option>
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="ACTION_INITIATED">Action Initiated</option>
              <option value="SHOW_CAUSE_ISSUED">Show Cause Issued</option>
              <option value="COMMITTEE_HEARING">Hearing Scheduled</option>
              <option value="RESOLVED">Resolved</option>
              <option value="OVERDUE">Overdue (SLA Breached)</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-500 font-semibold mb-1">Priority</label>
            <select
              value={priority}
              onChange={(e) => {
                setPriority(e.target.value);
                setPage(1);
              }}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium"
            >
              <option value="All">All Priorities</option>
              <option value="URGENT">Urgent (Vigilance)</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-500 font-semibold mb-1">Sort Order</label>
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [sb, so] = e.target.value.split('-');
                setSortBy(sb);
                setSortOrder(so as any);
                setPage(1);
              }}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium"
            >
              <option value="dateReceived-desc">Date Received (Newest)</option>
              <option value="dateReceived-asc">Date Received (Oldest)</option>
              <option value="dueDate-asc">Due Date (Urgent First)</option>
              <option value="priority-desc">Priority</option>
            </select>
          </div>
        </div>
      </div>

      {/* Complaints Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between text-xs">
          <span className="font-bold text-slate-800">
            Showing {complaints.length} of {total} grievance cases
          </span>
          <span className="text-slate-400 font-mono">Page {page} of {totalPages}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/75 border-b border-slate-200 text-slate-600 uppercase font-semibold">
              <tr>
                <th className="py-3 px-4">Complaint ID</th>
                <th className="py-3 px-4">Institution Details</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Assigned Bureau</th>
                <th className="py-3 px-4">Officer</th>
                <th className="py-3 px-4 w-36">Statutory SLA (30d)</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500 font-medium">
                    Loading grievance records from AICTE Central Node...
                  </td>
                </tr>
              ) : complaints.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500 font-medium">
                    No matching complaints found for the selected filter parameters.
                  </td>
                </tr>
              ) : (
                complaints.map((c) => {
                  const isOverdue = new Date(c.dueDate).getTime() < Date.now() && c.status !== 'RESOLVED' && c.status !== 'CLOSED';
                  return (
                    <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-blue-700 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span>{c.complaintNo}</span>
                          {c.crossBureauLinked && (
                            <span
                              className="w-2 h-2 rounded-full bg-amber-500"
                              title="Linked in Cross-Bureau Overlap"
                            />
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 max-w-xs">
                        <p className="font-semibold text-slate-900 truncate">{c.institution.name}</p>
                        <p className="text-[10px] text-slate-400 font-mono">
                          ID: {c.institution.aicteId} · {c.institution.state}
                        </p>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 max-w-[160px] truncate">{c.category}</td>
                      <td className="py-3.5 px-4">
                        <BureauBadge code={c.bureau.code} name={c.bureau.name} />
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                        {c.assignedOfficer ? c.assignedOfficer.name : <span className="text-slate-400 italic">Unassigned</span>}
                      </td>
                      <td className="py-3.5 px-4 w-36">
                        <SlaEscalationBar complaint={c} variant="compact" />
                      </td>
                      <td className="py-3.5 px-4">
                        <PriorityBadge priority={c.priority} />
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusBadge status={isOverdue ? 'OVERDUE' : c.status} size="sm" />
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => setSelectedComplaintId(c.id)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white font-semibold transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Details</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs">
          <p className="text-slate-500">
            Page <span className="font-bold text-slate-800">{page}</span> of{' '}
            <span className="font-bold text-slate-800">{totalPages}</span>
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Details Modal */}
      {selectedComplaintId && (
        <ComplaintDetailsModal
          complaintId={selectedComplaintId}
          onClose={() => setSelectedComplaintId(null)}
          onUpdate={fetchComplaints}
        />
      )}

      {/* Register Complaint Modal */}
      <RegisterComplaintModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        onSuccess={fetchComplaints}
      />
    </div>
  );
};

