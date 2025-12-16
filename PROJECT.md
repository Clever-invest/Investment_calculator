# Flip Calculator — Investment Property Calculator

> **Версия:** 2.2.0  
> **Последнее обновление:** 15 декабря 2025  
> **Статус:** ✅ Production Ready

---

## 📊 Общий прогресс: 100%

Проект полностью завершён и готов к production.

---

## ✅ Выполненные этапы

### Этап 1: Рефакторинг App.jsx ✅
- App.tsx: 1984 → ~500 строк (сокращение 75%)
- Вынесены компоненты форм, результатов, проектов
- Модульная архитектура

### Этап 2: Миграция на TypeScript ✅
- 100% файлов на TypeScript
- Полные типы для калькулятора, координат, расчётов
- Строгая типизация Supabase (database.ts)

### Этап 3: Tailwind CSS ✅
- Локальная установка (без CDN)
- Кастомные цвета для метрик (profit, roi, irr, timing)
- shadcn/ui компоненты

### Этап 4: State Management ✅
- Zustand stores с persist
- calculatorStore, propertiesStore, uiStore, authStore
- Синхронизация с облаком

### Этап 5: Тестирование ✅
- Unit тесты (Vitest)
- E2E тесты (Playwright)
- CI/CD настроен

### Этап 6: Backend интеграция ✅
- Supabase Auth (email/password)
- PostgreSQL с RLS политиками
- Supabase Storage для изображений
- Realtime синхронизация

### Этап 7: PWA и оптимизация ✅
- Service Worker (Workbox)
- Offline-first architecture
- Code splitting, lazy loading
- Skeleton loaders

---

## 🚧 Последние изменения (15 декабря 2025)

### Синхронизация с Notion
- [x] Edge Function `sync-to-notion` v15
- [x] Database Trigger на INSERT/UPDATE/DELETE
- [x] Поле `notion_page_id` в таблице properties
- [x] Поддержка Place property с координатами
- [x] Все фото прикрепляются к странице
- [x] ROI/IRR в формате Percent
- [x] Синхронизация `serial_number` → `Slot ID` в Notion

Подробнее: `docs/NOTION_SYNC_SETUP.md`

---

## 🏗️ Архитектура

```
src/
├── components/
│   ├── auth/           # AuthModal, UserMenu, ProtectedRoute
│   ├── forms/          # PropertyInfoForm, DealParamsForm, ImageUploader
│   ├── layout/         # BottomNav
│   ├── projects/       # SavedPropertiesList, DealSheetExport
│   ├── results/        # MetricsGrid, WaterfallChart, DetailedBreakdown
│   ├── shared/         # MetricCard, Skeleton, OfflineIndicator
│   └── ui/             # shadcn/ui компоненты
├── hooks/              # useCalculations, useAuth, useMediaQuery
├── pages/              # AuthPage, ResetPasswordPage
├── services/           # propertiesApi, storage, location
├── stores/             # Zustand: calculator, properties, ui, auth
├── types/              # calculator.ts, database.ts
└── utils/              # format, haptic
```

---

## 🔧 Технологический стек

| Категория | Технология |
|-----------|------------|
| Frontend | React 18, TypeScript, Vite |
| Styling | Tailwind CSS, shadcn/ui |
| State | Zustand + persist |
| Backend | Supabase (Auth, DB, Storage) |
| Charts | Recharts |
| Maps | OpenStreetMap + Leaflet |
| PWA | Workbox, vite-plugin-pwa |
| Testing | Vitest, Playwright |

---

## 📝 База данных Supabase

### Таблица `properties`
```sql
id              UUID PRIMARY KEY
user_id         UUID REFERENCES auth.users
name            TEXT NOT NULL
location        TEXT
deal_type       TEXT DEFAULT 'secondary'
params          JSONB -- все CalculatorParams включая bedrooms, bathrooms
calculations    JSONB
coordinates     JSONB
images          TEXT[]
notes           TEXT
serial_number   TEXT -- Серийный номер (SL-001, SL-002, ...)
is_archived     BOOLEAN DEFAULT false
notion_page_id  TEXT -- ID страницы в Notion для синхронизации
created_at      TIMESTAMPTZ
updated_at      TIMESTAMPTZ
```

### Edge Functions

| Функция | Описание |
|---------|----------|
| `sync-to-notion` | Синхронизация объектов с Notion Project Pipeline |

### Database Triggers

| Триггер | События | Действие |
|--------|----------|----------|
| `trigger_notion_sync` | INSERT/UPDATE/DELETE | Вызывает Edge Function sync-to-notion |

---

## 🚀 Запуск

```bash
# Установка
npm install

# Разработка
npm run dev

# Сборка
npm run build

# Тесты
npm test
npm run test:e2e
```

---

## 📌 Backlog

- [ ] Google OAuth
- [ ] Push-уведомления
- [ ] Сравнение объектов side-by-side
- [ ] Экспорт в Excel
- [ ] Мультиязычность (EN/RU/AR)
