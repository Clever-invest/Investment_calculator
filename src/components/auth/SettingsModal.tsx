import React, { useState, useEffect } from 'react';
import { X, User, Mail, Key, Trash2, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Синхронизируем displayName с данными пользователя
  useEffect(() => {
    if (isOpen && user) {
      const name = user.user_metadata?.full_name || user.email?.split('@')[0] || '';
      setDisplayName(name);
      setMessage(null); // Сбрасываем сообщение при открытии
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase.auth.updateUser({
        data: { full_name: displayName.trim() }
      });

      if (error) throw error;

      // Обновляем сессию чтобы изменения сразу отобразились в UI
      await supabase.auth.refreshSession();

      setMessage({ type: 'success', text: 'Профиль обновлён' });
    } catch (error) {
      console.error('Update profile error:', error);
      setMessage({ type: 'error', text: 'Ошибка обновления профиля' });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!user?.email) return;
    
    setLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: window.location.origin + '/Investment_calculator/reset-password',
      });

      if (error) throw error;

      setMessage({ type: 'success', text: 'Письмо для сброса пароля отправлено на ' + user.email });
    } catch (error) {
      setMessage({ type: 'error', text: 'Ошибка отправки письма' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">Настройки</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'profile'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Профиль
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'security'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Безопасность
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Message */}
          {message && (
            <div
              className={`mb-4 p-3 rounded-lg flex items-center gap-2 ${
                message.type === 'success'
                  ? 'bg-green-50 text-green-700'
                  : 'bg-red-50 text-red-700'
              }`}
            >
              {message.type === 'success' ? (
                <CheckCircle size={16} />
              ) : (
                <AlertCircle size={16} />
              )}
              <span className="text-sm">{message.text}</span>
            </div>
          )}

          {activeTab === 'profile' && (
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              {/* Email (read-only) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg text-gray-600">
                  <Mail size={16} />
                  <span className="text-sm">{user?.email}</span>
                </div>
              </div>

              {/* Display name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Имя
                </label>
                <div className="relative">
                  <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Ваше имя"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                {loading ? 'Сохранение...' : 'Сохранить изменения'}
              </button>
            </form>
          )}

          {activeTab === 'security' && (
            <div className="space-y-4">
              {/* Reset password */}
              <div className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <Key size={20} className="text-gray-400 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">Сменить пароль</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Мы отправим ссылку для сброса пароля на ваш email
                    </p>
                    <button
                      onClick={handleResetPassword}
                      disabled={loading}
                      className="mt-3 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                    >
                      {loading ? 'Отправка...' : 'Отправить ссылку'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Danger zone */}
              <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                <div className="flex items-start gap-3">
                  <Trash2 size={20} className="text-red-500 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-medium text-red-700">Удалить аккаунт</h3>
                    <p className="text-sm text-red-600 mt-1">
                      Для удаления аккаунта и всех данных напишите на{' '}
                      <a 
                        href={`mailto:support@example.com?subject=Удаление аккаунта&body=Прошу удалить мой аккаунт: ${user?.email || ''}`}
                        className="underline hover:no-underline"
                      >
                        support@example.com
                      </a>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
