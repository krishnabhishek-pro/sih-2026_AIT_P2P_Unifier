import React, { useState } from 'react';
import {
  Globe,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Search,
  Building2,
  FileText,
  AlertTriangle,
  Lock,
} from 'lucide-react';
import { Modal } from '../common/Modal';

interface NationalIntegrationsDrawerProps {
  complaint?: any;
  institution?: any;
  isOpen: boolean;
  onClose: () => void;
}

export const NationalIntegrationsDrawer: React.FC<NationalIntegrationsDrawerProps> = ({
  complaint,
  institution,
  isOpen,
  onClose,
}) => {
  const comp = complaint;
  const inst = institution || comp?.institution;

  const [activeTab, setActiveTab] = useState<'cpgrams' | 'digilocker' | 'sfrc' | 'affiliation'>('cpgrams');

  // CPGRAMS state
  const [cpgramsToken, setCpgramsToken] = useState('DARPG/E/2026/049182');
  const [isQueryingCpgrams, setIsQueryingCpgrams] = useState(false);
  const [cpgramsData, setCpgramsData] = useState<any>({
    token: 'DARPG/E/2026/049182',
    dateFiled: '14 Jan 2026',
    complainantCategory: 'Citizen / Student Parent',
    status: 'Forwarded to AICTE Nodal Officer',
    pmoFlag: true,
    darpgOfficer: 'Shri R. K. Verma (Under Secretary, DARPG)',
    slaDaysRemaining: 6,
  });

  // DigiLocker / NAD state
  const [degreeRegNo, setDegreeRegNo] = useState('NAD-PHD-2019-8812');
  const [isVerifyingNad, setIsVerifyingNad] = useState(false);
  const [nadResult, setNadResult] = useState<{ verified: boolean; scholarName: string; university: string; issueYear: string; discrepancy?: string } | null>({
    verified: false,
    scholarName: 'Dr. Ramesh Chandra (Declared HOD)',
    university: 'State Open University of Technology',
    issueYear: '2019',
    discrepancy: 'Degree serial not found in National Academic Depository (NAD). Flagged as Unverified/Bogus Credential.',
  });

  // SFRC State
  const sfrcApprovedFee = 85000;
  const chargedFee = 145000;
  const excessCapitation = chargedFee - sfrcApprovedFee;

  const handleSyncCpgrams = () => {
    setIsQueryingCpgrams(true);
    setTimeout(() => {
      setIsQueryingCpgrams(false);
      setCpgramsData((prev: any) => ({
        ...prev,
        status: 'Synchronized with DARPG Master Server (Level 2 Active)',
        slaDaysRemaining: 5,
      }));
    }, 1000);
  };

  const handleVerifyNad = () => {
    setIsVerifyingNad(true);
    setTimeout(() => {
      setIsVerifyingNad(false);
      if (degreeRegNo.includes('VALID')) {
        setNadResult({
          verified: true,
          scholarName: 'Dr. Amit Sharma',
          university: 'Indian Institute of Technology Delhi',
          issueYear: '2016',
        });
      } else {
        setNadResult({
          verified: false,
          scholarName: 'Dr. Ramesh Chandra (Declared HOD)',
          university: 'State Open University of Technology',
          issueYear: '2019',
          discrepancy: 'Degree serial not found in National Academic Depository (NAD). Flagged as Unverified/Bogus Credential.',
        });
      }
    }, 1200);
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="National Inter-Agency Integration & Cross-Verification Gateway"
      size="2xl"
    >
      <div className="space-y-4">
        {/* Subtitle */}
        <p className="text-xs text-slate-500">
          Federated data exchange between AICTE AUGMS, DARPG CPGRAMS, DigiLocker / NAD, and State Regulatory Bodies.
        </p>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 gap-2">
          <button
            onClick={() => setActiveTab('cpgrams')}
            className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 ${
              activeTab === 'cpgrams'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            🏛️ CPGRAMS (DARPG Sync)
          </button>
          <button
            onClick={() => setActiveTab('digilocker')}
            className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 ${
              activeTab === 'digilocker'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            🎓 DigiLocker / NAD Verification
          </button>
          <button
            onClick={() => setActiveTab('sfrc')}
            className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 ${
              activeTab === 'sfrc'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            💰 State Fee Regulatory (SFRC)
          </button>
          <button
            onClick={() => setActiveTab('affiliation')}
            className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 ${
              activeTab === 'affiliation'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            🏛️ University Affiliation Status
          </button>
        </div>

        {/* Tab 1: CPGRAMS DARPG */}
        {activeTab === 'cpgrams' && (
          <div className="space-y-3">
            <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-200 text-xs text-blue-900 flex items-start gap-2.5">
              <Globe className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="block">DARPG CPGRAMS Real-Time Bridge:</strong>
                Grievances submitted to the Prime Minister’s Office (PMO) or Ministry of Education are routed via DARPG API.
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={cpgramsToken}
                onChange={(e) => setCpgramsToken(e.target.value)}
                placeholder="Enter CPGRAMS Registration No (e.g. DARPG/E/2026/049182)"
                className="flex-1 text-xs px-3 py-2 rounded-lg border border-slate-300 font-mono focus:outline-none focus:border-blue-500"
              />
              <button
                onClick={handleSyncCpgrams}
                disabled={isQueryingCpgrams}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isQueryingCpgrams ? 'animate-spin' : ''}`} />
                <span>{isQueryingCpgrams ? 'Querying DARPG...' : 'Sync Docket'}</span>
              </button>
            </div>

            {cpgramsData && (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-slate-800">{cpgramsData.token}</span>
                  {cpgramsData.pmoFlag && (
                    <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold text-[10px] uppercase border border-rose-200">
                      🚨 PMO High-Priority Tracking
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2 text-slate-700 pt-1">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Filing Date:</span>
                    <strong>{cpgramsData.dateFiled}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">DARPG Desk Officer:</span>
                    <strong>{cpgramsData.darpgOfficer}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Current Status:</span>
                    <strong className="text-blue-700">{cpgramsData.status}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">PMO Statutory SLA:</span>
                    <strong className="text-amber-700">{cpgramsData.slaDaysRemaining} Days Remaining</strong>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: DigiLocker / NAD */}
        {activeTab === 'digilocker' && (
          <div className="space-y-3">
            <div className="p-3 bg-indigo-50/70 rounded-xl border border-indigo-200 text-xs text-indigo-900 flex items-start gap-2.5">
              <ShieldCheck className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="block">National Academic Depository (NAD) & DigiLocker Gateway:</strong>
                Directly cross-checks faculty PhD degrees or student certificates against the official university repository to identify fraudulent or bogus faculty.
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={degreeRegNo}
                onChange={(e) => setDegreeRegNo(e.target.value)}
                placeholder="Enter NAD Degree Certificate Token / Reg No"
                className="flex-1 text-xs px-3 py-2 rounded-lg border border-slate-300 font-mono focus:outline-none focus:border-indigo-500"
              />
              <button
                onClick={handleVerifyNad}
                disabled={isVerifyingNad}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
              >
                <Search className={`w-3.5 h-3.5 ${isVerifyingNad ? 'animate-spin' : ''}`} />
                <span>{isVerifyingNad ? 'Checking NAD...' : 'Verify on DigiLocker'}</span>
              </button>
            </div>

            {nadResult && (
              <div
                className={`p-4 rounded-xl border space-y-2 text-xs ${
                  nadResult.verified
                    ? 'bg-emerald-50/70 border-emerald-300'
                    : 'bg-rose-50/80 border-rose-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">{nadResult.scholarName}</span>
                  <span
                    className={`px-2 py-0.5 rounded-full font-bold text-[10px] uppercase ${
                      nadResult.verified
                        ? 'bg-emerald-600 text-white'
                        : 'bg-rose-600 text-white animate-pulse'
                    }`}
                  >
                    {nadResult.verified ? '✓ Authentic NAD Verified' : '❌ Bogus / Unregistered Degree'}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-slate-700">
                  <div>
                    <span className="text-slate-400 block text-[10px]">University:</span>
                    <strong>{nadResult.university}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Passing Year:</span>
                    <strong>{nadResult.issueYear}</strong>
                  </div>
                </div>
                {nadResult.discrepancy && (
                  <div className="p-2 bg-white rounded border border-rose-200 text-rose-800 font-semibold text-[11px] mt-1">
                    ⚠️ {nadResult.discrepancy}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: SFRC Fee Benchmark */}
        {activeTab === 'sfrc' && (
          <div className="space-y-3 text-xs">
            <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200 text-amber-900 flex items-start gap-2.5">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="block">State Fee Regulatory Committee (SFRC) Ceiling Comparison:</strong>
                Enforces the Prohibition of Capitation Fee Act and Supreme Court guidelines on non-commercialization of technical education.
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                <span className="text-slate-600 font-medium">State SFRC Approved Ceiling Fee (B.Tech CSE):</span>
                <strong className="font-mono text-slate-900 text-sm">₹{sfrcApprovedFee.toLocaleString('en-IN')}/year</strong>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                <span className="text-slate-600 font-medium">Actual Fee Demanded by Institution (Grievance Evidence):</span>
                <strong className="font-mono text-rose-600 text-sm">₹{chargedFee.toLocaleString('en-IN')}/year</strong>
              </div>
              <div className="flex justify-between items-center p-2.5 bg-rose-50 rounded-lg border border-rose-200">
                <span className="text-rose-900 font-bold">Unlawful Excess Fee / Capitation Breach:</span>
                <strong className="font-mono text-rose-700 text-base font-extrabold">+₹{excessCapitation.toLocaleString('en-IN')} (70.5% Breach)</strong>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Affiliation Status */}
        {activeTab === 'affiliation' && (
          <div className="space-y-3 text-xs">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900">Affiliating University Records</h4>
                  <p className="text-slate-500 text-[11px]">State Technical University Gateway</p>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] uppercase border border-emerald-200">
                  Affiliation Valid (2025-26)
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-2 text-slate-700">
                <div>
                  <span className="text-slate-400 block text-[10px]">Affiliating Body:</span>
                  <strong>Dr. A.P.J. Abdul Kalam Technical University (AKTU)</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Affiliation Letter No:</span>
                  <strong className="font-mono">AKTU/AFF/2025/3910</strong>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end pt-2 border-t border-slate-200">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold"
          >
            Close Gateway
          </button>
        </div>
      </div>
    </Modal>
  );
};
