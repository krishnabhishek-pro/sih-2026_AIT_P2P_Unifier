import React, { useEffect, useState } from 'react';
import {
  FileText,
  Building,
  User,
  Calendar,
  Clock,
  ArrowRightLeft,
  UserCheck,
  Send,
  Upload,
  CheckCircle,
  AlertTriangle,
  History,
  FileCheck,
  Download,
  AlertCircle,
  ExternalLink,
  Camera,
  Globe,
  ShieldAlert,
  Scale,
} from 'lucide-react';
import api from '../services/api';
import { Modal } from '../components/common/Modal';
import { StatusBadge } from '../components/common/StatusBadge';
import { PriorityBadge } from '../components/common/PriorityBadge';
import { BureauBadge } from '../components/common/BureauBadge';
import { SlaEscalationBar } from '../components/common/SlaEscalationBar';
import { AiNoticeGeneratorModal } from '../components/complaints/AiNoticeGeneratorModal';
import { FieldInspectionModal } from '../components/complaints/FieldInspectionModal';
import { NationalIntegrationsDrawer } from '../components/complaints/NationalIntegrationsDrawer';
import { useAuth } from '../context/AuthContext';
import { Complaint, Bureau, User as UserType } from '../types';

interface ComplaintDetailsModalProps {
  complaintId: string;
  onClose: () => void;
  onUpdate?: () => void;
}

