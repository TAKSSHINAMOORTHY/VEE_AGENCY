import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: 'paid' | 'pending' | 'completed';
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const isMixed = status === 'completed';
  const isPaid = status === 'paid';
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        isMixed
          ? 'bg-secondary/20 text-secondary-foreground border border-secondary/40'
          : isPaid
          ? 'bg-primary/10 text-primary border border-primary/20'
          : 'bg-destructive/10 text-destructive border border-destructive/20'
      )}
    >
      {isMixed ? 'Mixed' : isPaid ? 'Paid' : 'Pending'}
    </span>
  );
}
