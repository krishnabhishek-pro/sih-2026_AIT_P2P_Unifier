import React, { useState, useEffect } from 'react';
import { PlusCircle, Building, AlertCircle, FileText, CheckCircle2, ShieldAlert } from 'lucide-react';
import { Modal } from '../components/common/Modal';
import api from '../services/api';
import { Institution, Bureau } from '../types';

interface RegisterComplaintModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const RegisterComplaintModal: React.FC<RegisterComplaintModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [bureaus, setBureaus] = useState<Bureau[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [overlapAlert, setOverlapAlert] = useState<{ detected: boolean; score?: number } | null>(null);

  // Form states
  const [institutionId, setInstitutionId] = useState('');
  const [bureauId, setBureauId] = useState('');
  const [category, setCategory] = useState('Faculty Salary & Service Matters');
  const [priority, setPriority] = useState('MEDIUM');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [complainantType, setComplainantType] = useState('Faculty');
  const [complainantName, setComplainantName] = useState('');
  const [source, setSource] = useState('DIRECT_PORTAL');
  const [remarks, setRemarks] = useState('');
  const [error, setError] = useState('');

  const categories = [
    'Faculty Salary & Service Matters',
    'Excess Fee & Capitation',
    'Unapproved Intake & Courses',
    'Infrastructure Deficiencies',
    'Harassment & Victimization',
    'Admission Irregularities',
  ];

  useEffect(() => {
    if (isOpen) {
      async function loadOptions() {
        try {
          setLoading(true);
          const [instRes, burRes] = await Promise.all([
            api.get('/institutions'),
            api.get('/bureaus'),
          ]);
          setInstitutions(instRes.data);
          setBureaus(burRes.data);
          if (burRes.data.length > 0) setBureauId(burRes.data[0].id);
        } catch (err: any) {
          setError(err.message || 'Failed to load bureaus/institutions');
        } finally {
          setLoading(false);
        }
      }
      loadOptions();
      setOverlapAlert(null);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!institutionId || !bureauId || !title.trim() || !description.trim()) {
      setError('Please fill all mandatory fields (Institution, Bureau, Title, Description).');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      const res = await api.post('/complaints', {
        institutionId,
        bureauId,
        category,
        priority,
        title,
        description,
        complainantType,
        complainantName,
        source,
        remarks,
      });

      if (res.data?.overlapDetected) {
        setOverlapAlert({ detected: true, score: res.data.matchScore });
      }

      onSuccess();
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to register grievance');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Inward Grievance Registration"
      subtitle="Administrative case entry for grievances received via CPGRAMS, RTI, Court, or Webcell"
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {overlapAlert?.detected && (
          <div className="p-3 bg-amber-500/10 border border-amber-300 rounded-xl text-amber-900 flex items-center gap-2 font-semibold">
            <ShieldAlert className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span>
              ⚡ Immediate Cross-Bureau Overlap Flagged ({overlapAlert.score}% Match Score)! An active case exists in another bureau.
            </span>
          </div>
        )}

        {/* Institution Selector */}
        <div>
          <label className="block text-slate-700 font-bold mb-1">Target Technical Institution *</label>
          <select
            value={institutionId}
            onChange={(e) => setInstitutionId(e.target.value)}
            required
            className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-600"
          >
            <option value="">-- Select Institution (AICTE Permanent ID) --</option>
            {institutions.map((inst) => (
              <option key={inst.id} value={inst.id}>
                {inst.name} ({inst.aicteId}) · {inst.state}
              </option>
            ))}
          </select>
        </div>

        {/* Bureau & Category */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-slate-700 font-bold mb-1">Assigned AICTE Bureau *</label>
            <select
              value={bureauId}
              onChange={(e) => setBureauId(e.target.value)}
              required
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-600"
            >
              {bureaus.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.code})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-slate-700 font-bold mb-1">Complaint Category *</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-600"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Priority & Inward Source */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-slate-700 font-bold mb-1">Priority SLA</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white"
            >
              <option value="LOW">Low (45-Day SLA)</option>
              <option value="MEDIUM">Medium (30-Day SLA)</option>
              <option value="HIGH">High (15-Day SLA)</option>
              <option value="URGENT">Urgent / Vigilance (7-Day SLA)</option>
            </select>
          </div>
          <div>
            <label className="block text-slate-700 font-bold mb-1">Complainant Persona</label>
            <select
              value={complainantType}
              onChange={(e) => setComplainantType(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white"
            >
              <option value="Faculty">Faculty Member</option>
              <option value="Student">Student</option>
              <option value="Parent">Parent / Guardian</option>
              <option value="Whistleblower">Protected Whistleblower</option>
              <option value="Public">Public Citizen / RTI</option>
            </select>
          </div>
          <div>
            <label className="block text-slate-700 font-bold mb-1">Inward Source</label>
            <select
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white"
            >
              <option value="DIRECT_PORTAL">Direct Portal Submission</option>
              <option value="CPGRAMS">CPGRAMS (DARPG)</option>
              <option value="RTI">RTI Representation</option>
              <option value="COURT_ORDER">Court Directive / Writ</option>
              <option value="REGIONAL_OFFICE">Regional Office Inward</option>
            </select>
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="block text-slate-700 font-bold mb-1">Grievance Subject / Title *</label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Concise summary of the grievance..."
            className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-600"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-slate-700 font-bold mb-1">Full Grievance Representation *</label>
          <textarea
            rows={4}
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Detailed facts, affected dates, clauses of AICTE Approval Handbook violated..."
            className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-600"
          />
        </div>

        {/* Remarks / Notes */}
        <div>
          <label className="block text-slate-700 font-bold mb-1">Initial Scrutiny Remarks</label>
          <input
            type="text"
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder="Official inward desk remarks..."
            className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-sm transition-colors flex items-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{isSubmitting ? 'Registering & Scanning...' : 'Register Complaint'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};

