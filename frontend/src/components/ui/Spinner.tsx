import { cn } from '@/lib/cn';

interface SpinnerProps {
  className?: string;
  label?: string;
}

/** Simple accessible loading spinner. */
export function Spinner({ className, label = 'Loading' }: SpinnerProps) {
  return (
    <span
      role="status"
      aria-label={label}
      className={cn(
        'inline-block animate-spin rounded-full border-2 border-current border-t-transparent',
        'h-5 w-5 text-slate-400',
        className,
      )}
    />
  );
}

/** Full-area centered loading state. */
export function LoadingScreen({ label = 'Memuat...' }: { label?: string }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-slate-50">
      <Spinner className="h-8 w-8 text-slate-500" />
      <p className="text-sm text-slate-500">{label}</p>
    </div>
  );
}
