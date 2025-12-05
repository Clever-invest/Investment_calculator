/**
 * Store для сохранённых объектов недвижимости
 * Поддерживает localStorage (offline) и Supabase (cloud sync)
 */
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { SavedProperty, CalculatorParams, Coordinates, Calculations } from '../types/calculator';
import * as propertiesApi from '../services/propertiesApi';
import { deletePropertyImages } from '../services/imageStorage';
import { useAuthStore } from './authStore';

interface PropertiesState {
  // Состояние
  properties: SavedProperty[];
  isLoading: boolean;
  error: string | null;
  isSynced: boolean;

  // Действия
  setProperties: (properties: SavedProperty[]) => void;
  addProperty: (
    params: CalculatorParams,
    calculations: Calculations,
    coordinates: Coordinates | null,
    id?: string  // Optional ID for cloud storage consistency
  ) => SavedProperty;
  addPropertyAsync: (
    params: CalculatorParams,
    calculations: Calculations,
    coordinates: Coordinates | null,
    id?: string
  ) => Promise<SavedProperty>;
  updateProperty: (id: string, updates: Partial<SavedProperty>) => void;
  deleteProperty: (id: string) => void;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string) => void;
  
  // Supabase sync
  syncWithCloud: () => Promise<void>;
  saveToCloud: (property: SavedProperty) => Promise<void>;
  deleteFromCloud: (id: string) => Promise<void>;
  migrateLocalToCloud: () => Promise<void>;
}

