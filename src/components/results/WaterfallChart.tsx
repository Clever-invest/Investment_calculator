/**
 * Водопад: от цены продажи к чистой прибыли
 */

import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { AlertCircle } from 'lucide-react';
import { formatCurrency } from '../../utils/format';
import type { WaterfallDataItem, Calculations } from '../../types/calculator';

interface WaterfallChartProps {
  data: WaterfallDataItem[];
  calculations: Calculations;
}

export const WaterfallChart: React.FC<WaterfallChartProps> = ({ data, calculations }) => {
  return (
    <div>
      <h3 className="text-base sm:text-lg font-bold mb-3 sm:mb-4">Водопад: от цены продажи к чистой прибыли</h3>
      <div className="h-64 md:h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" angle={-30} tick={{ fontSize: 10 }} height={60} />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip formatter={(value: number) => formatCurrency(value)} />
            <Bar dataKey="value">
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-yellow-50 rounded-lg border border-yellow-200">
        <div className="flex items-start gap-2">
          <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600 mt-0.5" />
          <div>
            <p className="text-sm sm:text-base font-medium text-yellow-800">Точка безубыточности</p>
            <p className="text-xs sm:text-sm text-yellow-700 mt-1">
              Минимальная цена продажи: <span className="font-bold">{formatCurrency(calculations.breakEven)}</span><br />
              Формула: <span className="font-mono">Затраты ÷ (1 − Комиссия продавца% × 1.05)</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
