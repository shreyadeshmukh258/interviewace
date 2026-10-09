import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Clock, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/client';
import { Skeleton, Spinner } from '../components/ui';

const PER_QUESTION = 180;
const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

export default function InterviewRoom() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [interview, setInterview] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [index, setIndex] = useState(0);
  const [left, setLeft] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const started = useRef(Date.now());
  const draftKey = `ia_draft_${id}`;

  useEffect(() => {
    api.get(`/interview/${id}`).then(({ interview }) => {
      if (interview.status === 'completed') return navigate(`/interview/${id}/feedback`, { replace: true });
      const draft = JSON.parse(localStorage.getItem(draftKey) || 'null');
      setInterview(interview);
      setAnswers(draft?.answers?.length === interview.questions.length ? draft.answers : interview.questions.map(() => ''));
      setLeft(draft?.left ?? interview.questions.length * PER_QUESTION);
    }).catch((e) => { toast.error(e.message); navigate('/dashboard'); });
  }, [id, navigate, draftKey]);

  useEffect(() => {
    if (interview) localStorage.setItem(draftKey, JSON.stringify({ answers, left }));
  }, [answers, left, interview, draftKey]);

  const submit = useCallback(async () => {
    setSubmitting(true);
    try {
      await api.post('/interview/submit', { interviewId: id, answers, durationSeconds: Math.round((Date.now() - started.current) / 1000) });
      localStorage.removeItem(draftKey);
      navigate(`/interview/${id}/feedback`, { replace: true });
    } catch (e) { toast.error(e.message); setSubmitting(false); }
  }, [id, answers, navigate, draftKey]);

  useEffect(() => {
    if (!interview || submitting) return;
    if (left <= 0) { toast('Time is up. Submitting your answers.'); submit(); return; }
    const t = setTimeout(() => setLeft((l) => l - 1), 1000);
    return () => clearTimeout(t);
  }, [left, interview, submitting, submit]);

  const answered = useMemo(() => answers.filter((a) => a.trim()).length, [answers]);

  if (!interview) return <div className="mx-auto max-w-3xl space-y-4"><Skeleton className="h-8" /><Skeleton className="h-40" /><Skeleton className="h-56" /></div>;
  if (submitting) return (
    <div className="grid min-h-[60vh] place-items-center text-center">
      <div><Spinner className="mx-auto h-8 w-8 text-primary" /><h2 className="mt-4 text-xl font-bold">Evaluating your answers</h2><p className="mt-1 text-sm text-ink-soft">This usually takes 10 to 20 seconds.</p></div>
    </div>
  );

  const q = interview.questions[index];
  const last = index === interview.questions.length - 1;
  const total = interview.questions.length;

  const finish = () => {
    if (answered < total && !confirm(`You answered ${answered} of ${total} questions. Submit anyway?`)) return;
    submit();
  };

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div><h1 className="text-xl font-extrabold">{interview.role}</h1><p className="text-sm text-ink-soft">{interview.type} · {interview.difficulty}</p></div>
        <div className={`flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-bold tabular-nums ${left < 120 ? 'bg-red-50 text-danger' : 'bg-white text-ink shadow-glass'}`} role="timer"><Clock className="h-4 w-4" /> {fmt(left)}</div>
      </div>

      <div className="mb-2 flex justify-between text-xs font-semibold text-ink-soft"><span>Question {index + 1} of {total}</span><span>{answered} answered</span></div>
      <div className="mb-6 h-2 overflow-hidden rounded-full bg-slate-200">
        <motion.div className="h-full rounded-full bg-gradient-to-r from-primary to-secondary" animate={{ width: `${((index + 1) / total) * 100}%` }} transition={{ type: 'spring', stiffness: 120, damping: 20 }} />
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={index} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.22 }} className="glass p-6 sm:p-8">
          <div className="flex gap-2"><span className="chip">{q.category}</span>{q.skill && <span className="chip bg-secondary-50 text-secondary">{q.skill}</span>}</div>
          <h2 className="mt-4 text-xl font-bold leading-snug sm:text-2xl">{q.text}</h2>
          <textarea
            className="input mt-6 min-h-[200px] resize-y leading-relaxed" placeholder="Type your answer. Be specific: give examples, numbers and trade-offs."
            value={answers[index]} maxLength={5000}
            onChange={(e) => setAnswers((a) => a.map((v, i) => (i === index ? e.target.value : v)))}
          />
          <div className="mt-1 text-right text-xs text-ink-mute">{answers[index].length}/5000</div>
        </motion.div>
      </AnimatePresence>

      <div className="mt-6 flex items-center justify-between gap-3">
        <button className="btn-ghost" disabled={index === 0} onClick={() => setIndex(index - 1)}><ArrowLeft className="h-4 w-4" /> Previous</button>
        <div className="hidden gap-1.5 sm:flex">
          {interview.questions.map((_, i) => <button key={i} onClick={() => setIndex(i)} aria-label={`Go to question ${i + 1}`} className={`h-2.5 w-2.5 rounded-full transition ${i === index ? 'scale-125 bg-primary' : answers[i]?.trim() ? 'bg-success' : 'bg-slate-300'}`} />)}
        </div>
        {last ? <button className="btn-primary" onClick={finish}><Send className="h-4 w-4" /> Submit interview</button> : <button className="btn-primary" onClick={() => setIndex(index + 1)}>Next question <ArrowRight className="h-4 w-4" /></button>}
      </div>
    </div>
  );
}
