/**
 * Store для UI состояния
 */
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { CustomMetric } from '../types/calculator';

// Типы вкладок
export type TabId = 'overview' | 'formula' | 'sensitivity' | 'early' | 'saved';

// Информация о вкладках
export const TABS: { id: TabId; label: string; shortLabel: string }[] = [
  { id: 'overview', label: 'Водопад', shortLabel: 'Обзор' },
  { id: 'formula', label: 'Детальный расчет', shortLabel: 'Расчёт' },
  { id: 'sensitivity', label: 'Сенситивность', shortLabel: 'Анализ' },
  { id: 'early', label: 'Ранняя продажа', shortLabel: 'Продажа' },
  { id: 'saved', label: 'Сохраненные', shortLabel: 'Объекты' },
];

interface UIState {
  // Состояние
  activeTab: TabId;
  editingWeek: string | null;
  customMetrics: Record<number, CustomMetric>;
  isSidebarOpen: boolean;
  isExporting: boolean;

  // Действия
  setActiveTab: (tab: TabId) => void;
  setEditingWeek: (week: string | null) => void;
  setCustomMetric: (week: number, metric: CustomMetric) => void;
  clearCustomMetric: (week: number) => void;
  clearAllCustomMetrics: () => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setExporting: (exporting: boolean) => void;
}

export const useUIStore = create<UIState>()(
  devtools(
    (set) => ({
      // Начальное состояние
      activeTab: 'overview',
      editingWeek: null,
      customMetrics: {},
      isSidebarOpen: true,
      isExporting: false,

      // Установить активную вкладку
      setActiveTab: (tab) => set({ activeTab: tab }, false, 'setActiveTab'),

      // Установить редактируемую неделю
      setEditingWeek: (week) => set({ editingWeek: week }, false, 'setEditingWeek'),

      // Установить кастомную метрику
      setCustomMetric: (week, metric) =>
        set(
          (state) => ({
            customMetrics: { ...state.customMetrics, [week]: metric },
          }),
          false,
          'setCustomMetric'
        ),

      // Очистить кастомную метрику
      clearCustomMetric: (week) =>
        set(
          (state) => {
            const next = { ...state.customMetrics };
            delete next[week];
            return { customMetrics: next };
          },
          false,
          'clearCustomMetric'
        ),

      // Очистить все кастомные метрики
      clearAllCustomMetrics: () => 
        set({ customMetrics: {} }, false, 'clearAllCustomMetrics'),

      // Переключить сайдбар
      toggleSidebar: () =>
        set((state) => ({ isSidebarOpen: !state.isSidebarOpen }), false, 'toggleSidebar'),

      // Установить состояние сайдбара
      setSidebarOpen: (open) => set({ isSidebarOpen: open }, false, 'setSidebarOpen'),

      // Установить состояние экспорта
      setExporting: (exporting) => set({ isExporting: exporting }, false, 'setExporting'),
    }),
    { name: 'UIStore' }
  )
);

// Селекторы
export const selectActiveTab = (state: UIState) => state.activeTab;
export const selectEditingWeek = (state: UIState) => state.editingWeek;
export const selectCustomMetrics = (state: UIState) => state.customMetrics;
export const selectIsSidebarOpen = (state: UIState) => state.isSidebarOpen;
export const selectIsExporting = (state: UIState) => state.isExporting;
