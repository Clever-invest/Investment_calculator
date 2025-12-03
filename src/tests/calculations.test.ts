// =====================================
// ЮНИТ-ТЕСТЫ ДЛЯ РАСЧЕТОВ
// =====================================

import { describe, it, expect } from 'vitest';
import { computeProject, validateInput, computeSensitivity, computeDerived } from '../calculations/core';
import type { DealInput } from '../calculations/types';

const testInput: DealInput = {
  dealType: 'secondary',
  purchasePrice: 1390000,
  dldPct: 4,
  buyerFeePct: 2,
  buyerFeeVatPct: 5,
  trusteeFee: 5000,
  renovationBudget: 250000,
  reservePct: 15,
  serviceChargeAnnual: 6000,
  dewaMonthly: 500,
  salePrice: 2300000,
  sellerFeePct: 4,
  sellerFeeVatPct: 5,
  monthsRepair: 2,
  monthsExposure: 4,
};

describe('Основные расчеты проекта', () => {
  it('должны рассчитать totalCosts корректно', () => {
    const project = computeProject(testInput);
    expect(project.totalCosts).toBeCloseTo(1773290, 0);
  });
  
  it('должны рассчитать netProceeds корректно', () => {
    const project = computeProject(testInput);
    expect(project.netProceeds).toBeCloseTo(2203400, 0);
  });
  
  it('должны рассчитать profit корректно', () => {
    const project = computeProject(testInput);
    expect(project.profit).toBeCloseTo(430110, 0);
  });
  
  it('должны рассчитать roiPeriod корректно', () => {
    const project = computeProject(testInput);
    expect(project.roiPeriod).toBeCloseTo(0.243, 0.001);
  });
  
  it('должны рассчитать moic корректно', () => {
    const project = computeProject(testInput);
    expect(project.moic).toBeCloseTo(1.2425, 0.001);
  });
  
  it('должны рассчитать irrAnnual корректно', () => {
    const project = computeProject(testInput);
    expect(project.irrAnnual).toBeCloseTo(0.544, 0.002);
  });
  
  it('должны рассчитать breakEvenSalePrice корректно', () => {
    const project = computeProject(testInput);
    expect(project.breakEvenSalePrice).toBeCloseTo(1851033, 100);
  });
});


describe('Граничные случаи', () => {
  it('должны обработать убыточный сценарий', () => {
    const lossInput: DealInput = {
      ...testInput,
      salePrice: 1500000, // ниже break-even
    };
    const project = computeProject(lossInput);
    
    expect(project.profit).toBeLessThan(0);
    expect(project.irrAnnual).toBeLessThan(0);
  });
  
  it('должны обработать monthsTotal = 0', () => {
    const zeroMonthsInput: DealInput = {
      ...testInput,
      monthsRepair: 0,
      monthsExposure: 0,
    };
    const project = computeProject(zeroMonthsInput);
    
    expect(project.irrAnnual).toBe(0);
  });
  
  it('должны обработать нулевые затраты', () => {
    const zeroCostsInput: DealInput = {
      ...testInput,
      purchasePrice: 0,
      renovationBudget: 0,
      trusteeFee: 0,
      serviceChargeAnnual: 0,
      dewaMonthly: 0,
    };
    const project = computeProject(zeroCostsInput);
    
    expect(project.totalCosts).toBe(0);
    expect(project.moic).toBe(0);
    expect(project.roiPeriod).toBe(0);
  });
});

