/* Centralized API client with typed helpers
 * - Respects VITE_API_URL if provided, otherwise falls back to /api
 * - Provides fetchJson with retries and typed result
 */

import { Alert, MarketplaceItem, Metric, ModuleMeta } from './types';

const BASE_URL = (import.meta as any).env?.VITE_API_URL || '/api';
const USE_MOCKS = ((import.meta as any).env?.VITE_USE_MOCKS ?? 'true') !== 'false';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export class ApiError extends Error {
  status: number;
  payload?: unknown;
  constructor(message: string, status: number, payload?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.payload = payload;
  }
}

async function delay(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}

export async function fetchJson<T>(
  path: string,
  options: RequestInit & { retries?: number; retryDelayMs?: number } = {}
): Promise<T> {
  const url = path.startsWith('http') ? path : `${BASE_URL}${path}`;
  const { retries = 1, retryDelayMs = 300, headers, ...rest } = options;

  const finalHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    ...(headers || {}),
  };

  let attempt = 0;
  let lastError: unknown;

  while (attempt <= retries) {
    try {
      const res = await fetch(url, { ...rest, headers: finalHeaders });
      const isJson = res.headers.get('content-type')?.includes('application/json');
      const data = isJson ? await res.json() : undefined;

      if (!res.ok) {
        throw new ApiError(`Request failed: ${res.status} ${res.statusText}`, res.status, data);
      }
      return (data as T) ?? (undefined as unknown as T);
    } catch (err) {
      lastError = err;
      attempt += 1;
      if (attempt > retries) break;
      await delay(retryDelayMs * attempt);
    }
  }
  throw lastError instanceof Error ? lastError : new Error('Unknown API error');
}

// Example typed endpoints (MVP can be served by a mock server or future backend)
const mockData = {
  metrics: [
    { deviceId: 'sensor-1', key: 'soil_moisture', value: 28, unit: '%', at: new Date().toISOString() },
    { deviceId: 'solar-1', key: 'solar_production', value: 127, unit: 'kWh', at: new Date().toISOString() },
  ] as Metric[],
  alerts: [
    { id: 'a1', level: 'warning', message: 'Soil moisture below 30% in Section B', createdAt: new Date().toISOString() },
  ] as Alert[],
  marketplace: [
    { id: 'm1', name: 'Smart Irrigation', description: 'Auto scheduling by weather', category: 'Crops & Irrigation', price: 'Free', rating: 4.8, downloads: 1200 },
  ] as MarketplaceItem[],
  modules: [
    { id: 'dashboard', name: 'Dashboard', description: 'Overview', route: '/dashboard', enabled: true },
    { id: 'smart-irrigation', name: 'Smart Irrigation', description: 'Automated schedules', route: '/smart-irrigation', enabled: true },
  ] as ModuleMeta[],
};

export const Api = {
  // Metrics
  getLatestMetrics: () =>
    USE_MOCKS ? Promise.resolve(mockData.metrics) : fetchJson<Metric[]>(`/metrics/latest`, { method: 'GET', retries: 2 }),

  // Alerts
  getAlerts: () => (USE_MOCKS ? Promise.resolve(mockData.alerts) : fetchJson<Alert[]>(`/alerts`, { method: 'GET' })),

  // Marketplace
  listMarketplace: () =>
    USE_MOCKS ? Promise.resolve(mockData.marketplace) : fetchJson<MarketplaceItem[]>(`/marketplace`, { method: 'GET' }),

  // Modules
  listModules: () => (USE_MOCKS ? Promise.resolve(mockData.modules) : fetchJson<ModuleMeta[]>(`/modules`, { method: 'GET' })),
};

// React Query helpers (optional convenience wrappers)
import { useQuery } from '@tanstack/react-query';

export function useLatestMetricsQuery() {
  return useQuery({ queryKey: ['metrics', 'latest'], queryFn: Api.getLatestMetrics });
}

export function useAlertsQuery() {
  return useQuery({ queryKey: ['alerts'], queryFn: Api.getAlerts });
}

export function useMarketplaceQuery() {
  return useQuery({ queryKey: ['marketplace'], queryFn: Api.listMarketplace });
}

export function useModulesQuery() {
  return useQuery({ queryKey: ['modules'], queryFn: Api.listModules });
}
