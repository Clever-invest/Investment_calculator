/**
 * Форма параметров сделки
 * Мигрирован на shadcn/ui (Этап 2)
 */

import React from 'react';
import { Save, DollarSign, Hammer, Clock, Receipt } from 'lucide-react';
import { useIsMobile } from '@/hooks/useMediaQuery';
import { PaymentScheduleEditor } from './PaymentScheduleEditor';
import { formatCurrency } from '../../utils/format';
import type { CalculatorParams } from '../../types/calculator';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';

interface DealParamsFormProps {
  params: CalculatorParams;
  onParamChange: (key: keyof CalculatorParams, value: CalculatorParams[keyof CalculatorParams]) => void;
  onSave: () => void;
  isEditing?: boolean;
}

// Компонент слайдера с лейблом (shadcn Slider с touch-friendly 44px target)
const SliderField: React.FC<{
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  formatValue?: (value: number) => string;
  suffix?: string;
}> = ({ label, value, min, max, step, onChange, formatValue, suffix }) => (
  <div className="space-y-2">
    <Label className="text-sm font-medium flex justify-between">
      <span>{label}</span>
      <span className="text-muted-foreground">
        {formatValue ? formatValue(value) : value}{suffix}
      </span>
    </Label>
    <Slider
      min={min}
      max={max}
      step={step}
      value={[value]}
      onValueChange={([v]) => onChange(v)}
    />
  </div>
);

// Компонент числового поля с лейблом
const NumberField: React.FC<{
  label: string;
  value: number;
  onChange: (value: number) => void;
  placeholder?: string;
  formatValue?: (value: number) => string;
}> = ({ label, value, onChange, placeholder, formatValue }) => (
  <div className="space-y-2">
    <Label className="text-sm font-medium flex justify-between">
      <span>{label}</span>
      {formatValue && (
        <span className="text-muted-foreground">{formatValue(value)}</span>
      )}
    </Label>
    <Input
      type="text"
      inputMode="decimal"
      enterKeyHint="next"
      value={value || ''}
      onChange={(e) => {
        const num = e.target.value === '' ? 0 : parseFloat(e.target.value.replace(/[^\d.-]/g, ''));
        onChange(isNaN(num) ? 0 : num);
      }}
      placeholder={placeholder}
    />
  </div>
);

// Адаптивные лейблы для мобильных
const LABELS = {
  purchasePrice: { short: 'Цена', full: 'Цена покупки' },
  purchasePriceOffplan: { short: 'Стоимость', full: 'Общая стоимость от застройщика' },
  paidAmount: { short: 'Оплачено', full: 'Фактически оплачено' },
  dldFees: { short: 'DLD', full: 'DLD/регистрация' },
  buyerCommission: { short: 'Комиссия', full: 'Комиссия брокера при покупке' },
  sellingPrice: { short: 'Цена продажи', full: 'Предполагаемая цена продажи' },
  sellerCommission: { short: 'Комиссия', full: 'Комиссия брокера при продаже' },
  renovationBudget: { short: 'Ремонт', full: 'Бюджет ремонта' },
  contingency: { short: 'Резерв', full: 'Резерв на непредвиденные расходы' },
  renovationMonths: { short: 'Ремонт', full: 'Срок ремонта' },
  listingMonths: { short: 'Продажа', full: 'Срок экспозиции' },
  serviceCharge: { short: 'SC/год', full: 'Service Charge (год)' },
  dewaAc: { short: 'DEWA/мес', full: 'DEWA AC (месяц)' },
  trusteeOffice: { short: 'Trustee', full: 'Trustee Office Fee' },
};

