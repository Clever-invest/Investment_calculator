/**
 * Форма параметров сделки
 */

import React from 'react';
import { Save } from 'lucide-react';
import { PaymentScheduleEditor } from './PaymentScheduleEditor';
import { formatCurrency } from '../../utils/format';
import type { CalculatorParams } from '../../types/calculator';

interface DealParamsFormProps {
  params: CalculatorParams;
  onParamChange: (key: keyof CalculatorParams, value: any) => void;
  onSave: () => void;
}

export const DealParamsForm: React.FC<DealParamsFormProps> = ({
  params,
  onParamChange,
  onSave
}) => {
  const handleNumberChange = (key: keyof CalculatorParams, value: string) => {
    const num = value === '' ? 0 : parseFloat(value);
    onParamChange(key, isNaN(num) ? 0 : num);
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg sm:rounded-xl p-3 sm:p-4">
      <h2 className="text-base sm:text-lg font-bold text-gray-800 mb-3 sm:mb-4">Параметры сделки</h2>

      <div className="space-y-3 sm:space-y-4">
        {/* Цена покупки */}
        <div>
          <label className="text-xs sm:text-sm font-medium text-gray-700 mb-1 block">
            {params.dealType === 'offplan' ? 'Общая стоимость от застройщика' : 'Цена покупки'}: {formatCurrency(params.purchasePrice)}
          </label>
          <input
            type="range"
            min="100000"
            max="10000000"
            step="10000"
            value={params.purchasePrice}
            onChange={(e) => handleNumberChange('purchasePrice', e.target.value)}
            className="w-full h-3"
          />
        </div>

        {/* Off-plan секция */}
        {params.dealType === 'offplan' && (
          <>
            <div>
              <label className="text-xs sm:text-sm font-medium text-gray-700 mb-1 block">
                Фактически оплачено: {formatCurrency(params.paidAmount)}
              </label>
              <input
                type="range"
                min="0"
                max={params.purchasePrice}
                step="10000"
                value={params.paidAmount}
                onChange={(e) => handleNumberChange('paidAmount', e.target.value)}
                className="w-full h-3"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>{params.purchasePrice > 0 ? ((params.paidAmount / params.purchasePrice) * 100).toFixed(0) : 0}% оплачено</span>
                <span>Остаток: {formatCurrency(Math.max(0, params.purchasePrice - params.paidAmount))}</span>
              </div>
            </div>

            <PaymentScheduleEditor
              schedule={params.paymentSchedule}
              onChange={(schedule) => onParamChange('paymentSchedule', schedule)}
            />
          </>
        )}

        {/* Цена продажи */}
        <div>
          <label className="text-xs sm:text-sm font-medium text-gray-700 mb-1 block">
            Предполагаемая цена продажи: {formatCurrency(params.sellingPrice)}
          </label>
          <input
            type="range"
            min={params.purchasePrice}
            max="12000000"
            step="10000"
            value={params.sellingPrice}
            onChange={(e) => handleNumberChange('sellingPrice', e.target.value)}
            className="w-full h-3"
          />
        </div>

        {/* DLD */}
        <div>
          <label className="text-xs sm:text-sm font-medium text-gray-700 mb-1 block">
            DLD/регистрация: {params.dldFees}%
          </label>
          <input
            type="range"
            min="0"
            max="5"
            step="0.1"
            value={params.dldFees}
            onChange={(e) => handleNumberChange('dldFees', e.target.value)}
            className="w-full h-3"
          />
        </div>

        {/* Комиссия покупателя */}
        <div>
          <label className="text-xs sm:text-sm font-medium text-gray-700 mb-1 block">
            Комиссия брокера при покупке: {params.buyerCommission}%
          </label>
          <input
            type="range"
            min="0"
            max="5"
            step="0.1"
            value={params.buyerCommission}
            onChange={(e) => handleNumberChange('buyerCommission', e.target.value)}
            className="w-full h-3"
          />
        </div>

        {/* Комиссия продавца */}
        <div>
          <label className="text-xs sm:text-sm font-medium text-gray-700 mb-1 block">
            Комиссия брокера при продаже: {params.sellerCommission}%
          </label>
          <input
            type="range"
            min="0"
            max="5"
            step="0.1"
            value={params.sellerCommission}
            onChange={(e) => handleNumberChange('sellerCommission', e.target.value)}
            className="w-full h-3"
          />
        </div>

        {/* Бюджет ремонта */}
        <div>
          <label className="text-xs sm:text-sm font-medium text-gray-700 mb-1 block">
            Бюджет ремонта: {formatCurrency(params.renovationBudget)}
          </label>
          <input
            type="range"
            min="0"
            max="500000"
            step="5000"
            value={params.renovationBudget}
            onChange={(e) => handleNumberChange('renovationBudget', e.target.value)}
            className="w-full h-3"
          />
        </div>

        {/* Резерв */}
        <div>
          <label className="text-xs sm:text-sm font-medium text-gray-700 mb-1 block">
            Резерв: {params.contingency}%
          </label>
          <input
            type="range"
            min="5"
            max="25"
            step="1"
            value={params.contingency}
            onChange={(e) => handleNumberChange('contingency', e.target.value)}
            className="w-full h-3"
          />
        </div>

        {/* Комментарии по ремонту */}
        <div>
          <label className="text-xs sm:text-sm font-medium text-gray-700 mb-1 block">
            📝 Заметки по ремонту
          </label>
          <textarea
            value={params.renovationComments}
            onChange={(e) => onParamChange('renovationComments', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            placeholder="Что нужно сделать: кухня, ванная, полы, мебель..."
            rows={3}
          />
        </div>

        {/* Срок ремонта */}
        <div>
          <label className="text-xs sm:text-sm font-medium text-gray-700 mb-1 block">
            Срок ремонта: {params.renovationMonths} мес
          </label>
          <input
            type="range"
            min="1"
            max="12"
            step="1"
            value={params.renovationMonths}
            onChange={(e) => handleNumberChange('renovationMonths', e.target.value)}
            className="w-full h-3"
          />
        </div>

        {/* Срок экспозиции */}
        <div>
          <label className="text-xs sm:text-sm font-medium text-gray-700 mb-1 block">
            Срок экспозиции: {params.listingMonths} мес
          </label>
          <input
            type="range"
            min="1"
            max="12"
            step="1"
            value={params.listingMonths}
            onChange={(e) => handleNumberChange('listingMonths', e.target.value)}
            className="w-full h-3"
          />
        </div>

        {/* Service Charge */}
        <div>
          <label className="text-xs sm:text-sm font-medium text-gray-700 mb-1 block">
            Service Charge (год): {formatCurrency(params.serviceChargeYearly)}
          </label>
          <input
            type="number"
            value={params.serviceChargeYearly}
            onChange={(e) => handleNumberChange('serviceChargeYearly', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="6000"
            inputMode="numeric"
          />
        </div>

        {/* DEWA AC */}
        <div>
          <label className="text-xs sm:text-sm font-medium text-gray-700 mb-1 block">
            DEWA AC (месяц): {formatCurrency(params.dewaAcMonthly)}
          </label>
          <input
            type="number"
            value={params.dewaAcMonthly}
            onChange={(e) => handleNumberChange('dewaAcMonthly', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="500"
            inputMode="numeric"
          />
        </div>

        {/* Trustee Office Fee */}
        <div>
          <label className="text-xs sm:text-sm font-medium text-gray-700 mb-1 block">
            Trustee Office Fee: {formatCurrency(params.trusteeOfficeFee)}
          </label>
          <input
            type="number"
            value={params.trusteeOfficeFee}
            onChange={(e) => handleNumberChange('trusteeOfficeFee', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="5000"
            inputMode="numeric"
          />
        </div>
      </div>

      <button
        onClick={onSave}
        className="w-full mt-3 sm:mt-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-2.5 sm:py-3 rounded-lg sm:rounded-xl text-sm sm:text-base font-medium hover:shadow-lg transition-shadow flex items-center justify-center gap-2"
      >
        <Save className="w-4 h-4 sm:w-5 sm:h-5" />
        Сохранить объект
      </button>
    </div>
  );
};
