'use client';

import { useState, useEffect } from 'react';
import { apiRequest } from '../../../utils/api';
import { Check, X, Search, ShieldAlert, Clock, BookOpen } from 'lucide-react';

export default function EnrollmentRequests() {
  const [requests, setRequests] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('pending'); // 'all', 'pending', 'approved', 'rejected'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState({});

  const fetchRequests = async () => {
    try {
      const data = await apiRequest('/enrollments/admin');
      setRequests(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch enrollment requests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleAction = async (requestId, action) => {
    setActionLoading((prev) => ({ ...prev, [requestId]: true }));
    setError('');
    try {
      await apiRequest(`/enrollments/${requestId}/${action}`, {
        method: 'PUT',
      });
      await fetchRequests();
    } catch (err) {
      setError(err.message || `Failed to ${action} enrollment.`);
    } finally {
      setActionLoading((prev) => ({ ...prev, [requestId]: false }));
    }
  };

  if (loading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500" />
      </div>
    );
  }

  // Filter requests based on search and status filter
  const filteredRequests = requests.filter((req) => {
    const studentName = req.studentId?.name || '';
    const studentPhone = req.studentId?.phone || '';
    const courseTitle = req.courseId?.title || '';
    
    const matchesSearch =
      studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      studentPhone.toLowerCase().includes(searchQuery.toLowerCase()) ||
      courseTitle.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || req.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 tracking-wide">
          Enrollment Requests
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-light">
          Review course enrollment requests submitted by students. Approve access or reject requests.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-950/20 border border-red-900/30 text-red-400 text-xs flex items-center space-x-2.5">
          <ShieldAlert className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:max-w-md">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
            <Search className="h-4.5 w-4.5" />
          </span>
          <input
            type="text"
            placeholder="Search by student or course..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 hover:border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl py-3 pl-11 pr-4 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 outline-none shadow-sm transition-all"
          />
        </div>

        {/* Status filter tabs */}
        <div className="flex items-center space-x-2 bg-slate-100 dark:bg-slate-900/60 p-1.5 rounded-xl border border-slate-205 dark:border-slate-800/80 self-start md:self-auto">
          {['pending', 'approved', 'rejected', 'all'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-lg text-xs font-semibold capitalize tracking-wide transition-all cursor-pointer ${
                statusFilter === status
                  ? 'bg-indigo-650 text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-750 dark:hover:text-slate-200'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* List Table */}
      <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="text-[10px] text-slate-400 font-bold uppercase border-b border-slate-100 dark:border-slate-800 pb-3">
                <th className="pb-3 pr-4">Student Info</th>
                <th className="pb-3 pr-4">Course</th>
                <th className="pb-3 pr-4">Request Date</th>
                <th className="pb-3 pr-4">Status</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-805">
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-8 text-slate-400 text-center font-light">
                    No enrollment requests matching criteria.
                  </td>
                </tr>
              ) : (
                filteredRequests.map((reqItem) => (
                  <tr key={reqItem._id} className="text-slate-700 dark:text-slate-350">
                    {/* Student Info */}
                    <td className="py-4 pr-4 font-semibold text-slate-850 dark:text-slate-150">
                      {reqItem.studentId?.name || 'Unknown Student'}
                      <span className="block text-[10px] text-slate-400 dark:text-slate-500 font-light mt-0.5">
                        {reqItem.studentId?.phone}
                      </span>
                    </td>

                    {/* Course */}
                    <td className="py-4 pr-4 font-medium">
                      {reqItem.courseId?.title || 'Unknown Course'}
                    </td>

                    {/* Date */}
                    <td className="py-4 pr-4 font-light text-slate-500 dark:text-slate-400 flex items-center mt-2.5">
                      <Clock className="h-3.5 w-3.5 mr-1" />
                      {new Date(reqItem.createdAt).toLocaleDateString()}
                    </td>

                    {/* Status badge */}
                    <td className="py-4 pr-4">
                      <span className={`inline-flex px-2 py-0.5 rounded text-[9px] font-bold tracking-widest uppercase border ${
                        reqItem.status === 'approved'
                          ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                          : reqItem.status === 'rejected'
                          ? 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                          : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                      }`}>
                        {reqItem.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-4 text-right space-x-2">
                      {reqItem.status === 'pending' ? (
                        <>
                          <button
                            onClick={() => handleAction(reqItem._id, 'approve')}
                            disabled={actionLoading[reqItem._id]}
                            className="inline-flex items-center px-3 py-2 border border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-500 rounded-xl text-[10px] font-bold tracking-wider uppercase cursor-pointer disabled:opacity-50 transition-all"
                          >
                            <Check className="h-3.5 w-3.5 mr-1" /> Approve
                          </button>
                          <button
                            onClick={() => handleAction(reqItem._id, 'reject')}
                            disabled={actionLoading[reqItem._id]}
                            className="inline-flex items-center px-3 py-2 border border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/10 text-rose-500 rounded-xl text-[10px] font-bold tracking-wider uppercase cursor-pointer disabled:opacity-50 transition-all"
                          >
                            <X className="h-3.5 w-3.5 mr-1" /> Reject
                          </button>
                        </>
                      ) : (
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-light">
                          Processed
                        </span>
                      )}
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
