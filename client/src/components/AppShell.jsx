import { useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, FileText, Mic, BarChart3, UserRound, LogOut, Menu, X, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Logo from './Logo';
import PageTransition from './PageTransition';

const links = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/resume', label: 'Resume', icon: FileText },
  { to: '/interview/new', label: 'Practice', icon: Mic },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/profile', label: 'Profile', icon: UserRound },
];

export const Avatar = ({ user, size = 36 }) =>
  user?.avatar ? (
    <img src={user.avatar} alt="" className="rounded-full object-cover" style={{ width: size, height: size }} />
  ) : (
    <span className="grid place-items-center rounded-full bg-gradient-to-br from-primary to-secondary font-bold text-white" style={{ width: size, height: size, fontSize: size / 2.5 }}>
      {user?.name?.[0]?.toUpperCase() || '?'}
    </span>
  );

export default function AppShell() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const nav = (
    <nav className="flex flex-1 flex-col gap-1">
      {links.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to} to={to} onClick={() => setOpen(false)} end={to === '/interview/new'}
          className={({ isActive }) => `flex items-center gap-3 rounded-2xl px-4 py-2.5 text-sm font-semibold transition ${isActive ? 'bg-primary-50 text-primary' : 'text-ink-soft hover:bg-slate-100'}`}
        >
          <Icon className="h-[18px] w-[18px]" /> {label}
        </NavLink>
      ))}
    </nav>
  );

  const sidebar = (
    <div className="flex h-full flex-col gap-6 p-5">
      <Logo to="/dashboard" />
      <button onClick={() => { setOpen(false); navigate('/interview/new'); }} className="btn-primary w-full"><Plus className="h-4 w-4" /> New interview</button>
      {nav}
      <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-white p-3">
        <Avatar user={user} />
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-bold">{user?.name}</div>
          <div className="truncate text-xs text-ink-mute">{user?.email}</div>
        </div>
        <button onClick={() => { logout(); navigate('/'); }} aria-label="Sign out" className="rounded-xl p-2 text-ink-mute hover:bg-slate-100 hover:text-danger"><LogOut className="h-4 w-4" /></button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50/60 via-surface to-surface">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-slate-200/70 bg-white/70 backdrop-blur-xl lg:block">{sidebar}</aside>
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200/70 bg-white/80 px-4 py-3 backdrop-blur-xl lg:hidden">
        <Logo to="/dashboard" />
        <button onClick={() => setOpen(true)} aria-label="Open menu" className="rounded-xl p-2 hover:bg-slate-100"><Menu className="h-5 w-5" /></button>
      </header>
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-ink/30" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-72 bg-white shadow-2xl">
            <button onClick={() => setOpen(false)} aria-label="Close menu" className="absolute right-3 top-3 rounded-xl p-2 hover:bg-slate-100"><X className="h-5 w-5" /></button>
            {sidebar}
          </div>
        </div>
      )}
      <main className="lg:pl-64">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-8">
          <PageTransition key={location.pathname}><Outlet /></PageTransition>
        </div>
      </main>
    </div>
  );
}
