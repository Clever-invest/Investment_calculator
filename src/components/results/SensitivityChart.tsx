/**
 * График анализа чувствительности
 * Этап 7: Адаптивность графиков для мобильных устройств
 */

import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useIsMobile } from '@/hooks/useMediaQuery';
import { formatCurrency } from '../../utils/format';
import type { SensitivityDataItem } from '../../types/calculator';

interface SensitivityChartProps {
  data: SensitivityDataItem[];
}

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

export const SensitivityChart: React.FC<SensitivityChartProps> = ({ data }) => {
  const isMobile = useIsMobile();
  
  // Безопасный доступ к данным
  const priceUp = data[4]?.priceChange || 0;
  const priceDown = data[0]?.priceChange || 0;
  const renoUp = data[4]?.renoChange || 0;
  const renoDown = data[0]?.renoChange || 0;

  return (
    <div className="space-y-4">
      <h3 className="text-base sm:text-lg font-bold">
        {isMobile ? 'Анализ чувствительности' : 'Анализ чувствительности (±10%)'}
      </h3>
      
      {/* Адаптивная высота: 220px мобильный, 280px планшет, 350px desktop */}
      <div className="h-[220px] sm:h-[280px] md:h-[350px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart 
            data={data}
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
              dataKey="variation" 
              tick={{ 
                fontSize: isMobile ? 10 : 12,
                fill: 'hsl(var(--muted-foreground))'
              }}
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
              formatter={(value: number) => [formatCurrency(value), 'Прибыль']}
              contentStyle={{
                backgroundColor: 'hsl(var(--popover))',
                border: '1px solid hsl(var(--border))',
                borderRadius: 'var(--radius)',
                fontSize: isMobile ? 12 : 14,
              }}
              labelStyle={{ color: 'hsl(var(--popover-foreground))' }}
            />
            <Legend 
              wrapperStyle={{ 
                fontSize: isMobile ? '10px' : '12px',
                paddingTop: isMobile ? '8px' : '12px'
              }}
              iconSize={isMobile ? 10 : 14}
            />
            <Line 
              type="monotone" 
              dataKey="priceChange" 
              stroke="hsl(var(--primary))"
              strokeWidth={isMobile ? 2 : 2.5}
              dot={{ r: isMobile ? 3 : 4 }}
              activeDot={{ r: isMobile ? 5 : 6 }}
              name={isMobile ? 'Цена' : 'Цена продажи'}
            />
            <Line 
              type="monotone" 
              dataKey="renoChange" 
              stroke="#8b5cf6"
              strokeWidth={isMobile ? 2 : 2.5}
              dot={{ r: isMobile ? 3 : 4 }}
              activeDot={{ r: isMobile ? 5 : 6 }}
              name={isMobile ? 'Ремонт' : 'Бюджет ремонта'}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Карточки с влиянием факторов */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="bg-roi-50 border-roi-200">
          <CardContent className="p-3 sm:p-4">
            <p className="text-xs sm:text-sm font-medium text-roi-700 mb-2 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              {isMobile ? 'Цена' : 'Влияние цены продажи'}
            </p>
            <div className="space-y-1 text-[11px] sm:text-xs text-roi-600">
              <div className="flex justify-between">
                <span>+10%:</span>
                <span className="font-medium">{formatCurrency(priceUp)}</span>
              </div>
              <div className="flex justify-between">
                <span>−10%:</span>
                <span className="font-medium">{formatCurrency(priceDown)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-irr-50 border-irr-200">
          <CardContent className="p-3 sm:p-4">
            <p className="text-xs sm:text-sm font-medium text-irr-700 mb-2 flex items-center gap-1.5">
              <TrendingDown className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              {isMobile ? 'Ремонт' : 'Влияние бюджета ремонта'}
            </p>
            <div className="space-y-1 text-[11px] sm:text-xs text-irr-600">
              <div className="flex justify-between">
                <span>+10%:</span>
                <span className="font-medium">{formatCurrency(renoUp)}</span>
              </div>
              <div className="flex justify-between">
                <span>−10%:</span>
                <span className="font-medium">{formatCurrency(renoDown)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
