import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BarChart3 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/client';
import { PageHeader, Skeleton, EmptyState } from '../components/ui';
import { ScoreTrendChart, SkillBarChart, TypePieChart, DifficultyBarChart } from '../components/charts';
import InterviewList from '../components/InterviewList';

const Panel = ({ title, sub, children, className = '' }) => (
  <section className={`glass p-6 ${className}`}><h2 className="font-bold">{title}</h2><p className="mb-4 text-sm text-ink-soft">{sub}</p>{children}</section>
);

export default function Analytics() {
  const [stats, setStats] = useState(null);
  const [hist, setHist] = useState(null);
  const [page, setPage] = useState(1);

  useEffect(() => { api.get('/dashboard/stats').then(setStats).catch((e) => toast.error(e.message)); }, []);
  useEffect(() => { api.get(`/interview/history?page=${page}&limit=8`).then(setHist).catch((e) => toast.error(e.message)); }, [page]);

  if (!stats) return <div className="grid gap-6 md:grid-cols-2">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-72" />)}</div>;
  if (!stats.totals.interviews) return <div className="glass"><EmptyState icon={BarChart3} title="Analytics unlock after your first interview" text="Complete one interview to see trends, skills and breakdowns." action={<Link to="/interview/new" className="btn-primary">Start an interview</Link>} /></div>;

  return (
    <div className="space-y-6">
      <PageHeader title="Analytics" subtitle={`Based on ${stats.totals.interviews} completed interviews`} />
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Score trend" sub="Overall score per interview"><ScoreTrendChart data={stats.scoreTrend} /></Panel>
        <Panel title="Improvement line" sub="Same data as a line, to spot streaks"><ScoreTrendChart data={stats.scoreTrend} variant="line" /></Panel>
        <Panel title="Skill performance" sub="Average score by topic"><SkillBarChart data={stats.skillPerformance} /></Panel>
        <Panel title="Interview types" sub="How you split your practice"><TypePieChart data={stats.byType} /></Panel>
        <Panel title="Score by difficulty" sub="Average score at each level" className="lg:col-span-2"><DifficultyBarChart data={stats.byDifficulty} height={240} /></Panel>
      </div>
      <Panel title="Interview history" sub="Open any interview to review its feedback">
        {!hist ? <Skeleton className="h-40" /> : <InterviewList items={hist.interviews} />}
        {hist?.pages > 1 && (
          <div className="mt-4 flex items-center justify-center gap-3">
            <button className="btn-ghost" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</button>
            <span className="text-sm text-ink-soft">Page {page} of {hist.pages}</span>
            <button className="btn-ghost" disabled={page >= hist.pages} onClick={() => setPage(page + 1)}>Next</button>
          </div>
        )}
      </Panel>
    </div>
  );
}
