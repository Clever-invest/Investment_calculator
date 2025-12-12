import { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export type MetricVariant = 'profit' | 'roi' | 'irr' | 'timing' | 'warning';

interface MetricCardProps {
  variant: MetricVariant;
  icon: ReactNode;
  label: string;
  value: string | number;
  sublabel?: string;
  badge?: string;
  compact?: boolean;
  className?: string;
}

const VARIANTS: Record<MetricVariant, { 
  gradient: string; 
  border: string; 
  text: string;
  badgeClass: string;
}> = {
  profit: {
    gradient: 'bg-gradient-to-br from-profit-50 to-profit-100 dark:from-profit-950 dark:to-profit-800/30',
    border: 'border-profit-200 dark:border-profit-800',
    text: 'text-profit-600 dark:text-profit-400',
    badgeClass: 'bg-profit-100 dark:bg-profit-950 text-profit-600 dark:text-profit-400 border-profit-200 dark:border-profit-800',
  },
  roi: {
    gradient: 'bg-gradient-to-br from-roi-50 to-roi-100 dark:from-roi-950 dark:to-roi-800/30',
    border: 'border-roi-200 dark:border-roi-800',
    text: 'text-roi-600 dark:text-roi-400',
    badgeClass: 'bg-roi-100 dark:bg-roi-950 text-roi-600 dark:text-roi-400 border-roi-200 dark:border-roi-800',
  },
  irr: {
    gradient: 'bg-gradient-to-br from-irr-50 to-irr-100 dark:from-irr-950 dark:to-irr-800/30',
    border: 'border-irr-200 dark:border-irr-800',
    text: 'text-irr-600 dark:text-irr-400',
    badgeClass: 'bg-irr-100 dark:bg-irr-950 text-irr-600 dark:text-irr-400 border-irr-200 dark:border-irr-800',
  },
  timing: {
    gradient: 'bg-gradient-to-br from-timing-50 to-timing-100 dark:from-timing-950 dark:to-timing-800/30',
    border: 'border-timing-200 dark:border-timing-800',
    text: 'text-timing-600 dark:text-timing-400',
    badgeClass: 'bg-timing-100 dark:bg-timing-950 text-timing-600 dark:text-timing-400 border-timing-200 dark:border-timing-800',
  },
  warning: {
    gradient: 'bg-gradient-to-br from-warning-50 to-warning-100 dark:from-warning-950 dark:to-warning-800/30',
    border: 'border-warning-200 dark:border-warning-800',
    text: 'text-warning-600 dark:text-warning-400',
    badgeClass: 'bg-warning-100 dark:bg-warning-950 text-warning-600 dark:text-warning-400 border-warning-200 dark:border-warning-800',
  },
};

export function MetricCard({ 
  variant, 
  icon, 
  label, 
  value, 
  sublabel,
  badge,
  compact = false,
  className = '' 
}: MetricCardProps) {
  const styles = VARIANTS[variant];
  
  // Compact mode для sticky header - вертикальная компоновка
  if (compact) {
    return (
      <div 
        role="status"
        aria-label={`${label}: ${value}`}
        className={cn(
          'flex flex-col gap-0.5 px-3 py-2 rounded-xl border',
          styles.gradient,
          styles.border,
          className
        )}
      >
        <div className="flex items-center gap-1.5">
          <span className={cn('w-3.5 h-3.5', styles.text)} aria-hidden="true">{icon}</span>
          <span className="text-xs text-muted-foreground">{label}</span>
        </div>
        <span className={cn('text-sm font-bold truncate', styles.text)}>{value}</span>
      </div>
    );
  }
  
  return (
    <Card 
      role="status"
      aria-label={`${label}: ${value}`}
      className={cn(
        styles.gradient,
        styles.border,
        'py-3 gap-2',
        className
      )}
    >
      <CardHeader className="pb-0 px-3 sm:px-4">
        <CardTitle className="text-xs sm:text-sm font-medium flex items-center gap-2 text-muted-foreground">
          <span className={styles.text} aria-hidden="true">{icon}</span>
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-3 sm:px-4 pt-0">
        <div className={cn('text-xl sm:text-2xl font-bold', styles.text)}>
          {value}
        </div>
        {sublabel && (
          <p className="text-xs text-muted-foreground mt-1">{sublabel}</p>
        )}
        {badge && (
          <Badge 
            variant="outline" 
            className={cn('mt-2', styles.badgeClass)}
          >
            {badge}
          </Badge>
        )}
      </CardContent>
    </Card>
  );
}

// Компактная версия для мобильных (badge-style)
interface MetricBadgeProps {
  variant: MetricVariant;
  label: string;
  value: string | number;
}

export function MetricBadge({ variant, label, value }: MetricBadgeProps) {
  const styles = VARIANTS[variant];
  
  return (
    <Badge 
      variant="outline"
      className={cn(
        'px-3 py-1.5 text-xs gap-2',
        styles.gradient,
        styles.border
      )}
    >
      <span className="text-muted-foreground">{label}:</span>
      <span className={cn('font-bold', styles.text)}>{value}</span>
    </Badge>
  );
}

export default MetricCard;
