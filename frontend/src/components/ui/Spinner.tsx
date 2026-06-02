import { clsx } from 'clsx';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizes = { sm: 'size-4', md: 'size-8', lg: 'size-12' };

export function Spinner({ size = 'md', className }: SpinnerProps) {
  return (
    <div
      className={clsx(
        'rounded-full animate-spin',
        'border-2 border-white/10 border-t-green-500',
        sizes[size],
        className
      )}
    />
  );
}

export function FullPageSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="size-16 rounded-full border-2 border-white/5 border-t-green-500 animate-spin" />
          <div className="absolute inset-2 rounded-full border-2 border-white/5 border-b-green-400/50 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }} />
        </div>
        <p className="text-slate-500 text-sm tracking-widest uppercase font-heading">Loading</p>
      </div>
    </div>
  );
}