describe('Валидация', () => {
  it('должна пройти валидацию для корректных данных', () => {
    const result = validateInput(testInput);
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });
  
  it('должна выдать ошибку для процента > 100', () => {
    const invalidInput: DealInput = {
      ...testInput,
      dldPct: 150,
    };
    const result = validateInput(invalidInput);
    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });
  
  it('должна выдать ошибку для отрицательной цены', () => {
    const invalidInput: DealInput = {
      ...testInput,
      purchasePrice: -1000,
    };
    const result = validateInput(invalidInput);
    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });
  
  it('должна выдать предупреждение для убыточной сделки', () => {
    const warningInput: DealInput = {
      ...testInput,
      salePrice: 1500000,
    };
    const result = validateInput(warningInput);
    expect(result.warnings.length).toBeGreaterThan(0);
  });
  
  it('должна выдать предупреждение для невозможной комиссии', () => {
    const invalidFeeInput: DealInput = {
      ...testInput,
      sellerFeePct: 95,
      sellerFeeVatPct: 10,
    };
    const result = validateInput(invalidFeeInput);
    expect(result.warnings.some(w => w.field === 'sellerFeePct')).toBe(true);
  });
});

describe('Анализ чувствительности', () => {
  it('должен рассчитать чувствительность по цене', () => {
    const project = computeProject(testInput);
    const sensitivity = computeSensitivity(testInput, project);
    
    expect(sensitivity.bySalePrice).toHaveLength(7);
    expect(sensitivity.bySalePrice[3].salePrice).toBe(testInput.salePrice); // базовый
  });
  
  it('должен рассчитать чувствительность по срокам', () => {
    const project = computeProject(testInput);
    const sensitivity = computeSensitivity(testInput, project);
    
    expect(sensitivity.byMonths.length).toBeGreaterThan(0);
    expect(sensitivity.byMonths[0].monthsTotal).toBe(6); // начальный
  });
  
  it('должен рассчитать чувствительность по ремонту', () => {
    const project = computeProject(testInput);
    const sensitivity = computeSensitivity(testInput, project);
    
    expect(sensitivity.byRenovation).toHaveLength(5);
    expect(sensitivity.byRenovation[2].renovationBudget).toBe(testInput.renovationBudget); // базовый
  });
  
  it('должен показать снижение ROI при увеличении сроков', () => {
    const project = computeProject(testInput);
    const sensitivity = computeSensitivity(testInput, project);
    
    const first = sensitivity.byMonths[0];
    const last = sensitivity.byMonths[sensitivity.byMonths.length - 1];
    
    expect(first.irrAnnual).toBeGreaterThan(last.irrAnnual);
  });
});

// =====================================
// OFF-PLAN РАСЧЕТЫ
// =====================================

const offplanInput: DealInput = {
  dealType: 'offplan',
  purchasePrice: 2000000,
  paidAmount: 600000, // 30% оплачено
  dldPct: 4,
  buyerFeePct: 2,
  buyerFeeVatPct: 5,
  trusteeFee: 5000,
  renovationBudget: 100000,
  reservePct: 15,
  serviceChargeAnnual: 12000,
  dewaMonthly: 0,
  salePrice: 2800000,
  sellerFeePct: 4,
  sellerFeeVatPct: 5,
  monthsRepair: 0,
  monthsExposure: 12,
  paymentSchedule: [
    { amount: 400000, date: '2025-06-01', label: 'Milestone 1' },
    { amount: 500000, date: '2025-12-01', label: 'Milestone 2' },
    { amount: 500000, date: '2026-06-01', label: 'Handover' },
  ],
};

