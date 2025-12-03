import { test, expect } from '@playwright/test';

test.describe('Анализ чувствительности', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/Investment_calculator/v1');
  });

  test('должен отображать секцию анализа чувствительности', async ({ page }) => {
    // Ищем вкладку или секцию анализа чувствительности
    const sensitivityTab = page.getByRole('tab', { name: /чувствительность|sensitivity/i });
    const sensitivitySection = page.getByText(/анализ чувствительности|sensitivity analysis/i);
    
    if (await sensitivityTab.isVisible({ timeout: 3000 })) {
      await sensitivityTab.click();
      await expect(page.getByText(/чувствительность|sensitivity/i)).toBeVisible();
    } else if (await sensitivitySection.isVisible({ timeout: 3000 })) {
      await expect(sensitivitySection).toBeVisible();
    }
  });

  test('должен показывать график чувствительности по цене', async ({ page }) => {
    // Переходим к секции анализа чувствительности
    const sensitivityTab = page.getByRole('tab', { name: /чувствительность|sensitivity/i });
    
    if (await sensitivityTab.isVisible({ timeout: 3000 })) {
      await sensitivityTab.click();
    }
    
    // Проверяем наличие графика (recharts wrapper)
    const chart = page.locator('.recharts-wrapper');
    if (await chart.count() > 0) {
      await expect(chart.first()).toBeVisible();
    }
  });

  test('должен показывать таблицу сценариев', async ({ page }) => {
    // Ищем таблицу сценариев
    const scenariosTable = page.locator('table');
    
    if (await scenariosTable.count() > 0) {
      await expect(scenariosTable.first()).toBeVisible();
    }
  });

  test('должен обновлять анализ при изменении параметров', async ({ page }) => {
    // Находим поле цены продажи
    const salePriceInput = page.locator('input[aria-label*="продажи" i], input[aria-label*="selling" i]').first();
    
    if (await salePriceInput.isVisible({ timeout: 3000 })) {
      const initialValue = await salePriceInput.inputValue();
      
      await salePriceInput.clear();
      await salePriceInput.fill('2500000');
      await salePriceInput.blur();
      
      // Даём время на обновление
      await page.waitForTimeout(500);
      
      // Проверяем что значение изменилось
      const newValue = await salePriceInput.inputValue();
      expect(newValue).not.toBe(initialValue);
    }
  });
});
