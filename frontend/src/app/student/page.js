'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiRequest } from '../../utils/api';
import CourseCard from '../../components/CourseCard';
import { BookOpen, GraduationCap, Trophy, ChevronRight } from 'lucide-react';

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

export default function StudentDashboard() {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchEnrollments = async () => {
      try {
        const data = await apiRequest('/enrollments');
        setEnrollments(data);
      } catch (err) {
        setError(err.message || 'Failed to load enrollment data.');
      } finally {
        setLoading(false);
      }
    };
    fetchEnrollments();
  }, []);

  if (loading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2" style={{ borderColor: COLOR.marigold }} />
      </div>
    );
  }

  // Calculate statistics
  const enrolledCount = enrollments.length;
  const completedCount = enrollments.filter((e) => e.progress === 100).length;
  const avgProgress =
    enrolledCount > 0
      ? Math.round(
          enrollments.reduce((acc, curr) => acc + curr.progress, 0) / enrolledCount
        )
      : 0;

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div 
        className="relative rounded-sm overflow-hidden p-8 shadow-xl"
        style={{ background: COLOR.ink }}
      >
        {/* chalk-dust texture */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.09] pointer-events-none" xmlns="http://www.w3.org/2000/svg">
          <filter id="chalkGrain">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
            <feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0 0.6 0" />
          </filter>
          <rect width="100%" height="100%" filter="url(#chalkGrain)" />
        </svg>
        {/* faint notebook rules */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              'repeating-linear-gradient(transparent, transparent 47px, rgba(250,249,244,0.06) 48px)',
          }}
        />

        <div className="relative z-10 max-w-xl space-y-3">
          <span 
            className="inline-block px-3 py-1 rounded-sm text-[10px] font-semibold uppercase tracking-wider"
            style={{ background: 'rgba(250, 249, 244, 0.1)', color: COLOR.marigold, fontFamily: 'var(--font-mono)' }}
          >
            Student Workspace
          </span>
          <h1 
            className="text-2xl md:text-3xl font-bold tracking-tight text-white"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Your Learning Adventure
          </h1>
          <p className="text-slate-350 font-light text-sm leading-relaxed">
            Resume your courses, complete lessons, and unlock new skills with your personalized LMS profile.
          </p>
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* Stat 1 */}
        <div 
          className="p-5 bg-white border rounded-sm shadow-sm flex items-center space-x-4"
          style={{ borderTop: `2px dashed ${COLOR.chalk2}` }}
        >
          <div className="p-3 rounded-sm bg-[#FAF9F4] border border-[#DCDCDC] text-slate-700">
            <BookOpen className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider font-semibold" style={{ fontFamily: 'var(--font-mono)', color: COLOR.sage }}>Enrolled Courses</p>
            <p className="text-2xl font-bold mt-0.5" style={{ color: COLOR.inkText }}>{enrolledCount}</p>
          </div>
        </div>

        {/* Stat 2 */}
        <div 
          className="p-5 bg-white border rounded-sm shadow-sm flex items-center space-x-4"
          style={{ borderTop: `2px dashed ${COLOR.chalk2}` }}
        >
          <div className="p-3 rounded-sm bg-[#FAF9F4] border border-[#DCDCDC] text-slate-700">
            <Trophy className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider font-semibold" style={{ fontFamily: 'var(--font-mono)', color: COLOR.sage }}>Completed Courses</p>
            <p className="text-2xl font-bold mt-0.5" style={{ color: COLOR.inkText }}>{completedCount}</p>
          </div>
        </div>

        {/* Stat 3 */}
        <div 
          className="p-5 bg-white border rounded-sm shadow-sm flex items-center space-x-4"
          style={{ borderTop: `2px dashed ${COLOR.chalk2}` }}
        >
          <div className="p-3 rounded-sm bg-[#FAF9F4] border border-[#DCDCDC] text-slate-700">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider font-semibold" style={{ fontFamily: 'var(--font-mono)', color: COLOR.sage }}>Average Progress</p>
            <p className="text-2xl font-bold mt-0.5" style={{ color: COLOR.inkText }}>{avgProgress}%</p>
          </div>
        </div>
      </div>

      {/* Enrolled Courses Section */}
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold tracking-tight" style={{ fontFamily: 'var(--font-display)', color: COLOR.inkText }}>
            My Enrolled Courses
          </h2>
          {enrolledCount > 0 && (
            <Link
              href="/student/courses"
              className="text-xs font-semibold text-slate-600 hover:text-[#E8A33D] hover:underline flex items-center transition-colors"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              Browse Catalog
              <ChevronRight className="h-4 w-4" />
            </Link>
          )}
        </div>

        {error && (
          <div className="p-4 rounded-sm bg-red-50 border border-red-200 text-red-750 text-xs">
            {error}
          </div>
        )}

        {enrolledCount === 0 ? (
          <div 
            className="text-center p-12 bg-white border rounded-sm shadow-sm flex flex-col items-center justify-center space-y-4"
            style={{ borderTop: `2px dashed ${COLOR.chalk2}` }}
          >
            <div className="p-4 bg-[#FAF9F4] border border-[#DCDCDC] text-slate-400 rounded-sm">
              <BookOpen className="h-8 w-8" />
            </div>
            <p className="text-slate-700 font-semibold text-sm">
              No Enrolled Courses Yet
            </p>
            <p className="text-xs text-slate-450 max-w-xs font-light leading-relaxed">
              You haven't registered for any course. Visit the catalog to choose your first topic!
            </p>
            <Link
              href="/student/courses"
              className="px-6 py-2.5 rounded-sm text-xs font-semibold transition-colors cursor-pointer"
              style={{ background: COLOR.marigold, color: COLOR.inkDeep }}
            >
              Browse Catalog
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrollments.map((enroll) => (
              <CourseCard
                key={enroll._id}
                course={enroll.courseId}
                isEnrolled={true}
                progress={enroll.progress}
                isAdmin={false}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
