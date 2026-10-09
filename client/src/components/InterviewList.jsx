import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { fmtDate, scoreColor } from './ui';

export default function InterviewList({ items }) {
  return (
    <ul className="divide-y divide-slate-100">
      {items.map((i) => {
        const done = i.status === 'completed';
        return (
          <li key={i._id}>
            <Link to={done ? `/interview/${i._id}/feedback` : `/interview/${i._id}`} className="flex items-center gap-4 px-2 py-3.5 transition hover:bg-slate-50 sm:px-4 rounded-2xl">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl text-sm font-extrabold" style={done ? { background: `${scoreColor(i.score)}1A`, color: scoreColor(i.score) } : { background: '#F1F5F9', color: '#94A3B8' }}>
                {done ? i.score : '–'}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-bold">{i.role}</span>
                <span className="block text-xs text-ink-mute">{i.type} · {i.difficulty} · {fmtDate(i.createdAt)}</span>
              </span>
              <span className={`hidden rounded-full px-2.5 py-1 text-xs font-semibold sm:inline ${done ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>{done ? 'Completed' : 'Resume'}</span>
              <ChevronRight className="h-4 w-4 text-ink-mute" />
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
