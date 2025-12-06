import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * Компонент-обёртка для защиты роутов.
 * Редиректит на /login если пользователь не авторизован.
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const user = useAuthStore((state) => state.user);
  const initialized = useAuthStore((state) => state.initialized);
  const location = useLocation();

  // Показываем загрузку пока инициализируется auth
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

  // Редирект на логин если не авторизован
  if (!user) {
    // Сохраняем текущий путь для редиректа после логина
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

export default ProtectedRoute;
