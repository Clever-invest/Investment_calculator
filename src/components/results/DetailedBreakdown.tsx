/**
 * Детальный расчёт с формулами
 */

import React from 'react';
import { formatCurrency } from '../../utils/format';
import type { CalculatorParams, Calculations } from '../../types/calculator';

interface DetailedBreakdownProps {
  params: CalculatorParams;
  calculations: Calculations;
}

export const DetailedBreakdown: React.FC<DetailedBreakdownProps> = ({ params, calculations }) => {
  return (
    <div>
      <h3 className="text-base sm:text-lg font-bold mb-3 sm:mb-4">📐 Детальный расчет с формулами</h3>

      <div className="space-y-4 sm:space-y-6 text-xs sm:text-sm">
        {/* Расходы */}
        <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-lg sm:rounded-xl p-3 sm:p-5 border-2 border-orange-200">
          <h4 className="text-sm sm:text-lg font-bold text-orange-800 mb-3 sm:mb-4 flex items-center gap-2">
            💰 Шаг 1: Расчет общих затрат
          </h4>

          <div className="space-y-2 sm:space-y-3 font-mono">
            {params.dealType === 'offplan' ? (
              <>
                <div className="flex justify-between items-center bg-purple-50 p-3 rounded-lg border border-purple-200">
                  <span className="text-purple-700 font-medium">🏗️ Общая стоимость от застройщика</span>
                  <span className="font-bold text-purple-900">{formatCurrency(params.purchasePrice)}</span>
                </div>
                <div className="flex justify-between items-center bg-white p-3 rounded-lg">
                  <span className="text-gray-700">Фактически оплачено ({params.purchasePrice > 0 ? ((params.paidAmount / params.purchasePrice) * 100).toFixed(0) : 0}%)</span>
                  <span className="font-bold text-gray-900">{formatCurrency(params.paidAmount)}</span>
                </div>
              </>
            ) : (
              <div className="flex justify-between items-center bg-white p-3 rounded-lg">
                <span className="text-gray-700">Цена покупки</span>
                <span className="font-bold text-gray-900">{formatCurrency(params.purchasePrice)}</span>
              </div>
            )}
            
            <div className="flex justify-between items-center bg-white p-3 rounded-lg">
              <span className="text-gray-700">+ DLD/регистрация ({params.dldFees}%)</span>
              <span className="font-bold text-orange-600">
                + {formatCurrency(calculations.costs.dld)}
                <span className="text-[10px] text-gray-500 ml-2">({formatCurrency(params.purchasePrice)} × {params.dldFees}%)</span>
              </span>
            </div>
            
            <div className="flex justify-between items-center bg-white p-3 rounded-lg">
              <span className="text-gray-700">+ Комиссия брокера при покупке ({params.buyerCommission}%)</span>
              <span className="font-bold text-orange-600">
                + {formatCurrency(calculations.costs.buyerCommission)}
                <span className="text-[10px] text-gray-500 ml-2">({formatCurrency(params.purchasePrice)} × {params.buyerCommission}%)</span>
              </span>
            </div>
            
            <div className="flex justify-between items-center bg-white p-3 rounded-lg">
              <span className="text-gray-700">+ VAT на комиссию (5%)</span>
              <span className="font-bold text-orange-600">
                + {formatCurrency(calculations.costs.buyerCommissionVAT)}
                <span className="text-[10px] text-gray-500 ml-2">({formatCurrency(calculations.costs.buyerCommission)} × 5%)</span>
              </span>
            </div>
            
            <div className="flex justify-between items-center bg-white p-3 rounded-lg">
              <span className="text-gray-700">+ Бюджет ремонта</span>
              <span className="font-bold text-orange-600">+ {formatCurrency(params.renovationBudget)}</span>
            </div>
            
            <div className="flex justify-between items-center bg-white p-3 rounded-lg">
              <span className="text-gray-700">+ Резерв ({params.contingency}%)</span>
              <span className="font-bold text-orange-600">
                + {formatCurrency(calculations.costs.renovation - params.renovationBudget)}
                <span className="text-[10px] text-gray-500 ml-2">({formatCurrency(params.renovationBudget)} × {params.contingency}%)</span>
              </span>
            </div>
            
            <div className="flex justify-between items-center bg-white p-3 rounded-lg">
              <span className="text-gray-700">+ Service Charge</span>
              <span className="font-bold text-orange-600">
                + {formatCurrency(calculations.costs.serviceCharge)}
                <span className="text-[10px] text-gray-500 ml-2">({formatCurrency(params.serviceChargeYearly)}/12 × {calculations.totalMonths} мес)</span>
              </span>
            </div>
            
            <div className="flex justify-between items-center bg-white p-3 rounded-lg">
              <span className="text-gray-700">+ DEWA AC</span>
              <span className="font-bold text-orange-600">
                + {formatCurrency(calculations.costs.dewaAc)}
                <span className="text-[10px] text-gray-500 ml-2">({formatCurrency(params.dewaAcMonthly)} × {calculations.totalMonths} мес)</span>
              </span>
            </div>
            
            <div className="flex justify-between items-center bg-white p-3 rounded-lg">
              <span className="text-gray-700">+ Trustee Office Fee (покупка)</span>
              <span className="font-bold text-orange-600">+ {formatCurrency(params.trusteeOfficeFee)}</span>
            </div>

            <div className="border-t-4 border-orange-400 pt-3 mt-3">
              <div className="flex justify-between items-center bg-orange-100 p-4 rounded-lg">
                <span className="font-bold text-lg text-orange-900">= ОБЩИЕ ЗАТРАТЫ</span>
                <span className="font-bold text-2xl text-orange-900">{formatCurrency(calculations.costs.total)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Выручка */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border-2 border-blue-200">
          <h4 className="text-lg font-bold text-blue-800 mb-4 flex items-center gap-2">
            💵 Шаг 2: Расчет чистой выручки
          </h4>

          <div className="space-y-3 font-mono">
            <div className="flex justify-between items-center bg-white p-3 rounded-lg">
              <span className="text-gray-700">Цена продажи</span>
              <span className="font-bold text-gray-900">{formatCurrency(params.sellingPrice)}</span>
            </div>
            
            <div className="flex justify-between items-center bg-white p-3 rounded-lg">
              <span className="text-gray-700">- Комиссия брокера при продаже ({params.sellerCommission}%)</span>
              <span className="font-bold text-red-600">
                - {formatCurrency(calculations.revenue.sellerCommission)}
                <span className="text-[10px] text-gray-500 ml-2">({formatCurrency(params.sellingPrice)} × {params.sellerCommission}%)</span>
              </span>
            </div>
            
            <div className="flex justify-between items-center bg-white p-3 rounded-lg">
              <span className="text-gray-700">- VAT на комиссию (5%)</span>
              <span className="font-bold text-red-600">
                - {formatCurrency(calculations.revenue.sellerCommissionVAT)}
                <span className="text-[10px] text-gray-500 ml-2">({formatCurrency(calculations.revenue.sellerCommission)} × 5%)</span>
              </span>
            </div>

            {params.dealType === 'offplan' && calculations.remainingDebt && calculations.remainingDebt > 0 && (
              <div className="flex justify-between items-center bg-purple-50 p-3 rounded-lg border border-purple-200">
                <span className="text-purple-700 font-medium">- 💳 Остаток долга застройщику (на дату продажи)</span>
                <span className="font-bold text-red-600">
                  - {formatCurrency(calculations.remainingDebt)}
                  <span className="text-[10px] text-purple-600 ml-2">(Погашается из выручки)</span>
                </span>
              </div>
            )}

            <div className="border-t-4 border-blue-400 pt-3 mt-3">
              <div className="flex justify-between items-center bg-blue-100 p-4 rounded-lg">
                <span className="font-bold text-lg text-blue-900">= ЧИСТАЯ ВЫРУЧКА</span>
                <span className="font-bold text-2xl text-blue-900">{formatCurrency(calculations.revenue.net)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Прибыль */}
        <div className={`bg-gradient-to-br ${calculations.profit.net >= 0 ? 'from-green-50 to-emerald-50 border-green-200' : 'from-red-50 to-rose-50 border-red-200'} rounded-xl p-5 border-2`}>
          <h4 className={`text-lg font-bold ${calculations.profit.net >= 0 ? 'text-green-800' : 'text-red-800'} mb-4 flex items-center gap-2`}>
            {calculations.profit.net >= 0 ? '✅' : '⚠️'} Шаг 3: Чистая прибыль
          </h4>

          <div className="space-y-3 font-mono">
            <div className="flex justify-between items-center bg-white p-3 rounded-lg">
              <span className="text-gray-700">Чистая выручка</span>
              <span className="font-bold text-gray-900">{formatCurrency(calculations.revenue.net)}</span>
            </div>
            <div className="flex justify-between items-center bg-white p-3 rounded-lg">
              <span className="text-gray-700">- Общие затраты</span>
              <span className="font-bold text-red-600">- {formatCurrency(calculations.costs.total)}</span>
            </div>
            <div className={`border-t-4 ${calculations.profit.net >= 0 ? 'border-green-400' : 'border-red-400'} pt-3 mt-3`}>
              <div className={`flex justify-between items-center ${calculations.profit.net >= 0 ? 'bg-green-100' : 'bg-red-100'} p-4 rounded-lg`}>
                <span className={`font-bold text-lg ${calculations.profit.net >= 0 ? 'text-green-900' : 'text-red-900'}`}>= ЧИСТАЯ ПРИБЫЛЬ</span>
                <span className={`font-bold text-2xl ${calculations.profit.net >= 0 ? 'text-green-900' : 'text-red-900'}`}>{formatCurrency(calculations.profit.net)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Метрики доходности */}
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-5 border-2 border-purple-200">
          <h4 className="text-lg font-bold text-purple-800 mb-4 flex items-center gap-2">📊 Шаг 4: Метрики доходности</h4>
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-lg border border-purple-200">
              <div className="font-bold text-purple-900 mb-2">ROI (Return on Investment):</div>
              <div className="font-mono space-y-1">
                <div className="text-gray-700">ROI = (Чистая прибыль ÷ Общие затраты) × 100%</div>
                <div className="text-purple-700">ROI = ({formatCurrency(calculations.profit.net)} ÷ {formatCurrency(calculations.costs.total)}) × 100%</div>
                <div className="font-bold text-xl text-purple-900 mt-2">= {calculations.profit.roi.toFixed(2)}%</div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-purple-200">
              <div className="font-bold text-purple-900 mb-2">IRR (Internal Rate of Return) — годовая доходность:</div>
              <div className="font-mono space-y-1">
                <div className="text-gray-700">IRR = ((Чистая выручка ÷ Общие затраты)^(12/месяцы) - 1) × 100%</div>
                <div className="text-purple-700">
                  IRR = (({formatCurrency(calculations.revenue.net)} ÷ {formatCurrency(calculations.costs.total)})^(12/{calculations.totalMonths}) - 1) × 100%
                </div>
                <div className="font-bold text-xl text-purple-900 mt-2">= {calculations.profit.irr.toFixed(2)}%</div>
              </div>
            </div>
          </div>
          <div className="mt-4 p-3 bg-indigo-50 rounded-lg border border-indigo-200">
            <p className="text-sm text-indigo-900">
              <strong>💡 Разница между ROI и IRR:</strong>
            </p>
            <ul className="text-xs text-indigo-800 mt-2 space-y-1 ml-4 list-disc">
              <li><strong>ROI</strong> — общая доходность проекта, НЕ учитывает время</li>
              <li><strong>IRR</strong> — годовая ставка доходности, учитывает время (аннуализированная)</li>
              <li>При сроке 12 месяцев: ROI ≈ IRR</li>
              <li>При сроке &lt; 12 месяцев: IRR &gt; ROI (быстрый оборот выгоднее)</li>
              <li>При сроке &gt; 12 месяцев: IRR &lt; ROI (деньги работают дольше)</li>
            </ul>
          </div>
        </div>

        {/* Точка безубыточности */}
        <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl p-5 border-2 border-yellow-200">
          <h4 className="text-lg font-bold text-yellow-800 mb-4 flex items-center gap-2">⚖️ Точка безубыточности</h4>
          <div className="bg-white p-4 rounded-lg border border-yellow-200">
            <div className="font-mono space-y-1">
              <div className="text-gray-700">Минимальная цена продажи = Затраты ÷ (1 - Комиссия продавца% × 1.05)</div>
              <div className="text-yellow-700">
                Минимальная цена = {formatCurrency(calculations.costs.total)} ÷ (1 - {params.sellerCommission}% × 1.05)
              </div>
              <div className="font-bold text-xl text-yellow-900 mt-2">= {formatCurrency(calculations.breakEven)}</div>
            </div>
            <div className="mt-3 p-3 bg-yellow-100 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Примечание:</strong> При цене продажи ниже {formatCurrency(calculations.breakEven)} сделка будет убыточной.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
