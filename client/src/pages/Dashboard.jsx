import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Mic, Trophy, TrendingUp, Sparkles, Plus, Target } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Skeleton, StatCard, EmptyState } from '../components/ui';
import { ScoreTrendChart, SkillBarChart } from '../components/charts';
import InterviewList from '../components/InterviewList';

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get('/dashboard/stats').then(setData).catch((e) => toast.error(e.message));
  }, []);

  const hour = new Date().getHours();
  const greet = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const t = data?.totals;

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-xl3 bg-gradient-to-br from-primary to-secondary p-7 text-white shadow-lift">
        <div className="absolute -right-8 -top-12 h-52 w-52 rounded-full bg-accent/30 blur-3xl" />
        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{greet}, {user?.name?.split(' ')[0]}</h1>
            <p className="mt-1 max-w-md text-white/85">
              {t?.interviews ? `You have completed ${t.interviews} interview${t.interviews > 1 ? 's' : ''}. Keep the streak going.` : 'Take your first mock interview to unlock your dashboard.'}
            </p>
          </div>
          <Link to="/interview/new" className="btn bg-white text-primary hover:bg-primary-50"><Plus className="h-4 w-4" /> Start interview</Link>
        </div>
      </div>

      {!data ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32" />)}</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard icon={Mic} label="Total interviews" value={t.interviews} />
          <StatCard icon={Target} label="Average score" value={t.avgScore} decimals={1} suffix="/100" tone="secondary" />
          <StatCard icon={Trophy} label="Best score" value={t.bestScore} tone="success" />
          <StatCard icon={TrendingUp} label="Improvement" value={t.improvement} decimals={1} suffix=" pts" tone="accent" hint="Recent vs earlier interviews" />
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-5">
        <section className="glass p-6 lg:col-span-3">
          <h2 className="font-bold">Score progress</h2>
          <p className="mb-4 text-sm text-ink-soft">Your last 20 completed interviews</p>
          {!data ? <Skeleton className="h-64" /> : data.scoreTrend.length ? <ScoreTrendChart data={data.scoreTrend} /> : <EmptyState icon={TrendingUp} title="No scores yet" text="Complete an interview and your progress line shows up here." />}
        </section>
        <section className="glass p-6 lg:col-span-2">
          <h2 className="font-bold">Skills performance</h2>
          <p className="mb-4 text-sm text-ink-soft">Average score by topic</p>
          {!data ? <Skeleton className="h-64" /> : data.skillPerformance.length ? <SkillBarChart data={data.skillPerformance.slice(0, 6)} height={260} /> : <EmptyState icon={Sparkles} title="No skill data" text="Skill scores appear after your first report." />}
        </section>
      </div>

      <section className="glass p-4 sm:p-6">
        <div className="mb-2 flex items-center justify-between px-2">
          <h2 className="font-bold">Recent interviews</h2>
          <Link to="/analytics" className="text-sm font-semibold text-primary">View all</Link>
        </div>
        {!data ? <Skeleton className="h-40" /> : data.recent.length ? <InterviewList items={data.recent} /> : (
          <EmptyState icon={Mic} title="No interviews yet" text="Pick a role and difficulty. We will write the questions." action={<Link to="/interview/new" className="btn-primary">Set up an interview</Link>} />
        )}
      </section>
    </div>
  );
}
