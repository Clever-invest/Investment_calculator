/**
 * Форма информации об объекте недвижимости
 */

import React from 'react';
import { LocationSearch } from './LocationSearch';
import { ImageUploader } from './ImageUploader';
import { formatArea } from '../../utils/format';
import type { CalculatorParams, Coordinates, PropertyType } from '../../types/calculator';

interface PropertyInfoFormProps {
  params: CalculatorParams;
  coordinates: Coordinates | null;
  propertyId?: string; // ID объекта для cloud storage (при редактировании)
  onParamChange: (key: keyof CalculatorParams, value: any) => void;
  onCoordinatesChange: (coords: Coordinates | null) => void;
}

const PROPERTY_TYPES: { value: PropertyType; label: string }[] = [
  { value: 'apartment', label: '🏢 Апартаменты' },
  { value: 'villa', label: '🏠 Вилла' },
  { value: 'townhouse', label: '🏘️ Таунхауз' }
];

export const PropertyInfoForm: React.FC<PropertyInfoFormProps> = ({
  params,
  coordinates,
  propertyId,
  onParamChange,
  onCoordinatesChange
}) => {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg sm:rounded-xl p-3 sm:p-4">
      <h2 className="text-base sm:text-lg font-bold text-gray-800 mb-3 sm:mb-4">Информация об объекте</h2>

      <div className="space-y-3 sm:space-y-4">
        {/* Название объекта */}
        <div>
          <label className="text-xs sm:text-sm font-medium text-gray-700 mb-1 block">Название объекта</label>
          <input
            type="text"
            value={params.propertyName}
            onChange={(e) => onParamChange('propertyName', e.target.value)}
            placeholder="Marina Bay Tower 3, Apt 2501"
            className="w-full px-3 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            aria-label="Название объекта"
          />
        </div>

        {/* Локация с картой */}
        <LocationSearch
          value={params.location}
          coordinates={coordinates}
          onChange={(location) => onParamChange('location', location)}
          onCoordinatesChange={onCoordinatesChange}
        />

        {/* Тип объекта */}
        <div>
          <label className="text-xs sm:text-sm font-medium text-gray-700 mb-2 block">Тип объекта</label>
          <div className="grid grid-cols-3 gap-2">
            {PROPERTY_TYPES.map(type => (
              <button
                key={type.value}
                type="button"
                onClick={() => onParamChange('propertyType', type.value)}
                className={`px-2 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                  params.propertyType === type.value
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {/* Площадь */}
        <div className="space-y-3">
          <div>
            <label className="text-xs sm:text-sm font-medium text-gray-700 mb-1 block">
              Площадь помещения: {formatArea(params.unitAreaSqft)}
            </label>
            <input
              type="number"
              value={params.unitAreaSqft || ''}
              onChange={(e) => onParamChange('unitAreaSqft', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Площадь в sqft"
              inputMode="numeric"
            />
          </div>

          {(params.propertyType === 'villa' || params.propertyType === 'townhouse') && (
            <div>
              <label className="text-xs sm:text-sm font-medium text-gray-700 mb-1 block">
                Площадь участка: {formatArea(params.plotAreaSqft)}
              </label>
              <input
                type="number"
                value={params.plotAreaSqft || ''}
                onChange={(e) => onParamChange('plotAreaSqft', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Площадь участка в sqft"
                inputMode="numeric"
              />
            </div>
          )}
        </div>

        {/* Загрузка фото */}
        <ImageUploader
          images={params.propertyImages}
          propertyId={propertyId}
          useCloudStorage={!!propertyId}
          onChange={(images) => onParamChange('propertyImages', images)}
        />

        {/* Тип сделки */}
        <div>
          <label className="text-xs sm:text-sm font-medium text-gray-700 mb-2 block">Тип сделки</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => onParamChange('dealType', 'secondary')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                params.dealType === 'secondary'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              🏢 Вторичка
            </button>
            <button
              type="button"
              onClick={() => onParamChange('dealType', 'offplan')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                params.dealType === 'offplan'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              🏗️ Off-Plan
            </button>
          </div>
          {params.dealType === 'offplan' && (
            <p className="text-xs text-gray-500 mt-2">
              💡 Офф-план: учитывается фактическая оплата и план платежей
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
