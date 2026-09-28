import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';
import { Spinner } from './Spinner';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

const variants: Record<Variant, string> = {
  primary: 'bg-slate-900 text-white hover:bg-slate-800 focus-visible:ring-slate-900',
  secondary:
    'bg-white text-slate-800 ring-1 ring-slate-300 hover:bg-slate-50 focus-visible:ring-slate-400',
  ghost: 'bg-transparent text-slate-600 hover:bg-slate-100 focus-visible:ring-slate-300',
  danger: 'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-600',
};

const sizes: Record<Size, string> = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-11 px-4 text-sm',
};

/** Primary interactive button with variants and a loading state. */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading = false, disabled, className, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-60',
          variants[variant],
          sizes[size],
          className,
        )}
        {...props}
      >
        {loading && <Spinner className="h-4 w-4 text-current" />}
        {children}
      </button>
    );
  },
);

Button.displayName = 'Button';
