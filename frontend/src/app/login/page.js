'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { Phone, Lock, ShieldAlert, CheckCircle } from 'lucide-react';

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

function LoginForm() {
  const { login, user, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Extract messages from query params
  useEffect(() => {
    const msg = searchParams.get('msg');
    const type = searchParams.get('type');
    if (msg) {
      if (type === 'success') {
        setSuccessMsg(msg);
      } else {
        setErrorMsg(msg);
      }
    }
  }, [searchParams]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/student');
      }
    }
  }, [isAuthenticated, user, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!phone || !password) {
      setErrorMsg('Please fill in all fields');
      return;
    }

    try {
      const loggedInUser = await login(phone, password);
      if (loggedInUser.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/student');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Login failed. Please check your credentials.');
    }
  };

  return (
    <div 
      className="w-full max-w-md relative flex flex-col rounded-sm p-8 shadow-2xl animate-fadeIn"
      style={{
        background: COLOR.chalk,
        borderTop: `2px dashed ${COLOR.chalk2}`,
        fontFamily: 'var(--font-body)',
        color: COLOR.inkText
      }}
    >
      {/* punch holes, index-card motif */}
      <div className="absolute -top-1.5 left-6 w-3 h-3 rounded-full" style={{ background: COLOR.ink }} />
      <div className="absolute -top-1.5 right-6 w-3 h-3 rounded-full" style={{ background: COLOR.ink }} />

      <h2 
        className="text-2xl font-bold text-center tracking-tight mb-2 mt-2"
        style={{ fontFamily: 'var(--font-display)', color: COLOR.inkText }}
      >
        Welcome Back
      </h2>
      <p 
        className="text-xs text-center mb-6 tracking-wider uppercase font-medium"
        style={{ fontFamily: 'var(--font-mono)', color: COLOR.sage }}
      >
        SECURE — LOGIN — PANEL
      </p>

      {/* Feedback Alerts */}
      {errorMsg && (
        <div className="mb-5 p-4 rounded-sm bg-red-50 border border-red-200 text-red-700 text-xs flex items-start space-x-2.5">
          <ShieldAlert className="h-4.5 w-4.5 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Access Denied</p>
            <p className="mt-1 leading-normal font-light">{errorMsg}</p>
          </div>
        </div>
      )}

      {successMsg && (
        <div className="mb-5 p-4 rounded-sm bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-start space-x-2.5">
          <CheckCircle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Success</p>
            <p className="mt-1 leading-normal font-light">{successMsg}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Phone field */}
        <div className="space-y-2">
          <label 
            className="block text-[11px] font-semibold uppercase tracking-[0.16em]"
            style={{ fontFamily: 'var(--font-mono)', color: COLOR.sage }}
          >
            Phone Number
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
              <Phone className="h-4 w-4" />
            </span>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Enter your phone number"
              className="w-full bg-white border border-[#DCDCDC] focus:border-[#E8A33D] rounded-sm py-2.5 pl-11 pr-4 text-sm outline-none transition-all"
              style={{ color: COLOR.inkText }}
              required
            />
          </div>
        </div>

        {/* Password field */}
        <div className="space-y-2">
          <label 
            className="block text-[11px] font-semibold uppercase tracking-[0.16em]"
            style={{ fontFamily: 'var(--font-mono)', color: COLOR.sage }}
          >
            Password
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
              <Lock className="h-4 w-4" />
            </span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-white border border-[#DCDCDC] focus:border-[#E8A33D] rounded-sm py-2.5 pl-11 pr-4 text-sm outline-none transition-all"
              style={{ color: COLOR.inkText }}
              required
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 rounded-sm font-semibold text-sm tracking-wide transition-all cursor-pointer disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center"
          style={{ background: COLOR.marigold, color: COLOR.inkDeep }}
        >
          {loading ? (
            <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            'Sign In'
          )}
        </button>
      </form>

      {/* Navigation Link */}
      <div className="mt-8 text-center border-t border-[#EAEAEA] pt-6">
        <p className="text-xs" style={{ color: COLOR.sage }}>
          Don't have an account?{' '}
          <Link
            href="/register"
            className="font-bold underline hover:text-[#C97F22] transition-colors"
            style={{ color: COLOR.inkText }}
          >
            Sign Up for Free
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function Login() {
  return (
    <div 
      className="min-h-screen flex flex-col justify-center items-center px-4 relative overflow-hidden"
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

      {/* Brand logo header */}
      <div className="flex items-center space-x-2.5 mb-8 relative z-10">
        <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
          <path
            d="M6 11.5 16 7l10 4.5-10 4.5-10-4.5Z"
            stroke={COLOR.chalk}
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <path d="M9.5 13v6.5c0 1.8 3 3.2 6.5 3.2s6.5-1.4 6.5-3.2V13" stroke={COLOR.chalk} strokeWidth="1.8" />
          <path d="M25 12v6" stroke={COLOR.marigold} strokeWidth="1.8" strokeLinecap="round" />
          <circle cx="25" cy="20" r="1.4" fill={COLOR.marigold} />
        </svg>
        <span 
          className="text-lg tracking-wide uppercase"
          style={{ fontFamily: 'var(--font-display)', fontWeight: 600, color: COLOR.chalk }}
        >
          EduSphere
        </span>
      </div>

      <Suspense fallback={
        <div className="w-full max-w-md bg-[#FAF9F4] rounded-sm p-8 shadow-2xl flex items-center justify-center h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2" style={{ borderColor: COLOR.marigold }} />
        </div>
      }>
        <LoginForm />
      </Suspense>
    </div>
  );
}
