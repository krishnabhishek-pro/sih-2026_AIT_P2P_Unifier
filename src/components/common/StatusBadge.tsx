import React from 'react';
import { ComplaintStatus } from '../../types';

interface StatusBadgeProps {
  status: ComplaintStatus | string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  let config = {
    label: status.replace(/_/g, ' '),
    classes: 'bg-slate-100 text-slate-700 border-slate-200',
    dot: 'bg-slate-400',
  };

  switch (status) {
    case 'PENDING':
      config = {
        label: 'Pending Scrutiny',
        classes: 'bg-amber-50 text-amber-800 border-amber-200',
        dot: 'bg-amber-500',
      };
      break;
    case 'UNDER_REVIEW':
      config = {
        label: 'Under Review',
        classes: 'bg-blue-50 text-blue-800 border-blue-200',
        dot: 'bg-blue-500',
      };
      break;
    case 'ACTION_INITIATED':
      config = {
        label: 'Action Initiated',
        classes: 'bg-indigo-50 text-indigo-800 border-indigo-200',
        dot: 'bg-indigo-500',
      };
      break;
    case 'SHOW_CAUSE_ISSUED':
      config = {
        label: 'Show Cause Issued',
        classes: 'bg-purple-50 text-purple-800 border-purple-200',
        dot: 'bg-purple-500',
      };
      break;
    case 'COMMITTEE_HEARING':
      config = {
        label: 'Committee Hearing',
        classes: 'bg-cyan-50 text-cyan-800 border-cyan-200',
        dot: 'bg-cyan-500',
      };
      break;
    case 'RESOLVED':
      config = {
        label: 'Resolved',
        classes: 'bg-emerald-50 text-emerald-800 border-emerald-200',
        dot: 'bg-emerald-500',
      };
      break;
    case 'CLOSED':
      config = {
        label: 'Closed',
        classes: 'bg-slate-100 text-slate-700 border-slate-300',
        dot: 'bg-slate-400',
      };
      break;
    case 'OVERDUE':
      config = {
        label: 'Overdue (SLA Exceeded)',
        classes: 'bg-rose-50 text-rose-800 border-rose-200 font-semibold',
        dot: 'bg-rose-500 animate-pulse',
      };
      break;
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${sizeClasses} ${config.classes}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      <span>{config.label}</span>
    </span>
  );
};

