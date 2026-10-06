import { describe, expect, it } from 'vitest';

import { NAVIGATION_SECTIONS } from './navigation';

describe('NAVIGATION_SECTIONS', () => {
  it('uses the operational navigation hierarchy', () => {
    expect(NAVIGATION_SECTIONS.map((section) => section.label)).toEqual([
      'Overview',
      'Inventory',
      'Purchasing',
      'Sales',
      'Management',
    ]);
  });

  it('keeps navigation routes unique', () => {
    const routes = NAVIGATION_SECTIONS.flatMap((section) =>
      section.items.map((item) => item.route),
    );

    expect(new Set(routes).size).toBe(routes.length);
  });

  it('provides an icon for every navigation item', () => {
    const items = NAVIGATION_SECTIONS.flatMap((section) => section.items);

    expect(items.every((item) => item.icon.length > 0)).toBe(true);
  });
});
