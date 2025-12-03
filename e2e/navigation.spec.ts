import { test, expect } from '@playwright/test';

test.describe('Навигация', () => {
  test('должна отображать главную страницу', async ({ page }) => {
    await page.goto('/Investment_calculator/');
    
    // Проверяем заголовок
    await expect(page).toHaveTitle(/Investment Calculator|Flip Calculator/);
    
    // Проверяем наличие кнопки перехода к калькулятору
    const calcButton = page.getByRole('link', { name: /калькулятор|calculator|начать/i });
    await expect(calcButton).toBeVisible();
  });
  
  test('должна переходить на страницу калькулятора', async ({ page }) => {
    await page.goto('/Investment_calculator/');
    
    // Кликаем на ссылку калькулятора
    const calcLink = page.getByRole('link', { name: /калькулятор|calculator|начать/i });
    await calcLink.click();
    
    // Проверяем что мы на странице калькулятора
    await expect(page).toHaveURL(/v1/);
  });
  
  test('должна отображать страницу калькулятора напрямую', async ({ page }) => {
    await page.goto('/Investment_calculator/v1');
    
    // Проверяем наличие основных элементов калькулятора
    // Используем first() для избежания strict mode violation
    await expect(page.getByText(/Информация об объекте/i).first()).toBeVisible();
  });
});
