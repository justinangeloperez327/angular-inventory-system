import { expect, test } from '@playwright/test';

test.describe('deployed production origin', () => {
  test('boots the production Angular application on the real origin', async ({
    page,
  }) => {
    const pageErrors: string[] = [];

    page.on('pageerror', (error) => {
      pageErrors.push(
        `${error.name}: ${error.message}`,
      );
    });

    const response = await page.goto(
      '/auth/login',
      {
        waitUntil: 'networkidle',
      },
    );

    expect(response?.status()).toBe(200);
    await expect(
      page.getByRole('heading', {
        name: 'Sign in',
      }),
    ).toBeVisible();
    await expect(
      page.getByLabel('Email'),
    ).toBeVisible();
    await expect(
      page.getByLabel('Password'),
    ).toBeVisible();

    expect(pageErrors).toEqual([]);
  });

  test('deep links execute Angular routing instead of returning a platform 404', async ({
    page,
  }) => {
    const response = await page.goto(
      '/products',
      {
        waitUntil: 'networkidle',
      },
    );

    expect(response?.status()).toBe(200);
    await expect(page).toHaveURL(
      /\/auth\/login\?returnUrl=%2Fproducts$/,
    );
    await expect(
      page.getByRole('heading', {
        name: 'Sign in',
      }),
    ).toBeVisible();
  });
});
