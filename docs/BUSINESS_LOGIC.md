# Бизнес-логика калькулятора инвестиций в недвижимость

## Обзор

Калькулятор предназначен для расчёта доходности инвестиций в недвижимость (flipping) в ОАЭ.
Поддерживает два типа сделок:
- **Secondary** (вторичка) — покупка готовой недвижимости с полной оплатой
- **Off-plan** — покупка у застройщика с частичной оплатой и графиком платежей

---

## 1. Входные параметры

### 1.1. Информация об объекте

| Параметр | Тип | Описание | Пример |
|----------|-----|----------|--------|
| `propertyName` | string | Название объекта | "Marina Oaks Villa" |
| `location` | string | Локация | "Dubai Marina" |
| `propertyType` | enum | Тип недвижимости | `apartment` \| `villa` \| `townhouse` |
| `dealType` | enum | Тип сделки | `secondary` \| `offplan` |
| `bedrooms` | number | Количество спален | 2 |
| `bathrooms` | number | Количество ванных | 2 |
| `unitAreaSqft` | number | Площадь юнита (sqft) | 1200 |
| `plotAreaSqft` | number | Площадь участка (sqft) | 5000 |

### 1.2. Параметры покупки

| Параметр | Тип | Единицы | Описание | По умолчанию |
|----------|-----|---------|----------|--------------|
| `purchasePrice` | Money | AED | Цена покупки | 500,000 |
| `dldFees` | Pct | % | DLD/регистрация (от цены покупки) | 4% |
| `buyerCommission` | Pct | % | Комиссия покупателя (от цены покупки) | 2% |
| `trusteeOfficeFee` | Money | AED | Фиксированный сбор Trustee Office | 5,000 |

> **VAT на комиссию покупателя**: фиксированно 5% от суммы комиссии

### 1.3. Параметры Off-plan (только для `dealType = 'offplan'`)

| Параметр | Тип | Единицы | Описание |
|----------|-----|---------|----------|
| `paidAmount` | Money | AED | Фактически оплаченная сумма |
| `paymentSchedule` | Array | - | График будущих платежей |

**Структура `paymentSchedule`:**
```typescript
{
  amount: number;    // сумма платежа в AED
  date: string;      // дата в формате "YYYY-MM-DD"
}
```

### 1.4. Параметры ремонта

| Параметр | Тип | Единицы | Описание | По умолчанию |
|----------|-----|---------|----------|--------------|
| `renovationBudget` | Money | AED | Бюджет ремонта | 100,000 |
| `contingency` | Pct | % | Резерв (от бюджета ремонта) | 15% |

### 1.5. Расходы на содержание (Carrying Costs)

| Параметр | Тип | Единицы | Описание | По умолчанию |
|----------|-----|---------|----------|--------------|
| `serviceChargeYearly` | Money | AED/год | Годовой Service Charge | 6,000 |
| `dewaAcMonthly` | Money | AED/мес | Ежемесячные DEWA/AC | 500 |

### 1.6. Параметры продажи

| Параметр | Тип | Единицы | Описание | По умолчанию |
|----------|-----|---------|----------|--------------|
| `sellingPrice` | Money | AED | Цена продажи | 700,000 |
| `sellerCommission` | Pct | % | Комиссия продавца (от цены продажи) | 4% |

> **VAT на комиссию продавца**: фиксированно 5% от суммы комиссии

### 1.7. Сроки сделки

| Параметр | Тип | Единицы | Описание | По умолчанию |
|----------|-----|---------|----------|--------------|
| `renovationMonths` | number | месяцев | Срок ремонта | 3 |
| `listingMonths` | number | месяцев | Срок экспозиции (продажи) | 2 |

### 1.8. Дополнительные параметры

| Параметр | Тип | Единицы | Описание | По умолчанию |
|----------|-----|---------|----------|--------------|
| `targetReturn` | Pct | % годовых | Целевая доходность (для таблицы ранней продажи) | 25% |

---

## 2. Формулы расчётов

### 2.1. Производные параметры

```
monthsTotal = renovationMonths + listingMonths
```

```
carryingMonthly = serviceChargeYearly / 12 + dewaAcMonthly
```

### 2.2. Комиссии при покупке

```
DLD = purchasePrice × (dldFees / 100)
```

```
buyerCommissionAmount = purchasePrice × (buyerCommission / 100)
```

```
buyerCommissionVAT = buyerCommissionAmount × 0.05
```

