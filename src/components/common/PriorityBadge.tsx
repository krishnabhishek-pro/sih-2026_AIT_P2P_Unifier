import React from 'react';
import { ComplaintPriority } from '../../types';

interface PriorityBadgeProps {
  priority: ComplaintPriority | string;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority }) => {
  let classes = 'bg-slate-100 text-slate-700 border-slate-200';

  switch (priority) {
    case 'URGENT':
      classes = 'bg-red-100 text-red-800 border-red-300 font-bold animate-pulse';
      break;
    case 'HIGH':
      classes = 'bg-orange-50 text-orange-800 border-orange-200 font-semibold';
      break;
    case 'MEDIUM':
      classes = 'bg-amber-50 text-amber-800 border-amber-200';
      break;
    case 'LOW':
      classes = 'bg-slate-50 text-slate-700 border-slate-200';
      break;
  }

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs border ${classes}`}>
      {priority}
    </span>
  );
};

