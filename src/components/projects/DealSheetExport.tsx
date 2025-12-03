/**
 * Экспорт листа сделки в PDF
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
  const formatted = {
    propertyName: params.propertyName || 'Без названия',
    location: params.location || '',
    dealTypeLabel: params.dealType === 'offplan' ? '🏗️ Off-Plan' : '🏢 Вторичка',
    date: new Date().toLocaleString('ru-RU'),
    netProfit: formatFn(calculations.profit.net),
    roi: calculations.profit.roi.toFixed(1),
    irr: calculations.profit.irr.toFixed(1),
    totalMonths: calculations.totalMonths,
    purchasePrice: formatFn(params.purchasePrice),
    paidAmount: params.dealType === 'offplan' ? formatFn(params.paidAmount) : null,
    remainingDebt: params.dealType === 'offplan' && calculations.remainingDebt ? formatFn(calculations.remainingDebt) : null,
    sellingPrice: formatFn(params.sellingPrice),
    totalCosts: formatFn(calculations.costs.total),
    revenue: formatFn(calculations.revenue.net),
    breakEven: formatFn(calculations.breakEven)
  };

  const profitColor = calculations.profit.net > 0 ? '#d1fae5' : '#fee2e2';
  const profitTextColor = calculations.profit.net > 0 ? '#065f46' : '#991b1b';

  const mapHtml = coordinates ? `
    <div style="margin-top: 20px;">
      <h3 style="color: #1e40af; margin-bottom: 10px;">Карта локации</h3>
      <iframe width="100%" height="200" frameBorder="0" scrolling="no"
        src="https://www.openstreetmap.org/export/embed.html?bbox=${coordinates.lon - 0.01},${coordinates.lat - 0.01},${coordinates.lon + 0.01},${coordinates.lat + 0.01}&layer=mapnik&marker=${coordinates.lat},${coordinates.lon}"
        style="border: 2px solid #e5e7eb; border-radius: 8px;">
      </iframe>
    </div>
  ` : '';

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Не удалось открыть окно печати');
    return;
  }

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Лист сделки - ${formatted.propertyName}</title>
      <meta charset="UTF-8">
      <style>
        body { font-family: -apple-system, sans-serif; padding: 24px; background: #f9fafb; }
        .container { max-width: 900px; margin: 0 auto; background: white; padding: 24px; border-radius: 12px; }
        .header { text-align: center; border-bottom: 3px solid #3b82f6; padding-bottom: 12px; margin-bottom: 20px; }
        h1 { color: #1e40af; font-size: 22px; }
        .subtitle { color: #6b7280; font-size: 13px; }
        .section { margin-bottom: 16px; padding: 12px; background: #f9fafb; border-radius: 8px; border-left: 4px solid #3b82f6; }
        .section h2 { color: #1e40af; font-size: 16px; margin-bottom: 10px; }
        .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; }
        .item { display: flex; justify-content: space-between; padding: 8px; background: white; border-radius: 6px; border: 1px solid #e5e7eb; font-size: 13px; }
        .label { color: #6b7280; }
        .value { font-weight: 600; color: #111827; }
        .kpi { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 20px; }
        .kpi-card { text-align: center; padding: 16px; border-radius: 8px; }
        .kpi-value { font-size: 22px; font-weight: 700; }
        .kpi-label { font-size: 12px; color: #6b7280; margin-top: 4px; }
        .profit-card { background: ${profitColor}; }
        .profit-value { color: ${profitTextColor}; }
        @media print { body { background: white; } .container { box-shadow: none; } }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${formatted.propertyName}</h1>
          <div class="subtitle">${formatted.location} | ${formatted.dealTypeLabel} | ${formatted.date}</div>
        </div>
        
        <div class="kpi">
          <div class="kpi-card profit-card">
            <div class="kpi-value profit-value">${formatted.netProfit}</div>
            <div class="kpi-label">Чистая прибыль</div>
          </div>
          <div class="kpi-card" style="background: #dbeafe;">
            <div class="kpi-value" style="color: #1e40af;">${formatted.roi}%</div>
            <div class="kpi-label">ROI</div>
          </div>
          <div class="kpi-card" style="background: #ede9fe;">
            <div class="kpi-value" style="color: #5b21b6;">${formatted.irr}%</div>
            <div class="kpi-label">IRR</div>
          </div>
          <div class="kpi-card" style="background: #fef3c7;">
            <div class="kpi-value" style="color: #92400e;">${formatted.totalMonths} мес</div>
            <div class="kpi-label">Срок</div>
          </div>
        </div>

        <div class="section">
          <h2>Финансовые показатели</h2>
          <div class="grid">
            <div class="item"><span class="label">Цена покупки</span><span class="value">${formatted.purchasePrice}</span></div>
            ${formatted.paidAmount ? `<div class="item"><span class="label">Фактически оплачено</span><span class="value">${formatted.paidAmount}</span></div>` : ''}
            ${formatted.remainingDebt ? `<div class="item"><span class="label">Остаток долга</span><span class="value">${formatted.remainingDebt}</span></div>` : ''}
            <div class="item"><span class="label">Цена продажи</span><span class="value">${formatted.sellingPrice}</span></div>
            <div class="item"><span class="label">Общие затраты</span><span class="value">${formatted.totalCosts}</span></div>
            <div class="item"><span class="label">Чистая выручка</span><span class="value">${formatted.revenue}</span></div>
            <div class="item"><span class="label">Точка безубыточности</span><span class="value">${formatted.breakEven}</span></div>
          </div>
        </div>
        
        ${mapHtml}
        
        <div style="margin-top: 20px; text-align: center; color: #9ca3af; font-size: 11px;">
          Сгенерировано Investment Calculator | ${formatted.date}
        </div>
      </div>
      <script>setTimeout(() => window.print(), 500);</script>
    </body>
    </html>
  `);
  printWindow.document.close();
};

export const DealSheetExport: React.FC<DealSheetExportProps> = ({
  params,
  calculations,
  coordinates
}) => {
  const exportDealSheet = () => {
    const formatted = {
      propertyName: params.propertyName || 'Без названия',
      location: params.location || '',
      propertyType: params.propertyType,
      dealType: params.dealType,
      dealTypeLabel: params.dealType === 'offplan' ? '🏗️ Off-Plan' : '🏢 Вторичка',
      date: new Date().toLocaleString('ru-RU'),
      netProfit: formatCurrency(calculations.profit.net),
      roi: calculations.profit.roi.toFixed(1),
      irr: calculations.profit.irr.toFixed(1),
      totalMonths: calculations.totalMonths,
      purchasePrice: formatCurrency(params.purchasePrice),
      paidAmount: params.dealType === 'offplan' ? formatCurrency(params.paidAmount) : null,
      remainingDebt: params.dealType === 'offplan' && calculations.remainingDebt ? formatCurrency(calculations.remainingDebt) : null,
      sellingPrice: formatCurrency(params.sellingPrice),
      totalCosts: formatCurrency(calculations.costs.total),
      revenue: formatCurrency(calculations.revenue.net),
      breakEven: formatCurrency(calculations.breakEven)
    };

    const profitColor = calculations.profit.net > 0 ? '#d1fae5' : '#fee2e2';
    const profitTextColor = calculations.profit.net > 0 ? '#065f46' : '#991b1b';

    const mapHtml = coordinates ? `
      <div style="margin-top: 20px;">
        <h3 style="color: #1e40af; margin-bottom: 10px;">Карта локации</h3>
        <iframe width="100%" height="200" frameBorder="0" scrolling="no"
          src="https://www.openstreetmap.org/export/embed.html?bbox=${coordinates.lon - 0.01},${coordinates.lat - 0.01},${coordinates.lon + 0.01},${coordinates.lat + 0.01}&layer=mapnik&marker=${coordinates.lat},${coordinates.lon}"
          style="border: 2px solid #e5e7eb; border-radius: 8px;">
        </iframe>
      </div>
    ` : '';

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Не удалось открыть окно печати');
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Лист сделки - ${formatted.propertyName}</title>
        <meta charset="UTF-8">
        <style>
          body { font-family: -apple-system, sans-serif; padding: 24px; background: #f9fafb; }
          .container { max-width: 900px; margin: 0 auto; background: white; padding: 24px; border-radius: 12px; }
          .header { text-align: center; border-bottom: 3px solid #3b82f6; padding-bottom: 12px; margin-bottom: 20px; }
          h1 { color: #1e40af; font-size: 22px; }
          .subtitle { color: #6b7280; font-size: 13px; }
          .section { margin-bottom: 16px; padding: 12px; background: #f9fafb; border-radius: 8px; border-left: 4px solid #3b82f6; }
          .section h2 { color: #1e40af; font-size: 16px; margin-bottom: 10px; }
          .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; }
          .item { display: flex; justify-content: space-between; padding: 8px; background: white; border-radius: 6px; border: 1px solid #e5e7eb; font-size: 13px; }
          .label { color: #6b7280; }
          .value { font-weight: 600; color: #111827; }
          .kpi { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 20px; }
          .kpi-card { text-align: center; padding: 16px; border-radius: 8px; }
          .kpi-value { font-size: 22px; font-weight: 700; }
          .kpi-label { font-size: 12px; color: #6b7280; margin-top: 4px; }
          .profit-card { background: ${profitColor}; }
          .profit-value { color: ${profitTextColor}; }
          @media print { body { background: white; } .container { box-shadow: none; } }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${formatted.propertyName}</h1>
            <div class="subtitle">${formatted.location} | ${formatted.dealTypeLabel} | ${formatted.date}</div>
          </div>
          
          <div class="kpi">
            <div class="kpi-card profit-card">
              <div class="kpi-value profit-value">${formatted.netProfit}</div>
              <div class="kpi-label">Чистая прибыль</div>
            </div>
            <div class="kpi-card" style="background: #dbeafe;">
              <div class="kpi-value" style="color: #1e40af;">${formatted.roi}%</div>
              <div class="kpi-label">ROI</div>
            </div>
            <div class="kpi-card" style="background: #ede9fe;">
              <div class="kpi-value" style="color: #5b21b6;">${formatted.irr}%</div>
              <div class="kpi-label">IRR</div>
            </div>
            <div class="kpi-card" style="background: #fef3c7;">
              <div class="kpi-value" style="color: #92400e;">${formatted.totalMonths} мес</div>
              <div class="kpi-label">Срок</div>
            </div>
          </div>

          <div class="section">
            <h2>Финансовые показатели</h2>
            <div class="grid">
              <div class="item"><span class="label">Цена покупки</span><span class="value">${formatted.purchasePrice}</span></div>
              ${formatted.paidAmount ? `<div class="item"><span class="label">Фактически оплачено</span><span class="value">${formatted.paidAmount}</span></div>` : ''}
              ${formatted.remainingDebt ? `<div class="item"><span class="label">Остаток долга</span><span class="value">${formatted.remainingDebt}</span></div>` : ''}
              <div class="item"><span class="label">Цена продажи</span><span class="value">${formatted.sellingPrice}</span></div>
              <div class="item"><span class="label">Общие затраты</span><span class="value">${formatted.totalCosts}</span></div>
              <div class="item"><span class="label">Чистая выручка</span><span class="value">${formatted.revenue}</span></div>
              <div class="item"><span class="label">Точка безубыточности</span><span class="value">${formatted.breakEven}</span></div>
            </div>
          </div>
          
          ${mapHtml}
          
          <div style="margin-top: 20px; text-align: center; color: #9ca3af; font-size: 11px;">
            Сгенерировано Investment Calculator | ${formatted.date}
          </div>
        </div>
        <script>setTimeout(() => window.print(), 500);</script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <button
      onClick={exportDealSheet}
      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:shadow-lg transition-shadow text-sm font-medium"
    >
      <Download className="w-4 h-4" />
      Экспорт PDF
    </button>
  );
};
