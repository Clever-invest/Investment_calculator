// =====================================
// КОМПОНЕНТ ПОЛЯ ВВОДА С МАСКОЙ И ВАЛИДАЦИЕЙ
// Мигрирован на shadcn/ui (Этап 2)
// =====================================

import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { Info } from 'lucide-react';

interface InputFieldProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  type: 'money' | 'percent' | 'number';
  min?: number;
  max?: number;
  step?: number;
  error?: string;
  disabled?: boolean;
  tooltip?: string;
}

export const InputField: React.FC<InputFieldProps> = ({
  label,
  value,
  onChange,
  type,
  min,
  max,
  step: _step = 1,
  error,
  disabled = false,
  tooltip,
}) => {
  const [focused, setFocused] = React.useState(false);
  const inputId = React.useId();
  
  const formatDisplay = (val: number): string => {
    if (type === 'money') {
      return new Intl.NumberFormat('en-US', { minimumFractionDigits: 0 }).format(val);
    }
    return val.toString();
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^\d.-]/g, '');
    const num = parseFloat(raw);
    
    if (raw === '' || raw === '-') {
      onChange(0);
      return;
    }
    
    if (isNaN(num)) return;
    
    // Применяем границы
    let bounded = num;
    if (min !== undefined && num < min) bounded = min;
    if (max !== undefined && num > max) bounded = max;
    
    onChange(bounded);
  };
  
  const suffix = type === 'percent' ? '%' : type === 'money' ? 'AED' : '';
  
  return (
    <div className="space-y-2">
      <Label htmlFor={inputId} className="flex items-center gap-2">
        {label}
        {tooltip && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-xs">
              {tooltip}
            </TooltipContent>
          </Tooltip>
        )}
      </Label>
      <div className="relative">
        <Input
          id={inputId}
          type="text"
          inputMode="decimal"
          enterKeyHint="next"
          autoComplete="off"
          value={focused ? value : formatDisplay(value)}
          onChange={handleChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          disabled={disabled}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : undefined}
          className={cn(
            "pr-12",
            error && "border-destructive animate-shake focus-visible:ring-destructive/50"
          )}
        />
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm pointer-events-none">
            {suffix}
          </span>
        )}
      </div>
      {error && (
        <p id={`${inputId}-error`} className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};
