'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiRequest } from '../../../../utils/api';
import EmbeddedVideoPlayer from '../../../../components/EmbeddedVideoPlayer';
import { BookOpen, CheckSquare, Square, PlayCircle, Lock, ShieldAlert, Award, Star, List, Clock, Check } from 'lucide-react';

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

export default function CourseWorkspace() {
  const { courseId } = useParams();
  const router = useRouter();

  const [course, setCourse] = useState(null);
  const [sections, setSections] = useState([]);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrollment, setEnrollment] = useState(null);

  const [activeLesson, setActiveLesson] = useState(null);
  const [activeLessonDetails, setActiveLessonDetails] = useState(null);
  const [expandedSections, setExpandedSections] = useState({});

  const [loading, setLoading] = useState(true);
  const [enrollLoading, setEnrollLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch course structure
  const fetchCourseData = async () => {
    try {
      const data = await apiRequest(`/courses/${courseId}`);
      setCourse(data.course);
      setSections(data.sections);
      setIsEnrolled(data.isEnrolled);
      setEnrollment(data.enrollment);

      // Auto-expand all sections by default
      const expandMap = {};
      data.sections.forEach((sec) => {
        expandMap[sec._id] = true;
      });
      setExpandedSections(expandMap);

      // Setup initial lesson to watch:
      // If student is enrolled, try to select first lesson or last watched lesson
      if (data.isEnrolled && data.sections.length > 0) {
        let defaultLesson = null;
        
        // Find last watched or first lesson
        const allLessons = [];
        data.sections.forEach((sec) => {
          if (sec.lessons) allLessons.push(...sec.lessons);
        });

        // Try to match last activity from database if any
        if (data.enrollment && data.enrollment.lastWatchedLessonId) {
          const lastWatched = allLessons.find(
            (l) => l._id === data.enrollment.lastWatchedLessonId
          );
          if (lastWatched) defaultLesson = lastWatched;
        }

        if (!defaultLesson && allLessons.length > 0) {
          defaultLesson = allLessons[0];
        }

        if (defaultLesson) {
          handleSelectLesson(defaultLesson._id);
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch course details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourseData();
  }, [courseId]);

  // Handle section expand/collapse
  const toggleSection = (sectionId) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  // Select a lesson to load and watch
  const handleSelectLesson = async (lessonId) => {
    setActiveLesson(lessonId);
    try {
      const lessonData = await apiRequest(`/lessons/${lessonId}`);
      setActiveLessonDetails(lessonData);
    } catch (err) {
      console.error('Failed to load lesson video:', err.message);
    }
  };

  // Toggle lesson completed status
  const handleToggleComplete = async (e, lessonId) => {
    e.stopPropagation(); // prevent loading video when toggling checkbox
    try {
      const progressData = await apiRequest(`/lessons/${lessonId}/progress`, {
        method: 'POST',
      });
      // Update completed lessons in client-state
      setEnrollment((prev) => ({
        ...prev,
        completedLessons: progressData.completedLessons,
        progress: progressData.progress,
      }));

      // Update section lists lessons status
      setSections((prevSections) =>
        prevSections.map((sec) => ({
          ...sec,
          lessons: sec.lessons.map((les) => {
            if (les._id === lessonId) {
              return { ...les, isCompleted: progressData.completedLessons.includes(lessonId) };
            }
            return les;
          }),
        }))
      );
    } catch (err) {
      console.error('Failed to toggle completion:', err.message);
    }
  };

  // Handle enrollment action
  const handleEnroll = async () => {
    setEnrollLoading(true);
    setError('');
    try {
      await apiRequest('/enrollments/enroll', {
        method: 'POST',
        body: JSON.stringify({ courseId }),
      });
      await fetchCourseData();
    } catch (err) {
      setError(err.message || 'Failed to enroll in this course.');
    } finally {
      setEnrollLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2" style={{ borderColor: COLOR.marigold }} />
      </div>
    );
  }

  // Count total lessons
  const totalLessons = sections.reduce((acc, curr) => acc + (curr.lessons?.length || 0), 0);

  // Render unenrolled course details landing screen
  if (!isEnrolled) {
    const isPending = enrollment?.status === 'pending';
    const isRejected = enrollment?.status === 'rejected';

    return (
      <div className="max-w-4xl mx-auto space-y-10 py-6" style={{ fontFamily: 'var(--font-body)' }}>
        {/* Cover Header */}
        <div 
          className="relative rounded-sm overflow-hidden flex flex-col md:flex-row shadow-xl border border-transparent"
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

          <div className="md:w-1/3 h-52 md:h-auto relative bg-[#141F1B]">
            <img
              src={course.thumbnail}
              alt={course.title}
              className="w-full h-full object-cover relative z-10"
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=60';
              }}
            />
          </div>
          <div className="md:w-2/3 p-8 flex flex-col justify-between space-y-6 relative z-10">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span 
                  className="px-2.5 py-1 rounded-sm text-[10px] font-bold tracking-widest uppercase"
                  style={{ 
                    background: isPending ? '#EAEAEA' : isRejected ? 'rgba(239, 68, 68, 0.1)' : COLOR.marigold, 
                    color: COLOR.inkDeep,
                    fontFamily: 'var(--font-mono)'
                  }}
                >
                  {isPending ? 'Pending Approval' : isRejected ? 'Request Rejected' : 'Course Catalog'}
                </span>
                <span 
                  className="px-2.5 py-1 rounded-sm text-[10px] font-bold tracking-widest uppercase bg-slate-800 text-white"
                  style={{ 
                    fontFamily: 'var(--font-mono)'
                  }}
                >
                  {course.fee !== undefined ? (course.fee === 0 ? 'Free' : `$${course.fee}`) : 'Free'}
                </span>
              </div>
              <h1 
                className="text-2xl md:text-3xl font-bold text-white tracking-tight"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {course.title}
              </h1>
              <p className="text-xs text-slate-350 leading-relaxed font-light">
                {course.description}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              {isPending ? (
                <button
                  disabled
                  className="w-full sm:w-auto px-8 py-3 bg-amber-500/10 border border-amber-500/20 text-amber-400 font-bold text-xs tracking-wider uppercase rounded-sm flex items-center justify-center cursor-not-allowed opacity-80"
                  style={{ fontFamily: 'var(--font-mono)' }}
                >
                  <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse mr-2" />
                  Pending Admin Approval
                </button>
              ) : (
                <button
                  onClick={handleEnroll}
                  disabled={enrollLoading}
                  className="w-full sm:w-auto px-8 py-3 rounded-sm font-bold text-xs tracking-wider uppercase transition-all flex items-center justify-center cursor-pointer disabled:opacity-50"
                  style={{ 
                    background: COLOR.marigold, 
                    color: COLOR.inkDeep, 
                    fontFamily: 'var(--font-mono)' 
                  }}
                >
                  {enrollLoading ? (
                    <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : isRejected ? (
                    'Re-submit Request'
                  ) : (
                    'Request Enrollment'
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-sm bg-red-50 border border-red-200 text-red-750 text-xs">
            {error}
          </div>
        )}

        {/* Syllabus structure for non-enrolled students (videos are locked) */}
        <div className="space-y-5">
          <h2 
            className="text-lg font-bold tracking-tight flex items-center"
            style={{ fontFamily: 'var(--font-display)', color: COLOR.inkText }}
          >
            <List className="h-5 w-5 mr-2" style={{ color: COLOR.marigold }} />
            Syllabus ({totalLessons} lessons)
          </h2>

          <div className="space-y-4">
            {sections.map((sec) => (
              <div
                key={sec._id}
                className="bg-white border rounded-sm overflow-hidden shadow-sm"
                style={{ borderTop: `2px dashed ${COLOR.chalk2}` }}
              >
                <div className="p-5 border-b border-[#F0EEE3] bg-[#FAF9F4] flex justify-between items-center">
                  <h3 className="font-semibold text-sm text-slate-800">
                    {sec.title}
                  </h3>
                  <span className="text-[10px] text-slate-400 font-medium" style={{ fontFamily: 'var(--font-mono)' }}>
                    {sec.lessons?.length || 0} Lessons
                  </span>
                </div>
                <div className="divide-y divide-[#F0EEE3]">
                  {sec.lessons?.map((les) => (
                    <div key={les._id} className="p-4 flex items-center justify-between text-slate-500 text-xs pl-6">
                      <div className="flex items-center space-x-3">
                        <Lock className="h-4 w-4 text-slate-400 shrink-0" />
                        <span className="text-slate-700 font-medium">{les.title}</span>
                      </div>
                      <span className="text-[9px] font-bold bg-[#FAF9F4] border border-[#DCDCDC] px-2 py-0.5 rounded-sm uppercase tracking-widest flex items-center" style={{ fontFamily: 'var(--font-mono)', color: COLOR.sage }}>
                        Locked
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Render enrolled active workspace (split screens)
  return (
    <div className="flex flex-col lg:flex-row gap-8 py-4" style={{ fontFamily: 'var(--font-body)', color: COLOR.inkText }}>
      {/* Left Column: Player & Metadata */}
      <div className="flex-1 space-y-6">
        <EmbeddedVideoPlayer
          key={activeLessonDetails?._id || activeLesson || 'no-lesson'}
          videoUrl={activeLessonDetails?.videoUrl}
          title={activeLessonDetails?.title || course?.title}
        />

        <div 
          className="p-6 bg-white border rounded-sm shadow-sm space-y-4"
          style={{ borderTop: `2px dashed ${COLOR.chalk2}` }}
        >
          <div className="flex justify-between items-start gap-4">
            <div>
              <h1 
                className="text-xl font-bold leading-snug"
                style={{ fontFamily: 'var(--font-display)', color: COLOR.inkText }}
              >
                {activeLessonDetails?.title || 'Select a lesson to begin learning'}
              </h1>
              <p className="text-xs text-slate-550 mt-2 leading-relaxed">
                {activeLessonDetails?.description || course?.description}
              </p>
            </div>
            {activeLesson && (
              <button
                onClick={(e) => handleToggleComplete(e, activeLesson)}
                className="px-4 py-2 border rounded-sm flex items-center justify-center shrink-0 transition-all cursor-pointer"
                style={{
                  background: enrollment?.completedLessons?.includes(activeLesson) ? 'rgba(16, 185, 129, 0.05)' : 'rgba(232, 163, 61, 0.05)',
                  borderColor: enrollment?.completedLessons?.includes(activeLesson) ? 'rgba(16, 185, 129, 0.2)' : 'rgba(232, 163, 61, 0.2)',
                  color: enrollment?.completedLessons?.includes(activeLesson) ? '#10B981' : COLOR.marigold,
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em'
                }}
                title="Toggle completion status"
              >
                {enrollment?.completedLessons?.includes(activeLesson) ? (
                  <span className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center mr-2 shrink-0">
                    <Check size={10} strokeWidth={3} />
                  </span>
                ) : (
                  <span className="w-4 h-4 rounded-full border border-current mr-2 shrink-0" />
                )}
                <span>
                  {enrollment?.completedLessons?.includes(activeLesson) ? 'Completed' : 'Mark Done'}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Right Column: Syllabus checklist */}
      <div className="w-full lg:w-96 shrink-0 space-y-6">
        {/* Progress Card */}
        <div 
          className="relative rounded-sm overflow-hidden p-5 shadow-lg border border-transparent"
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

          <div className="relative z-10 space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold tracking-wider uppercase opacity-80 text-white" style={{ fontFamily: 'var(--font-mono)' }}>Course Progress</span>
              <span className="font-bold text-white" style={{ fontFamily: 'var(--font-mono)' }}>{enrollment?.progress || 0}%</span>
            </div>
            <div className="w-full bg-[#141F1B] h-2 rounded-sm overflow-hidden border border-[#2A3831]">
              <div
                className="h-full rounded-sm transition-all duration-500"
                style={{ width: `${enrollment?.progress || 0}%`, background: COLOR.marigold }}
              />
            </div>
            <div className="flex justify-between items-center text-[10px] text-slate-300 font-light pt-1">
              <span style={{ fontFamily: 'var(--font-mono)' }}>
                {enrollment?.completedLessons?.length || 0} of {totalLessons} completed
              </span>
            </div>
          </div>
        </div>

        {/* Syllabus accordion checklist */}
        <div className="space-y-4">
          <h2 
            className="text-sm font-bold tracking-wider uppercase"
            style={{ color: COLOR.inkText }}
          >
            Course Syllabus
          </h2>

          <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
            {sections.map((sec) => {
              const isExpanded = expandedSections[sec._id];
              return (
                <div
                  key={sec._id}
                  className="bg-white border rounded-sm overflow-hidden shadow-sm"
                  style={{ borderTop: `2px dashed ${COLOR.chalk2}` }}
                >
                  {/* Section Title */}
                  <div
                    onClick={() => toggleSection(sec._id)}
                    className="p-4 border-b border-[#F0EEE3] bg-[#FAF9F4] flex justify-between items-center cursor-pointer select-none"
                  >
                    <h3 className="font-semibold text-xs text-slate-750">
                      {sec.title}
                    </h3>
                    <span className="text-[10px] text-slate-400 font-medium" style={{ fontFamily: 'var(--font-mono)' }}>
                      {sec.lessons?.length || 0} Lessons
                    </span>
                  </div>

                  {/* Section Lessons list */}
                  {isExpanded && (
                    <div className="divide-y divide-[#F0EEE3]">
                      {sec.lessons?.map((les) => {
                        const isSelected = activeLesson === les._id;
                        const isCompleted = enrollment?.completedLessons?.includes(les._id);
                        return (
                          <div
                            key={les._id}
                            onClick={() => handleSelectLesson(les._id)}
                            className="p-3.5 flex items-center justify-between text-xs cursor-pointer transition-colors"
                            style={{
                              background: isSelected ? 'rgba(232, 163, 61, 0.05)' : 'transparent',
                              borderLeft: isSelected ? `4px solid ${COLOR.marigold}` : '4px solid transparent',
                              fontWeight: isSelected ? 'semibold' : 'normal'
                            }}
                          >
                            <div className="flex items-center space-x-3 min-w-0 flex-1">
                              {/* Selection/Checkbox Indicator */}
                              <button
                                onClick={(e) => handleToggleComplete(e, les._id)}
                                className="text-slate-450 hover:text-[#E8A33D] shrink-0 transition-colors cursor-pointer"
                                aria-label="Toggle completion check"
                              >
                                {isCompleted ? (
                                  <span className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
                                    <Check size={10} strokeWidth={3} />
                                  </span>
                                ) : (
                                  <span className="w-4 h-4 rounded-full border border-slate-300 flex items-center justify-center shrink-0" />
                                )}
                              </button>

                              <span className="truncate pr-2">{les.title}</span>
                            </div>

                            <PlayCircle className="h-4.5 w-4.5 shrink-0" style={{ color: isSelected ? COLOR.marigold : 'rgba(28, 37, 33, 0.2)' }} />
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
