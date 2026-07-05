'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';
import {
  LayoutDashboard,
  BookOpen,
  Users,
  Settings,
  MonitorPlay,
  LogOut,
  Menu,
  X,
  User,
  GraduationCap,
  ShieldAlert,
  CheckSquare
} from 'lucide-react';

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

export default function Sidebar() {
  const { user, logout, isAdmin } = useAuth();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => setIsOpen(!isOpen);

  // Define navigation items based on role
  const adminLinks = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Course Manager', href: '/admin/courses', icon: BookOpen },
    { name: 'Enrollment Requests', href: '/admin/enrollments', icon: CheckSquare },
    { name: 'Student Directory', href: '/admin/students', icon: Users },
    { name: 'Active Sessions', href: '/admin/sessions', icon: MonitorPlay },
    { name: 'Global Settings', href: '/admin/settings', icon: Settings },
  ];

  const studentLinks = [
    { name: 'My Learning', href: '/student', icon: GraduationCap },
    { name: 'Course Catalog', href: '/student/courses', icon: BookOpen },
    { name: 'My Profile', href: '/student/profile', icon: User },
  ];

  const links = isAdmin ? adminLinks : studentLinks;

  const SidebarContent = () => (
    <div 
      className="flex flex-col h-full relative overflow-hidden text-slate-100 border-r border-[#1C2521]"
      style={{ background: COLOR.inkDeep }}
    >
      {/* chalk-dust texture */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.09] pointer-events-none" xmlns="http://www.w3.org/2000/svg">
        <filter id="chalkGrain">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
          <feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0 0.6 0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#chalkGrain)" />
      </svg>

      {/* Header / Brand */}
      <div className="p-6 border-b border-[#1C2521] flex items-center justify-between relative z-10">
        <Link href="/" className="flex items-center space-x-2.5 group">
          <div 
            className="h-9 w-9 rounded-sm flex items-center justify-center transition-all duration-300"
            style={{ background: COLOR.marigold }}
          >
            <GraduationCap className="h-5 w-5" style={{ color: COLOR.inkDeep }} />
          </div>
          <div>
            <span 
              className="font-bold text-sm tracking-wide text-white block uppercase"
              style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}
            >
              EduSphere
            </span>
            <span 
              className="block text-[9px] tracking-widest uppercase font-medium mt-0.5"
              style={{ fontFamily: 'var(--font-mono)', color: COLOR.sage }}
            >
              {isAdmin ? 'ADMIN PORTAL' : 'STUDENT APP'}
            </span>
          </div>
        </Link>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto relative z-10">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive =
            pathname === link.href ||
            (link.href !== '/admin' && link.href !== '/student' && pathname.startsWith(link.href));

          return (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className="flex items-center px-4 py-3 rounded-sm text-xs font-semibold tracking-wider uppercase transition-colors group cursor-pointer"
              style={{
                background: isActive ? COLOR.marigold : 'transparent',
                color: isActive ? COLOR.inkDeep : 'rgba(250, 249, 244, 0.7)',
                fontFamily: 'var(--font-mono)'
              }}
            >
              <Icon
                className="h-4.5 w-4.5 mr-3 shrink-0"
                style={{
                  color: isActive ? COLOR.inkDeep : COLOR.sage
                }}
              />
              {link.name}
            </Link>
          );
        })}
      </nav>

      {/* Profile Card & Settings at the Bottom */}
      <div className="p-4 border-t border-[#1C2521] bg-black/15 space-y-4 relative z-10">
        {/* User profile row */}
        <div className="flex items-center space-x-3 px-2">
          <div 
            className="h-9 w-9 rounded-sm flex items-center justify-center font-bold text-sm shadow-inner"
            style={{ background: COLOR.sage, color: COLOR.inkDeep, fontFamily: 'var(--font-mono)' }}
          >
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-white truncate leading-none">
              {user?.name}
            </p>
            <p className="text-[9px] truncate mt-1.5 font-semibold" style={{ fontFamily: 'var(--font-mono)', color: COLOR.sage }}>
              {user?.phone}
            </p>
          </div>
          {isAdmin && (
            <div className="h-5 w-5 rounded-sm bg-amber-500/10 border border-amber-500/20 flex items-center justify-center" title="Admin User">
              <ShieldAlert className="h-3.5 w-3.5 text-amber-500" />
            </div>
          )}
        </div>

        {/* Action Row */}
        <div className="flex items-center justify-between pt-1 gap-2.5">
          <ThemeToggle />
          <button
            onClick={logout}
            className="flex-1 px-4 py-2 border rounded-sm text-slate-400 hover:text-red-400 hover:bg-red-500/5 hover:border-red-500/20 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center"
            style={{ 
              borderColor: 'rgba(250, 249, 244, 0.1)', 
              fontFamily: 'var(--font-mono)'
            }}
          >
            <LogOut className="h-4 w-4 mr-1.5" />
            Logout
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Hamburger Header */}
      <div 
        className="lg:hidden flex items-center justify-between px-6 py-4 text-white border-b border-[#1C2521] relative overflow-hidden"
        style={{ background: COLOR.inkDeep }}
      >
        <div className="flex items-center space-x-2.5">
          <svg width="24" height="24" viewBox="0 0 32 32" fill="none">
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
            className="font-bold text-sm tracking-wide uppercase"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            EduSphere
          </span>
        </div>
        <button
          onClick={toggleSidebar}
          className="p-1.5 rounded-sm border border-slate-700 text-slate-350 hover:text-white"
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Backdrop for mobile drawer */}
      {isOpen && (
        <div
          onClick={toggleSidebar}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar Wrapper */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-72 transform lg:translate-x-0 lg:static lg:block transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <SidebarContent />
      </div>
    </>
  );
}
