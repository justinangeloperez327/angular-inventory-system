import { describe, expect, it } from 'vitest';

import { toHttpParams } from './http-query-params';

describe('toHttpParams', () => {
  it('omits empty values and preserves primitives', () => {
    const params = toHttpParams({
      search: '',
      warehouseId: undefined,
      page: 2,
      active: false,
      sort: 'name',
    });

    expect(params.get('search')).toBeNull();
    expect(params.get('warehouseId')).toBeNull();
    expect(params.get('page')).toBe('2');
    expect(params.get('active')).toBe('false');
    expect(params.get('sort')).toBe('name');
  });

  it('appends array values using the same key', () => {
    const params = toHttpParams({ status: ['draft', 'posted'] });

    expect(params.getAll('status')).toEqual(['draft', 'posted']);
  });
});
