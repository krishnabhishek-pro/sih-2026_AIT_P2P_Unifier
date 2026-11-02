import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Briefcase,
  Users,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRight,
  Shield,
  RefreshCw,
  Mail,
  UserCheck,
} from 'lucide-react';
import api from '../services/api';
import { BureauBadge } from '../components/common/BureauBadge';
import { Bureau } from '../types';

export const BureauManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const [bureaus, setBureaus] = useState<Bureau[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBureaus = async () => {
    try {
      setLoading(true);
      const res = await api.get('/bureaus');
      setBureaus(res.data);
    } catch (err) {
      console.error('Failed to load bureaus:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBureaus();
  }, []);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">AICTE Bureau Management & Caseload</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Operational monitoring across functional divisions and specialized investigation desks.
          </p>
        </div>
        <button
          onClick={fetchBureaus}
          className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors self-start sm:self-auto"
          title="Refresh Bureaus"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Grid of Bureaus */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {bureaus.map((b) => (
          <div
            key={b.id}
            className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4 hover:border-slate-300 transition-all flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <BureauBadge code={b.code} />
                    <h3 className="text-base font-bold text-slate-900">{b.name}</h3>
                  </div>
                  <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{b.description}</p>
                </div>
              </div>

              {/* Bureau Head Info */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400">Bureau Head / Adviser</span>
                  <p className="font-bold text-slate-900 mt-0.5">{b.headName || 'AICTE Adviser'}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Official Contact</span>
                  <p className="font-mono text-slate-600 mt-0.5">{b.headEmail || 'bureau@aicte.gov.in'}</p>
                </div>
              </div>

              {/* Statistics Row */}
              <div className="grid grid-cols-4 gap-2 text-center text-xs">
                <div className="p-2.5 rounded-xl bg-blue-50/60 border border-blue-100">
                  <span className="text-[10px] uppercase font-bold text-blue-700">Total Cases</span>
                  <div className="text-lg font-black text-blue-950 mt-0.5">{b.stats?.total || 0}</div>
                </div>
                <div className="p-2.5 rounded-xl bg-amber-50/60 border border-amber-100">
                  <span className="text-[10px] uppercase font-bold text-amber-700">Active</span>
                  <div className="text-lg font-black text-amber-950 mt-0.5">{b.stats?.pending || 0}</div>
                </div>
                <div className="p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-100">
                  <span className="text-[10px] uppercase font-bold text-emerald-700">Resolved</span>
                  <div className="text-lg font-black text-emerald-950 mt-0.5">{b.stats?.resolved || 0}</div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-500">Avg Disposal</span>
                  <div className="text-lg font-black text-slate-800 mt-0.5">{b.stats?.avgResolutionDays || 18}d</div>
                </div>
              </div>

              {/* Officers count & roster preview */}
              <div className="pt-2 border-t border-slate-100 text-xs">
                <div className="flex items-center justify-between text-slate-500 mb-2">
                  <span className="flex items-center gap-1 font-semibold">
                    <Users className="w-3.5 h-3.5" />
                    <span>Authorized Officers ({b.users?.length || 0})</span>
                  </span>
                </div>
                <div className="space-y-1.5">
                  {(b.users || []).map((u) => (
                    <div key={u.id} className="p-2 rounded-lg bg-slate-50 flex items-center justify-between text-[11px]">
                      <div>
                        <span className="font-semibold text-slate-900">{u.name}</span>
                        <span className="text-slate-400"> · {u.designation}</span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-500">{u.email}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* View Bureau Cases Button */}
            <div className="pt-3 border-t border-slate-100">
              <button
                onClick={() => navigate(`/complaints?bureau=${b.code}`)}
                className="w-full py-2 rounded-xl bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 font-bold text-xs flex items-center justify-center gap-1.5 border border-slate-200 transition-colors"
              >
                <span>Examine All {b.code} Grievances</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

