/**
 * Таблица рекомендаций по ранней продаже
 */

import React from 'react';
import { Clock } from 'lucide-react';
import { formatCurrency } from '../../utils/format';
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
  return (
    <div>
      <h3 className="text-base sm:text-lg font-bold mb-3 sm:mb-4">Рекомендации по ранней продаже</h3>
      <div className="mb-3 sm:mb-4 p-3 bg-indigo-50 rounded-lg border border-indigo-200 text-xs sm:text-sm">
        <p className="text-indigo-800">
          <strong>Период продажи:</strong> после завершения ремонта ({params.renovationMonths} мес) до конца экспозиции (+{params.listingMonths} мес)
        </p>
        <p className="text-indigo-800 mt-2">
          💡 <strong>Кликните на ROI или IRR</strong>, чтобы задать целевое значение и увидеть нужную цену.
        </p>
      </div>

      <div className="overflow-x-auto max-h-96 overflow-y-auto">
        <table className="w-full text-xs sm:text-sm">
          <thead className="bg-gray-50 sticky top-0">
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
              <tr key={idx} className="border-t border-gray-200 hover:bg-gray-50">
                <td className="px-3 sm:px-4 py-2">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    Неделя {row.week}
                  </div>
                </td>
                <td className="px-3 sm:px-4 py-2 text-center">
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-[11px] sm:text-xs font-medium">
                    {row.totalMonths} мес
                  </span>
                </td>
                <td className="px-3 sm:px-4 py-2 text-right text-red-600 font-medium">
                  {row.discount >= 0 ? '-' : '+'}{formatCurrency(Math.abs(row.discount))}
                </td>
                <td className="px-3 sm:px-4 py-2 text-right font-medium">{formatCurrency(row.price)}</td>
                <td className="px-3 sm:px-4 py-2 text-right">
                  <span className={row.profit > 0 ? 'text-green-600' : 'text-red-600'}>
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
                      className={`${parseFloat(row.roi) > 0 ? 'text-blue-600' : 'text-red-600'} font-medium hover:bg-blue-50 px-2 py-1 rounded transition-colors`}
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
                      className={`${parseFloat(row.irr) > 0 ? 'text-purple-600' : 'text-red-600'} font-medium hover:bg-purple-50 px-2 py-1 rounded transition-colors`}
                    >
                      {row.irr}%
                    </button>
                  )}
                </td>
                <td className="px-3 sm:px-4 py-2 text-center">
                  {customMetrics[row.week] && (
                    <button
                      onClick={() => onClearMetric(row.week)}
                      className="text-[11px] sm:text-xs text-gray-500 hover:text-red-600 px-2 py-1 border border-gray-300 rounded hover:border-red-300 transition-colors"
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

      <div className="mt-4 space-y-3">
        <div className="p-3 sm:p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-xs sm:text-sm text-blue-800 font-medium mb-2">📊 Формулы расчёта:</p>
          <div className="space-y-2 text-[11px] sm:text-sm text-blue-800">
            <div>
              <strong>ROI:</strong>
              <div className="mt-1 p-2 bg-white rounded border border-blue-100 font-mono text-[11px] sm:text-xs">
                ROI = (Чистая прибыль / Общие затраты) × 100%
              </div>
            </div>
            <div className="mt-3">
              <strong>IRR (годовая доходность):</strong>
              <div className="mt-1 p-2 bg-white rounded border border-blue-100 font-mono text-[11px] sm:text-xs">
                IRR = ((Чистая выручка / Общие затраты)^(12/месяцы) - 1) × 100%
              </div>
            </div>
          </div>
        </div>

        <div className="p-3 sm:p-4 bg-purple-50 rounded-lg border border-purple-200 text-[11px] sm:text-sm text-purple-800">
          <strong>Примечание:</strong> Неделя 0 = сразу после ремонта, Неделя {Math.round(params.listingMonths * 4.33)} = конец срока экспозиции (плановая дата)
        </div>
      </div>
    </div>
  );
};
