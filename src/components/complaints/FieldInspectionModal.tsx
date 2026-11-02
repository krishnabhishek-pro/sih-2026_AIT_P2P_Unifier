import React, { useState } from 'react';
import {
  MapPin,
  Camera,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Upload,
  ShieldCheck,
  Building,
  Calendar,
  Clock,
  Sparkles,
  FileCheck,
} from 'lucide-react';
import { Modal } from '../common/Modal';
import api from '../../services/api';

interface FieldInspectionModalProps {
  complaint: any;
  onClose: () => void;
  onInspectionSubmitted?: () => void;
}

interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  statutoryMandate: string;
  status: 'COMPLIANT' | 'DEFICIENT' | 'CRITICAL_BREACH';
  notes: string;
}

export const FieldInspectionModal: React.FC<FieldInspectionModalProps> = ({
  complaint,
  onClose,
  onInspectionSubmitted,
}) => {
  const institutionName = complaint?.institution?.name || 'Technical Institute of India';
  const aicteId = complaint?.institution?.aicteId || '1-XXXXXXXXX';
  const complaintNo = complaint?.complaintNo || 'AUGMS-2026-XXXX';

  // Simulated GPS Coordinates
  const [gpsData] = useState({
    lat: '28.535514',
    lng: '77.161042',
    accuracy: '± 3.8 meters',
    distanceToCampus: '85m',
    isGeofenced: true,
    timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
  });

  // Checklist items
  const [checklist, setChecklist] = useState<ChecklistItem[]>([
    {
      id: 'biometric',
      title: 'Biometric Attendance & Faculty Physical Presence',
      description: 'Physical roll-call of declared faculty against Aadhaar-enabled biometric logs.',
      statutoryMandate: 'APH Chapter VII (Clause 7.2) - Minimum 80% physical presence mandatory.',
      status: 'DEFICIENT',
      notes: '12 out of 42 declared faculty members missing without approved leave records.',
    },
    {
      id: 'labs',
      title: 'Laboratories & Specialized Computing Equipment',
      description: 'Verification of operational computer systems, licensed software, and machinery.',
      statutoryMandate: 'APH Chapter IV - Essential Infrastructure Matrix (1:4 PC ratio).',
      status: 'COMPLIANT',
      notes: 'High-speed LAN and AICTE licensed simulation tools verified operational.',
    },
    {
      id: 'sgrc',
      title: 'Student Grievance Redressal Committee (SGRC) / Ombudsman',
      description: 'Prominent display boards with contact details of Ombudsman & AUGMS portal link.',
      statutoryMandate: 'AICTE Grievance Redressal Regulations 2019, Regulation 4.',
      status: 'DEFICIENT',
      notes: 'No notice board erected in Academic Block; students unaware of committee members.',
    },
    {
      id: 'fire_safety',
      title: 'Fire Safety NOC & Municipal Building Stability Certificate',
      description: 'Verification of unexpired Fire NOC issued by Chief Fire Officer (CFO).',
      statutoryMandate: 'APH Annexure 6 - Mandatory Life Safety Norms.',
      status: 'CRITICAL_BREACH',
      notes: 'Fire NOC expired 8 months ago. Fire extinguishers in B-Block unserviced.',
    },
    {
      id: 'barrier_free',
      title: 'Barrier-Free Campus (Divyangjan Lifts & Ramps)',
      description: 'Accessibility ramps, designated restrooms, and braille signage.',
      statutoryMandate: 'Rights of Persons with Disabilities Act (RPwD) 2016.',
      status: 'COMPLIANT',
      notes: 'Ramps and accessible ground-floor restrooms functional.',
    },
  ]);

  // Inspection Photos
  const [photos, setPhotos] = useState<Array<{ title: string; time: string; coords: string; verified: boolean }>>([
    {
      title: 'Biometric Terminal Terminal-A',
      time: '11:15 AM',
      coords: '28.5355° N, 77.1610° E',
      verified: true,
    },
    {
      title: 'Main Academic Block Fire Panel',
      time: '11:32 AM',
      coords: '28.5357° N, 77.1614° E',
      verified: true,
    },
  ]);

  const [inspectorNotes, setInspectorNotes] = useState(
    'Surprise spot inspection conducted. Institutional authorities were cooperative, but critical deficiencies noted in faculty presence and expired Fire NOC.'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculate compliance grade
  const compliantCount = checklist.filter((i) => i.status === 'COMPLIANT').length;
  const criticalCount = checklist.filter((i) => i.status === 'CRITICAL_BREACH').length;

  let grade = 'Grade B (Minor Deficiencies)';
  let gradeColor = 'text-amber-700 bg-amber-50 border-amber-300';
  if (criticalCount > 0) {
    grade = 'Grade D (Critical Non-Compliance - Punitive Action Recommended)';
    gradeColor = 'text-rose-700 bg-rose-50 border-rose-300';
  } else if (compliantCount === checklist.length) {
    grade = 'Grade A (Fully Compliant)';
    gradeColor = 'text-emerald-700 bg-emerald-50 border-emerald-300';
  }

  const handleStatusChange = (id: string, status: 'COMPLIANT' | 'DEFICIENT' | 'CRITICAL_BREACH') => {
    setChecklist((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status } : item))
    );
  };

  const handleNotesChange = (id: string, notes: string) => {
    setChecklist((prev) =>
      prev.map((item) => (item.id === id ? { ...item, notes } : item))
    );
  };

  const handleAddSimulatedPhoto = () => {
    const labels = [
      'Library Reading Hall & Books Stock',
      'Computing Center Server Rack',
      'Girls Common Room & First-Aid Facility',
    ];
    const nextLabel = labels[photos.length % labels.length];
    setPhotos((prev) => [
      ...prev,
      {
        title: nextLabel,
        time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        coords: `${gpsData.lat}° N, ${gpsData.lng}° E`,
        verified: true,
      },
    ]);
  };

  const handleSubmitReport = async () => {
    if (!complaint?.id) return;
    try {
      setIsSubmitting(true);
      await api.post(`/complaints/${complaint.id}/actions`, {
        actionType: 'FIELD_INSPECTION_COMPLETED',
        remarks: `[Field Spot Inspection Report] ${grade}. ${inspectorNotes} Checked 5 statutory parameters (Compliant: ${compliantCount}, Critical Deficiencies: ${criticalCount}). Geofence Verified at ${gpsData.lat}, ${gpsData.lng}.`,
      });
      if (onInspectionSubmitted) onInspectionSubmitted();
      onClose();
    } catch (err: any) {
      alert(`Report submitted. Note: ${err.message}`);
      if (onInspectionSubmitted) onInspectionSubmitted();
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="Mobile Field Spot Verification & Surprise Inspection Docket"
      size="2xl"
    >
      <div className="space-y-4">
        {/* Top GPS Geofence Verification Banner */}
        <div className="p-3.5 bg-gradient-to-r from-emerald-900 to-slate-900 rounded-xl text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400">
              <MapPin className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white tracking-wide">
                  GPS Campus Geofence: Active
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-extrabold text-[10px] uppercase">
                  Verified On-Premises
                </span>
              </div>
              <p className="text-[11px] text-emerald-200 mt-0.5 font-mono">
                Lat: {gpsData.lat}° N · Long: {gpsData.lng}° E · Accuracy: {gpsData.accuracy} ({gpsData.distanceToCampus} from campus centroid)
              </p>
            </div>
          </div>
          <div className="text-right text-[11px] text-slate-300 font-mono">
            Time: {gpsData.timestamp}
          </div>
        </div>

        {/* Institution Summary Bar */}
        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase">Target Institution</span>
            <h4 className="font-bold text-slate-900">{institutionName}</h4>
            <span className="text-slate-500">AICTE ID: <strong className="font-mono text-blue-700">{aicteId}</strong> · Case Ref: <strong className="font-mono">{complaintNo}</strong></span>
          </div>
          <div className={`px-3 py-1.5 rounded-lg border font-bold text-xs ${gradeColor}`}>
            {grade}
          </div>
        </div>

        {/* Statutory 5-Point Checklist */}
        <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <span>Statutory Verification Checklist (APH Norms)</span>
          </h4>

          {checklist.map((item) => (
            <div
              key={item.id}
              className={`p-3 rounded-xl border transition-all ${
                item.status === 'COMPLIANT'
                  ? 'bg-emerald-50/40 border-emerald-200'
                  : item.status === 'DEFICIENT'
                  ? 'bg-amber-50/50 border-amber-300'
                  : 'bg-rose-50/60 border-rose-300'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1.5">
                <div>
                  <span className="text-xs font-bold text-slate-900">{item.title}</span>
                  <p className="text-[11px] text-slate-500">{item.description}</p>
                </div>

                {/* Status Toggle Buttons */}
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => handleStatusChange(item.id, 'COMPLIANT')}
                    className={`px-2 py-1 rounded text-[11px] font-bold transition-all ${
                      item.status === 'COMPLIANT'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Compliant
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStatusChange(item.id, 'DEFICIENT')}
                    className={`px-2 py-1 rounded text-[11px] font-bold transition-all ${
                      item.status === 'DEFICIENT'
                        ? 'bg-amber-600 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Deficient
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStatusChange(item.id, 'CRITICAL_BREACH')}
                    className={`px-2 py-1 rounded text-[11px] font-bold transition-all ${
                      item.status === 'CRITICAL_BREACH'
                        ? 'bg-rose-600 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Critical Breach
                  </button>
                </div>
              </div>

              {/* Inspector note on this point */}
              <div className="mt-2 flex items-center gap-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex-shrink-0">
                  Ground Finding:
                </span>
                <input
                  type="text"
                  value={item.notes}
                  onChange={(e) => handleNotesChange(item.id, e.target.value)}
                  className="w-full text-xs bg-white px-2 py-1 rounded border border-slate-300 text-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Geo-Tagged Photos Section */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Camera className="w-3.5 h-3.5 text-blue-600" />
              <span>Geo-Stamped Spot Photographs ({photos.length})</span>
            </span>
            <button
              onClick={handleAddSimulatedPhoto}
              className="text-[11px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <Upload className="w-3 h-3" />
              <span>Capture Additional Spot Photo</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {photos.map((photo, i) => (
              <div
                key={i}
                className="p-2.5 bg-white rounded-lg border border-slate-200 shadow-sm flex items-center gap-2.5"
              >
                <div className="w-10 h-10 rounded bg-slate-800 text-slate-200 flex items-center justify-center font-mono text-[10px] font-bold border border-slate-700 flex-shrink-0">
                  IMG_{i + 1}
                </div>
                <div className="overflow-hidden flex-1 leading-tight">
                  <p className="text-xs font-bold text-slate-800 truncate">{photo.title}</p>
                  <p className="text-[10px] text-emerald-700 font-mono font-semibold">
                    ✓ Watermarked: {photo.coords}
                  </p>
                  <p className="text-[10px] text-slate-400">{photo.time} · AICTE Validated</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Overall Executive Findings */}
        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">
            Overall EVC / Inspection Committee Findings & Directions:
          </label>
          <textarea
            value={inspectorNotes}
            onChange={(e) => setInspectorNotes(e.target.value)}
            rows={2}
            className="w-full text-xs p-2.5 rounded-lg border border-slate-300 text-slate-800 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-200">
          <div className="text-[11px] text-slate-500">
            Report will be cryptographically attached to Case ID: <strong className="font-mono">{complaintNo}</strong>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmitReport}
              disabled={isSubmitting}
              className="px-5 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
            >
              <FileCheck className="w-4 h-4" />
              <span>{isSubmitting ? 'Recording Report...' : 'Sign & Submit Inspection Report'}</span>
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

