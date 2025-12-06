import { test, expect } from '@playwright/test';

/**
 * E2E тесты публичных страниц (SPA)
 * baseURL уже содержит /Investment_calculator
 */
test.describe('Публичные страницы', () => {
    test('страница логина загружается', async ({ page }) => {
        await page.goto('./login');
        // Ждём появления body
        await expect(page.locator('body')).toBeVisible();
    });

    test('страница сброса пароля загружается', async ({ page }) => {
        await page.goto('./reset-password');
        await expect(page.locator('body')).toBeVisible();
    });

    test('корень редиректит на логин', async ({ page }) => {
        await page.goto('./');
        // SPA редиректит на /login
        await expect(page).toHaveURL(/login/);
    });
});