describe('Off-plan расчеты', () => {
  it('должны корректно рассчитать totalCosts для off-plan', () => {
    const project = computeProject(offplanInput);
    
    // totalCosts = paidAmount + DLD + buyerFee + VAT + renovation + carrying + trustee
    // = 600000 + 80000 + 40000 + 2000 + 115000 + 12000 + 5000 = 854000
    expect(project.totalCosts).toBeGreaterThan(0);
    expect(project.totalCosts).toBeCloseTo(854000, -3);
  });
  
  it('должны учитывать remainingDebt при расчёте netProceeds', () => {
    const project = computeProject(offplanInput);
    
    // remainingDebt = платежи до даты продажи
    expect(project.remainingDebt).toBeDefined();
    expect(project.remainingDebt!).toBeGreaterThan(0);
    
    // netProceeds = salePrice - sellerFees - remainingDebt
    const sellerFee = offplanInput.salePrice * 0.04;
    const sellerFeeVAT = sellerFee * 0.05;
    const expectedNetProceeds = offplanInput.salePrice - sellerFee - sellerFeeVAT - project.remainingDebt!;
    expect(project.netProceeds).toBeCloseTo(expectedNetProceeds, 0);
  });
  
  it('должны рассчитать break-even с учётом remainingDebt', () => {
    const project = computeProject(offplanInput);
    
    // breakEven = (totalCosts + remainingDebt) / (1 - sellerFeeRate)
    const sellerFeeRate = 0.04 * 1.05; // 4.2%
    const expectedBreakEven = (project.totalCosts + (project.remainingDebt || 0)) / (1 - sellerFeeRate);
    expect(project.breakEvenSalePrice).toBeCloseTo(expectedBreakEven, -2);
  });
  
  it('должны учитывать только платежи до даты продажи в remainingDebt', () => {
    // Создаём сделку где один платёж после даты продажи (через 24 месяца)
    const futurePaymentInput: DealInput = {
      ...offplanInput,
      monthsExposure: 6, // продажа через 6 месяцев
      paymentSchedule: [
        { amount: 400000, date: '2025-03-01', label: 'Milestone 1' }, // до продажи
        { amount: 500000, date: '2025-06-01', label: 'Milestone 2' }, // на грани
        { amount: 500000, date: '2027-12-01', label: 'Handover' }, // после продажи
      ],
    };
    
    const project = computeProject(futurePaymentInput);
    
    // Только первые два платежа должны быть в remainingDebt
    expect(project.remainingDebt).toBeLessThan(1400000); // не все платежи
  });
  
  it('должны обработать off-plan без paymentSchedule', () => {
    const noScheduleInput: DealInput = {
      ...offplanInput,
      paymentSchedule: undefined,
    };
    
    const project = computeProject(noScheduleInput);
    expect(project.remainingDebt).toBe(0);
    expect(project.netProceeds).toBeDefined();
  });
  
  it('должны обработать off-plan с пустым paymentSchedule', () => {
    const emptyScheduleInput: DealInput = {
      ...offplanInput,
      paymentSchedule: [],
    };
    
    const project = computeProject(emptyScheduleInput);
    expect(project.remainingDebt).toBe(0);
  });
});

describe('Валидация Off-plan', () => {
  it('должна требовать paidAmount для off-plan', () => {
    const invalidInput: DealInput = {
      ...offplanInput,
      paidAmount: undefined,
    };
    
    const result = validateInput(invalidInput);
    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.field === 'paidAmount')).toBe(true);
  });
  
  it('должна выдать предупреждение если paidAmount > purchasePrice', () => {
    const overPaidInput: DealInput = {
      ...offplanInput,
      paidAmount: 2500000, // больше purchasePrice
    };
    
    const result = validateInput(overPaidInput);
    expect(result.warnings.some(w => w.field === 'paidAmount')).toBe(true);
  });
  
  it('должна валидировать план платежей - отрицательная сумма', () => {
    const invalidScheduleInput: DealInput = {
      ...offplanInput,
      paymentSchedule: [
        { amount: -100000, date: '2025-06-01', label: 'Bad' },
      ],
    };
    
    const result = validateInput(invalidScheduleInput);
    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.field?.includes('paymentSchedule'))).toBe(true);
  });
  
  it('должна валидировать план платежей - пустая дата', () => {
    const noDateInput: DealInput = {
      ...offplanInput,
      paymentSchedule: [
        { amount: 100000, date: '', label: 'No date' },
      ],
    };
    
    const result = validateInput(noDateInput);
    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.field?.includes('paymentSchedule'))).toBe(true);
  });
  
  it('должна выдать предупреждение если сумма платежей превышает стоимость', () => {
    const overScheduledInput: DealInput = {
      ...offplanInput,
      paidAmount: 1500000,
      paymentSchedule: [
        { amount: 600000, date: '2025-06-01', label: 'Over' },
      ],
    };
    
    const result = validateInput(overScheduledInput);
    expect(result.warnings.some(w => w.field === 'paymentSchedule')).toBe(true);
  });
});

