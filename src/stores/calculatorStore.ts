/**
 * Store для параметров калькулятора
 */
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { CalculatorParams, Coordinates } from '../types/calculator';
import { DEFAULT_PARAMS } from '../types/calculator';

interface CalculatorState {
  // Состояние
  params: CalculatorParams;
  coordinates: Coordinates | null;
  
  // Действия
  setParams: (params: CalculatorParams) => void;
  updateParam: <K extends keyof CalculatorParams>(key: K, value: CalculatorParams[K]) => void;
  resetParams: () => void;
  setCoordinates: (coords: Coordinates | null) => void;
  loadFromSaved: (params: CalculatorParams, coords: Coordinates | null) => void;
}

export const useCalculatorStore = create<CalculatorState>()(
  devtools(
    persist(
      (set) => ({
        // Начальное состояние
        params: DEFAULT_PARAMS,
        coordinates: null,

        // Установить все параметры
        setParams: (params) => set({ params }, false, 'setParams'),

        // Обновить один параметр
        updateParam: (key, value) =>
          set(
            (state) => ({
              params: { ...state.params, [key]: value },
            }),
            false,
            `updateParam/${String(key)}`
          ),

        // Сброс к дефолтным
        resetParams: () =>
          set({ params: DEFAULT_PARAMS, coordinates: null }, false, 'resetParams'),

        // Установить координаты
        setCoordinates: (coords) => set({ coordinates: coords }, false, 'setCoordinates'),

        // Загрузить из сохранённого объекта
        loadFromSaved: (params, coords) =>
          set({ params, coordinates: coords }, false, 'loadFromSaved'),
      }),
      {
        name: 'calculator-storage',
        partialize: (state) => ({
          params: state.params,
          coordinates: state.coordinates,
        }),
      }
    ),
    { name: 'CalculatorStore' }
  )
);

// Селекторы для оптимизации ререндеров
export const selectParams = (state: CalculatorState) => state.params;
export const selectCoordinates = (state: CalculatorState) => state.coordinates;
export const selectDealType = (state: CalculatorState) => state.params.dealType;
export const selectPropertyName = (state: CalculatorState) => state.params.propertyName;
export const selectLocation = (state: CalculatorState) => state.params.location;
