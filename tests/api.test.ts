import { describe, it, expect, vi, afterEach } from 'vitest';
import { fetchJson, ApiError } from '@/lib/api';

describe('fetchJson', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns parsed JSON on success', async () => {
    const payload = { ok: true };
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(new Response(JSON.stringify(payload), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }) as any);

    const res = await fetchJson<typeof payload>('/test', { method: 'GET', retries: 0 });
    expect(res).toEqual(payload);
  });

  it('throws ApiError on non-2xx', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(new Response(JSON.stringify({ error: 'bad' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    }) as any);

    await expect(fetchJson('/test', { method: 'GET', retries: 0 })).rejects.toBeInstanceOf(Error);
  });
});
