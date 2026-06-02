import { InputHTMLAttributes, forwardRef } from 'react';
import { clsx } from 'clsx';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => (
    <div className="flex flex-col gap-2">
      {label && (
        <label htmlFor={id} className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] font-heading">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={id}
        className={clsx(
          'w-full rounded-2xl px-4 py-3.5 text-[15px] text-slate-100',
          'bg-white/[0.04] border',
          'placeholder:text-slate-600',
          'transition-[border-color,background-color,box-shadow] duration-150 ease-out',
          'focus:outline-none focus:bg-white/[0.07]',
          error
            ? 'border-red-500/50 focus:border-red-400/70 focus:shadow-[0_0_0_4px_rgba(239,68,68,0.12)]'
            : 'border-white/[0.08] hover:border-white/[0.16] focus:border-green-500/50 focus:shadow-[0_0_0_4px_rgba(22,163,74,0.12)]',
          className
        )}
        {...props}
      />
      {error && (
        <p className="text-xs text-red-400 flex items-center gap-1.5">
          <svg aria-hidden width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {error}
        </p>
      )}
    </div>
  )
);

Input.displayName = 'Input';
export default Input;
