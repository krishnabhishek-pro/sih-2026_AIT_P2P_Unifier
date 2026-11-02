import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Shield,
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Smartphone,
  RotateCcw,
  Eye,
  EyeOff,
  Building,
  KeyRound,
  ArrowLeft,
  BellRing,
  HelpCircle,
  Sparkles,
} from 'lucide-react';
import { useAuth, VerifyStep1Response } from '../context/AuthContext';
import { CaptchaBox } from '../components/auth/CaptchaBox';

export const LoginPage: React.FC = () => {
  const { verifyCredentialsAndSendOtp, verifyOtpAndLogin, resendOtp, demoUsers } = useAuth();
  const navigate = useNavigate();

  // Workflow State: 'CREDENTIALS' | 'OTP'
  const [currentStep, setCurrentStep] = useState<'CREDENTIALS' | 'OTP'>('CREDENTIALS');

  // Step 1 Form States
  const [loginId, setLoginId] = useState('admin@aicte.gov.in');
  const [password, setPassword] = useState('aicte@123');
  const [showPassword, setShowPassword] = useState(false);
  const [captchaAnswer, setCaptchaAnswer] = useState('');
  const [generatedCaptcha, setGeneratedCaptcha] = useState('');
  const [deliveryChannel, setDeliveryChannel] = useState<'SMS' | 'EMAIL'>('SMS');

  // Step 2 OTP States
  const [step1Data, setStep1Data] = useState<VerifyStep1Response | null>(null);
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [simulatedNotification, setSimulatedNotification] = useState<{
    show: boolean;
    otp: string;
    target: string;
  } | null>(null);

  // Countdown timer for Resend OTP (60s)
  const [timerSeconds, setTimerSeconds] = useState<number>(60);
  const [canResend, setCanResend] = useState<boolean>(false);

  // Status and feedback
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successInfo, setSuccessInfo] = useState('');

  const otpInputsRef = useRef<(HTMLInputElement | null)[]>([]);

  // Timer countdown
  useEffect(() => {
    let interval: any;
    if (currentStep === 'OTP' && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [currentStep, timerSeconds]);

  // STEP 1 Submission: Verify Login ID + Password + CAPTCHA
  const handleStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginId.trim() || !password.trim()) {
      setError('Please provide your official AICTE Login ID and Password.');
      return;
    }

    if (!captchaAnswer.trim()) {
      setError('Please enter the visual CAPTCHA verification code.');
      return;
    }

    if (captchaAnswer.trim().toLowerCase() !== generatedCaptcha.trim().toLowerCase()) {
      setError('Incorrect CAPTCHA code. Please check characters and try again.');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      const response = await verifyCredentialsAndSendOtp({
        loginId: loginId.trim(),
        password: password.trim(),
        captchaAnswer: captchaAnswer.trim(),
        expectedCaptcha: generatedCaptcha,
        deliveryChannel,
      });

      setStep1Data(response);
      setCurrentStep('OTP');
      setTimerSeconds(60);
      setCanResend(false);
      setOtpDigits(['', '', '', '', '', '']);

      // Display realistic simulated SMS/Email notification banner for SIH demo
      setSimulatedNotification({
        show: true,
        otp: response.demoOtp,
        target: response.maskedTarget,
      });

      setSuccessInfo(response.message);

      // Focus first OTP box
      setTimeout(() => {
        otpInputsRef.current[0]?.focus();
      }, 200);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Verification failed. Please check credentials and CAPTCHA.');
    } finally {
      setIsLoading(false);
    }
  };

  // STEP 2 Submission: Verify OTP & Complete Login
  const handleOtpSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const fullOtp = otpDigits.join('');

    if (fullOtp.length !== 6) {
      setError('Please enter all 6 digits of the OTP.');
      return;
    }

    if (!step1Data?.tempToken) {
      setError('Session expired. Please start login process again.');
      setCurrentStep('CREDENTIALS');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      await verifyOtpAndLogin({
        tempToken: step1Data.tempToken,
        otp: fullOtp,
      });
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Invalid OTP. Please check the code.');
    } finally {
      setIsLoading(false);
    }
  };

  // OTP segmented inputs handling
  const handleOtpChange = (index: number, value: string) => {
    const digit = value.replace(/[^0-9]/g, '').slice(-1);
    const newDigits = [...otpDigits];
    newDigits[index] = digit;
    setOtpDigits(newDigits);

    // Auto-advance to next input
    if (digit && index < 5) {
      otpInputsRef.current[index + 1]?.focus();
    }

    // Auto-submit when all 6 digits are typed
    if (digit && index === 5 && newDigits.every((d) => d !== '')) {
      setTimeout(() => {
        const fullOtp = newDigits.join('');
        verifyOtpAndLogin({
          tempToken: step1Data!.tempToken,
          otp: fullOtp,
        })
          .then(() => navigate('/'))
          .catch((err) => setError(err.response?.data?.error || 'Invalid OTP code.'));
      }, 150);
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, 6);
    if (pastedData) {
      const newDigits = [...otpDigits];
      for (let i = 0; i < pastedData.length; i++) {
        newDigits[i] = pastedData[i];
      }
      setOtpDigits(newDigits);
      const nextFocus = Math.min(pastedData.length, 5);
      otpInputsRef.current[nextFocus]?.focus();
    }
  };

  // Quick 1-Click Autofill for OTP during presentation
  const handleAutoFillOtp = () => {
    if (simulatedNotification?.otp) {
      const digits = simulatedNotification.otp.split('');
      setOtpDigits(digits);
      setError('');
    }
  };

  // Resend OTP
  const handleResend = async () => {
    if (!step1Data?.tempToken) return;
    try {
      setIsLoading(true);
      setError('');
      const res = await resendOtp({
        tempToken: step1Data.tempToken,
        deliveryChannel,
      });

      setSimulatedNotification({
        show: true,
        otp: res.demoOtp,
        target: res.maskedTarget,
      });

      setTimerSeconds(60);
      setCanResend(false);
      setOtpDigits(['', '', '', '', '', '']);
      setSuccessInfo(`Fresh OTP generated and sent to ${res.maskedTarget}.`);
      otpInputsRef.current[0]?.focus();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to resend OTP.');
    } finally {
      setIsLoading(false);
    }
  };

  // Quick 1-Click Demo Profiles for Evaluators
  const handleQuickSelect = (uEmail: string, channel: 'SMS' | 'EMAIL' = 'SMS') => {
    setLoginId(uEmail);
    setPassword('aicte@123');
    setDeliveryChannel(channel);
    // Autofill captcha answer with current generated captcha to save typing time for judge
    setCaptchaAnswer(generatedCaptcha);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#060c17] via-[#0B192C] to-[#1E3E62] flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8 text-slate-100 relative overflow-x-hidden">
      {/* Decorative Government National Tricolor Top Accent */}
      <div className="fixed top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-orange-500 via-white to-emerald-600 z-50 shadow-md" />

      {/* Simulated Live Government Mobile / Email Notification Banner for seamless demo evaluation */}
      {simulatedNotification && (
        <div className="fixed top-6 right-4 sm:right-8 z-50 max-w-md w-full animate-in slide-in-from-top-4 duration-300">
          <div className="bg-slate-900/95 backdrop-blur-md text-white p-4 rounded-2xl border-2 border-amber-400 shadow-2xl space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
                  <BellRing className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                    Govt SMS / NIC Notification Gateway
                  </span>
                  <p className="text-[10px] text-slate-400 font-mono">Sent to {simulatedNotification.target}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSimulatedNotification(null)}
                className="text-slate-400 hover:text-white text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-200 leading-snug bg-slate-950/70 p-2.5 rounded-xl border border-slate-800 font-mono">
              [AICTE-GOV] Your AUGMS Verification Code is:{' '}
              <span className="text-amber-300 font-black text-sm tracking-widest">{simulatedNotification.otp}</span>
              . Valid for 10 minutes. Do not disclose to anyone.
            </p>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[10px] text-slate-400 italic">SIH 2026 Evaluation Assist</span>
              <button
                type="button"
                onClick={handleAutoFillOtp}
                className="px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center gap-1 shadow-xs transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Auto-Fill Code ({simulatedNotification.otp})</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Official Government Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-2 mb-4">
        <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-slate-950 shadow-2xl border border-amber-400/40">
          <Shield className="w-9 h-9 text-white fill-white/20" />
        </div>
        <h2 className="text-xl font-extrabold tracking-tight text-white uppercase">
          AICTE Unified Grievance Monitoring System
        </h2>
        <p className="text-xs text-amber-400 font-bold uppercase tracking-wider">
          अखिल भारतीय तकनीकी शिक्षा परिषद (AUGMS)
        </p>
        <p className="text-xs text-slate-400 max-w-sm mx-auto">
          Ministry of Education · Government of India · Central Administrative Login
        </p>
      </div>

      {/* Main Multi-Step Authentication Card */}
      <div className="sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="bg-white text-slate-900 py-7 px-6 sm:px-10 shadow-2xl rounded-3xl border border-slate-200 relative overflow-hidden">
          {/* Step Progress Bar */}
          <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-100 text-xs font-bold">
            <div className="flex items-center gap-2">
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${
                  currentStep === 'CREDENTIALS'
                    ? 'bg-blue-600 text-white'
                    : 'bg-emerald-500 text-white'
                }`}
              >
                {currentStep === 'OTP' ? '✓' : '1'}
              </span>
              <span className={currentStep === 'CREDENTIALS' ? 'text-blue-900' : 'text-slate-500'}>
                Credentials & CAPTCHA
              </span>
            </div>

            <div className="w-8 h-0.5 bg-slate-200" />

            <div className="flex items-center gap-2">
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${
                  currentStep === 'OTP'
                    ? 'bg-blue-600 text-white animate-pulse'
                    : 'bg-slate-200 text-slate-500'
                }`}
              >
                2
              </span>
              <span className={currentStep === 'OTP' ? 'text-blue-900' : 'text-slate-400'}>
                2FA OTP Verification
              </span>
            </div>
          </div>

          {/* Feedback Banners */}
          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {successInfo && currentStep === 'OTP' && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
              <span>{successInfo}</span>
            </div>
          )}

          {/* STEP 1: Login ID + Password + CAPTCHA + Channel Selection */}
          {currentStep === 'CREDENTIALS' && (
            <form onSubmit={handleStep1Submit} className="space-y-4">
              {/* Login ID Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Official Login ID / Registered Email Address *
                </label>
                <div className="relative rounded-xl shadow-xs">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={loginId}
                    onChange={(e) => setLoginId(e.target.value)}
                    placeholder="e.g. admin@aicte.gov.in"
                    className="block w-full pl-10 pr-3 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-slate-50/50 hover:bg-white focus:bg-white transition-all text-slate-900 font-medium"
                  />
                </div>
              </div>

              {/* Password Input with Visibility Toggle */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Security Password *
                </label>
                <div className="relative rounded-xl shadow-xs">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter security password"
                    className="block w-full pl-10 pr-10 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-slate-50/50 hover:bg-white focus:bg-white transition-all text-slate-900 font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Security CAPTCHA Section */}
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/90 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-blue-600" />
                    <span>Security Verification CAPTCHA *</span>
                  </label>
                  <span className="text-[10px] text-slate-500 font-semibold">Case-Insensitive</span>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3">
                  {/* CAPTCHA Visual Canvas */}
                  <CaptchaBox onCaptchaChange={(code) => setGeneratedCaptcha(code)} />

                  {/* CAPTCHA Input */}
                  <div className="w-full flex-1">
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={captchaAnswer}
                      onChange={(e) => setCaptchaAnswer(e.target.value.toUpperCase())}
                      placeholder="Enter 6 characters"
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-center font-mono font-bold tracking-widest text-sm text-slate-900 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 uppercase"
                    />
                  </div>
                </div>
              </div>

              {/* 2FA Delivery Channel Selection (Mobile SMS or Official Email) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Receive Two-Factor Authentication (OTP) via:
                </label>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <label
                    className={`p-2.5 rounded-xl border cursor-pointer flex items-center gap-2 transition-all ${
                      deliveryChannel === 'SMS'
                        ? 'bg-blue-50 border-blue-600 text-blue-900 font-bold shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <input
                      type="radio"
                      name="deliveryChannel"
                      value="SMS"
                      checked={deliveryChannel === 'SMS'}
                      onChange={() => setDeliveryChannel('SMS')}
                      className="sr-only"
                    />
                    <Smartphone className="w-4 h-4 text-blue-600" />
                    <span>Mobile SMS</span>
                  </label>

                  <label
                    className={`p-2.5 rounded-xl border cursor-pointer flex items-center gap-2 transition-all ${
                      deliveryChannel === 'EMAIL'
                        ? 'bg-blue-50 border-blue-600 text-blue-900 font-bold shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <input
                      type="radio"
                      name="deliveryChannel"
                      value="EMAIL"
                      checked={deliveryChannel === 'EMAIL'}
                      onChange={() => setDeliveryChannel('EMAIL')}
                      className="sr-only"
                    />
                    <Mail className="w-4 h-4 text-purple-600" />
                    <span>Official Email</span>
                  </label>
                </div>
              </div>

              {/* Submit Step 1 */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-md text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50"
              >
                <span>{isLoading ? 'Verifying & Generating OTP...' : 'Verify Credentials & Request OTP'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Link to New User ID Creation / Provisioning */}
              <div className="text-center pt-2 border-t border-slate-100">
                <p className="text-xs text-slate-600">
                  New Official?{' '}
                  <Link to="/register" className="text-blue-600 font-bold hover:underline">
                    Create User ID / Register Official Account →
                  </Link>
                </p>
              </div>
            </form>
          )}

          {/* STEP 2: 2FA OTP Input & Verification */}
          {currentStep === 'OTP' && step1Data && (
            <form onSubmit={handleOtpSubmit} className="space-y-5">
              {/* Official Profile Badge */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Target Official</span>
                  <p className="font-bold text-slate-900">{step1Data.userPreview.name}</p>
                  <p className="text-[11px] text-slate-500">{step1Data.userPreview.designation} · {step1Data.userPreview.role}</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setCurrentStep('CREDENTIALS');
                    setError('');
                  }}
                  className="text-xs text-blue-600 hover:underline flex items-center gap-1 font-semibold"
                >
                  <ArrowLeft className="w-3 h-3" />
                  <span>Change</span>
                </button>
              </div>

              {/* Delivery Destination Notice */}
              <div className="text-center space-y-1">
                <p className="text-xs font-bold text-slate-800">
                  Enter 6-Digit One Time Password (OTP)
                </p>
                <p className="text-xs text-slate-500">
                  Dispatched to {step1Data.deliveryChannel === 'EMAIL' ? 'registered email' : 'mobile'}:{' '}
                  <strong className="text-slate-800 font-mono">{step1Data.maskedTarget}</strong>
                </p>
              </div>

              {/* 6 Segmented OTP Boxes */}
              <div className="flex justify-center gap-2 sm:gap-3 my-4">
                {otpDigits.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (otpInputsRef.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    onPaste={handleOtpPaste}
                    className="w-11 h-12 sm:w-12 sm:h-14 text-center text-xl font-bold font-mono rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-600 focus:outline-none transition-all text-slate-900 shadow-inner"
                  />
                ))}
              </div>

              {/* Resend & Timer Row */}
              <div className="flex items-center justify-between text-xs text-slate-500 px-1">
                {canResend ? (
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={isLoading}
                    className="text-blue-600 hover:underline font-bold flex items-center gap-1"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Resend OTP Code</span>
                  </button>
                ) : (
                  <span className="font-mono text-slate-500">
                    Resend code in: <strong className="text-slate-800">00:{timerSeconds.toString().padStart(2, '0')}</strong>
                  </span>
                )}

                <button
                  type="button"
                  onClick={handleAutoFillOtp}
                  className="text-amber-700 hover:text-amber-800 font-bold hover:underline flex items-center gap-1"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>Demo Auto-Fill</span>
                </button>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <button
                  type="submit"
                  disabled={isLoading || otpDigits.some((d) => d === '')}
                  className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-md text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50"
                >
                  <span>{isLoading ? 'Authenticating Session...' : 'Verify OTP & Secure Sign In'}</span>
                  <CheckCircle2 className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => setCurrentStep('CREDENTIALS')}
                  className="w-full py-2 text-xs font-semibold text-slate-500 hover:text-slate-700 transition-colors"
                >
                  Back to Login Credentials
                </button>
              </div>
            </form>
          )}

          {/* Quick 1-Click Demo Profiles for Evaluators & SIH 2026 Demonstrations */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-500" />
                <span>1-Click Demo Persona Profiles (For Evaluators)</span>
              </span>
              <span className="text-[10px] text-slate-400">SIH 2026 Test Roster</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
              {[
                { name: 'Dr. Abhay Jere', role: 'Super Admin', email: 'admin@aicte.gov.in', channel: 'SMS' as const },
                { name: 'Prof. T. G. Sitharam', role: 'Senior Official', email: 'senior.official@aicte.gov.in', channel: 'EMAIL' as const },
                { name: 'Dr. Ramesh C. Verma', role: 'Bureau Head (Approval)', email: 'head.approval@aicte.gov.in', channel: 'SMS' as const },
                { name: 'Dr. Anand Kulkarni', role: 'Bureau Head (Grievance)', email: 'head.grievance@aicte.gov.in', channel: 'EMAIL' as const },
                { name: 'Dr. Manoj Sharma', role: 'Bureau Officer', email: 'officer.sharma@aicte.gov.in', channel: 'SMS' as const },
                { name: 'Shri Arvind Swaminathan', role: 'Regional Officer', email: 'regional.south@aicte.gov.in', channel: 'SMS' as const },
              ].map((d) => (
                <button
                  key={d.email}
                  type="button"
                  onClick={() => handleQuickSelect(d.email, d.channel)}
                  className={`text-left p-2 rounded-xl text-xs flex items-center justify-between transition-colors border ${
                    loginId === d.email
                      ? 'bg-blue-50/80 border-blue-300 text-blue-900 font-bold'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="truncate mr-1.5">
                    <span className="font-bold text-slate-900 block truncate">{d.name}</span>
                    <span className="text-[10px] text-slate-500 truncate">{d.role}</span>
                  </div>
                  <span className="text-[10px] font-mono text-blue-600 bg-white px-2 py-0.5 rounded border border-slate-200 flex-shrink-0">
                    Use
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Prototype Disclaimer */}
        <div className="mt-5 text-center space-y-1">
          <p className="text-[11px] text-slate-400">
            Official Administrative Monitoring Console · All India Council for Technical Education (MoE, Govt. of India)
          </p>
          <p className="text-[10px] text-slate-500 font-mono">
            Security Compliance: 256-Bit SSL · NIC 2FA Guidelines · Audit Logging Active
          </p>
        </div>
      </div>
    </div>
  );
};
