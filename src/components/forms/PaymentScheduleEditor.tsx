/**
 * Компонент редактирования плана платежей для off-plan сделок
 */

import React from 'react';
import { Plus, X } from 'lucide-react';
import { formatCurrency } from '../../utils/format';
import type { PaymentScheduleItem } from '../../types/calculator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DatePicker } from '@/components/ui/date-picker';

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
      <div className="flex items-center justify-between mb-3">
        <Label>
          📅 План платежей ({schedule.length})
        </Label>
        <Button
          type="button"
          variant="default"
          size="sm"
          onClick={addPayment}
          className="bg-green-600 hover:bg-green-700"
        >
          <Plus className="w-4 h-4 mr-1" />
          Добавить
        </Button>
      </div>

      {schedule.length > 0 && (
        <div className="space-y-3">
          {schedule.map((payment, index) => (
            <div key={index} className="bg-muted/50 p-3 rounded-lg border">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm font-medium text-muted-foreground">#{index + 1}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => removePayment(index)}
                  className="ml-auto text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label className="text-xs">Сумма</Label>
                  <Input
                    type="text"
                    inputMode="decimal"
                    enterKeyHint="next"
                    value={payment.amount}
                    onChange={(e) => updatePayment(index, 'amount', e.target.value)}
                    placeholder="Сумма"
                    className="text-right"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Дата</Label>
                  <DatePicker
                    value={payment.date}
                    onChange={(value) => updatePayment(index, 'date', value)}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {schedule.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-4">
          Нет платежей. Нажмите "Добавить"
        </p>
      )}

      {schedule.length > 0 && (
        <div className="mt-3 p-3 bg-irr-50 dark:bg-irr-950/50 rounded-lg border border-irr-200 dark:border-irr-800">
          <div className="text-sm text-irr-600 dark:text-irr-400 font-medium">
            Итого по плану: {formatCurrency(totalAmount)}
          </div>
        </div>
      )}
    </div>
  );
};
