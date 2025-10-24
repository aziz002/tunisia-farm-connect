import { describe, it, expect } from 'vitest';
import { mockAssistant } from '@/lib/aiAssistant';
import { builtInModules } from '@/lib/plugins';

describe('mockAssistant', () => {
  it('recommends smart irrigation when soil is dry', async () => {
    const metrics = [{ deviceId: '1', key: 'soil_moisture', value: 25, at: new Date().toISOString() }];
    const mods = builtInModules.map(({ component, ...m }) => m);
    const recs = await mockAssistant.recommendModules(metrics as any, mods);
    expect(recs.some((r) => r.id === 'smart-irrigation')).toBe(true);
  });
});
