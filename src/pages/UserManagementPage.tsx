import React, { useState, useEffect } from 'react';
import {
  Users,
  Shield,
  PlusCircle,
  CheckCircle,
  RefreshCw,
  Mail,
  Phone,
  Building,
  Key,
} from 'lucide-react';
import api from '../services/api';
import { Modal } from '../components/common/Modal';
import { BureauBadge } from '../components/common/BureauBadge';
import { User, Bureau } from '../types';

export const UserManagementPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [bureaus, setBureaus] = useState<Bureau[]>([]);
  const [loading, setLoading] = useState(true);

  // Add User Modal
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: 'aicte@123',
    role: 'BUREAU_OFFICER',
    designation: 'Assistant Director',
    bureauId: '',
    region: 'Central HQ (New Delhi)',
    phone: '',
  });
  const [addError, setAddError] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const [uRes, bRes] = await Promise.all([
        api.get('/users'),
        api.get('/bureaus'),
      ]);
      setUsers(uRes.data);
      setBureaus(bRes.data);
      if (bRes.data.length > 0) {
        setNewUser((prev) => ({ ...prev, bureauId: bRes.data[0].id }));
      }
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.name || !newUser.email || !newUser.designation) {
      setAddError('Name, email, and designation are mandatory.');
      return;
    }
    try {
      setIsAdding(true);
      setAddError('');
      await api.post('/users', newUser);
      setIsAddOpen(false);
      fetchUsers();
    } catch (err: any) {
      setAddError(err.response?.data?.error || 'Failed to register user');
    } finally {
      setIsAdding(false);
    }
  };

  const roleDescriptions = [
    { role: 'SUPER_ADMIN', name: 'Super Admin', scope: 'Full system access, user administration, system-wide configuration, and unrestricted grievance reallocation.' },
    { role: 'SENIOR_OFFICIAL', name: 'Senior Official (Advisor)', scope: 'High-level executive oversight, cross-bureau overlap adjudications, vigilance audits, and statutory reporting.' },
    { role: 'BUREAU_HEAD', name: 'Bureau Head', scope: 'Complete authority over Bureau cases, officer assignment, inter-bureau transfer authorization, and departmental hearings.' },
    { role: 'BUREAU_OFFICER', name: 'Bureau Officer', scope: 'Direct investigation of assigned grievances, spot verification notes, show-cause drafting, and document upload.' },
    { role: 'REGIONAL_OFFICER', name: 'Regional Officer', scope: 'Geographic jurisdiction over regional technical colleges, inspection reporting, and regional ombudsman coordination.' },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Access Control & Officials Directory</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Role-Based Access Control (RBAC) governing case allocation and cross-bureau jurisdiction.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsAddOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Authorized Official</span>
          </button>
          <button
            onClick={fetchUsers}
            className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
            title="Refresh Users"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Role-Based Permissions Matrix Explainer */}
      <div className="bg-slate-900 text-slate-300 p-5 rounded-2xl border border-slate-800 space-y-3 text-xs">
        <div className="flex items-center gap-2 text-amber-400 font-bold uppercase tracking-wider text-[11px]">
          <Shield className="w-4 h-4" />
          <span>RBAC Security Matrix & Functional Jurisdictions</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {roleDescriptions.map((r) => (
            <div key={r.role} className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
              <span className="font-bold text-white block mb-0.5">{r.name}</span>
              <p className="text-[11px] text-slate-400 leading-snug">{r.scope}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between text-xs">
          <span className="font-bold text-slate-900">Enrolled Officials ({users.length})</span>
          <span className="text-slate-400">Default Evaluation Password: aicte@123</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/75 border-b border-slate-200 text-slate-600 uppercase font-semibold">
              <tr>
                <th className="py-3 px-4">Official Name</th>
                <th className="py-3 px-4">Designation</th>
                <th className="py-3 px-4">Role Permission</th>
                <th className="py-3 px-4">Bureau / Jurisdiction</th>
                <th className="py-3 px-4">Email Address</th>
                <th className="py-3 px-4">Region</th>
                <th className="py-3 px-4 text-center">Security Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    Loading users directory...
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                          {u.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{u.name}</p>
                          <p className="text-[10px] text-slate-400">{u.phone || '+91-11-29581000'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">{u.designation}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-800 border border-slate-200">
                        {u.role.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {u.bureau ? (
                        <BureauBadge code={u.bureau.code} name={u.bureau.name} />
                      ) : (
                        <span className="text-slate-400 italic">Central HQ / Vigilance</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-600">{u.email}</td>
                    <td className="py-3.5 px-4 text-slate-600">{u.region || 'Central HQ'}</td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center gap-1 text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full text-[10px]">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        Active
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Enroll Official Account"
        subtitle="Provision AICTE officer account with designated RBAC authority"
        maxWidth="md"
      >
        <form onSubmit={handleAddUser} className="space-y-3 text-xs">
          {addError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800">
              {addError}
            </div>
          )}
          <div>
            <label className="block font-bold text-slate-700 mb-1">Full Name & Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Dr. Rajesh K. Sharma"
              value={newUser.name}
              onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
              className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">Official NIC/AICTE Email *</label>
            <input
              type="email"
              required
              placeholder="e.g. officer.sharma@aicte.gov.in"
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Assigned Role *</label>
              <select
                value={newUser.role}
                onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-semibold"
              >
                <option value="SUPER_ADMIN">Super Admin</option>
                <option value="SENIOR_OFFICIAL">Senior Official</option>
                <option value="BUREAU_HEAD">Bureau Head</option>
                <option value="BUREAU_OFFICER">Bureau Officer</option>
                <option value="REGIONAL_OFFICER">Regional Officer</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Designation *</label>
              <input
                type="text"
                required
                placeholder="e.g. Deputy Director"
                value={newUser.designation}
                onChange={(e) => setNewUser({ ...newUser, designation: e.target.value })}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
              />
            </div>
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">Assigned Bureau</label>
            <select
              value={newUser.bureauId}
              onChange={(e) => setNewUser({ ...newUser, bureauId: e.target.value })}
              className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
            >
              <option value="">-- Central Monitoring HQ (No specific bureau) --</option>
              {bureaus.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.code})
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsAddOpen(false)}
              className="px-4 py-2 border rounded-lg font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isAdding}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-sm"
            >
              {isAdding ? 'Provisioning...' : 'Provision Account'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

