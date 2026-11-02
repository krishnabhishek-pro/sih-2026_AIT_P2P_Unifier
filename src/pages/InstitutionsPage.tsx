import React, { useState, useEffect } from 'react';
import {
  Building2,
  Search,
  Filter,
  PlusCircle,
  Eye,
  RefreshCw,
  MapPin,
  FileText,
  AlertTriangle,
  CheckCircle,
  Clock,
  History,
  TrendingUp,
  BarChart2,
  Phone,
  Mail,
  Globe,
  ArrowRight,
} from 'lucide-react';
import api from '../services/api';
import { StatusBadge } from '../components/common/StatusBadge';
import { BureauBadge } from '../components/common/BureauBadge';
import { PriorityBadge } from '../components/common/PriorityBadge';
import { Modal } from '../components/common/Modal';
import { ComplaintDetailsModal } from './ComplaintDetailsModal';
import { Institution, Complaint } from '../types';

export const InstitutionsPage: React.FC = () => {
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters
  const [search, setSearch] = useState<string>('');
  const [selectedState, setSelectedState] = useState<string>('All');
  const [selectedType, setSelectedType] = useState<string>('All');

  // Add Institution Modal
  const [isAddOpen, setIsAddOpen] = useState<boolean>(false);
  const [newInst, setNewInst] = useState({
    aicteId: '',
    name: '',
    type: 'Private/Self-Financing',
    state: 'Maharashtra',
    district: '',
    address: '',
    pinCode: '',
    contactPerson: '',
    email: '',
    phone: '',
    website: '',
    approvalYear: 2010,
  });
  const [addError, setAddError] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  // Institution 360° Profile Modal
  const [profileInstId, setProfileInstId] = useState<string | null>(null);
  const [profileData, setProfileData] = useState<any | null>(null);
  const [loadingProfile, setLoadingProfile] = useState<boolean>(false);

  // Complaint inspection modal
  const [inspectComplaintId, setInspectComplaintId] = useState<string | null>(null);

  const fetchInstitutions = async () => {
    try {
      setLoading(true);
      const res = await api.get('/institutions', {
        params: {
          search: search || undefined,
          state: selectedState !== 'All' ? selectedState : undefined,
          type: selectedType !== 'All' ? selectedType : undefined,
        },
      });
      setInstitutions(res.data);
    } catch (err) {
      console.error('Failed to load institutions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInstitutions();
  }, [selectedState, selectedType]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchInstitutions();
  };

  const openProfile = async (id: string) => {
    setProfileInstId(id);
    try {
      setLoadingProfile(true);
      const res = await api.get(`/institutions/${id}`);
      setProfileData(res.data);
    } catch (err) {
      console.error('Failed to load 360 profile:', err);
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleAddInstitution = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInst.aicteId || !newInst.name || !newInst.district) {
      setAddError('AICTE ID, Name, and District are mandatory.');
      return;
    }
    try {
      setIsAdding(true);
      setAddError('');
      await api.post('/institutions', newInst);
      setIsAddOpen(false);
      setNewInst({
        aicteId: '',
        name: '',
        type: 'Private/Self-Financing',
        state: 'Maharashtra',
        district: '',
        address: '',
        pinCode: '',
        contactPerson: '',
        email: '',
        phone: '',
        website: '',
        approvalYear: 2010,
      });
      fetchInstitutions();
    } catch (err: any) {
      setAddError(err.response?.data?.error || 'Failed to add institution');
    } finally {
      setIsAdding(false);
    }
  };

  // Distinct states and types for filters
  const uniqueStates = ['All', 'Maharashtra', 'Karnataka', 'Tamil Nadu', 'Telangana', 'Uttar Pradesh', 'Gujarat', 'West Bengal', 'Kerala', 'Rajasthan', 'Madhya Pradesh', 'Punjab'];
  const uniqueTypes = ['All', 'Private/Self-Financing', 'Autonomous', 'Government', 'Polytechnic', 'Deemed University'];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Technical Institutions Registry</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Directory of AICTE approved colleges, polytechnics, and universities with 360° compliance dockets.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsAddOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Institution</span>
          </button>
          <button
            onClick={fetchInstitutions}
            className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
            title="Refresh Directory"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Institution Name, AICTE Permanent ID (e.g. 1-332458901), or District..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
          <button
            type="submit"
            className="w-full sm:w-auto px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs shadow-sm transition-colors"
          >
            Search
          </button>
        </form>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <label className="block text-slate-500 font-semibold mb-1">Filter by State</label>
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium"
            >
              {uniqueStates.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-500 font-semibold mb-1">Institution Type</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium"
            >
              {uniqueTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Institutions Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between text-xs">
          <span className="font-bold text-slate-800">
            {institutions.length} Institutions Enrolled
          </span>
          <span className="text-slate-400">Official AICTE Permanent ID Verified</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/75 border-b border-slate-200 text-slate-600 uppercase font-semibold">
              <tr>
                <th className="py-3 px-4">Permanent ID</th>
                <th className="py-3 px-4">Institution Name</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Category Type</th>
                <th className="py-3 px-4 text-center">Total Cases</th>
                <th className="py-3 px-4 text-center">Active / Pending</th>
                <th className="py-3 px-4 text-center">Resolved</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">360° Profile</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500 font-medium">
                    Loading institutions directory...
                  </td>
                </tr>
              ) : institutions.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500 font-medium">
                    No institutions matched your query.
                  </td>
                </tr>
              ) : (
                institutions.map((inst) => (
                  <tr key={inst.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-700 whitespace-nowrap">
                      {inst.aicteId}
                    </td>
                    <td className="py-3.5 px-4 max-w-sm">
                      <p className="font-bold text-slate-900 truncate">{inst.name}</p>
                      <p className="text-[10px] text-slate-400">Est. {inst.approvalYear}</p>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <p className="font-medium text-slate-800">{inst.district}</p>
                      <p className="text-[10px] text-slate-400">{inst.state}</p>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="bg-slate-100 px-2 py-0.5 rounded font-medium text-slate-700">
                        {inst.type}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-slate-900">
                      {inst.totalComplaints}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded font-bold ${
                          inst.pendingComplaints > 0
                            ? 'bg-amber-50 text-amber-800 border border-amber-200'
                            : 'text-slate-400'
                        }`}
                      >
                        {inst.pendingComplaints}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center font-semibold text-emerald-700">
                      {inst.resolvedComplaints}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                          inst.status === 'Active'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200 animate-pulse'
                        }`}
                      >
                        {inst.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => openProfile(inst.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white font-semibold transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View 360° Profile</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Institution 360° Profile Modal */}
      {profileInstId && (
        <Modal
          isOpen={true}
          onClose={() => {
            setProfileInstId(null);
            setProfileData(null);
          }}
          title="Institution 360° Grievance & Compliance Dossier"
          subtitle={profileData?.institution?.name}
          maxWidth="4xl"
        >
          {loadingProfile || !profileData ? (
            <div className="py-12 flex justify-center">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="space-y-6 text-xs">
              {/* Institution Bio Card */}
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{profileData.institution.name}</h3>
                    <p className="text-slate-500 font-mono mt-0.5">
                      AICTE Permanent ID: <strong className="text-blue-700">{profileData.institution.aicteId}</strong> · Est. {profileData.institution.approvalYear}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full font-bold self-start sm:self-auto ${
                      profileData.institution.status === 'Active'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800 animate-pulse'
                    }`}
                  >
                    Status: {profileData.institution.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-slate-700">
                  <div>
                    <span className="text-slate-400 font-semibold uppercase text-[10px]">Campus Address</span>
                    <p className="font-medium mt-0.5">{profileData.institution.address}, {profileData.institution.district}, {profileData.institution.state} - {profileData.institution.pinCode}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-semibold uppercase text-[10px]">Administration</span>
                    <p className="font-medium mt-0.5">{profileData.institution.contactPerson || 'Office of Principal'}</p>
                    <p className="text-slate-500">{profileData.institution.email}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-semibold uppercase text-[10px]">Classification</span>
                    <p className="font-medium mt-0.5">{profileData.institution.type}</p>
                    <p className="text-slate-500">{profileData.institution.website || 'Portal Not Listed'}</p>
                  </div>
                </div>
              </div>

              {/* 4 Metric Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-white rounded-xl border border-slate-200">
                  <span className="text-slate-400 font-semibold uppercase text-[10px]">Total Inward</span>
                  <div className="text-xl font-black text-slate-900 mt-1">{profileData.institution.totalComplaints}</div>
                </div>
                <div className="p-3 bg-white rounded-xl border border-amber-200 bg-amber-50/50">
                  <span className="text-amber-700 font-semibold uppercase text-[10px]">Active Grievances</span>
                  <div className="text-xl font-black text-amber-900 mt-1">{profileData.institution.pendingComplaints}</div>
                </div>
                <div className="p-3 bg-white rounded-xl border border-emerald-200 bg-emerald-50/50">
                  <span className="text-emerald-700 font-semibold uppercase text-[10px]">Resolved</span>
                  <div className="text-xl font-black text-emerald-900 mt-1">{profileData.institution.resolvedComplaints}</div>
                </div>
                <div className="p-3 bg-white rounded-xl border border-purple-200 bg-purple-50/50">
                  <span className="text-purple-700 font-semibold uppercase text-[10px]">Cross-Bureau Overlaps</span>
                  <div className="text-xl font-black text-purple-900 mt-1">{profileData.institution.overlaps?.length || 0}</div>
                </div>
              </div>

              {/* Bureau-wise Complaint Distribution for this Institution */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                  Bureau-Wise Allocation Breakdown
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {(profileData.bureauBreakdown || []).map((b: any) => (
                    <div key={b.code} className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-slate-900 font-mono">{b.code}</span>
                        <span className="text-xs font-bold text-blue-700">{b.count} Cases</span>
                      </div>
                      <p className="text-[10px] text-slate-500 truncate">{b.name}</p>
                      <div className="mt-2 text-[10px] flex items-center justify-between text-slate-600">
                        <span>Pending: <strong>{b.pending}</strong></span>
                        <span>Resolved: <strong>{b.resolved}</strong></span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Complete Complaint History Table */}
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                  <span className="font-bold text-slate-900">Complete Grievance History ({profileData.institution.complaints?.length || 0})</span>
                </div>
                <div className="max-h-56 overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 uppercase text-[10px]">
                      <tr>
                        <th className="py-2 px-3">Complaint ID</th>
                        <th className="py-2 px-3">Bureau</th>
                        <th className="py-2 px-3">Category</th>
                        <th className="py-2 px-3">Date</th>
                        <th className="py-2 px-3">Status</th>
                        <th className="py-2 px-3 text-right">Inspect</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(profileData.institution.complaints || []).map((c: any) => (
                        <tr key={c.id} className="hover:bg-slate-50">
                          <td className="py-2 px-3 font-mono font-bold text-blue-700">{c.complaintNo}</td>
                          <td className="py-2 px-3">
                            <BureauBadge code={c.bureau.code} />
                          </td>
                          <td className="py-2 px-3 text-slate-600 truncate max-w-[200px]">{c.category}</td>
                          <td className="py-2 px-3 text-slate-500 whitespace-nowrap">
                            {new Date(c.dateReceived).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </td>
                          <td className="py-2 px-3">
                            <StatusBadge status={c.status} size="sm" />
                          </td>
                          <td className="py-2 px-3 text-right">
                            <button
                              onClick={() => setInspectComplaintId(c.id)}
                              className="text-blue-600 font-semibold hover:underline"
                            >
                              Details
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Timeline of Previous Regulatory Actions Across Entire Campus */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <History className="w-4 h-4 text-blue-600" />
                  <span>Consolidated Campus Action Timeline</span>
                </h4>
                <div className="relative pl-6 border-l-2 border-slate-200 space-y-4 max-h-52 overflow-y-auto pr-2">
                  {(profileData.actionsTimeline || []).map((action: any, idx: number) => (
                    <div key={action.id || idx} className="relative">
                      <div className="absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full bg-blue-600 border-2 border-white" />
                      <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900">
                            {action.complaint?.complaintNo} · {action.actionType.replace(/_/g, ' ')}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {new Date(action.createdAt).toLocaleDateString('en-IN')}
                          </span>
                        </div>
                        <p className="text-slate-600 mt-1">{action.remarks}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </Modal>
      )}

      {/* Add Institution Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Register Technical Institution"
        subtitle="Enroll institution into centralized monitoring directory"
        maxWidth="lg"
      >
        <form onSubmit={handleAddInstitution} className="space-y-3 text-xs">
          {addError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800">
              {addError}
            </div>
          )}
          <div>
            <label className="block font-bold text-slate-700 mb-1">AICTE Permanent ID *</label>
            <input
              type="text"
              required
              placeholder="e.g. 1-998877661"
              value={newInst.aicteId}
              onChange={(e) => setNewInst({ ...newInst, aicteId: e.target.value })}
              className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-mono"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">Institution Full Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Modern Institute of Engineering & Technology"
              value={newInst.name}
              onChange={(e) => setNewInst({ ...newInst, name: e.target.value })}
              className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">State *</label>
              <select
                value={newInst.state}
                onChange={(e) => setNewInst({ ...newInst, state: e.target.value })}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
              >
                {uniqueStates.filter((s) => s !== 'All').map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">District *</label>
              <input
                type="text"
                required
                placeholder="e.g. Pune / Bengaluru"
                value={newInst.district}
                onChange={(e) => setNewInst({ ...newInst, district: e.target.value })}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Institution Type</label>
              <select
                value={newInst.type}
                onChange={(e) => setNewInst({ ...newInst, type: e.target.value })}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
              >
                {uniqueTypes.filter((t) => t !== 'All').map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Establishment Year</label>
              <input
                type="number"
                value={newInst.approvalYear}
                onChange={(e) => setNewInst({ ...newInst, approvalYear: parseInt(e.target.value) || 2010 })}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsAddOpen(false)}
              className="px-4 py-2 border rounded-lg font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isAdding}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-sm"
            >
              {isAdding ? 'Saving...' : 'Save Institution'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Complaint Inspection Modal */}
      {inspectComplaintId && (
        <ComplaintDetailsModal
          complaintId={inspectComplaintId}
          onClose={() => setInspectComplaintId(null)}
          onUpdate={fetchInstitutions}
        />
      )}
    </div>
  );
};

