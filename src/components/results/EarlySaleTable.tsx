/**
 * Таблица рекомендаций по ранней продаже
 */

import React from 'react';
import { Clock } from 'lucide-react';
import { formatCurrency } from '../../utils/format';
import { useIsMobile } from '@/hooks/useMediaQuery';
import type { CalculatorParams, EarlyDiscountDataItem, CustomMetric } from '../../types/calculator';

interface EarlySaleTableProps {
  params: CalculatorParams;
  data: EarlyDiscountDataItem[];
  customMetrics: Record<number, CustomMetric>;
  editingWeek: string | null;
  onEditWeek: (week: string | null) => void;
  onMetricEdit: (week: number, type: 'roi' | 'irr', value: string) => void;
  onClearMetric: (week: number) => void;
}

export const EarlySaleTable: React.FC<EarlySaleTableProps> = ({
  params,
  data,
  customMetrics,
  editingWeek,
  onEditWeek,
  onMetricEdit,
  onClearMetric
}) => {
  const isMobile = useIsMobile();

  return (
    <div>
      <h3 className="text-base sm:text-lg font-bold mb-3 sm:mb-4">
        {isMobile ? 'Ранняя продажа' : 'Рекомендации по ранней продаже'}
      </h3>
      <div className="mb-3 sm:mb-4 p-3 bg-indigo-50 dark:bg-indigo-950/50 rounded-lg border border-indigo-200 dark:border-indigo-800 text-xs sm:text-sm">
        <p className="text-indigo-800 dark:text-indigo-200">
          {isMobile
            ? `После ремонта (${params.renovationMonths} мес) → экспозиция (+${params.listingMonths} мес)`
            : <><strong>Период продажи:</strong> после завершения ремонта ({params.renovationMonths} мес) до конца экспозиции (+{params.listingMonths} мес)</>
          }
        </p>
        <p className="text-indigo-800 dark:text-indigo-200 mt-2 hidden sm:block">
          💡 <strong>Кликните на ROI или IRR</strong>, чтобы задать целевое значение и увидеть нужную цену.
        </p>
      </div>

      {/* Mobile Card View */}
      {isMobile ? (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {data.map((row, idx) => (
            <div key={idx} className="bg-card border border-border rounded-lg overflow-hidden shadow-sm">
              {/* Header row */}
              <div className="grid grid-cols-2 bg-muted/50 border-b border-border text-xs font-medium">
                <div className="px-3 py-2 border-r border-border">
                  <span className="text-muted-foreground">Неделя продажи</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="font-bold text-foreground">{row.week}</span>
                  </div>
                </div>
                <div className="px-3 py-2">
                  <span className="text-muted-foreground">Всего месяцев</span>
                  <div className="mt-0.5">
                    <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-full text-[10px] font-bold">
                      {row.totalMonths} мес
                    </span>
                  </div>
                </div>
              </div>

              {/* Data rows */}
              <div className="divide-y divide-border text-xs">
                {/* Скидка */}
                <div className="grid grid-cols-2 px-3 py-2">
                  <span className="text-muted-foreground">Скидка</span>
                  <span className="text-right text-red-600 dark:text-red-400 font-medium">
                    {row.discount >= 0 ? '-' : '+'}{formatCurrency(Math.abs(row.discount))}
                  </span>
                </div>
                {/* Цена */}
                <div className="grid grid-cols-2 px-3 py-2">
                  <span className="text-muted-foreground">Цена</span>
                  <span className="text-right font-bold text-foreground">{formatCurrency(row.price)}</span>
                </div>
                {/* Прибыль */}
                <div className="grid grid-cols-2 px-3 py-2">
                  <span className="text-muted-foreground">Прибыль</span>
                  <span className={`text-right font-medium ${row.profit > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {formatCurrency(row.profit)}
                  </span>
                </div>
                {/* ROI */}
                <div className="grid grid-cols-2 px-3 py-2">
                  <span className="text-muted-foreground">ROI %</span>
                  <button
                    onClick={() => onEditWeek(`${row.week}-roi`)}
                    className={`text-right font-medium ${parseFloat(row.roi) > 0 ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400'}`}
                  >
                    {row.roi}%
                  </button>
                </div>
                {/* IRR */}
                <div className="grid grid-cols-2 px-3 py-2">
                  <span className="text-muted-foreground">IRR %</span>
                  <button
                    onClick={() => onEditWeek(`${row.week}-irr`)}
                    className={`text-right font-medium ${parseFloat(row.irr) > 0 ? 'text-purple-600 dark:text-purple-400' : 'text-red-600 dark:text-red-400'}`}
                  >
                    {row.irr}%
                  </button>
                </div>
              </div>

              {/* Reset button if custom metric */}
              {customMetrics[row.week] && (
                <div className="px-3 py-2 border-t border-border bg-muted/30">
                  <button
                    onClick={() => onClearMetric(row.week)}
                    className="text-[10px] text-muted-foreground hover:text-red-600 px-2 py-0.5 border border-border rounded"
                  >
                    Сброс
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        /* Desktop Table View */
        <div className="overflow-x-auto max-h-96 overflow-y-auto">
          <table className="w-full text-xs sm:text-sm">
            <thead className="bg-muted sticky top-0">
              <tr>
                <th className="px-3 sm:px-4 py-2 text-left">Неделя продажи</th>
                <th className="px-3 sm:px-4 py-2 text-center">Всего месяцев</th>
                <th className="px-3 sm:px-4 py-2 text-right">Скидка</th>
                <th className="px-3 sm:px-4 py-2 text-right">Цена</th>
                <th className="px-3 sm:px-4 py-2 text-right">Прибыль</th>
                <th className="px-3 sm:px-4 py-2 text-right">ROI %</th>
                <th className="px-3 sm:px-4 py-2 text-right">IRR %</th>
                <th className="px-3 sm:px-4 py-2 text-center">Действие</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, idx) => (
                <tr key={idx} className="border-t border-border hover:bg-muted/50">
                  <td className="px-3 sm:px-4 py-2">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      {row.week}
                    </div>
                  </td>
                  <td className="px-3 sm:px-4 py-2 text-center">
                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-full text-[11px] sm:text-xs font-medium">
                      {row.totalMonths} мес
                    </span>
                  </td>
                  <td className="px-3 sm:px-4 py-2 text-right text-red-600 dark:text-red-400 font-medium">
                    {row.discount >= 0 ? '-' : '+'}{formatCurrency(Math.abs(row.discount))}
                  </td>
                  <td className="px-3 sm:px-4 py-2 text-right font-medium">{formatCurrency(row.price)}</td>
                  <td className="px-3 sm:px-4 py-2 text-right">
                    <span className={row.profit > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                      {formatCurrency(row.profit)}
                    </span>
                  </td>
                  <td className="px-3 sm:px-4 py-2 text-right">
                    {editingWeek === `${row.week}-roi` ? (
                      <input
                        type="number"
                        step="0.1"
                        autoFocus
                        defaultValue={row.roi}
                        onBlur={(e) => {
                          onMetricEdit(row.week, 'roi', e.target.value);
                          onEditWeek(null);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            onMetricEdit(row.week, 'roi', (e.target as HTMLInputElement).value);
                            onEditWeek(null);
                          } else if (e.key === 'Escape') {
                            onEditWeek(null);
                          }
                        }}
                        className="w-20 px-2 py-1 border border-blue-500 rounded text-right"
                      />
                    ) : (
                      <button
                        onClick={() => onEditWeek(`${row.week}-roi`)}
                        className={`${parseFloat(row.roi) > 0 ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400'} font-medium hover:bg-blue-50 dark:hover:bg-blue-900/30 px-2 py-1 rounded transition-colors`}
                      >
                        {row.roi}%
                      </button>
                    )}
                  </td>
                  <td className="px-3 sm:px-4 py-2 text-right">
                    {editingWeek === `${row.week}-irr` ? (
                      <input
                        type="number"
                        step="0.1"
                        autoFocus
                        defaultValue={row.irr}
                        onBlur={(e) => {
                          onMetricEdit(row.week, 'irr', e.target.value);
                          onEditWeek(null);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            onMetricEdit(row.week, 'irr', (e.target as HTMLInputElement).value);
                            onEditWeek(null);
                          } else if (e.key === 'Escape') {
                            onEditWeek(null);
                          }
                        }}
                        className="w-20 px-2 py-1 border border-purple-500 rounded text-right"
                      />
                    ) : (
                      <button
                        onClick={() => onEditWeek(`${row.week}-irr`)}
                        className={`${parseFloat(row.irr) > 0 ? 'text-purple-600 dark:text-purple-400' : 'text-red-600 dark:text-red-400'} font-medium hover:bg-purple-50 dark:hover:bg-purple-900/30 px-2 py-1 rounded transition-colors`}
                      >
                        {row.irr}%
                      </button>
                    )}
                  </td>
                  <td className="px-3 sm:px-4 py-2 text-center">
                    {customMetrics[row.week] && (
                      <button
                        onClick={() => onClearMetric(row.week)}
                        className="text-[11px] sm:text-xs text-muted-foreground hover:text-red-600 px-2 py-1 border border-border rounded hover:border-red-300 transition-colors"
                      >
                        Сброс
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-4 space-y-3">
        {/* Формулы - только десктоп */}
        <div className="hidden sm:block p-3 sm:p-4 bg-blue-50 dark:bg-blue-950/50 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="text-xs sm:text-sm text-blue-800 dark:text-blue-200 font-medium mb-2">📊 Формулы расчёта:</p>
          <div className="space-y-2 text-[11px] sm:text-sm text-blue-800 dark:text-blue-200">
            <div>
              <strong>ROI:</strong>
              <div className="mt-1 p-2 bg-card rounded border border-blue-100 dark:border-blue-900 font-mono text-[11px] sm:text-xs">
                ROI = (Чистая прибыль / Общие затраты) × 100%
              </div>
            </div>
            <div className="mt-3">
              <strong>IRR (годовая доходность):</strong>
              <div className="mt-1 p-2 bg-card rounded border border-blue-100 dark:border-blue-900 font-mono text-[11px] sm:text-xs">
                IRR = ((Чистая выручка / Общие затраты)^(12/месяцы) - 1) × 100%
              </div>
            </div>
          </div>
        </div>

        <div className="p-3 sm:p-4 bg-purple-50 dark:bg-purple-950/50 rounded-lg border border-purple-200 dark:border-purple-800 text-[11px] sm:text-sm text-purple-800 dark:text-purple-200">
          {isMobile
            ? <><strong>ℹ️</strong> Нед. 0 = после ремонта</>
            : <><strong>Примечание:</strong> Неделя 0 = сразу после ремонта, Неделя {Math.round(params.listingMonths * 4.33)} = конец срока экспозиции (плановая дата)</>
          }
        </div>
      </div>
    </div>
  );
};
