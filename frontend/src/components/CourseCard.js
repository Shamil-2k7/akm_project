'use client';

import Link from 'next/link';
import { BookOpen, Edit2, Play, CheckCircle } from 'lucide-react';

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

export default function CourseCard({ course, isEnrolled, progress, isAdmin, onEdit, enrollmentStatus }) {
  // Description truncated to 100 characters
  const truncatedDesc =
    course.description.length > 100
      ? `${course.description.substring(0, 97)}...`
      : course.description;

  return (
    <div 
      className="group relative rounded-sm p-6 flex flex-col h-[420px] transition-all duration-300 hover:-translate-y-1.5 hover:rotate-[-0.6deg]"
      style={{
        background: COLOR.chalk,
        borderTop: `2px dashed ${COLOR.chalk2}`,
        boxShadow: '0 1px 0 rgba(0,0,0,0.15)',
        fontFamily: 'var(--font-body)',
        color: COLOR.inkText
      }}
    >
      {/* punch holes, index-card motif (automatically matches parent page background) */}
      <div className="absolute -top-1.5 left-6 w-3 h-3 rounded-full bg-[var(--background)] border-b border-transparent" />
      <div className="absolute -top-1.5 right-6 w-3 h-3 rounded-full bg-[var(--background)] border-b border-transparent" />

      {/* Eyebrow & Price/Status Tag */}
      <div className="flex items-center justify-between mb-4">
        <span 
          className="text-[10px] tracking-[0.16em] uppercase font-semibold"
          style={{ fontFamily: 'var(--font-mono)', color: COLOR.sage }}
        >
          LMS — CODE
        </span>
        <span 
          className="text-xs font-semibold px-2.5 py-1 rounded-sm"
          style={{ 
            background: enrollmentStatus === 'pending' ? '#EAEAEA' : COLOR.marigold, 
            color: COLOR.inkDeep 
          }}
        >
          {enrollmentStatus === 'pending' ? 'Pending' : enrollmentStatus === 'rejected' ? 'Rejected' : '$99'}
        </span>
      </div>

      {/* Course Image Area */}
      <div className="relative h-40 w-full rounded-sm overflow-hidden mb-4 bg-slate-105 border border-[#DCDCDC]">
        <img
          src={course.thumbnail || '/images/course-placeholder.jpg'}
          alt={course.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=60';
          }}
        />

        {/* Hover play button */}
        {!isAdmin && isEnrolled && (
          <div className="absolute inset-0 bg-[#1F2E28]/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <Link
              href={`/student/courses/${course._id}`}
              className="p-3 bg-[#E8A33D] rounded-full text-white shadow-lg transition-transform transform scale-90 group-hover:scale-100 duration-300"
            >
              <Play className="h-5 w-5 fill-current ml-0.5 text-[#141F1B]" />
            </Link>
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="flex-1 flex flex-col justify-between">
        <div className="space-y-2">
          <h3 
            className="text-base leading-snug font-bold"
            style={{ fontFamily: 'var(--font-display)', color: COLOR.inkText }}
          >
            {course.title}
          </h3>
          <p className="text-xs leading-relaxed font-light line-clamp-3" style={{ color: '#5B665F' }}>
            {truncatedDesc}
          </p>
        </div>

        {/* Progress or Actions Footer */}
        <div className="pt-4 border-t border-[#EAEAEA]">
          {isAdmin ? (
            <div className="flex items-center justify-between">
              <Link
                href={`/admin/courses/${course._id}`}
                className="flex-1 py-2 px-3 text-center border border-[#DCDCDC] hover:bg-slate-50 rounded-sm text-xs font-semibold transition-colors cursor-pointer"
                style={{ color: COLOR.inkText }}
              >
                Manage Sections
              </Link>
              <button
                onClick={onEdit}
                className="ml-2.5 p-2 border border-[#DCDCDC] hover:bg-slate-50 rounded-sm transition-colors cursor-pointer"
                style={{ color: COLOR.inkText }}
                aria-label="Edit course info"
              >
                <Edit2 className="h-4 w-4" />
              </button>
            </div>
          ) : enrollmentStatus === 'pending' ? (
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-amber-600 flex items-center font-bold tracking-wide uppercase" style={{ fontFamily: 'var(--font-mono)' }}>
                <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse mr-2" />
                In Progress
              </span>
              <Link
                href={`/student/courses/${course._id}`}
                className="py-2 px-4 bg-slate-800 hover:bg-slate-900 text-white rounded-sm text-xs font-semibold transition-colors cursor-pointer"
                style={{ fontFamily: 'var(--font-mono)' }}
              >
                Details
              </Link>
            </div>
          ) : enrollmentStatus === 'rejected' ? (
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-rose-600 flex items-center font-bold tracking-wide uppercase" style={{ fontFamily: 'var(--font-mono)' }}>
                <span className="h-2 w-2 rounded-full bg-rose-500 mr-2" />
                Rejected
              </span>
              <Link
                href={`/student/courses/${course._id}`}
                className="py-2 px-4 rounded-sm text-xs font-semibold transition-colors cursor-pointer"
                style={{ background: COLOR.marigold, color: COLOR.inkDeep }}
              >
                Re-request
              </Link>
            </div>
          ) : isEnrolled ? (
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-medium" style={{ color: COLOR.sage }}>
                <span className="flex items-center font-bold tracking-wider uppercase text-[10px]" style={{ fontFamily: 'var(--font-mono)' }}>
                  <CheckCircle className="h-3.5 w-3.5 mr-1" style={{ color: COLOR.marigold }} />
                  Enrolled
                </span>
                <span style={{ fontFamily: 'var(--font-mono)' }}>{progress}% Done</span>
              </div>
              {/* Progress Bar */}
              <div className="w-full bg-[#F0EEE3] h-2 rounded-sm overflow-hidden">
                <div
                  className="h-full rounded-sm transition-all duration-500"
                  style={{ width: `${progress}%`, background: COLOR.marigold }}
                />
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <span 
                className="text-[10px] uppercase font-bold tracking-wider" 
                style={{ fontFamily: 'var(--font-mono)', color: COLOR.sage }}
              >
                Locked
              </span>
              <Link
                href={`/student/courses/${course._id}`}
                className="py-2 px-4 rounded-sm text-xs font-semibold transition-colors cursor-pointer"
                style={{ background: COLOR.marigold, color: COLOR.inkDeep }}
              >
                View Details
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
