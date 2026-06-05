import { InputHTMLAttributes, forwardRef } from 'react';
import { clsx } from 'clsx';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={id}
          className="text-[11px] font-semibold text-[#666666] uppercase tracking-[0.08em] font-sans"
        >
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={id}
        className={clsx(
          'w-full rounded px-4 py-3 text-sm text-[#111111] bg-white',
          'border transition-[border-color] duration-150',
          'placeholder:text-[#999390]',
          'focus:outline-none',
          error
            ? 'border-[#C1121F] focus:border-[#C1121F]'
            : 'border-[#D9D4CC] hover:border-[#B8B2AA] focus:border-[#111111]',
          className
        )}
        {...props}
      />
      {error && (
        <p className="text-xs text-[#C1121F] flex items-center gap-1.5 font-sans">
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
