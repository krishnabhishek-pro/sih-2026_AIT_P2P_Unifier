import React, { useState, useEffect } from 'react';
import {
  GitCompareArrows,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Play,
  RefreshCw,
  Building,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  Sliders,
  Calendar,
  Layers,
  FileText,
  UserCheck,
} from 'lucide-react';
import api from '../services/api';
import { BureauBadge } from '../components/common/BureauBadge';
import { StatusBadge } from '../components/common/StatusBadge';
import { PriorityBadge } from '../components/common/PriorityBadge';
import { Modal } from '../components/common/Modal';
import { ComplaintDetailsModal } from './ComplaintDetailsModal';
import { CaseOverlap, OverlapStatus } from '../types';

export const OverlapDetectionPage: React.FC = () => {
  const [overlaps, setOverlaps] = useState<CaseOverlap[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [minScore, setMinScore] = useState<number>(60);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanMessage, setScanMessage] = useState<string>('');

  // Selected Overlap for Detailed Comparison Modal
  const [selectedOverlap, setSelectedOverlap] = useState<CaseOverlap | null>(null);

  // Review Action Modal state
  const [reviewModalOpen, setReviewModalOpen] = useState<boolean>(false);
  const [reviewAction, setReviewAction] = useState<'CONFIRMED' | 'REJECTED' | 'UNDER_REVIEW'>('CONFIRMED');
  const [reviewRemarks, setReviewRemarks] = useState<string>('');
  const [isSubmittingReview, setIsSubmittingReview] = useState<boolean>(false);
  const [reviewFeedback, setReviewFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Deep inspect individual complaint
  const [inspectComplaintId, setInspectComplaintId] = useState<string | null>(null);

  const fetchOverlaps = async () => {
    try {
      setLoading(true);
      const res = await api.get('/overlaps', {
        params: {
          status: statusFilter !== 'All' ? statusFilter : undefined,
          minScore,
        },
      });
      setOverlaps(res.data);
    } catch (err) {
      console.error('Failed to load overlaps:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverlaps();
  }, [statusFilter, minScore]);

  // Run automated scan
  const handleRunScan = async () => {
    try {
      setIsScanning(true);
      setScanMessage('');
      const res = await api.post('/overlaps/scan');
      setScanMessage(`Scan finished! Found ${res.data.result.detectedCount} multi-bureau correlation(s).`);
      await fetchOverlaps();
    } catch (err: any) {
      setScanMessage('Failed to run automated scan.');
    } finally {
      setIsScanning(false);
    }
  };

  // Submit review action (Confirm, Reject, Under Review)
  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOverlap) return;
    if (!reviewRemarks.trim()) {
      setReviewFeedback({ type: 'error', message: 'Official rationale is mandatory for audit trail compliance.' });
      return;
    }

    try {
      setIsSubmittingReview(true);
      await api.post(`/overlaps/${selectedOverlap.id}/review`, {
        action: reviewAction,
        remarks: reviewRemarks,
      });

      setReviewFeedback({
        type: 'success',
        message: `Decision successfully recorded: ${reviewAction}. Case records updated with audit trail.`,
      });

      setTimeout(() => {
        setReviewModalOpen(false);
        setReviewRemarks('');
        setReviewFeedback(null);
        setSelectedOverlap(null);
        fetchOverlaps();
      }, 1400);
    } catch (err: any) {
      setReviewFeedback({
        type: 'error',
        message: err.response?.data?.error || 'Failed to submit review action',
      });
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // Metrics
  const potentialCount = overlaps.filter((o) => o.status === 'POTENTIAL').length;
  const confirmedCount = overlaps.filter((o) => o.status === 'CONFIRMED').length;
  const underReviewCount = overlaps.filter((o) => o.status === 'UNDER_REVIEW').length;
  const rejectedCount = overlaps.filter((o) => o.status === 'REJECTED').length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Cross-Bureau Overlap Detection Center</h2>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold">
              Core Vigilance Module
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-3xl">
            Identifies overlapping or related grievances independently processed by different AICTE Bureaus. Prevents contradictory actions, ghost faculty concealment, and uncoordinated departmental hearings.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRunScan}
            disabled={isScanning}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-sm transition-all disabled:opacity-50"
          >
            <Play className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
            <span>{isScanning ? 'Analyzing All Records...' : 'Run Automated Scan'}</span>
          </button>
          <button
            onClick={fetchOverlaps}
            className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
            title="Refresh Overlaps"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {scanMessage && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 font-semibold flex items-center justify-between">
          <span>{scanMessage}</span>
          <button onClick={() => setScanMessage('')} className="text-blue-700 font-bold">✕</button>
        </div>
      )}

      {/* Statutory Rules & Caution Callout */}
      <div className="bg-slate-900 text-slate-200 p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-amber-300 uppercase tracking-wider text-[10px]">
              AICTE Vigilance Standard Operating Procedure (SOP)
            </span>
            <p className="text-slate-300 mt-0.5 leading-relaxed">
              1. Never automatically merge or dismiss complaints. · 2. Match scores are automated indicators, not legal proof. · 3. Final confirmation must be approved by authorized Bureau Heads or Monitoring Committee.
            </p>
          </div>
        </div>
        <span className="self-start md:self-auto px-3 py-1 bg-slate-800 border border-slate-700 text-slate-300 font-mono text-[10px] rounded-lg">
          Rule-Engine v2.4 (Active)
        </span>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div
          onClick={() => setStatusFilter('POTENTIAL')}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${
            statusFilter === 'POTENTIAL'
              ? 'bg-amber-50 border-amber-300 shadow-sm'
              : 'bg-white border-slate-200 hover:bg-slate-50'
          }`}
        >
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700">Awaiting Decision</span>
          <div className="text-2xl font-black text-amber-900 mt-1">{potentialCount}</div>
          <span className="text-[11px] text-slate-500">Unreviewed Potential Matches</span>
        </div>

        <div
          onClick={() => setStatusFilter('CONFIRMED')}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${
            statusFilter === 'CONFIRMED'
              ? 'bg-blue-50 border-blue-300 shadow-sm'
              : 'bg-white border-slate-200 hover:bg-slate-50'
          }`}
        >
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700">Confirmed Collisions</span>
          <div className="text-2xl font-black text-blue-900 mt-1">{confirmedCount}</div>
          <span className="text-[11px] text-slate-500">Joint Hearing Mandated</span>
        </div>

        <div
          onClick={() => setStatusFilter('UNDER_REVIEW')}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${
            statusFilter === 'UNDER_REVIEW'
              ? 'bg-purple-50 border-purple-300 shadow-sm'
              : 'bg-white border-slate-200 hover:bg-slate-50'
          }`}
        >
          <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700">Joint Review</span>
          <div className="text-2xl font-black text-purple-900 mt-1">{underReviewCount}</div>
          <span className="text-[11px] text-slate-500">Referred to Committee</span>
        </div>

        <div
          onClick={() => setStatusFilter('REJECTED')}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${
            statusFilter === 'REJECTED'
              ? 'bg-slate-100 border-slate-300 shadow-sm'
              : 'bg-white border-slate-200 hover:bg-slate-50'
          }`}
        >
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600">Dismissed Matches</span>
          <div className="text-2xl font-black text-slate-700 mt-1">{rejectedCount}</div>
          <span className="text-[11px] text-slate-500">Independent Cases</span>
        </div>
      </div>

      {/* Filter & Threshold Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <span className="font-bold text-slate-700">Status Filter:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-semibold"
          >
            <option value="All">All Overlaps ({overlaps.length})</option>
            <option value="POTENTIAL">Potential Unreviewed</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="UNDER_REVIEW">Marked for Joint Review</option>
            <option value="REJECTED">Rejected False Positives</option>
          </select>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <span className="font-bold text-slate-700">Min Match Score:</span>
          <input
            type="range"
            min="50"
            max="95"
            step="5"
            value={minScore}
            onChange={(e) => setMinScore(parseInt(e.target.value))}
            className="w-32 accent-amber-500"
          />
          <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
            ≥ {minScore}%
          </span>
        </div>
      </div>

      {/* List of Detected Matches (Comparison Cards) */}
      <div className="space-y-4">
        {loading ? (
          <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-slate-500 font-medium">
            Fetching cross-bureau overlap matrix...
          </div>
        ) : overlaps.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-slate-500">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
            <p className="font-bold text-slate-800 text-sm">No Cross-Bureau Overlaps Found</p>
            <p className="text-xs text-slate-500 mt-1">
              No grievance pairs meet the selected correlation threshold. All bureaus are operating without detected case collision.
            </p>
          </div>
        ) : (
          overlaps.map((ov) => {
            const c1 = ov.originalComplaint;
            const c2 = ov.relatedComplaint;

            let statusBadge = (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
                Awaiting Official Review
              </span>
            );
            if (ov.status === 'CONFIRMED') {
              statusBadge = (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-300">
                  Confirmed Related Cases (Joint Docket)
                </span>
              );
            } else if (ov.status === 'UNDER_REVIEW') {
              statusBadge = (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-300">
                  Referred for Standing Committee Scrutiny
                </span>
              );
            } else if (ov.status === 'REJECTED') {
              statusBadge = (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-300">
                  Rejected (Independent Investigation)
                </span>
              );
            }

            return (
              <div
                key={ov.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:border-slate-300 transition-all"
              >
                {/* Header of Overlap Card */}
                <div className="p-4 bg-slate-50/75 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white flex flex-col items-center justify-center font-black shadow-xs">
                      <span className="text-base leading-none">{ov.matchScore}%</span>
                      <span className="text-[9px] uppercase tracking-wider font-semibold opacity-90">Match</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <Building className="w-4 h-4 text-blue-600" />
                        <h3 className="font-bold text-slate-900 text-sm">{ov.institution.name}</h3>
                      </div>
                      <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                        AICTE ID: {ov.institution.aicteId} · {ov.institution.state}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {statusBadge}
                    <button
                      onClick={() => {
                        setSelectedOverlap(ov);
                        setReviewModalOpen(true);
                      }}
                      className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-colors"
                    >
                      Official Review
                    </button>
                  </div>
                </div>

                {/* Side-by-Side Comparison Interface */}
                <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-6 relative">
                  {/* Subtle Divider with Compare Icon in center for desktop */}
                  <div className="hidden md:flex absolute inset-y-0 left-1/2 -ml-3 items-center justify-center pointer-events-none">
                    <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-300 text-slate-500 flex items-center justify-center shadow-xs">
                      <GitCompareArrows className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  {/* Complaint A (Original) */}
                  <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/90 space-y-2.5 text-xs">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm font-mono text-blue-700">
                          {c1.complaintNo}
                        </span>
                        <BureauBadge code={c1.bureau.code} name={c1.bureau.name} />
                      </div>
                      <StatusBadge status={c1.status} size="sm" />
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase text-slate-400">Category</span>
                      <p className="font-semibold text-slate-800">{c1.category}</p>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase text-slate-400">Subject</span>
                      <p className="font-bold text-slate-900 line-clamp-2">{c1.title}</p>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase text-slate-400">Grievance Substance</span>
                      <p className="text-slate-600 line-clamp-3 leading-relaxed">{c1.description}</p>
                    </div>

                    <div className="pt-2 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-200">
                      <span>Source: <strong>{c1.source}</strong></span>
                      <button
                        onClick={() => setInspectComplaintId(c1.id)}
                        className="text-blue-600 hover:underline font-semibold"
                      >
                        Inspect Dossier →
                      </button>
                    </div>
                  </div>

                  {/* Complaint B (Related) */}
                  <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/90 space-y-2.5 text-xs">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm font-mono text-blue-700">
                          {c2.complaintNo}
                        </span>
                        <BureauBadge code={c2.bureau.code} name={c2.bureau.name} />
                      </div>
                      <StatusBadge status={c2.status} size="sm" />
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase text-slate-400">Category</span>
                      <p className="font-semibold text-slate-800">{c2.category}</p>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase text-slate-400">Subject</span>
                      <p className="font-bold text-slate-900 line-clamp-2">{c2.title}</p>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase text-slate-400">Grievance Substance</span>
                      <p className="text-slate-600 line-clamp-3 leading-relaxed">{c2.description}</p>
                    </div>

                    <div className="pt-2 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-200">
                      <span>Source: <strong>{c2.source}</strong></span>
                      <button
                        onClick={() => setInspectComplaintId(c2.id)}
                        className="text-blue-600 hover:underline font-semibold"
                      >
                        Inspect Dossier →
                      </button>
                    </div>
                  </div>
                </div>

                {/* Match Reasons List */}
                <div className="px-5 pb-4">
                  <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl space-y-1.5 text-xs">
                    <span className="font-bold text-amber-950 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
                      <span>Rule-Based Detection Rationale & Correlated Factors:</span>
                    </span>
                    <ul className="list-disc list-inside text-slate-700 space-y-1">
                      {(ov.reasons || []).map((reason, idx) => (
                        <li key={idx} className="leading-snug">{reason}</li>
                      ))}
                    </ul>

                    {/* Official Review Note if already reviewed */}
                    {ov.reviewedByName && (
                      <div className="mt-2 pt-2 border-t border-amber-200 text-[11px] text-slate-700">
                        <strong>Official Decision Record:</strong> Reviewed by{' '}
                        <span className="font-bold text-slate-900">{ov.reviewedByName}</span> on{' '}
                        {new Date(ov.reviewedAt || ov.updatedAt).toLocaleDateString('en-IN')}.
                        <p className="italic mt-0.5">"{ov.reviewDecisionRemarks}"</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Review Action Modal */}
      {selectedOverlap && (
        <Modal
          isOpen={reviewModalOpen}
          onClose={() => setReviewModalOpen(false)}
          title="Official Overlap Review & Disposition"
          subtitle={`Match Score: ${selectedOverlap.matchScore}% · ${selectedOverlap.institution.name}`}
          maxWidth="2xl"
        >
          <form onSubmit={handleReviewSubmit} className="space-y-4 text-xs">
            {reviewFeedback && (
              <div
                className={`p-3 rounded-xl border flex items-center gap-2 ${
                  reviewFeedback.type === 'success'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-rose-50 border-rose-200 text-rose-800'
                }`}
              >
                {reviewFeedback.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
                ) : (
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 text-rose-600" />
                )}
                <span>{reviewFeedback.message}</span>
              </div>
            )}

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <p className="font-semibold text-slate-800">
                You are reviewing cross-bureau correlation between:
              </p>
              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                <div className="bg-white p-2 rounded border border-slate-200">
                  <span className="font-bold text-blue-700">{selectedOverlap.originalComplaint.complaintNo}</span>
                  <p className="text-slate-500">{selectedOverlap.originalComplaint.bureau.name}</p>
                </div>
                <div className="bg-white p-2 rounded border border-slate-200">
                  <span className="font-bold text-blue-700">{selectedOverlap.relatedComplaint.complaintNo}</span>
                  <p className="text-slate-500">{selectedOverlap.relatedComplaint.bureau.name}</p>
                </div>
              </div>
            </div>

            {/* 3 Mandated Statutory Review Actions */}
            <div className="space-y-2">
              <label className="block text-slate-800 font-bold">Select Regulatory Action *</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <label
                  className={`p-3 rounded-xl border cursor-pointer flex flex-col justify-between transition-all ${
                    reviewAction === 'CONFIRMED'
                      ? 'bg-blue-50 border-blue-600 text-blue-900 font-bold shadow-xs'
                      : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="reviewAction"
                    value="CONFIRMED"
                    checked={reviewAction === 'CONFIRMED'}
                    onChange={() => setReviewAction('CONFIRMED')}
                    className="sr-only"
                  />
                  <div>
                    <span className="block text-xs font-bold">1. Confirm Related</span>
                    <p className="text-[10px] font-normal text-slate-500 mt-1">
                      Links cases for joint hearing across Bureaus.
                    </p>
                  </div>
                  <CheckCircle2 className={`w-4 h-4 mt-2 ${reviewAction === 'CONFIRMED' ? 'text-blue-600' : 'text-slate-300'}`} />
                </label>

                <label
                  className={`p-3 rounded-xl border cursor-pointer flex flex-col justify-between transition-all ${
                    reviewAction === 'UNDER_REVIEW'
                      ? 'bg-purple-50 border-purple-600 text-purple-900 font-bold shadow-xs'
                      : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="reviewAction"
                    value="UNDER_REVIEW"
                    checked={reviewAction === 'UNDER_REVIEW'}
                    onChange={() => setReviewAction('UNDER_REVIEW')}
                    className="sr-only"
                  />
                  <div>
                    <span className="block text-xs font-bold">2. Further Review</span>
                    <p className="text-[10px] font-normal text-slate-500 mt-1">
                      Refers to joint vigilance scrutiny panel.
                    </p>
                  </div>
                  <HelpCircle className={`w-4 h-4 mt-2 ${reviewAction === 'UNDER_REVIEW' ? 'text-purple-600' : 'text-slate-300'}`} />
                </label>

                <label
                  className={`p-3 rounded-xl border cursor-pointer flex flex-col justify-between transition-all ${
                    reviewAction === 'REJECTED'
                      ? 'bg-rose-50 border-rose-600 text-rose-900 font-bold shadow-xs'
                      : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="reviewAction"
                    value="REJECTED"
                    checked={reviewAction === 'REJECTED'}
                    onChange={() => setReviewAction('REJECTED')}
                    className="sr-only"
                  />
                  <div>
                    <span className="block text-xs font-bold">3. Reject Match</span>
                    <p className="text-[10px] font-normal text-slate-500 mt-1">
                      Dismisses false positive; proceed independently.
                    </p>
                  </div>
                  <XCircle className={`w-4 h-4 mt-2 ${reviewAction === 'REJECTED' ? 'text-rose-600' : 'text-slate-300'}`} />
                </label>
              </div>
            </div>

            {/* Mandatory Decision Remarks */}
            <div>
              <label className="block text-slate-800 font-bold mb-1">
                Official Rationale & Action Minutes * (Mandatory for Tamper-Evident Audit Trail)
              </label>
              <textarea
                rows={3}
                required
                value={reviewRemarks}
                onChange={(e) => setReviewRemarks(e.target.value)}
                placeholder="Enter formal justification, joint committee constitution orders, or reasons for dismissal..."
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-600"
              />
            </div>

            {/* Submit Button */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setReviewModalOpen(false)}
                className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmittingReview || !reviewRemarks.trim()}
                className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-sm transition-colors disabled:opacity-50"
              >
                {isSubmittingReview ? 'Recording Decision...' : 'Commit Regulatory Decision'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Deep Inspection of single complaint */}
      {inspectComplaintId && (
        <ComplaintDetailsModal
          complaintId={inspectComplaintId}
          onClose={() => setInspectComplaintId(null)}
          onUpdate={fetchOverlaps}
        />
      )}
    </div>
  );
};

