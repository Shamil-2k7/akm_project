'use client';

import { Play } from 'lucide-react';

export default function EmbeddedVideoPlayer({ videoUrl, title = 'Course Lesson' }) {
  if (!videoUrl) {
    return (
      <div className="aspect-video w-full flex flex-col items-center justify-center bg-slate-950 rounded-2xl border border-slate-800 text-slate-400 p-6">
        <div className="h-16 w-16 rounded-full bg-slate-900 flex items-center justify-center border border-slate-800 text-indigo-500 mb-4 shadow-inner">
          <Play className="h-6 w-6 opacity-40" />
        </div>
        <p className="font-medium text-sm tracking-wide">Video Unavailable</p>
        <p className="text-xs text-slate-500 mt-1">Please make sure you are enrolled in the course.</p>
      </div>
    );
  }

  // Append strict parameters to hide controls, title, annotations, key board controls, and fullscreen buttons
  const separator = videoUrl.includes('?') ? '&' : '?';
  const cleanUrl = `${videoUrl}${separator}rel=0&modestbranding=1&showinfo=0&controls=0&disablekb=1&fs=0&iv_load_policy=3`;

  return (
    <div className="w-full bg-slate-950 rounded-2xl border border-slate-200/10 dark:border-slate-800 overflow-hidden shadow-2xl transition-all duration-300">
      <div className="relative w-full aspect-video">
        <iframe
          src={cleanUrl}
          className="absolute top-0 left-0 w-full h-full"
          frameBorder="0"
        />
      </div>
    </div>
  );
}
