import React from 'react';

interface BureauBadgeProps {
  code: string;
  name?: string;
  showFullName?: boolean;
}

export const BureauBadge: React.FC<BureauBadgeProps> = ({ code, name, showFullName = false }) => {
  let color = 'bg-blue-50 text-blue-700 border-blue-200';

  switch (code) {
    case 'AB':
      color = 'bg-indigo-50 text-indigo-700 border-indigo-200';
      break;
    case 'PAPB':
      color = 'bg-purple-50 text-purple-700 border-purple-200';
      break;
    case 'RGRB':
      color = 'bg-amber-50 text-amber-800 border-amber-200';
      break;
    case 'ROAC':
      color = 'bg-emerald-50 text-emerald-800 border-emerald-200';
      break;
  }

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-medium border ${color}`}
      title={name || code}
    >
      <span className="font-semibold tracking-wider">{code}</span>
      {showFullName && name && <span className="opacity-75">· {name}</span>}
    </span>
  );
};

