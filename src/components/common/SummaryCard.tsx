import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface SummaryCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  subtitle?: string;
  className?: string;
}

export function SummaryCard({ title, value, icon, subtitle, className }: SummaryCardProps) {
  return (
    <div className={cn('bg-card border border-border rounded-xl p-5 shadow-sm transition-all duration-200 hover:shadow-md', className)}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground font-medium">{title}</p>
          <p className="text-2xl font-bold text-foreground">{value}</p>
          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>
        <div className="p-2 bg-primary/10 rounded-lg">
          {icon}
        </div>
      </div>
    </div>
  );
}
