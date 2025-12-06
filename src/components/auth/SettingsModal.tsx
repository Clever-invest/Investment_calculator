import React, { useState, useEffect } from 'react';
import { User, Mail, Key, Trash2, CheckCircle, AlertCircle, Moon, Sun, Monitor } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { useIsMobile } from '@/hooks/useMediaQuery';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';

// Компонент выбора темы
interface ThemeOptionProps {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
}

const ThemeOption: React.FC<ThemeOptionProps> = ({ icon, label, isActive, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    aria-pressed={isActive}
    className={cn(
      'flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all',
      'min-h-[72px] focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
      isActive
        ? 'border-primary bg-primary/10 text-primary'
        : 'border-transparent bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground'
    )}
  >
    {icon}
    <span className="text-xs font-medium">{label}</span>
  </button>
);

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const { theme, setTheme, isDark } = useTheme();
  const [activeTab, setActiveTab] = useState<'profile' | 'appearance' | 'security'>('profile');
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
    } catch {
      setMessage({ type: 'error', text: 'Ошибка отправки письма' });
    } finally {
      setLoading(false);
    }
  };

  const content = (
    <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'profile' | 'appearance' | 'security')} className="w-full">
      <TabsList className="grid !w-full grid-cols-3">
        <TabsTrigger value="profile">Профиль</TabsTrigger>
        <TabsTrigger value="appearance">Вид</TabsTrigger>
        <TabsTrigger value="security">Безопасность</TabsTrigger>
      </TabsList>
      
      <div className="mt-4">
        {/* Message */}
        {message && (
          <div
            className={cn(
              'mb-4 p-3 rounded-lg flex items-center gap-2',
              message.type === 'success'
                ? 'bg-green-50 text-green-700'
                : 'bg-destructive/10 text-destructive'
            )}
          >
            {message.type === 'success' ? (
              <CheckCircle size={16} />
            ) : (
              <AlertCircle size={16} />
            )}
            <span className="text-sm">{message.text}</span>
          </div>
        )}

        <TabsContent value="profile" className="mt-0">
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            {/* Email (read-only) */}
            <div className="space-y-2">
              <Label>Email</Label>
              <div className="flex items-center gap-2 px-3 py-2 bg-muted rounded-lg text-muted-foreground">
                <Mail size={16} />
                <span className="text-sm">{user?.email}</span>
              </div>
            </div>

            {/* Display name */}
            <div className="space-y-2">
              <Label htmlFor="displayName">Имя</Label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="displayName"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Ваше имя"
                  className="pl-10"
                  autoComplete="name"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Сохранение...' : 'Сохранить изменения'}
            </Button>
          </form>
        </TabsContent>

        <TabsContent value="appearance" className="mt-0 space-y-4">
          {/* Theme selector */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-3">
                {isDark ? (
                  <Moon size={20} className="text-primary" />
                ) : (
                  <Sun size={20} className="text-primary" />
                )}
                <div>
                  <CardTitle className="text-base">Тема оформления</CardTitle>
                  <CardDescription>
                    Выберите предпочитаемую цветовую схему
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Theme options */}
              <div className="grid grid-cols-3 gap-2">
                <ThemeOption
                  icon={<Sun size={18} />}
                  label="Светлая"
                  isActive={theme === 'light'}
                  onClick={() => setTheme('light')}
                />
                <ThemeOption
                  icon={<Moon size={18} />}
                  label="Тёмная"
                  isActive={theme === 'dark'}
                  onClick={() => setTheme('dark')}
                />
                <ThemeOption
                  icon={<Monitor size={18} />}
                  label="Система"
                  isActive={theme === 'system'}
                  onClick={() => setTheme('system')}
                />
              </div>
            </CardContent>
          </Card>

          {/* Quick toggle */}
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Moon size={20} className="text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Тёмный режим</p>
                    <p className="text-xs text-muted-foreground">Быстрое переключение</p>
                  </div>
                </div>
                <Switch
                  checked={isDark}
                  onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
                  aria-label="Переключить тёмную тему"
                />
              </div>
            </CardContent>
          </Card>

          {/* Accessibility info */}
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">
                💡 При выборе "Система" тема автоматически меняется в зависимости от настроек вашего устройства.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="mt-0 space-y-4">
          {/* Reset password */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-3">
                <Key size={20} className="text-muted-foreground" />
                <div>
                  <CardTitle className="text-base">Сменить пароль</CardTitle>
                  <CardDescription>
                    Мы отправим ссылку для сброса пароля на ваш email
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button
                variant="secondary"
                onClick={handleResetPassword}
                disabled={loading}
                size="sm"
              >
                {loading ? 'Отправка...' : 'Отправить ссылку'}
              </Button>
            </CardContent>
          </Card>

          {/* Danger zone */}
          <Card className="border-destructive/50 bg-destructive/5">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-3">
                <Trash2 size={20} className="text-destructive" />
                <div>
                  <CardTitle className="text-base text-destructive">Удалить аккаунт</CardTitle>
                  <CardDescription className="text-destructive/80">
                    Для удаления аккаунта и всех данных напишите на{' '}
                    <a 
                      href={`mailto:support@example.com?subject=Удаление аккаунта&body=Прошу удалить мой аккаунт: ${user?.email || ''}`}
                      className="underline hover:no-underline"
                    >
                      support@example.com
                    </a>
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>
        </TabsContent>
      </div>
    </Tabs>
  );

  // Mobile: Sheet from bottom
  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent side="bottom" className="h-[85vh] rounded-t-2xl pb-safe">
          <SheetHeader className="pb-4">
            <SheetTitle>Настройки</SheetTitle>
          </SheetHeader>
          <div className="overflow-y-auto flex-1 -mx-4 px-4">
            {content}
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  // Desktop: Dialog
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Настройки</DialogTitle>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  );
};

export default SettingsModal;
