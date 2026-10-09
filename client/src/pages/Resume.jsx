import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UploadCloud, FileText, Trash2, ExternalLink, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/client';
import { PageHeader, Spinner, Skeleton, EmptyState, fmtDate } from '../components/ui';

export default function Resume() {
  const [resumes, setResumes] = useState(null);
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [busy, setBusy] = useState(false);
  const [drag, setDrag] = useState(false);
  const input = useRef();

  const load = useCallback(() => api.get('/resume').then((r) => setResumes(r.resumes)).catch((e) => toast.error(e.message)), []);
  useEffect(() => { load(); }, [load]);
  useEffect(() => () => previewUrl && URL.revokeObjectURL(previewUrl), [previewUrl]);

  const pick = (f) => {
    if (!f) return;
    if (f.type !== 'application/pdf') return toast.error('Upload a PDF file');
    if (f.size > 5 * 1024 * 1024) return toast.error('PDF must be under 5 MB');
    setFile(f);
    setPreviewUrl(URL.createObjectURL(f));
  };

  const upload = async () => {
    const fd = new FormData();
    fd.append('resume', file);
    setBusy(true);
    try {
      await api.post('/resume/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Resume analysed');
      setFile(null);
      setPreviewUrl(null);
      await load();
    } catch (e) { toast.error(e.message); } finally { setBusy(false); }
  };

  const remove = async (id) => {
    if (!confirm('Delete this resume?')) return;
    try { await api.delete(`/resume/${id}`); setResumes((r) => r.filter((x) => x._id !== id)); toast.success('Resume deleted'); } catch (e) { toast.error(e.message); }
  };

  const latest = resumes?.[0];

  return (
    <div>
      <PageHeader title="Resume" subtitle="Upload a PDF and we will extract your skills to tailor every interview." />
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <div
            onDragOver={(e) => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)}
            onDrop={(e) => { e.preventDefault(); setDrag(false); pick(e.dataTransfer.files[0]); }}
            onClick={() => input.current.click()} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && input.current.click()}
            className={`glass flex cursor-pointer flex-col items-center justify-center border-2 border-dashed px-6 py-12 text-center transition ${drag ? 'border-primary bg-primary-50' : 'border-primary/25 hover:border-primary/60'}`}
          >
            <input ref={input} type="file" accept="application/pdf" hidden onChange={(e) => pick(e.target.files[0])} />
            <span className="grid h-14 w-14 place-items-center rounded-2xl bg-primary-50 text-primary"><UploadCloud className="h-6 w-6" /></span>
            <p className="mt-4 font-bold">{file ? file.name : 'Drop your resume here'}</p>
            <p className="mt-1 text-sm text-ink-soft">{file ? `${(file.size / 1024).toFixed(0)} KB, ready to analyse` : 'or click to browse. PDF, up to 5 MB'}</p>
          </div>
          {file && (
            <button onClick={upload} disabled={busy} className="btn-primary w-full">
              {busy ? <><Spinner /> Reading your resume…</> : <><Sparkles className="h-4 w-4" /> Analyse resume</>}
            </button>
          )}
          {previewUrl && <iframe title="Resume preview" src={previewUrl} className="h-[480px] w-full rounded-xl2 border border-slate-200 bg-white" />}
        </div>

        <div className="space-y-6">
          <section className="glass p-6">
            <h2 className="font-bold">Extracted skills</h2>
            {!resumes ? <Skeleton className="mt-4 h-24" /> : latest ? (
              <>
                {latest.summary && <p className="mt-2 text-sm text-ink-soft">{latest.summary}</p>}
                <motion.div initial="h" animate="s" variants={{ s: { transition: { staggerChildren: 0.03 } } }} className="mt-4 flex flex-wrap gap-2">
                  {latest.extractedSkills.map((s) => <motion.span key={s} variants={{ h: { opacity: 0, scale: 0.8 }, s: { opacity: 1, scale: 1 } }} className="chip">{s}</motion.span>)}
                </motion.div>
                <Link to="/interview/new" className="btn-primary mt-6">Practice with these skills</Link>
              </>
            ) : <EmptyState icon={FileText} title="No resume yet" text="Your skills appear here after the first upload." />}
          </section>

          <section className="glass p-6">
            <h2 className="mb-2 font-bold">Upload history</h2>
            {resumes?.length ? (
              <ul className="divide-y divide-slate-100">
                {resumes.map((r) => (
                  <li key={r._id} className="flex items-center gap-3 py-3">
                    <FileText className="h-5 w-5 text-primary" />
                    <div className="min-w-0 flex-1"><div className="truncate text-sm font-semibold">{r.fileName}</div><div className="text-xs text-ink-mute">{fmtDate(r.uploadDate)} · {r.extractedSkills.length} skills</div></div>
                    <a href={r.resumeUrl} target="_blank" rel="noreferrer" aria-label="Open resume" className="rounded-xl p-2 text-ink-mute hover:bg-slate-100 hover:text-primary"><ExternalLink className="h-4 w-4" /></a>
                    <button onClick={() => remove(r._id)} aria-label="Delete resume" className="rounded-xl p-2 text-ink-mute hover:bg-red-50 hover:text-danger"><Trash2 className="h-4 w-4" /></button>
                  </li>
                ))}
              </ul>
            ) : <p className="text-sm text-ink-soft">Nothing uploaded yet.</p>}
          </section>
        </div>
      </div>
    </div>
  );
}
