'use client';

import { useState, useEffect } from 'react';
import { apiRequest } from '../../../utils/api';
import { Settings, Save, ShieldAlert, CheckCircle } from 'lucide-react';

export default function AdminSettings() {
  const [platformName, setPlatformName] = useState('AKM Academy');
  const [allowRegistration, setAllowRegistration] = useState(true);
  const [maxSessionsPerStudent, setMaxSessionsPerStudent] = useState(2);
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState({ message: '', type: '' });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await apiRequest('/settings');
        setPlatformName(data.platformName || 'AKM Academy');
        setAllowRegistration(data.allowRegistration !== false);
        setMaxSessionsPerStudent(data.maxSessionsPerStudent || 2);
        setMaintenanceMode(data.maintenanceMode === true);
      } catch (err) {
        setFeedback({
          message: err.message || 'Failed to load system settings.',
          type: 'error',
        });
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFeedback({ message: '', type: '' });

    const body = {
      platformName,
      allowRegistration,
      maxSessionsPerStudent,
      maintenanceMode,
    };

    try {
      await apiRequest('/settings', {
        method: 'PUT',
        body: JSON.stringify(body),
      });
      setFeedback({
        message: 'Platform configurations updated successfully.',
        type: 'success',
      });
    } catch (err) {
      setFeedback({
        message: err.message || 'Failed to update system settings.',
        type: 'error',
      });
    } finally {
      setSaving(false);
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
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 tracking-wide">
          Global Settings
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-light">
          Configure security flags, maximum active student logins, and metadata fields.
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

      {/* Settings Form */}
      <form onSubmit={handleSubmit} className="p-6 bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 rounded-2xl shadow-sm space-y-6">
        <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100 tracking-wider uppercase flex items-center border-b border-slate-100 dark:border-slate-805 pb-3">
          <Settings className="h-4.5 w-4.5 mr-2 text-indigo-500" />
          General Configurations
        </h2>

        {/* Platform Name */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
            Platform Name
          </label>
          <input
            type="text"
            required
            value={platformName}
            onChange={(e) => setPlatformName(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-805 hover:border-slate-350 focus:border-indigo-500 rounded-xl py-3 px-4 text-xs text-slate-800 dark:text-slate-100 outline-none transition-all"
          />
        </div>

        {/* Max Sessions per Student */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
            Max Active Devices per Student
          </label>
          <input
            type="number"
            required
            min="1"
            max="10"
            value={maxSessionsPerStudent}
            onChange={(e) => setMaxSessionsPerStudent(parseInt(e.target.value) || 2)}
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-805 hover:border-slate-350 focus:border-indigo-500 rounded-xl py-3 px-4 text-xs text-slate-800 dark:text-slate-100 outline-none transition-all"
          />
          <span className="text-[10px] text-slate-450 dark:text-slate-500 font-light block pt-1 leading-normal">
            Enforces strict session locking. A student cannot log in from a 3rd device if limit is 2.
          </span>
        </div>

        {/* Toggles */}
        <div className="space-y-4 pt-2">
          {/* Allow Registration Toggle */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-805">
            <div>
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Allow Student Registrations</p>
              <p className="text-[10px] text-slate-450 dark:text-slate-500 mt-1 font-light leading-normal">
                If disabled, the sign-up page is blocked and new student registrations are closed.
              </p>
            </div>
            <label className="relative flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={allowRegistration}
                onChange={(e) => setAllowRegistration(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-10 h-6 bg-slate-200 rounded-full peer peer-focus:ring-1 peer-focus:ring-indigo-500 dark:bg-slate-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          {/* Maintenance Mode Toggle */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-805">
            <div>
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300 font-sans">Maintenance Mode</p>
              <p className="text-[10px] text-slate-450 dark:text-slate-500 mt-1 font-light leading-normal">
                Locks down student features, displaying a maintenance update screen. Admins retain full access.
              </p>
            </div>
            <label className="relative flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={maintenanceMode}
                onChange={(e) => setMaintenanceMode(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-10 h-6 bg-slate-200 rounded-full peer peer-focus:ring-1 peer-focus:ring-indigo-500 dark:bg-slate-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
            </label>
          </div>
        </div>

        {/* Save CTA */}
        <div className="flex items-center justify-end pt-4 border-t border-slate-100 dark:border-slate-805">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-550 text-white rounded-xl text-xs font-semibold tracking-wide shadow-md flex items-center cursor-pointer transition-all hover:scale-[1.01]"
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}
