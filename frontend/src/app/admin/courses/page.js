'use client';

import { useState, useEffect } from 'react';
import { apiRequest } from '../../../utils/api';
import CourseCard from '../../../components/CourseCard';
import Modal from '../../../components/Modal';
import { Plus, BookOpen, ShieldAlert, Check } from 'lucide-react';

export default function AdminCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal control states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [thumbnail, setThumbnail] = useState('');
  const [isPublished, setIsPublished] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  const fetchCourses = async () => {
    try {
      const data = await apiRequest('/courses');
      setCourses(data);
    } catch (err) {
      setError(err.message || 'Failed to load courses.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const openAddModal = () => {
    setEditingCourse(null);
    setTitle('');
    setDescription('');
    setThumbnail('');
    setIsPublished(false);
    setIsModalOpen(true);
  };

  const openEditModal = (course) => {
    setEditingCourse(course);
    setTitle(course.title);
    setDescription(course.description);
    setThumbnail(course.thumbnail || '');
    setIsPublished(course.isPublished);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingCourse(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setError('');

    const body = { title, description, thumbnail, isPublished };

    try {
      if (editingCourse) {
        // Edit course
        await apiRequest(`/courses/${editingCourse._id}`, {
          method: 'PUT',
          body: JSON.stringify(body),
        });
      } else {
        // Create course
        await apiRequest('/courses', {
          method: 'POST',
          body: JSON.stringify(body),
        });
      }

      fetchCourses();
      handleModalClose();
    } catch (err) {
      setError(err.message || 'Failed to save course.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!editingCourse) return;
    if (
      !window.confirm(
        'Warning! Deleting this course will permanently delete all nested Sections, Lessons, and Enrollments. Do you want to proceed?'
      )
    ) {
      return;
    }

    setFormLoading(true);
    try {
      await apiRequest(`/courses/${editingCourse._id}`, { method: 'DELETE' });
      fetchCourses();
      handleModalClose();
    } catch (err) {
      setError(err.message || 'Failed to delete course.');
    } finally {
      setFormLoading(false);
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
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 tracking-wide">
            Course Management
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-light">
            Create, edit, and organize courses, sections, and lesson contents.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="px-5 py-3 bg-indigo-600 hover:bg-indigo-550 text-white rounded-xl text-xs font-semibold tracking-wide shadow-md flex items-center justify-center cursor-pointer transition-all hover:scale-[1.02] shrink-0"
        >
          <Plus className="h-4 w-4 mr-1.5" />
          Create New Course
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-950/20 border border-red-900/30 text-red-400 text-xs flex items-center space-x-2.5">
          <ShieldAlert className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Courses Grid */}
      {courses.length === 0 ? (
        <div className="text-center p-12 bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800/80 rounded-2xl shadow-sm flex flex-col items-center justify-center space-y-4">
          <div className="p-4 bg-slate-100 dark:bg-slate-800/50 text-slate-400 dark:text-slate-500 rounded-full border border-slate-205 dark:border-slate-800">
            <BookOpen className="h-8 w-8" />
          </div>
          <p className="text-slate-700 dark:text-slate-300 font-semibold text-sm">
            No Courses Created
          </p>
          <p className="text-xs text-slate-400 max-w-xs font-light text-center">
            Getting started is simple! Click the "Create New Course" button above to publish your first content.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <CourseCard
              key={course._id}
              course={course}
              isEnrolled={false}
              progress={0}
              isAdmin={true}
              onEdit={() => openEditModal(course)}
            />
          ))}
        </div>
      )}

      {/* Add / Edit Course Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        title={editingCourse ? 'Edit Course Details' : 'Create New Course'}
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
              Course Title
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Master React in 30 Days"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-805 hover:border-slate-300 focus:border-indigo-500 rounded-xl py-3 px-4 text-xs text-slate-800 dark:text-slate-100 outline-none transition-all"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
              Course Description
            </label>
            <textarea
              required
              rows="4"
              placeholder="Provide a comprehensive course summary..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-805 hover:border-slate-300 focus:border-indigo-500 rounded-xl py-3 px-4 text-xs text-slate-800 dark:text-slate-100 outline-none transition-all resize-none"
            />
          </div>

          {/* Thumbnail URL */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
              Thumbnail Image URL (Optional)
            </label>
            <input
              type="url"
              placeholder="https://example.com/image.png"
              value={thumbnail}
              onChange={(e) => setThumbnail(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-805 hover:border-slate-300 focus:border-indigo-500 rounded-xl py-3 px-4 text-xs text-slate-800 dark:text-slate-100 outline-none transition-all"
            />
          </div>

          {/* isPublished Checkbox */}
          <div className="flex items-center space-x-3 p-1">
            <label className="relative flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-10 h-6 bg-slate-200 rounded-full peer peer-focus:ring-1 peer-focus:ring-indigo-500 dark:bg-slate-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
            </label>
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Publish course (visible to students)
            </span>
          </div>

          {/* Actions Button Row */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-105 dark:border-slate-805">
            {editingCourse && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={formLoading}
                className="px-4 py-3 border border-red-500/30 bg-red-500/5 hover:bg-red-500/10 text-red-500 hover:text-red-400 rounded-xl text-xs font-semibold transition-colors mr-auto cursor-pointer"
              >
                Delete Course
              </button>
            )}

            <button
              type="button"
              onClick={handleModalClose}
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
                'Save Changes'
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
