import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ThumbsUp, AlertTriangle, Lightbulb, ChevronDown, RotateCcw } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/client';
import { ScoreRing, Skeleton, scoreColor, fmtDate } from '../components/ui';

const Block = ({ icon: Icon, title, items, tone }) => (
  <div className="glass p-6">
    <div className={`mb-3 flex items-center gap-2 font-bold ${tone}`}><Icon className="h-5 w-5" /> {title}</div>
    <ul className="space-y-2.5 text-sm text-ink-soft">{items?.map((t, i) => <li key={i} className="flex gap-2"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-current opacity-50" />{t}</li>)}</ul>
  </div>
);

function QuestionCard({ r, i }) {
  const [open, setOpen] = useState(false);
  const s = r.score * 10;
  return (
    <div className="card overflow-hidden">
      <button onClick={() => setOpen(!open)} aria-expanded={open} className="flex w-full items-center gap-4 p-5 text-left">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl text-sm font-extrabold" style={{ background: `${scoreColor(s)}1A`, color: scoreColor(s) }}>{r.score}</span>
        <span className="min-w-0 flex-1"><span className="block text-xs font-semibold text-ink-mute">Question {i + 1} · {r.skill}</span><span className="block font-semibold">{r.question}</span></span>
        <ChevronDown className={`h-5 w-5 shrink-0 text-ink-mute transition ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-4 border-t border-slate-100 p-5 text-sm">
          <div><div className="mb-1 font-bold">Your answer</div><p className="whitespace-pre-wrap rounded-2xl bg-slate-50 p-3 text-ink-soft">{r.answer || 'No answer provided.'}</p></div>
          <div><div className="mb-1 font-bold">Feedback</div><p className="text-ink-soft">{r.aiFeedback?.feedback}</p></div>
          {r.aiFeedback?.improvement && <div><div className="mb-1 font-bold text-primary">How to improve</div><p className="text-ink-soft">{r.aiFeedback.improvement}</p></div>}
          {r.aiFeedback?.idealAnswer && <div className="rounded-2xl bg-primary-50 p-3"><div className="mb-1 font-bold text-primary">Model answer</div><p className="text-ink-soft">{r.aiFeedback.idealAnswer}</p></div>}
        </motion.div>
      )}
    </div>
  );
}

export default function Feedback() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  useEffect(() => { api.get(`/interview/${id}`).then(setData).catch((e) => toast.error(e.message)); }, [id]);

  if (!data) return <div className="space-y-4"><Skeleton className="h-52" /><Skeleton className="h-40" /><Skeleton className="h-64" /></div>;
  const { interview: iv, responses } = data;
  if (iv.status !== 'completed') return <div className="card p-8 text-center">This interview has not been submitted. <Link className="font-semibold text-primary" to={`/interview/${id}`}>Continue it</Link></div>;
  const verdict = iv.score >= 75 ? 'Strong performance' : iv.score >= 50 ? 'Solid, with room to grow' : 'Needs more practice';

  return (
    <div className="space-y-6">
      <div className="glass flex flex-col items-center gap-8 p-8 sm:flex-row">
        <ScoreRing score={iv.score} size={160} />
        <div className="text-center sm:text-left">
          <h1 className="text-2xl font-extrabold">{verdict}</h1>
          <p className="mt-1 text-sm text-ink-mute">{iv.role} · {iv.type} · {iv.difficulty} · {fmtDate(iv.completedAt)}</p>
          <p className="mt-3 max-w-xl text-ink-soft">{iv.feedback?.summary}</p>
          <div className="mt-5 flex flex-wrap justify-center gap-3 sm:justify-start">
            <Link to="/interview/new" className="btn-primary"><RotateCcw className="h-4 w-4" /> Practice again</Link>
            <Link to="/analytics" className="btn-ghost">See analytics</Link>
          </div>
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        <Block icon={ThumbsUp} title="Strengths" items={iv.feedback?.strengths} tone="text-success" />
        <Block icon={AlertTriangle} title="Weaknesses" items={iv.feedback?.weaknesses} tone="text-amber-600" />
        <Block icon={Lightbulb} title="Next steps" items={iv.feedback?.suggestions} tone="text-primary" />
      </div>
      <section>
        <h2 className="mb-4 text-lg font-bold">Question-by-question feedback</h2>
        <div className="space-y-3">{responses.map((r, i) => <QuestionCard key={r._id} r={r} i={i} />)}</div>
      </section>
    </div>
  );
}
