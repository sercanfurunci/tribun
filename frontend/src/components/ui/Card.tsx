import { HTMLAttributes } from 'react';
import { clsx } from 'clsx';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'bordered';
}

export function Card({ className, variant = 'default', children, ...props }: CardProps) {
  return (
    <div
      className={clsx(
        'rounded-xl',
        variant === 'default' && 'bg-slate-800/60 border border-slate-700/50',
        variant === 'elevated' && 'bg-slate-800 border border-slate-700 shadow-xl',
        variant === 'bordered' && 'border-2 border-slate-700 bg-transparent',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={clsx('px-5 py-4 border-b border-slate-700/50', className)} {...props} />;
}

export function CardBody({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={clsx('px-5 py-4', className)} {...props} />;
}

export function CardFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={clsx('px-5 py-4 border-t border-slate-700/50', className)} {...props} />;
}
