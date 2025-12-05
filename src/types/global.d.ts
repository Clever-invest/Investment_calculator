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

// PWA virtual module types
declare module 'virtual:pwa-register/react' {
  import type { Dispatch, SetStateAction } from 'react';

  export interface RegisterSWOptions {
    immediate?: boolean;
    onNeedRefresh?: () => void;
    onOfflineReady?: () => void;
    onRegistered?: (registration: ServiceWorkerRegistration | undefined) => void;
    onRegisterError?: (error: Error) => void;
  }

  export interface UseRegisterSWReturn {
    needRefresh: [boolean, Dispatch<SetStateAction<boolean>>];
    offlineReady: [boolean, Dispatch<SetStateAction<boolean>>];
    updateServiceWorker: (reloadPage?: boolean) => Promise<void>;
  }

  export function useRegisterSW(options?: RegisterSWOptions): UseRegisterSWReturn;
}

export {};
