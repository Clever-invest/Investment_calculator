/**
 * Детальный расчёт с формулами
 * Mobile: только результаты, короткие лейблы
 * Desktop: полные формулы и пояснения
 */

import React from 'react';
import { formatCurrency } from '../../utils/format';
import { useIsMobile } from '@/hooks/useMediaQuery';
import type { CalculatorParams, Calculations } from '../../types/calculator';

// Адаптивные заголовки
const STEP_TITLES = {
  costs: { short: '💰 Затраты', full: '💰 Шаг 1: Расчет общих затрат' },
  revenue: { short: '💵 Выручка', full: '💵 Шаг 2: Расчет чистой выручки' },
  profit: { short: '✅ Прибыль', full: '✅ Шаг 3: Чистая прибыль' },
  profitLoss: { short: '⚠️ Убыток', full: '⚠️ Шаг 3: Чистая прибыль' },
  metrics: { short: '📊 Метрики', full: '📊 Шаг 4: Метрики доходности' },
  breakeven: { short: '⚖️ Безубыток', full: '⚖️ Точка безубыточности' },
};

// Компонент строки расчёта
interface CalcRowProps {
  label: string;
  shortLabel?: string;
  value: string;
  formula?: string;
  isAdd?: boolean;
  isSub?: boolean;
  highlight?: 'purple' | 'white';
  isMobile: boolean;
}

const CalcRow: React.FC<CalcRowProps> = ({
  label, shortLabel, value, formula, isAdd, isSub, highlight, isMobile
}) => {
  const displayLabel = isMobile && shortLabel ? shortLabel : label;
  const valueColor = isAdd ? 'text-orange-600' : isSub ? 'text-red-600' : 'text-foreground';
  const prefix = isAdd ? '+ ' : isSub ? '- ' : '';
  const bgClass = highlight === 'purple'
    ? 'bg-purple-50 border border-purple-200'
    : 'bg-card';

  return (
    <div className={`flex justify-between items-center ${bgClass} p-2 sm:p-3 rounded-lg`}>
      <span className="text-muted-foreground text-xs sm:text-sm">{displayLabel}</span>
      <span className={`font-bold text-xs sm:text-sm ${valueColor}`}>
        {prefix}{value}
        {!isMobile && formula && (
          <span className="text-[10px] text-muted-foreground ml-2">({formula})</span>
        )}
      </span>
    </div>
  );
};

interface DetailedBreakdownProps {
  params: CalculatorParams;
  calculations: Calculations;
}