describe('computeDerived', () => {
  it('должен корректно вычислять monthsTotal', () => {
    const derived = computeDerived(testInput);
    expect(derived.monthsTotal).toBe(testInput.monthsRepair + testInput.monthsExposure);
  });
  
  it('должен корректно вычислять carryingMonthly', () => {
    const derived = computeDerived(testInput);
    const expected = testInput.serviceChargeAnnual / 12 + testInput.dewaMonthly;
    expect(derived.carryingMonthly).toBeCloseTo(expected, 0);
  });
  
  it('должен обработать нулевые носимые расходы', () => {
    const zeroCostsInput: DealInput = {
      ...testInput,
      serviceChargeAnnual: 0,
      dewaMonthly: 0,
    };
    
    const derived = computeDerived(zeroCostsInput);
    expect(derived.carryingMonthly).toBe(0);
  });
});

describe('Дополнительные edge cases', () => {
  it('должен обработать очень маленькую прибыль', () => {
    const smallProfitInput: DealInput = {
      ...testInput,
      salePrice: 1860000, // чуть выше break-even
    };
    
    const project = computeProject(smallProfitInput);
    expect(project.profit).toBeGreaterThan(0);
    expect(project.profit).toBeLessThan(50000);
  });
  
  it('должен обработать очень длинный срок сделки', () => {
    const longTermInput: DealInput = {
      ...testInput,
      monthsRepair: 12,
      monthsExposure: 24,
    };
    
    const project = computeProject(longTermInput);
    expect(project.irrAnnual).toBeLessThan(0.5); // IRR снижается с увеличением срока
    expect(project.totalCosts).toBeGreaterThan(testInput.purchasePrice);
  });
  
  it('должен обработать нулевую комиссию продавца', () => {
    const noSellerFeeInput: DealInput = {
      ...testInput,
      sellerFeePct: 0,
      sellerFeeVatPct: 0,
    };
    
    const project = computeProject(noSellerFeeInput);
    expect(project.netProceeds).toBe(noSellerFeeInput.salePrice);
    expect(project.breakEvenSalePrice).toBe(project.totalCosts);
  });
  
  it('должен корректно считать при высоких комиссиях покупателя', () => {
    const highBuyerFeeInput: DealInput = {
      ...testInput,
      dldPct: 6,
      buyerFeePct: 5,
      buyerFeeVatPct: 10,
    };
    
    const project = computeProject(highBuyerFeeInput);
    expect(project.totalCosts).toBeGreaterThan(testInput.purchasePrice * 1.1);
  });
  
  it('должен обработать off-plan с 100% оплатой', () => {
    const fullPaidOffplan: DealInput = {
      ...offplanInput,
      paidAmount: offplanInput.purchasePrice,
      paymentSchedule: [],
    };
    
    const project = computeProject(fullPaidOffplan);
    expect(project.remainingDebt).toBe(0);
    // Должен быть схож с secondary расчётом
  });
  
  it('должен корректно округлять денежные значения', () => {
    const oddNumbersInput: DealInput = {
      ...testInput,
      purchasePrice: 1234567.89,
      salePrice: 2345678.90,
    };
    
    const project = computeProject(oddNumbersInput);
    // Проверяем что нет дробных копеек
    expect(project.totalCosts).toBe(Math.round(project.totalCosts));
    expect(project.netProceeds).toBe(Math.round(project.netProceeds));
    expect(project.profit).toBe(Math.round(project.profit));
  });
});
