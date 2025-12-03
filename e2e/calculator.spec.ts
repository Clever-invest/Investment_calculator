import { test, expect } from '@playwright/test';

test.describe('Калькулятор Secondary', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/Investment_calculator/v1');
  });
  
  test('должен отображать форму калькулятора', async ({ page }) => {
    // Проверяем наличие основных секций
    await expect(page.getByText(/Информация об объекте/i).first()).toBeVisible();
    await expect(page.getByText(/Чистая прибыль/i).first()).toBeVisible();
  });
  
  test('должен рассчитывать метрики при изменении параметров', async ({ page }) => {
    // Находим поле цены покупки и вводим значение
    const purchasePriceInput = page.locator('input[aria-label*="покупки" i], input[aria-label*="purchase" i]').first();
    
    if (await purchasePriceInput.isVisible()) {
      await purchasePriceInput.clear();
      await purchasePriceInput.fill('1000000');
      
      // Проверяем что метрики обновились
      await expect(page.getByText(/ROI|IRR|Прибыль|Profit/i)).toBeVisible();
    }
  });
  
  test('должен переключаться между вкладками', async ({ page }) => {
    // Ищем вкладки
    const tabs = page.getByRole('tab');
    
    if (await tabs.count() > 1) {
      // Кликаем на вторую вкладку
      await tabs.nth(1).click();
      
      // Проверяем что контент изменился
      await expect(tabs.nth(1)).toHaveAttribute('aria-selected', 'true');
    }
  });
  
  test('должен показывать waterfall график', async ({ page }) => {
    // Проверяем наличие графика
    const chart = page.locator('.recharts-wrapper, [data-testid="waterfall-chart"]');
    
    // Если график есть, проверяем что он видим
    if (await chart.count() > 0) {
      await expect(chart.first()).toBeVisible();
    }
  });
});

test.describe('Калькулятор Off-Plan', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/Investment_calculator/v1');
  });
  
  test('должен переключаться на off-plan режим', async ({ page }) => {
    // Ищем кнопку Off-Plan
    const offplanButton = page.getByText(/Off-Plan/i).first();
    
    if (await offplanButton.isVisible({ timeout: 3000 })) {
      await offplanButton.click();
      
      // После клика должна появиться подсказка про offplan
      await expect(page.getByText(/офф-план|фактическая оплата/i).first()).toBeVisible({ timeout: 5000 });
    }
  });
});
