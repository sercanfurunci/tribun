import { clsx } from 'clsx';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'green' | 'blue' | 'red' | 'yellow' | 'slate' | 'gold';
  size?: 'sm' | 'md';
  className?: string;
}

const variants = {
  green: 'bg-green-500/20 text-green-400 border border-green-500/30',
  blue: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
  red: 'bg-red-500/20 text-red-400 border border-red-500/30',
  yellow: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
  slate: 'bg-slate-700 text-slate-300 border border-slate-600',
  gold: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
};

export function Badge({ children, variant = 'slate', size = 'sm', className }: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full font-medium',
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
