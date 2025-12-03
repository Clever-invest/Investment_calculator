/**
 * Сетка ключевых метрик (KPI карточки)
 */

import React from 'react';
import { DollarSign, TrendingUp, Calendar } from 'lucide-react';
import { formatCurrency } from '../../utils/format';
import type { Calculations } from '../../types/calculator';

interface MetricsGridProps {
  calculations: Calculations;
}

export const MetricsGrid: React.FC<MetricsGridProps> = ({ calculations }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-3 sm:p-4 border border-green-200">
        <div className="flex items-center gap-2 mb-2">
          <DollarSign className="w-5 h-5 text-green-600" />
          <span className="text-xs sm:text-sm font-medium text-gray-600">Чистая прибыль</span>
        </div>
        <div className="text-xl sm:text-2xl font-bold text-green-600">
          {formatCurrency(calculations.profit.net)}
        </div>
      </div>

      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-3 sm:p-4 border border-blue-200">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          <span className="text-xs sm:text-sm font-medium text-gray-600">ROI</span>
        </div>
        <div className="text-xl sm:text-2xl font-bold text-blue-600">
          {calculations.profit.roi.toFixed(1)}%
        </div>
      </div>

      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-3 sm:p-4 border border-purple-200">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="w-5 h-5 text-purple-600" />
          <span className="text-xs sm:text-sm font-medium text-gray-600">IRR</span>
        </div>
        <div className="text-xl sm:text-2xl font-bold text-purple-600">
          {calculations.profit.irr.toFixed(1)}%
        </div>
      </div>

      <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-3 sm:p-4 border border-orange-200">
        <div className="flex items-center gap-2 mb-2">
          <Calendar className="w-5 h-5 text-orange-600" />
          <span className="text-xs sm:text-sm font-medium text-gray-600">Срок</span>
        </div>
        <div className="text-xl sm:text-2xl font-bold text-orange-600">
          {calculations.totalMonths} мес
        </div>
      </div>
    </div>
  );
};
