import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Brain, FileSearch, LineChart as LineIcon, Timer, ShieldCheck, Target, Check, Menu, X, ArrowRight, Star } from 'lucide-react';
import Logo from '../components/Logo';
import { ScoreRing } from '../components/ui';
import { useAuth } from '../context/AuthContext';

const features = [
  { icon: FileSearch, title: 'Questions built from your resume', text: 'Upload a PDF and we pull out your skills, then write ten questions around what you actually claim to know.' },
  { icon: Brain, title: 'Answer-level AI feedback', text: 'Every answer gets a score, what worked, what was missing, and a model answer to compare against.' },
  { icon: Target, title: 'Technical, HR and behavioral', text: 'Practice one round or mix all three, at easy, medium or hard difficulty.' },
  { icon: Timer, title: 'Real interview pressure', text: 'A countdown and one question at a time keep practice close to the real thing.' },
  { icon: LineIcon, title: 'See yourself improve', text: 'Score trends, skill breakdowns and history show which topics are moving and which are stuck.' },
  { icon: ShieldCheck, title: 'Private by default', text: 'Your resume and answers are only visible to you. Delete any interview or resume at any time.' },
];

const steps = [
  ['Upload your resume', 'We read the PDF and list your skills.'],
  ['Pick a role and difficulty', 'Choose technical, HR, behavioral or a mix.'],
  ['Answer ten questions', 'Type your answers against a running timer.'],
  ['Review your report', 'Get scores, strengths and a plan for next time.'],
];

const testimonials = [
  { name: 'Aarav Mehta', role: 'SDE at a fintech startup', text: 'The feedback pointed out that I never quantified results. I changed that and my next real interview went far better.' },
  { name: 'Sneha Kulkarni', role: 'Final-year CS student', text: 'Questions came straight from my projects. It felt like the interviewer had read my resume, which is exactly what happened in placements.' },
  { name: 'Rohan Desai', role: 'Product analyst', text: 'The skill chart showed my SQL answers were weak. Two weeks of practice and the line finally went up.' },
];

const plans = [
  { name: 'Starter', price: '₹0', note: 'For trying it out', items: ['3 interviews per month', 'Resume skill extraction', 'Basic feedback report'], cta: 'Start free' },
  { name: 'Pro', price: '₹499', note: 'per month', items: ['Unlimited interviews', 'Answer-level model answers', 'Full analytics dashboard', 'Resume history'], cta: 'Go Pro', featured: true },
  { name: 'Campus', price: 'Custom', note: 'For colleges and bootcamps', items: ['Bulk student seats', 'Placement cell reports', 'Priority support'], cta: 'Talk to us' },
];

function Navbar() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const items = [['Features', '#features'], ['How it works', '#how'], ['Reviews', '#reviews'], ['Pricing', '#pricing']];
  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4 pt-4">
      <div className="glass mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
        <Logo />
        <nav className="hidden items-center gap-8 text-sm font-semibold text-ink-soft md:flex">
          {items.map(([l, h]) => <a key={h} href={h} className="transition hover:text-primary">{l}</a>)}
        </nav>
        <div className="hidden items-center gap-2 md:flex">
          {user ? <Link to="/dashboard" className="btn-primary">Open dashboard</Link> : (<><Link to="/login" className="btn-ghost">Sign in</Link><Link to="/register" className="btn-primary">Get started</Link></>)}
        </div>
        <button className="md:hidden" onClick={() => setOpen(!open)} aria-label="Toggle menu">{open ? <X /> : <Menu />}</button>
      </div>
      {open && (
        <div className="glass mx-auto mt-2 flex max-w-6xl flex-col gap-1 p-3 md:hidden">
          {items.map(([l, h]) => <a key={h} href={h} onClick={() => setOpen(false)} className="rounded-xl px-3 py-2 font-semibold hover:bg-primary-50">{l}</a>)}
          <Link to={user ? '/dashboard' : '/register'} className="btn-primary mt-2">{user ? 'Open dashboard' : 'Get started'}</Link>
        </div>
      )}
    </header>
  );
}