```
buyerCommissionTotal = buyerCommissionAmount + buyerCommissionVAT
```

### 2.3. Ремонт с резервом

```
totalRenovation = renovationBudget × (1 + contingency / 100)
```

### 2.4. Носимые расходы за период

```
carryingService = (serviceChargeYearly / 12) × monthsTotal
```

```
carryingDewa = dewaAcMonthly × monthsTotal
```

```
carryingTotal = carryingService + carryingDewa
```

### 2.5. Комиссии при продаже

```
sellerCommissionAmount = sellingPrice × (sellerCommission / 100)
```

```
sellerCommissionVAT = sellerCommissionAmount × 0.05
```

```
sellerCommissionTotal = sellerCommissionAmount + sellerCommissionVAT
```

---

## 3. Расчёт для SECONDARY (вторичка)

### 3.1. Общие затраты (Total Costs)

```
totalCosts = purchasePrice
           + DLD
           + buyerCommissionTotal
           + totalRenovation
           + carryingService
           + carryingDewa
           + trusteeOfficeFee
```

**Структура затрат:**

| Компонент | Формула |
|-----------|---------|
| Цена покупки | `purchasePrice` |
| DLD (регистрация) | `purchasePrice × dldFees%` |
| Комиссия покупателя | `purchasePrice × buyerCommission%` |
| VAT на комиссию | `buyerCommissionAmount × 5%` |
| Ремонт | `renovationBudget × (1 + contingency%)` |
| Service Charge | `(serviceChargeYearly / 12) × monthsTotal` |
| DEWA/AC | `dewaAcMonthly × monthsTotal` |
| Trustee Office Fee | `trusteeOfficeFee` |

### 3.2. Чистая выручка (Net Proceeds)

```
netProceeds = sellingPrice - sellerCommissionTotal
```

**Где:**
```
sellerCommissionTotal = sellingPrice × sellerCommission% × 1.05
```

### 3.3. Прибыль

```
netProfit = netProceeds - totalCosts
```

---

## 4. Расчёт для OFF-PLAN

### 4.1. Определение остатка долга (Remaining Debt)

**Логика:** учитываются только платежи, которые **наступают до даты продажи**.

```
saleDate = currentDate + monthsTotal (месяцев)
```

```
remainingDebt = SUM(payment.amount)
                где payment.date <= saleDate
```

> Если дата платежа не указана или невалидна — платёж считается обязательным к оплате.

### 4.2. Общие затраты (Total Costs)

```
totalCosts = paidAmount
           + DLD
           + buyerCommissionTotal
           + totalRenovation
           + carryingService
           + carryingDewa
           + trusteeOfficeFee
```

> **Важно:** для off-plan используется `paidAmount` (фактически оплаченная сумма), а не полная `purchasePrice`!

**Структура затрат:**

| Компонент | Формула |
|-----------|---------|
| Фактически оплачено | `paidAmount` |
| DLD (регистрация) | `purchasePrice × dldFees%` |
| Комиссия покупателя | `purchasePrice × buyerCommission%` |
| VAT на комиссию | `buyerCommissionAmount × 5%` |
| Ремонт | `renovationBudget × (1 + contingency%)` |
| Service Charge | `(serviceChargeYearly / 12) × monthsTotal` |
| DEWA/AC | `dewaAcMonthly × monthsTotal` |
| Trustee Office Fee | `trusteeOfficeFee` |

> **DLD и комиссии** рассчитываются от полной `purchasePrice` (общей стоимости от застройщика)

### 4.3. Чистая выручка (Net Proceeds)

```
netProceeds = sellingPrice - sellerCommissionTotal - remainingDebt
```

> **При продаже off-plan** покупатель берёт на себя остаток долга перед застройщиком

### 4.4. Прибыль

```
netProfit = netProceeds - totalCosts
```

---

## 5. Метрики доходности

### 5.1. ROI (Return on Investment) — период сделки

```
ROI = (netProfit / totalCosts) × 100%
```

**Интерпретация:** процент прибыли на вложенный капитал за весь период сделки.

### 5.2. IRR (Internal Rate of Return) — годовая

```
MOIC = netProceeds / totalCosts
```

```
IRR = (MOIC ^ (12 / monthsTotal) - 1) × 100%
```

**Интерпретация:** годовая доходность с учётом сложного процента (compound rate).

**Формула в развёрнутом виде:**
```
IRR = ((netProceeds / totalCosts) ^ (12 / monthsTotal) - 1) × 100%
```

