/**
 * Store для сохранённых объектов недвижимости
 */
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { SavedProperty, CalculatorParams, Coordinates, Calculations } from '../types/calculator';

interface PropertiesState {
  // Состояние
  properties: SavedProperty[];
  isLoading: boolean;
  error: string | null;

  // Действия
  setProperties: (properties: SavedProperty[]) => void;
  addProperty: (
    params: CalculatorParams,
    calculations: Calculations,
    coordinates: Coordinates | null
  ) => SavedProperty;
  updateProperty: (id: string, updates: Partial<SavedProperty>) => void;
  deleteProperty: (id: string) => void;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string) => void;
}

export const usePropertiesStore = create<PropertiesState>()(
  devtools(
    persist(
      (set) => ({
        // Начальное состояние
        properties: [],
        isLoading: false,
        error: null,

        // Установить список объектов
        setProperties: (properties) => 
          set({ properties }, false, 'setProperties'),

        // Добавить новый объект
        addProperty: (params, calculations, coordinates) => {
          const newProperty: SavedProperty = {
            ...params,
            id: Date.now().toString(),
            coordinates,
            calculations,
            savedAt: new Date().toISOString(),
          };
          set(
            (state) => ({
              properties: [...state.properties, newProperty],
            }),
            false,
            'addProperty'
          );
          return newProperty;
        },

        // Обновить объект
        updateProperty: (id, updates) =>
          set(
            (state) => ({
              properties: state.properties.map((p) =>
                p.id === id ? { ...p, ...updates, savedAt: new Date().toISOString() } : p
              ),
            }),
            false,
            'updateProperty'
          ),

        // Удалить объект
        deleteProperty: (id) =>
          set(
            (state) => ({
              properties: state.properties.filter((p) => p.id !== id),
            }),
            false,
            'deleteProperty'
          ),

        // Очистить ошибку
        clearError: () => set({ error: null }, false, 'clearError'),
        
        // Установить состояние загрузки
        setLoading: (loading) => set({ isLoading: loading }, false, 'setLoading'),
        
        // Установить ошибку
        setError: (error) => set({ error }, false, 'setError'),
      }),
      {
        name: 'properties-storage',
        partialize: (state) => ({
          properties: state.properties,
        }),
      }
    ),
    { name: 'PropertiesStore' }
  )
);

// Селекторы
export const selectProperties = (state: PropertiesState) => state.properties;
export const selectPropertiesCount = (state: PropertiesState) => state.properties.length;
export const selectIsLoading = (state: PropertiesState) => state.isLoading;
export const selectError = (state: PropertiesState) => state.error;
export const selectPropertyById = (id: string) => (state: PropertiesState) =>
  state.properties.find((p) => p.id === id);
