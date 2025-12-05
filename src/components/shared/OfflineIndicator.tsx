import { useState, useEffect } from 'react';
import { WifiOff, Wifi, X } from 'lucide-react';

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showBanner, setShowBanner] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowBanner(true);
      setDismissed(false);
      // Auto-hide after 3 seconds
      setTimeout(() => setShowBanner(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowBanner(true);
      setDismissed(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Don't show anything if dismissed or (online and banner hidden)
  if (dismissed || (isOnline && !showBanner)) {
    return null;
  }

  return (
    <div
      className={`fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 
        px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 
        transition-all duration-300 ease-in-out
        ${isOnline 
          ? 'bg-green-500 text-white' 
          : 'bg-amber-500 text-white'
        }`}
    >
      {isOnline ? (
        <>
          <Wifi className="w-5 h-5" />
          <span className="font-medium">Подключение восстановлено</span>
        </>
      ) : (
        <>
          <WifiOff className="w-5 h-5" />
          <span className="font-medium">Офлайн режим</span>
          <span className="text-sm opacity-90">— данные сохраняются локально</span>
        </>
      )}
      <button
        onClick={() => setDismissed(true)}
        className="ml-2 p-1 hover:bg-white/20 rounded transition-colors"
        aria-label="Закрыть"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export default OfflineIndicator;
