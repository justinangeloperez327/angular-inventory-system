import { afterEach, describe, expect, it, vi } from 'vitest';

import { ToastService } from './toast.service';

describe('ToastService', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('adds and manually dismisses a toast', () => {
    const service = new ToastService();

    service.show('Saved', 'success', 0);

    expect(service.messages()).toHaveLength(1);
    expect(service.messages()[0]?.message).toBe('Saved');

    service.dismiss(service.messages()[0]!.id);

    expect(service.messages()).toEqual([]);
  });

  it('automatically dismisses timed toasts', () => {
    vi.useFakeTimers();
    const service = new ToastService();

    service.show('Updated', 'info', 4000);
    expect(service.messages()).toHaveLength(1);

    vi.advanceTimersByTime(4000);

    expect(service.messages()).toEqual([]);
  });
});
