import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { TooltipProvider } from '@/components/ui/tooltip';
import { CalculatorSkeleton, OfflineIndicator, UpdatePrompt } from './components/shared';
import { ProtectedRoute } from './components/auth';
import { useAuthStore } from './stores';

// Lazy load pages for better initial load performance
const App = lazy(() => import('./App'));
const AuthPage = lazy(() => import('./pages/AuthPage'));
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage'));

// Компонент для инициализации auth
function AuthInitializer({ children }: { children: React.ReactNode }) {
  const initializeAuth = useAuthStore((state) => state.initialize);
  
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);
  
  return <>{children}</>;
}

export default function Router() {
  // Используем basename для корректной работы с GitHub Pages
  const basename = import.meta.env.BASE_URL || '/';
  
  return (
    <BrowserRouter basename={basename}>
      <TooltipProvider delayDuration={300}>
        {/* PWA components */}
        <OfflineIndicator />
        <UpdatePrompt />
        
        <AuthInitializer>
          <Routes>
            {/* Главная - калькулятор (защищённый) */}
            <Route 
              path="/" 
              element={
                <ProtectedRoute>
                  <Suspense fallback={<CalculatorSkeleton />}>
                    <App />
                  </Suspense>
                </ProtectedRoute>
              } 
            />
            
            {/* Страница входа */}
            <Route 
              path="/login" 
              element={
                <Suspense fallback={<CalculatorSkeleton />}>
                  <AuthPage />
                </Suspense>
              } 
            />
            
            {/* Сброс пароля */}
            <Route 
              path="/reset-password" 
              element={
                <Suspense fallback={<CalculatorSkeleton />}>
                  <ResetPasswordPage />
                </Suspense>
              } 
            />
            
            {/* Редирект старого URL на главную */}
            <Route path="/v1" element={<Navigate to="/" replace />} />
            
            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthInitializer>
      </TooltipProvider>
    </BrowserRouter>
  );
}