### 5.3. Break-Even Price (точка безубыточности)

**Для Secondary:**
```
breakEvenPrice = totalCosts / (1 - sellerCommission% × 1.05)
```

**Для Off-plan:**
```
breakEvenPrice = (totalCosts + remainingDebt) / (1 - sellerCommission% × 1.05)
```

**Интерпретация:** минимальная цена продажи, при которой прибыль = 0.

---

## 6. Таблица ранней продажи (Early Sale Discount)

### 6.1. Концепция

Таблица показывает рекомендуемую цену продажи для каждой недели экспозиции с учётом целевой доходности (`targetReturn`).

### 6.2. Формулы

**Дневная ставка:**
```
dailyRate = targetReturn / 36500
```

**Для каждой недели экспозиции (week = 0, 2, 4, ...):**

```
totalWeeksFromStart = renovationWeeks + week
totalMonthsFromStart = totalWeeksFromStart / 4.33

listingWeeks = listingMonths × 4.33
daysEarly = (listingWeeks - week) × 7

discount = sellingPrice × dailyRate × daysEarly
recommendedPrice = sellingPrice - discount
```

**Расчёт метрик для рекомендуемой цены:**

```
newSellerCommissionTotal = recommendedPrice × sellerCommission% × 1.05
newRevenueNet = recommendedPrice - newSellerCommissionTotal
newProfit = newRevenueNet - totalCosts

newROI = (newProfit / totalCosts) × 100%
newIRR = ((newRevenueNet / totalCosts) ^ (12 / totalMonthsFromStart) - 1) × 100%
```

### 6.3. Кастомные метрики

Пользователь может задать целевой ROI или IRR для конкретной недели:

**При заданном целевом ROI:**
```
targetRevenueNet = (targetROI / 100 + 1) × totalCosts
recommendedPrice = targetRevenueNet / (1 - sellerCommission% × 1.05)
```

**При заданном целевом IRR:**
```
targetRevenueNet = totalCosts × (targetIRR / 100 + 1) ^ (totalMonthsFromStart / 12)
recommendedPrice = targetRevenueNet / (1 - sellerCommission% × 1.05)
```

---

## 7. Диаграмма потока данных

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         ВХОДНЫЕ ДАННЫЕ (UI)                              │
├─────────────────────────────────────────────────────────────────────────┤
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐                │
│  │  Покупка      │  │  Ремонт       │  │  Продажа      │                │
│  │ ─────────────│  │ ─────────────│  │ ─────────────│                │
│  │ purchasePrice │  │ renovationBu. │  │ sellingPrice  │                │
│  │ dldFees %     │  │ contingency % │  │ sellerComm. % │                │
│  │ buyerComm. %  │  │               │  │               │                │
│  │ trusteeOff.   │  │               │  │               │                │
│  └───────────────┘  └───────────────┘  └───────────────┘                │
│                                                                          │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐                │
│  │  Содержание   │  │  Сроки        │  │  Off-plan     │                │
│  │ ─────────────│  │ ─────────────│  │ ─────────────│                │
│  │ serviceCharge │  │ renovMonths   │  │ paidAmount    │                │
│  │ dewaMonthly   │  │ listingMonths │  │ paymentSched. │                │
│  └───────────────┘  └───────────────┘  └───────────────┘                │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         РАСЧЁТ ЗАТРАТ                                    │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Secondary:                        Off-plan:                             │
│  ───────────                       ────────────                          │
│  totalCosts =                      totalCosts =                          │
│    purchasePrice                     paidAmount (!)                      │
│  + DLD                             + DLD                                 │
│  + buyerCommissionTotal            + buyerCommissionTotal                │
│  + totalRenovation                 + totalRenovation                     │
│  + carryingCosts                   + carryingCosts                       │
│  + trusteeOfficeFee                + trusteeOfficeFee                    │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         РАСЧЁТ ВЫРУЧКИ                                   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Secondary:                        Off-plan:                             │
│  ───────────                       ────────────                          │
│  netProceeds =                     netProceeds =                         │
│    sellingPrice                      sellingPrice                        │
│  - sellerCommissionTotal           - sellerCommissionTotal               │
│                                    - remainingDebt (!)                   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         МЕТРИКИ ДОХОДНОСТИ                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │  netProfit = netProceeds - totalCosts                           │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │  ROI = netProfit / totalCosts × 100%                            │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │  IRR = (netProceeds / totalCosts)^(12/months) - 1 × 100%        │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │  breakEven = totalCosts / (1 - sellerCommission% × 1.05)        │    │
│  │  (для off-plan: + remainingDebt в числителе)                    │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 8. Пример расчёта (Secondary)

