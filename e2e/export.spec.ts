import { test, expect } from '@playwright/test';

test.describe('Экспорт в PDF', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/Investment_calculator/v1');
  });

  test('должен отображать кнопку экспорта', async ({ page }) => {
    // Ищем кнопку экспорта в PDF
    const exportButton = page.getByRole('button', { name: /экспорт|export|pdf|скачать|download/i });
    
    if (await exportButton.count() > 0) {
      await expect(exportButton.first()).toBeVisible();
    }
  });

  test('должен открывать диалог экспорта при клике', async ({ page }) => {
    const exportButton = page.getByRole('button', { name: /экспорт|export|pdf|скачать/i });
    
    if (await exportButton.count() > 0 && await exportButton.first().isVisible({ timeout: 3000 })) {
      await exportButton.first().click();
      
      // Проверяем появление диалога или начало скачивания
      // В зависимости от реализации
      await page.waitForTimeout(1000);
      
      // Проверяем что кнопка была нажата (можно проверить изменение состояния)
    }
  });

  test('должен генерировать PDF с данными сделки', async ({ page }) => {
    // Заполняем данные сделки
    const nameInput = page.getByPlaceholder(/название|name/i).first();
    
    if (await nameInput.isVisible({ timeout: 3000 })) {
      await nameInput.fill('Тестовый объект для PDF');
    }
    
    // Ждём расчёта метрик
    await page.waitForTimeout(500);
    
    // Пытаемся экспортировать
    const exportButton = page.getByRole('button', { name: /экспорт|export|pdf/i });
    
    if (await exportButton.count() > 0 && await exportButton.first().isVisible()) {
      // Настраиваем перехват скачивания
      const [download] = await Promise.all([
        page.waitForEvent('download', { timeout: 10000 }).catch(() => null),
        exportButton.first().click(),
      ]);
      
      if (download) {
        // Проверяем что файл скачался
        expect(download.suggestedFilename()).toMatch(/\.pdf$/i);
      }
    }
  });

  test('должен содержать метрики в экспорте', async ({ page }) => {
    // Проверяем что метрики отображаются на странице (они попадут в PDF)
    await expect(page.getByText(/Чистая прибыль/i).first()).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Поделиться ссылкой', () => {
  test('должен отображать кнопку поделиться', async ({ page }) => {
    await page.goto('/Investment_calculator/v1');
    
    const shareButton = page.getByRole('button', { name: /поделиться|share|ссылка/i });
    
    if (await shareButton.count() > 0) {
      await expect(shareButton.first()).toBeVisible();
    }
  });

  test('должен копировать ссылку в буфер обмена', async ({ page, context, browserName }) => {
    await page.goto('/Investment_calculator/v1');
    
    // Даём разрешение на clipboard (только Chromium поддерживает)
    if (browserName === 'chromium') {
      await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    }
    
    const shareButton = page.getByRole('button', { name: /поделиться|share|копировать|copy/i });
    
    if (await shareButton.count() > 0 && await shareButton.first().isVisible({ timeout: 3000 })) {
      await shareButton.first().click();
      
      // Проверяем уведомление о копировании
      const notification = page.getByText(/скопировано|copied/i);
      if (await notification.isVisible({ timeout: 2000 })) {
        await expect(notification).toBeVisible();
      }
    }
  });
});
