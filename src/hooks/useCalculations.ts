/**
 * Хук для расчёта метрик сделки
 */

import { useMemo } from 'react';
import type {
  CalculatorParams,
  Calculations,
  WaterfallDataItem,
  SensitivityDataItem,
  EarlyDiscountDataItem,
  CustomMetric
} from '../types/calculator';

export const useCalculations = (params: CalculatorParams): Calculations => {
  return useMemo(() => {
    const {
      purchasePrice, sellingPrice, dldFees, buyerCommission, sellerCommission,
      renovationBudget, contingency, renovationMonths, listingMonths,
      serviceChargeYearly, dewaAcMonthly, trusteeOfficeFee,
      dealType, paidAmount, paymentSchedule
    } = params;

    // Комиссии
    const dldAmount = purchasePrice * (dldFees / 100);
    const buyerCommissionAmount = purchasePrice * (buyerCommission / 100);
    const buyerCommissionVAT = buyerCommissionAmount * 0.05;
    const buyerCommissionTotal = buyerCommissionAmount + buyerCommissionVAT;

    const contingencyAmount = renovationBudget * (contingency / 100);
    const totalRenovation = renovationBudget + contingencyAmount;

    const totalMonths = renovationMonths + listingMonths;
    const serviceChargeMonthly = serviceChargeYearly / 12;
    const carryingService = serviceChargeMonthly * totalMonths;
    const carryingDewa = dewaAcMonthly * totalMonths;

    const buyClosingFees = trusteeOfficeFee;

    let totalCosts: number;
    let revenueNet: number;
    let remainingDebt = 0;

    if (dealType === 'offplan') {
      const actualPaid = paidAmount || 0;

      const saleDate = new Date();
      saleDate.setMonth(saleDate.getMonth() + totalMonths);

      remainingDebt = 0;
      if (paymentSchedule && paymentSchedule.length > 0) {
        remainingDebt = paymentSchedule
          .filter(p => {
            if (!p.date) return true;
            const paymentDate = new Date(p.date);
            if (isNaN(paymentDate.getTime())) return true;
            return paymentDate <= saleDate;
          })
          .reduce((sum, p) => sum + (p.amount || 0), 0);
      }

      totalCosts = actualPaid + dldAmount + buyerCommissionTotal + totalRenovation + carryingService + carryingDewa + buyClosingFees;

      const sellerCommissionAmount = sellingPrice * (sellerCommission / 100);
      const sellerCommissionVAT = sellerCommissionAmount * 0.05;
      const sellerCommissionTotal = sellerCommissionAmount + sellerCommissionVAT;

      revenueNet = sellingPrice - sellerCommissionTotal - remainingDebt;
    } else {
      totalCosts = purchasePrice + dldAmount + buyerCommissionTotal + totalRenovation + carryingService + carryingDewa + buyClosingFees;

      const sellerCommissionAmount = sellingPrice * (sellerCommission / 100);
      const sellerCommissionVAT = sellerCommissionAmount * 0.05;
      const sellerCommissionTotal = sellerCommissionAmount + sellerCommissionVAT;

      revenueNet = sellingPrice - sellerCommissionTotal;
    }

    const netProfit = revenueNet - totalCosts;
    const roi = totalCosts > 0 ? (netProfit / totalCosts) * 100 : 0;
    const irr = totalMonths > 0 && totalCosts > 0 && revenueNet > 0
      ? (Math.pow(revenueNet / totalCosts, 12 / totalMonths) - 1) * 100
      : 0;

    let breakEvenPrice: number;
    if (dealType === 'offplan') {
      breakEvenPrice = (totalCosts + remainingDebt) / (1 - (sellerCommission / 100) * 1.05);
    } else {
      breakEvenPrice = totalCosts / (1 - (sellerCommission / 100) * 1.05);
    }

    return {
      costs: {
        purchase: dealType === 'offplan' ? (paidAmount || 0) : purchasePrice,
        dld: dldAmount,
        buyerCommission: buyerCommissionAmount,
        buyerCommissionVAT: buyerCommissionVAT,
        buyerCommissionTotal: buyerCommissionTotal,
        renovation: totalRenovation,
        serviceCharge: carryingService,
        dewaAc: carryingDewa,
        trusteeOfficeFee: buyClosingFees,
        total: totalCosts
      },
      revenue: {
        sellingPrice: sellingPrice,
        sellerCommission: sellingPrice * (sellerCommission / 100),
        sellerCommissionVAT: (sellingPrice * (sellerCommission / 100)) * 0.05,
        sellerCommissionTotal: (sellingPrice * (sellerCommission / 100)) * 1.05,
        net: revenueNet,
        remainingDebt: dealType === 'offplan' ? remainingDebt : undefined
      },
      profit: { net: netProfit, roi, irr },
      breakEven: breakEvenPrice,
      totalMonths,
      remainingDebt: dealType === 'offplan' ? remainingDebt : undefined
    };
  }, [params]);
};

