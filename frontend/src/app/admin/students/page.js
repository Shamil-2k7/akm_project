'use client';

import { useState, useEffect } from 'react';
import { apiRequest } from '../../../utils/api';
import { ShieldAlert, LogOut, Check, XCircle, Search } from 'lucide-react';

const COLOR = {
  ink: '#1F2E28',
  inkDeep: '#141F1B',
  chalk: '#FAF9F4',
  chalk2: '#F0EEE3',
  inkText: '#1C2521',
  marigold: '#E8A33D',
  marigoldDeep: '#C97F22',
  sage: '#7C9885',
};

export default function AdminStudents() {
  const [students, setStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState({});

  const fetchStudents = async () => {
    try {
      const data = await apiRequest('/admin/users?role=student');
      setStudents(data);
    } catch (err) {
      setError(err.message || 'Failed to load students.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleToggleStatus = async (studentId, currentStatus) => {
    const nextStatus = currentStatus === 'active' ? 'disabled' : 'active';
    const actionText = currentStatus === 'active' ? 'suspend' : 'activate';
    if (!window.confirm(`Are you sure you want to ${actionText} this student's account?`)) return;

    setActionLoading((prev) => ({ ...prev, [studentId]: 'status' }));
    try {
      await apiRequest(`/admin/users/${studentId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: nextStatus }),
      });
      fetchStudents();
    } catch (err) {
      setError(err.message || 'Failed to update student status.');
    } finally {
      setActionLoading((prev) => ({ ...prev, [studentId]: null }));
    }
  };

  const handleForceLogout = async (studentId) => {
    if (!window.confirm('Are you sure you want to force logout this student from ALL active devices?')) return;

    setActionLoading((prev) => ({ ...prev, [studentId]: 'logout' }));
    try {
      await apiRequest(`/sessions/force-logout/${studentId}`, { method: 'DELETE' });
      fetchStudents();
      alert('Student logged out from all devices.');
    } catch (err) {
      setError(err.message || 'Failed to force logout student.');
    } finally {
      setActionLoading((prev) => ({ ...prev, [studentId]: null }));
    }
  };

  if (loading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2" style={{ borderColor: COLOR.marigold }} />
      </div>
    );
  }

  const filteredStudents = students.filter(
    (student) =>
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (student.phone && student.phone.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
            Student Directory
          </h1>
          <p 
            className="text-[11px] uppercase tracking-[0.2em] mt-1.5 font-semibold"
            style={{ fontFamily: 'var(--font-mono)', color: COLOR.sage }}
          >
            Monitor accounts, status triggers, and devices
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-sm bg-red-50 border border-red-200 text-red-700 text-xs flex items-center space-x-2.5">
          <ShieldAlert className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center">
        <div className="relative w-full sm:max-w-md">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
            <Search className="h-4.5 w-4.5" />
          </span>
          <input
            type="text"
            placeholder="Search by name or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-[#DCDCDC] focus:border-[#E8A33D] rounded-sm py-2.5 pl-11 pr-4 text-sm outline-none transition-all"
            style={{ color: COLOR.inkText }}
          />
        </div>
      </div>

      {/* Student List Table */}
      <div 
        className="p-6 bg-white border rounded-sm shadow-sm relative"
        style={{
          borderTop: `2px dashed ${COLOR.chalk2}`,
        }}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr 
                className="text-[10px] text-slate-400 font-bold uppercase border-b border-[#EAEAEA] pb-3"
                style={{ fontFamily: 'var(--font-mono)' }}
              >
                <th className="pb-3 pr-4">Student Info</th>
                <th className="pb-3 pr-4">Account Status</th>
                <th className="pb-3 pr-4">Active Devices</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0EEE3]">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan="4" className="py-8 text-slate-400 text-center font-light">
                    No students matching search filter.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => (
                  <tr key={student._id} className="text-slate-700">
                    <td className="py-4 pr-4 font-semibold text-slate-800">
                      {student.name}
                      <span className="block text-[10px] text-slate-400 font-light mt-0.5" style={{ fontFamily: 'var(--font-mono)' }}>
                        {student.phone}
                      </span>
                    </td>
                    <td className="py-4 pr-4">
                      <span 
                        className="inline-flex px-2 py-0.5 rounded-sm text-[9px] font-bold tracking-widest uppercase border"
                        style={{
                          background: student.status === 'active' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                          color: student.status === 'active' ? '#10B981' : '#EF4444',
                          borderColor: student.status === 'active' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'
                        }}
                      >
                        {student.status}
                      </span>
                    </td>
                    <td className="py-4 pr-4 font-medium text-slate-500" style={{ fontFamily: 'var(--font-mono)' }}>
                      {student.activeSessions} / 2 Logins
                    </td>
                    <td className="py-4 text-right space-x-2.5">
                      {/* Toggle status button */}
                      <button
                        onClick={() => handleToggleStatus(student._id, student.status)}
                        disabled={actionLoading[student._id] === 'status'}
                        className="inline-flex items-center px-3 py-2 border rounded-sm text-[10px] font-bold tracking-wider uppercase cursor-pointer disabled:opacity-50 transition-all"
                        style={{
                          background: student.status === 'active' ? 'rgba(239, 68, 68, 0.05)' : 'rgba(16, 185, 129, 0.05)',
                          borderColor: student.status === 'active' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                          color: student.status === 'active' ? '#EF4444' : '#10B981'
                        }}
                      >
                        {student.status === 'active' ? (
                          <>
                            <XCircle className="h-3.5 w-3.5 mr-1" /> Suspend
                          </>
                        ) : (
                          <>
                            <Check className="h-3.5 w-3.5 mr-1" /> Activate
                          </>
                        )}
                      </button>

                      {/* Force logout button */}
                      <button
                        onClick={() => handleForceLogout(student._id)}
                        disabled={student.activeSessions === 0 || actionLoading[student._id] === 'logout'}
                        className="inline-flex items-center px-3 py-2 border border-[#DCDCDC] hover:bg-slate-50 text-slate-500 rounded-sm text-[10px] font-bold tracking-wider uppercase disabled:opacity-30 disabled:pointer-events-none cursor-pointer transition-all"
                        title="Log out student from all sessions"
                      >
                        <LogOut className="h-3.5 w-3.5 mr-1" /> Terminate Devices
                      </button>
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
