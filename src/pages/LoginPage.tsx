import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, Mail, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginPage: React.FC = () => {
  const { login, demoUsers } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('admin@aicte.gov.in');
  const [password, setPassword] = useState('aicte@123');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      setError('');
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Invalid AICTE credentials. Use demo accounts below.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickSelect = (uEmail: string) => {
    setEmail(uEmail);
    setPassword('aicte@123');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#081220] via-[#0B192C] to-[#1E3E62] flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-slate-100">
      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-2">
        <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-slate-950 shadow-xl border border-amber-400/30">
          <Shield className="w-8 h-8 text-white fill-white/20" />
        </div>
        <h2 className="text-xl font-extrabold tracking-tight text-white uppercase">
          AICTE Unified Grievance Monitoring System
        </h2>
        <p className="text-xs text-amber-400 font-bold uppercase tracking-wider">
          अखिल भारतीय तकनीकी शिक्षा परिषद (AUGMS)
        </p>
        <p className="text-xs text-slate-400">
          Administrative Portal · For Authorized AICTE Officials & Bureaus Only
        </p>
      </div>

      {/* Login Card */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white text-slate-900 py-8 px-6 shadow-2xl rounded-2xl sm:px-10 border border-slate-200">
          <form className="space-y-4" onSubmit={handleSubmit}>
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700">Official AICTE / NIC Email</label>
              <div className="mt-1 relative rounded-lg shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="official@aicte.gov.in"
                  className="block w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700">Security Password</label>
              <div className="mt-1 relative rounded-lg shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent rounded-xl shadow-sm text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50"
              >
                <span>{isLoading ? 'Authenticating...' : 'Sign In to Official Console'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Quick 1-Click Credentials for Evaluators & SIH 2026 Demonstrations */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <p className="text-[11px] font-bold text-slate-700 mb-2 uppercase tracking-wider">
              Quick 1-Click Demo Profiles (For SIH Evaluation)
            </p>
            <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
              {[
                { name: 'Dr. Abhay Jere', role: 'Super Admin', email: 'admin@aicte.gov.in' },
                { name: 'Prof. T. G. Sitharam', role: 'Senior Official', email: 'senior.official@aicte.gov.in' },
                { name: 'Dr. Ramesh C. Verma', role: 'Bureau Head (Approval)', email: 'head.approval@aicte.gov.in' },
                { name: 'Dr. Anand Kulkarni', role: 'Bureau Head (Grievance)', email: 'head.grievance@aicte.gov.in' },
                { name: 'Dr. Manoj Sharma', role: 'Bureau Officer (Approval)', email: 'officer.sharma@aicte.gov.in' },
              ].map((d) => (
                <button
                  key={d.email}
                  type="button"
                  onClick={() => handleQuickSelect(d.email)}
                  className={`w-full text-left p-2 rounded-lg text-xs flex items-center justify-between transition-colors border ${
                    email === d.email
                      ? 'bg-blue-50/80 border-blue-200 text-blue-900 font-bold'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="truncate mr-2">
                    <span className="font-bold text-slate-900 block truncate">{d.name}</span>
                    <span className="text-[10px] text-slate-500">{d.role}</span>
                  </div>
                  <span className="text-[10px] font-mono text-blue-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                    Use
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Prototype Disclaimer */}
        <p className="mt-4 text-center text-[11px] text-slate-400">
          All data presented is realistic fictional data created for SIH 2026 prototype demonstration.
        </p>
      </div>
    </div>
  );
};

