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
  await page.goto('/auth/login');
  await page.evaluate(
    ({ key, token }) => window.sessionStorage.setItem(key, token),
    { key: ACCESS_TOKEN_KEY, token: 'e2e-access-token' },
  );
}

async function mockCurrentUser(page: Page, user = fullAccessUser): Promise<void> {
  await page.route('**/api/v1/auth/me', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(user) });
  });
}

async function mockDashboard(page: Page): Promise<void> {
  await page.route('**/api/v1/dashboard', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(dashboardSnapshot),
    });
  });
}

async function mockProducts(page: Page): Promise<void> {
  await page.route('**/api/v1/products/form-options', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        categories: [],
        units: [],
        currencyCode: 'AED',
      }),
    });
  });

  await page.route('**/api/v1/products?**', async (route) => {
    const search = new URL(route.request().url()).searchParams.get('search') ?? '';
    const name = search.toLowerCase().includes('valve')
      ? 'Isolation Valve'
      : 'High-temp Gasket';

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: [
          {
            id: 'product-1',
            sku: search.toLowerCase().includes('valve') ? 'VAL-001' : 'GSK-001',
            name,
            costPrice: 25,
            sellingPrice: 40,
            reorderLevel: 10,
            active: true,
            updatedAt: '2026-10-15T08:00:00.000Z',
          },
        ],
        pagination: {
          page: 1,
          pageSize: 25,
          totalItems: 1,
          totalPages: 1,
        },
      }),
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

  await page.route('**/api/v1/auth/login', async (route) => {
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
  await page.route('**/api/v1/auth/login', async (route) => {
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

test('opens the command palette and reapplies routed search on the current module', async ({ page }) => {
  await seedSession(page);
  await mockCurrentUser(page);
  await mockDashboard(page);
  await mockProducts(page);

  await page.goto('/dashboard');
  await page.keyboard.press('Control+k');

  const palette = page.getByRole('dialog', { name: 'Command palette' });
  const search = page.getByLabel('Search pages, records, and actions');

  await expect(palette).toBeVisible();
  await search.fill('Gasket');
  await page.getByRole('option', { name: /Search products for “Gasket”/ }).click();

  await expect(page).toHaveURL(/\/products\?search=Gasket$/);
  await expect(page.getByRole('heading', { name: 'Products' })).toBeVisible();
  await expect(page.getByLabel('Search').first()).toHaveValue('Gasket');
  await expect(page.getByText('High-temp Gasket')).toBeVisible();

  await page.keyboard.press('Control+k');
  await search.fill('Valve');
  await page.getByRole('option', { name: /Search products for “Valve”/ }).click();

  await expect(page).toHaveURL(/\/products\?search=Valve$/);
  await expect(page.getByLabel('Search').first()).toHaveValue('Valve');
  await expect(page.getByText('Isolation Valve')).toBeVisible();
});

test('persists the selected dark theme across reloads', async ({ page }) => {
  await seedSession(page);
  await mockCurrentUser(page);
  await mockDashboard(page);

  await page.goto('/dashboard');

  const darkModeButton = page.getByRole('button', { name: 'Switch to dark mode' });
  await darkModeButton.click();

  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  expect(
    await page.evaluate(() => window.localStorage.getItem('inventory-system-theme')),
  ).toBe('dark');

  await page.reload();

  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(page.getByRole('button', { name: 'Switch to light mode' })).toBeVisible();
});

test('signs out, clears the session, and protects subsequent navigation', async ({ page }) => {
  await seedSession(page);
  await mockCurrentUser(page);
  await mockDashboard(page);
  await page.route('**/api/v1/auth/logout', async (route) => {
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
