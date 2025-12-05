import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CalculatorSkeleton, HomePageSkeleton, OfflineIndicator, UpdatePrompt } from './components/shared';

// Lazy load pages for better initial load performance
const HomePage = lazy(() => import('./HomePage'));
const App = lazy(() => import('./App'));
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage'));

export default function Router() {
  // Используем basename для корректной работы с GitHub Pages
  const basename = import.meta.env.BASE_URL || '/';
  
  return (
    <BrowserRouter basename={basename}>
      {/* PWA components */}
      <OfflineIndicator />
      <UpdatePrompt />
      
      <Routes>
        <Route 
          path="/" 
          element={
            <Suspense fallback={<HomePageSkeleton />}>
              <HomePage />
            </Suspense>
          } 
        />
        <Route 
          path="/v1" 
          element={
            <Suspense fallback={<CalculatorSkeleton />}>
              <App />
            </Suspense>
          } 
        />
        <Route 
          path="/reset-password" 
          element={
            <Suspense fallback={<HomePageSkeleton />}>
              <ResetPasswordPage />
            </Suspense>
          } 
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
