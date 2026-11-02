import React, { useState } from 'react';
import {
  Video,
  Mic,
  MicOff,
  VideoOff,
  Users,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Clock,
  ShieldCheck,
  Building,
  Plus,
  Scale,
  Sparkles,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import { Modal } from '../components/common/Modal';

interface JointHearing {
  id: string;
  hearingNo: string;
  institutionName: string;
  aicteId: string;
  bureaus: string[];
  cases: string[];
  scheduledTime: string;
  status: 'SCHEDULED' | 'IN_SESSION' | 'COMPLETED';
  hearingRoomUrl: string;
  primaryDispute: string;
}

export const JointHearingWorkbenchPage: React.FC = () => {
  const [hearings, setHearings] = useState<JointHearing[]>([
    {
      id: 'h-101',
      hearingNo: 'AICTE/JH/2026/001',
      institutionName: 'Apex Institute of Engineering & Technology',
      aicteId: '1-10972341',
      bureaus: ['Approval Bureau (AB)', 'Regulation & Grievance Bureau (RGRB)'],
      cases: ['AUGMS-2026-0001 (AB)', 'AUGMS-2026-0002 (RGRB)'],
      scheduledTime: 'Today, 02:30 PM IST',
      status: 'IN_SESSION',
      hearingRoomUrl: 'https://meet.nic.in/aicte-inquiry-room-apex',
      primaryDispute: 'Conflict between self-reported faculty strength on Portal vs non-payment grievance and ghost faculty claims.',
    },
    {
      id: 'h-102',
      hearingNo: 'AICTE/JH/2026/002',
      institutionName: 'Bharati College of Engineering',
      aicteId: '1-10984512',
      bureaus: ['Academic Planning Bureau (PAPB)', 'Regulation & Grievance Bureau (RGRB)'],
      cases: ['AUGMS-2026-0004 (PAPB)', 'AUGMS-2026-0005 (RGRB)'],
      scheduledTime: 'Tomorrow, 11:00 AM IST',
      status: 'SCHEDULED',
      hearingRoomUrl: 'https://meet.nic.in/aicte-inquiry-room-bharati',
      primaryDispute: 'Capitation fee extortion & retention of original 10th/12th marksheets in violation of Supreme Court and AICTE mandate.',
    },
    {
      id: 'h-103',
      hearingNo: 'AICTE/JH/2026/003',
      institutionName: 'Modern Institute of Technology',
      aicteId: '1-10992389',
      bureaus: ['Approval Bureau (AB)', 'Regional Office (ROAC)'],
      cases: ['AUGMS-2026-0008 (AB)', 'AUGMS-2026-0009 (ROAC)'],
      scheduledTime: 'Yesterday',
      status: 'COMPLETED',
      hearingRoomUrl: 'https://meet.nic.in/aicte-inquiry-room-modern',
      primaryDispute: 'Failure of municipal fire safety inspection and missing biometric attendance logs.',
    },
  ]);

  const [activeHearing, setActiveHearing] = useState<JointHearing | null>(hearings[0]);
  const [isInVcRoom, setIsInVcRoom] = useState<boolean>(false);
  const [micOn, setMicOn] = useState<boolean>(true);
  const [videoOn, setVideoOn] = useState<boolean>(true);

  // Minutes of Meeting state
  const [momNotes, setMomNotes] = useState<string>(
    'The Joint Hearing Committee comprising Heads of Approval Bureau and Regulation Bureau convened today. The Principal was unable to produce certified bank statements for 24 disputed faculty members. Biometric logs produced on campus were inconsistent with Aadhaar authentication servers.'
  );
  const [recommendedSanction, setRecommendedSanction] = useState<string>(
    'INTAKE_REDUCTION_50'
  );
  const [isSigned, setIsSigned] = useState<boolean>(false);

  // Side-by-side Evidence Split Items
  const evidenceRows = [
    {
      parameter: 'Faculty Cadre & Ratio',
      portalAffidavit: 'Declared 48 Full-time Faculty (15:1 Student Ratio). All holding Ph.D. / M.Tech degrees.',
      groundEvidence: 'Bank statements confirm only 20 individuals receive regular salary. 28 are non-existent ghost teachers.',
      discrepancy: '58.3% Discrepancy (Critical Fraud)',
      breach: true,
    },
    {
      parameter: 'Pay Scale & 7th CPC Salary',
      portalAffidavit: 'Uploaded statutory affidavit asserting compliance with 7th Central Pay Commission scales.',
      groundEvidence: 'Faculty bank transfers reflect ₹18,000 - ₹22,000 per month stipend instead of ₹57,700 base.',
      discrepancy: 'Severe Underpayment Breach',
      breach: true,
    },
    {
      parameter: 'Fire Safety & Life Safety NOC',
      portalAffidavit: 'Self-certified possession of valid Fire NOC valid through 2027.',
      groundEvidence: 'Chief Fire Officer local report confirms Fire NOC lapsed 8 months ago with unserviced extinguishers.',
      discrepancy: 'Life Safety Violation',
      breach: true,
    },
    {
      parameter: 'Student Grievance Redressal (SGRC)',
      portalAffidavit: 'Ombudsman appointed and functional as per AICTE Regulations 2019.',
      groundEvidence: 'No ombudsman listed on campus or website; students directed to private trustees instead.',
      discrepancy: 'Non-Compliance',
      breach: true,
    },
  ];

  const handleSignMinutes = () => {
    setIsSigned(true);
    alert('Minutes of Meeting (MoM) digitally signed by Approval Bureau Head and Grievance Bureau Head. Transmitted to Chairman AICTE.');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Inter-Bureau Collaborative Hearing Workbench & Joint Docket
            </h2>
            <span className="flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full">
              <Scale className="w-3.5 h-3.5" />
              <span>Cross-Bureau Adjudication</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Synchronized joint virtual hearings, live evidence comparison dockets, and unified dispute resolution for multi-bureau collision cases.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-amber-600" />
            <span>1 Active Session Now</span>
          </span>
        </div>
      </div>

      {/* Main Content: Left Column (Hearings List) + Right Column (Active Hearing Docket) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Scheduled Hearings */}
        <div className="space-y-3 lg:col-span-1">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm font-bold text-slate-900">Joint Hearing Dockets</h3>
            <span className="text-xs font-semibold text-slate-500">{hearings.length} Total</span>
          </div>

          <div className="space-y-2.5">
            {hearings.map((h) => (
              <div
                key={h.id}
                onClick={() => setActiveHearing(h)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  activeHearing?.id === h.id
                    ? 'bg-blue-50/70 border-blue-300 shadow-sm'
                    : 'bg-white hover:bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-mono text-[11px] font-bold text-blue-900 bg-blue-100/60 px-2 py-0.5 rounded">
                    {h.hearingNo}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      h.status === 'IN_SESSION'
                        ? 'bg-rose-500 text-white animate-pulse'
                        : h.status === 'SCHEDULED'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {h.status === 'IN_SESSION' ? '🔴 Live In Session' : h.status}
                  </span>
                </div>

                <h4 className="text-xs font-bold text-slate-900 leading-snug">{h.institutionName}</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">AICTE Permanent ID: <strong className="font-mono">{h.aicteId}</strong></p>

                <div className="flex flex-wrap gap-1 mt-2">
                  {h.bureaus.map((b, i) => (
                    <span
                      key={i}
                      className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium border border-slate-200"
                    >
                      {b.split('(')[1]?.replace(')', '') || b}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2.5 pt-2 border-t border-slate-200/60">
                  <span className="flex items-center gap-1 font-semibold text-slate-700">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>{h.scheduledTime}</span>
                  </span>
                  <span className="text-blue-600 font-bold flex items-center gap-0.5">
                    View Docket <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Active Hearing Workbench */}
        {activeHearing && (
          <div className="space-y-4 lg:col-span-2">
            {/* Hearing Banner & Live VC Launcher */}
            <div className="bg-slate-900 rounded-2xl p-5 text-white shadow-lg space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-amber-400 font-bold">
                      {activeHearing.hearingNo}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-blue-500/30 text-blue-300 text-[10px] font-bold border border-blue-400/40">
                      NIC Bharat VC Certified Room
                    </span>
                  </div>
                  <h3 className="text-base font-extrabold mt-1">{activeHearing.institutionName}</h3>
                  <p className="text-xs text-slate-300">{activeHearing.primaryDispute}</p>
                </div>

                <button
                  onClick={() => setIsInVcRoom(!isInVcRoom)}
                  className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-md transition-all self-start sm:self-auto ${
                    isInVcRoom
                      ? 'bg-rose-600 hover:bg-rose-700 text-white'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white animate-pulse'
                  }`}
                >
                  <Video className="w-4 h-4" />
                  <span>{isInVcRoom ? 'Exit Hearing Room' : 'Join Virtual Hearing Room'}</span>
                </button>
              </div>

              {/* Live Virtual Conference Screen Simulation */}
              {isInVcRoom && (
                <div className="space-y-3 animate-in fade-in zoom-in-95 duration-200">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {/* Tile 1: Bureau Head AB */}
                    <div className="relative aspect-video bg-slate-800 rounded-xl overflow-hidden border border-slate-700 flex flex-col justify-between p-2">
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="bg-blue-600 px-1.5 py-0.5 rounded font-bold">Inquiry Chair</span>
                        <Mic className="w-3 h-3 text-emerald-400" />
                      </div>
                      <div className="text-center font-bold text-xs text-slate-200">
                        Dr. S. K. Goel (Approval Bureau)
                      </div>
                      <div className="text-[10px] text-slate-400 text-right">AICTE Hqrs</div>
                    </div>

                    {/* Tile 2: Bureau Head RGRB */}
                    <div className="relative aspect-video bg-slate-800 rounded-xl overflow-hidden border border-slate-700 flex flex-col justify-between p-2">
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="bg-purple-600 px-1.5 py-0.5 rounded font-bold">Grievance Head</span>
                        <Mic className="w-3 h-3 text-emerald-400" />
                      </div>
                      <div className="text-center font-bold text-xs text-slate-200">
                        Prof. Anita Sharma (RGRB)
                      </div>
                      <div className="text-[10px] text-slate-400 text-right">AICTE Hqrs</div>
                    </div>

                    {/* Tile 3: Institution Principal */}
                    <div className="relative aspect-video bg-slate-800 rounded-xl overflow-hidden border border-slate-700 flex flex-col justify-between p-2">
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="bg-amber-600 px-1.5 py-0.5 rounded font-bold">Respondent</span>
                        <Mic className="w-3 h-3 text-amber-400" />
                      </div>
                      <div className="text-center font-bold text-xs text-slate-200">
                        Principal / Chairman (Respondent)
                      </div>
                      <div className="text-[10px] text-slate-400 text-right">Campus Stream</div>
                    </div>

                    {/* Tile 4: Complainant Advocate */}
                    <div className="relative aspect-video bg-slate-800 rounded-xl overflow-hidden border border-slate-700 flex flex-col justify-between p-2">
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="bg-slate-600 px-1.5 py-0.5 rounded font-bold">Petitioner</span>
                        <MicOff className="w-3 h-3 text-rose-400" />
                      </div>
                      <div className="text-center font-bold text-xs text-slate-200">
                        Faculty Association Rep
                      </div>
                      <div className="text-[10px] text-slate-400 text-right">New Delhi</div>
                    </div>
                  </div>

                  {/* VC Bar Controls */}
                  <div className="flex items-center justify-center gap-3 p-2 bg-slate-800/80 rounded-xl border border-slate-700">
                    <button
                      onClick={() => setMicOn(!micOn)}
                      className={`p-2 rounded-lg text-xs font-bold flex items-center gap-1.5 ${
                        micOn ? 'bg-slate-700 text-white' : 'bg-rose-600 text-white'
                      }`}
                    >
                      {micOn ? <Mic className="w-3.5 h-3.5" /> : <MicOff className="w-3.5 h-3.5" />}
                      <span>{micOn ? 'Mute' : 'Unmuted'}</span>
                    </button>
                    <button
                      onClick={() => setVideoOn(!videoOn)}
                      className={`p-2 rounded-lg text-xs font-bold flex items-center gap-1.5 ${
                        videoOn ? 'bg-slate-700 text-white' : 'bg-rose-600 text-white'
                      }`}
                    >
                      {videoOn ? <Video className="w-3.5 h-3.5" /> : <VideoOff className="w-3.5 h-3.5" />}
                      <span>{videoOn ? 'Stop Camera' : 'Start Camera'}</span>
                    </button>
                    <span className="text-[11px] text-emerald-400 font-mono font-semibold">
                      ● Recording to AICTE Vigilance Vault
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Feature: Side-by-Side Evidence Split Table */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Scale className="w-4 h-4 text-blue-600" />
                    <span>Side-by-Side Evidence Comparison Docket</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    AICTE Approval Portal Self-Declarations vs Ground Grievance & Bank Proof
                  </p>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 border border-rose-200">
                  88% Material Discrepancy Flagged
                </span>
              </div>

              {/* Comparison Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-bold text-[10px]">
                      <th className="p-3 w-1/4">Regulatory Parameter</th>
                      <th className="p-3 w-1/3 bg-blue-50/50 text-blue-900">
                        1. Portal Self-Disclosure (Affidavit)
                      </th>
                      <th className="p-3 w-1/3 bg-rose-50/50 text-rose-900">
                        2. Ground Evidence & Bank Audit
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {evidenceRows.map((row, i) => (
                      <tr key={i} className="hover:bg-slate-50/80">
                        <td className="p-3 font-bold text-slate-800 align-top">
                          <p>{row.parameter}</p>
                          <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider block mt-1">
                            {row.discrepancy}
                          </span>
                        </td>
                        <td className="p-3 text-slate-700 bg-blue-50/20 align-top leading-relaxed">
                          {row.portalAffidavit}
                        </td>
                        <td className="p-3 text-rose-900 bg-rose-50/20 align-top font-medium leading-relaxed">
                          {row.groundEvidence}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Joint Hearing Minutes of Meeting (MoM) & Digital Sign-off */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-purple-600" />
                <span>Joint Minutes of Meeting (MoM) & Proposed Sanction</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1 uppercase">
                    Consensus Punitive Sanction:
                  </label>
                  <select
                    value={recommendedSanction}
                    onChange={(e) => setRecommendedSanction(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-300 font-semibold text-xs bg-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="INTAKE_REDUCTION_50">50% Reduction in Approved Intake for 2026-27</option>
                    <option value="NO_ADMISSION_CATEGORY">Place under "No Admission" Category for 1 Year</option>
                    <option value="SHOW_CAUSE_REVOCATION">Issue Final Show-Cause Notice for Revocation of Approval</option>
                    <option value="PENALTY_10_LAKH">Monetary Penalty of ₹10,00,000 under Section 10(p)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1 uppercase">
                    Signatory Bureau Heads:
                  </label>
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-700">
                    Approval Bureau Head (AB) + Regulation Bureau Head (RGRB)
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1 uppercase">
                  Committee Deliberations & Inquiry Findings:
                </label>
                <textarea
                  value={momNotes}
                  onChange={(e) => setMomNotes(e.target.value)}
                  rows={3}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 text-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <span className="text-[11px] text-slate-500">
                  {isSigned ? (
                    <span className="text-emerald-700 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> Digitally Signed & Sealed by Bureau Heads
                    </span>
                  ) : (
                    'Requires digital signature of both Bureau Heads'
                  )}
                </span>
                <button
                  onClick={handleSignMinutes}
                  disabled={isSigned}
                  className={`px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all ${
                    isSigned
                      ? 'bg-emerald-700 text-white cursor-default'
                      : 'bg-purple-700 hover:bg-purple-800 text-white'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{isSigned ? 'MoM Signed & Transmitted' : 'Sign & Transmit MoM to Council'}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
