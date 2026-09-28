import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface CardProps {
  children: ReactNode;
  className?: string;
}

/** Basic surface container. */
export function Card({ children, className }: CardProps) {
  return (
    <div className={cn('rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200', className)}>
      {children}
    </div>
  );
}
