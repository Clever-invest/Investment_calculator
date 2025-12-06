import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, User, AlertCircle, Loader2, Calculator } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/stores';
import { haptic } from '@/utils/haptic';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

type AuthMode = 'signin' | 'signup' | 'reset';

/**
 * Полноэкранная страница авторизации.
 * Редиректит на калькулятор после успешного входа.
 */
export default function AuthPage() {
  const [mode, setMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  const { signIn, signUp, resetPassword, loading, error, clearError } = useAuth();
  const user = useAuthStore((state) => state.user);
  const initialized = useAuthStore((state) => state.initialized);
  
  const navigate = useNavigate();
  const location = useLocation();

  // Получаем путь для редиректа после логина
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';

  // Редирект если уже авторизован
  useEffect(() => {
    if (initialized && user) {
      navigate(from, { replace: true });
    }
  }, [initialized, user, navigate, from]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    clearError();

    if (mode === 'signin') {
      const { error } = await signIn(email, password);
      if (!error) {
        haptic.success();
        // Редирект произойдёт автоматически через useEffect
      } else {
        haptic.error();
      }
    } else if (mode === 'signup') {
      const { error } = await signUp(email, password, fullName);
      if (!error) {
        haptic.success();
        setMessage('Проверьте email для подтверждения регистрации');
      } else {
        haptic.error();
      }
    } else if (mode === 'reset') {
      const { error } = await resetPassword(email);
      if (!error) {
        haptic.success();
        setMessage('Инструкции по сбросу пароля отправлены на email');
      } else {
        haptic.error();
      }
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setFullName('');
    setMessage(null);
    clearError();
  };

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode);
    resetForm();
  };

  const getTitle = () => {
    switch (mode) {
      case 'signin': return 'Вход в аккаунт';
      case 'signup': return 'Создать аккаунт';
      case 'reset': return 'Сброс пароля';
    }
  };

  const getDescription = () => {
    switch (mode) {
      case 'signin': return 'Войдите для доступа к калькулятору';
      case 'signup': return 'Зарегистрируйтесь для сохранения в облаке';
      case 'reset': return 'Введите email для восстановления доступа';
    }
  };

  // Показываем загрузку пока проверяется auth
  if (!initialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-gray-600">Загрузка...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Calculator className="w-10 h-10 text-blue-600" />
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              Флип-калькулятор
            </h1>
          </div>
          <p className="text-gray-600">
            Профессиональный анализ инвестиций в недвижимость
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              {getTitle()}
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              {getDescription()}
            </p>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center gap-2 text-destructive">
              <AlertCircle size={18} />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* Success message */}
          {message && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
              {message}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div className="space-y-2">
                <Label htmlFor="fullName">Имя</Label>
                <div className="relative">
                  <User
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  />
                  <Input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Ваше имя"
                    className="pl-10"
                    autoComplete="name"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="pl-10"
                  autoComplete="email"
                  inputMode="email"
                />
              </div>
            </div>

            {mode !== 'reset' && (
              <div className="space-y-2">
                <Label htmlFor="password">Пароль</Label>
                <div className="relative">
                  <Lock
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={6}
                    className="pl-10"
                    autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                  />
                </div>
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full"
              size="lg"
            >
              {loading && <Loader2 size={18} className="animate-spin mr-2" />}
              {mode === 'signin' && 'Войти'}
              {mode === 'signup' && 'Создать аккаунт'}
              {mode === 'reset' && 'Отправить инструкции'}
            </Button>
          </form>

          {/* Footer links */}
          <div className="mt-6 text-center text-sm text-muted-foreground">
            {mode === 'signin' && (
              <>
                <button
                  type="button"
                  onClick={() => switchMode('reset')}
                  className="text-primary hover:underline"
                >
                  Забыли пароль?
                </button>
                <div className="mt-3">
                  Нет аккаунта?{' '}
                  <button
                    type="button"
                    onClick={() => switchMode('signup')}
                    className="text-primary hover:underline font-medium"
                  >
                    Зарегистрироваться
                  </button>
                </div>
              </>
            )}
            {mode === 'signup' && (
              <div>
                Уже есть аккаунт?{' '}
                <button
                  type="button"
                  onClick={() => switchMode('signin')}
                  className="text-primary hover:underline font-medium"
                >
                  Войти
                </button>
              </div>
            )}
            {mode === 'reset' && (
              <button
                type="button"
                onClick={() => switchMode('signin')}
                className="text-primary hover:underline"
              >
                ← Вернуться к входу
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 mt-6">
          © 2024 Flip Calculator. Все права защищены.
        </p>
      </div>
    </div>
  );
}
