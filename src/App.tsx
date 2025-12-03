/**
 * Калькулятор флиппинга недвижимости - v2 (рефакторинг)
 */

import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Download, MapPin, Home } from 'lucide-react';

// Компоненты форм
import { PropertyInfoForm, DealParamsForm } from './components/forms';
// Компоненты результатов
import { 
  MetricsGrid, 
  WaterfallChart, 
  DetailedBreakdown, 
  SensitivityChart, 
  EarlySaleTable,
  OffPlanInfo 
} from './components/results';
// Компоненты проектов
import { SavedPropertiesList } from './components/projects';
import { exportDealSheetHTML } from './components/projects/DealSheetExport';
// Хуки расчётов
import { 
  useCalculations, 
  useWaterfallData, 
  useSensitivityData, 
  useEarlyDiscountData 
} from './hooks/useCalculations';
// Сервисы
import { loadAllProperties } from './services/storage';
// Stores
import { 
  useCalculatorStore, 
  usePropertiesStore, 
  useUIStore, 
  TABS 
} from './stores';
// Типы
import type { CalculatorParams, SavedProperty } from './types/calculator';
import { formatCurrency } from './utils/format';

const FlipCalculator: React.FC = () => {
  // Calculator Store
  const params = useCalculatorStore((state) => state.params);
  const coordinates = useCalculatorStore((state) => state.coordinates);
  const updateParam = useCalculatorStore((state) => state.updateParam);
  const setCoordinates = useCalculatorStore((state) => state.setCoordinates);
  const loadFromSaved = useCalculatorStore((state) => state.loadFromSaved);

  // Properties Store
  const properties = usePropertiesStore((state) => state.properties);
  const addProperty = usePropertiesStore((state) => state.addProperty);
  const removeProperty = usePropertiesStore((state) => state.deleteProperty);

  // UI Store
  const activeTab = useUIStore((state) => state.activeTab);
  const setActiveTab = useUIStore((state) => state.setActiveTab);
  const editingWeek = useUIStore((state) => state.editingWeek);
  const setEditingWeek = useUIStore((state) => state.setEditingWeek);
  const customMetrics = useUIStore((state) => state.customMetrics);
  const setCustomMetric = useUIStore((state) => state.setCustomMetric);
  const clearCustomMetric = useUIStore((state) => state.clearCustomMetric);
  const clearAllCustomMetrics = useUIStore((state) => state.clearAllCustomMetrics);

  // Расчёты через хуки
  const calculations = useCalculations(params);
  const waterfallData = useWaterfallData(params, calculations);
  const sensitivityData = useSensitivityData(params, calculations);
  const earlyDiscountData = useEarlyDiscountData(params, calculations, customMetrics);

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

  // Сохранение объекта
  const handleSaveProperty = () => {
    if (!params.propertyName.trim()) {
      alert('Пожалуйста, укажите название объекта');
      return;
    }
    try {
      addProperty(params, calculations, coordinates);
      alert('✅ Объект успешно сохранен!');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Неизвестная ошибка';
      alert('❌ Ошибка сохранения: ' + message);
    }
  };

  // Загрузка объекта
  const handleLoadProperty = (property: SavedProperty) => {
    loadFromSaved(
      {
        propertyName: property.propertyName,
        location: property.location,
        propertyType: property.propertyType ?? 'apartment',
        dealType: property.dealType ?? 'secondary',
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
      },
      property.coordinates
    );
    clearAllCustomMetrics();
  };

  // Удаление объекта
  const handleDeleteProperty = (id: string) => {
    if (!confirm('Удалить этот объект?')) return;
    removeProperty(id);
  };

  // Редактирование метрик ранней продажи
  const handleMetricEdit = (week: number, type: 'roi' | 'irr', value: string) => {
    setCustomMetric(week, { type, value });
  };

  // Экспорт листа сделки
  const handleExportDealSheet = () => {
    exportDealSheetHTML(params, calculations, coordinates, formatCurrency);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-3 sm:p-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Заголовок */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 sm:p-6 text-white">
            <div className="flex items-center gap-3 mb-2">
              <Link
                to="/"
                className="flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-sm"
              >
                <ArrowLeft size={18} />
                <span className="hidden sm:inline">Назад</span>
              </Link>
              <div className="flex-1">
                <h1 className="text-2xl sm:text-3xl font-bold">Калькулятор флиппинга недвижимости</h1>
              </div>
              <button
                onClick={handleExportDealSheet}
                className="flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-sm"
              >
                <Download size={18} />
                <span className="hidden sm:inline">Экспорт PDF</span>
              </button>
            </div>
            <p className="text-blue-100 text-sm sm:text-base">
              Интерактивный анализ сделки с мгновенным расчетом маржи и распределения долей
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 p-3 sm:p-6">
            {/* Левая колонка - формы ввода */}
            <div className="md:col-span-1 space-y-4">
              <PropertyInfoForm
                params={params}
                coordinates={coordinates}
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
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-3 sm:p-4 border border-indigo-200">
                  <h3 className="text-base sm:text-lg font-bold text-gray-800">
                    {params.propertyName || 'Без названия'}
                  </h3>
                  <div className="flex items-center gap-3 sm:gap-4 mt-1 text-xs sm:text-sm text-gray-600">
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

              {/* Метрики */}
              <MetricsGrid calculations={calculations} />

              {/* Off-plan информация */}
              <OffPlanInfo params={params} calculations={calculations} />

              {/* Вкладки */}
              <div className="bg-white rounded-xl border border-gray-200">
                <div className="flex border-b border-gray-200 overflow-x-auto sticky top-0 z-10 bg-white">
                  {TABS.map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`px-4 sm:px-6 py-3 text-sm sm:text-base font-medium transition-colors whitespace-nowrap ${
                        activeTab === tab.id
                          ? 'border-b-2 border-blue-600 text-blue-600'
                          : 'text-gray-600 hover:text-gray-800'
                      }`}
                    >
                      {tab.id === 'saved' ? `${tab.label} (${properties.length})` : tab.label}
                    </button>
                  ))}
                </div>

                <div className="p-3 sm:p-6">
                  {activeTab === 'overview' && (
                    <WaterfallChart data={waterfallData} calculations={calculations} />
                  )}
                  {activeTab === 'formula' && (
                    <DetailedBreakdown params={params} calculations={calculations} />
                  )}
                  {activeTab === 'sensitivity' && (
                    <SensitivityChart data={sensitivityData} />
                  )}
                  {activeTab === 'early' && (
                    <EarlySaleTable
                      params={params}
                      data={earlyDiscountData}
                      customMetrics={customMetrics}
                      editingWeek={editingWeek}
                      onEditWeek={setEditingWeek}
                      onMetricEdit={handleMetricEdit}
                      onClearMetric={clearCustomMetric}
                    />
                  )}
                  {activeTab === 'saved' && (
                    <SavedPropertiesList
                      properties={properties}
                      onLoad={handleLoadProperty}
                      onDelete={handleDeleteProperty}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlipCalculator;
