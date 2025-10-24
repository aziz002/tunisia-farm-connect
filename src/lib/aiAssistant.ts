import type { AIInsight, Metric, ModuleMeta } from './types';

export interface AIAssistant {
  summarizeFarmData(metrics: Metric[]): Promise<string>;
  recommendModules(metrics: Metric[], available: ModuleMeta[]): Promise<ModuleMeta[]>;
  generateAlerts(metrics: Metric[]): Promise<AIInsight[]>;
}

function randomId() {
  return Math.random().toString(36).slice(2, 10);
}

export const mockAssistant: AIAssistant = {
  async summarizeFarmData(metrics) {
    const byKey: Record<string, number[]> = {};
    metrics.forEach((m) => {
      byKey[m.key] ||= [];
      byKey[m.key].push(m.value);
    });
    const parts = Object.entries(byKey).map(([k, arr]) => {
      const avg = arr.reduce((a, b) => a + b, 0) / arr.length;
      return `${k} avg ${avg.toFixed(1)}`;
    });
    return parts.length ? `Summary: ${parts.join(', ')}` : 'No metrics yet.';
  },

  async recommendModules(metrics, available) {
    const hasLowMoisture = metrics.some((m) => m.key === 'soil_moisture' && m.value < 30);
    const hasLivestock = metrics.some((m) => m.key.includes('livestock'));
    const recs: string[] = [];
    if (hasLowMoisture) recs.push('smart-irrigation');
    if (hasLivestock) recs.push('livestock');
    return available.filter((m) => recs.includes(m.id));
  },

  async generateAlerts(metrics) {
    const alerts: AIInsight[] = [];
    if (metrics.some((m) => m.key === 'soil_moisture' && m.value < 30)) {
      alerts.push({ id: randomId(), type: 'irrigation', message: 'Soil moisture below 30% in Section B. Recommend 40 min at 14:30.', action: 'Schedule irrigation' });
    }
    if (metrics.some((m) => m.key === 'solar_production' && m.value < 50)) {
      alerts.push({ id: randomId(), type: 'energy', message: 'Solar output is unusually low today. Check inverter and panels.', action: 'Open solar module' });
    }
    return alerts;
  },
};
