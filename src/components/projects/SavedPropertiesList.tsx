/**
 * Список сохранённых объектов
 * Optimized for mobile with vertical layout
 */

import React from 'react';
import { Save, MapPin, Home, Trash2, Download } from 'lucide-react';
import { formatCurrency } from '../../utils/format';
import { exportDealSheetHTML } from './DealSheetExport';
import type { SavedProperty } from '../../types/calculator';

interface SavedPropertiesListProps {
  properties: SavedProperty[];
  onLoad: (property: SavedProperty) => void;
  onDelete: (id: string) => void;
}

export const SavedPropertiesList: React.FC<SavedPropertiesListProps> = ({
  properties,
  onLoad,
  onDelete
}) => {
  // Export handler for individual property
  const handleExportProperty = (property: SavedProperty) => {
    // Create params from saved property
    const params = {
      propertyName: property.propertyName,
      location: property.location,
      propertyType: property.propertyType ?? 'apartment',
      dealType: property.dealType ?? 'secondary',
      bedrooms: property.bedrooms ?? 1,
      bathrooms: property.bathrooms ?? 1,
      unitAreaSqft: property.unitAreaSqft ?? 0,
      plotAreaSqft: property.plotAreaSqft ?? 0,
      propertyImages: property.propertyImages ?? [],
      purchasePrice: property.purchasePrice,
      sellingPrice: property.sellingPrice,
      dldFees: property.dldFees,
      buyerCommission: property.buyerCommission,
      sellerCommission: property.sellerCommission,
      renovationBudget: property.renovationBudget,
      contingency: property.contingency,
      renovationMonths: property.renovationMonths,
      listingMonths: property.listingMonths,
      serviceChargeYearly: property.serviceChargeYearly ?? 6000,
      dewaAcMonthly: property.dewaAcMonthly ?? 500,
      trusteeOfficeFee: property.trusteeOfficeFee ?? 5000,
      targetReturn: property.targetReturn,
      marketGrowth: property.marketGrowth,
      renovationComments: property.renovationComments ?? '',
      paidAmount: property.paidAmount ?? 0,
      paymentSchedule: property.paymentSchedule ?? []
    };

    exportDealSheetHTML(params, property.calculations, property.coordinates, formatCurrency);
  };

  if (properties.length === 0) {
    return (
      <div>
        <h3 className="text-base sm:text-lg font-bold mb-3 sm:mb-4">Сохраненные объекты</h3>
        <div className="text-center py-8 text-muted-foreground">
          <Save className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">Нет сохраненных объектов</p>
          <p className="text-xs sm:text-sm mt-1">Заполните параметры и нажмите «Сохранить объект»</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-base sm:text-lg font-bold mb-3 sm:mb-4">Сохраненные объекты</h3>
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {properties.map((property) => (
          <div key={property.id} className="border border-border rounded-xl overflow-hidden hover:shadow-md transition-shadow bg-card">
            {/* Header */}
            <div className="bg-muted/50 px-4 py-3 border-b border-border">
              <h4 className="font-bold text-foreground text-sm sm:text-base truncate">
                {property.propertyName || 'Без названия'}
              </h4>
              <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                {property.location && (
                  <span className="flex items-center gap-1 truncate">
                    <MapPin className="w-3 h-3 shrink-0" />
                    <span className="truncate">{property.location.split(',')[0]}</span>
                  </span>
                )}
                <span className="flex items-center gap-1 shrink-0">
                  <Home className="w-3 h-3" />
                  {property.propertyType}
                </span>
              </div>
            </div>

            {/* Financial data - vertical on mobile, horizontal on desktop */}
            <div className="p-4 space-y-2">
              {/* Key metrics in vertical list for mobile */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
                <div className="flex justify-between sm:flex-col sm:items-start py-1 sm:py-0 border-b sm:border-b-0 border-border">
                  <span className="text-muted-foreground">Покупка:</span>
                  <span className="font-semibold text-foreground">{formatCurrency(property.purchasePrice)}</span>
                </div>
                <div className="flex justify-between sm:flex-col sm:items-start py-1 sm:py-0 border-b sm:border-b-0 border-border">
                  <span className="text-muted-foreground">Продажа:</span>
                  <span className="font-semibold text-foreground">{formatCurrency(property.sellingPrice)}</span>
                </div>
                <div className="flex justify-between sm:flex-col sm:items-start py-1 sm:py-0">
                  <span className="text-muted-foreground">Прибыль:</span>
                  <span className={`font-semibold ${(property?.calculations?.profit?.net ?? 0) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(property?.calculations?.profit?.net ?? 0)}
                  </span>
                </div>
              </div>

              {/* ROI and Term row */}
              <div className="flex items-center justify-between pt-2 border-t border-border">
                <div className="flex items-center gap-4 text-sm">
                  <span>
                    <span className="text-muted-foreground">ROI: </span>
                    <span className="font-semibold text-blue-600">
                      {(property?.calculations?.profit?.roi ?? 0).toFixed(1)}%
                    </span>
                  </span>
                  <span>
                    <span className="text-muted-foreground">Срок: </span>
                    <span className="font-semibold text-foreground">
                      {property?.calculations?.totalMonths ?? 0} мес
                    </span>
                  </span>
                </div>
              </div>
            </div>

            {/* Actions footer */}
            <div className="flex items-center gap-2 px-4 py-3 bg-muted/50 border-t border-border">
              <button
                onClick={() => onLoad(property)}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
              >
                Загрузить
              </button>
              <button
                onClick={() => handleExportProperty(property)}
                className="px-3 py-2 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600 transition-colors flex items-center gap-1"
                title="Экспорт PDF"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">PDF</span>
              </button>
              <button
                onClick={() => onDelete(property.id)}
                className="px-3 py-2 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 transition-colors"
                title="Удалить"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
