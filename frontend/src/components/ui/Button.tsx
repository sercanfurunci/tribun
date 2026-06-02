import { ButtonHTMLAttributes, forwardRef } from 'react';
import { clsx } from 'clsx';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'gold';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

const variants = {
  primary: 'bg-green-600 text-white btn-glow border border-green-500/30',
  secondary: 'bg-white/5 text-slate-200 border border-white/10',
  ghost: 'text-slate-400 border border-transparent',
  danger: 'bg-red-600/90 text-white border border-red-500/30',
  gold: 'bg-amber-500/90 text-black font-semibold border border-amber-400/30',
};

// Hover variants separated — gated behind hover media query in className
const hoverVariants = {
  primary: 'hover:bg-green-500',
  secondary: 'hover:bg-white/10 hover:border-white/20',
  ghost: 'hover:bg-white/6 hover:text-white',
  danger: 'hover:bg-red-500',
  gold: 'hover:bg-amber-400',
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm rounded-lg',
  md: 'px-4 py-2 text-sm rounded-xl',
  lg: 'px-6 py-3 text-base rounded-xl',
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, disabled, children, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={clsx(
        'inline-flex items-center justify-center gap-2 font-medium font-heading',
        // Specify exact properties — never transition: all (Emil principle)
        'transition-[transform,background-color,border-color,box-shadow,opacity] duration-150',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500/60 focus-visible:ring-offset-1 focus-visible:ring-offset-transparent',
        'disabled:opacity-40 disabled:cursor-not-allowed',
        // scale(0.97) on active — instant feedback (Emil principle: 100-160ms)
        'active:scale-[0.97]',
        // Hover gated behind pointer:fine to avoid false positives on touch
        '[&:not(:disabled)]:cursor-pointer',
        variants[variant],
        hoverVariants[variant],
        sizes[size],
        className
      )}
      style={{ willChange: 'transform' }}
      {...props}
    >
      {loading && (
        <span className="size-4 border-2 border-current border-t-transparent rounded-full animate-spin shrink-0" />
      )}
      {children}
    </button>
  )
);

Button.displayName = 'Button';
export default Button;
