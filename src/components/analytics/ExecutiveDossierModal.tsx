import React, { useState } from 'react';
import {
  FileText,
  Printer,
  Copy,
  CheckCircle,
  Download,
  ShieldAlert,
  Building,
  Calendar,
  Layers,
  AlertTriangle,
} from 'lucide-react';
import { Modal } from '../common/Modal';

interface ExecutiveDossierModalProps {
  isOpen: boolean;
  onClose: () => void;
  analyticsData?: any;
}

export const ExecutiveDossierModal: React.FC<ExecutiveDossierModalProps> = ({
  isOpen,
  onClose,
  analyticsData,
}) => {
  const [copied, setCopied] = useState(false);

  const currentDate = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  const handlePrint = () => {
    window.print();
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(`AICTE EXECUTIVE COMMITTEE BOARD DOSSIER - AGENDA ITEM 68.04\nGenerated on: ${currentDate}\nUnified Grievance Monitoring & Institutional Vigilance Summary`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="1-Click AICTE Council / Executive Committee Board Dossier"
      size="2xl"
    >
      <div className="space-y-4">
        {/* Banner */}
        <div className="flex items-center justify-between p-3 bg-slate-900 text-white rounded-xl">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-bold tracking-wider uppercase text-amber-400">
              Restricted · For Council & Executive Committee (EC) Use Only
            </span>
          </div>
          <span className="text-xs font-mono text-slate-400">Agenda Item No. 68.04</span>
        </div>

        {/* Printable Official Document Body */}
        <div className="p-6 bg-white border border-slate-300 rounded-xl shadow-inner font-serif text-slate-900 max-h-[500px] overflow-y-auto leading-relaxed text-xs">
          {/* Header */}
          <div className="text-center border-b-2 border-slate-900 pb-3 mb-4 font-sans">
            <div className="text-[10px] font-bold tracking-widest text-slate-600 uppercase">
              CONFIDENTIAL / IMMEDIATE
            </div>
            <h2 className="text-base font-extrabold text-slate-900 tracking-wide uppercase mt-0.5">
              ALL INDIA COUNCIL FOR TECHNICAL EDUCATION
            </h2>
            <p className="text-[10px] text-slate-500 font-medium">
              68th Meeting of the Executive Committee (EC) · Council Secretariat, New Delhi
            </p>
            <div className="mt-2 text-xs font-bold font-mono bg-slate-100 p-1.5 rounded border border-slate-300 inline-block">
              AGENDA ITEM 68.04: INSTITUTIONAL GRIEVANCE AUDIT & MULTI-BUREAU COLLISION REPORT
            </div>
          </div>

          {/* Metadata */}
          <div className="flex justify-between text-[11px] font-sans font-semibold mb-4 text-slate-700 border-b border-dashed border-slate-300 pb-2">
            <div>
              <p>Reporting Period: <strong>FY 2025-26 (Quarter IV)</strong></p>
              <p>Platform: <strong>AICTE Unified Grievance Monitoring System (AUGMS)</strong></p>
            </div>
            <div className="text-right">
              <p>Date of Tabling: <strong>{currentDate}</strong></p>
              <p className="text-blue-900">Security Classification: <strong>RESTRICTED</strong></p>
            </div>
          </div>

          {/* Section 1: Executive Overview */}
          <div className="space-y-3 font-sans text-xs">
            <h4 className="font-bold text-slate-900 uppercase border-b border-slate-200 pb-1">
              1. EXECUTIVE SUMMARY & STATUTORY DISPOSITION
            </h4>
            <p className="text-slate-800 leading-normal">
              The AICTE Unified Grievance Monitoring System (AUGMS) has completed automated cross-bureau correlation across all 4 operational Bureaus (Approval Bureau, Academic Planning Bureau, Regulation & Grievance Bureau, Regional Offices). During the audit window, <strong>50 distinct institutional complaints</strong> were analyzed, uncovering <strong>4 severe cross-bureau case collisions</strong> where multiple departments were pursuing uncoordinated inquiries against identical institutions.
            </p>

            <div className="grid grid-cols-3 gap-2 my-2 text-center">
              <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
                <span className="text-[10px] text-slate-500 font-bold block uppercase">Total Dockets</span>
                <span className="text-sm font-extrabold text-slate-900">50 Complaints</span>
              </div>
              <div className="p-2.5 bg-amber-50 rounded border border-amber-200">
                <span className="text-[10px] text-amber-800 font-bold block uppercase">Cross-Bureau Collisions</span>
                <span className="text-sm font-extrabold text-amber-900">4 Critical Overlaps</span>
              </div>
              <div className="p-2.5 bg-rose-50 rounded border border-rose-200">
                <span className="text-[10px] text-rose-800 font-bold block uppercase">Statutory SLA Overdue</span>
                <span className="text-sm font-extrabold text-rose-900">4 Escalated Breaches</span>
              </div>
            </div>

            {/* Section 2: High-Risk Institution Collisions */}
            <h4 className="font-bold text-slate-900 uppercase border-b border-slate-200 pb-1 pt-2">
              2. HIGH-RISK INSTITUTIONAL COLLISIONS (RECOMMENDED FOR SANCTIONS)
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse border border-slate-300 text-[11px]">
                <thead>
                  <tr className="bg-slate-100 text-slate-800 font-bold">
                    <th className="p-1.5 border border-slate-300">Permanent ID</th>
                    <th className="p-1.5 border border-slate-300">Institution Name</th>
                    <th className="p-1.5 border border-slate-300">Bureaus Involved</th>
                    <th className="p-1.5 border border-slate-300">Primary Allegation</th>
                    <th className="p-1.5 border border-slate-300">Recommended Council Sanction</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-700">
                  <tr>
                    <td className="p-1.5 border border-slate-300 font-mono font-bold">1-10972341</td>
                    <td className="p-1.5 border border-slate-300 font-medium">Apex Institute of Engineering & Tech</td>
                    <td className="p-1.5 border border-slate-300">AB + RGRB</td>
                    <td className="p-1.5 border border-slate-300 text-rose-700 font-semibold">Ghost Faculty & Salary Non-Disbursement</td>
                    <td className="p-1.5 border border-slate-300 font-bold text-rose-800">50% Intake Reduction + ₹5 Lakh Fine</td>
                  </tr>
                  <tr>
                    <td className="p-1.5 border border-slate-300 font-mono font-bold">1-10984512</td>
                    <td className="p-1.5 border border-slate-300 font-medium">Bharati College of Engineering</td>
                    <td className="p-1.5 border border-slate-300">PAPB + RGRB</td>
                    <td className="p-1.5 border border-slate-300 text-rose-700 font-semibold">Unlawful Certificate Retention & Capitation</td>
                    <td className="p-1.5 border border-slate-300 font-bold text-rose-800">Show-Cause for Withdrawal of Approval</td>
                  </tr>
                  <tr>
                    <td className="p-1.5 border border-slate-300 font-mono font-bold">1-10992389</td>
                    <td className="p-1.5 border border-slate-300 font-medium">Modern Institute of Technology</td>
                    <td className="p-1.5 border border-slate-300">AB + ROAC</td>
                    <td className="p-1.5 border border-slate-300 text-rose-700 font-semibold">Expired Fire NOC & Structural Safety</td>
                    <td className="p-1.5 border border-slate-300 font-bold text-rose-800">Immediate Spot Inspection & E-Portal Freeze</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Section 3: Statutory Directions */}
            <h4 className="font-bold text-slate-900 uppercase border-b border-slate-200 pb-1 pt-2">
              3. STATUTORY RESOLUTIONS PLACED FOR APPROVAL
            </h4>
            <ol className="list-decimal pl-4 space-y-1 text-slate-800 text-xs">
              <li>
                <strong>Mandatory Joint Hearing:</strong> Empower Bureau Heads of AB and RGRB to execute single consolidated virtual hearings via AUGMS Workbench.
              </li>
              <li>
                <strong>CPGRAMS & DigiLocker Interlock:</strong> Institutions failing to rectify faculty biometric disparities within 15 calendar days will be flagged to State Fee Regulatory Committees and Affiliating Universities.
              </li>
              <li>
                <strong>Statutory SLA Enforcement:</strong> Council confirms automated escalation to Member Secretary on Day 26 of pending grievances.
              </li>
            </ol>

            {/* Signatures */}
            <div className="pt-8 border-t border-slate-300 flex justify-between items-end text-xs">
              <div>
                <div className="font-bold text-slate-900">Dr. Abhay Jere / Dr. Mamidala Jagadesh Kumar</div>
                <div className="text-slate-600 text-[11px]">Vice Chairman / Chairman, AICTE</div>
              </div>
              <div className="text-right">
                <div className="font-bold text-slate-900">Prof. Rajive Kumar</div>
                <div className="text-slate-600 text-[11px]">Member Secretary, AICTE</div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-200">
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 border border-slate-300 transition-colors"
            >
              {copied ? <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Agenda Text'}</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 border border-slate-300 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Download Council PDF</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold"
          >
            Close Dossier
          </button>
        </div>
      </div>
    </Modal>
  );
};