function HeroDemo() {
  return (
    <motion.div initial={{ opacity: 0, y: 24, rotate: 1.5 }} animate={{ opacity: 1, y: 0, rotate: 0 }} transition={{ duration: 0.7, delay: 0.15 }} className="glass relative mx-auto w-full max-w-md p-6">
      <div className="flex items-center justify-between text-xs font-semibold text-ink-mute">
        <span className="chip">Question 4 of 10</span><span>02:31 left</span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100"><div className="h-full w-[40%] rounded-full bg-gradient-to-r from-primary to-secondary" /></div>
      <p className="mt-5 text-[15px] font-bold leading-snug">Your React app re-renders too often on a large list. How would you find and fix the cause?</p>
      <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm leading-relaxed text-ink-soft">
        I would profile with React DevTools first, then memoize row components and virtualize the list with react-window…
      </div>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.1, duration: 0.5 }} className="mt-4 flex items-center gap-4 rounded-2xl border border-green-200 bg-green-50/70 p-4">
        <ScoreRing score={84} size={72} stroke={8} label={false} />
        <div className="text-sm">
          <div className="font-bold text-green-700">8.4 / 10: strong answer</div>
          <div className="text-ink-soft">Add a measured before/after to make it memorable.</div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function Landing() {
  return (
    <div className="overflow-x-hidden bg-white">
      <Navbar />

      <section className="aurora relative px-4 pb-24 pt-36">
        <div className="pointer-events-none absolute -left-24 top-24 h-72 w-72 animate-drift rounded-full bg-secondary/20 blur-3xl" />
        <div className="pointer-events-none absolute -right-20 top-60 h-80 w-80 animate-drift-slow rounded-full bg-accent/20 blur-3xl" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-[1.1fr_.9fr]">
          <div>
            <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-6xl">
              Walk into your interview having already answered the hard questions.
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mt-6 max-w-xl text-lg text-ink-soft">
              InterviewAce reads your resume, asks the questions a real interviewer would, and tells you exactly how to make each answer better.
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mt-8 flex flex-wrap gap-3">
              <Link to="/register" className="btn-primary px-7 py-3.5 text-base">Start a free interview <ArrowRight className="h-4 w-4" /></Link>
              <a href="#how" className="btn-ghost px-7 py-3.5 text-base">See how it works</a>
            </motion.div>
            <p className="mt-5 text-sm text-ink-mute">No credit card. Your first report takes about 15 minutes.</p>
          </div>
          <HeroDemo />
        </div>
      </section>

      <section id="features" className="mx-auto max-w-6xl px-4 py-24">
        <h2 className="max-w-2xl text-3xl font-extrabold tracking-tight sm:text-4xl">Practice that feels like the real interview, feedback that feels like a coach</h2>
        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {features.map(({ icon: Icon, title, text }, i) => (
            <motion.div key={title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-60px' }} transition={{ delay: (i % 3) * 0.08 }} className="card p-6 transition hover:-translate-y-1 hover:shadow-lift">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-primary-100 to-secondary-100 text-primary"><Icon className="h-5 w-5" /></span>
              <h3 className="mt-5 font-bold">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">{text}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section id="how" className="bg-surface px-4 py-24">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">From resume to report in four steps</h2>
          <div className="mt-12 grid gap-5 md:grid-cols-4">
            {steps.map(([t, d], i) => (
              <div key={t} className="relative rounded-xl2 border border-slate-200/70 bg-white p-6">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-primary text-sm font-bold text-white">{i + 1}</span>
                <h3 className="mt-4 font-bold">{t}</h3>
                <p className="mt-1.5 text-sm text-ink-soft">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="reviews" className="mx-auto max-w-6xl px-4 py-24">
        <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">What candidates say after a few rounds</h2>
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {testimonials.map((t) => (
            <figure key={t.name} className="glass flex flex-col p-6">
              <div className="flex gap-0.5 text-amber-400">{[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}</div>
              <blockquote className="mt-4 flex-1 text-[15px] leading-relaxed text-ink">{t.text}</blockquote>
              <figcaption className="mt-5 flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-primary to-secondary text-sm font-bold text-white">{t.name[0]}</span>
                <span className="text-sm"><b className="block">{t.name}</b><span className="text-ink-mute">{t.role}</span></span>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section id="pricing" className="bg-surface px-4 py-24">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-3xl font-extrabold tracking-tight sm:text-4xl">Simple pricing</h2>
          <p className="mx-auto mt-3 max-w-lg text-center text-ink-soft">Start free. Upgrade when you are practicing every week.</p>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {plans.map((p) => (
              <div key={p.name} className={`rounded-xl3 p-7 ${p.featured ? 'bg-gradient-to-br from-primary to-secondary text-white shadow-lift md:-translate-y-3' : 'card'}`}>
                <h3 className="font-bold">{p.name}</h3>
                <div className="mt-3 text-4xl font-extrabold">{p.price}</div>
                <div className={`text-sm ${p.featured ? 'text-white/80' : 'text-ink-mute'}`}>{p.note}</div>
                <ul className="mt-6 space-y-3 text-sm">
                  {p.items.map((it) => <li key={it} className="flex gap-2"><Check className={`h-4 w-4 shrink-0 ${p.featured ? 'text-white' : 'text-success'}`} />{it}</li>)}
                </ul>
                <Link to="/register" className={`mt-8 w-full ${p.featured ? 'btn bg-white text-primary hover:bg-primary-50' : 'btn-ghost'}`}>{p.cta}</Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-24">
        <div className="relative mx-auto max-w-5xl overflow-hidden rounded-[32px] bg-gradient-to-br from-primary via-primary to-secondary px-8 py-16 text-center text-white">
          <div className="absolute -right-10 -top-10 h-56 w-56 rounded-full bg-accent/30 blur-3xl" />
          <h2 className="relative text-3xl font-extrabold tracking-tight sm:text-4xl">Your next interview starts with the one you practice today</h2>
          <p className="relative mx-auto mt-4 max-w-lg text-white/85">Upload a resume and get your first set of questions in under a minute.</p>
          <Link to="/register" className="btn relative mt-8 bg-white px-8 py-3.5 text-base text-primary hover:bg-primary-50">Create free account</Link>
        </div>
      </section>

      <footer className="border-t border-slate-200/70 px-4 py-10">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 text-sm text-ink-mute">
          <Logo />
          <div className="flex gap-6"><a href="#features" className="hover:text-primary">Features</a><a href="#pricing" className="hover:text-primary">Pricing</a><Link to="/login" className="hover:text-primary">Sign in</Link></div>
          <span>© {new Date().getFullYear()} InterviewAce AI</span>
        </div>
      </footer>
    </div>
  );
}
