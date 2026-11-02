import React, { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon,
  Save,
  RotateCcw,
  Sliders,
  CheckCircle,
  AlertTriangle,
  Database,
  Bell,
  Clock,
  Shield,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState({
    overlapThreshold: 60,
    temporalProximityDays: 90,
    slaDays: 30,
    autoScanOnRegistration: true,
    emailAlertsEnabled: true,
    crossBureauCommitteeThreshold: 85,
    escalationOfficer: 'Senior Monitoring Advisor',
  });
  const [loading, setLoading] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [resetMessage, setResetMessage] = useState('');
  const [isResetting, setIsResetting] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      try {
        setLoading(true);
        const res = await api.get('/settings');
        setSettings(res.data);
      } catch (err) {
        console.error('Failed to load settings:', err);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/settings', settings);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to save settings:', err);
    }
  };

  const handleResetDemoData = async () => {
    if (!window.confirm('Reset all demo complaints, overlaps, institutions and audit logs to pristine default state?')) {
      return;
    }
    try {
      setIsResetting(true);
      setResetMessage('');
      const res = await api.post('/settings/reset-demo-data');
      setResetMessage(res.data.message || 'Demo data successfully reset!');
      setTimeout(() => setResetMessage(''), 4000);
    } catch (err: any) {
      setResetMessage('Failed to reset demo data.');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">System Settings & Algorithm Tuning</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure cross-bureau overlap detection rule weights, statutory SLA escalation days, and notification triggers.
          </p>
        </div>

        {saveSuccess && (
          <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>Parameters Saved</span>
          </span>
        )}
      </div>

      {resetMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-900 font-bold flex items-center justify-between">
          <span>{resetMessage}</span>
          <button onClick={() => setResetMessage('')} className="text-emerald-700 font-bold">✕</button>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Overlap Detection Engine Calibration */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm border-b border-slate-100 pb-3">
            <Sliders className="w-4 h-4 text-amber-600" />
            <span>Rule-Based Cross-Bureau Overlap Engine Parameters</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="font-bold text-slate-700">Minimum Overlap Trigger Threshold</label>
                <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                  {settings.overlapThreshold}%
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mb-2">
                Minimum calculated match score required before flagging grievance to Bureau Heads.
              </p>
              <input
                type="range"
                min="40"
                max="90"
                step="5"
                value={settings.overlapThreshold}
                onChange={(e) => setSettings({ ...settings, overlapThreshold: parseInt(e.target.value) })}
                className="w-full accent-blue-600"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="font-bold text-slate-700">Temporal Proximity Window</label>
                <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                  {settings.temporalProximityDays} Days
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mb-2">
                Complaints received within this window against same institution are evaluated for concurrent handling.
              </p>
              <input
                type="range"
                min="30"
                max="180"
                step="15"
                value={settings.temporalProximityDays}
                onChange={(e) => setSettings({ ...settings, temporalProximityDays: parseInt(e.target.value) })}
                className="w-full accent-blue-600"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center gap-3">
            <input
              type="checkbox"
              id="autoScan"
              checked={settings.autoScanOnRegistration}
              onChange={(e) => setSettings({ ...settings, autoScanOnRegistration: e.target.checked })}
              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="autoScan" className="text-xs text-slate-700 font-medium">
              Automatically trigger cross-bureau overlap analysis upon registration of every new grievance
            </label>
          </div>
        </div>

        {/* Section 2: Statutory SLA & Escalation Settings */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm border-b border-slate-100 pb-3">
            <Clock className="w-4 h-4 text-blue-600" />
            <span>AICTE Statutory Redressal SLA Timelines</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Standard Resolution Target SLA (Days)</label>
              <input
                type="number"
                value={settings.slaDays}
                onChange={(e) => setSettings({ ...settings, slaDays: parseInt(e.target.value) || 30 })}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-bold"
              />
              <p className="text-[11px] text-slate-500 mt-1">Cases exceeding this SLA are marked OVERDUE and escalated.</p>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Designated Escalation Authority</label>
              <input
                type="text"
                value={settings.escalationOfficer}
                onChange={(e) => setSettings({ ...settings, escalationOfficer: e.target.value })}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-semibold"
              />
              <p className="text-[11px] text-slate-500 mt-1">Designation receiving automated breach alerts.</p>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>Save Configuration Changes</span>
          </button>
        </div>
      </form>

      {/* Section 3: Demo Data Reset Option (Safe Evaluation Reset) */}
      <div className="bg-amber-50/70 p-6 rounded-2xl border border-amber-200 shadow-sm space-y-3">
        <div className="flex items-center gap-2 text-amber-950 font-bold text-sm">
          <Database className="w-4 h-4 text-amber-700" />
          <span>Evaluation Prototype Demo Data Reset</span>
        </div>
        <p className="text-xs text-amber-800 leading-relaxed">
          Restore the initial dataset (4 Bureaus, 20 Institutions, 10 Users, 50 Complaints, and 4 Pre-Configured Cross-Bureau Overlaps) to showcase the prototype from scratch to evaluators.
        </p>
        <button
          onClick={handleResetDemoData}
          disabled={isResetting}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-sm transition-colors disabled:opacity-50"
        >
          <RotateCcw className={`w-4 h-4 ${isResetting ? 'animate-spin' : ''}`} />
          <span>{isResetting ? 'Resetting Demo Database...' : 'Reset Demo Data to Factory State'}</span>
        </button>
      </div>
    </div>
  );
};

