/**
 * Компонент редактирования плана платежей для off-plan сделок
 */

import React from 'react';
import { formatCurrency } from '../../utils/format';
import type { PaymentScheduleItem } from '../../types/calculator';

interface PaymentScheduleEditorProps {
  schedule: PaymentScheduleItem[];
  onChange: (schedule: PaymentScheduleItem[]) => void;
}

export const PaymentScheduleEditor: React.FC<PaymentScheduleEditorProps> = ({
  schedule,
  onChange
}) => {
  const addPayment = () => {
    onChange([...schedule, { amount: 10000, date: '' }]);
  };

  const removePayment = (index: number) => {
    onChange(schedule.filter((_, i) => i !== index));
  };

  const updatePayment = (index: number, field: keyof PaymentScheduleItem, value: string | number) => {
    const newSchedule = [...schedule];
    if (field === 'amount') {
      newSchedule[index].amount = typeof value === 'string' ? parseFloat(value) || 0 : value;
    } else {
      newSchedule[index].date = value as string;
    }
    onChange(newSchedule);
  };

  const totalAmount = schedule.reduce((sum, p) => sum + (p.amount || 0), 0);

  return (
    <div className="border-t pt-3">
      <div className="flex items-center justify-between mb-2">
        <label className="text-xs sm:text-sm font-medium text-gray-700">
          📅 План платежей ({schedule.length})
        </label>
        <button
          type="button"
          onClick={addPayment}
          className="px-2 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600 transition-colors"
        >
          + Добавить
        </button>
      </div>

      {schedule.length > 0 && (
        <div className="space-y-2">
          {schedule.map((payment, index) => (
            <div key={index} className="bg-gray-50 p-2 rounded-lg border border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-medium text-gray-600">#{index + 1}</span>
                <button
                  type="button"
                  onClick={() => removePayment(index)}
                  className="ml-auto text-red-500 hover:text-red-700 text-xs"
                >
                  ✕
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-gray-600 block mb-1">Сумма</label>
                  <input
                    type="number"
                    value={payment.amount}
                    onChange={(e) => updatePayment(index, 'amount', e.target.value)}
                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                    placeholder="Сумма"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-600 block mb-1">Дата</label>
                  <input
                    type="date"
                    value={payment.date}
                    onChange={(e) => updatePayment(index, 'date', e.target.value)}
                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {schedule.length === 0 && (
        <p className="text-xs text-gray-500 text-center py-2">
          Нет платежей. Нажмите "+Добавить"
        </p>
      )}

      {schedule.length > 0 && (
        <div className="mt-2 p-2 bg-purple-50 rounded border border-purple-200">
          <div className="text-xs text-purple-800">
            <strong>Итого по плану:</strong> {formatCurrency(totalAmount)}
          </div>
        </div>
      )}
    </div>
  );
};
