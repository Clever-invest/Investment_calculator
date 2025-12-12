import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import Router from './Router';
import './index.css';
import 'react-day-picker/style.css';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found');
}

createRoot(rootElement).render(
  <StrictMode>
    <Router />
  </StrictMode>
);
