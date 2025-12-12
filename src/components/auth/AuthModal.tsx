import React, { useState } from 'react';
import { Mail, Lock, User, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { haptic } from '@/utils/haptic';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'signin' | 'signup';
}

type AuthMode = 'signin' | 'signup' | 'reset';

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'signin',
}) => {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  const { signIn, signUp, resetPassword, loading, error, clearError } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    clearError();

    if (mode === 'signin') {
      const { error } = await signIn(email, password);
      if (!error) {
        haptic.success();
        onClose();
        resetForm();
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

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
      resetForm();
    }
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
      case 'signin': return 'Войдите для синхронизации ваших объектов';
      case 'signup': return 'Зарегистрируйтесь для сохранения в облаке';
      case 'reset': return 'Введите email для восстановления доступа';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl">
            {getTitle()}
          </DialogTitle>
          <DialogDescription className="text-center">
            {getDescription()}
          </DialogDescription>
        </DialogHeader>

        {/* Error message */}
        {error && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center gap-2 text-destructive">
            <AlertCircle size={18} />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {/* Success message */}
        {message && (
          <div className="p-3 bg-green-50 dark:bg-green-950/50 border border-green-200 dark:border-green-800 rounded-lg text-green-700 dark:text-green-300 text-sm">
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
        <div className="text-center text-sm text-muted-foreground">
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
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
