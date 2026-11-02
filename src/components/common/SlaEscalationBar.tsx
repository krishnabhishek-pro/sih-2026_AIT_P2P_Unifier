import React, { useState } from 'react';
import { Clock, AlertTriangle, ShieldAlert, CheckCircle2, Zap } from 'lucide-react';
import { Complaint } from '../../types';

interface SlaEscalationBarProps {
  complaint: Pick<Complaint, 'dateReceived' | 'status' | 'dueDate' | 'priority'> & { id?: string; complaintNo?: string };
  variant?: 'compact' | 'full';
  onEscalate?: () => void;
}

export const SlaEscalationBar: React.FC<SlaEscalationBarProps> = ({
  complaint,
  variant = 'compact',
  onEscalate,
}) => {
  const [escalated, setEscalated] = useState(false);

  // Compute days elapsed
  const receivedDate = new Date(complaint.dateReceived || Date.now());
  const now = new Date();
  const diffTime = Math.max(0, now.getTime() - receivedDate.getTime());
  const daysElapsed = Math.max(1, Math.floor(diffTime / (1000 * 60 * 60 * 24)));
  const totalSlaDays = 30; // Statutory AICTE SLA limit
  const percentage = Math.min(100, Math.round((daysElapsed / totalSlaDays) * 100));
  const daysLeft = Math.max(0, totalSlaDays - daysElapsed);
  const isResolved = complaint.status === 'RESOLVED' || complaint.status === 'CLOSED';

  // Determine Tier
  let tier: 'tier1' | 'tier2' | 'tier3';
  if (daysElapsed <= 15) {
    tier = 'tier1';
  } else if (daysElapsed <= 25) {
    tier = 'tier2';
  } else {
    tier = 'tier3';
  }

  const handleManualEscalate = () => {
    setEscalated(true);
    if (onEscalate) onEscalate();
  };

  if (isResolved) {
    return (
      <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-1 rounded border border-emerald-200">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
        <span>SLA Satisfied (Resolved in {daysElapsed}d)</span>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className="w-full space-y-1">
        <div className="flex items-center justify-between text-[11px]">
          <span className="flex items-center gap-1 font-semibold text-slate-700">
            <Clock className="w-3 h-3 text-slate-400" />
            <span>Day {daysElapsed}/30</span>
          </span>
          <span
            className={`font-bold text-[10px] uppercase px-1.5 py-0.2 rounded ${
              tier === 'tier1'
                ? 'bg-blue-50 text-blue-700'
                : tier === 'tier2'
                ? 'bg-amber-100 text-amber-800'
                : 'bg-rose-100 text-rose-700 animate-pulse'
            }`}
          >
            {tier === 'tier1' ? 'Tier 1' : tier === 'tier2' ? 'Tier 2 Risk' : 'Tier 3 Breach'}
          </span>
        </div>
        {/* Progress Track */}
        <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden relative">
          <div
            className={`h-full transition-all duration-500 ${
              tier === 'tier1' ? 'bg-blue-600' : tier === 'tier2' ? 'bg-amber-500' : 'bg-rose-600'
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    );
  }

  // Full detailed variant
  return (
    <div
      className={`p-4 rounded-xl border ${
        tier === 'tier1'
          ? 'bg-blue-50/50 border-blue-200'
          : tier === 'tier2'
          ? 'bg-amber-50/60 border-amber-300'
          : 'bg-rose-50/70 border-rose-300'
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          {tier === 'tier1' && <Clock className="w-5 h-5 text-blue-600" />}
          {tier === 'tier2' && <AlertTriangle className="w-5 h-5 text-amber-600" />}
          {tier === 'tier3' && <ShieldAlert className="w-5 h-5 text-rose-600 animate-bounce" />}
          <div>
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span>Statutory SLA Tracking Matrix</span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                  tier === 'tier1'
                    ? 'bg-blue-100 text-blue-800'
                    : tier === 'tier2'
                    ? 'bg-amber-100 text-amber-900'
                    : 'bg-rose-200 text-rose-900 animate-pulse'
                }`}
              >
                {tier === 'tier1' ? 'Normal Pace (Tier 1)' : tier === 'tier2' ? 'Escalation Alert (Tier 2)' : 'Statutory Breach (Tier 3)'}
              </span>
            </h4>
            <p className="text-xs text-slate-500">
              Mandated by Regulation 7(2) of AICTE Redressal of Grievance Regulations, 2019 (Strict 30-Day Resolution Window)
            </p>
          </div>
        </div>

        {tier !== 'tier1' && (
          <button
            onClick={handleManualEscalate}
            disabled={escalated}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all ${
              escalated
                ? 'bg-slate-200 text-slate-600 cursor-not-allowed'
                : 'bg-rose-600 hover:bg-rose-700 text-white'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>{escalated ? 'Escalated to Chairman / MS' : 'Fast-Track Escalation'}</span>
          </button>
        )}
      </div>

      {/* Progress Bar with Milestone Markers */}
      <div className="space-y-1.5 my-3">
        <div className="flex justify-between text-xs font-semibold text-slate-700">
          <span>Elapsed: <strong className="text-slate-900">{daysElapsed} days</strong></span>
          <span>Remaining: <strong className={daysLeft <= 5 ? 'text-rose-600' : 'text-slate-900'}>{daysLeft} days</strong></span>
        </div>
        <div className="h-3 bg-slate-200 rounded-full relative overflow-hidden">
          <div
            className={`h-full transition-all duration-700 rounded-full ${
              tier === 'tier1' ? 'bg-gradient-to-r from-blue-500 to-blue-600' : tier === 'tier2' ? 'bg-gradient-to-r from-amber-400 to-amber-600' : 'bg-gradient-to-r from-rose-500 to-rose-700'
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        {/* Tier Milestones */}
        <div className="grid grid-cols-3 text-[10px] text-slate-500 pt-1 font-medium">
          <div>
            <span className="font-bold text-slate-700">Day 1 - 15</span>
            <p className="text-[10px] text-slate-400">Desk Officer Inquiry</p>
          </div>
          <div className="text-center">
            <span className="font-bold text-slate-700">Day 16 - 25</span>
            <p className="text-[10px] text-amber-700 font-semibold">Bureau Head Summons</p>
          </div>
          <div className="text-right">
            <span className="font-bold text-slate-700">Day 26 - 30+</span>
            <p className="text-[10px] text-rose-700 font-bold">Council Admission Freeze</p>
          </div>
        </div>
      </div>

      {/* SLA Action Status Box */}
      <div className="mt-3 p-2.5 bg-white/80 rounded-lg border border-slate-200 text-xs text-slate-700 flex items-start gap-2">
        <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0 bg-blue-600" />
        <div>
          <strong className="text-slate-900">Active SLA Stage: </strong>
          {tier === 'tier1' && 'Standard case collection. Assigned officer is reviewing initial records from institution.'}
          {tier === 'tier2' && 'Level 1 Statutory Reminder dispatched. Institution head required to appear before Bureau Head.'}
          {tier === 'tier3' && 'Critical Breach. Case automatically queued for Chairman AICTE Review & Approval Portal hold.'}
        </div>
      </div>
    </div>
  );
};

