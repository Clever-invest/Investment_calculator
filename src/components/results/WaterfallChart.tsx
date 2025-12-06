/**
 * Водопад: от цены продажи к чистой прибыли
 * Этап 7: Адаптивность графиков для мобильных устройств
 */

import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useIsMobile } from '@/hooks/useMediaQuery';
import { formatCurrency } from '../../utils/format';
import type { WaterfallDataItem, Calculations } from '../../types/calculator';

interface WaterfallChartProps {
  data: WaterfallDataItem[];
  calculations: Calculations;
}

// Сокращённые названия для мобильных устройств
const SHORT_LABELS: Record<string, string> = {
  'Продажа': 'Прод.',
  'DLD Fee': 'DLD',
  'Комиссия агента': 'Агент',
  'Покупка': 'Покуп.',
  'Registration Fee': 'Рег.',
  'NOC': 'NOC',
  'Ремонт': 'Рем.',
  'Service Charges': 'SC',
  'Ипотека': 'Ипот.',
  'Прибыль': 'Приб.',
};

// Форматирование валюты для оси (сокращённый формат)
const formatAxisCurrency = (value: number, isMobile: boolean): string => {
  if (isMobile) {
    if (Math.abs(value) >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    }
    if (Math.abs(value) >= 1000) {
      return `${(value / 1000).toFixed(0)}K`;
    }
    return value.toString();
  }
  return formatCurrency(value);
};

export const WaterfallChart: React.FC<WaterfallChartProps> = ({ data, calculations }) => {
  const isMobile = useIsMobile();
  
  // Данные с сокращёнными названиями для мобильных
  const chartData = isMobile
    ? data.map(item => ({
        ...item,
        name: SHORT_LABELS[item.name] || item.name,
      }))
    : data;

  return (
    <div className="space-y-4">
      <h3 className="text-base sm:text-lg font-bold">
        {isMobile ? 'Водопад прибыли' : 'Водопад: от цены продажи к чистой прибыли'}
      </h3>
      
      {/* Адаптивная высота: 250px мобильный, 320px планшет, 400px desktop */}
      <div className="h-[250px] sm:h-[320px] md:h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            data={chartData}
            margin={isMobile 
              ? { top: 5, right: 5, left: 0, bottom: 5 }
              : { top: 5, right: 30, left: 20, bottom: 5 }
            }
          >
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="hsl(var(--border))"
              opacity={0.5}
            />
            <XAxis 
              dataKey="name" 
              angle={isMobile ? -45 : -30}
              textAnchor="end"
              tick={{ 
                fontSize: isMobile ? 9 : 12,
                fill: 'hsl(var(--muted-foreground))'
              }}
              height={isMobile ? 50 : 60}
              interval={0}
            />
            <YAxis 
              tick={{ 
                fontSize: isMobile ? 9 : 11,
                fill: 'hsl(var(--muted-foreground))'
              }}
              tickFormatter={(value) => formatAxisCurrency(value, isMobile)}
              width={isMobile ? 45 : 80}
            />
            <Tooltip 
              formatter={(value: number) => [formatCurrency(value), 'Сумма']}
              contentStyle={{
                backgroundColor: 'hsl(var(--popover))',
                border: '1px solid hsl(var(--border))',
                borderRadius: 'var(--radius)',
                fontSize: isMobile ? 12 : 14,
              }}
              labelStyle={{ color: 'hsl(var(--popover-foreground))' }}
            />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Точка безубыточности - Card для консистентности */}
      <Card className="bg-warning-50 border-warning-200">
        <CardContent className="p-3 sm:p-4">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-warning-600 mt-0.5 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-sm sm:text-base font-medium text-warning-800">
                Точка безубыточности
              </p>
              <p className="text-xs sm:text-sm text-warning-700 mt-1">
                Мин. цена продажи: <span className="font-bold">{formatCurrency(calculations.breakEven)}</span>
                {!isMobile && (
                  <>
                    <br />
                    <span className="font-mono text-[10px] sm:text-xs">
                      Затраты ÷ (1 − Комиссия% × 1.05)
                    </span>
                  </>
                )}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
