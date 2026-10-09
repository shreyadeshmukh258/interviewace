import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

export default function Logo({ to = '/' }) {
  return (
    <Link to={to} className="flex items-center gap-2.5 font-extrabold tracking-tight">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-primary to-secondary text-white shadow-md shadow-primary/30">
        <Sparkles className="h-4 w-4" />
      </span>
      <span className="text-lg">InterviewAce <span className="text-primary">AI</span></span>
    </Link>
  );
}
