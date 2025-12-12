/**
 * Калькулятор флиппинга недвижимости - v2 (рефакторинг)
 */

import React, { useEffect, useState } from 'react';
import { MapPin, Home } from 'lucide-react';
import { toast } from 'sonner';
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
// Хуки расчётов
import {
  useCalculations,
  useEarlyDiscountData
} from './hooks/useCalculations';
// Сервисы
import { loadAllProperties } from './services/storage';
// Stores
import {
  useCalculatorStore,
  usePropertiesStore,
  useUIStore,
  useAuthStore,
  TABS
} from './stores';
// Типы
import type { CalculatorParams } from './types/calculator';
import { haptic } from './utils/haptic';

const FlipCalculator: React.FC = () => {
  // Mobile detection
  const isMobile = useIsMobile();

  // Auth Modal state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [showMigrationPrompt, setShowMigrationPrompt] = useState(false);

  // Scroll state для compact MetricsGrid
  const [isScrolled, setIsScrolled] = useState(false);

  // Temporary property ID for new properties (used for image uploads)
  const [tempPropertyId, setTempPropertyId] = useState<string>(() => crypto.randomUUID());

  // Auth Store
  const user = useAuthStore((state) => state.user);

  // Calculator Store
  const params = useCalculatorStore((state) => state.params);
  const coordinates = useCalculatorStore((state) => state.coordinates);
  const updateParam = useCalculatorStore((state) => state.updateParam);
  const setCoordinates = useCalculatorStore((state) => state.setCoordinates);
  const resetParams = useCalculatorStore((state) => state.resetParams);

  // Properties Store
  const properties = usePropertiesStore((state) => state.properties);
  const addProperty = usePropertiesStore((state) => state.addProperty);
  const addPropertyAsync = usePropertiesStore((state) => state.addPropertyAsync);
  const syncWithCloud = usePropertiesStore((state) => state.syncWithCloud);
  const migrateLocalToCloud = usePropertiesStore((state) => state.migrateLocalToCloud);
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
      // Проверяем, есть ли локальные данные для миграции
      if (properties.length > 0) {
        setShowMigrationPrompt(true);
      } else {
        // Просто синхронизируем с облаком
        syncWithCloud();
      }
    }
  }, [user, isSynced, properties.length, syncWithCloud]);

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

  // Обработчик миграции локальных данных в облако
  const handleMigrateToCloud = async () => {
    await migrateLocalToCloud();
    setShowMigrationPrompt(false);
  };

  const handleSkipMigration = () => {
    syncWithCloud();
    setShowMigrationPrompt(false);
  };

  // Обработчик изменения параметров
  const handleParamChange = (key: keyof CalculatorParams, value: unknown) => {
    if (['propertyName', 'location', 'propertyType', 'dealType', 'renovationComments', 'propertyImages', 'paymentSchedule'].includes(key)) {
      updateParam(key, value as CalculatorParams[typeof key]);
      return;
    }
    const num = value === '' ? 0 : parseFloat(String(value));
    updateParam(key, (isNaN(num) ? 0 : num) as CalculatorParams[typeof key]);
  };

  // Сохранение объекта
  const handleSaveProperty = async () => {
    if (!params.propertyName.trim()) {
      haptic.warning();
      toast.warning('Укажите название объекта', {
        description: 'Название необходимо для сохранения',
      });
      return;
    }
    try {
      await addPropertyAsync(params, calculations, coordinates, tempPropertyId);

      // Генерируем новый ID для следующего объекта
      setTempPropertyId(crypto.randomUUID());

      // Сбрасываем форму к дефолтным значениям ПОСЛЕ успешного сохранения
      resetParams();

      haptic.success();
      toast.success('Объект сохранён!', {
        description: 'Форма очищена для нового объекта',
      });
    } catch (error: unknown) {
      console.error('Save error:', error);
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
              />
            </div>

            {/* Правая область - результаты */}
            <div className="md:col-span-2 space-y-4 sm:space-y-6">
              {/* Заголовок объекта */}
              {(params.propertyName || params.location) && (
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 rounded-xl p-3 sm:p-4 border border-indigo-200 dark:border-indigo-800">
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
                  <div className="p-3 sm:p-6">
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
                  </div>
                </div>
              </Tabs>
            </div>
          </div>
        </div>
      </div>

      {/* Диалог миграции данных */}
      {showMigrationPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div className="relative bg-card rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6">
            <h3 className="text-xl font-bold text-foreground mb-3">
              Синхронизация данных
            </h3>
            <p className="text-muted-foreground mb-4">
              У вас есть {properties.length} сохранённых объектов локально.
              Хотите загрузить их в облако для синхронизации между устройствами?
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleSkipMigration}
                className="flex-1 px-4 py-2 border border-border text-foreground rounded-lg hover:bg-muted transition-colors"
              >
                Пропустить
              </button>
              <button
                onClick={handleMigrateToCloud}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Загрузить в облако
              </button>
            </div>
          </div>
        </div>
      )}

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
