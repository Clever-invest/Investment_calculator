/**
 * Глобальные типы
 */

interface StorageInterface {
  set: (key: string, value: string) => Promise<boolean>;
  get: (key: string) => Promise<{ value: string } | null>;
  list: (prefix: string) => Promise<{ keys: string[] }>;
  delete: (key: string) => Promise<boolean>;
}

declare global {
  interface Window {
    storage?: StorageInterface;
  }
}

export {};
