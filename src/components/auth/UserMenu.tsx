import React, { useState, useRef, useEffect } from 'react';
import { User, LogOut, Settings, Cloud, ChevronDown } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { SettingsModal } from './SettingsModal';

interface UserMenuProps {
  onOpenAuth: () => void;
}

export const UserMenu: React.FC<UserMenuProps> = ({ onOpenAuth }) => {
  const { user, isAuthenticated, signOut, loading } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    setIsOpen(false);
    await signOut();
  };

  // Not authenticated - show sign in button
  if (!isAuthenticated) {
    return (
      <>
        {/* Mobile: компактная иконка */}
        <button
          onClick={onOpenAuth}
          className="flex sm:hidden items-center justify-center w-9 h-9 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
          title="Войти"
        >
          <User size={18} />
        </button>
        {/* Desktop: полная кнопка */}
        <button
          onClick={onOpenAuth}
          className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors text-sm font-medium"
        >
          <User size={16} />
          <span>Войти</span>
        </button>
      </>
    );
  }

  // Authenticated - show user menu
  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Пользователь';
  const email = user?.email;

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 sm:gap-2 p-1.5 sm:px-3 sm:py-2 bg-white/10 hover:bg-white/20 sm:bg-gray-100 sm:hover:bg-gray-200 rounded-lg transition-colors"
      >
        <div className="w-7 h-7 sm:w-8 sm:h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs sm:text-sm font-medium">
          {displayName.charAt(0).toUpperCase()}
        </div>
        <span className="text-sm font-medium text-gray-700 max-w-[120px] truncate hidden sm:block">
          {displayName}
        </span>
        <ChevronDown
          size={14}
          className={`text-white sm:text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''} hidden sm:block`}
        />
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
          {/* User info */}
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-sm font-medium text-gray-900">{displayName}</p>
            <p className="text-xs text-gray-500 truncate">{email}</p>
          </div>

          {/* Sync status */}
          <div className="px-4 py-2 border-b border-gray-100">
            <div className="flex items-center gap-2 text-sm text-green-600">
              <Cloud size={16} />
              <span>Синхронизация включена</span>
            </div>
          </div>

          {/* Menu items */}
          <div className="py-1">
            <button
              onClick={() => {
                setIsOpen(false);
                setIsSettingsOpen(true);
              }}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3"
            >
              <Settings size={16} className="text-gray-400" />
              Настройки
            </button>

            <button
              onClick={handleSignOut}
              disabled={loading}
              className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-3"
            >
              <LogOut size={16} />
              Выйти
            </button>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
};

export default UserMenu;
