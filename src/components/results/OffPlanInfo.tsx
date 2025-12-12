/**
 * Информация об остатке долга для off-plan сделок
 */

import React from 'react';
import { formatCurrency } from '../../utils/format';
import { useIsMobile } from '@/hooks/useMediaQuery';
import type { CalculatorParams, Calculations } from '../../types/calculator';

interface OffPlanInfoProps {
  params: CalculatorParams;
  calculations: Calculations;
}

export const OffPlanInfo: React.FC<OffPlanInfoProps> = ({ params, calculations }) => {
  const isMobile = useIsMobile();

  if (params.dealType !== 'offplan' || calculations.remainingDebt === undefined) {
    return null;
  }

  const saleDate = new Date();
  saleDate.setMonth(saleDate.getMonth() + calculations.totalMonths);
  const totalScheduledDebt = params.paymentSchedule.reduce((sum, p) => sum + (p.amount || 0), 0);

  return (
    <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950/30 dark:to-indigo-950/30 rounded-xl p-4 border-2 border-purple-200 dark:border-purple-800">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h3 className="text-sm sm:text-base font-bold text-purple-800 dark:text-purple-200 mb-2 flex items-center gap-2">
            {isMobile ? '💳 Долг на дату продажи' : '💳 Остаток долга застройщику на момент продажи'}
          </h3>
          <p className="text-xs text-purple-600 dark:text-purple-400 mb-3">
            {isMobile ? '📅' : '📅 Прогноз:'} <strong>{saleDate.toLocaleDateString('ru-RU')}</strong>
          </p>
          <p className="text-xs text-purple-600 dark:text-purple-400 hidden sm:block">
            Будет погашен из выручки при продаже
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl sm:text-3xl font-bold text-purple-700 dark:text-purple-300">
            {formatCurrency(calculations.remainingDebt)}
          </div>
          {params.paymentSchedule && params.paymentSchedule.length > 0 && (
            <div className="text-xs text-purple-600 dark:text-purple-400 mt-1">
              из {formatCurrency(totalScheduledDebt)} общего долга
            </div>
          )}
        </div>
      </div>

      {params.paymentSchedule && params.paymentSchedule.length > 0 && (
        <div className="mt-4 pt-4 border-t border-purple-200 dark:border-purple-700">
          <p className="text-xs text-purple-700 dark:text-purple-300 font-medium mb-2">
            {isMobile ? `🗓️ Платежи (${params.paymentSchedule.length})` : `🗓️ Детализация платежей (${params.paymentSchedule.length})`}:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {params.paymentSchedule.map((payment, idx) => {
              const paymentDate = payment.date ? new Date(payment.date) : null;
              const isPaid = paymentDate && paymentDate <= saleDate;

              return (
                <div
                  key={idx}
                  className={`flex justify-between items-center text-xs p-2 rounded ${
                    isPaid ? 'bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800' : 'bg-green-50 dark:bg-green-950/50 border border-green-200 dark:border-green-800'
                  }`}
                >
                  <span className={isPaid ? 'text-red-700 dark:text-red-300' : 'text-green-700 dark:text-green-300'}>
                    {isPaid ? '❌' : '✅'} #{idx + 1}: {payment.date || 'Дата не указана'}
                  </span>
                  <span className={`font-medium ${isPaid ? 'text-red-900 dark:text-red-200' : 'text-green-900 dark:text-green-200'}`}>
                    {formatCurrency(payment.amount)}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="mt-3 p-2 bg-yellow-50 dark:bg-yellow-950/50 rounded border border-yellow-200 dark:border-yellow-800 hidden sm:block">
            <p className="text-xs text-yellow-800 dark:text-yellow-200">
              <strong>ℹ️ Примечание:</strong> ❌ = Должен быть погашен при продаже | ✅ = Останется за покупателем
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
