import { AlertCircle } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface AlertProps {
  children: ReactNode;
  variant?: 'error' | 'info';
  className?: string;
}

const variants = {
  error: 'bg-red-50 text-red-700 ring-red-200',
  info: 'bg-slate-50 text-slate-700 ring-slate-200',
};

/** Inline message block for errors/info. */
export function Alert({ children, variant = 'error', className }: AlertProps) {
  return (
    <div
      role="alert"
      className={cn(
        'flex items-start gap-2 rounded-lg px-3 py-2.5 text-sm ring-1',
        variants[variant],
        className,
      )}
    >
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
      <span>{children}</span>
    </div>
  );
}
