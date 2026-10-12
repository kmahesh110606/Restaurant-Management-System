import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import api from '../../client/src/api/client';
import { createOrder } from '../../client/src/api/orders';

vi.mock('../../client/src/api/client', () => ({ default: { post: vi.fn() }, getCollection: vi.fn() }));

describe('Order request retry protection', () => {
  const payload = { restaurant_slug: 'test-restaurant', items: [{ menu_item: 'dish', quantity: 1 }] };
  let saved;
  beforeEach(() => {
    vi.clearAllMocks();
    saved = new Map();
    vi.stubGlobal('sessionStorage', {
      getItem: (key) => saved.get(key) ?? null,
      setItem: (key, value) => saved.set(key, value),
      removeItem: (key) => saved.delete(key),
    });
  });
  afterEach(() => vi.unstubAllGlobals());
  it('reuses a request key after a lost response and clears it on success', async () => {
    api.post.mockRejectedValueOnce(new Error('Network unavailable')).mockResolvedValueOnce({ data: { id: 'order-1' } });
    await expect(createOrder(payload)).rejects.toThrow('Network unavailable');
    await expect(createOrder(payload)).resolves.toEqual({ data: { id: 'order-1' } });
    expect(api.post.mock.calls[0][2].headers['Idempotency-Key']).toBe(api.post.mock.calls[1][2].headers['Idempotency-Key']);
    expect(saved.size).toBe(0);
  });
  it('uses a different key when the order changes', async () => {
    api.post.mockRejectedValue(new Error('Offline'));
    await expect(createOrder(payload)).rejects.toThrow();
    await expect(createOrder({ ...payload, items: [{ menu_item: 'dish', quantity: 2 }] })).rejects.toThrow();
    expect(api.post.mock.calls[0][2].headers['Idempotency-Key']).not.toBe(api.post.mock.calls[1][2].headers['Idempotency-Key']);
  });
  it('keeps pending requests separate for each restaurant', async () => {
    api.post.mockRejectedValue(new Error('Offline'));
    await expect(createOrder(payload)).rejects.toThrow();
    await expect(createOrder({ ...payload, restaurant_slug: 'another-restaurant' })).rejects.toThrow();
    expect(saved.size).toBe(2);
    expect(api.post.mock.calls[0][2].headers['Idempotency-Key']).not.toBe(api.post.mock.calls[1][2].headers['Idempotency-Key']);
  });
});