export const useWaterfallData = (
  params: CalculatorParams,
  calculations: Calculations
): WaterfallDataItem[] => {
  return useMemo(() => {
    const data: WaterfallDataItem[] = [
      { name: 'Цена продажи', value: calculations.revenue.sellingPrice, fill: '#10b981' },
      { name: 'Комиссия продавца', value: -calculations.revenue.sellerCommission, fill: '#ef4444' },
      { name: 'VAT (5%)', value: -calculations.revenue.sellerCommissionVAT, fill: '#ef4444' },
    ];

    if (params.dealType === 'offplan' && calculations.remainingDebt && calculations.remainingDebt > 0) {
      data.push({ name: '💳 Остаток долга', value: -calculations.remainingDebt, fill: '#9333ea' });
    }

    data.push(
      { name: params.dealType === 'offplan' ? 'Оплачено застройщику' : 'Покупка', value: -calculations.costs.purchase, fill: '#f59e0b' },
      { name: 'DLD/рег.', value: -calculations.costs.dld, fill: '#f59e0b' },
      { name: 'Комиссия покупателя', value: -calculations.costs.buyerCommission, fill: '#f59e0b' },
      { name: 'VAT (5%)', value: -calculations.costs.buyerCommissionVAT, fill: '#f59e0b' },
      { name: 'Ремонт', value: -calculations.costs.renovation, fill: '#f59e0b' },
      { name: 'Service Charge', value: -calculations.costs.serviceCharge, fill: '#f59e0b' },
      { name: 'DEWA AC', value: -calculations.costs.dewaAc, fill: '#f59e0b' },
      { name: 'Trustee Office (покупка)', value: -calculations.costs.trusteeOfficeFee, fill: '#f59e0b' },
      { name: 'Чистая прибыль', value: calculations.profit.net, fill: calculations.profit.net > 0 ? '#10b981' : '#ef4444' }
    );

    return data;
  }, [calculations, params.dealType]);
};

export const useSensitivityData = (
  params: CalculatorParams,
  calculations: Calculations
): SensitivityDataItem[] => {
  return useMemo(() => {
    const basePrice = params.sellingPrice;
    const baseReno = params.renovationBudget;
    const variations = [-10, -5, 0, 5, 10];

    return variations.map(pct => {
      const priceVar = basePrice * (1 + pct / 100);
      const renoVar = baseReno * (1 + pct / 100);

      const sellerCommAmt = priceVar * (params.sellerCommission / 100);
      const sellerCommVAT = sellerCommAmt * 0.05;
      const sellerCommTotal = sellerCommAmt + sellerCommVAT;
      const revenue1 = priceVar - sellerCommTotal;
      const profit1 = revenue1 - calculations.costs.total;

      const contingencyVar = renoVar * (params.contingency / 100);
      const totalRenoVar = renoVar + contingencyVar;
      const costsVar = calculations.costs.total - calculations.costs.renovation + totalRenoVar;
      const profit2 = calculations.revenue.net - costsVar;

      return {
        variation: `${pct > 0 ? '+' : ''}${pct}%`,
        priceChange: profit1,
        renoChange: profit2
      };
    });
  }, [calculations, params]);
};

