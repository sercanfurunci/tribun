import { HTMLAttributes } from 'react';
import { clsx } from 'clsx';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'bordered';
  hoverable?: boolean;
}

export function Card({ className, variant = 'default', hoverable = false, children, ...props }: CardProps) {
  return (
    <div
      className={clsx(
        'rounded-lg overflow-hidden bg-white',
        variant === 'default'  && 'border border-[#D9D4CC]',
        variant === 'elevated' && 'border border-[#B8B2AA]',
        variant === 'bordered' && 'border-2 border-[#D9D4CC]',
        hoverable && 'cursor-pointer transition-[border-color,background-color] duration-150 hover:border-[#B8B2AA] hover:bg-[#FAFAFA]',
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
      className={clsx('px-5 py-4 border-b border-[#E8E4DE]', className)}
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
      className={clsx('px-5 py-4 border-t border-[#E8E4DE]', className)}
      {...props}
    />
  );
}
