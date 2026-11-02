import React, { useState, useRef } from 'react';
import {
  User,
  Camera,
  Upload,
  Mail,
  Phone,
  Building,
  Shield,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Save,
  RotateCcw,
  Sparkles,
  Award,
  Calendar,
  Eye,
  EyeOff,
  Briefcase,
  MapPin,
  FileCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { BureauBadge } from '../components/common/BureauBadge';

// Curated official government executive avatars
const OFFICIAL_AVATARS = [
  {
    name: 'Executive Officer A',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
  },
  {
    name: 'Executive Officer B',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
  },
  {
    name: 'Senior Director',
    url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200',
  },
  {
    name: 'Monitoring Commissioner',
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200',
  },
  {
    name: 'Regional Officer',
    url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200',
  },
  {
    name: 'Vigilance Member',
    url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200',
  },
];

export const ProfilePage: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form states initialized with current user
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [designation, setDesignation] = useState(user?.designation || '');
  const [region, setRegion] = useState(user?.region || 'Central HQ (New Delhi)');
  const [avatar, setAvatar] = useState(user?.avatar || '');

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [showPass, setShowPass] = useState(false);

  // Feedback states
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Handle local image file upload & base64 conversion
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please select a valid image file (PNG, JPG, WebP).');
      return;
    }

    if (file.size > 3 * 1024 * 1024) {
      setErrorMessage('Image size exceeds 3MB limit. Please choose a smaller photo.');
      return;
    }

    setErrorMessage('');
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setAvatar(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSelectOfficialAvatar = (avatarUrl: string) => {
    setAvatar(avatarUrl);
    setErrorMessage('');
  };

  const handleRemovePhoto = () => {
    setAvatar('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');

    if (!name.trim()) {
      setErrorMessage('Full name is required.');
      return;
    }

    if (!email.trim()) {
      setErrorMessage('Email address is required.');
      return;
    }

    if (newPassword) {
      if (newPassword.length < 6) {
        setErrorMessage('New password must be at least 6 characters.');
        return;
      }
      if (newPassword !== confirmPassword) {
        setErrorMessage('New password and confirm password do not match.');
        return;
      }
      if (!currentPassword) {
        setErrorMessage('Please provide your current password to set a new password.');
        return;
      }
    }

    try {
      setSaving(true);
      await updateProfile({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        designation: designation.trim(),
        region: region.trim(),
        avatar: avatar || undefined,
        currentPassword: newPassword ? currentPassword : undefined,
        newPassword: newPassword ? newPassword : undefined,
      });

      setSuccessMessage('Profile and identity information updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowPasswordSection(false);
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err: any) {
      setErrorMessage(err.response?.data?.error || err.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Top Identity Header Card */}
      <div className="bg-gradient-to-r from-[#081220] via-[#0B192C] to-[#1E3E62] rounded-2xl p-6 text-white shadow-md relative overflow-hidden border border-slate-800">
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4">
            {/* Avatar Preview */}
            <div className="relative group">
              <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-white/40 bg-slate-800 shadow-xl flex items-center justify-center">
                {avatar ? (
                  <img src={avatar} alt={name} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-10 h-10 text-slate-300" />
                )}
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-2 -right-2 p-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white shadow-lg transition-transform hover:scale-110 border-2 border-[#0B192C]"
                title="Change Photo"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-amber-400 bg-amber-400/20 px-2.5 py-0.5 rounded-full border border-amber-400/30">
                  {user?.employeeId || 'AICTE/HQ/001'}
                </span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Authenticated Official</span>
                </span>
              </div>
              <h2 className="text-xl font-bold mt-1 tracking-tight text-white">{user?.name || name}</h2>
              <p className="text-xs text-slate-300 font-medium">
                {user?.designation || designation} · {user?.region || region}
              </p>
            </div>
          </div>

          <div className="flex sm:flex-col items-end justify-between sm:justify-center text-right">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Clearance Role
            </span>
            <span className="text-sm font-extrabold text-amber-400 uppercase font-mono mt-0.5">
              {user?.role.replace(/_/g, ' ') || 'SUPER ADMIN'}
            </span>
            <span className="text-[11px] text-slate-400 mt-1">
              {user?.bureau ? `${user.bureau.name} (${user.bureau.code})` : 'AICTE Central Headquarters'}
            </span>
          </div>
        </div>
      </div>

      {/* Status Banners */}
      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs text-emerald-900 font-bold shadow-sm animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage('')} className="text-emerald-700 hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-between text-xs text-rose-900 font-bold shadow-sm animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage('')} className="text-rose-700 hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Main Profile Editor Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Profile Photo Customizer */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Camera className="w-4 h-4 text-blue-600" />
                <span>Profile Photo & Avatar</span>
              </h3>
              <p className="text-xs text-slate-500">
                Upload your official photo or pick from council-certified portrait templates.
              </p>
            </div>
            {avatar && (
              <button
                type="button"
                onClick={handleRemovePhoto}
                className="text-xs text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1"
              >
                Remove Custom Photo
              </button>
            )}
          </div>

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={handleFileUpload}
            className="hidden"
          />

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2.5 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 font-bold text-xs flex items-center gap-2 transition-colors w-full sm:w-auto justify-center"
            >
              <Upload className="w-4 h-4" />
              <span>Upload New Photo from Device</span>
            </button>
            <span className="text-xs text-slate-400">Supports PNG, JPG, WebP (Max 3MB)</span>
          </div>

          {/* Preset Avatars Gallery */}
          <div>
            <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-2">
              Or Select Official Portrait:
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
              {OFFICIAL_AVATARS.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectOfficialAvatar(item.url)}
                  className={`p-1.5 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                    avatar === item.url
                      ? 'border-blue-600 ring-2 ring-blue-500/30 bg-blue-50/50'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <img
                    src={item.url}
                    alt={item.name}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                  <span className="text-[10px] text-slate-600 font-semibold truncate w-full text-center">
                    {item.name.replace('Executive ', '')}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Section 2: Official Personal & Contact Details */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <User className="w-4 h-4 text-blue-600" />
              <span>Official Personal & Contact Information</span>
            </h3>
            <p className="text-xs text-slate-500">
              Government credentials associated with your official administrative ID.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* Full Name */}
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1 uppercase tracking-wider">
                Full Official Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="e.g. Dr. Abhay Jere"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-xs text-slate-900"
              />
            </div>

            {/* Official Employee ID (Readonly badge) */}
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1 uppercase tracking-wider">
                Official Employee ID / User ID
              </label>
              <input
                type="text"
                value={user?.employeeId || 'AICTE/HQ/001'}
                disabled
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-mono font-bold text-xs text-blue-900 cursor-not-allowed"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">Assigned by AICTE Central IT Cell</span>
            </div>

            {/* Official Email */}
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1 uppercase tracking-wider">
                Official Email Address *
              </label>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="name@aicte.gov.in"
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-xs text-slate-900"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1 uppercase tracking-wider">
                Official Contact / Mobile Phone
              </label>
              <div className="relative">
                <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91-9876543210"
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-xs text-slate-900"
                />
              </div>
            </div>

            {/* Designation */}
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1 uppercase tracking-wider">
                Designation & Title
              </label>
              <div className="relative">
                <Briefcase className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  placeholder="e.g. Chief Vigilance & Monitoring Officer"
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-xs text-slate-900"
                />
              </div>
            </div>

            {/* Region / Zone */}
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1 uppercase tracking-wider">
                Regional Jurisdiction / Headquarter
              </label>
              <div className="relative">
                <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                <select
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 text-xs text-slate-900"
                >
                  <option value="Central HQ (New Delhi)">Central HQ (New Delhi)</option>
                  <option value="Northern Regional Office (Kanpur)">Northern Regional Office (Kanpur)</option>
                  <option value="North-Western Regional Office (Chandigarh)">North-Western Regional Office (Chandigarh)</option>
                  <option value="Western Regional Office (Mumbai)">Western Regional Office (Mumbai)</option>
                  <option value="Central Regional Office (Bhopal)">Central Regional Office (Bhopal)</option>
                  <option value="Southern Regional Office (Chennai)">Southern Regional Office (Chennai)</option>
                  <option value="South-Western Regional Office (Bengaluru)">South-Western Regional Office (Bengaluru)</option>
                  <option value="Eastern Regional Office (Kolkata)">Eastern Regional Office (Kolkata)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Statutory Role & Bureau Assignment (Read-only security clearance) */}
        <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Shield className="w-4 h-4 text-purple-600" />
              <span>Statutory Role & Access Privileges</span>
            </h3>
            <span className="text-[11px] font-bold text-purple-800 bg-purple-100 border border-purple-200 px-2.5 py-0.5 rounded-full">
              Level 1 Security Clearance
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
            <div className="p-3 bg-white rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">System Role</span>
              <strong className="text-slate-900 font-mono text-sm block mt-0.5">
                {user?.role.replace(/_/g, ' ') || 'SUPER ADMIN'}
              </strong>
            </div>

            <div className="p-3 bg-white rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Assigned Bureau</span>
              <div className="mt-1">
                {user?.bureau ? (
                  <BureauBadge code={user.bureau.code} name={user.bureau.name} showFullName />
                ) : (
                  <span className="font-semibold text-slate-800">Council All-Bureaus Oversight</span>
                )}
              </div>
            </div>

            <div className="p-3 bg-white rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">2FA Authentication</span>
              <span className="text-emerald-700 font-bold text-xs flex items-center gap-1 mt-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Enforced via SMS / OTP
              </span>
            </div>
          </div>
        </div>

        {/* Section 4: Security & Password Update (Collapsible) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Lock className="w-4 h-4 text-slate-700" />
                <span>Account Password & Security</span>
              </h3>
              <p className="text-xs text-slate-500">
                Update your login password or leave blank to keep existing password.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowPasswordSection(!showPasswordSection)}
              className="px-3 py-1.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-colors"
            >
              {showPasswordSection ? 'Cancel Password Change' : 'Change Password'}
            </button>
          </div>

          {showPasswordSection && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-100 text-xs animate-in fade-in">
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1 uppercase tracking-wider">
                  Current Password *
                </label>
                <input
                  type={showPass ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 text-xs"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1 uppercase tracking-wider">
                  New Password *
                </label>
                <input
                  type={showPass ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 text-xs"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1 uppercase tracking-wider">
                  Confirm New Password *
                </label>
                <input
                  type={showPass ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-type new password"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 text-xs"
                />
              </div>
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between pt-2">
          <div className="text-xs text-slate-500">
            Changes will update your official credentials across AICTE AUGMS.
          </div>
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving Changes...' : 'Save Profile Changes'}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
