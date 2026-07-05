'use client';

import { useState, useEffect } from 'react';
import { apiRequest } from '../../../utils/api';
import { useAuth } from '../../../context/AuthContext';
import { Monitor, Clock, XCircle, ShieldAlert, CheckCircle, Smartphone, Activity } from 'lucide-react';

export default function AdminSessions() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [recentStudentLogins, setRecentStudentLogins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState({ message: '', type: '' });

  const fetchData = async () => {
    try {
      const [sessionsData, analyticsData] = await Promise.all([
        apiRequest('/sessions/active'),
        apiRequest('/admin/analytics'),
      ]);
      setSessions(sessionsData);
      setRecentStudentLogins(analyticsData.recentSessions || []);
    } catch (err) {
      setFeedback({
        message: err.message || 'Failed to load session details.',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleTerminateSession = async (sessionId, isCurrentDevice) => {
    if (!window.confirm('Are you sure you want to terminate this login session?')) return;
    
    try {
      await apiRequest(`/sessions/${sessionId}`, { method: 'DELETE' });
      setFeedback({
        message: 'Session terminated successfully.',
        type: 'success',
      });
      
      if (isCurrentDevice) {
        // If current device, trigger full logout redirect
        localStorage.removeItem('akm_lms_token');
        localStorage.removeItem('akm_lms_user');
        window.location.href = '/login?msg=Session terminated.';
      } else {
        fetchData();
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
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 tracking-wide">
          Session Management
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-light">
          Revoke your own active devices and view recent student login activities.
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

      {/* Admin's Own Sessions */}
      <div className="p-6 bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800/80 rounded-2xl shadow-sm space-y-5">
        <div>
          <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100 tracking-wider uppercase flex items-center">
            <Monitor className="h-4.5 w-4.5 mr-2 text-indigo-500" />
            My Active Logins
          </h2>
          <p className="text-[11px] text-slate-450 dark:text-slate-500 mt-1 font-light">
            These are the devices currently logged in to your administrator account.
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
                      <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-650 dark:text-indigo-400 text-[9px] font-bold tracking-wider uppercase shrink-0">
                        This Device
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-[10px] text-slate-400 font-light animate-fadeIn">
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
                Revoke Login
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Global Recent Student Login Activity */}
      <div className="p-6 bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 rounded-2xl shadow-sm space-y-5">
        <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100 tracking-wider uppercase flex items-center">
          <Activity className="h-4.5 w-4.5 mr-2 text-indigo-500" />
          Recent Student Audits
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="text-[10px] text-slate-400 font-bold uppercase border-b border-slate-100 dark:border-slate-800 pb-3">
                <th className="pb-3 pr-4">Student</th>
                <th className="pb-3 pr-4">Browser/OS</th>
                <th className="pb-3 pr-4">IP Address</th>
                <th className="pb-3">Last Activity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-805">
              {recentStudentLogins.length === 0 ? (
                <tr>
                  <td colSpan="4" className="py-4 text-slate-400 text-center font-light">
                    No active student logins recorded.
                  </td>
                </tr>
              ) : (
                recentStudentLogins.map((session) => (
                  <tr key={session._id} className="text-slate-700 dark:text-slate-350">
                    <td className="py-3.5 pr-4 font-semibold text-slate-805 dark:text-slate-200">
                      {session.userId?.name || 'Deleted Student'}
                      <span className="block text-[10px] text-slate-400 dark:text-slate-500 font-light mt-0.5">
                        {session.userId?.phone}
                      </span>
                    </td>
                    <td className="py-3.5 pr-4">{session.browser}</td>
                    <td className="py-3.5 pr-4">{session.ip}</td>
                    <td className="py-3.5 text-slate-400 dark:text-slate-500">
                      {new Date(session.lastActivity).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
