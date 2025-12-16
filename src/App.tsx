/**
 * Калькулятор флиппинга недвижимости - v2 (рефакторинг)
 */

import React, { useEffect, useState } from 'react';
import { MapPin, Home } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Toaster } from '@/components/ui/sonner';
import { BottomNav } from '@/components/layout/BottomNav';
import { useIsMobile } from '@/hooks/useMediaQuery';
// Компоненты авторизации
import { AuthModal, UserMenu } from './components/auth';

// Компоненты форм
import { PropertyInfoForm, DealParamsForm } from './components/forms';
// Компоненты результатов
import {
  MetricsGrid,
  DetailedBreakdown,
  EarlySaleTable,
  OffPlanInfo
} from './components/results';
import { SharedPropertiesList } from './components/results/SharedPropertiesList';
// Хуки расчётов
import {
  useCalculations,
  useEarlyDiscountData
} from './hooks/useCalculations';
// Сервисы
import { loadAllProperties } from './services/storage';
import { getProperty, updateProperty as updatePropertyApi } from './services/propertiesApi';
// Stores
import {
  useCalculatorStore,
  usePropertiesStore,
  useUIStore,
  useAuthStore,
  TABS
} from './stores';
// Типы
import type { CalculatorParams, Coordinates } from './types/calculator';
import { haptic } from './utils/haptic';

