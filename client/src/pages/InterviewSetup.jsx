import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Code2, Users, HeartHandshake, Shuffle, Wand2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/client';
import { PageHeader, Field, Spinner } from '../components/ui';

const roles = ['Frontend Developer', 'Backend Developer', 'Full Stack Developer', 'Data Analyst', 'DevOps Engineer', 'Product Manager'];
const types = [
  { id: 'Technical', icon: Code2, text: 'Concepts, problem solving and tools' },
  { id: 'HR', icon: Users, text: 'Motivation, goals and culture fit' },
  { id: 'Behavioral', icon: HeartHandshake, text: 'Past situations and how you handled them' },
  { id: 'Mixed', icon: Shuffle, text: 'A bit of everything, like a real loop' },
];

export default function InterviewSetup() {
  const navigate = useNavigate();
  const [role, setRole] = useState('');
  const [difficulty, setDifficulty] = useState('Medium');
  const [type, setType] = useState('Technical');
  const [skills, setSkills] = useState([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.get('/resume').then((r) => setSkills(r.resumes[0]?.extractedSkills || [])).catch(() => {});
  }, []);

  const generate = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const r = await api.post('/interview/generate', { role, difficulty, type, skills });
      navigate(`/interview/${r.interview._id}`);
    } catch (err) { toast.error(err.message); setBusy(false); }
  };

  return (
    <form onSubmit={generate} className="mx-auto max-w-3xl">
      <PageHeader title="Set up your interview" subtitle="Ten questions, written for your role and skills." />
      <div className="glass space-y-8 p-6 sm:p-8">
        <Field label="Job role">
          <input className="input" value={role} onChange={(e) => setRole(e.target.value)} placeholder="e.g. Frontend Developer" required minLength={2} maxLength={80} />
          <div className="mt-3 flex flex-wrap gap-2">
            {roles.map((r) => <button type="button" key={r} onClick={() => setRole(r)} className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${role === r ? 'border-primary bg-primary text-white' : 'border-slate-200 bg-white text-ink-soft hover:border-primary/50'}`}>{r}</button>)}
          </div>
        </Field>

        <div>
          <span className="mb-2 block text-sm font-semibold">Difficulty</span>
          <div className="grid grid-cols-3 gap-2 rounded-2xl bg-slate-100 p-1.5">
            {['Easy', 'Medium', 'Hard'].map((d) => (
              <button type="button" key={d} onClick={() => setDifficulty(d)} className={`rounded-xl py-2 text-sm font-semibold transition ${difficulty === d ? 'bg-white text-primary shadow' : 'text-ink-soft'}`}>{d}</button>
            ))}
          </div>
        </div>

        <div>
          <span className="mb-2 block text-sm font-semibold">Interview type</span>
          <div className="grid gap-3 sm:grid-cols-2">
            {types.map(({ id, icon: Icon, text }) => (
              <button type="button" key={id} onClick={() => setType(id)} aria-pressed={type === id} className={`flex items-start gap-3 rounded-2xl border p-4 text-left transition ${type === id ? 'border-primary bg-primary-50 ring-4 ring-primary/10' : 'border-slate-200 bg-white hover:border-primary/40'}`}>
                <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${type === id ? 'bg-primary text-white' : 'bg-slate-100 text-ink-soft'}`}><Icon className="h-5 w-5" /></span>
                <span><b className="block text-sm">{id}</b><span className="text-xs text-ink-soft">{text}</span></span>
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-2xl bg-slate-50 p-4">
          <div className="text-sm font-semibold">Skills used for your questions</div>
          {skills.length ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {skills.slice(0, 14).map((s) => <button type="button" key={s} onClick={() => setSkills(skills.filter((x) => x !== s))} title="Remove skill" className="chip hover:bg-red-50 hover:text-danger">{s} ×</button>)}
            </div>
          ) : <p className="mt-1 text-sm text-ink-soft">No resume yet. <Link to="/resume" className="font-semibold text-primary">Upload one</Link> for tailored questions, or continue with role-based questions.</p>}
        </div>

        <button className="btn-primary w-full py-3.5 text-base" disabled={busy}>
          {busy ? <><Spinner /> Writing your questions…</> : <><Wand2 className="h-4 w-4" /> Generate interview</>}
        </button>
      </div>
    </form>
  );
}
