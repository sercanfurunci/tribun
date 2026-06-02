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
        'border-2 border-slate-700 border-t-green-500 rounded-full animate-spin',
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
        <Spinner size="lg" />
        <p className="text-slate-400 text-sm">Loading...</p>
      </div>
    </div>
  );
}
