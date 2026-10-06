import { expect, Page, test } from '@playwright/test';

const ACCESS_TOKEN_KEY = 'inventory.access-token';

const allPermissions = [
  'dashboard.view',
  'product.view',
  'product.create',
  'product.update',
  'product.delete',
  'master-data.view',
  'master-data.manage',
  'supplier.view',
  'supplier.manage',
  'customer.view',
  'customer.manage',
  'inventory.view',
  'inventory.adjust',
  'inventory.transfer',
  'inventory.count',
  'inventory.count.approve',
  'purchase.view',
  'purchase.create',
  'purchase.approve',
  'purchase.receive',
  'sales.view',
  'sales.create',
  'sales.dispatch',
  'sales.return',
  'reports.view',
  'user.manage',
  'role.manage',
  'settings.manage',
  'audit.view',
] as const;

const fullAccessUser = {
  id: 'user-1',
  email: 'operator@example.com',
  name: 'Inventory Operator',
  roles: ['inventory-manager'],
  permissions: allPermissions,
};

const dashboardOnlyUser = {
  id: 'user-2',
  email: 'viewer@example.com',
  name: 'Dashboard Viewer',
  roles: ['dashboard-viewer'],
  permissions: ['dashboard.view'],
};

const dashboardSnapshot = {
  generatedAt: '2026-10-06T08:00:00.000Z',
  metrics: {
    totalProducts: 12,
    totalSkus: 12,
    totalWarehouses: 2,
    lowStockProducts: 1,
    outOfStockProducts: 0,
    pendingPurchaseOrders: 2,
    pendingReceipts: 1,
    inventoryValue: 245000,
    currencyCode: 'AED',
  },
  stockRisks: [],
  pendingPurchaseOrders: [],
  pendingReceipts: [],
  recentMovements: [],
};

async function seedSession(page: Page): Promise<void> {
  await page.addInitScript(
    ({ key, token }) => window.sessionStorage.setItem(key, token),
    { key: ACCESS_TOKEN_KEY, token: 'e2e-access-token' },
  );
}

async function mockCurrentUser(page: Page, user = fullAccessUser): Promise<void> {
  await page.route('**/api/auth/me', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(user) });
  });
}

async function mockDashboard(page: Page): Promise<void> {
  await page.route('**/api/dashboard', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(dashboardSnapshot),
    });
  });
}

test('redirects an anonymous protected route to sign in with a return URL', async ({ page }) => {
  await page.goto('/products');

  await expect(page).toHaveURL(/\/auth\/login\?returnUrl=%2Fproducts$/);
  await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible();
});

test('shows client-side validation before a sign-in request is sent', async ({ page }) => {
  let loginRequests = 0;

  await page.route('**/api/auth/login', async (route) => {
    loginRequests += 1;
    await route.abort();
  });

  await page.goto('/auth/login');
  await page.getByRole('button', { name: 'Sign in' }).click();

  await expect(page.getByText('Email is required.')).toBeVisible();
  await expect(page.getByText('Password is required.')).toBeVisible();
  expect(loginRequests).toBe(0);
});

test('signs in and renders the operational dashboard against a mocked REST boundary', async ({ page }) => {
  await page.route('**/api/auth/login', async (route) => {
    expect(route.request().postDataJSON()).toEqual({
      email: 'operator@example.com',
      password: 'correct-password',
    });

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        accessToken: 'e2e-access-token',
        user: fullAccessUser,
      }),
    });
  });
  await mockDashboard(page);

  await page.goto('/auth/login?returnUrl=%2Fdashboard');
  await page.getByLabel('Email').fill('operator@example.com');
  await page.getByLabel('Password').fill('correct-password');
  await page.getByRole('button', { name: 'Sign in' }).click();

  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
  await expect(page.getByText('Inventory Operator')).toBeVisible();
  await expect(page.getByText('12', { exact: true }).first()).toBeVisible();
});

test('restores a persisted session and blocks routes without permission', async ({ page }) => {
  await seedSession(page);
  await mockCurrentUser(page, dashboardOnlyUser);

  await page.goto('/products');

  await expect(page).toHaveURL(/\/access-denied\?from=%2Fproducts$/);
  await expect(page.getByText('403', { exact: true })).toBeVisible();
  await expect(page.getByText('Access denied', { exact: true })).toBeVisible();
});

test('mobile navigation traps focus and restores focus after Escape', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await seedSession(page);
  await mockCurrentUser(page);
  await mockDashboard(page);

  await page.goto('/dashboard');

  const openNavigation = page.getByRole('button', { name: 'Open navigation' });
  await openNavigation.click();

  const navigationDialog = page.getByRole('dialog', { name: 'Primary navigation' });
  await expect(navigationDialog).toBeVisible();
  await expect(page.getByRole('button', { name: 'Close navigation' }).last()).toBeFocused();

  await page.keyboard.press('Escape');

  await expect(navigationDialog).toBeHidden();
  await expect(openNavigation).toBeFocused();
});

test('signs out, clears the session, and protects subsequent navigation', async ({ page }) => {
  await seedSession(page);
  await mockCurrentUser(page);
  await mockDashboard(page);
  await page.route('**/api/auth/logout', async (route) => {
    await route.fulfill({ status: 204, body: '' });
  });

  await page.goto('/dashboard');
  await page.getByRole('button', { name: 'Sign out' }).click();

  await expect(page).toHaveURL(/\/auth\/login$/);

  await page.goto('/dashboard');
  await expect(page).toHaveURL(/\/auth\/login\?returnUrl=%2Fdashboard$/);
});

test('renders the authenticated not-found state inside the application shell', async ({ page }) => {
  await seedSession(page);
  await mockCurrentUser(page);

  await page.goto('/does-not-exist');

  await expect(page.getByText('404', { exact: true })).toBeVisible();
  await expect(page.getByText('Page not found', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Sign out' })).toBeVisible();
});
