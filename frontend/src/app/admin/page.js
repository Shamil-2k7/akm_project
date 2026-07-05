'use client';

import { useState, useEffect } from 'react';
import { apiRequest } from '../../utils/api';
import { Users, BookOpen, Monitor, Award, GraduationCap, Clock } from 'lucide-react';

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

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const data = await apiRequest('/admin/analytics');
        setAnalytics(data);
      } catch (err) {
        setError(err.message || 'Failed to load analytics data.');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2" style={{ borderColor: COLOR.marigold }} />
      </div>
    );
  }

  const { summary, popularCourses = [], recentEnrollments = [], recentSessions = [] } = analytics || {};

  return (
    <div className="space-y-8">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
          Admin Dashboard
        </h1>
        <p 
          className="text-[11px] uppercase tracking-[0.2em] mt-1.5 font-semibold"
          style={{ fontFamily: 'var(--font-mono)', color: COLOR.sage }}
        >
          Real-time metrics, active user logins, and syllabus analytics
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-sm bg-red-50 border border-red-200 text-red-700 text-xs">
          {error}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Metric 1 */}
        <div 
          className="p-5 bg-white border rounded-sm shadow-sm flex items-center space-x-4"
          style={{ borderTop: `2px dashed ${COLOR.chalk2}` }}
        >
          <div className="p-3 rounded-sm bg-[#FAF9F4] border border-[#DCDCDC] text-slate-700">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider font-semibold" style={{ fontFamily: 'var(--font-mono)', color: COLOR.sage }}>Total Students</p>
            <p className="text-2xl font-bold mt-0.5" style={{ color: COLOR.inkText }}>{summary?.totalStudents}</p>
          </div>
        </div>

        {/* Metric 2 */}
        <div 
          className="p-5 bg-white border rounded-sm shadow-sm flex items-center space-x-4"
          style={{ borderTop: `2px dashed ${COLOR.chalk2}` }}
        >
          <div className="p-3 rounded-sm bg-[#FAF9F4] border border-[#DCDCDC] text-slate-700">
            <BookOpen className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider font-semibold" style={{ fontFamily: 'var(--font-mono)', color: COLOR.sage }}>Total Courses</p>
            <p className="text-2xl font-bold mt-0.5" style={{ color: COLOR.inkText }}>{summary?.totalCourses}</p>
          </div>
        </div>

        {/* Metric 3 */}
        <div 
          className="p-5 bg-white border rounded-sm shadow-sm flex items-center space-x-4"
          style={{ borderTop: `2px dashed ${COLOR.chalk2}` }}
        >
          <div className="p-3 rounded-sm bg-[#FAF9F4] border border-[#DCDCDC] text-slate-700">
            <Award className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider font-semibold" style={{ fontFamily: 'var(--font-mono)', color: COLOR.sage }}>Total Enrollments</p>
            <p className="text-2xl font-bold mt-0.5" style={{ color: COLOR.inkText }}>{summary?.totalEnrollments}</p>
          </div>
        </div>

        {/* Metric 4 */}
        <div 
          className="p-5 bg-white border rounded-sm shadow-sm flex items-center space-x-4"
          style={{ borderTop: `2px dashed ${COLOR.chalk2}` }}
        >
          <div className="p-3 rounded-sm bg-[#FAF9F4] border border-[#DCDCDC] text-slate-700">
            <Monitor className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider font-semibold" style={{ fontFamily: 'var(--font-mono)', color: COLOR.sage }}>Active Devices</p>
            <p className="text-2xl font-bold mt-0.5" style={{ color: COLOR.inkText }}>{summary?.activeSessions}</p>
          </div>
        </div>
      </div>

      {/* Row 2: Popular Courses & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Popular Courses */}
        <div 
          className="p-6 bg-white border rounded-sm shadow-sm space-y-5"
          style={{ borderTop: `2px dashed ${COLOR.chalk2}` }}
        >
          <h2 className="text-sm font-bold tracking-wider uppercase flex items-center" style={{ color: COLOR.inkText }}>
            <BookOpen className="h-4.5 w-4.5 mr-2" style={{ color: COLOR.marigold }} />
            Popular Courses
          </h2>
          <div className="space-y-4 pt-1">
            {popularCourses.length === 0 ? (
              <p className="text-xs text-slate-400">No enrollment activities yet.</p>
            ) : (
              popularCourses.map((course) => (
                <div key={course.courseId} className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-700">{course.title}</span>
                    <span className="font-bold text-slate-500" style={{ fontFamily: 'var(--font-mono)' }}>{course.enrollments} Students</span>
                  </div>
                  <div className="w-full bg-[#F0EEE3] h-2 rounded-sm overflow-hidden">
                    <div
                      className="h-full rounded-sm"
                      style={{
                        background: COLOR.marigold,
                        width: `${
                          summary?.totalEnrollments > 0
                            ? Math.round((course.enrollments / summary.totalEnrollments) * 100)
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Enrollments */}
        <div 
          className="p-6 bg-white border rounded-sm shadow-sm space-y-5"
          style={{ borderTop: `2px dashed ${COLOR.chalk2}` }}
        >
          <h2 className="text-sm font-bold tracking-wider uppercase flex items-center" style={{ color: COLOR.inkText }}>
            <GraduationCap className="h-4.5 w-4.5 mr-2" style={{ color: COLOR.marigold }} />
            Recent Enrollments
          </h2>
          <div className="divide-y divide-[#F0EEE3] pt-1">
            {recentEnrollments.length === 0 ? (
              <p className="text-xs text-slate-400 py-2">No recent enrollments.</p>
            ) : (
              recentEnrollments.map((enroll) => (
                <div key={enroll._id} className="py-3 flex justify-between items-center text-xs first:pt-0 last:pb-0">
                  <div>
                    <p className="font-semibold text-slate-750">
                      {enroll.studentId?.name || 'Deleted Student'}
                    </p>
                    <p className="text-[10px] text-slate-400 font-light mt-0.5">
                      Enrolled in: <span className="font-medium text-slate-600">{enroll.courseId?.title}</span>
                    </p>
                  </div>
                  <span className="text-[10px] text-slate-400 flex items-center font-light" style={{ fontFamily: 'var(--font-mono)' }}>
                    <Clock className="h-3.5 w-3.5 mr-1" />
                    {new Date(enroll.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Row 3: Recent Logins (Admin session tracker) */}
      <div 
        className="p-6 bg-white border rounded-sm shadow-sm space-y-5"
        style={{ borderTop: `2px dashed ${COLOR.chalk2}` }}
      >
        <h2 className="text-sm font-bold tracking-wider uppercase flex items-center" style={{ color: COLOR.inkText }}>
          <Monitor className="h-4.5 w-4.5 mr-2" style={{ color: COLOR.marigold }} />
          Recent Student Logins
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr 
                className="text-[10px] text-slate-400 font-bold uppercase border-b border-[#EAEAEA] pb-3"
                style={{ fontFamily: 'var(--font-mono)' }}
              >
                <th className="pb-3 pr-4">Student</th>
                <th className="pb-3 pr-4">Browser/OS</th>
                <th className="pb-3 pr-4">IP Address</th>
                <th className="pb-3">Login Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0EEE3]">
              {recentSessions.length === 0 ? (
                <tr>
                  <td colSpan="4" className="py-4 text-slate-400 text-center">
                    No active sessions found.
                  </td>
                </tr>
              ) : (
                recentSessions.map((session) => (
                  <tr key={session._id} className="text-slate-700">
                    <td className="py-3.5 pr-4 font-semibold text-slate-800">
                      {session.userId?.name || 'Unknown User'}
                      <span className="block text-[10px] text-slate-400 font-light mt-0.5" style={{ fontFamily: 'var(--font-mono)' }}>
                        {session.userId?.phone}
                      </span>
                    </td>
                    <td className="py-3.5 pr-4">{session.browser}</td>
                    <td className="py-3.5 pr-4" style={{ fontFamily: 'var(--font-mono)' }}>{session.ip}</td>
                    <td className="py-3.5 text-slate-400" style={{ fontFamily: 'var(--font-mono)' }}>
                      {new Date(session.loginTime).toLocaleString()}
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
