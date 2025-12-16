/**
 * Компонент для отображения списка всех общих объектов
 */

import React, { useEffect, useState } from 'react';
import { MapPin, Home, Trash2, ExternalLink, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/utils/format';
import { getAllProperties, deleteProperty } from '@/services/propertiesApi';
import type { Property } from '@/types/database';
import type { Calculations } from '@/types/calculator';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/useMediaQuery';

const formatPercent = (value: number): string => {
  return `${value.toFixed(1)}%`;
};

interface PropertyCardProps {
  property: Property;
  onDelete: (id: string) => void;
  onOpen: (id: string) => void;
}

const PropertyCard: React.FC<PropertyCardProps> = ({ property, onDelete, onOpen }) => {
  
  // Парсим calculations из JSON
  const calculations = property.calculations as Calculations | null;
  
  if (!calculations) {
    return null;
  }

  const serialNumber = property.serial_number || null;
  const propertyName = property.name || 'Без названия';
  const location = property.location || '';
  const params = property.params as { propertyType?: string } | null;
  const propertyType = params?.propertyType || 'apartment';
  
  const propertyTypeLabels: Record<string, string> = {
    apartment: 'Апартаменты',
    villa: 'Вилла',
    townhouse: 'Таунхауз',
  };

  return (
    <Card className="hover:shadow-md transition-shadow w-fit max-w-[400px] justify-center items-center grid">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base sm:text-lg font-bold flex items-center gap-2 flex-wrap">
              {serialNumber && (
                <Badge variant="outline" className="font-mono text-xs">
                  {serialNumber}
                </Badge>
              )}
              <span className="truncate">{propertyName}</span>
            </CardTitle>
            <div className="flex items-center gap-3 sm:gap-4 mt-2 text-xs sm:text-sm text-muted-foreground flex-wrap">
              {location && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="truncate max-w-[200px]">{location.split(',')[0]}</span>
                </span>
              )}
              <span className="flex items-center gap-1">
                <Home className="w-3 h-3 sm:w-4 sm:h-4" />
                {propertyTypeLabels[propertyType] || propertyType}
              </span>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-2 text-sm">
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center py-1 border-b border-border/50">
            <span className="text-muted-foreground">Общие затраты:</span>
            <span className="font-semibold">{formatCurrency(calculations.costs.total)}</span>
          </div>
          <div className="flex justify-between items-center py-1 border-b border-border/50">
            <span className="text-muted-foreground">Чистая выручка:</span>
            <span className="font-semibold">{formatCurrency(calculations.revenue.net)}</span>
          </div>
          <div className="flex justify-between items-center py-1 border-b border-border/50">
            <span className="text-muted-foreground">Чистая прибыль:</span>
            <span className="font-semibold text-green-600 dark:text-green-400">
              {formatCurrency(calculations.profit.net)}
            </span>
          </div>
          <div className="flex justify-between items-center py-1 border-b border-border/50">
            <span className="text-muted-foreground">ROI:</span>
            <span className="font-semibold">{formatPercent(calculations.profit.roi)}</span>
          </div>
          <div className="flex justify-between items-center py-1 border-b border-border/50">
            <span className="text-muted-foreground">IRR:</span>
            <span className="font-semibold">{formatPercent(calculations.profit.irr)}</span>
          </div>
          <div className="flex justify-between items-center py-1">
            <span className="text-muted-foreground">Сроки сделки:</span>
            <span className="font-semibold">{calculations.totalMonths} мес.</span>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex gap-2 pt-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onOpen(property.id)}
          className="flex-1"
        >
          <ExternalLink className="w-4 h-4 mr-2" />
          Открыть
        </Button>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => onDelete(property.id)}
          className="flex-1"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Удалить
        </Button>
      </CardFooter>
    </Card>
  );
};

interface SharedPropertiesListProps {
  onOpen?: (id: string) => void;
}

export const SharedPropertiesList: React.FC<SharedPropertiesListProps> = ({ onOpen }) => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getAllProperties();
      setProperties(data);
    } catch (err) {
      console.error('Error loading properties:', err instanceof Error ? err.message : String(err));
      setError(err instanceof Error ? err.message : 'Ошибка загрузки объектов');
      toast.error('Ошибка загрузки объектов', {
        description: err instanceof Error ? err.message : 'Неизвестная ошибка',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Вы уверены, что хотите удалить этот объект?')) {
      return;
    }

    try {
      await deleteProperty(id);
      setProperties(properties.filter(p => p.id !== id));
      toast.success('Объект удалён');
    } catch (err) {
      console.error('Error deleting property:', err instanceof Error ? err.message : String(err));
      toast.error('Ошибка удаления', {
        description: err instanceof Error ? err.message : 'Неизвестная ошибка',
      });
    }
  };

  const handleOpen = (id: string) => {
    if (onOpen) {
      onOpen(id);
    } else {
      toast.info('Функция открытия объекта не настроена');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive mb-4">{error}</p>
        <Button onClick={loadProperties} variant="outline">
          Попробовать снова
        </Button>
      </div>
    );
  }

  if (properties.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Нет сохранённых объектов</p>
      </div>
    );
  }

  return (
    <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
      {properties.map((property) => (
        <PropertyCard
          key={property.id}
          property={property}
          onDelete={handleDelete}
          onOpen={handleOpen}
        />
      ))}
    </div>
  );
};

