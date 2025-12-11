# Синхронизация Supabase → Notion

> **Статус:** ✅ Production Ready  
> **Версия Edge Function:** v8  
> **Последнее обновление:** 11 декабря 2025

## Архитектура

```
Flip Calculator → Supabase INSERT/UPDATE/DELETE → Database Trigger → Edge Function → Notion API
```

## Компоненты

| Компонент | Статус |
|-----------|--------|
| Поле `notion_page_id` | ✅ |
| Edge Function `sync-to-notion` v8 | ✅ |
| Database Trigger `trigger_notion_sync` | ✅ |
| pg_net для async HTTP | ✅ |
| Авторизация в триггере | ✅ |

---

## 1. Создание Notion Integration

1. Перейди на https://www.notion.so/my-integrations
2. Нажми **"New integration"**
3. Заполни:
   - **Name**: `Flip Calculator Sync`
   - **Associated workspace**: выбери свой workspace
   - **Capabilities**: 
     - ✅ Read content
     - ✅ Update content
     - ✅ Insert content
4. Нажми **"Submit"**
5. Скопируй **Internal Integration Secret** (начинается с `secret_...`)

## 2. Создание базы Project Pipeline в Notion

Создай новую Database в Notion со следующими полями:

| Поле | Тип | Описание |
|------|-----|----------|
| **Name** | Title | Название объекта |
| **Status** | Status | Статус (Sourcing, Analysis, Negotiation, Under Contract, Completed, Rejected) |
| **Location** | Place | Локация с координатами (отображается на карте) |
| **Property Type** | Select | Апартаменты, Вилла, Таунхаус |
| **Bedroom** | Number | Количество спален |
| **Bathroom** | Number | Количество ванных |
| **Area (sqft)** | Number | Площадь в кв. футах |
| **Deal Type** | Select | Вторичка, Off-Plan |
| **Purchase Price** | Number | Цена покупки (AED) |
| **Paid Amount** | Number | Оплаченная сумма (для off-plan) |
| **Target Sale Price** | Number | Целевая цена продажи |
| **Renovation Budget** | Number | Бюджет на ремонт |
| **Renovation Months** | Number | Месяцы на ремонт |
| **Listing Months** | Number | Месяцы на продажу |
| **Total Costs** | Number | Общие затраты |
| **Net Revenue** | Number | Чистая выручка |
| **Net Profit** | Number | Чистая прибыль |
| **ROI** | Number (Percent) | ROI — формат Percent! |
| **IRR** | Number (Percent) | IRR — формат Percent! |
| **Break-even Price** | Number | Цена безубыточности |
| **Images** | Files | Фото объекта |
| **Calculator ID** | Text | ID объекта в Supabase |
| **Calculator Link** | URL | Ссылка на калькулятор |
| **Agent/Source** | Text | Агент/источник (Notion-only) |
| **Telegram Post URL** | URL | Ссылка на пост в Telegram (Notion-only) |
| **SPV** | Text | SPV компания (Notion-only) |
| **Investors** | Multi-select | Инвесторы (Notion-only) |
| **Notes** | Text | Заметки (Notion-only) |

## 3. Подключение Integration к базе

1. Открой созданную базу в Notion
2. Нажми **"..."** (три точки) в правом верхнем углу
3. Выбери **"Add connections"**
4. Найди и выбери **"Flip Calculator Sync"**

## 4. Получение Database ID

1. Открой базу в браузере
2. URL будет выглядеть так:
   ```
   https://www.notion.so/workspace/DATABASE_ID?v=...
   ```
3. Скопируй `DATABASE_ID` (32 символа без дефисов)

## 5. Добавление секретов в Supabase

**Dashboard:** Project Settings → Edge Functions → Secrets

```
NOTION_API_KEY=secret_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NOTION_DATABASE_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Или через CLI:**
```bash
supabase secrets set NOTION_API_KEY=secret_xxx NOTION_DATABASE_ID=xxx
```

> `SUPABASE_URL` и `SUPABASE_SERVICE_ROLE_KEY` доступны автоматически.

## 6. Тестирование

После настройки создай или обнови объект в Flip Calculator:
1. Сохрани объект
2. Проверь, что страница появилась в Notion
3. Проверь логи Edge Function в Supabase Dashboard

## Маппинг полей

### Supabase → Notion

| Supabase | Notion |
|----------|--------|
| `name` | Name |
| `location` | Location |
| `params.propertyType` | Property Type |
| `params.bedrooms` | Bedroom |
| `params.bathrooms` | Bathroom |
| `params.area` | Area (sqft) |
| `deal_type` | Deal Type |
| `images[0]` | Cover Image |
| `coordinates` | Coordinates |
| `params.purchasePrice` | Purchase Price |
| `params.paidAmount` | Paid Amount |
| `params.targetSalePrice` | Target Sale Price |
| `params.renovationBudget` | Renovation Budget |
| `params.renovationMonths` | Renovation Months |
| `params.listingMonths` | Listing Months |
| `calculations.totalCosts` | Total Costs |
| `calculations.netRevenue` | Net Revenue |
| `calculations.netProfit` | Net Profit |
| `calculations.roi` | ROI |
| `calculations.irr` | IRR |
| `calculations.breakEvenPrice` | Break-even Price |
| `id` | Calculator ID |
| URL | Calculator Link |

### Notion-only поля (не синхронизируются)

- Status (кроме начального "Sourcing")
- Agent/Source
- Telegram Post URL
- SPV
- Investors
- Notes

## Логика синхронизации

1. **INSERT** → создаёт страницу в Notion со статусом "Sourcing"
2. **UPDATE** → обновляет страницу, НЕ трогает Status и Notion-only поля
3. **DELETE** → архивирует страницу в Notion

## Управление триггером

```sql
-- Отключить синхронизацию
ALTER TABLE properties DISABLE TRIGGER trigger_notion_sync;

-- Включить синхронизацию
ALTER TABLE properties ENABLE TRIGGER trigger_notion_sync;
```

## Мониторинг

- **Edge Function Logs:** Supabase Dashboard → Edge Functions → sync-to-notion → Logs
- **Postgres Logs:** `Notion sync triggered for INSERT/UPDATE/DELETE`

## Troubleshooting

| Проблема | Решение |
|----------|--------|
| Страницы не создаются | Проверь логи Edge Function, секреты NOTION_API_KEY и NOTION_DATABASE_ID |
| 401 Unauthorized | Проверь NOTION_API_KEY, Integration должна быть подключена к базе |
| 404 Not Found | Проверь NOTION_DATABASE_ID, база должна быть расшарена с Integration |
| ROI/IRR показывают 788% | Поле должно иметь формат Percent, значение делится на 100 |
| Фото не прикрепляются | Поле Images должно быть типа Files |