export const usePropertiesStore = create<PropertiesState>()(
  devtools(
    persist(
      (set, get) => ({
        // Начальное состояние
        properties: [],
        isLoading: false,
        error: null,
        isSynced: false,

        // Установить список объектов
        setProperties: (properties) => 
          set({ properties }, false, 'setProperties'),

        // Добавить новый объект
        addProperty: (params, calculations, coordinates, id) => {
          const newProperty: SavedProperty = {
            ...params,
            id: id || crypto.randomUUID(),  // Use provided ID or generate new UUID
            coordinates,
            calculations,
            savedAt: new Date().toISOString(),
          };
          set(
            (state) => ({ properties: [...state.properties, newProperty] }),
            false,
            'addProperty'
          );
          
          // Auto-sync to cloud if authenticated
          const user = useAuthStore.getState().user;
          if (user) {
            get().saveToCloud(newProperty).catch(console.error);
          }
          
          return newProperty;
        },

        // Добавить новый объект и дождаться синхронизации с облаком
        addPropertyAsync: async (params, calculations, coordinates, id) => {
          const newProperty: SavedProperty = {
            ...params,
            id: id || crypto.randomUUID(),
            coordinates,
            calculations,
            savedAt: new Date().toISOString(),
          };
          
          // Добавляем в локальный state
          set(
            (state) => ({ properties: [...state.properties, newProperty] }),
            false,
            'addPropertyAsync'
          );
          
          // Синхронизируем с облаком и ЖДЁМ результат
          const user = useAuthStore.getState().user;
          if (user) {
            await get().saveToCloud(newProperty);
          }
          
          return newProperty;
        },

        // Обновить объект
        updateProperty: (id, updates) => {
          set(
            (state) => ({
              properties: state.properties.map((p) =>
                p.id === id ? { ...p, ...updates, savedAt: new Date().toISOString() } : p
              ),
            }),
            false,
            'updateProperty'
          );
          
          // Auto-sync to cloud if authenticated
          const user = useAuthStore.getState().user;
          if (user) {
            const property = get().properties.find(p => p.id === id);
            if (property) {
              get().saveToCloud(property).catch(console.error);
            }
          }
        },

        // Удалить объект
        deleteProperty: (id) => {
          // Auto-sync to cloud if authenticated
          const user = useAuthStore.getState().user;
          if (user) {
            get().deleteFromCloud(id).catch(console.error);
          }
          
          set(
            (state) => ({
              properties: state.properties.filter((p) => p.id !== id),
            }),
            false,
            'deleteProperty'
          );
        },

        // Очистить ошибку
        clearError: () => set({ error: null }, false, 'clearError'),
        
        // Установить состояние загрузки
        setLoading: (loading) => set({ isLoading: loading }, false, 'setLoading'),
        
        // Установить ошибку
        setError: (error) => set({ error }, false, 'setError'),
        
        // Синхронизировать с облаком
        syncWithCloud: async () => {
          const user = useAuthStore.getState().user;
          if (!user) return;
          
          set({ isLoading: true }, false, 'syncWithCloud:start');
          
          try {
            const cloudProperties = await propertiesApi.getProperties();
            
            // Convert cloud format to local format
            const localFormat: SavedProperty[] = cloudProperties.map(p => ({
              ...(p.params as unknown as CalculatorParams),
              id: p.id,
              coordinates: p.coordinates as unknown as Coordinates | null,
              calculations: p.calculations as unknown as Calculations,
              savedAt: p.updated_at || p.created_at || new Date().toISOString(),
              // Приоритет: images из таблицы, иначе из params (для обратной совместимости)
              propertyImages: p.images || (p.params as unknown as CalculatorParams)?.propertyImages || [],
            }));
            
            set({ 
              properties: localFormat, 
              isSynced: true, 
              isLoading: false 
            }, false, 'syncWithCloud:complete');
          } catch (error) {
            console.error('Sync error:', error);
            set({ 
              error: 'Ошибка синхронизации с облаком', 
              isLoading: false 
            }, false, 'syncWithCloud:error');
          }
        },
        
        // Сохранить объект в облако
        saveToCloud: async (property) => {
          const user = useAuthStore.getState().user;
          if (!user) return;
          
          try {
            // Фильтруем изображения: в БД сохраняем только пути Storage, не base64
            const cloudImages = (property.propertyImages || []).filter(
              (img) => !img.startsWith('data:') // исключаем base64
            );
            
            const cloudData = {
              name: property.propertyName || 'Без названия',
              location: property.location || '',
              deal_type: property.dealType as 'secondary' | 'offplan',
              params: JSON.parse(JSON.stringify(property)),
              calculations: JSON.parse(JSON.stringify(property.calculations)),
              coordinates: property.coordinates ? JSON.parse(JSON.stringify(property.coordinates)) : null,
              images: cloudImages.length > 0 ? cloudImages : null,
            };
            
            const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(property.id);
            
            if (isUUID) {
              // Check if property exists in cloud first
              const existing = await propertiesApi.getProperty(property.id);
              
              if (existing) {
                await propertiesApi.updateProperty(property.id, cloudData);
              } else {
                await propertiesApi.createProperty(cloudData, property.id);
              }
            } else {
              // Old format ID - create new and update local ID
              const created = await propertiesApi.createProperty(cloudData);
              if (created) {
                set(
                  (state) => ({
                    properties: state.properties.map((p) =>
                      p.id === property.id ? { ...p, id: created.id } : p
                    ),
                  }),
                  false,
                  'saveToCloud:updateId'
                );
              }
            }
          } catch (error) {
            console.error('Error saving to cloud:', error);
          }
        },
        
        // Удалить из облака
        deleteFromCloud: async (id) => {
          const user = useAuthStore.getState().user;
          if (!user) return;
          
          // Only delete if ID is UUID (cloud format)
          const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
          if (isUUID) {
            try {
              await deletePropertyImages(user.id, id);
              await propertiesApi.deleteProperty(id);
            } catch (error) {
              console.error('Error deleting from cloud:', error);
            }
          }
        },
        
        // Мигрировать локальные данные в облако
        migrateLocalToCloud: async () => {
          const user = useAuthStore.getState().user;
          if (!user) return;
          
          const localProperties = get().properties;
          
          set({ isLoading: true }, false, 'migrateLocalToCloud:start');
          
          try {
            for (const property of localProperties) {
              await get().saveToCloud(property);
            }
            
            // Resync to get cloud IDs
            await get().syncWithCloud();
            
            // Очистить localStorage после успешной миграции
            localStorage.removeItem('properties-storage');
            localStorage.removeItem('savedProperties'); // старый формат
          } catch (error) {
            console.error('Migration error:', error);
            set({ 
              error: 'Ошибка миграции данных', 
              isLoading: false 
            }, false, 'migrateLocalToCloud:error');
          }
        },
      }),
      {
        name: 'properties-storage',
        partialize: (state) => ({
          properties: state.properties,
        }),
        onRehydrateStorage: () => {
          return (_state, error) => {
            if (error) {
              console.error('Zustand: hydration error', error);
            }
          };
        },
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
