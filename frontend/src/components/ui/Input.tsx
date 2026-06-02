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
        <label htmlFor={id} className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={id}
        className={clsx(
          'w-full rounded-xl border bg-white/4 px-4 py-3 text-sm text-slate-100',
          'placeholder:text-slate-600 transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 focus:bg-white/6',
          error
            ? 'border-red-500/60 focus:ring-red-500/40'
            : 'border-white/8 hover:border-white/15',
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-red-400 flex items-center gap-1">
        <span>⚠</span> {error}
      </p>}
    </div>
  )
);

Input.displayName = 'Input';
export default Input;
