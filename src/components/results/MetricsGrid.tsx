/**
 * Сетка ключевых метрик (KPI карточки)
 */

import React from 'react';
import { DollarSign, TrendingUp, Calendar } from 'lucide-react';
import { formatCurrency } from '../../utils/format';
import { MetricCard } from '../shared/MetricCard';
import type { Calculations } from '../../types/calculator';

interface MetricsGridProps {
  calculations: Calculations;
}

export const MetricsGrid: React.FC<MetricsGridProps> = ({ calculations }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
      <MetricCard
        variant="profit"
        icon={<DollarSign className="w-5 h-5" />}
        label="Чистая прибыль"
        value={formatCurrency(calculations.profit.net)}
      />

      <MetricCard
        variant="roi"
        icon={<TrendingUp className="w-5 h-5" />}
        label="ROI"
        value={`${calculations.profit.roi.toFixed(1)}%`}
      />

      <MetricCard
        variant="irr"
        icon={<TrendingUp className="w-5 h-5" />}
        label="IRR"
        value={`${calculations.profit.irr.toFixed(1)}%`}
      />

      <MetricCard
        variant="timing"
        icon={<Calendar className="w-5 h-5" />}
        label="Срок"
        value={`${calculations.totalMonths} мес`}
      />
    </div>
  );
};
