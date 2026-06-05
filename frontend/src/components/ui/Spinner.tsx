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
        'border-2 border-[#E8E4DE] border-t-[#8B1E1E]',
        sizes[size],
        className
      )}
    />
  );
}

export function FullPageSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F7F4EF]">
      <div className="flex flex-col items-center gap-4">
        <div className="size-10 rounded-full border-2 border-[#E8E4DE] border-t-[#8B1E1E] animate-spin" />
        <p className="text-[#999390] text-xs tracking-[0.12em] uppercase font-sans">Yükleniyor</p>
      </div>
    </div>
  );
}
