/**
 * Тесты для компонента MetricsGrid
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MetricsGrid } from '../../components/results/MetricsGrid';
import type { Calculations } from '../../types/calculator';

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

describe('MetricsGrid', () => {
  it('должен отображать чистую прибыль', () => {
    render(<MetricsGrid calculations={mockCalculations} />);
    
    expect(screen.getByText('Чистая прибыль')).toBeInTheDocument();
    // Проверяем что сумма отображается
    expect(screen.getByText(/250.*AED/)).toBeInTheDocument();
  });
  
  it('должен отображать ROI', () => {
    render(<MetricsGrid calculations={mockCalculations} />);
    
    expect(screen.getByText('ROI')).toBeInTheDocument();
    expect(screen.getByText('21,1%')).toBeInTheDocument();
  });
  
  it('должен отображать IRR', () => {
    render(<MetricsGrid calculations={mockCalculations} />);
    
    // Label изменён на "IRR годовой"
    expect(screen.getByText(/IRR/)).toBeInTheDocument();
    expect(screen.getByText('42,2%')).toBeInTheDocument();
  });
  
  it('должен отображать срок в месяцах', () => {
    render(<MetricsGrid calculations={mockCalculations} />);
    
    // Label изменён на "Срок сделки"
    expect(screen.getByText(/Срок/)).toBeInTheDocument();
    expect(screen.getByText('6 мес')).toBeInTheDocument();
  });
  
  it('должен отображать 4 карточки метрик', () => {
    const { container } = render(<MetricsGrid calculations={mockCalculations} />);
    
    // Проверяем grid с 4 карточками
    const grid = container.querySelector('.grid');
    expect(grid?.children.length).toBe(4);
  });
  
  it('должен корректно отображать отрицательную прибыль', () => {
    const lossCalculations: Calculations = {
      ...mockCalculations,
      profit: {
        net: -50000,
        roi: -4.2,
        irr: -10.1,
      },
    };
    
    render(<MetricsGrid calculations={lossCalculations} />);
    
    expect(screen.getByText('-4,2%')).toBeInTheDocument();
    expect(screen.getByText('-10,1%')).toBeInTheDocument();
  });
  
  it('должен обрабатывать нулевые значения', () => {
    const zeroCalculations: Calculations = {
      ...mockCalculations,
      profit: {
        net: 0,
        roi: 0,
        irr: 0,
      },
      totalMonths: 0,
    };
    
    render(<MetricsGrid calculations={zeroCalculations} />);
    
    // ROI и IRR оба показывают 0.0%, используем getAllByText
    const zeroPercentElements = screen.getAllByText('0,0%');
    expect(zeroPercentElements.length).toBe(2); // ROI и IRR
    expect(screen.getByText('0 мес')).toBeInTheDocument();
  });
});
