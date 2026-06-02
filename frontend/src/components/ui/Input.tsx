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
        <label htmlFor={id} className="text-xs font-bold text-slate-400 uppercase tracking-widest font-heading">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={id}
        className={clsx(
          'w-full rounded-xl px-4 py-3 text-sm text-slate-100',
          'bg-white/4 border',
          'placeholder:text-slate-600',
          // Specify exact properties — Emil: never transition: all
          'transition-[border-color,background-color,box-shadow] duration-150 ease-out',
          'focus:outline-none focus:bg-white/6',
          error
            ? 'border-red-500/50 focus:border-red-400/70 focus:shadow-[0_0_0_3px_rgba(239,68,68,0.15)]'
            : 'border-white/8 hover:border-white/16 focus:border-green-500/50 focus:shadow-[0_0_0_3px_rgba(22,163,74,0.12)]',
          className
        )}
        {...props}
      />
      {error && (
        <p className="text-xs text-red-400 flex items-center gap-1">
          <span aria-hidden>⚠</span> {error}
        </p>
      )}
    </div>
  )
);

Input.displayName = 'Input';
export default Input;
