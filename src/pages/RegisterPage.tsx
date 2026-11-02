import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Shield,
  User,
  Mail,
  Phone,
  Lock,
  Building,
  Briefcase,
  MapPin,
  KeyRound,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Sparkles,
  ArrowLeft,
  BadgeCheck,
} from 'lucide-react';
import { CaptchaBox } from '../components/auth/CaptchaBox';
import api from '../services/api';
import { Bureau } from '../types';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [bureaus, setBureaus] = useState<Bureau[]>([]);

  // Form Fields
  const [employeeId, setEmployeeId] = useState('');
  const [titlePrefix, setTitlePrefix] = useState('Dr.');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [designation, setDesignation] = useState('Assistant Director');
  const [role, setRole] = useState('BUREAU_OFFICER');
  const [bureauId, setBureauId] = useState('');
  const [region, setRegion] = useState('Central HQ (New Delhi)');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [declaredAffirmation, setDeclaredAffirmation] = useState(true);

  // Security CAPTCHA
  const [captchaAnswer, setCaptchaAnswer] = useState('');
  const [generatedCaptcha, setGeneratedCaptcha] = useState('');

  // Status & Feedback
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [createdUser, setCreatedUser] = useState<any | null>(null);

  useEffect(() => {
    async function loadBureaus() {
      try {
        const res = await api.get('/bureaus');
        setBureaus(res.data);
        if (res.data.length > 0) {
          setBureauId(res.data[0].id);
        }
      } catch (err) {
        console.warn('Could not load bureaus:', err);
      }
    }
    loadBureaus();
    // Pre-suggest a unique employee ID
    const randomSeq = Math.floor(100 + Math.random() * 900);
    setEmployeeId(`AICTE/OFF/2026/${randomSeq}`);
  }, []);

  const handleAutoGenerateId = () => {
    const randomSeq = Math.floor(100 + Math.random() * 900);
    setEmployeeId(`AICTE/OFF/2026/${randomSeq}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Basic Validations
    if (!fullName.trim()) {
      setError('Please provide your full legal name.');
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid official email address.');
      return;
    }

    const cleanPhone = phone.replace(/[^0-9]/g, '');
    if (cleanPhone.length < 10) {
      setError('Please provide a valid 10-digit mobile number for 2FA verification.');
      return;
    }

    if (password.length < 6) {
      setError('Password must contain at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Password and Confirm Password do not match.');
      return;
    }

    if (!captchaAnswer.trim()) {
      setError('Please enter the visual CAPTCHA verification code.');
      return;
    }

    if (captchaAnswer.trim().toLowerCase() !== generatedCaptcha.trim().toLowerCase()) {
      setError('Security CAPTCHA verification failed. Please enter the characters shown.');
      return;
    }

    if (!declaredAffirmation) {
      setError('You must accept the official confidentiality declaration to proceed.');
      return;
    }

    try {
      setIsLoading(true);
      const payload = {
        employeeId: employeeId.trim(),
        name: `${titlePrefix} ${fullName.trim()}`,
        email: email.trim().toLowerCase(),
        phone: phone.trim().startsWith('+91') ? phone.trim() : `+91-${cleanPhone.slice(-10)}`,
        password,
        role,
        designation: designation.trim(),
        bureauId: bureauId || null,
        region,
        captchaAnswer: captchaAnswer.trim(),
        expectedCaptcha: generatedCaptcha,
      };

      const res = await api.post('/auth/register', payload);
      setCreatedUser(res.data.user);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed. Please check your details.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#060c17] via-[#0B192C] to-[#1E3E62] flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8 text-slate-100 relative">
      {/* Decorative Government National Tricolor Top Accent */}
      <div className="fixed top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-orange-500 via-white to-emerald-600 z-50 shadow-md" />

      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-2xl text-center space-y-2 mb-6">
        <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-slate-950 shadow-2xl border border-amber-400/40">
          <Shield className="w-9 h-9 text-white fill-white/20" />
        </div>
        <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white uppercase">
          AICTE Official User ID Provisioning
        </h2>
        <p className="text-xs text-amber-400 font-bold uppercase tracking-wider">
          अखिल भारतीय तकनीकी शिक्षा परिषद · नया अधिकारी पंजीकरण
        </p>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          Centralized Grievance Monitoring System (AUGMS) · Official Regulatory Portal
        </p>
      </div>

      {/* Main Registration Card */}
      <div className="sm:mx-auto sm:w-full sm:max-w-2xl">
        <div className="bg-white text-slate-900 py-8 px-6 sm:px-10 shadow-2xl rounded-3xl border border-slate-200">
          {/* Success Screen if Account Created */}
          {createdUser ? (
            <div className="text-center py-6 space-y-5 animate-in fade-in duration-300">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
                <BadgeCheck className="w-10 h-10" />
              </div>

              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-900">
                  Official Account Provisioned Successfully!
                </h3>
                <p className="text-xs text-slate-500">
                  Your official user profile has been created and indexed in the AICTE audit ledger.
                </p>
              </div>

              {/* Created Profile Details Box */}
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 text-left text-xs space-y-2.5 max-w-md mx-auto">
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500 font-medium">Assigned User ID:</span>
                  <span className="font-mono font-bold text-blue-700">{createdUser.employeeId}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500 font-medium">Official Name:</span>
                  <span className="font-bold text-slate-900">{createdUser.name}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500 font-medium">Registered Email:</span>
                  <span className="font-mono text-slate-800">{createdUser.email}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500 font-medium">Mobile Number (2FA):</span>
                  <span className="font-mono text-slate-800">{createdUser.phone}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500 font-medium">Designation & Role:</span>
                  <span className="font-semibold text-slate-800">{createdUser.designation} · {createdUser.role}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Jurisdiction / Bureau:</span>
                  <span className="font-semibold text-slate-800">{createdUser.bureau?.code || 'Central HQ'}</span>
                </div>
              </div>

              <div className="pt-3">
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="w-full sm:w-auto px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md transition-colors inline-flex items-center justify-center gap-2"
                >
                  <span>Proceed to Official Console Login</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
                  <span>{error}</span>
                </div>
              )}

              {/* Row 1: Employee ID with Auto-Generate helper */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-blue-600" />
                    <span>Official User ID / Employee Code *</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleAutoGenerateId}
                    className="text-[11px] text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    <span>Generate ID</span>
                  </button>
                </div>
                <input
                  type="text"
                  required
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value.toUpperCase())}
                  placeholder="e.g. AICTE/AB/2026/042"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold text-blue-900 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:border-blue-600 uppercase"
                />
              </div>

              {/* Row 2: Title Prefix & Full Name */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="sm:col-span-1">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Title</label>
                  <select
                    value={titlePrefix}
                    onChange={(e) => setTitlePrefix(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 font-semibold"
                  >
                    <option value="Dr.">Dr.</option>
                    <option value="Prof.">Prof.</option>
                    <option value="Shri">Shri</option>
                    <option value="Smt.">Smt.</option>
                    <option value="Er.">Er.</option>
                  </select>
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Official Full Name *
                  </label>
                  <div className="relative rounded-xl shadow-xs">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <User className="h-4 w-4" />
                    </div>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Rajesh Kumar Sharma"
                      className="block w-full pl-9 pr-3 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-slate-50/50 hover:bg-white focus:bg-white text-slate-900 font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Row 3: Official Email & Mobile Number */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Official Email Address *
                  </label>
                  <div className="relative rounded-xl shadow-xs">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Mail className="h-4 w-4" />
                    </div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="officer@aicte.gov.in"
                      className="block w-full pl-9 pr-3 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-slate-50/50 hover:bg-white focus:bg-white text-slate-900 font-medium"
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Used for official correspondence & 2FA</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Mobile Number (For 2FA SMS) *
                  </label>
                  <div className="relative rounded-xl shadow-xs">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Phone className="h-4 w-4" />
                    </div>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. 9876543210"
                      className="block w-full pl-9 pr-3 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-slate-50/50 hover:bg-white focus:bg-white text-slate-900 font-mono font-medium"
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 mt-0.5 block">10-digit mobile number</span>
                </div>
              </div>

              {/* Row 4: Designation & Role Permission */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Official Designation *
                  </label>
                  <div className="relative rounded-xl shadow-xs">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Briefcase className="h-4 w-4" />
                    </div>
                    <input
                      type="text"
                      required
                      value={designation}
                      onChange={(e) => setDesignation(e.target.value)}
                      placeholder="e.g. Deputy Director"
                      className="block w-full pl-9 pr-3 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-slate-50/50 hover:bg-white focus:bg-white text-slate-900 font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    RBAC Role Permission *
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 font-semibold"
                  >
                    <option value="BUREAU_OFFICER">Bureau Officer (Investigator)</option>
                    <option value="BUREAU_HEAD">Bureau Head (Adviser)</option>
                    <option value="SENIOR_OFFICIAL">Senior Official (Oversight)</option>
                    <option value="REGIONAL_OFFICER">Regional Officer (Inspection)</option>
                    <option value="SUPER_ADMIN">Super Admin (HQ Vigilance)</option>
                  </select>
                </div>
              </div>

              {/* Row 5: Bureau & Regional Office Jurisdiction */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Assigned AICTE Bureau
                  </label>
                  <select
                    value={bureauId}
                    onChange={(e) => setBureauId(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 font-semibold"
                  >
                    <option value="">-- Central Monitoring HQ (General) --</option>
                    {bureaus.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} ({b.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Regional Jurisdiction
                  </label>
                  <select
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 font-semibold"
                  >
                    <option value="Central HQ (New Delhi)">Central HQ (New Delhi)</option>
                    <option value="Northern Region">Northern Region (Kanpur/Chandigarh)</option>
                    <option value="Southern Region">Southern Region (Chennai)</option>
                    <option value="Western Region">Western Region (Mumbai)</option>
                    <option value="Eastern Region">Eastern Region (Kolkata)</option>
                    <option value="South-Western Region">South-Western (Bengaluru)</option>
                    <option value="Central Region">Central Region (Bhopal)</option>
                    <option value="North-Western Region">North-Western (Jaipur)</option>
                  </select>
                </div>
              </div>

              {/* Row 6: Password & Confirm Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Security Password *
                  </label>
                  <div className="relative rounded-xl shadow-xs">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Lock className="h-4 w-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min 6 characters"
                      className="block w-full pl-9 pr-9 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-slate-50/50 hover:bg-white focus:bg-white text-slate-900 font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Confirm Password *
                  </label>
                  <div className="relative rounded-xl shadow-xs">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Lock className="h-4 w-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat password"
                      className="block w-full pl-9 pr-3 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-slate-50/50 hover:bg-white focus:bg-white text-slate-900 font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Row 7: Security CAPTCHA Box */}
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/90 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-blue-600" />
                    <span>Security Verification CAPTCHA *</span>
                  </label>
                  <span className="text-[10px] text-slate-500 font-semibold">Case-Insensitive</span>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <CaptchaBox onCaptchaChange={(code) => setGeneratedCaptcha(code)} />
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={captchaAnswer}
                    onChange={(e) => setCaptchaAnswer(e.target.value.toUpperCase())}
                    placeholder="Enter 6 characters"
                    className="w-full flex-1 p-2.5 bg-white border border-slate-300 rounded-xl text-center font-mono font-bold tracking-widest text-sm text-slate-900 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 uppercase"
                  />
                </div>
              </div>

              {/* Row 8: Declaration Checkbox */}
              <div className="flex items-start gap-2.5 pt-1">
                <input
                  type="checkbox"
                  id="declaration"
                  checked={declaredAffirmation}
                  onChange={(e) => setDeclaredAffirmation(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                />
                <label htmlFor="declaration" className="text-[11px] text-slate-600 leading-snug">
                  I solemnly affirm that I am an authorized officer/official of AICTE or Ministry of Education. I understand that all case actions and logins are cryptographically logged for vigilance compliance.
                </label>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-md text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50"
                >
                  <span>{isLoading ? 'Provisioning Account...' : 'Create Official User ID & Register'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Back to Login Link */}
              <div className="text-center pt-2">
                <p className="text-xs text-slate-600">
                  Already have an authorized AICTE User ID?{' '}
                  <Link to="/login" className="text-blue-600 font-bold hover:underline">
                    Sign In to Console
                  </Link>
                </p>
              </div>
            </form>
          )}
        </div>

        {/* Prototype Disclaimer */}
        <div className="mt-5 text-center space-y-1">
          <p className="text-[11px] text-slate-400">
            Official Administrative Monitoring Console · All India Council for Technical Education (MoE, Govt. of India)
          </p>
          <p className="text-[10px] text-slate-500 font-mono">
            Security Compliance: 256-Bit SSL · NIC Provisioning Guidelines · Audit Logging Active
          </p>
        </div>
      </div>
    </div>
  );
};
