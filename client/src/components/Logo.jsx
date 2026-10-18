import { Link } from 'react-router-dom';

const markSizes = {
  sm: 'h-7 w-7',
  md: 'h-9 w-9',
  lg: 'h-11 w-11',
};

const fullSizes = {
  sm: 'h-10 w-auto',
  md: 'h-14 w-auto',
  lg: 'h-20 w-auto',
};

const textSizes = {
  sm: 'text-base',
  md: 'text-lg',
  lg: 'text-xl',
};

export default function Logo({
  to = '/',
  size = 'md',
  variant = 'default',
  className = '',
  showText = true,
}) {
  if (variant === 'full') {
    return (
      <Link
        to={to}
        className={`group inline-flex items-center transition duration-200 hover:opacity-95 ${className}`}
      >
        <img
          src="/logo.png"
          alt="InterviewAce AI"
          className={`${fullSizes[size] || fullSizes.md} object-contain drop-shadow-sm transition-transform duration-200 group-hover:scale-[1.02]`}
        />
      </Link>
    );
  }

  if (variant === 'mark' || !showText) {
    return (
      <Link
        to={to}
        className={`group inline-flex items-center ${className}`}
        aria-label="InterviewAce AI"
      >
        <img
          src="/logo-mark.png"
          alt="InterviewAce AI"
          className={`${markSizes[size] || markSizes.md} object-contain drop-shadow-sm transition-transform duration-200 group-hover:scale-105`}
        />
      </Link>
    );
  }

  return (
    <Link
      to={to}
      className={`group flex items-center gap-2.5 font-extrabold tracking-tight ${className}`}
    >
      <img
        src="/logo-mark.png"
        alt="InterviewAce AI Logo"
        className={`${markSizes[size] || markSizes.md} object-contain drop-shadow-sm transition-transform duration-200 group-hover:scale-105`}
      />
      <span className={`${textSizes[size] || textSizes.md} text-ink`}>
        Interview<span className="text-cyan-600">Ace</span>{' '}
        <span className="rounded-md bg-gradient-to-r from-cyan-500 to-primary px-1.5 py-0.5 text-[11px] font-black uppercase tracking-wider text-white shadow-sm shadow-cyan-500/20">
          AI
        </span>
      </span>
    </Link>
  );
}
