import { HTMLAttributes } from 'react';
import { clsx } from 'clsx';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'bordered' | 'glow';
  hoverable?: boolean;
}

export function Card({ className, variant = 'default', hoverable = false, children, ...props }: CardProps) {
  return (
    <div
      className={clsx(
        'rounded-2xl overflow-hidden',
        variant === 'default' && 'glass',
        variant === 'elevated' && 'bg-navy-800/90 border border-white/10 shadow-2xl shadow-black/40',
        variant === 'bordered' && 'border-2 border-white/10 bg-transparent',
        variant === 'glow' && 'glass border border-green-500/20 shadow-lg shadow-green-500/10',
        hoverable && 'glass-hover cursor-pointer',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={clsx('px-5 py-4 border-b border-white/6', className)}
      {...props}
    />
  );
}

export function CardBody({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={clsx('px-5 py-4', className)} {...props} />;
}

export function CardFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={clsx('px-5 py-4 border-t border-white/6', className)}
      {...props}
    />
  );
}
