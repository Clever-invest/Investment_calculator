/**
 * Экспорт всех stores
 */
export { 
  useCalculatorStore, 
  selectParams, 
  selectCoordinates, 
  selectDealType,
  selectPropertyName,
  selectLocation
} from './calculatorStore';

export { 
  usePropertiesStore, 
  selectProperties, 
  selectPropertiesCount,
  selectIsLoading,
  selectError,
  selectPropertyById
} from './propertiesStore';

export { 
  useUIStore, 
  selectActiveTab, 
  selectEditingWeek, 
  selectCustomMetrics,
  selectIsSidebarOpen,
  selectIsExporting,
  TABS,
  type TabId
} from './uiStore';
