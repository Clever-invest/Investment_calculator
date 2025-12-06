/**
 * Setup для тестов
 */

import '@testing-library/jest-dom';

// Mock localStorage для Zustand persist
const localStorageMock = {
  getItem: (_key: string): string | null => null,
  setItem: (_key: string, _value: string): void => {},
  removeItem: (_key: string): void => {},
  clear: (): void => {},
  length: 0,
  key: (_index: number): string | null => null,
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock window.storage для storage.ts
Object.defineProperty(window, 'storage', {
  value: {
    set: async (_key: string, _value: string) => true,
    get: async (_key: string) => null,
    list: async (_prefix: string) => ({ keys: [] }),
    delete: async (_key: string) => true,
  },
  writable: true,
});
