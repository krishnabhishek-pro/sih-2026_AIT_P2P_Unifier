import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: LucideIcon;
  variant?: 'default' | 'amber' | 'blue' | 'emerald' | 'rose' | 'purple';
  trend?: string;
  alert?: boolean;
  onClick?: () => void;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = 'default',
  trend,
  alert,
  onClick,
}) => {
  const styles = {
    default: {
      border: 'border-slate-200',
      iconBg: 'bg-slate-100 text-slate-700',
      accent: 'text-slate-900',
    },
    amber: {
      border: 'border-amber-200',
      iconBg: 'bg-amber-50 text-amber-700',
      accent: 'text-amber-900',
    },
    blue: {
      border: 'border-blue-200',
      iconBg: 'bg-blue-50 text-blue-700',
      accent: 'text-blue-900',
    },
    emerald: {
      border: 'border-emerald-200',
      iconBg: 'bg-emerald-50 text-emerald-700',
      accent: 'text-emerald-900',
    },
    rose: {
      border: 'border-rose-200',
      iconBg: 'bg-rose-50 text-rose-700',
      accent: 'text-rose-900',
    },
    purple: {
      border: 'border-purple-200',
      iconBg: 'bg-purple-50 text-purple-700',
      accent: 'text-purple-900',
    },
  }[variant];

  return (
    <div
      onClick={onClick}
      className={`relative bg-white rounded-xl p-5 border ${styles.border} shadow-sm transition-all duration-200 hover:shadow-md ${
        onClick ? 'cursor-pointer hover:-translate-y-0.5' : ''
      }`}
    >
      {alert && (
        <span className="absolute top-3 right-3 flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
        </span>
      )}

      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</span>
        <div className={`p-2 rounded-lg ${styles.iconBg}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <span className={`text-3xl font-extrabold tracking-tight ${styles.accent}`}>{value}</span>
        {trend && <span className="text-xs font-medium text-slate-500">{trend}</span>}
      </div>

      {subtitle && <p className="mt-1 text-xs text-slate-500 line-clamp-1">{subtitle}</p>}
    </div>
  );
};

