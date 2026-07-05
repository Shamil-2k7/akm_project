'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiRequest } from '../../../../utils/api';
import Modal from '../../../../components/Modal';
import { Plus, Edit2, Trash2, FolderPlus, Film, ShieldAlert, ChevronLeft, LayoutGrid, AlertCircle } from 'lucide-react';

export default function AdminCourseWorkspace() {
  const { courseId } = useParams();
  const router = useRouter();

  const [course, setCourse] = useState(null);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals management
  const [activeModal, setActiveModal] = useState(null); // 'section' or 'lesson'
  const [editingSection, setEditingSection] = useState(null);
  const [editingLesson, setEditingLesson] = useState(null);
  const [targetSectionId, setTargetSectionId] = useState(null);

  // Section Form state
  const [sectionTitle, setSectionTitle] = useState('');
  const [sectionOrder, setSectionOrder] = useState(0);

  // Lesson Form state
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonDescription, setLessonDescription] = useState('');
  const [lessonVideoUrl, setLessonVideoUrl] = useState('');
  const [lessonOrder, setLessonOrder] = useState(0);

  const [formLoading, setFormLoading] = useState(false);

  const fetchCourseData = async () => {
    try {
      const data = await apiRequest(`/courses/${courseId}`);
      setCourse(data.course);
      setSections(data.sections);
    } catch (err) {
      setError(err.message || 'Failed to fetch syllabus data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourseData();
  }, [courseId]);

  // Section Form Handlers
  const openAddSection = () => {
    setEditingSection(null);
    setSectionTitle('');
    setSectionOrder(sections.length);
    setActiveModal('section');
  };

  const openEditSection = (section) => {
    setEditingSection(section);
    setSectionTitle(section.title);
    setSectionOrder(section.order || 0);
    setActiveModal('section');
  };

  const handleSectionSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setError('');

    try {
      if (editingSection) {
        // Edit section
        await apiRequest(`/sections/${editingSection._id}`, {
          method: 'PUT',
          body: JSON.stringify({ title: sectionTitle, order: sectionOrder }),
        });
      } else {
        // Create section
        await apiRequest('/sections', {
          method: 'POST',
          body: JSON.stringify({ courseId, title: sectionTitle, order: sectionOrder }),
        });
      }
      fetchCourseData();
      setActiveModal(null);
    } catch (err) {
      setError(err.message || 'Failed to save section.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteSection = async (sectionId) => {
    if (
      !window.confirm(
        'Are you sure you want to delete this section? This will cascade delete ALL lessons within this section.'
      )
    ) {
      return;
    }

    try {
      await apiRequest(`/sections/${sectionId}`, { method: 'DELETE' });
      fetchCourseData();
    } catch (err) {
      setError(err.message || 'Failed to delete section.');
    }
  };

  // Lesson Form Handlers
  const openAddLesson = (sectionId, secLessonsLength = 0) => {
    setTargetSectionId(sectionId);
    setEditingLesson(null);
    setLessonTitle('');
    setLessonDescription('');
    setLessonVideoUrl('');
    setLessonOrder(secLessonsLength);
    setActiveModal('lesson');
  };

  const openEditLesson = (lesson) => {
    setTargetSectionId(lesson.sectionId);
    setEditingLesson(lesson);
    setLessonTitle(lesson.title);
    setLessonDescription(lesson.description || '');
    setLessonVideoUrl(lesson.videoUrl || '');
    setLessonOrder(lesson.order || 0);
    setActiveModal('lesson');
  };

  const handleLessonSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setError('');

    const body = {
      courseId,
      sectionId: targetSectionId,
      title: lessonTitle,
      description: lessonDescription,
      videoUrl: lessonVideoUrl,
      order: lessonOrder,
    };

    try {
      if (editingLesson) {
        // Edit lesson
        await apiRequest(`/lessons/${editingLesson._id}`, {
          method: 'PUT',
          body: JSON.stringify(body),
        });
      } else {
        // Create lesson
        await apiRequest('/lessons', {
          method: 'POST',
          body: JSON.stringify(body),
        });
      }
      fetchCourseData();
      setActiveModal(null);
    } catch (err) {
      setError(err.message || 'Failed to save lesson.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteLesson = async (lessonId) => {
    if (!window.confirm('Are you sure you want to delete this lesson?')) return;
    try {
      await apiRequest(`/lessons/${lessonId}`, { method: 'DELETE' });
      fetchCourseData();
    } catch (err) {
      setError(err.message || 'Failed to delete lesson.');
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
      {/* Back button and page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <button
            onClick={() => router.push('/admin/courses')}
            className="flex items-center text-xs text-slate-400 hover:text-indigo-500 font-semibold transition-colors cursor-pointer group"
          >
            <ChevronLeft className="h-4 w-4 mr-1 group-hover:-translate-x-0.5 transition-transform" />
            Back to Courses
          </button>
          <h1 className="text-xl md:text-2xl font-extrabold text-slate-800 dark:text-slate-100 tracking-wide flex items-center">
            Syllabus Manager: {course?.title}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-light">
            Organize modules and paste YouTube links to populate courses with lectures.
          </p>
        </div>

        <button
          onClick={openAddSection}
          className="px-5 py-3 bg-indigo-600 hover:bg-indigo-550 text-white rounded-xl text-xs font-semibold tracking-wide shadow-md flex items-center justify-center cursor-pointer transition-all hover:scale-[1.02] shrink-0"
        >
          <FolderPlus className="h-4 w-4 mr-1.5" />
          Add Section
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-950/20 border border-red-900/30 text-red-400 text-xs flex items-center space-x-2.5">
          <ShieldAlert className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Syllabus Tree Grid */}
      {sections.length === 0 ? (
        <div className="text-center p-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl shadow-sm flex flex-col items-center justify-center space-y-4">
          <div className="p-4 bg-slate-100 dark:bg-slate-800/50 text-slate-400 dark:text-slate-500 rounded-full border border-slate-205 dark:border-slate-800">
            <LayoutGrid className="h-8 w-8" />
          </div>
          <p className="text-slate-700 dark:text-slate-300 font-semibold text-sm">
            Syllabus is Empty
          </p>
          <p className="text-xs text-slate-400 max-w-xs font-light">
            There are no sections in this course. Click the "Add Section" button to create one.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {sections.map((sec) => (
            <div
              key={sec._id}
              className="bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800/80 rounded-2xl overflow-hidden shadow-sm"
            >
              {/* Section Header bar */}
              <div className="p-5 border-b border-slate-100 dark:border-slate-805 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center space-x-3.5">
                  <span className="h-6 w-6 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/30 text-indigo-500 text-xs font-bold flex items-center justify-center">
                    {sec.order}
                  </span>
                  <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">
                    {sec.title}
                  </h3>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => openAddLesson(sec._id, sec.lessons?.length || 0)}
                    className="px-3.5 py-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-850 rounded-xl text-[10px] font-semibold text-slate-650 dark:text-slate-350 transition-colors flex items-center cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" /> Add Lesson
                  </button>
                  <button
                    onClick={() => openEditSection(sec)}
                    className="p-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-850 rounded-xl text-slate-500 hover:text-slate-700 dark:hover:text-slate-350 transition-colors cursor-pointer"
                    title="Edit Section Name"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteSection(sec._id)}
                    className="p-2 border border-red-200 dark:border-red-950/40 hover:bg-red-500/5 text-red-400 hover:text-red-550 transition-colors rounded-xl cursor-pointer"
                    title="Delete Section"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Nested Lessons lists */}
              <div className="divide-y divide-slate-100 dark:divide-slate-805">
                {(!sec.lessons || sec.lessons.length === 0) ? (
                  <p className="p-4 text-xs text-slate-400 flex items-center font-light">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    No lessons in this section. Click "Add Lesson" to build contents.
                  </p>
                ) : (
                  sec.lessons.map((les) => (
                    <div
                      key={les._id}
                      className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pl-8"
                    >
                      <div className="flex items-start space-x-3.5 min-w-0">
                        <div className="p-2 bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-500 border border-indigo-100/40 dark:border-indigo-900/20 rounded-lg shrink-0 mt-0.5">
                          <Film className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-semibold text-slate-750 dark:text-slate-250 text-xs truncate">
                            {les.title}
                          </h4>
                          {les.description && (
                            <p className="text-[10px] text-slate-450 dark:text-slate-450 truncate mt-0.5 font-light">
                              {les.description}
                            </p>
                          )}
                          <span className="inline-block text-[9px] bg-slate-100 dark:bg-slate-950 text-slate-450 px-2 py-0.5 rounded border border-slate-205 dark:border-slate-805 font-mono truncate mt-1 text-slate-500 select-all">
                            {les.videoUrl}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center">
                        <button
                          onClick={() => openEditLesson(les)}
                          className="p-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-850 rounded-xl text-slate-500 hover:text-slate-700 dark:hover:text-slate-350 transition-colors cursor-pointer"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteLesson(les._id)}
                          className="p-2 border border-red-200 dark:border-red-950/40 hover:bg-red-500/5 text-red-400 hover:text-red-550 transition-colors rounded-xl cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Section Creation Modal */}
      <Modal
        isOpen={activeModal === 'section'}
        onClose={() => setActiveModal(null)}
        title={editingSection ? 'Edit Section Details' : 'Create Section'}
      >
        <form onSubmit={handleSectionSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
              Section Title
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Chapter 1: Introduction"
              value={sectionTitle}
              onChange={(e) => setSectionTitle(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-805 hover:border-slate-300 focus:border-indigo-500 rounded-xl py-3 px-4 text-xs text-slate-800 dark:text-slate-100 outline-none transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
              Sorting Order Number
            </label>
            <input
              type="number"
              required
              value={sectionOrder}
              onChange={(e) => setSectionOrder(parseInt(e.target.value) || 0)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-805 hover:border-slate-300 focus:border-indigo-500 rounded-xl py-3 px-4 text-xs text-slate-800 dark:text-slate-100 outline-none transition-all"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100 dark:border-slate-805">
            <button
              type="button"
              onClick={() => setActiveModal(null)}
              className="px-4 py-3 border border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-850 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={formLoading}
              className="px-5 py-3 bg-indigo-600 hover:bg-indigo-550 text-white rounded-xl text-xs font-semibold tracking-wide shadow-md flex items-center transition-colors cursor-pointer"
            >
              {formLoading ? (
                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                'Save Section'
              )}
            </button>
          </div>
        </form>
      </Modal>

      {/* Lesson Creation Modal */}
      <Modal
        isOpen={activeModal === 'lesson'}
        onClose={() => setActiveModal(null)}
        title={editingLesson ? 'Edit Lesson Details' : 'Add New Lesson'}
      >
        <form onSubmit={handleLessonSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
              Lesson Title
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Setting up development environment"
              value={lessonTitle}
              onChange={(e) => setLessonTitle(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-805 hover:border-slate-300 focus:border-indigo-500 rounded-xl py-3 px-4 text-xs text-slate-800 dark:text-slate-100 outline-none transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
              Lesson Description (Optional)
            </label>
            <textarea
              rows="3"
              placeholder="Provide a brief summary of what will be learned in this lecture..."
              value={lessonDescription}
              onChange={(e) => setLessonDescription(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-805 hover:border-slate-300 focus:border-indigo-500 rounded-xl py-3 px-4 text-xs text-slate-800 dark:text-slate-100 outline-none transition-all resize-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
              YouTube Video URL
            </label>
            <input
              type="url"
              required
              placeholder="e.g. https://www.youtube.com/watch?v=..."
              value={lessonVideoUrl}
              onChange={(e) => setLessonVideoUrl(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-805 hover:border-slate-300 focus:border-indigo-500 rounded-xl py-3 px-4 text-xs text-slate-800 dark:text-slate-100 outline-none transition-all"
            />
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-light block leading-normal pt-1">
              Supports standard watch URLs, shorts, or mobile share links. Stored as safe embed frames on backend.
            </span>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
              Sorting Order Number
            </label>
            <input
              type="number"
              required
              value={lessonOrder}
              onChange={(e) => setLessonOrder(parseInt(e.target.value) || 0)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-805 hover:border-slate-300 focus:border-indigo-500 rounded-xl py-3 px-4 text-xs text-slate-800 dark:text-slate-100 outline-none transition-all"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100 dark:border-slate-805">
            <button
              type="button"
              onClick={() => setActiveModal(null)}
              className="px-4 py-3 border border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-850 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={formLoading}
              className="px-5 py-3 bg-indigo-600 hover:bg-indigo-550 text-white rounded-xl text-xs font-semibold tracking-wide shadow-md flex items-center transition-colors cursor-pointer"
            >
              {formLoading ? (
                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                'Save Lesson'
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
