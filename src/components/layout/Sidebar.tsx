import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  FileText,
  GitCompareArrows,
  Briefcase,
  BarChart3,
  Bell,
  Users,
  ShieldAlert,
  Settings,
  LogOut,
  ChevronRight,
  Shield,
  Layers,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, setCollapsed }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [potentialOverlapsCount, setPotentialOverlapsCount] = useState<number>(2);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState<number>(3);

  useEffect(() => {
    async function loadCounters() {
      try {
        const statsRes = await api.get('/dashboard/stats');
        if (statsRes.data?.metrics?.potentialOverlaps !== undefined) {
          setPotentialOverlapsCount(statsRes.data.metrics.potentialOverlaps);
        }
        const notifRes = await api.get('/notifications');
        const unread = notifRes.data.filter((n: any) => !n.isRead).length;
        setUnreadNotificationsCount(unread);
      } catch (err) {
        // use default state
      }
    }
    loadCounters();
    const interval = setInterval(loadCounters, 20000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Institutions', path: '/institutions', icon: Building2 },
    { name: 'All Complaints', path: '/complaints', icon: FileText },
    {
      name: 'Overlap Detection',
      path: '/overlaps',
      icon: GitCompareArrows,
      badge: potentialOverlapsCount > 0 ? potentialOverlapsCount : null,
      badgeColor: 'bg-amber-500 text-white',
    },
    { name: 'Bureau Management', path: '/bureaus', icon: Briefcase },
    { name: 'Analytics & Reports', path: '/analytics', icon: BarChart3 },
    {
      name: 'Notifications',
      path: '/notifications',
      icon: Bell,
      badge: unreadNotificationsCount > 0 ? unreadNotificationsCount : null,
      badgeColor: 'bg-blue-600 text-white',
    },
    { name: 'User Management', path: '/users', icon: Users, roleRestricted: ['SUPER_ADMIN', 'SENIOR_OFFICIAL'] },
    { name: 'Audit Logs', path: '/audit-logs', icon: ShieldAlert },
    { name: 'Settings', path: '/settings', icon: Settings, roleRestricted: ['SUPER_ADMIN'] },
  ];

  return (
    <aside
      className={`fixed top-0 bottom-0 left-0 z-30 flex flex-col bg-[#0B192C] text-slate-300 transition-all duration-300 border-r border-slate-800 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between h-16 px-4 bg-[#081220] border-b border-slate-800/80">
        <div className="flex items-center gap-3 overflow-hidden">
          {/* Emblem Icon */}
          <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-slate-950 shadow-md">
            <Shield className="w-5 h-5 text-white fill-white/20" />
          </div>
          {!collapsed && (
            <div className="leading-tight truncate">
              <span className="text-xs font-bold tracking-wider text-amber-400 uppercase">AICTE · AUGMS</span>
              <p className="text-[11px] text-slate-400 font-medium truncate">Grievance Monitoring</p>
            </div>
          )}
        </div>
      </div>

      {/* Bureau / Role Pill for Active User */}
      {!collapsed && user && (
        <div className="mx-3 mt-3 p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/60 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-blue-950 border border-blue-500/40 text-blue-300 flex items-center justify-center text-xs font-bold">
            {user.bureau ? user.bureau.code : 'HQ'}
          </div>
          <div className="overflow-hidden leading-tight flex-1">
            <p className="text-xs font-semibold text-slate-200 truncate">{user.name}</p>
            <p className="text-[10px] text-amber-400 uppercase tracking-wider font-mono truncate">
              {user.role.replace(/_/g, ' ')}
            </p>
          </div>
        </div>
      )}

      {/* Navigation List */}
      <nav className="flex-1 px-2.5 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group relative ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm font-semibold'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                } ${collapsed ? 'justify-center' : ''}`
              }
              title={collapsed ? item.name : undefined}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span className="flex-1 truncate">{item.name}</span>}
              {!collapsed && item.badge && (
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${item.badgeColor} animate-pulse`}
                >
                  {item.badge}
                </span>
              )}
              {collapsed && item.badge && (
                <span
                  className={`absolute top-1.5 right-1.5 w-2 h-2 rounded-full ${item.badgeColor}`}
                />
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer Profile & Logout */}
      <div className="p-3 border-t border-slate-800/80 bg-[#081220]">
        <button
          onClick={logout}
          className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-colors ${
            collapsed ? 'justify-center' : ''
          }`}
          title="Sign Out"
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
};