const FlipCalculator: React.FC = () => {
  // Mobile detection
  const isMobile = useIsMobile();

  // Auth Modal state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Scroll state для compact MetricsGrid
  const [isScrolled, setIsScrolled] = useState(false);

  // Temporary property ID for new properties (used for image uploads)
  const [tempPropertyId, setTempPropertyId] = useState<string>(() => crypto.randomUUID());
  
  // ID редактируемого объекта (null если создаём новый)
  const [editingPropertyId, setEditingPropertyId] = useState<string | null>(null);

  // Auth Store
  const user = useAuthStore((state) => state.user);

  // Calculator Store
  const params = useCalculatorStore((state) => state.params);
  const coordinates = useCalculatorStore((state) => state.coordinates);
  const updateParam = useCalculatorStore((state) => state.updateParam);
  const setCoordinates = useCalculatorStore((state) => state.setCoordinates);
  const resetParams = useCalculatorStore((state) => state.resetParams);
  const loadFromSaved = useCalculatorStore((state) => state.loadFromSaved);

  // Properties Store
  const properties = usePropertiesStore((state) => state.properties);
  const addProperty = usePropertiesStore((state) => state.addProperty);
  const addPropertyAsync = usePropertiesStore((state) => state.addPropertyAsync);
  const updateProperty = usePropertiesStore((state) => state.updateProperty);
  const syncWithCloud = usePropertiesStore((state) => state.syncWithCloud);
  const isSynced = usePropertiesStore((state) => state.isSynced);

  // UI Store
  const activeTab = useUIStore((state) => state.activeTab);
  const setActiveTab = useUIStore((state) => state.setActiveTab);
  const editingWeek = useUIStore((state) => state.editingWeek);
  const setEditingWeek = useUIStore((state) => state.setEditingWeek);
  const customMetrics = useUIStore((state) => state.customMetrics);
  const setCustomMetric = useUIStore((state) => state.setCustomMetric);
  const clearCustomMetric = useUIStore((state) => state.clearCustomMetric);

  // Расчёты через хуки
  const calculations = useCalculations(params);
  const earlyDiscountData = useEarlyDiscountData(params, calculations, customMetrics);

  // Инициализация авторизации происходит в Router.tsx через AuthInitializer

  // Отслеживание скролла для compact MetricsGrid
  useEffect(() => {
    if (!isMobile) return;

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isMobile]);

  // Синхронизация с облаком при авторизации
  // ProtectedRoute гарантирует что user авторизован когда мы здесь
  useEffect(() => {
    if (user && !isSynced) {
      // Синхронизируем с облаком
      syncWithCloud();
    }
  }, [user, isSynced, syncWithCloud]);

  // Сброс режима редактирования при переключении вкладок (кроме formula)
  useEffect(() => {
    if (activeTab !== 'formula' && editingPropertyId) {
      setEditingPropertyId(null);
      setTempPropertyId(crypto.randomUUID());
    }
  }, [activeTab, editingPropertyId]);

  // Миграция из старого localStorage (если есть)
  useEffect(() => {
    const migrateOldData = async () => {
      // Проверяем, есть ли данные в старом формате
      const oldProperties = await loadAllProperties();
      if (oldProperties.length > 0 && properties.length === 0) {
        // Мигрируем в новый store
        oldProperties.forEach(prop => {
          addProperty(prop, prop.calculations, prop.coordinates);
        });
      }
    };
    migrateOldData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps


  // Обработчик изменения параметров
  const handleParamChange = (key: keyof CalculatorParams, value: unknown) => {
    if (['propertyName', 'location', 'propertyType', 'dealType', 'renovationComments', 'propertyImages', 'paymentSchedule'].includes(key)) {
      updateParam(key, value as CalculatorParams[typeof key]);
      return;
    }
    const num = value === '' ? 0 : parseFloat(String(value));
    updateParam(key, (isNaN(num) ? 0 : num) as CalculatorParams[typeof key]);
  };

  // Загрузка объекта в форму для редактирования
  const handleLoadProperty = async (propertyId: string) => {
    try {
      const property = await getProperty(propertyId);
      if (!property) {
        toast.error('Объект не найден');
        return;
      }

      // Парсим данные из БД
      const propertyParams = property.params as unknown as CalculatorParams;
      const propertyCoordinates = property.coordinates as unknown as Coordinates | null;

      // Загружаем изображения из БД (если есть)
      if (property.images && property.images.length > 0) {
        // Проверяем, что images содержат пути, а не URLs
        const invalidImages = property.images.filter(img => 
          img.startsWith('http://') || img.startsWith('https://')
        );
        
        if (invalidImages.length > 0) {
          console.warn('[App] Found URLs in property.images instead of paths:', {
            invalidCount: invalidImages.length
          });
        }

        // Убеждаемся, что сохраняем только пути (не URLs, не base64)
        const imagePaths = property.images.filter(img => {
          // Пропускаем base64 и URLs - это должны быть только пути
          const isPath = !img.startsWith('data:') && !img.startsWith('http');
          if (!isPath) {
            console.warn('[App] Filtering out non-path image:', img);
          }
          return isPath;
        });

        propertyParams.propertyImages = imagePaths;
        
        // Debug: Loaded property images
        if (imagePaths.length > 0) {
          console.warn('[App] Loaded property images:', {
            imageCount: imagePaths.length,
            allArePaths: imagePaths.every(img => !img.startsWith('http') && !img.startsWith('data:'))
          });
        }
      } else {
        // Если images нет, используем propertyImages из params (для обратной совместимости)
        // Debug: Using legacy propertyImages
        if (propertyParams.propertyImages && propertyParams.propertyImages.length > 0) {
          console.warn('[App] Using propertyImages from params (legacy):', {
            count: propertyParams.propertyImages.length
          });
        }
      }

      // Загружаем данные в форму
      loadFromSaved(propertyParams, propertyCoordinates);
      
      // Устанавливаем ID редактируемого объекта
      setEditingPropertyId(propertyId);
      setTempPropertyId(propertyId);

      // Переключаемся на вкладку с формой
      setActiveTab('formula');

      haptic.success();
      toast.success('Объект загружен в форму', {
        description: 'Вы можете редактировать данные и сохранить изменения',
      });
    } catch (error: unknown) {
      console.error('[App] Load property error:', {
        error: error instanceof Error ? error.message : String(error)
      });
      const message = error instanceof Error ? error.message : 'Неизвестная ошибка';
      haptic.error();
      toast.error('Ошибка загрузки объекта', {
        description: message,
      });
    }
  };

  // Сохранение объекта (создание нового или обновление существующего)
  const handleSaveProperty = async () => {
    if (!params.propertyName.trim()) {
      haptic.warning();
      toast.warning('Укажите название объекта', {
        description: 'Название необходимо для сохранения',
      });
      return;
    }
    try {
      if (editingPropertyId) {
        // Обновляем существующий объект напрямую через API
        try {
          // Фильтруем изображения: в БД сохраняем только пути Storage, не base64
          const cloudImages = (params.propertyImages || []).filter(
            (img) => !img.startsWith('data:') // исключаем base64
          );
          
          const updateData = {
            name: params.propertyName || 'Без названия',
            location: params.location || '',
            deal_type: params.dealType as 'secondary' | 'offplan',
            params: JSON.parse(JSON.stringify(params)),
            calculations: JSON.parse(JSON.stringify(calculations)),
            coordinates: coordinates ? JSON.parse(JSON.stringify(coordinates)) : null,
            images: cloudImages.length > 0 ? cloudImages : null,
          };
          
          // Обновляем в БД
          await updatePropertyApi(editingPropertyId, updateData);
          
          // Также обновляем локальный store, если объект там есть
          const localProperty = properties.find(p => p.id === editingPropertyId);
          if (localProperty) {
            updateProperty(editingPropertyId, {
              ...params,
              calculations,
              coordinates,
              savedAt: new Date().toISOString(),
            });
          }
          
          haptic.success();
          toast.success('Объект обновлён!', {
            description: 'Изменения сохранены',
          });
          
          // Сбрасываем режим редактирования
          setEditingPropertyId(null);
          setTempPropertyId(crypto.randomUUID());
          resetParams();
        } catch (updateError) {
          console.error('Update error:', updateError instanceof Error ? updateError.message : String(updateError));
          const message = updateError instanceof Error ? updateError.message : 'Неизвестная ошибка';
          haptic.error();
          toast.error('Ошибка обновления объекта', {
            description: message,
          });
        }
      } else {
        // Создаём новый объект
        await addPropertyAsync(params, calculations, coordinates, tempPropertyId);

        // Генерируем новый ID для следующего объекта
        setTempPropertyId(crypto.randomUUID());

        // Сбрасываем форму к дефолтным значениям ПОСЛЕ успешного сохранения
        resetParams();

        haptic.success();
        toast.success('Объект сохранён!', {
          description: 'Форма очищена для нового объекта',
        });
      }
    } catch (error: unknown) {
      console.error('Save error:', error instanceof Error ? error.message : String(error));
      const message = error instanceof Error ? error.message : 'Неизвестная ошибка';
      haptic.error();
      toast.error('Ошибка сохранения', {
        description: message,
      });
    }
  };

  // Редактирование метрик ранней продажи
  const handleMetricEdit = (week: number, type: 'roi' | 'irr', value: string) => {
    setCustomMetric(week, { type, value });
  };


  return (
    <div className="min-h-screen bg-background p-3 sm:p-4 pb-24 md:pb-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-card rounded-2xl shadow-xl overflow-hidden">
          {/* Заголовок */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 sm:p-6 text-white">
            <div className="flex items-center justify-between gap-2 sm:gap-3 mb-2">
              {/* Заголовок */}
              <div className="flex-1">
                <h1 className="text-lg sm:text-2xl md:text-3xl font-bold leading-tight">
                  {isMobile ? 'Флип-калькулятор' : 'Калькулятор флиппинга недвижимости'}
                </h1>
              </div>

              {/* Меню пользователя */}
              <UserMenu onOpenAuth={() => setIsAuthModalOpen(true)} />
            </div>
            <p className="text-blue-100 text-xs sm:text-sm md:text-base hidden sm:block">
              Интерактивный анализ сделки с мгновенным расчетом маржи и распределения долей
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 p-3 sm:p-6">
            {/* Левая колонка - формы ввода */}
            <div className="md:col-span-1 space-y-4">
              <PropertyInfoForm
                params={params}
                coordinates={coordinates}
                propertyId={user ? tempPropertyId : undefined}
                onParamChange={handleParamChange}
                onCoordinatesChange={setCoordinates}
              />
              <DealParamsForm
                params={params}
                onParamChange={handleParamChange}
                onSave={handleSaveProperty}
                isEditing={editingPropertyId !== null}
              />
            </div>

            {/* Правая область - результаты */}
            <div className="md:col-span-2 space-y-4 sm:space-y-6">
              {/* Заголовок объекта */}
              {(params.propertyName || params.location || editingPropertyId) && (
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 rounded-xl p-3 sm:p-4 border border-indigo-200 dark:border-indigo-800">
                  {editingPropertyId && (
                    <div className="mb-2">
                      <Badge variant="secondary" className="text-xs">
                        Режим редактирования
                      </Badge>
                    </div>
                  )}
                  <h3 className="text-base sm:text-lg font-bold text-gray-800 dark:text-gray-200">
                    {params.propertyName || 'Без названия'}
                  </h3>
                  <div className="flex items-center gap-3 sm:gap-4 mt-1 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    {params.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {params.location.split(',')[0]}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Home className="w-4 h-4" />
                      {params.propertyType}
                    </span>
                  </div>
                </div>
              )}

              {/* Метрики - sticky на мобильных с compact режимом при скролле */}
              <div className="sticky top-0 z-20 -mx-3 sm:-mx-6 px-3 sm:px-6 py-2 bg-background/95 backdrop-blur-sm border-b border-transparent data-[scrolled=true]:border-border md:static md:mx-0 md:px-0 md:py-0 md:bg-transparent md:border-0" data-scrolled={isScrolled && isMobile}>
                <MetricsGrid
                  calculations={calculations}
                  compact={isScrolled && isMobile}
                />
              </div>

              {/* Off-plan информация */}
              <OffPlanInfo params={params} calculations={calculations} />

              {/* Вкладки - shadcn Tabs */}
              <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as typeof activeTab)} className="w-full">
                {/* Desktop Tabs - скрыты на мобильных */}
                <div className="hidden md:block relative bg-card rounded-xl border border-border">
                  <TabsList className="w-full justify-start bg-transparent border-b rounded-none h-auto p-0">
                    {TABS.map(tab => (
                      <TabsTrigger
                        key={tab.id}
                        value={tab.id}
                        className="px-4 sm:px-6 py-3 text-sm sm:text-base font-medium rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none bg-transparent"
                      >
                        {tab.label}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  {/* Fade gradient для индикации скролла */}
                  <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white pointer-events-none" />
                </div>

                {/* Mobile показывает только контент, навигация внизу */}
                <div className="bg-card rounded-xl border border-border md:border-0 md:rounded-none">
                  <div className="px-[1px] py-3 sm:py-6">
                    <TabsContent value="formula" className="mt-0">
                      <DetailedBreakdown params={params} calculations={calculations} />
                    </TabsContent>
                    <TabsContent value="early" className="mt-0">
                      <EarlySaleTable
                        params={params}
                        data={earlyDiscountData}
                        customMetrics={customMetrics}
                        editingWeek={editingWeek}
                        onEditWeek={setEditingWeek}
                        onMetricEdit={handleMetricEdit}
                        onClearMetric={clearCustomMetric}
                      />
                    </TabsContent>
                    <TabsContent value="shared" className="mt-0">
                      <SharedPropertiesList onOpen={handleLoadProperty} />
                    </TabsContent>
                  </div>
                </div>
              </Tabs>
            </div>
          </div>
        </div>
      </div>

      {/* Модальное окно авторизации */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      {/* Mobile Bottom Navigation */}
      {isMobile && (
        <BottomNav
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      )}

      {/* Toast notifications */}
      <Toaster position="top-center" richColors closeButton />
    </div>
  );
};

export default FlipCalculator;