### Входные данные:
```
purchasePrice    = 1,000,000 AED
dldFees          = 4%
buyerCommission  = 2%
trusteeOfficeFee = 5,000 AED
renovationBudget = 150,000 AED
contingency      = 15%
serviceCharge    = 12,000 AED/год
dewaMonthly      = 600 AED/мес
sellingPrice     = 1,400,000 AED
sellerCommission = 4%
renovationMonths = 2
listingMonths    = 3
```

### Расчёт:

**1. Сроки:**
```
monthsTotal = 2 + 3 = 5 месяцев
```

**2. Затраты на покупку:**
```
DLD = 1,000,000 × 4% = 40,000 AED
buyerCommission = 1,000,000 × 2% = 20,000 AED
buyerCommissionVAT = 20,000 × 5% = 1,000 AED
buyerCommissionTotal = 20,000 + 1,000 = 21,000 AED
```

**3. Ремонт:**
```
totalRenovation = 150,000 × (1 + 15%) = 150,000 × 1.15 = 172,500 AED
```

**4. Носимые расходы:**
```
carryingService = (12,000 / 12) × 5 = 1,000 × 5 = 5,000 AED
carryingDewa = 600 × 5 = 3,000 AED
carryingTotal = 5,000 + 3,000 = 8,000 AED
```

**5. TOTAL COSTS:**
```
totalCosts = 1,000,000 + 40,000 + 21,000 + 172,500 + 8,000 + 5,000
           = 1,246,500 AED
```

**6. Комиссии при продаже:**
```
sellerCommission = 1,400,000 × 4% = 56,000 AED
sellerCommissionVAT = 56,000 × 5% = 2,800 AED
sellerCommissionTotal = 56,000 + 2,800 = 58,800 AED
```

**7. NET PROCEEDS:**
```
netProceeds = 1,400,000 - 58,800 = 1,341,200 AED
```

**8. PROFIT:**
```
netProfit = 1,341,200 - 1,246,500 = 94,700 AED
```

**9. ROI:**
```
ROI = (94,700 / 1,246,500) × 100% = 7.6%
```

**10. IRR:**
```
MOIC = 1,341,200 / 1,246,500 = 1.076
IRR = (1.076 ^ (12/5) - 1) × 100%
    = (1.076 ^ 2.4 - 1) × 100%
    = (1.192 - 1) × 100%
    = 19.2% годовых
```

**11. Break-Even:**
```
breakEvenPrice = 1,246,500 / (1 - 4% × 1.05)
               = 1,246,500 / (1 - 0.042)
               = 1,246,500 / 0.958
               = 1,301,149 AED
```

---

## 9. Пример расчёта (Off-plan)

### Входные данные:
```
purchasePrice    = 2,000,000 AED (полная стоимость от застройщика)
paidAmount       = 700,000 AED (уже оплачено 35%)
paymentSchedule  = [
  { date: "2025-03-01", amount: 300,000 },  // milestone 1
  { date: "2025-09-01", amount: 500,000 },  // milestone 2
  { date: "2026-06-01", amount: 500,000 }   // handover
]
dldFees          = 4%
buyerCommission  = 2%
trusteeOfficeFee = 5,000 AED
renovationBudget = 200,000 AED
contingency      = 15%
serviceCharge    = 15,000 AED/год
dewaMonthly      = 800 AED/мес
sellingPrice     = 2,600,000 AED
sellerCommission = 4%
renovationMonths = 2
listingMonths    = 4
```

**Текущая дата:** 1 января 2025

### Расчёт:

**1. Сроки и дата продажи:**
```
monthsTotal = 2 + 4 = 6 месяцев
saleDate = 1 января 2025 + 6 месяцев = 1 июля 2025
```

**2. Остаток долга (платежи до даты продажи):**
```
Платёж 1: 2025-03-01 (март) ≤ 2025-07-01 → включаем: 300,000 AED
Платёж 2: 2025-09-01 (сентябрь) > 2025-07-01 → НЕ включаем
Платёж 3: 2026-06-01 (июнь 2026) > 2025-07-01 → НЕ включаем

remainingDebt = 300,000 AED
```

