'use client';

import { useState, useEffect } from 'react';
import { apiRequest } from '../../../utils/api';
import CourseCard from '../../../components/CourseCard';
import { Search, BookOpen, ShieldAlert } from 'lucide-react';

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

export default function CourseCatalog() {
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [coursesData, enrollmentsData] = await Promise.all([
          apiRequest('/courses'),
          apiRequest('/enrollments'),
        ]);
        setCourses(coursesData);
        setEnrollments(enrollmentsData);
      } catch (err) {
        setError(err.message || 'Failed to load catalog data.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2" style={{ borderColor: COLOR.marigold }} />
      </div>
    );
  }

  // Filter courses based on search query
  const filteredCourses = courses.filter(
    (course) =>
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Helper to map enrollment progress
  const getEnrollmentData = (courseId) => {
    const enroll = enrollments.find((e) => e.courseId?._id === courseId || e.courseId === courseId);
    return enroll 
      ? { isEnrolled: enroll.status === 'approved', progress: enroll.progress, enrollmentStatus: enroll.status } 
      : { isEnrolled: false, progress: 0, enrollmentStatus: null };
  };

  return (
    <div className="space-y-8">
      {/* Title Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight" style={{ fontFamily: 'var(--font-display)', color: COLOR.inkText }}>
          Course Catalog
        </h1>
        <p 
          className="text-[11px] uppercase tracking-[0.2em] mt-1.5 font-semibold"
          style={{ fontFamily: 'var(--font-mono)', color: COLOR.sage }}
        >
          Browse our collection of courses and choose your next topic
        </p>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:max-w-md">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
            <Search className="h-4.5 w-4.5" />
          </span>
          <input
            type="text"
            placeholder="Search courses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-[#DCDCDC] focus:border-[#E8A33D] rounded-sm py-2.5 pl-11 pr-4 text-sm outline-none transition-all"
            style={{ color: COLOR.inkText }}
          />
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-sm bg-red-50 border border-red-200 text-red-750 text-xs flex items-center space-x-2.5">
          <ShieldAlert className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Grid List */}
      {filteredCourses.length === 0 ? (
        <div 
          className="text-center p-12 bg-white border rounded-sm shadow-sm flex flex-col items-center justify-center space-y-4"
          style={{ borderTop: `2px dashed ${COLOR.chalk2}` }}
        >
          <div className="p-4 bg-[#FAF9F4] border border-[#DCDCDC] text-slate-400 rounded-sm">
            <BookOpen className="h-8 w-8" />
          </div>
          <p className="text-slate-700 font-semibold text-sm">
            No Courses Found
          </p>
          <p className="text-xs text-slate-450 max-w-xs font-light leading-relaxed">
            We couldn't find any courses matching your search keyword. Try something else!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => {
            const { isEnrolled, progress, enrollmentStatus } = getEnrollmentData(course._id);
            return (
              <CourseCard
                key={course._id}
                course={course}
                isEnrolled={isEnrolled}
                progress={progress}
                isAdmin={false}
                enrollmentStatus={enrollmentStatus}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