export const DetailedBreakdown: React.FC<DetailedBreakdownProps> = ({ params, calculations }) => {
  const isMobile = useIsMobile();
  const T = (key: keyof typeof STEP_TITLES) => isMobile ? STEP_TITLES[key].short : STEP_TITLES[key].full;
  const paidPercent = params.purchasePrice > 0 ? ((params.paidAmount / params.purchasePrice) * 100).toFixed(0) : 0;

  return (
    <div>
      <h3 className="text-base sm:text-lg font-bold mb-3 sm:mb-4">
        {isMobile ? '📐 Расчёт' : '📐 Детальный расчет с формулами'}
      </h3>

      <div className="space-y-3 sm:space-y-6 text-xs sm:text-sm">
        {/* Расходы */}
        <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-lg sm:rounded-xl p-3 sm:p-5 border-2 border-orange-200">
          <h4 className="text-sm sm:text-lg font-bold text-orange-800 mb-2 sm:mb-4">
            {T('costs')}
          </h4>

          <div className="space-y-1.5 sm:space-y-3 font-mono">
            {params.dealType === 'offplan' ? (
              <>
                <CalcRow
                  label="🏗️ Стоимость от застройщика"
                  shortLabel="🏗️ От застройщика"
                  value={formatCurrency(params.purchasePrice)}
                  highlight="purple"
                  isMobile={isMobile}
                />
                <CalcRow
                  label={`Оплачено (${paidPercent}%)`}
                  shortLabel={`Оплачено ${paidPercent}%`}
                  value={formatCurrency(params.paidAmount)}
                  isMobile={isMobile}
                />
              </>
            ) : (
              <CalcRow
                label="Цена покупки"
                value={formatCurrency(params.purchasePrice)}
                isMobile={isMobile}
              />
            )}

            <CalcRow
              label={`DLD/регистрация (${params.dldFees}%)`}
              shortLabel={`DLD ${params.dldFees}%`}
              value={formatCurrency(calculations.costs.dld)}
              formula={`${formatCurrency(params.purchasePrice)} × ${params.dldFees}%`}
              isAdd
              isMobile={isMobile}
            />

            <CalcRow
              label={`Комиссия брокера покупка (${params.buyerCommission}%)`}
              shortLabel={`Комиссия ${params.buyerCommission}%`}
              value={formatCurrency(calculations.costs.buyerCommission)}
              formula={`${formatCurrency(params.purchasePrice)} × ${params.buyerCommission}%`}
              isAdd
              isMobile={isMobile}
            />

            <CalcRow
              label="VAT на комиссию (5%)"
              shortLabel="VAT 5%"
              value={formatCurrency(calculations.costs.buyerCommissionVAT)}
              formula={`${formatCurrency(calculations.costs.buyerCommission)} × 5%`}
              isAdd
              isMobile={isMobile}
            />

            <CalcRow
              label="Бюджет ремонта"
              shortLabel="Ремонт"
              value={formatCurrency(params.renovationBudget)}
              isAdd
              isMobile={isMobile}
            />

            <CalcRow
              label={`Резерв (${params.contingency}%)`}
              shortLabel={`Резерв ${params.contingency}%`}
              value={formatCurrency(calculations.costs.renovation - params.renovationBudget)}
              formula={`${formatCurrency(params.renovationBudget)} × ${params.contingency}%`}
              isAdd
              isMobile={isMobile}
            />

            <CalcRow
              label="Service Charge"
              shortLabel="SC"
              value={formatCurrency(calculations.costs.serviceCharge)}
              formula={`${formatCurrency(params.serviceChargeYearly)}/12 × ${calculations.totalMonths} мес`}
              isAdd
              isMobile={isMobile}
            />

            <CalcRow
              label="DEWA AC"
              shortLabel="DEWA"
              value={formatCurrency(calculations.costs.dewaAc)}
              formula={`${formatCurrency(params.dewaAcMonthly)} × ${calculations.totalMonths} мес`}
              isAdd
              isMobile={isMobile}
            />

            <CalcRow
              label="Trustee Office Fee"
              shortLabel="Trustee"
              value={formatCurrency(params.trusteeOfficeFee)}
              isAdd
              isMobile={isMobile}
            />

            {/* Итог */}
            <div className="border-t-2 sm:border-t-4 border-orange-400 pt-2 sm:pt-3 mt-2 sm:mt-3">
              <div className="flex justify-between items-center bg-orange-100 p-2 sm:p-4 rounded-lg">
                <span className="font-bold text-sm sm:text-lg text-orange-900">{isMobile ? 'ИТОГО' : '= ОБЩИЕ ЗАТРАТЫ'}</span>
                <span className="font-bold text-lg sm:text-2xl text-orange-900">{formatCurrency(calculations.costs.total)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Выручка */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg sm:rounded-xl p-3 sm:p-5 border-2 border-blue-200">
          <h4 className="text-sm sm:text-lg font-bold text-blue-800 mb-2 sm:mb-4">
            {T('revenue')}
          </h4>

          <div className="space-y-1.5 sm:space-y-3 font-mono">
            <CalcRow
              label="Цена продажи"
              shortLabel="Продажа"
              value={formatCurrency(params.sellingPrice)}
              isMobile={isMobile}
            />

            <CalcRow
              label={`Комиссия продажа (${params.sellerCommission}%)`}
              shortLabel={`Комиссия ${params.sellerCommission}%`}
              value={formatCurrency(calculations.revenue.sellerCommission)}
              formula={`${formatCurrency(params.sellingPrice)} × ${params.sellerCommission}%`}
              isSub
              isMobile={isMobile}
            />

            <CalcRow
              label="VAT на комиссию (5%)"
              shortLabel="VAT 5%"
              value={formatCurrency(calculations.revenue.sellerCommissionVAT)}
              formula={`${formatCurrency(calculations.revenue.sellerCommission)} × 5%`}
              isSub
              isMobile={isMobile}
            />

            {params.dealType === 'offplan' && calculations.remainingDebt && calculations.remainingDebt > 0 && (
              <CalcRow
                label="💳 Остаток долга застройщику"
                shortLabel="💳 Долг"
                value={formatCurrency(calculations.remainingDebt)}
                isSub
                highlight="purple"
                isMobile={isMobile}
              />
            )}

            {/* Итог */}
            <div className="border-t-2 sm:border-t-4 border-blue-400 pt-2 sm:pt-3 mt-2 sm:mt-3">
              <div className="flex justify-between items-center bg-blue-100 p-2 sm:p-4 rounded-lg">
                <span className="font-bold text-sm sm:text-lg text-blue-900">{isMobile ? 'ИТОГО' : '= ЧИСТАЯ ВЫРУЧКА'}</span>
                <span className="font-bold text-lg sm:text-2xl text-blue-900">{formatCurrency(calculations.revenue.net)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Прибыль */}
        <div className={`bg-gradient-to-br ${calculations.profit.net >= 0 ? 'from-green-50 to-emerald-50 border-green-200' : 'from-red-50 to-rose-50 border-red-200'} rounded-lg sm:rounded-xl p-3 sm:p-5 border-2`}>
          <h4 className={`text-sm sm:text-lg font-bold ${calculations.profit.net >= 0 ? 'text-green-800' : 'text-red-800'} mb-2 sm:mb-4`}>
            {calculations.profit.net >= 0 ? T('profit') : T('profitLoss')}
          </h4>

          <div className="space-y-1.5 sm:space-y-3 font-mono">
            <CalcRow
              label="Чистая выручка"
              shortLabel="Выручка"
              value={formatCurrency(calculations.revenue.net)}
              isMobile={isMobile}
            />
            <CalcRow
              label="Общие затраты"
              shortLabel="Затраты"
              value={formatCurrency(calculations.costs.total)}
              isSub
              isMobile={isMobile}
            />

            {/* Итог */}
            <div className={`border-t-2 sm:border-t-4 ${calculations.profit.net >= 0 ? 'border-green-400' : 'border-red-400'} pt-2 sm:pt-3 mt-2 sm:mt-3`}>
              <div className={`flex justify-between items-center ${calculations.profit.net >= 0 ? 'bg-green-100' : 'bg-red-100'} p-2 sm:p-4 rounded-lg`}>
                <span className={`font-bold text-sm sm:text-lg ${calculations.profit.net >= 0 ? 'text-green-900' : 'text-red-900'}`}>
                  {isMobile ? 'ИТОГО' : '= ЧИСТАЯ ПРИБЫЛЬ'}
                </span>
                <span className={`font-bold text-lg sm:text-2xl ${calculations.profit.net >= 0 ? 'text-green-900' : 'text-red-900'}`}>
                  {formatCurrency(calculations.profit.net)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Метрики доходности */}
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg sm:rounded-xl p-3 sm:p-5 border-2 border-purple-200">
          <h4 className="text-sm sm:text-lg font-bold text-purple-800 mb-2 sm:mb-4">{T('metrics')}</h4>
          <div className="space-y-2 sm:space-y-4">
            {/* ROI */}
            <div className="bg-card p-2 sm:p-4 rounded-lg border border-purple-200 dark:border-purple-900">
              <div className="flex justify-between items-center">
                <span className="font-bold text-purple-900 text-sm">{isMobile ? 'ROI' : 'ROI (Return on Investment)'}</span>
                <span className="font-bold text-lg sm:text-xl text-purple-900">{calculations.profit.roi.toFixed(2)}%</span>
              </div>
              {!isMobile && (
                <div className="font-mono text-xs mt-2 space-y-1 text-muted-foreground">
                  <div>= (Прибыль ÷ Затраты) × 100%</div>
                  <div className="text-purple-700">= ({formatCurrency(calculations.profit.net)} ÷ {formatCurrency(calculations.costs.total)}) × 100%</div>
                </div>
              )}
            </div>

            {/* IRR */}
            <div className="bg-card p-2 sm:p-4 rounded-lg border border-purple-200 dark:border-purple-900">
              <div className="flex justify-between items-center">
                <span className="font-bold text-purple-900 text-sm">{isMobile ? 'IRR (год)' : 'IRR — годовая доходность'}</span>
                <span className="font-bold text-lg sm:text-xl text-purple-900">{calculations.profit.irr.toFixed(2)}%</span>
              </div>
              {!isMobile && (
                <div className="font-mono text-xs mt-2 space-y-1 text-muted-foreground">
                  <div>= ((Выручка ÷ Затраты)^(12/мес) - 1) × 100%</div>
                  <div className="text-purple-700">= (({formatCurrency(calculations.revenue.net)} ÷ {formatCurrency(calculations.costs.total)})^(12/{calculations.totalMonths}) - 1) × 100%</div>
                </div>
              )}
            </div>
          </div>

          {/* Пояснения - только десктоп */}
          {!isMobile && (
            <div className="mt-4 p-3 bg-indigo-50 rounded-lg border border-indigo-200">
              <p className="text-sm text-indigo-900"><strong>💡 ROI vs IRR:</strong></p>
              <ul className="text-xs text-indigo-800 mt-2 space-y-1 ml-4 list-disc">
                <li><strong>ROI</strong> — общая доходность, НЕ учитывает время</li>
                <li><strong>IRR</strong> — годовая ставка, учитывает срок</li>
              </ul>
            </div>
          )}
        </div>

        {/* Точка безубыточности */}
        <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-lg sm:rounded-xl p-3 sm:p-5 border-2 border-yellow-200">
          <h4 className="text-sm sm:text-lg font-bold text-yellow-800 mb-2 sm:mb-4">{T('breakeven')}</h4>
          <div className="bg-card p-2 sm:p-4 rounded-lg border border-yellow-200 dark:border-yellow-900">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground text-sm">{isMobile ? 'Мин. цена' : 'Минимальная цена продажи'}</span>
              <span className="font-bold text-lg sm:text-xl text-yellow-900">{formatCurrency(calculations.breakEven)}</span>
            </div>
            {!isMobile && (
              <div className="font-mono text-xs mt-2 space-y-1 text-muted-foreground">
                <div>= Затраты ÷ (1 - Комиссия × 1.05)</div>
                <div className="text-yellow-700">= {formatCurrency(calculations.costs.total)} ÷ (1 - {params.sellerCommission}% × 1.05)</div>
              </div>
            )}
          </div>
          {!isMobile && (
            <div className="mt-3 p-3 bg-yellow-100 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>⚠️</strong> Ниже {formatCurrency(calculations.breakEven)} — убыток.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
