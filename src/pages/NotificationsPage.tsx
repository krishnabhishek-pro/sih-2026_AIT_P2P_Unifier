import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  CheckCircle,
  AlertTriangle,
  Clock,
  ArrowRight,
  CheckCheck,
  RefreshCw,
  GitCompareArrows,
} from 'lucide-react';
import api from '../services/api';
import { NotificationItem } from '../types';

export const NotificationsPage: React.FC = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await api.get('/notifications');
      setNotifications(res.data);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAsRead = async (id: string, linkUrl?: string) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      if (linkUrl) {
        navigate(linkUrl);
      }
    } catch (err) {
      console.error('Failed to mark read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error('Failed to mark all read:', err);
    }
  };

  const displayed = notifications.filter((n) => (filter === 'unread' ? !n.isRead : true));

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">System Alerts & Regulatory Notifications</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Automated alerts for cross-bureau overlap detections, case assignments, and SLA breach warnings.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={markAllAsRead}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors"
          >
            <CheckCheck className="w-4 h-4 text-blue-600" />
            <span>Mark All Read</span>
          </button>
          <button
            onClick={fetchNotifications}
            className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-3 text-xs font-semibold">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-xl border transition-all ${
            filter === 'all'
              ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
          }`}
        >
          All Notifications ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-4 py-2 rounded-xl border transition-all ${
            filter === 'unread'
              ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
          }`}
        >
          Unread ({notifications.filter((n) => !n.isRead).length})
        </button>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {loading ? (
          <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-slate-500">
            Loading notifications...
          </div>
        ) : displayed.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-slate-500">
            <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <p className="font-bold text-slate-800 text-sm">No Pending Notifications</p>
            <p className="text-xs text-slate-500 mt-1">All regulatory alerts have been reviewed and acknowledged.</p>
          </div>
        ) : (
          displayed.map((n) => {
            const isOverlap = n.type === 'OVERLAP_ALERT';
            const isWarning = n.type === 'DUE_DATE_WARNING';

            return (
              <div
                key={n.id}
                onClick={() => markAsRead(n.id, n.linkUrl)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-4 ${
                  !n.isRead
                    ? isOverlap
                      ? 'bg-amber-50/70 border-amber-300 shadow-xs'
                      : 'bg-blue-50/50 border-blue-200 shadow-xs'
                    : 'bg-white border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`p-2.5 rounded-xl flex-shrink-0 ${
                      isOverlap
                        ? 'bg-amber-500 text-white'
                        : isWarning
                        ? 'bg-rose-500 text-white'
                        : 'bg-blue-600 text-white'
                    }`}
                  >
                    {isOverlap ? (
                      <GitCompareArrows className="w-5 h-5" />
                    ) : isWarning ? (
                      <AlertTriangle className="w-5 h-5" />
                    ) : (
                      <Bell className="w-5 h-5" />
                    )}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-900 text-xs sm:text-sm">{n.title}</h4>
                      {!n.isRead && (
                        <span className="w-2 h-2 rounded-full bg-blue-600" />
                      )}
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{n.message}</p>
                    <p className="text-[10px] text-slate-400 font-mono">
                      {new Date(n.createdAt).toLocaleString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-slate-400 self-center">
                  <span className="text-xs font-semibold text-blue-600 hover:underline hidden sm:inline">
                    Take Action
                  </span>
                  <ArrowRight className="w-4 h-4 text-blue-600" />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

