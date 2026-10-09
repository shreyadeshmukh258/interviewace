import { useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, MailCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/Logo';
import { Field, Spinner } from '../components/ui';

function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="aurora relative grid min-h-screen place-items-center px-4 py-10">
      <div className="pointer-events-none absolute left-10 top-20 h-64 w-64 animate-drift rounded-full bg-secondary/20 blur-3xl" />
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="glass relative w-full max-w-md p-8">
        <Logo />
        <h1 className="mt-8 text-2xl font-extrabold tracking-tight">{title}</h1>
        <p className="mt-1 text-sm text-ink-soft">{subtitle}</p>
        <div className="mt-6">{children}</div>
        <p className="mt-6 text-center text-sm text-ink-soft">{footer}</p>
      </motion.div>
    </div>
  );
}

function PasswordInput({ value, onChange, autoComplete, placeholder = '••••••••' }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input className="input pr-12" type={show ? 'text' : 'password'} value={value} onChange={onChange} autoComplete={autoComplete} placeholder={placeholder} required />
      <button type="button" onClick={() => setShow(!show)} aria-label={show ? 'Hide password' : 'Show password'} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-mute hover:text-primary">
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}

const useSubmit = (fn) => {
  const [busy, setBusy] = useState(false);
  const run = async (e) => {
    e.preventDefault();
    setBusy(true);
    try { await fn(); } catch (err) { toast.error(err.message); } finally { setBusy(false); }
  };
  return [busy, run];
};

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [busy, submit] = useSubmit(async () => {
    await login(form);
    navigate(location.state?.from || '/dashboard', { replace: true });
  });
  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to continue your practice." footer={<>New here? <Link to="/register" className="font-semibold text-primary">Create an account</Link></>}>
      <form onSubmit={submit} className="space-y-4">
        <Field label="Email"><input className="input" type="email" autoComplete="email" placeholder="you@example.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></Field>
        <Field label="Password"><PasswordInput autoComplete="current-password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></Field>
        <div className="text-right"><Link to="/forgot-password" className="text-sm font-semibold text-primary">Forgot password?</Link></div>
        <button className="btn-primary w-full" disabled={busy}>{busy && <Spinner />} Sign in</button>
      </form>
    </AuthLayout>
  );
}

export function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [busy, submit] = useSubmit(async () => {
    await register(form);
    toast.success('Account created');
    navigate('/resume', { replace: true });
  });
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  return (
    <AuthLayout title="Create your account" subtitle="Free to start. No card needed." footer={<>Already have an account? <Link to="/login" className="font-semibold text-primary">Sign in</Link></>}>
      <form onSubmit={submit} className="space-y-4">
        <Field label="Full name"><input className="input" autoComplete="name" placeholder="Ananya Sharma" value={form.name} onChange={set('name')} required minLength={2} /></Field>
        <Field label="Email"><input className="input" type="email" autoComplete="email" placeholder="you@example.com" value={form.email} onChange={set('email')} required /></Field>
        <Field label="Password"><PasswordInput autoComplete="new-password" placeholder="8+ characters, with a number" value={form.password} onChange={set('password')} /></Field>
        <button className="btn-primary w-full" disabled={busy}>{busy && <Spinner />} Create account</button>
      </form>
    </AuthLayout>
  );
}

export function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(null);
  const [busy, submit] = useSubmit(async () => setSent(await api.post('/auth/forgot-password', { email })));
  return (
    <AuthLayout title="Reset your password" subtitle="We will email you a link that works for 30 minutes." footer={<Link to="/login" className="font-semibold text-primary">Back to sign in</Link>}>
      {sent ? (
        <div className="rounded-2xl bg-green-50 p-4 text-sm text-green-800">
          <MailCheck className="mb-2 h-5 w-5" />
          {sent.message}
          {sent.devResetLink && <a className="mt-3 block break-all font-semibold text-primary underline" href={sent.devResetLink}>Dev only: open reset link</a>}
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <Field label="Email"><input className="input" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required /></Field>
          <button className="btn-primary w-full" disabled={busy}>{busy && <Spinner />} Send reset link</button>
        </form>
      )}
    </AuthLayout>
  );
}

export function ResetPassword() {
  const { token } = useParams();
  const { resetPassword } = useAuth();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [busy, submit] = useSubmit(async () => {
    await resetPassword(token, password);
    toast.success('Password updated');
    navigate('/dashboard', { replace: true });
  });
  return (
    <AuthLayout title="Choose a new password" subtitle="Use at least 8 characters with a letter and a number." footer={<Link to="/login" className="font-semibold text-primary">Back to sign in</Link>}>
      <form onSubmit={submit} className="space-y-4">
        <Field label="New password"><PasswordInput autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} /></Field>
        <button className="btn-primary w-full" disabled={busy}>{busy && <Spinner />} Update password</button>
      </form>
    </AuthLayout>
  );
}
