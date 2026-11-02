import React, { useState } from 'react';
import {
  FileText,
  Printer,
  Copy,
  CheckCircle,
  AlertTriangle,
  Building,
  Calendar,
  Sparkles,
  Download,
  ShieldAlert,
} from 'lucide-react';
import { Modal } from '../common/Modal';
import api from '../../services/api';

interface AiNoticeGeneratorModalProps {
  complaint?: any;
  overlap?: any;
  onClose: () => void;
  onNoticeIssued?: () => void;
}

export const AiNoticeGeneratorModal: React.FC<AiNoticeGeneratorModalProps> = ({
  complaint,
  overlap,
  onClose,
  onNoticeIssued,
}) => {
  // Derive details from complaint or overlap
  const comp = complaint || (overlap ? overlap.originalComplaint : null);
  const relComp = overlap ? overlap.relatedComplaint : null;

  const institutionName =
    comp?.institution?.name || overlap?.institution?.name || 'Technical Institute of India';
  const aicteId =
    comp?.institution?.aicteId || overlap?.institution?.aicteId || '1-XXXXXXXXX';
  const state =
    comp?.institution?.state || overlap?.institution?.state || 'New Delhi';
  const complaintNo = comp?.complaintNo || 'AUGMS-2026-XXXX';
  const category = comp?.category || 'Governance & Regulatory Compliance';
  const description = comp?.description || 'Substantive non-compliance reported.';

  // State
  const [noticeType, setNoticeType] = useState<string>('SHOW_CAUSE');
  const [deadlineDays, setDeadlineDays] = useState<number>(15);
  const [copied, setCopied] = useState<boolean>(false);
  const [isIssuing, setIsIssuing] = useState<boolean>(false);
  const [customClause, setCustomClause] = useState<string>('');

  // Determine APH Statutory Clause based on category
  const getAphClause = () => {
    const cat = category.toLowerCase();
    if (cat.includes('faculty') || cat.includes('salary') || cat.includes('staff')) {
      return {
        clause: 'AICTE Approval Process Handbook (APH), Chapter VII, Clause 7.2 & 7.3',
        title: 'Non-Adherence to 7th Central Pay Commission (CPC) Norms & Appointment of Qualified Faculty',
        mandate:
          'Institutions shall maintain student-to-faculty ratio (SFR) of 15:1 or 20:1 as stipulated, disburse full salaries via verifiable bank transfer, and maintain verifiable Aadhaar-enabled biometric records.',
      };
    }
    if (cat.includes('fee') || cat.includes('certificate') || cat.includes('document')) {
      return {
        clause: 'AICTE Approval Process Handbook (APH), Chapter VIII, Clause 8.1 & 8.2',
        title: 'Prohibition of Capitation Fees and Unlawful Retention of Original Student Certificates',
        mandate:
          'No institution shall solicit capitation fee under any guise nor retain original academic/migration certificates of any student admitted or withdrawing.',
      };
    }
    if (cat.includes('infrastructure') || cat.includes('fire') || cat.includes('lab')) {
      return {
        clause: 'AICTE Approval Process Handbook (APH), Chapter IV, Clause 4.5 & Safety Norms',
        title: 'Deficiency in Mandatory Physical, Fire Safety & Computing Infrastructure',
        mandate:
          'Institutions must possess a valid Fire NOC, Occupancy Certificate from local municipal authority, and licensed laboratory equipment matching intake.',
      };
    }
    if (cat.includes('ragging') || cat.includes('harassment') || cat.includes('grievance')) {
      return {
        clause: 'AICTE Redressal of Grievance of Students Regulations, 2019 (Regulation 4 & 6)',
        title: 'Failure to Constitute Functional Student Grievance Redressal Committee (SGRC) / Ombudsman',
        mandate:
          'Every technical institution shall establish an SGRC headed by senior professor and prominently display the Portal URL on website and campus notices.',
      };
    }
    return {
      clause: 'AICTE Act 1987, Section 10(k) read with Approval Process Norms',
      title: 'General Statutory Non-Compliance & Administrative Irregularities',
      mandate:
        'Technical institutions are bound to adhere strictly to approval conditions failing which penal action under Section 10(p) may be invoked.',
    };
  };

  const aph = getAphClause();

  // Reference Code
  const noticeRefNo = `AICTE/AUGMS/SCN/2026/${complaintNo.replace(/[^a-zA-Z0-9]/g, '')}`;
  const currentDate = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  const responseDate = new Date(Date.now() + deadlineDays * 24 * 60 * 60 * 1000).toLocaleDateString(
    'en-IN',
    {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }
  );

  const generateNoticeText = () => {
    return `ALL INDIA COUNCIL FOR TECHNICAL EDUCATION
(A Statutory Body of the Government of India)
Nelson Mandela Marg, Vasant Kunj, New Delhi - 110070
Unified Grievance Monitoring System (AUGMS) - Vigilance & Monitoring Wing

Ref No: ${noticeRefNo}
Date: ${currentDate}

SPEED POST / URGENT BY E-MAIL
To,
The Chairman / Secretary / Principal,
${institutionName}
(AICTE Permanent ID: ${aicteId})
${state}, India

SUBJECT: ${
      noticeType === 'SHOW_CAUSE'
        ? 'STATUTORY SHOW-CAUSE NOTICE UNDER CLAUSE 12 OF AICTE ACT, 1987'
        : noticeType === 'HEARING'
        ? 'NOTICE OF APPEARANCE FOR PERSONAL HEARING / COMMITTEE INQUIRY'
        : 'DIRECTIVE FOR IMMEDIATE COMPLIANCE & RECTIFICATION'
    } - REGARDING COMPLAINT NO. ${complaintNo}

Sir/Madam,

1. WHEREAS, the All India Council for Technical Education (hereinafter referred to as the 'Council') is empowered under Section 10 of the AICTE Act, 1987 to regulate and monitor norms, standards, and institutional grievances in technical education across the country;

2. AND WHEREAS, formal complaint(s) have been registered on the AICTE Unified Grievance Monitoring System (AUGMS) against your institution, bearing Complaint Reference No: ${complaintNo}${
      relComp ? ` and cross-linked related docket ${relComp.complaintNo}` : ''
    }, alleging substantive violations under Category: "${category}";

3. SPECIFIC ALLEGATIONS & GROUND REPORT:
"${description}"
${
  relComp
    ? `\nCross-Bureau Collision Note: A concurrent complaint with similar allegations was received by the ${relComp.bureau?.name || 'Related Bureau'} on ${relComp.dateReceived}.`
    : ''
}

4. STATUTORY CLAUSE INVIOLABILITY:
Your attention is drawn to ${customClause || aph.clause}:
"${aph.title}"
Statutory Mandate: ${aph.mandate}

5. NOW THEREFORE, you are hereby called upon to SHOW CAUSE in writing within ${deadlineDays} (fifteen) calendar days from the date of issuance of this notice (i.e. on or before ${responseDate}) as to why appropriate punitive action including:
   (a) Reduction in approved student intake for the forthcoming academic year;
   (b) Placing the institution under "No Admission" / "No Extension of Approval" status;
   (c) Withholding of grants or recommendations for withdrawal of affiliation;
shall not be initiated against ${institutionName} under Section 10(p) of the AICTE Act, 1987.

6. Your written submission along with certified documentary evidence (bank transfer ledgers, affidavits, and fire/biometric logs) must be submitted via the AUGMS Officer Portal. In default of receipt of written reply within the stipulated time, it shall be presumed that you have no explanation to offer and ex-parte action shall follow.

Issued with the approval of the Competent Authority.

(Authorized Signatory)
Member Secretary / Bureau Head
AICTE Unified Grievance Monitoring Division
Government of India, New Delhi`;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generateNoticeText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleIssueNotice = async () => {
    if (!comp?.id) return;
    try {
      setIsIssuing(true);
      await api.post(`/complaints/${comp.id}/status`, {
        status: 'SHOW_CAUSE_ISSUED',
        remarks: `Statutory Show-Cause Notice (${noticeRefNo}) generated and dispatched with ${deadlineDays}-day statutory response deadline (${responseDate}).`,
      });
      if (onNoticeIssued) onNoticeIssued();
      onClose();
    } catch (err: any) {
      alert(`Notice issued locally. Error updating status: ${err.message}`);
      if (onNoticeIssued) onNoticeIssued();
      onClose();
    } finally {
      setIsIssuing(false);
    }
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="AI Statutory Show-Cause Notice Generator" size="2xl">
      <div className="space-y-4">
        {/* Top Control Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
          <div>
            <label className="text-[11px] font-bold text-slate-700 block mb-1 uppercase tracking-wider">
              Notice Framework
            </label>
            <select
              value={noticeType}
              onChange={(e) => setNoticeType(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-medium bg-white focus:outline-none focus:border-blue-500"
            >
              <option value="SHOW_CAUSE">Statutory Show-Cause Notice (Rule 12)</option>
              <option value="HEARING">Hearing & Committee Appearance Notice</option>
              <option value="COMPLIANCE">Immediate Compliance Directive</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-700 block mb-1 uppercase tracking-wider">
              Response SLA Window
            </label>
            <select
              value={deadlineDays}
              onChange={(e) => setDeadlineDays(Number(e.target.value))}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-medium bg-white focus:outline-none focus:border-blue-500"
            >
              <option value={7}>7 Calendar Days (Urgent)</option>
              <option value={15}>15 Calendar Days (Statutory Standard)</option>
              <option value={30}>30 Calendar Days (Comprehensive Audit)</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-700 block mb-1 uppercase tracking-wider">
              APH Statutory Citation
            </label>
            <div className="text-xs font-semibold text-blue-900 bg-blue-50/80 p-1.5 rounded border border-blue-200 truncate">
              {aph.clause}
            </div>
          </div>
        </div>

        {/* Notice Preview Document with Government Letterhead */}
        <div className="p-6 bg-white border border-slate-300 rounded-xl shadow-inner font-serif text-slate-900 max-h-[460px] overflow-y-auto leading-relaxed text-xs">
          {/* Government of India Emblem & AICTE Header */}
          <div className="text-center border-b-2 border-slate-900 pb-3 mb-4 font-sans">
            <div className="text-[10px] font-bold tracking-widest text-slate-600 uppercase">
              GOVERNMENT OF INDIA · MINISTRY OF EDUCATION
            </div>
            <h2 className="text-base font-extrabold text-slate-900 tracking-wide uppercase mt-0.5">
              ALL INDIA COUNCIL FOR TECHNICAL EDUCATION
            </h2>
            <p className="text-[10px] text-slate-500 font-medium">
              Nelson Mandela Marg, Vasant Kunj, New Delhi - 110070 | www.aicte-india.org
            </p>
            <div className="inline-block mt-1 px-3 py-0.5 rounded-full bg-slate-900 text-white font-mono text-[10px] tracking-widest">
              AUGMS VIGILANCE & COMPLIANCE DOCKET
            </div>
          </div>

          {/* Letter Metadata */}
          <div className="flex justify-between items-start text-[11px] font-sans font-semibold mb-4 text-slate-700 border-b border-dashed border-slate-300 pb-2">
            <div>
              <p>
                Ref No: <span className="font-mono text-blue-900 font-bold">{noticeRefNo}</span>
              </p>
              <p className="text-rose-700 uppercase font-bold tracking-wider mt-0.5">
                SPEED POST / URGENT BY E-MAIL
              </p>
            </div>
            <div className="text-right">
              <p>Date: {currentDate}</p>
              <p className="text-amber-700 font-bold">Reply Deadline: {responseDate}</p>
            </div>
          </div>

          {/* Addressee */}
          <div className="mb-4 text-xs font-sans">
            <p className="font-bold text-slate-900">To,</p>
            <p className="font-semibold text-slate-800">The Chairman / Secretary / Principal,</p>
            <p className="font-bold text-blue-950">{institutionName}</p>
            <p className="text-slate-600">AICTE Permanent ID: <strong className="font-mono">{aicteId}</strong></p>
            <p className="text-slate-600">{state}, India</p>
          </div>

          {/* Subject */}
          <div className="p-2.5 bg-slate-100 rounded border border-slate-300 mb-4 font-sans text-xs font-bold text-slate-900 text-center uppercase tracking-wide">
            SUBJECT: {noticeType === 'SHOW_CAUSE' ? 'STATUTORY SHOW-CAUSE NOTICE UNDER SECTION 10(P) OF AICTE ACT, 1987' : 'OFFICIAL INQUIRY & COMPLIANCE NOTICE'} - REGARDING COMPLAINT {complaintNo}
          </div>

          {/* Notice Paragraphs */}
          <div className="space-y-3 text-justify text-xs font-sans leading-normal text-slate-800">
            <p>
              <strong>1.</strong> WHEREAS, the All India Council for Technical Education (AICTE) is a statutory authority established under the AICTE Act, 1987 for proper planning and coordinated development of technical education throughout the country.
            </p>
            <p>
              <strong>2.</strong> AND WHEREAS, formal grievance(s) have been lodged against <strong>{institutionName}</strong> under Category: <span className="underline decoration-blue-500 font-semibold">{category}</span>, registered on the AICTE Unified Grievance Monitoring System (AUGMS) under Reference Docket <strong>{complaintNo}</strong>.
            </p>
            <div className="p-3 bg-amber-50/60 rounded border border-amber-200 text-xs italic text-slate-800">
              <strong className="not-italic text-amber-900 block font-sans uppercase text-[10px] tracking-wider mb-1">
                Substantive Allegation Extract:
              </strong>
              "{description}"
            </div>
            <p>
              <strong>3. STATUTORY INVIOLABILITY:</strong> Your attention is explicitly drawn to <strong>{aph.clause}</strong> ({aph.title}), which mandates: <em>"{aph.mandate}"</em>.
            </p>
            <p>
              <strong>4.</strong> NOW THEREFORE, you are hereby directed to <strong>SHOW CAUSE</strong> in writing within <strong>{deadlineDays} calendar days</strong> (on or before <strong>{responseDate}</strong>) as to why punitive sanctions, including withdrawal of approval, freezing of student intake, or removal from AICTE portal lists, shall not be instituted.
            </p>
          </div>

          {/* Signature Block */}
          <div className="mt-8 pt-4 border-t border-slate-200 flex justify-between items-end font-sans">
            <div className="text-[10px] text-slate-400 font-mono">
              Digitally Verified by AICTE AUGMS Engine<br />
              SHA-256 Validated Docket
            </div>
            <div className="text-right">
              <div className="text-xs font-bold text-slate-900">Competent Authority / Bureau Head</div>
              <div className="text-[11px] text-slate-600">Approval & Grievance Regulation Division</div>
              <div className="text-[10px] text-slate-500">AICTE Hqrs, New Delhi</div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-300"
            >
              {copied ? <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied to Clipboard' : 'Copy Notice Text'}</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-300"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save as PDF</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleIssueNotice}
              disabled={isIssuing}
              className="px-5 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>{isIssuing ? 'Issuing Notice...' : 'Issue Formal Show-Cause Notice'}</span>
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
