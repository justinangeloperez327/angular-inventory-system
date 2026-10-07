import { expect, test } from '@playwright/test';

const adminEmail =
  process.env['FULL_STACK_ADMIN_EMAIL'] ??
  'integration-admin@example.com';
const adminPassword =
  process.env['FULL_STACK_ADMIN_PASSWORD'] ??
  'Integration-Admin-Password-123!';

const viewerPassword =
  'Integration-Viewer-Password-123!';

async function signIn(
  page: import('@playwright/test').Page,
  email: string,
  password: string,
): Promise<void> {
  await page.goto('/auth/login');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(
    page.getByRole('heading', { name: 'Dashboard' }),
  ).toBeVisible();
}

test.describe.serial('production frontend + pinned NestJS integration', () => {
  test('proxies the live backend readiness endpoint through Nginx', async ({
    request,
  }) => {
    const response = await request.get('/api/v1/health/ready');

    expect(response.status()).toBe(200);
    await expect(response).toBeOK();

    const body = await response.json();
    expect(body.status).toBe('ok');
    expect(body.database).toBe('up');
  });

  test('authenticates, restores the session, and enforces authorization end to end', async ({
    page,
    request,
  }) => {
    await signIn(page, adminEmail, adminPassword);

    await expect(page.getByText('Integration Administrator')).toBeVisible();

    const adminAccessToken = await page.evaluate(() =>
      window.sessionStorage.getItem('inventory.access-token'),
    );

    expect(adminAccessToken).toBeTruthy();

    await page.reload();

    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(page.getByText('Integration Administrator')).toBeVisible();

    const rolesResponse = await request.get(
      '/api/v1/administration/roles',
      {
        headers: {
          Authorization: `Bearer ${adminAccessToken}`,
        },
      },
    );

    expect(rolesResponse.status()).toBe(200);

    const rolesBody = await rolesResponse.json();
    const viewerRole = rolesBody.find(
      (role: { id: string; name: string }) =>
        role.name === 'Viewer',
    );

    if (!viewerRole?.id) {
      throw new Error(
        'Seeded Viewer role is missing from the administration contract.',
      );
    }

    const viewerEmail =
      `integration-viewer-${Date.now()}@example.com`;

    const createViewerResponse = await request.post('/api/v1/users', {
      headers: {
        Authorization: `Bearer ${adminAccessToken}`,
      },
      data: {
        email: viewerEmail,
        password: viewerPassword,
        firstName: 'Integration',
        lastName: 'Viewer',
        roleIds: [viewerRole.id],
      },
    });

    expect(createViewerResponse.status()).toBe(201);

    await page.getByRole('button', { name: 'Sign out' }).click();
    await expect(page).toHaveURL(/\/auth\/login$/);

    await signIn(page, viewerEmail, viewerPassword);

    const viewerAccessToken = await page.evaluate(() =>
      window.sessionStorage.getItem('inventory.access-token'),
    );

    expect(viewerAccessToken).toBeTruthy();

    const allowedDashboardResponse = await request.get(
      '/api/v1/dashboard',
      {
        headers: {
          Authorization: `Bearer ${viewerAccessToken}`,
        },
      },
    );

    expect(allowedDashboardResponse.status()).toBe(200);

    const deniedRolesResponse = await request.get(
      '/api/v1/administration/roles',
      {
        headers: {
          Authorization: `Bearer ${viewerAccessToken}`,
        },
      },
    );

    expect(deniedRolesResponse.status()).toBe(403);

    await page.goto('/administration/roles');

    await expect(page).toHaveURL(
      /\/access-denied\?from=%2Fadministration%2Froles$/,
    );
    await expect(
      page.getByText('Access denied', { exact: true }),
    ).toBeVisible();

    await page.getByRole('button', { name: 'Sign out' }).click();
    await page.goto('/dashboard');

    await expect(page).toHaveURL(
      /\/auth\/login\?returnUrl=%2Fdashboard$/,
    );
  });
});
