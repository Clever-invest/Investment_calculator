/**
 * Список сохранённых объектов
 */

import React from 'react';
import { Save, MapPin, Home, Trash2 } from 'lucide-react';
import { formatCurrency } from '../../utils/format';
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
  if (properties.length === 0) {
    return (
      <div>
        <h3 className="text-base sm:text-lg font-bold mb-3 sm:mb-4">Сохраненные объекты</h3>
        <div className="text-center py-8 text-gray-500">
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
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {properties.map((property) => (
          <div key={property.id} className="border border-gray-200 rounded-lg p-3 sm:p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-gray-800 text-sm sm:text-base">
                  {property.propertyName || 'Без названия'}
                </h4>
                <div className="flex items-center gap-3 mt-1 text-xs sm:text-sm text-gray-600">
                  {property.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {property.location.split(',')[0]}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Home className="w-3 h-3" />
                    {property.propertyType}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 mt-3 text-xs sm:text-sm">
                  <div>
                    <span className="text-gray-500">Покупка:</span>
                    <p className="font-medium">{formatCurrency(property.purchasePrice)}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Продажа:</span>
                    <p className="font-medium">{formatCurrency(property.sellingPrice)}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Прибыль:</span>
                    <p className={`font-medium ${property?.calculations?.profit?.net > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(property?.calculations?.profit?.net ?? 0)}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-2 text-xs sm:text-sm">
                  <div>
                    <span className="text-gray-500">ROI:</span>
                    <span className="font-medium text-blue-600 ml-2">
                      {(property?.calculations?.profit?.roi ?? 0).toFixed(1)}%
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Срок:</span>
                    <span className="font-medium ml-2">
                      {property?.calculations?.totalMonths ?? 0} мес
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-2 shrink-0">
                <button
                  onClick={() => onLoad(property)}
                  className="px-3 py-1 bg-blue-500 text-white rounded-lg text-xs sm:text-sm hover:bg-blue-600 transition-colors"
                >
                  Загрузить
                </button>
                <button
                  onClick={() => onDelete(property.id)}
                  className="px-3 py-1 bg-red-500 text-white rounded-lg text-xs sm:text-sm hover:bg-red-600 transition-colors flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
