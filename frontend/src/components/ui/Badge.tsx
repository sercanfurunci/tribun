import { clsx } from 'clsx';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'green' | 'blue' | 'red' | 'yellow' | 'slate' | 'gold' | 'live';
  size?: 'sm' | 'md';
  className?: string;
}

const variants = {
  green: 'bg-green-500/15 text-green-400 border border-green-500/25',
  blue: 'bg-blue-500/15 text-blue-300 border border-blue-500/25',
  red: 'bg-red-500/15 text-red-400 border border-red-500/25',
  yellow: 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/25',
  slate: 'bg-white/6 text-slate-400 border border-white/10',
  gold: 'bg-amber-500/15 text-amber-400 border border-amber-500/25',
  live: 'bg-red-500/20 text-red-300 border border-red-400/30 live-indicator',
};

export function Badge({ children, variant = 'slate', size = 'sm', className }: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 rounded-full font-medium tracking-wide',
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm',
        variants[variant],
        className
      )}
    >
      {variant === 'live' && <span className="size-1.5 rounded-full bg-red-400 shrink-0" />}
      {children}
    </span>
  );
}