export const useEarlyDiscountData = (
  params: CalculatorParams,
  calculations: Calculations,
  customMetrics: Record<number, CustomMetric>
): EarlyDiscountDataItem[] => {
  return useMemo(() => {
    const basePrice = params.sellingPrice;
    const listingWeeks = params.listingMonths * 4.33;
    const renovationWeeks = params.renovationMonths * 4.33;
    const dailyRate = params.targetReturn / 36500;

    const weeks: EarlyDiscountDataItem[] = [];
    for (let week = 0; week <= listingWeeks; week += 2) {
      const totalWeeksFromStart = renovationWeeks + week;
      const totalMonthsFromStart = totalWeeksFromStart / 4.33;

      let recommendedPrice: number;
      let roi: number | string;
      let irr: number | string;

      if (customMetrics[week]) {
        const custom = customMetrics[week];

        if (custom.type === 'roi') {
          const targetROI = parseFloat(custom.value) / 100;
          const targetRevenueNet = (targetROI + 1) * calculations.costs.total;
          recommendedPrice = targetRevenueNet / (1 - (params.sellerCommission / 100) * 1.05);
          roi = custom.value;

          const sellerComm = recommendedPrice * (params.sellerCommission / 100);
          const sellerVAT = sellerComm * 0.05;
          const actualRevenueNet = recommendedPrice - sellerComm - sellerVAT;
          irr = totalMonthsFromStart > 0
            ? (Math.pow(actualRevenueNet / calculations.costs.total, 12 / totalMonthsFromStart) - 1) * 100
            : 0;

        } else {
          const targetIRR = parseFloat(custom.value) / 100;
          const targetRevenueNet = calculations.costs.total * Math.pow(targetIRR + 1, totalMonthsFromStart / 12);
          recommendedPrice = targetRevenueNet / (1 - (params.sellerCommission / 100) * 1.05);
          irr = custom.value;

          const newProfit = targetRevenueNet - calculations.costs.total;
          roi = (newProfit / calculations.costs.total) * 100;
        }
      } else {
        const daysEarly = (listingWeeks - week) * 7;
        const discount = basePrice * dailyRate * daysEarly;
        recommendedPrice = Math.max(0, basePrice - discount);

        const sellerComm = recommendedPrice * (params.sellerCommission / 100);
        const sellerVAT = sellerComm * 0.05;
        const newRevenueNet = recommendedPrice - sellerComm - sellerVAT;
        const newProfit = newRevenueNet - calculations.costs.total;

        irr = totalMonthsFromStart > 0
          ? (Math.pow(newRevenueNet / calculations.costs.total, 12 / totalMonthsFromStart) - 1) * 100
          : 0;
        roi = (newProfit / calculations.costs.total) * 100;
      }

      const sellerComm = recommendedPrice * (params.sellerCommission / 100);
      const sellerVAT = sellerComm * 0.05;
      const newRevenueNet = recommendedPrice - sellerComm - sellerVAT;
      const newProfit = newRevenueNet - calculations.costs.total;
      const discount = basePrice - recommendedPrice;

      weeks.push({
        week: Math.round(week),
        weekLabel: `Неделя ${Math.round(week)} (месяц ${(totalMonthsFromStart).toFixed(1)})`,
        discount: Math.round(discount),
        price: Math.round(recommendedPrice),
        profit: Math.round(newProfit),
        roi: typeof roi === 'number' ? roi.toFixed(1) : roi,
        irr: typeof irr === 'number' ? irr.toFixed(1) : irr,
        totalMonths: totalMonthsFromStart.toFixed(1)
      });
    }
    return weeks;
  }, [calculations, params, customMetrics]);
};
