'use client';

import { useState, useEffect } from 'react';
import { apiRequest } from '../../../utils/api';
import { useAuth } from '../../../context/AuthContext';
import { User, Monitor, Clock, XCircle, ShieldAlert, CheckCircle, Smartphone } from 'lucide-react';

export default function StudentProfile() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState({ message: '', type: '' });

  const fetchSessions = async () => {
    try {
      const data = await apiRequest('/sessions/active');
      setSessions(data);
    } catch (err) {
      setFeedback({
        message: err.message || 'Failed to load active login sessions.',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleTerminateSession = async (sessionId, isCurrentDevice) => {
    if (!window.confirm('Are you sure you want to log out from this device?')) return;
    
    try {
      await apiRequest(`/sessions/${sessionId}`, { method: 'DELETE' });
      setFeedback({
        message: 'Logged out from device successfully.',
        type: 'success',
      });
      
      if (isCurrentDevice) {
        // If current device, trigger full logout redirect
        localStorage.removeItem('akm_lms_token');
        localStorage.removeItem('akm_lms_user');
        window.location.href = '/login?msg=Session terminated.';
      } else {
        fetchSessions();
      }
    } catch (err) {
      setFeedback({
        message: err.message || 'Failed to terminate session.',
        type: 'error',
      });
    }
  };

  if (loading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 tracking-wide">
          My Account
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-light">
          Manage your personal details and control your active logins.
        </p>
      </div>

      {feedback.message && (
        <div className={`p-4 rounded-xl border text-xs flex items-center space-x-2.5 ${
          feedback.type === 'success'
            ? 'bg-emerald-950/20 border-emerald-900/30 text-emerald-400'
            : 'bg-red-950/20 border-red-900/30 text-red-400'
        }`}>
          {feedback.type === 'success' ? (
            <CheckCircle className="h-5 w-5 shrink-0" />
          ) : (
            <ShieldAlert className="h-5 w-5 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* User Information Profile */}
      <div className="p-6 bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800/80 rounded-2xl shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100 tracking-wider uppercase flex items-center">
          <User className="h-4.5 w-4.5 mr-2 text-indigo-500" />
          Profile Details
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
          <div className="space-y-1">
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Full Name</p>
            <p className="text-sm text-slate-800 dark:text-slate-200 font-semibold">{user?.name}</p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Phone Number</p>
            <p className="text-sm text-slate-800 dark:text-slate-200 font-semibold">{user?.phone}</p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Role</p>
            <span className="inline-block mt-1 px-2.5 py-0.5 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 text-[10px] font-bold tracking-widest uppercase">
              {user?.role}
            </span>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Status</p>
            <span className="inline-block mt-1 px-2.5 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-bold tracking-widest uppercase">
              {user?.status}
            </span>
          </div>
        </div>
      </div>

      {/* Login Device Sessions Management */}
      <div className="p-6 bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800/80 rounded-2xl shadow-sm space-y-6">
        <div>
          <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100 tracking-wider uppercase flex items-center">
            <Monitor className="h-4.5 w-4.5 mr-2 text-indigo-500" />
            Active Login Devices
          </h2>
          <p className="text-[11px] text-slate-450 dark:text-slate-500 mt-1 font-light">
            You can log in to a maximum of 2 devices/browsers at any time. Revoke a session to log in from a new device.
          </p>
        </div>

        <div className="space-y-3">
          {sessions.map((session) => (
            <div
              key={session._id}
              className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors ${
                session.isCurrentDevice
                  ? 'bg-indigo-50/20 border-indigo-500/30'
                  : 'bg-slate-50 dark:bg-slate-950/20 border-slate-200 dark:border-slate-805'
              }`}
            >
              <div className="flex items-center space-x-3.5 min-w-0">
                <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 shadow-sm shrink-0">
                  {session.browser.toLowerCase().includes('mobile') || session.browser.toLowerCase().includes('android') || session.browser.toLowerCase().includes('iphone') ? (
                    <Smartphone className="h-5 w-5" />
                  ) : (
                    <Monitor className="h-5 w-5" />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate">
                      {session.browser}
                    </p>
                    {session.isCurrentDevice && (
                      <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-[9px] font-bold tracking-wider uppercase shrink-0">
                        This Device
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-[10px] text-slate-400 font-light">
                    <span className="flex items-center">
                      <Clock className="h-3.5 w-3.5 mr-1" />
                      Logged in: {new Date(session.loginTime).toLocaleString()}
                    </span>
                    <span>•</span>
                    <span>IP: {session.ip}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleTerminateSession(session._id, session.isCurrentDevice)}
                className="w-full sm:w-auto px-4 py-2 border border-slate-205 dark:border-slate-800 hover:bg-red-950/10 dark:hover:bg-red-950/20 hover:border-red-900/40 hover:text-red-400 text-slate-400 text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center justify-center shrink-0"
              >
                <XCircle className="h-4 w-4 mr-1.5" />
                Logout Device
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
