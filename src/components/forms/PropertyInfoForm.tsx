/**
 * Форма информации об объекте недвижимости
 * Мигрирован на shadcn/ui (Этап 2)
 */

import React from 'react';
import { LocationSearch } from './LocationSearch';
import { ImageUploader } from './ImageUploader';
import { formatArea } from '../../utils/format';
import type { CalculatorParams, Coordinates, PropertyType } from '../../types/calculator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Building2, Home, Warehouse, Bed, Bath, Minus, Plus } from 'lucide-react';

interface PropertyInfoFormProps {
  params: CalculatorParams;
  coordinates: Coordinates | null;
  propertyId?: string; // ID объекта для cloud storage (при редактировании)
  onParamChange: (key: keyof CalculatorParams, value: CalculatorParams[keyof CalculatorParams]) => void;
  onCoordinatesChange: (coords: Coordinates | null) => void;
}

const PROPERTY_TYPES: { value: PropertyType; label: string; icon: React.ReactNode }[] = [
  { value: 'apartment', label: 'Апартаменты', icon: <Building2 className="h-4 w-4" /> },
  { value: 'villa', label: 'Вилла', icon: <Home className="h-4 w-4" /> },
  { value: 'townhouse', label: 'Таунхауз', icon: <Warehouse className="h-4 w-4" /> }
];

export const PropertyInfoForm: React.FC<PropertyInfoFormProps> = ({
  params,
  coordinates,
  propertyId,
  onParamChange,
  onCoordinatesChange
}) => {
  return (
    <Card className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border-0 shadow-sm">
      <CardHeader className="pb-2 px-3 sm:px-6">
        <CardTitle className="text-lg font-bold">Информация об объекте</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 px-3 sm:px-6">
        {/* Название объекта */}
        <div className="space-y-2">
          <Label htmlFor="propertyName">Название объекта</Label>
          <Input
            id="propertyName"
            type="text"
            value={params.propertyName}
            onChange={(e) => onParamChange('propertyName', e.target.value)}
            placeholder="Marina Bay Tower 3, Apt 2501"
            enterKeyHint="next"
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
        <div className="space-y-2">
          <Label>Тип объекта</Label>
          <div className="grid grid-cols-3 gap-2">
            {PROPERTY_TYPES.map(type => (
              <Button
                key={type.value}
                type="button"
                variant={params.propertyType === type.value ? "default" : "outline"}
                onClick={() => onParamChange('propertyType', type.value)}
                className={cn(
                  "h-auto py-2 px-3 flex flex-col gap-1 items-center",
                  params.propertyType === type.value && "shadow-md"
                )}
              >
                {type.icon}
                <span className="text-xs">{type.label}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Спальни и ванные */}
        <div className="grid grid-cols-2 gap-3">
          {/* Спальни */}
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5">
              <Bed className="h-4 w-4" />
              <span>Спальни</span>
            </Label>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-9 w-9"
                onClick={() => onParamChange('bedrooms', Math.max(0, (params.bedrooms ?? 1) - 1))}
                disabled={(params.bedrooms ?? 1) <= 0}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <div className="flex-1 text-center font-bold text-lg">
                {(params.bedrooms ?? 1) === 0 ? 'Studio' : (params.bedrooms ?? 1)}
              </div>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-9 w-9"
                onClick={() => onParamChange('bedrooms', (params.bedrooms ?? 1) + 1)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Ванные */}
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5">
              <Bath className="h-4 w-4" />
              <span>Ванные</span>
            </Label>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-9 w-9"
                onClick={() => onParamChange('bathrooms', Math.max(1, (params.bathrooms ?? 1) - 1))}
                disabled={(params.bathrooms ?? 1) <= 1}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <div className="flex-1 text-center font-bold text-lg">
                {params.bathrooms ?? 1}
              </div>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-9 w-9"
                onClick={() => onParamChange('bathrooms', (params.bathrooms ?? 1) + 1)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Площадь */}
        <div className="space-y-3">
          <div className="space-y-2">
            <Label className="flex justify-between">
              <span>Площадь помещения</span>
              <span className="text-muted-foreground">{formatArea(params.unitAreaSqft)}</span>
            </Label>
            <Input
              type="text"
              inputMode="decimal"
              enterKeyHint="next"
              value={params.unitAreaSqft || ''}
              onChange={(e) => {
                const value = e.target.value.replace(/[^\d]/g, '');
                onParamChange('unitAreaSqft', value === '' ? 0 : parseInt(value));
              }}
              placeholder="Площадь в sqft"
            />
          </div>

          {(params.propertyType === 'villa' || params.propertyType === 'townhouse') && (
            <div className="space-y-2">
              <Label className="flex justify-between">
                <span>Площадь участка</span>
                <span className="text-muted-foreground">{formatArea(params.plotAreaSqft)}</span>
              </Label>
              <Input
                type="text"
                inputMode="decimal"
                enterKeyHint="next"
                value={params.plotAreaSqft || ''}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^\d]/g, '');
                  onParamChange('plotAreaSqft', value === '' ? 0 : parseInt(value));
                }}
                placeholder="Площадь участка в sqft"
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
        <div className="space-y-2">
          <Label>Тип сделки</Label>
          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant={params.dealType === 'secondary' ? "default" : "outline"}
              onClick={() => onParamChange('dealType', 'secondary')}
              className={cn(
                "h-auto py-3",
                params.dealType === 'secondary' && "shadow-md"
              )}
            >
              🏢 Вторичка
            </Button>
            <Button
              type="button"
              variant={params.dealType === 'offplan' ? "default" : "outline"}
              onClick={() => onParamChange('dealType', 'offplan')}
              className={cn(
                "h-auto py-3",
                params.dealType === 'offplan' && "bg-purple-600 hover:bg-purple-700 shadow-md"
              )}
            >
              🏗️ Off-Plan
            </Button>
          </div>
          {params.dealType === 'offplan' && (
            <p className="text-xs text-muted-foreground mt-2">
              💡 Офф-план: учитывается фактическая оплата и план платежей
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
