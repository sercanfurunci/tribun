import { clsx } from 'clsx';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'correct-exact' | 'correct-result' | 'wrong' | 'live' | 'pending' | 'red' | 'green' | 'blue' | 'gold';
  size?: 'sm' | 'md';
  className?: string;
}

const variants = {
  'default':        'bg-[#F2EFE9] text-[#666666] border border-[#D9D4CC]',
  'correct-exact':  'bg-[#DCFCE7] text-[#166534] border border-[#86EFAC]',
  'correct-result': 'bg-[#F7F4EF] text-[#166534] border border-[#D9D4CC]',
  'wrong':          'bg-[#F7F4EF] text-[#666666] border border-[#D9D4CC]',
  'live':           'bg-[#FEF2F2] text-[#C1121F] border border-[#FECACA]',
  'pending':        'bg-[#F7F4EF] text-[#666666] border border-[#D9D4CC]',
  /* legacy variants kept for backward-compat during migration */
  'red':            'bg-[#FEF2F2] text-[#C1121F] border border-[#FECACA]',
  'green':          'bg-[#DCFCE7] text-[#166534] border border-[#86EFAC]',
  'blue':           'bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE]',
  'gold':           'bg-[#FFFBEB] text-[#92400E] border border-[#FDE68A]',
};

export function Badge({ children, variant = 'default', size = 'sm', className }: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 rounded-sm font-semibold tracking-[0.04em] uppercase',
        'font-sans',
        size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-3 py-1 text-xs',
        variants[variant],
        className
      )}
    >
      {variant === 'live' && <span className="live-dot" />}
      {children}
    </span>
  );
}
