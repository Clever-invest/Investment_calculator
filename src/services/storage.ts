/**
 * Сервис для работы с localStorage
 */

import type { SavedProperty } from '../types/calculator';

// Интерфейс для storage
interface StorageInterface {
  set: (key: string, value: string) => Promise<boolean>;
  get: (key: string) => Promise<{ value: string } | null>;
  list: (prefix: string) => Promise<{ keys: string[] }>;
  delete: (key: string) => Promise<boolean>;
}

// Расширение Window для storage
declare global {
  interface Window {
    storage?: StorageInterface;
  }
}

// Fallback storage на localStorage
const initStorage = () => {
  if (typeof window !== 'undefined' && !window.storage) {
    window.storage = {
      async set(key: string, value: string) {
        localStorage.setItem(key, value);
        return true;
      },
      async get(key: string) {
        const v = localStorage.getItem(key);
        return v ? { value: v } : null;
      },
      async list(prefix: string) {
        const keys = Object.keys(localStorage).filter(k => k.startsWith(prefix));
        return { keys };
      },
      async delete(key: string) {
        localStorage.removeItem(key);
        return true;
      },
    };
  }
};

// Инициализация при импорте модуля
initStorage();

const PROPERTY_PREFIX = 'property:';

const getStorage = (): StorageInterface => {
  return window.storage!;
};

export const loadAllProperties = async (): Promise<SavedProperty[]> => {
  try {
    const storage = getStorage();
    const result = await storage.list(PROPERTY_PREFIX);
    if (result && result.keys) {
      const properties = await Promise.all(
        result.keys.map(async (key) => {
          try {
            const data = await storage.get(key);
            return data ? JSON.parse(data.value) as SavedProperty : null;
          } catch {
            return null;
          }
        })
      );
      return properties.filter((p): p is SavedProperty => p !== null);
    }
    return [];
  } catch {
    // No saved properties yet
    return [];
  }
};

export const saveProperty = async (property: SavedProperty): Promise<boolean> => {
  try {
    const storage = getStorage();
    const result = await storage.set(`${PROPERTY_PREFIX}${property.id}`, JSON.stringify(property));
    return !!result;
  } catch (error) {
    console.error('Save error:', error instanceof Error ? error.message : String(error));
    throw error;
  }
};

export const deleteProperty = async (id: string): Promise<boolean> => {
  try {
    const storage = getStorage();
    await storage.delete(`${PROPERTY_PREFIX}${id}`);
    return true;
  } catch (error) {
    console.error('Delete error:', error instanceof Error ? error.message : String(error));
    throw error;
  }
};
