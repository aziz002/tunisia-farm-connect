// Shared domain types for FarmHub
// Keep these minimal and reusable across API, plugins, and UI

export type ID = string;

export interface User {
  id: ID;
  name: string;
  email: string;
  role: 'farmer' | 'admin' | 'viewer';
}

export interface Device {
  id: ID;
  name: string;
  type: 'sensor' | 'actuator' | 'gateway' | 'solar' | 'weather';
  location?: string;
  meta?: Record<string, unknown>;
}

export interface Metric {
  deviceId: ID;
  key: string; // e.g., "soil_moisture", "flow_rate"
  value: number;
  unit?: string;
  at: string; // ISO date
}

export interface Alert {
  id: ID;
  level: 'info' | 'warning' | 'critical';
  message: string;
  createdAt: string; // ISO date
  acknowledged?: boolean;
}

export interface MarketplaceItem {
  id: ID;
  name: string;
  description: string;
  category: string;
  price: string; // keep as display string for MVP
  rating?: number;
  downloads?: number;
}

export interface ModuleMeta {
  id: ID;
  name: string;
  description: string;
  route: string;
  icon?: string; // lucide icon name for lightweight serialization
  enabled: boolean;
  tags?: string[];
}

export interface AIInsight {
  id: ID;
  type: 'irrigation' | 'livestock' | 'market' | 'energy' | 'general';
  message: string;
  action?: string; // CTA label, e.g., "Schedule irrigation"
}