**3. Затраты на покупку (от полной цены!):**
```
DLD = 2,000,000 × 4% = 80,000 AED
buyerCommission = 2,000,000 × 2% = 40,000 AED
buyerCommissionVAT = 40,000 × 5% = 2,000 AED
buyerCommissionTotal = 40,000 + 2,000 = 42,000 AED
```

**4. Ремонт:**
```
totalRenovation = 200,000 × 1.15 = 230,000 AED
```

**5. Носимые расходы:**
```
carryingService = (15,000 / 12) × 6 = 7,500 AED
carryingDewa = 800 × 6 = 4,800 AED
carryingTotal = 7,500 + 4,800 = 12,300 AED
```

**6. TOTAL COSTS (используем paidAmount!):**
```
totalCosts = 700,000 + 80,000 + 42,000 + 230,000 + 12,300 + 5,000
           = 1,069,300 AED
```

**7. Комиссии при продаже:**
```
sellerCommission = 2,600,000 × 4% = 104,000 AED
sellerCommissionVAT = 104,000 × 5% = 5,200 AED
sellerCommissionTotal = 104,000 + 5,200 = 109,200 AED
```

**8. NET PROCEEDS (минус остаток долга!):**
```
netProceeds = 2,600,000 - 109,200 - 300,000 = 2,190,800 AED
```

**9. PROFIT:**
```
netProfit = 2,190,800 - 1,069,300 = 1,121,500 AED
```

**10. ROI:**
```
ROI = (1,121,500 / 1,069,300) × 100% = 104.9%
```

**11. IRR:**
```
MOIC = 2,190,800 / 1,069,300 = 2.049
IRR = (2.049 ^ (12/6) - 1) × 100%
    = (2.049 ^ 2 - 1) × 100%
    = (4.20 - 1) × 100%
    = 320% годовых
```

**12. Break-Even:**
```
breakEvenPrice = (1,069,300 + 300,000) / (1 - 4% × 1.05)
               = 1,369,300 / 0.958
               = 1,429,331 AED
```

---

## 10. Структура файлов с логикой

| Файл | Описание |
|------|----------|
| `src/calculations/core.ts` | Главные функции расчёта: `computeProject()`, `computeSensitivity()`, `validateInput()` |
| `src/calculations/types.ts` | TypeScript интерфейсы: `DealInput`, `DealOutputsProject`, `PaymentScheduleItem` |
| `src/calculations/money.ts` | Утилиты форматирования: `roundMoney()`, `fmtMoney()`, `toRate()` |
| `src/hooks/useCalculations.ts` | React-хук `useCalculations()` для интеграции с UI |
| `src/types/calculator.ts` | Интерфейсы для UI: `CalculatorParams`, `Calculations` |

---

## 11. Валидация входных данных

Калькулятор проверяет:

**Ошибки (блокируют расчёт):**
- Проценты вне диапазона 0-100%
- Отрицательные денежные значения
- Отрицательные сроки
- Нулевой общий срок сделки
- Для off-plan: отсутствие `paidAmount`

**Предупреждения (не блокируют):**
- Комиссия продавца с VAT ≥ 100%
- `paidAmount` > `purchasePrice`
- Сумма оплаченного и графика платежей > общей стоимости
- Цена продажи ниже точки безубыточности

---

## 12. Глоссарий

| Термин | Определение |
|--------|-------------|
| **AED** | Дирхам ОАЭ (валюта) |
| **DLD** | Dubai Land Department — регистрационный сбор (обычно 4%) |
| **VAT** | Value Added Tax — НДС (5% в ОАЭ) |
| **Service Charge** | Плата за обслуживание общих территорий |
| **DEWA** | Dubai Electricity and Water Authority — коммунальные услуги |
| **Trustee Office Fee** | Фиксированный сбор за оформление сделки |
| **ROI** | Return on Investment — доходность на вложенный капитал |
| **IRR** | Internal Rate of Return — внутренняя норма доходности (годовая) |
| **MOIC** | Multiple on Invested Capital — мультипликатор на вложенный капитал |
| **Break-Even** | Точка безубыточности — цена продажи с нулевой прибылью |
| **Off-plan** | Покупка недвижимости на этапе строительства |
| **Secondary** | Покупка готовой недвижимости на вторичном рынке |
| **Carrying Costs** | Расходы на содержание недвижимости в период владения |

---

*Документ создан: Декабрь 2024*
*Версия: 1.0*
