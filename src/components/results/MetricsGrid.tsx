/**
 * Сетка ключевых метрик (KPI карточки)
 * Поддерживает compact режим для sticky header
 */

import React from 'react';
import { DollarSign, TrendingUp, Calendar, Percent } from 'lucide-react';
import { formatCurrency } from '../../utils/format';
import { MetricCard } from '../shared/MetricCard';
import { cn } from '@/lib/utils';
import type { Calculations } from '../../types/calculator';

interface MetricsGridProps {
  calculations: Calculations;
  compact?: boolean;
  className?: string;
}

export const MetricsGrid: React.FC<MetricsGridProps> = ({ 
  calculations, 
  compact = false,
  className 
}) => {
  const metrics = [
    {
      variant: 'profit' as const,
      icon: <DollarSign className={cn(compact ? 'w-4 h-4' : 'w-5 h-5')} />,
      label: 'Чистая прибыль',
      shortLabel: 'Прибыль',
      value: formatCurrency(calculations.profit.net),
    },
    {
      variant: 'roi' as const,
      icon: <TrendingUp className={cn(compact ? 'w-4 h-4' : 'w-5 h-5')} />,
      label: 'ROI',
      shortLabel: 'ROI',
      value: `${calculations.profit.roi.toLocaleString('ru-RU', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`,
    },
    {
      variant: 'irr' as const,
      icon: <Percent className={cn(compact ? 'w-4 h-4' : 'w-5 h-5')} />,
      label: 'IRR годовой',
      shortLabel: 'IRR',
      value: `${calculations.profit.irr.toLocaleString('ru-RU', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`,
    },
    {
      variant: 'timing' as const,
      icon: <Calendar className={cn(compact ? 'w-4 h-4' : 'w-5 h-5')} />,
      label: 'Срок сделки',
      shortLabel: 'Срок',
      value: `${calculations.totalMonths} мес`,
    },
  ];

  // Compact mode: сетка 2x2 без скролла
  if (compact) {
    return (
      <div 
        role="region"
        aria-label="Ключевые показатели сделки"
        className={cn(
          'grid grid-cols-2 gap-2',
          className
        )}
      >
        {metrics.map((metric) => (
          <MetricCard
            key={metric.variant}
            variant={metric.variant}
            icon={metric.icon}
            label={metric.shortLabel}
            value={metric.value}
            compact
          />
        ))}
      </div>
    );
  }

  // Full mode: responsive grid
  return (
    <div 
      role="region"
      aria-label="Ключевые показатели сделки"
      className={cn(
        'grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4',
        className
      )}
    >
      {metrics.map((metric) => (
        <MetricCard
          key={metric.variant}
          variant={metric.variant}
          icon={metric.icon}
          label={metric.label}
          value={metric.value}
        />
      ))}
    </div>
  );
};