export const ComplaintDetailsModal: React.FC<ComplaintDetailsModalProps> = ({
  complaintId,
  onClose,
  onUpdate,
}) => {
  const { user } = useAuth();
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [bureaus, setBureaus] = useState<Bureau[]>([]);
  const [officers, setOfficers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states for interactive tabs
  const [activeTab, setActiveTab] = useState<'overview' | 'actions' | 'documents' | 'manage'>('overview');
  const [statusVal, setStatusVal] = useState('');
  const [statusRemarks, setStatusRemarks] = useState('');
  const [selectedOfficerId, setSelectedOfficerId] = useState('');
  const [assignNotes, setAssignNotes] = useState('');
  const [targetBureauId, setTargetBureauId] = useState('');
  const [transferReason, setTransferReason] = useState('');
  const [newRemark, setNewRemark] = useState('');
  const [docTitle, setDocTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Advanced modules state
  const [showNoticeModal, setShowNoticeModal] = useState(false);
  const [showInspectionModal, setShowInspectionModal] = useState(false);
  const [showNationalSyncModal, setShowNationalSyncModal] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [compRes, bureauRes, userRes] = await Promise.all([
        api.get(`/complaints/${complaintId}`),
        api.get('/bureaus'),
        api.get('/users').catch(() => ({ data: [] })),
      ]);
      setComplaint(compRes.data);
      setStatusVal(compRes.data.status);
      setBureaus(bureauRes.data);
      setOfficers(userRes.data || []);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to load case details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [complaintId]);

  const handleStatusUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!statusRemarks) {
      setErrorMessage('Please provide remarks explaining this status transition.');
      return;
    }
    try {
      setIsSubmitting(true);
      setErrorMessage('');
      await api.patch(`/complaints/${complaintId}/status`, {
        status: statusVal,
        remarks: statusRemarks,
      });
      setSuccessMessage('Case status updated successfully.');
      setStatusRemarks('');
      await loadData();
      onUpdate?.();
    } catch (err: any) {
      setErrorMessage(err.response?.data?.error || 'Failed to update status');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAssignOfficer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOfficerId) return;
    try {
      setIsSubmitting(true);
      setErrorMessage('');
      await api.post(`/complaints/${complaintId}/assign`, {
        officerId: selectedOfficerId,
        notes: assignNotes,
      });
      setSuccessMessage('Investigating officer assigned successfully.');
      setAssignNotes('');
      await loadData();
      onUpdate?.();
    } catch (err: any) {
      setErrorMessage(err.response?.data?.error || 'Failed to assign officer');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTransferBureau = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetBureauId || !transferReason) {
      setErrorMessage('Please select a target Bureau and provide transfer justification.');
      return;
    }
    try {
      setIsSubmitting(true);
      setErrorMessage('');
      await api.post(`/complaints/${complaintId}/transfer`, {
        targetBureauId,
        transferReason,
      });
      setSuccessMessage('Complaint transferred to target Bureau successfully.');
      setTransferReason('');
      await loadData();
      onUpdate?.();
    } catch (err: any) {
      setErrorMessage(err.response?.data?.error || 'Failed to transfer complaint');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddRemark = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRemark.trim()) return;
    try {
      setIsSubmitting(true);
      setErrorMessage('');
      await api.post(`/complaints/${complaintId}/remarks`, { remarks: newRemark });
      setSuccessMessage('Official remark appended to permanent case file.');
      setNewRemark('');
      await loadData();
      onUpdate?.();
    } catch (err: any) {
      setErrorMessage(err.response?.data?.error || 'Failed to add remark');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docTitle) return;
    try {
      setIsSubmitting(true);
      setErrorMessage('');
      await api.post(`/complaints/${complaintId}/documents`, {
        title: docTitle,
        fileName: `${docTitle.replace(/\s+/g, '_')}_OfficialDoc.pdf`,
        fileType: 'application/pdf',
        fileSize: '2.1 MB',
      });
      setSuccessMessage('Document uploaded and logged in audit history.');
      setDocTitle('');
      await loadData();
      onUpdate?.();
    } catch (err: any) {
      setErrorMessage(err.response?.data?.error || 'Failed to upload document');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || !complaint) {
    return (
      <Modal isOpen={true} onClose={onClose} title="Loading Case Details..." maxWidth="4xl">
        <div className="py-12 flex justify-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </Modal>
    );
  }

  const isOverdue = new Date(complaint.dueDate).getTime() < Date.now() && complaint.status !== 'RESOLVED' && complaint.status !== 'CLOSED';

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={`Complaint File: ${complaint.complaintNo}`}
      subtitle={`${complaint.institution.name} (AICTE ID: ${complaint.institution.aicteId})`}
      maxWidth="4xl"
    >
      <div className="space-y-6">
        {/* Success or Error Banners */}
        {successMessage && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-800">
            <span className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              {successMessage}
            </span>
            <button onClick={() => setSuccessMessage('')} className="text-emerald-700 font-bold hover:underline">Dismiss</button>
          </div>
        )}
        {errorMessage && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between text-xs text-rose-800">
            <span className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600" />
              {errorMessage}
            </span>
            <button onClick={() => setErrorMessage('')} className="text-rose-700 font-bold hover:underline">Dismiss</button>
          </div>
        )}

        {/* Cross Bureau Overlap Alert Banner if linked */}
        {complaint.crossBureauLinked && (
          <div className="p-4 bg-amber-500/10 border border-amber-300 rounded-xl flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <div className="text-xs">
              <p className="font-bold text-amber-950">Cross-Bureau Collision Alert Active</p>
              <p className="text-amber-800">
                This grievance is formally tagged in a confirmed cross-bureau overlap. Prioritize joint coordination between {complaint.bureau.name} and related Bureaus.
              </p>
            </div>
          </div>
        )}

        {/* Key Metadata Top Card */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-slate-400 font-semibold uppercase text-[10px]">Assigned Bureau</span>
            <div className="mt-1">
              <BureauBadge code={complaint.bureau.code} name={complaint.bureau.name} showFullName />
            </div>
          </div>
          <div>
            <span className="text-slate-400 font-semibold uppercase text-[10px]">Procedural Status</span>
            <div className="mt-1">
              <StatusBadge status={isOverdue ? 'OVERDUE' : complaint.status} />
            </div>
          </div>
          <div>
            <span className="text-slate-400 font-semibold uppercase text-[10px]">Priority SLA</span>
            <div className="mt-1">
              <PriorityBadge priority={complaint.priority} />
            </div>
          </div>
          <div>
            <span className="text-slate-400 font-semibold uppercase text-[10px]">Due Date (30-Day SLA)</span>
            <p className={`mt-1 font-semibold ${isOverdue ? 'text-rose-600' : 'text-slate-800'}`}>
              {new Date(complaint.dueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
              {isOverdue && ' (Breached)'}
            </p>
          </div>
        </div>

        {/* Feature: Automated Statutory SLA Escalation Matrix */}
        <SlaEscalationBar
          complaint={complaint}
          variant="full"
          onEscalate={async () => {
            await api.post(`/complaints/${complaintId}/remarks`, {
              remarks: 'Statutory SLA fast-track escalation triggered. Case submitted to Chairman / Member Secretary AICTE.',
            });
            await loadData();
          }}
        />

        {/* Specialized Legal & Regulatory Tools Bar */}
        <div className="p-3 bg-gradient-to-r from-slate-900 to-blue-950 rounded-xl text-white flex flex-wrap items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
              Statutory Workbench:
            </span>
            <span className="text-xs text-slate-300">
              Direct regulatory enforcement actions
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowNoticeModal(true)}
              className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Draft Show-Cause Notice</span>
            </button>

            <button
              onClick={() => setShowInspectionModal(true)}
              className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Spot Field Inspection</span>
            </button>

            <button
              onClick={() => setShowNationalSyncModal(true)}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>National Portals (CPGRAMS/NAD)</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 gap-6 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-2.5 transition-all border-b-2 flex items-center gap-1.5 ${
              activeTab === 'overview'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Case Overview</span>
          </button>
          <button
            onClick={() => setActiveTab('manage')}
            className={`pb-2.5 transition-all border-b-2 flex items-center gap-1.5 ${
              activeTab === 'manage'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ArrowRightLeft className="w-4 h-4" />
            <span>Manage & Actions</span>
          </button>
          <button
            onClick={() => setActiveTab('actions')}
            className={`pb-2.5 transition-all border-b-2 flex items-center gap-1.5 ${
              activeTab === 'actions'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Action Timeline ({complaint.actions?.length || 0})</span>
          </button>
          <button
            onClick={() => setActiveTab('documents')}
            className={`pb-2.5 transition-all border-b-2 flex items-center gap-1.5 ${
              activeTab === 'documents'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileCheck className="w-4 h-4" />
            <span>Documents ({complaint.documents?.length || 0})</span>
          </button>
        </div>

        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-5 text-xs text-slate-700">
            {/* Title & Description */}
            <div>
              <h4 className="font-bold text-slate-900 text-sm mb-1">{complaint.title}</h4>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-slate-800 leading-relaxed whitespace-pre-wrap">
                {complaint.description}
              </div>
            </div>

            {/* Grid of Institution & Complainant Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center gap-2 text-slate-900 font-bold border-b border-slate-100 pb-2">
                  <Building className="w-4 h-4 text-blue-600" />
                  <span>Target Institution Record</span>
                </div>
                <p><strong>Name:</strong> {complaint.institution.name}</p>
                <p><strong>AICTE Permanent ID:</strong> <span className="font-mono text-blue-700">{complaint.institution.aicteId}</span></p>
                <p><strong>State & District:</strong> {complaint.institution.district}, {complaint.institution.state}</p>
                <p><strong>Category of Non-Compliance:</strong> <span className="font-semibold text-amber-800">{complaint.category}</span></p>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center gap-2 text-slate-900 font-bold border-b border-slate-100 pb-2">
                  <User className="w-4 h-4 text-purple-600" />
                  <span>Complainant & Inward Source</span>
                </div>
                <p><strong>Complainant Persona:</strong> <span className="bg-slate-100 px-2 py-0.5 rounded font-medium">{complaint.complainantType}</span></p>
                <p><strong>Inward Channel:</strong> <span className="bg-blue-50 text-blue-800 px-2 py-0.5 rounded font-semibold">{complaint.source}</span></p>
                <p><strong>Protected Identity:</strong> {complaint.complainantName || 'Anonymized Whistleblower'}</p>
                <p><strong>Designated Desk Officer:</strong> {complaint.assignedOfficer ? complaint.assignedOfficer.name : 'Unassigned (Bureau Head Queue)'}</p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Manage & Actions (Status update, Transfer Bureau, Assign Officer, Remarks) */}
        {activeTab === 'manage' && (
          <div className="space-y-6 text-xs">
            {/* 1. Update Status Form */}
            <form onSubmit={handleStatusUpdate} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>Transition Case Status</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 mb-1 font-semibold">New Status</label>
                  <select
                    value={statusVal}
                    onChange={(e) => setStatusVal(e.target.value)}
                    className="w-full p-2 bg-white rounded-lg border border-slate-300 text-slate-800 focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="PENDING">Pending Scrutiny</option>
                    <option value="UNDER_REVIEW">Under Review / Inquiry</option>
                    <option value="ACTION_INITIATED">Action Initiated</option>
                    <option value="SHOW_CAUSE_ISSUED">Show Cause Issued to Management</option>
                    <option value="COMMITTEE_HEARING">Standing Committee Hearing Scheduled</option>
                    <option value="RESOLVED">Resolved & Complied</option>
                    <option value="CLOSED">Closed (Disposed)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 mb-1 font-semibold">Transition Remarks / Directives *</label>
                  <input
                    type="text"
                    value={statusRemarks}
                    onChange={(e) => setStatusRemarks(e.target.value)}
                    placeholder="E.g. Hearing scheduled on 15th Nov / Notice dispatched"
                    className="w-full p-2 bg-white rounded-lg border border-slate-300 text-slate-800 focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-sm transition-colors"
              >
                {isSubmitting ? 'Updating...' : 'Update Status & Log Action'}
              </button>
            </form>

            {/* 2. Assign / Reassign Officer */}
            <form onSubmit={handleAssignOfficer} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-blue-600" />
                <span>Assign / Reassign Investigating Officer</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 mb-1 font-semibold">Select Official</label>
                  <select
                    value={selectedOfficerId}
                    onChange={(e) => setSelectedOfficerId(e.target.value)}
                    className="w-full p-2 bg-white rounded-lg border border-slate-300 text-slate-800 focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="">-- Choose Bureau Officer --</option>
                    {officers.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.name} ({o.designation})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 mb-1 font-semibold">Assignment Instructions</label>
                  <input
                    type="text"
                    value={assignNotes}
                    onChange={(e) => setAssignNotes(e.target.value)}
                    placeholder="E.g. Conduct spot verification within 7 working days"
                    className="w-full p-2 bg-white rounded-lg border border-slate-300 text-slate-800 focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={isSubmitting || !selectedOfficerId}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-bold shadow-sm transition-colors disabled:opacity-50"
              >
                Assign Officer
              </button>
            </form>

            {/* 3. Transfer Complaint to Another Bureau */}
            <form onSubmit={handleTransferBureau} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <ArrowRightLeft className="w-4 h-4 text-purple-600" />
                <span>Inter-Bureau Case Transfer</span>
              </h4>
              <p className="text-[11px] text-slate-500">
                Transfer jurisdiction if complaint subject matter pertains to another AICTE Bureau or Cell.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 mb-1 font-semibold">Target Bureau *</label>
                  <select
                    value={targetBureauId}
                    onChange={(e) => setTargetBureauId(e.target.value)}
                    className="w-full p-2 bg-white rounded-lg border border-slate-300 text-slate-800 focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="">-- Select Recipient Bureau --</option>
                    {bureaus
                      .filter((b) => b.id !== complaint.bureauId)
                      .map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name} ({b.code})
                        </option>
                      ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 mb-1 font-semibold">Transfer Justification *</label>
                  <input
                    type="text"
                    value={transferReason}
                    onChange={(e) => setTransferReason(e.target.value)}
                    placeholder="Reason for transfer (mandated for audit trail)"
                    className="w-full p-2 bg-white rounded-lg border border-slate-300 text-slate-800 focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={isSubmitting || !targetBureauId || !transferReason}
                className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-lg font-bold shadow-sm transition-colors disabled:opacity-50"
              >
                Execute Bureau Transfer
              </button>
            </form>

            {/* 4. Append Official Remarks */}
            <form onSubmit={handleAddRemark} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Send className="w-4 h-4 text-slate-700" />
                <span>Add Internal Supervisory Note</span>
              </h4>
              <textarea
                rows={2}
                value={newRemark}
                onChange={(e) => setNewRemark(e.target.value)}
                placeholder="Enter confidential official note or observation..."
                className="w-full p-2.5 bg-white rounded-lg border border-slate-300 text-slate-800 focus:ring-2 focus:ring-blue-600"
              />
              <button
                type="submit"
                disabled={isSubmitting || !newRemark.trim()}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-800 text-white rounded-lg font-bold shadow-sm transition-colors disabled:opacity-50"
              >
                Append Note
              </button>
            </form>
          </div>
        )}

        {/* Tab 3: Action Timeline */}
        {activeTab === 'actions' && (
          <div className="space-y-4 text-xs">
            <h4 className="font-bold text-slate-900 text-sm">Chronological History of Regulatory Actions</h4>
            <div className="relative pl-6 border-l-2 border-slate-200 space-y-6 my-4">
              {(complaint.actions || []).map((action, idx) => (
                <div key={action.id || idx} className="relative group">
                  <div className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-blue-600 border-2 border-white shadow-xs" />
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-slate-900">{action.actionType.replace(/_/g, ' ')}</span>
                      <span className="text-[11px] text-slate-500 font-mono">
                        {new Date(action.createdAt).toLocaleString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <p className="text-slate-700 font-medium">{action.remarks}</p>
                    <p className="text-[10px] text-slate-500 mt-1">
                      Recorded by: <span className="font-semibold text-slate-700">{action.performerName}</span> ({action.performerRole})
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Documents */}
        {activeTab === 'documents' && (
          <div className="space-y-4 text-xs">
            {/* Upload Document Form */}
            <form onSubmit={handleAddDocument} className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex gap-3 items-end">
              <div className="flex-1">
                <label className="block text-slate-600 mb-1 font-semibold">Upload Official Annexure / Report</label>
                <input
                  type="text"
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  placeholder="Document Title (e.g. Scrutiny Committee Inspection Findings.pdf)"
                  className="w-full p-2 bg-white rounded-lg border border-slate-300 text-slate-800"
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting || !docTitle.trim()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold flex items-center gap-1.5 shadow-sm transition-colors disabled:opacity-50"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload</span>
              </button>
            </form>

            <div className="space-y-2">
              {(complaint.documents || []).map((doc) => (
                <div key={doc.id} className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 text-blue-700 rounded-lg">
                      <FileCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{doc.title}</p>
                      <p className="text-[10px] text-slate-500">{doc.fileName} · {doc.fileSize} · Uploaded by {doc.uploadedBy}</p>
                    </div>
                  </div>
                  <a
                    href={doc.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AI Statutory Notice Generator Modal */}
        {showNoticeModal && (
          <AiNoticeGeneratorModal
            complaint={complaint}
            onClose={() => setShowNoticeModal(false)}
            onNoticeIssued={async () => {
              await loadData();
              onUpdate?.();
            }}
          />
        )}

        {/* Mobile Field Spot Inspection Modal */}
        {showInspectionModal && (
          <FieldInspectionModal
            complaint={complaint}
            onClose={() => setShowInspectionModal(false)}
            onInspectionSubmitted={async () => {
              await loadData();
              onUpdate?.();
            }}
          />
        )}

        {/* National Portals Inter-Agency Drawer */}
        {showNationalSyncModal && (
          <NationalIntegrationsDrawer
            complaint={complaint}
            isOpen={showNationalSyncModal}
            onClose={() => setShowNationalSyncModal(false)}
          />
        )}
      </div>
    </Modal>
  );
};

