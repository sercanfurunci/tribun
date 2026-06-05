import { ButtonHTMLAttributes, forwardRef } from 'react';
import { clsx } from 'clsx';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

const variants = {
  primary:   'bg-[#8B1E1E] text-white border border-[#8B1E1E] hover:bg-[#6F1717] hover:border-[#6F1717]',
  secondary: 'bg-white text-[#111111] border border-[#D9D4CC] hover:bg-[#F2EFE9] hover:border-[#B8B2AA]',
  ghost:     'bg-transparent text-[#666666] border border-transparent hover:text-[#111111] hover:bg-[#F2EFE9]',
  danger:    'bg-[#C1121F] text-white border border-[#C1121F] hover:bg-[#A00F1A] hover:border-[#A00F1A]',
};

const sizes = {
  sm: 'px-4 py-2 text-xs rounded',
  md: 'px-5 py-2.5 text-sm rounded',
  lg: 'px-6 py-3 text-sm rounded',
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, disabled, children, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={clsx(
        'inline-flex items-center justify-center gap-2 font-semibold',
        'font-sans tracking-[0.01em]',
        'transition-[background-color,border-color,color,opacity] duration-150',
        'focus:outline-none',
        'disabled:opacity-40 disabled:cursor-not-allowed',
        '[&:not(:disabled)]:cursor-pointer',
        variants[variant],
        sizes[size],
        className
      )}
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
