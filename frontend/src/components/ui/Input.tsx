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
        <label htmlFor={id} className="text-sm font-medium text-slate-300">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={id}
        className={clsx(
          'w-full rounded-lg border bg-slate-800/50 px-3.5 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-green-500',
          error
            ? 'border-red-500 focus:ring-red-500'
            : 'border-slate-700 hover:border-slate-600',
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
);

Input.displayName = 'Input';
export default Input;
