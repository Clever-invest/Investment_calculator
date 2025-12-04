/**
 * Экспорт листа сделки в PDF - полная версия
 */

import React from 'react';
import { Download } from 'lucide-react';
import { formatCurrency } from '../../utils/format';
import type { CalculatorParams, Calculations, Coordinates } from '../../types/calculator';

interface DealSheetExportProps {
  params: CalculatorParams;
  calculations: Calculations;
  coordinates: Coordinates | null;
}

// Функция экспорта для использования извне компонента
export const exportDealSheetHTML = (
  params: CalculatorParams,
  calculations: Calculations,
  coordinates: Coordinates | null,
  formatFn: (v: number) => string
) => {
  const propertyTypeLabel = {
    apartment: 'Апартаменты',
    villa: 'Вилла',
    townhouse: 'Таунхаус'
  }[params.propertyType] || params.propertyType;

  const formatted = {
    propertyName: params.propertyName || 'Без названия',
    location: params.location || '',
    propertyType: propertyTypeLabel,
    dealType: params.dealType,
    dealTypeLabel: params.dealType === 'offplan' ? '🏗️ Off-Plan' : '🏢 Вторичка',
    date: new Date().toLocaleString('ru-RU'),
    // Ключевые метрики
    netProfit: formatFn(calculations.profit.net),
    roi: calculations.profit.roi.toFixed(1),
    irr: calculations.profit.irr.toFixed(1),
    totalMonths: calculations.totalMonths,
    // Финансовые параметры
    purchasePrice: formatFn(params.purchasePrice),
    paidAmount: params.dealType === 'offplan' ? formatFn(params.paidAmount) : null,
    remainingDebt: params.dealType === 'offplan' && calculations.remainingDebt ? formatFn(calculations.remainingDebt) : null,
    sellingPrice: formatFn(params.sellingPrice),
    // DLD и комиссии
    dldPercent: params.dldFees,
    dldAmount: formatFn(calculations.costs.dld),
    buyerCommission: params.buyerCommission,
    buyerCommissionAmount: formatFn(calculations.costs.buyerCommission),
    buyerCommissionVAT: formatFn(calculations.costs.buyerCommissionVAT),
    sellerCommission: params.sellerCommission,
    sellerCommissionAmount: formatFn(calculations.revenue.sellerCommission),
    sellerCommissionVAT: formatFn(calculations.revenue.sellerCommissionVAT),
    // Ремонт
    renovationBudget: formatFn(params.renovationBudget),
    contingency: params.contingency,
    contingencyAmount: formatFn(calculations.costs.renovation - params.renovationBudget),
    // Содержание
    serviceChargeYearly: formatFn(params.serviceChargeYearly),
    serviceCharge: formatFn(calculations.costs.serviceCharge),
    dewaAcMonthly: formatFn(params.dewaAcMonthly),
    dewaAc: formatFn(calculations.costs.dewaAc),
    trusteeOfficeFee: formatFn(params.trusteeOfficeFee),
    // Итоги
    totalCosts: formatFn(calculations.costs.total),
    purchase: formatFn(calculations.costs.purchase),
    dld: formatFn(calculations.costs.dld),
    buyerComm: formatFn(calculations.costs.buyerCommission),
    renovation: formatFn(calculations.costs.renovation),
    trustee: formatFn(calculations.costs.trusteeOfficeFee),
    revenue: formatFn(calculations.revenue.net),
    // Сроки
    renovationMonths: params.renovationMonths,
    listingMonths: params.listingMonths,
    breakEven: formatFn(calculations.breakEven)
  };

  const profitColor = calculations.profit.net > 0 ? '#d1fae5' : '#fee2e2';
  const profitClass = calculations.profit.net > 0 ? 'positive' : 'negative';

  const mapHtml = coordinates ? `
    <div style="margin-top: 20px;">
      <h3 style="color: #1e40af; margin-bottom: 10px;">📍 Карта локации</h3>
      <div style="width: 100%; max-width: 600px; height: 300px; border: 2px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
        <iframe
          width="100%" height="100%" frameBorder="0" scrolling="no" marginHeight="0" marginWidth="0"
          src="https://www.openstreetmap.org/export/embed.html?bbox=${coordinates.lon - 0.01},${coordinates.lat - 0.01},${coordinates.lon + 0.01},${coordinates.lat + 0.01}&layer=mapnik&marker=${coordinates.lat},${coordinates.lon}"
          style="border: 0;">
        </iframe>
      </div>
    </div>
  ` : '';

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('❌ Не удалось открыть окно печати. Разрешите всплывающие окна для этого сайта.');
    return;
  }

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Лист сделки - ${formatted.propertyName}</title>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 24px; background: #f9fafb; color: #1f2937; }
        .container { max-width: 1000px; margin: 0 auto; background: white; padding: 24px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .header { text-align: center; border-bottom: 3px solid #3b82f6; padding-bottom: 12px; margin-bottom: 20px; }
        h1 { color: #1e40af; font-size: 24px; margin-bottom: 8px; }
        .subtitle { color: #6b7280; font-size: 14px; }
        .section { margin-bottom: 20px; padding: 16px; background: #f9fafb; border-radius: 8px; border-left: 4px solid #3b82f6; }
        .section h2 { color: #1e40af; font-size: 18px; margin-bottom: 12px; }
        .info-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
        @media (max-width: 640px) { .info-grid { grid-template-columns: 1fr; } }
        .info-item { display: flex; justify-content: space-between; padding: 10px; background: white; border-radius: 6px; border: 1px solid #e5e7eb; }
        .info-label { color: #6b7280; font-weight: 500; }
        .info-value { font-weight: 700; color: #1f2937; }
        .metric-card { padding: 16px; background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); color: white; border-radius: 12px; text-align: center; }
        .metric-label { font-size: 12px; opacity: 0.9; margin-bottom: 4px; }
        .metric-value { font-size: 24px; font-weight: 700; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; background: white; }
        th, td { padding: 10px; text-align: left; border-bottom: 1px solid #e5e7eb; }
        th { background: #f3f4f6; color: #374151; font-weight: 600; }
        .positive { color: #10b981; font-weight: 600; }
        .negative { color: #ef4444; font-weight: 600; }
        .footer { margin-top: 24px; padding-top: 16px; border-top: 2px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 12px; }
        @media print { body { padding: 16px; background: white; } .container { box-shadow: none; } @page { margin: 1cm; } }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📊 Лист сделки флиппинга</h1>
          <div class="subtitle">${formatted.propertyName}</div>
          <div class="subtitle" style="margin-top: 5px;">
            ${formatted.location ? '📍 ' + formatted.location : ''} 
            ${formatted.propertyType ? '• ' + formatted.propertyType : ''}
            ${formatted.dealTypeLabel ? '• ' + formatted.dealTypeLabel : ''}
          </div>
          <div class="subtitle" style="margin-top: 5px; font-size: 12px;">
            Создано: ${formatted.date}
          </div>
        </div>

        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 16px;">
          <div class="metric-card"><div class="metric-label">Чистая прибыль</div><div class="metric-value">${formatted.netProfit}</div></div>
          <div class="metric-card"><div class="metric-label">ROI</div><div class="metric-value">${formatted.roi}%</div></div>
          <div class="metric-card"><div class="metric-label">IRR</div><div class="metric-value">${formatted.irr}%</div></div>
          <div class="metric-card"><div class="metric-label">Срок</div><div class="metric-value">${formatted.totalMonths} мес</div></div>
        </div>

        <div class="section">
          <h2>💰 Финансовые параметры</h2>
          <div class="info-grid">
            <div class="info-item"><span class="info-label">${formatted.dealType === 'offplan' ? 'Общая стоимость от застройщика' : 'Цена покупки'}</span><span class="info-value">${formatted.purchasePrice}</span></div>
            ${formatted.dealType === 'offplan' && formatted.paidAmount ? `<div class="info-item"><span class="info-label">Фактически оплачено</span><span class="info-value">${formatted.paidAmount}</span></div>` : ''}
            ${formatted.dealType === 'offplan' && formatted.remainingDebt ? `<div class="info-item"><span class="info-label">Остаток долга (план платежей)</span><span class="info-value">${formatted.remainingDebt}</span></div>` : ''}
            <div class="info-item"><span class="info-label">Цена продажи</span><span class="info-value">${formatted.sellingPrice}</span></div>
            <div class="info-item"><span class="info-label">DLD/регистрация (${formatted.dldPercent}%)</span><span class="info-value">${formatted.dldAmount}</span></div>
            <div class="info-item"><span class="info-label">Комиссия покупателя (${formatted.buyerCommission}%)</span><span class="info-value">${formatted.buyerCommissionAmount}</span></div>
            <div class="info-item"><span class="info-label">VAT на комиссию покупателя (5%)</span><span class="info-value">${formatted.buyerCommissionVAT}</span></div>
            <div class="info-item"><span class="info-label">Комиссия продавца (${formatted.sellerCommission}%)</span><span class="info-value">${formatted.sellerCommissionAmount}</span></div>
            <div class="info-item"><span class="info-label">VAT на комиссию продавца (5%)</span><span class="info-value">${formatted.sellerCommissionVAT}</span></div>
            <div class="info-item"><span class="info-label">Бюджет ремонта</span><span class="info-value">${formatted.renovationBudget}</span></div>
            <div class="info-item"><span class="info-label">Резерв (${formatted.contingency}%)</span><span class="info-value">${formatted.contingencyAmount}</span></div>
            <div class="info-item"><span class="info-label">Service Charge (год: ${formatted.serviceChargeYearly})</span><span class="info-value">${formatted.serviceCharge}</span></div>
            <div class="info-item"><span class="info-label">DEWA AC (мес: ${formatted.dewaAcMonthly})</span><span class="info-value">${formatted.dewaAc}</span></div>
            <div class="info-item"><span class="info-label">Trustee Office Fee</span><span class="info-value">${formatted.trusteeOfficeFee}</span></div>
          </div>
        </div>

        <div class="section">
          <h2>📈 Затраты и выручка</h2>
          <table>
            <tr><td><strong>Общие затраты</strong></td><td style="text-align: right;"><strong>${formatted.totalCosts}</strong></td></tr>
            <tr><td>${formatted.dealType === 'offplan' ? 'Оплачено застройщику' : 'Покупка'}</td><td style="text-align: right;">${formatted.purchase}</td></tr>
            <tr><td>DLD/регистрация</td><td style="text-align: right;">${formatted.dld}</td></tr>
            <tr><td>Комиссия покупателя</td><td style="text-align: right;">${formatted.buyerComm}</td></tr>
            <tr><td>VAT на комиссию покупателя</td><td style="text-align: right;">${formatted.buyerCommissionVAT}</td></tr>
            <tr><td>Ремонт</td><td style="text-align: right;">${formatted.renovation}</td></tr>
            <tr><td>Service Charge</td><td style="text-align: right;">${formatted.serviceCharge}</td></tr>
            <tr><td>DEWA AC</td><td style="text-align: right;">${formatted.dewaAc}</td></tr>
            <tr><td>Trustee Office Fee</td><td style="text-align: right;">${formatted.trustee}</td></tr>
            <tr style="border-top: 2px solid #3b82f6;">
              <td><strong>Чистая выручка</strong></td><td style="text-align: right;"><strong>${formatted.revenue}</strong></td>
            </tr>
            <tr style="background: ${profitColor};">
              <td><strong>Чистая прибыль</strong></td>
              <td style="text-align: right;" class="${profitClass}"><strong>${formatted.netProfit}</strong></td>
            </tr>
          </table>
        </div>

        <div class="section">
          <h2>⏱️ График сделки</h2>
          <div class="info-grid">
            <div class="info-item"><span class="info-label">Срок ремонта</span><span class="info-value">${formatted.renovationMonths} месяцев</span></div>
            <div class="info-item"><span class="info-label">Срок экспозиции</span><span class="info-value">${formatted.listingMonths} месяцев</span></div>
            <div class="info-item"><span class="info-label">Общий срок</span><span class="info-value">${formatted.totalMonths} месяцев</span></div>
            <div class="info-item"><span class="info-label">Точка безубыточности</span><span class="info-value">${formatted.breakEven}</span></div>
          </div>
        </div>

        ${mapHtml}

        <div class="footer">
          <p><strong>Калькулятор флиппинга недвижимости</strong></p>
          <p>Этот документ создан автоматически и предназначен только для информационных целей</p>
        </div>
      </div>
    </body>
    </html>
  `);

  printWindow.document.close();
  setTimeout(() => {
    try { printWindow.print(); }
    catch { alert('Документ открыт в новом окне. Используйте Ctrl+P или Cmd+P для печати.'); }
  }, 400);
};

export const DealSheetExport: React.FC<DealSheetExportProps> = ({
  params,
  calculations,
  coordinates
}) => {
  const handleExport = () => {
    exportDealSheetHTML(params, calculations, coordinates, formatCurrency);
  };

  return (
    <button
      onClick={handleExport}
      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:shadow-lg transition-shadow text-sm font-medium"
    >
      <Download className="w-4 h-4" />
      Экспорт PDF
    </button>
  );
};
