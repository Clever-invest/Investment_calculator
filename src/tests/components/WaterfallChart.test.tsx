/**
 * Тесты для компонента WaterfallChart
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { WaterfallChart } from '../../components/results/WaterfallChart';
import type { WaterfallDataItem, Calculations } from '../../types/calculator';

const mockData: WaterfallDataItem[] = [
  { name: 'Цена продажи', value: 2000000, fill: '#22c55e' },
  { name: 'Комиссия', value: -80000, fill: '#ef4444' },
  { name: 'Затраты', value: -1500000, fill: '#ef4444' },
  { name: 'Прибыль', value: 420000, fill: '#3b82f6' },
];

const mockCalculations: Calculations = {
  costs: {
    purchase: 1000000,
    dld: 40000,
    buyerCommission: 20000,
    buyerCommissionVAT: 1000,
    buyerCommissionTotal: 21000,
    renovation: 115000,
    serviceCharge: 3000,
    dewaAc: 3000,
    trusteeOfficeFee: 5000,
    total: 1187000,
  },
  revenue: {
    sellingPrice: 1500000,
    sellerCommission: 60000,
    sellerCommissionVAT: 3000,
    sellerCommissionTotal: 63000,
    net: 1437000,
  },
  profit: {
    net: 250000,
    roi: 21.1,
    irr: 42.2,
  },
  breakEven: 1240000,
  totalMonths: 6,
};

describe('WaterfallChart', () => {
  it('должен отображать заголовок', () => {
    render(<WaterfallChart data={mockData} calculations={mockCalculations} />);
    expect(screen.getByText(/Водопад: от цены продажи к чистой прибыли/)).toBeInTheDocument();
  });

  it('должен отображать секцию точки безубыточности', () => {
    render(<WaterfallChart data={mockData} calculations={mockCalculations} />);
    expect(screen.getByText('Точка безубыточности')).toBeInTheDocument();
  });

  it('должен показывать минимальную цену продажи', () => {
    render(<WaterfallChart data={mockData} calculations={mockCalculations} />);
    // Текст изменён на "Мин. цена продажи:"
    expect(screen.getByText(/Мин\. цена продажи:/)).toBeInTheDocument();
    // breakEven = 1240000 -> форматируется как "1,240,000 AED"
    expect(screen.getByText(/1.*240.*000.*AED/)).toBeInTheDocument();
  });

  it('должен отображать формулу', () => {
    render(<WaterfallChart data={mockData} calculations={mockCalculations} />);
    expect(screen.getByText(/Затраты ÷/)).toBeInTheDocument();
  });

  it('должен рендерить контейнер для графика', () => {
    const { container } = render(<WaterfallChart data={mockData} calculations={mockCalculations} />);
    // Адаптивные классы: h-[250px] sm:h-[320px] md:h-[400px]
    const chartContainer = container.querySelector('[class*="h-["]');
    expect(chartContainer).toBeInTheDocument();
  });

  it('должен корректно обрабатывать пустые данные', () => {
    render(<WaterfallChart data={[]} calculations={mockCalculations} />);
    // Компонент должен отрендериться без ошибок
    expect(screen.getByText(/Водопад/)).toBeInTheDocument();
  });

  it('должен обрабатывать нулевой breakEven', () => {
    const zeroBreakEven = { ...mockCalculations, breakEven: 0 };
    render(<WaterfallChart data={mockData} calculations={zeroBreakEven} />);
    expect(screen.getByText(/0.*AED/)).toBeInTheDocument();
  });
});
