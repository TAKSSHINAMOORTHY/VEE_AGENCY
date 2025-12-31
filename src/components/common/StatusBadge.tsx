import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: 'completed' | 'pending';
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        status === 'completed'
          ? 'bg-primary/10 text-primary border border-primary/20'
          : 'bg-destructive/10 text-destructive border border-destructive/20'
      )}
    >
      {status === 'completed' ? 'Completed' : 'Pending'}
    </span>
  );
}
