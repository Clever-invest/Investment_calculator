/**
 * График анализа чувствительности
 */

import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { formatCurrency } from '../../utils/format';
import type { SensitivityDataItem } from '../../types/calculator';

interface SensitivityChartProps {
  data: SensitivityDataItem[];
}

export const SensitivityChart: React.FC<SensitivityChartProps> = ({ data }) => {
  return (
    <div>
      <h3 className="text-base sm:text-lg font-bold mb-3 sm:mb-4">Анализ чувствительности (±10%)</h3>
      <div className="h-64 md:h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="variation" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip formatter={(value: number) => formatCurrency(value)} />
            <Legend wrapperStyle={{ fontSize: '12px' }} />
            <Line type="monotone" dataKey="priceChange" stroke="#3b82f6" strokeWidth={2} name="Цена продажи" />
            <Line type="monotone" dataKey="renoChange" stroke="#8b5cf6" strokeWidth={2} name="Бюджет ремонта" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:gap-4">
        <div className="p-3 sm:p-4 bg-blue-50 rounded-lg">
          <p className="text-xs sm:text-sm text-gray-600 mb-2">Влияние цены продажи</p>
          <p className="text-[11px] sm:text-xs text-gray-500">
            +10%: {formatCurrency(data[4]?.priceChange || 0)}<br />
            -10%: {formatCurrency(data[0]?.priceChange || 0)}
          </p>
        </div>
        <div className="p-3 sm:p-4 bg-purple-50 rounded-lg">
          <p className="text-xs sm:text-sm text-gray-600 mb-2">Влияние бюджета ремонта</p>
          <p className="text-[11px] sm:text-xs text-gray-500">
            +10%: {formatCurrency(data[4]?.renoChange || 0)}<br />
            -10%: {formatCurrency(data[0]?.renoChange || 0)}
          </p>
        </div>
      </div>
    </div>
  );
};
