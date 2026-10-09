import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, FileText, History, Settings, LogOut } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Avatar } from '../components/AppShell';
import { Field, PageHeader, Spinner, EmptyState, fmtDate } from '../components/ui';
import InterviewList from '../components/InterviewList';

const tabs = [['details', 'Details', Settings], ['resumes', 'Resumes', FileText], ['interviews', 'Interviews', History]];

export default function Profile() {
  const { user, setUser, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('details');
  const [name, setName] = useState(user.name);
  const [saving, setSaving] = useState(false);
  const [pw, setPw] = useState({ currentPassword: '', newPassword: '' });
  const [pwBusy, setPwBusy] = useState(false);
  const [resumes, setResumes] = useState(null);
  const [hist, setHist] = useState(null);
  const file = useRef();

  useEffect(() => {
    if (tab === 'resumes' && !resumes) api.get('/resume').then((r) => setResumes(r.resumes)).catch((e) => toast.error(e.message));
    if (tab === 'interviews' && !hist) api.get('/interview/history?limit=20').then((r) => setHist(r.interviews)).catch((e) => toast.error(e.message));
  }, [tab, resumes, hist]);

  const saveProfile = async (fd) => {
    setSaving(true);
    try { const r = await api.put('/auth/profile', fd, { headers: { 'Content-Type': 'multipart/form-data' } }); setUser(r.user); toast.success('Profile updated'); } catch (e) { toast.error(e.message); } finally { setSaving(false); }
  };
  const onName = (e) => { e.preventDefault(); const fd = new FormData(); fd.append('name', name); saveProfile(fd); };
  const onAvatar = (e) => { const f = e.target.files[0]; if (!f) return; const fd = new FormData(); fd.append('avatar', f); saveProfile(fd); };
  const onPassword = async (e) => {
    e.preventDefault();
    setPwBusy(true);
    try { await api.put('/auth/password', pw); setPw({ currentPassword: '', newPassword: '' }); toast.success('Password changed'); } catch (err) { toast.error(err.message); } finally { setPwBusy(false); }
  };

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Profile" />
      <div className="glass mb-6 flex items-center gap-5 p-6">
        <div className="relative">
          <Avatar user={user} size={72} />
          <button onClick={() => file.current.click()} aria-label="Change photo" className="absolute -bottom-1 -right-1 grid h-8 w-8 place-items-center rounded-full bg-white text-primary shadow-glass hover:bg-primary-50"><Camera className="h-4 w-4" /></button>
          <input ref={file} type="file" accept="image/png,image/jpeg,image/webp" hidden onChange={onAvatar} />
        </div>
        <div><div className="text-lg font-extrabold">{user.name}</div><div className="text-sm text-ink-soft">{user.email}</div><div className="text-xs text-ink-mute">Member since {fmtDate(user.createdAt)}</div></div>
      </div>

      <div className="mb-6 flex gap-1 rounded-2xl bg-slate-100 p-1.5" role="tablist">
        {tabs.map(([id, label, Icon]) => (
          <button key={id} role="tab" aria-selected={tab === id} onClick={() => setTab(id)} className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2 text-sm font-semibold transition ${tab === id ? 'bg-white text-primary shadow' : 'text-ink-soft'}`}><Icon className="h-4 w-4" /><span className="hidden sm:inline">{label}</span></button>
        ))}
      </div>

      {tab === 'details' && (
        <div className="space-y-6">
          <form onSubmit={onName} className="glass space-y-4 p-6">
            <h2 className="font-bold">Personal details</h2>
            <Field label="Full name"><input className="input" value={name} onChange={(e) => setName(e.target.value)} minLength={2} required /></Field>
            <Field label="Email"><input className="input bg-slate-50" value={user.email} disabled /></Field>
            <button className="btn-primary" disabled={saving || name === user.name}>{saving && <Spinner />} Save changes</button>
          </form>
          <form onSubmit={onPassword} className="glass space-y-4 p-6">
            <h2 className="font-bold">Change password</h2>
            <Field label="Current password"><input className="input" type="password" autoComplete="current-password" value={pw.currentPassword} onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })} required /></Field>
            <Field label="New password"><input className="input" type="password" autoComplete="new-password" placeholder="8+ characters, with a number" value={pw.newPassword} onChange={(e) => setPw({ ...pw, newPassword: e.target.value })} required /></Field>
            <button className="btn-primary" disabled={pwBusy}>{pwBusy && <Spinner />} Update password</button>
          </form>
          <button onClick={() => { logout(); navigate('/'); }} className="btn-ghost w-full text-danger hover:border-danger/40 hover:bg-red-50"><LogOut className="h-4 w-4" /> Sign out</button>
        </div>
      )}
      {tab === 'resumes' && (
        <div className="glass p-4 sm:p-6">
          {resumes?.length ? <ul className="divide-y divide-slate-100">{resumes.map((r) => <li key={r._id} className="flex items-center gap-3 py-3"><FileText className="h-5 w-5 text-primary" /><div className="min-w-0 flex-1"><div className="truncate text-sm font-semibold">{r.fileName}</div><div className="text-xs text-ink-mute">{fmtDate(r.uploadDate)} · {r.extractedSkills.length} skills</div></div><a className="text-sm font-semibold text-primary" href={r.resumeUrl} target="_blank" rel="noreferrer">Open</a></li>)}</ul> : <EmptyState icon={FileText} title="No resumes" text="Uploaded resumes are listed here." />}
        </div>
      )}
      {tab === 'interviews' && (
        <div className="glass p-4 sm:p-6">{hist?.length ? <InterviewList items={hist} /> : <EmptyState icon={History} title="No interviews" text="Your past interviews are listed here." />}</div>
      )}
    </div>
  );
}
