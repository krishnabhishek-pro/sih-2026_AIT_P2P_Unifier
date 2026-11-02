import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Search,
  Bell,
  User as UserIcon,
  ChevronDown,
  Shield,
  CheckCircle2,
  AlertTriangle,
  Menu,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { NotificationItem } from '../../types';

interface HeaderProps {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({ collapsed, setCollapsed }) => {
  const { user, demoUsers, switchUser, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [notifMenuOpen, setNotifMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState('');

  const roleMenuRef = useRef<HTMLDivElement>(null);
  const notifMenuRef = useRef<HTMLDivElement>(null);

  // Close menus on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (roleMenuRef.current && !roleMenuRef.current.contains(event.target as Node)) {
        setRoleMenuOpen(false);
      }
      if (notifMenuRef.current && !notifMenuRef.current.contains(event.target as Node)) {
        setNotifMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch notifications
  useEffect(() => {
    async function loadNotifications() {
      try {
        const res = await api.get('/notifications');
        setNotifications(res.data);
        setUnreadCount(res.data.filter((n: any) => !n.isRead).length);
      } catch (err) {
        // fallback
      }
    }
    loadNotifications();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/complaints?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // Derive current page title & breadcrumbs
  const path = location.pathname;
  let pageTitle = 'Dashboard';
  let breadcrumb = 'Centralized Grievance Overview';

  if (path === '/') {
    pageTitle = 'Dashboard';
    breadcrumb = 'Centralized Grievance Overview & Key Indicators';
  } else if (path.startsWith('/institutions')) {
    pageTitle = 'Institutions Directory';
    breadcrumb = 'Institutions / 360° Profile & Compliance Record';
  } else if (path.startsWith('/complaints')) {
    pageTitle = 'All Grievances & Cases';
    breadcrumb = 'Complaints / Bureau Allocation & Action Tracking';
  } else if (path.startsWith('/overlaps')) {
    pageTitle = 'Cross-Bureau Overlap Detection Center';
    breadcrumb = 'Overlap Detection / Multi-Bureau Collision Scrutiny';
  } else if (path.startsWith('/bureaus')) {
    pageTitle = 'Bureau Management';
    breadcrumb = 'Bureaus / Organizational Units & Caseload';
  } else if (path.startsWith('/analytics')) {
    pageTitle = 'Analytics & Reports';
    breadcrumb = 'Analytics / Trends, Hotspots & Statutory Reporting';
  } else if (path.startsWith('/notifications')) {
    pageTitle = 'System Notifications';
    breadcrumb = 'Notifications / Real-Time Alerts & Action Requests';
  } else if (path.startsWith('/users')) {
    pageTitle = 'User Management';
    breadcrumb = 'Access Control / Authorized Officials & Roles';
  } else if (path.startsWith('/audit-logs')) {
    pageTitle = 'Audit Logs';
    breadcrumb = 'Security / Tamper-Evident Institutional Activity Log';
  } else if (path.startsWith('/settings')) {
    pageTitle = 'System Settings';
    breadcrumb = 'Administration / Overlap Parameters & Rule Weights';
  }

  return (
    <header className="sticky top-0 z-20 bg-white border-b border-slate-200">
      {/* Official Government of India Top Banner */}
      <div className="bg-[#081220] text-slate-300 text-[11px] px-6 py-1 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-amber-400">अखिल भारतीय तकनीकी शिक्षा परिषद</span>
          <span className="text-slate-500">|</span>
          <span className="text-slate-300 font-medium">All India Council for Technical Education (MoE, Govt. of India)</span>
        </div>
        <div className="flex items-center gap-4 text-slate-400">
          <span className="flex items-center gap-1 text-emerald-400 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            AUGMS Central Node Online
          </span>
          <span className="hidden md:inline text-slate-500">|</span>
          <span className="hidden md:inline font-mono text-[10px] text-slate-400">Confidential · Official Use Only</span>
        </div>
      </div>

      {/* Main Action Header */}
      <div className="h-16 px-6 flex items-center justify-between gap-4">
        {/* Left: Mobile collapse toggle & Page Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
            title="Toggle Sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-slate-900 leading-tight">{pageTitle}</h1>
            <p className="text-xs text-slate-500 hidden sm:block">{breadcrumb}</p>
          </div>
        </div>

        {/* Center: Global Search Bar */}
        <form onSubmit={handleSearchSubmit} className="hidden lg:flex items-center flex-1 max-w-md mx-4">
          <div className="relative w-full">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search complaint ID (e.g. 0001), institution, or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-xs text-slate-900 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all placeholder:text-slate-400"
            />
          </div>
        </form>

        {/* Right Action Controls: Role Switcher, Notifications, User Profile */}
        <div className="flex items-center gap-3">
          {/* Demo User / Role Switcher (For Evaluation & SIH 2026 Demonstration) */}
          <div className="relative" ref={roleMenuRef}>
            <button
              onClick={() => setRoleMenuOpen(!roleMenuOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200/80 text-amber-900 hover:bg-amber-100/80 transition-colors text-xs font-medium"
              title="Switch role for demonstration"
            >
              <Shield className="w-3.5 h-3.5 text-amber-700" />
              <span className="hidden sm:inline text-amber-700 font-semibold">Demo Role:</span>
              <span className="font-bold text-amber-900">
                {user ? user.role.replace(/_/g, ' ') : 'Select'}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-amber-700" />
            </button>

            {roleMenuOpen && (
              <div className="absolute right-0 mt-2 w-72 rounded-xl bg-white shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="px-3 py-1.5 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-800">Quick Role Switcher</p>
                  <p className="text-[11px] text-slate-500">Test the prototype with different permission levels</p>
                </div>
                <div className="max-h-60 overflow-y-auto py-1">
                  {demoUsers.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => {
                        switchUser(u);
                        setRoleMenuOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs hover:bg-slate-50 flex items-center justify-between ${
                        user?.id === u.id ? 'bg-blue-50/70 font-semibold text-blue-900' : 'text-slate-700'
                      }`}
                    >
                      <div className="truncate mr-2">
                        <p className="font-semibold text-slate-900 truncate">{u.name}</p>
                        <p className="text-[10px] text-slate-500 truncate">
                          {u.role.replace(/_/g, ' ')} · {u.bureau ? u.bureau.code : u.region || 'HQ'}
                        </p>
                      </div>
                      {user?.id === u.id && <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Notifications Bell */}
          <div className="relative" ref={notifMenuRef}>
            <button
              onClick={() => setNotifMenuOpen(!notifMenuOpen)}
              className="relative p-2 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-rose-500 border-2 border-white animate-pulse" />
              )}
            </button>

            {notifMenuOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl bg-white shadow-xl border border-slate-200 py-2 z-50">
                <div className="flex items-center justify-between px-4 py-2 border-b border-slate-100">
                  <span className="text-xs font-bold text-slate-900">Notifications ({notifications.length})</span>
                  <button
                    onClick={() => navigate('/notifications')}
                    className="text-[11px] text-blue-600 hover:underline font-medium"
                  >
                    View All
                  </button>
                </div>
                <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                  {notifications.slice(0, 4).map((n) => (
                    <div
                      key={n.id}
                      onClick={() => {
                        navigate(n.linkUrl || '/notifications');
                        setNotifMenuOpen(false);
                      }}
                      className="px-4 py-2.5 hover:bg-slate-50 cursor-pointer transition-colors"
                    >
                      <p className="text-xs font-semibold text-slate-900 line-clamp-1">{n.title}</p>
                      <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">{n.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Avatar */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
            <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-200 bg-slate-100 flex items-center justify-center">
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <UserIcon className="w-4 h-4 text-slate-600" />
              )}
            </div>
            <div className="hidden xl:block text-left leading-tight">
              <p className="text-xs font-bold text-slate-900">{user?.name || 'AICTE Officer'}</p>
              <p className="text-[10px] text-slate-500">{user?.designation || 'Monitoring Official'}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

