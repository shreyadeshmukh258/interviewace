import { useEffect, useState } from 'react';
import { motion, animate } from 'framer-motion';
import { Loader2 } from 'lucide-react';

export const Skeleton = ({ className = '' }) => (
  <div className={`relative overflow-hidden rounded-2xl bg-slate-200/70 ${className}`}>
    <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/70 to-transparent" style={{ animationDuration: '1.4s', animationIterationCount: 'infinite' }} />
  </div>
);

export const Spinner = ({ className = 'h-4 w-4' }) => <Loader2 className={`animate-spin ${className}`} />;

export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1 max-w-xl text-sm text-ink-soft">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function Field({ label, error, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-ink">{label}</span>
      {children}
      {error && <span className="mt-1 block text-xs font-medium text-danger">{error}</span>}
    </label>
  );
}

export function EmptyState({ icon: Icon, title, text, action }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
      <div className="mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-primary-50 text-primary"><Icon className="h-6 w-6" /></div>
      <h3 className="font-bold">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-ink-soft">{text}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function CountUp({ value, decimals = 0, suffix = '' }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    const c = animate(0, value || 0, { duration: 1, ease: 'easeOut', onUpdate: (v) => setN(v) });
    return () => c.stop();
  }, [value]);
  return <>{n.toFixed(decimals)}{suffix}</>;
}

export const scoreColor = (s) => (s >= 75 ? '#22C55E' : s >= 50 ? '#4F46E5' : s >= 30 ? '#F59E0B' : '#EF4444');

export function ScoreRing({ score = 0, size = 140, stroke = 12, label = true }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="#E2E8F0" strokeWidth={stroke} fill="none" />
        <motion.circle
          cx={size / 2} cy={size / 2} r={r} stroke={scoreColor(score)} strokeWidth={stroke} fill="none" strokeLinecap="round"
          strokeDasharray={c} initial={{ strokeDashoffset: c }} animate={{ strokeDashoffset: c * (1 - score / 100) }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        />
      </svg>
      {label && (
        <div className="absolute text-center">
          <div className="font-extrabold leading-none" style={{ fontSize: size / 3.4 }}><CountUp value={score} /></div>
          <div className="mt-1 text-xs font-medium text-ink-mute">out of 100</div>
        </div>
      )}
    </div>
  );
}

export function StatCard({ icon: Icon, label, value, decimals = 0, suffix = '', hint, tone = 'primary' }) {
  const tones = { primary: 'bg-primary-50 text-primary', secondary: 'bg-secondary-50 text-secondary', accent: 'bg-accent-50 text-accent', success: 'bg-green-50 text-success' };
  return (
    <div className="glass p-5 transition hover:-translate-y-0.5 hover:shadow-lift">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-ink-soft">{label}</span>
        <span className={`grid h-9 w-9 place-items-center rounded-xl ${tones[tone]}`}><Icon className="h-4 w-4" /></span>
      </div>
      <div className="mt-3 text-3xl font-extrabold tracking-tight"><CountUp value={value} decimals={decimals} suffix={suffix} /></div>
      {hint && <div className="mt-1 text-xs text-ink-mute">{hint}</div>}
    </div>
  );
}

export const fmtDate = (d) => new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
export const fmtShort = (d) => new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