export const DealParamsForm: React.FC<DealParamsFormProps> = ({
  params,
  onParamChange,
  onSave,
  isEditing = false
}) => {
  const isMobile = useIsMobile();
  const L = (key: keyof typeof LABELS) => isMobile ? LABELS[key].short : LABELS[key].full;

  const handleNumberChange = (key: keyof CalculatorParams, value: number) => {
    onParamChange(key, value);
  };

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border-0 shadow-sm">
      <CardHeader className="pb-2 px-3 sm:px-6">
        <CardTitle className="text-lg font-bold">Параметры сделки</CardTitle>
      </CardHeader>
      <CardContent className="px-3 sm:px-6">
        <Accordion type="multiple" defaultValue={["purchase", "sale"]} className="space-y-2">
          
          {/* 💰 Покупка */}
          <AccordionItem value="purchase" className="border rounded-lg bg-background/50 px-0 sm:px-3">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-blue-600" />
                <span className="font-medium">Покупка</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-4 pt-2">
              <SliderField
                label={params.dealType === 'offplan' ? L('purchasePriceOffplan') : L('purchasePrice')}
                value={params.purchasePrice}
                min={100000}
                max={10000000}
                step={10000}
                onChange={(v) => handleNumberChange('purchasePrice', v)}
                formatValue={formatCurrency}
              />

              {params.dealType === 'offplan' && (
                <>
                  <div className="space-y-2">
                    <SliderField
                      label={L('paidAmount')}
                      value={params.paidAmount}
                      min={0}
                      max={params.purchasePrice}
                      step={10000}
                      onChange={(v) => handleNumberChange('paidAmount', v)}
                      formatValue={formatCurrency}
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
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

              <SliderField
                label={L('dldFees')}
                value={params.dldFees}
                min={0}
                max={5}
                step={0.1}
                onChange={(v) => handleNumberChange('dldFees', v)}
                suffix="%"
              />

              <SliderField
                label={L('buyerCommission')}
                value={params.buyerCommission}
                min={0}
                max={5}
                step={0.1}
                onChange={(v) => handleNumberChange('buyerCommission', v)}
                suffix="%"
              />
            </AccordionContent>
          </AccordionItem>

          {/* 💵 Продажа */}
          <AccordionItem value="sale" className="border rounded-lg bg-background/50 px-0 sm:px-3">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-2">
                <Receipt className="h-4 w-4 text-green-600" />
                <span className="font-medium">Продажа</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-4 pt-2">
              <SliderField
                label={L('sellingPrice')}
                value={params.sellingPrice}
                min={params.purchasePrice}
                max={12000000}
                step={10000}
                onChange={(v) => handleNumberChange('sellingPrice', v)}
                formatValue={formatCurrency}
              />

              <SliderField
                label={L('sellerCommission')}
                value={params.sellerCommission}
                min={0}
                max={5}
                step={0.1}
                onChange={(v) => handleNumberChange('sellerCommission', v)}
                suffix="%"
              />

              <NumberField
                label={L('trusteeOffice')}
                value={params.trusteeOfficeFee}
                onChange={(v) => handleNumberChange('trusteeOfficeFee', v)}
                placeholder="5000"
                formatValue={formatCurrency}
              />
            </AccordionContent>
          </AccordionItem>

          {/* 🔨 Ремонт */}
          <AccordionItem value="renovation" className="border rounded-lg bg-background/50 px-0 sm:px-3">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-2">
                <Hammer className="h-4 w-4 text-orange-600" />
                <span className="font-medium">Ремонт</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-4 pt-2">
              <SliderField
                label={L('renovationBudget')}
                value={params.renovationBudget}
                min={0}
                max={500000}
                step={5000}
                onChange={(v) => handleNumberChange('renovationBudget', v)}
                formatValue={formatCurrency}
              />

              <SliderField
                label={L('contingency')}
                value={params.contingency}
                min={5}
                max={25}
                step={1}
                onChange={(v) => handleNumberChange('contingency', v)}
                suffix="%"
              />

              <div className="space-y-2">
                <Label className="text-sm font-medium">📝 Заметки по ремонту</Label>
                <Textarea
                  value={params.renovationComments}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onParamChange('renovationComments', e.target.value)}
                  placeholder="Что нужно сделать: кухня, ванная, полы, мебель..."
                  rows={3}
                />
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* ⏱️ Сроки и расходы */}
          <AccordionItem value="timing" className="border rounded-lg bg-background/50 px-0 sm:px-3">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-purple-600" />
                <span className="font-medium">Сроки и расходы</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-4 pt-2">
              <SliderField
                label={L('renovationMonths')}
                value={params.renovationMonths}
                min={1}
                max={12}
                step={1}
                onChange={(v) => handleNumberChange('renovationMonths', v)}
                suffix=" мес"
              />

              <SliderField
                label={L('listingMonths')}
                value={params.listingMonths}
                min={1}
                max={12}
                step={1}
                onChange={(v) => handleNumberChange('listingMonths', v)}
                suffix=" мес"
              />

              <NumberField
                label={L('serviceCharge')}
                value={params.serviceChargeYearly}
                onChange={(v) => handleNumberChange('serviceChargeYearly', v)}
                placeholder="6000"
                formatValue={formatCurrency}
              />

              <NumberField
                label={L('dewaAc')}
                value={params.dewaAcMonthly}
                onChange={(v) => handleNumberChange('dewaAcMonthly', v)}
                placeholder="500"
                formatValue={formatCurrency}
              />
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <Button onClick={onSave} className="w-full mt-4" size="lg">
          <Save className="w-4 h-4 mr-2" />
          {isEditing ? 'Обновить объект' : 'Сохранить объект'}
        </Button>
      </CardContent>
    </Card>
  );
};
