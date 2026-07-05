'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Fraunces, Inter, IBM_Plex_Mono } from 'next/font/google';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../utils/api';
import { ArrowRight, Check, BookOpen } from 'lucide-react';

/* ---------------------------------------------------------------
   Type system
   Display: Fraunces — a serif with real character, used sparingly
   Body:    Inter — quiet workhorse for paragraphs and UI
   Utility: IBM Plex Mono — course codes, eyebrows, small labels
   --------------------------------------------------------------- */
const fraunces = Fraunces({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-display',
});
const inter = Inter({ subsets: ['latin'], variable: '--font-body' });
const plexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['500'],
  variable: '--font-mono',
});

/* ---------------------------------------------------------------
   Color tokens — chalkboard green + chalk white + marigold accent
   --------------------------------------------------------------- */
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

function CourseCode({ index }) {
  return (
    <span
      className="text-[11px] tracking-[0.2em] uppercase"
      style={{ fontFamily: 'var(--font-mono)', color: COLOR.sage }}
    >
      Course — {String(index + 1).padStart(2, '0')}
    </span>
  );
}

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [courses, setCourses] = useState([]);
  const [fetchingCourses, setFetchingCourses] = useState(true);

  useEffect(() => {
    if (!loading && user) {
      if (user.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/student');
      }
    }
  }, [user, loading, router]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const data = await apiRequest('/courses');
        setCourses(data);
      } catch (err) {
        console.error('Failed to fetch courses:', err);
      } finally {
        setFetchingCourses(false);
      }
    };
    fetchCourses();
  }, []);

  if (loading) {
    return (
      <div
        className="flex-1 flex items-center justify-center min-h-screen"
        style={{ background: COLOR.ink }}
      >
        <div
          className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2"
          style={{ borderColor: COLOR.marigold }}
        />
      </div>
    );
  }

  return (
    <div
      className={`${fraunces.variable} ${inter.variable} ${plexMono.variable} min-h-screen flex flex-col selection:bg-[#E8A33D]/30`}
      style={{ background: COLOR.chalk, color: COLOR.inkText, fontFamily: 'var(--font-body)' }}
    >
      {/* ============ HERO ============ */}
      <div
        className="relative flex flex-col justify-between overflow-hidden min-h-[640px]"
        style={{ background: COLOR.ink }}
      >
        {/* chalk-dust texture */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.09] pointer-events-none" xmlns="http://www.w3.org/2000/svg">
          <filter id="chalkGrain">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
            <feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.6 0" />
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

        {/* Header */}
        <header className="relative z-10 max-w-7xl mx-auto w-full px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <svg width="30" height="30" viewBox="0 0 32 32" fill="none">
              <path
                d="M6 11.5 16 7l10 4.5-10 4.5-10-4.5Z"
                stroke={COLOR.chalk}
                strokeWidth="1.6"
                strokeLinejoin="round"
              />
              <path d="M9.5 13v6.5c0 1.8 3 3.2 6.5 3.2s6.5-1.4 6.5-3.2V13" stroke={COLOR.chalk} strokeWidth="1.6" />
              <path d="M25 12v6" stroke={COLOR.marigold} strokeWidth="1.6" strokeLinecap="round" />
              <circle cx="25" cy="20" r="1.4" fill={COLOR.marigold} />
            </svg>
            <span
              className="text-xl tracking-wide"
              style={{ fontFamily: 'var(--font-display)', fontWeight: 600, color: COLOR.chalk }}
            >
              AKM Academy
            </span>
          </div>

          <nav
            className="hidden md:flex items-center gap-9 text-[13px] uppercase tracking-[0.16em]"
            style={{ color: 'rgba(250,249,244,0.85)', fontFamily: 'var(--font-mono)' }}
          >
            <Link href="/" className="hover:text-[#E8A33D] transition-colors">Home</Link>
            <Link href="#courses" className="hover:text-[#E8A33D] transition-colors">Courses</Link>
            <Link href="#about" className="hover:text-[#E8A33D] transition-colors">About</Link>
          </nav>

          <Link
            href="/login"
            className="px-5 py-2 rounded-sm text-[12px] uppercase tracking-[0.16em] font-medium border transition-colors"
            style={{ borderColor: COLOR.chalk, color: COLOR.chalk, fontFamily: 'var(--font-mono)' }}
          >
            Log in
          </Link>
        </header>

        {/* Hero copy */}
        <div className="relative z-10 max-w-5xl mx-auto w-full px-6 py-24 flex-1 flex flex-col justify-center">
          <p
            className="text-[13px] uppercase tracking-[0.3em] mb-5"
            style={{ color: COLOR.marigold, fontFamily: 'var(--font-mono)' }}
          >
            A place to actually keep up
          </p>
          <h1
            className="text-5xl sm:text-6xl md:text-7xl leading-[1.06] max-w-3xl"
            style={{ fontFamily: 'var(--font-display)', fontWeight: 600, color: COLOR.chalk }}
          >
            Study like someone
            <br />
            <span className="relative inline-block italic" style={{ fontWeight: 500 }}>
              is keeping notes
              <svg
                className="absolute left-0 -bottom-2 w-full"
                height="10"
                viewBox="0 0 300 10"
                preserveAspectRatio="none"
              >
                <path d="M2 7 C 80 2, 220 2, 298 7" stroke={COLOR.marigold} strokeWidth="4" fill="none" strokeLinecap="round" />
              </svg>
            </span>
            .
          </h1>
          <p
            className="text-lg mt-7 max-w-xl leading-relaxed"
            style={{ color: 'rgba(250,249,244,0.75)' }}
          >
            AKM Academy is a study platform built around real courses, real
            progress, and a dashboard that doesn't get in your way.
          </p>

          <div className="flex flex-wrap items-center gap-4 mt-10">
            <Link
              href="#courses"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-sm text-sm font-semibold transition-transform hover:-translate-y-0.5"
              style={{ background: COLOR.marigold, color: COLOR.inkDeep }}
            >
              Browse courses <ArrowRight size={16} strokeWidth={2.5} />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-sm text-sm font-semibold border transition-colors hover:bg-white/5"
              style={{ borderColor: 'rgba(250,249,244,0.4)', color: COLOR.chalk }}
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>

      {/* ============ ABOUT ============ */}
      <section id="about" className="py-24 max-w-6xl mx-auto px-6 w-full">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-14 items-center">
          <div className="md:col-span-6 space-y-6">
            <span
              className="text-[13px] uppercase tracking-[0.3em]"
              style={{ color: COLOR.sage, fontFamily: 'var(--font-mono)' }}
            >
              About
            </span>
            <h2
              className="text-4xl leading-[1.15]"
              style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}
            >
              One dashboard, every subject, no clutter.
            </h2>
            <p className="text-base leading-relaxed" style={{ color: '#4A5650' }}>
              AKM Academy brings your courses, notes, and progress into a single
              calm workspace. Learn new subjects, plan your study time, or
              work through material alongside classmates — it's built to get
              out of your way and let the studying happen.
            </p>
          </div>

          <div className="md:col-span-6 flex justify-center">
            <svg viewBox="0 0 420 340" className="w-full max-w-[380px] h-auto">
              {/* open book, line-art */}
              <path
                d="M40 60 C 90 45, 150 45, 200 65 L200 260 C 150 240, 90 240, 40 255 Z"
                fill="none" stroke={COLOR.inkText} strokeWidth="2"
              />
              <path
                d="M380 60 C 330 45, 270 45, 220 65 L220 260 C 270 240, 330 240, 380 255 Z"
                fill="none" stroke={COLOR.inkText} strokeWidth="2"
              />
              <path d="M55 85 L185 78 M55 110 L185 103 M55 135 L165 128" stroke={COLOR.sage} strokeWidth="1.6" strokeLinecap="round" />
              <path d="M365 85 L235 78 M365 110 L235 103 M365 135 L255 128" stroke={COLOR.sage} strokeWidth="1.6" strokeLinecap="round" />

              {/* graduation cap accent, marigold */}
              <path
                d="M135 20 L210 45 L285 20 L210 -5 Z"
                transform="translate(0,10)"
                fill="none" stroke={COLOR.marigold} strokeWidth="2.2" strokeLinejoin="round"
              />
              <line x1="285" y1="30" x2="285" y2="60" stroke={COLOR.marigold} strokeWidth="2.2" />
              <circle cx="285" cy="63" r="3.4" fill={COLOR.marigold} />

              {/* underline flourish */}
              <path d="M60 300 C 150 290, 270 290, 360 300" stroke={COLOR.chalk2} strokeWidth="10" strokeLinecap="round" />
            </svg>
          </div>
        </div>
      </section>

      {/* ============ COURSES ============ */}
      <section id="courses" className="py-24" style={{ background: COLOR.ink }}>
        <div className="max-w-6xl mx-auto px-6 w-full">
          <div className="max-w-2xl mb-16">
            <span
              className="text-[13px] uppercase tracking-[0.3em]"
              style={{ color: COLOR.marigold, fontFamily: 'var(--font-mono)' }}
            >
              Catalog
            </span>
            <h2
              className="text-4xl mt-3"
              style={{ fontFamily: 'var(--font-display)', fontWeight: 600, color: COLOR.chalk }}
            >
              Our courses
            </h2>
          </div>

          {fetchingCourses ? (
            <div className="flex justify-center py-12">
              <div
                className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2"
                style={{ borderColor: COLOR.marigold }}
              />
            </div>
          ) : courses.length === 0 ? (
            <p className="text-center text-sm" style={{ color: 'rgba(250,249,244,0.55)' }}>
              No courses currently available.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {courses.map((course, i) => (
                <div
                  key={course._id}
                  className="group relative flex flex-col rounded-sm p-6 transition-all duration-300 hover:-translate-y-1.5 hover:rotate-[-0.6deg]"
                  style={{
                    background: COLOR.chalk,
                    borderTop: `2px dashed ${COLOR.chalk2}`,
                    boxShadow: '0 1px 0 rgba(0,0,0,0.15)',
                  }}
                >
                  {/* punch holes, index-card motif */}
                  <div className="absolute -top-1.5 left-6 w-3 h-3 rounded-full" style={{ background: COLOR.ink }} />
                  <div className="absolute -top-1.5 right-6 w-3 h-3 rounded-full" style={{ background: COLOR.ink }} />

                  <div className="flex items-center justify-between mb-4">
                    <CourseCode index={i} />
                    <span
                      className="text-xs font-semibold px-2.5 py-1 rounded-sm"
                      style={{ background: COLOR.marigold, color: COLOR.inkDeep }}
                    >
                      {course.fee !== undefined ? (course.fee === 0 ? 'Free' : `$${course.fee}`) : 'Free'}
                    </span>
                  </div>

                  <div className="relative h-40 w-full rounded-sm overflow-hidden mb-4" style={{ background: COLOR.chalk2 }}>
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src =
                          'https://images.unsplash.com/photo-1542744094-3a31f103e35f?w=600&auto=format&fit=crop&q=60';
                      }}
                    />
                  </div>

                  <h3
                    className="text-lg leading-snug mb-2"
                    style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}
                  >
                    {course.title}
                  </h3>
                  <p className="text-sm leading-relaxed flex-1 line-clamp-3" style={{ color: '#5B665F' }}>
                    {course.description}
                  </p>

                  <Link
                    href="/login"
                    className="mt-5 inline-flex items-center justify-center gap-1.5 w-full py-2.5 rounded-sm text-xs font-semibold uppercase tracking-wide transition-colors"
                    style={{ background: COLOR.inkText, color: COLOR.chalk }}
                  >
                    View details <ArrowRight size={13} strokeWidth={2.5} />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ============ WHY CHOOSE US ============ */}
      <section className="py-24 max-w-6xl mx-auto px-6 w-full">
        <div className="mb-16 max-w-xl">
          <span
            className="text-[13px] uppercase tracking-[0.3em]"
            style={{ color: COLOR.sage, fontFamily: 'var(--font-mono)' }}
          >
            The syllabus
          </span>
          <h2
            className="text-4xl mt-3"
            style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}
          >
            Why students stick around
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-14 items-start">
          <div className="md:col-span-5 flex justify-center">
            <div
              className="h-56 w-56 rounded-full flex flex-col items-center justify-center text-center p-6"
              style={{ border: `2px dashed ${COLOR.inkText}` }}
            >
              <BookOpen size={34} color={COLOR.marigold} strokeWidth={1.8} />
              <span
                className="text-sm uppercase tracking-[0.2em] mt-3"
                style={{ fontFamily: 'var(--font-mono)' }}
              >
                Built for<br />studying
              </span>
            </div>
          </div>

          <div className="md:col-span-7">
            <ul className="space-y-7">
              {[
                {
                  title: 'Learn at your own pace',
                  body: 'Watch lessons and study whenever you have time, day or night.',
                },
                {
                  title: 'All-in-one dashboard',
                  body: 'See your courses, assignments, and messages all in one simple place.',
                },
                {
                  title: 'Verified resources',
                  body: 'All study notes and project guides are checked and high-quality.',
                },
                {
                  title: '100% free to start',
                  body: 'Create an account and start learning without paying anything.',
                },
              ].map((item) => (
                <li key={item.title} className="flex items-start gap-4">
                  <span
                    className="mt-0.5 flex items-center justify-center w-5 h-5 rounded-full shrink-0"
                    style={{ background: COLOR.marigold }}
                  >
                    <Check size={12} strokeWidth={3} color={COLOR.inkDeep} />
                  </span>
                  <div>
                    <h4 className="text-base font-semibold">{item.title}</h4>
                    <p className="text-sm mt-1 leading-relaxed" style={{ color: '#5B665F' }}>
                      {item.body}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <footer
        className="w-full py-8 text-center text-xs"
        style={{ background: COLOR.ink, color: 'rgba(250,249,244,0.55)' }}
      >
        <p>&copy; {new Date().getFullYear()} AKM Academy. All rights reserved.</p>
      </footer>
    </div>
  );
}