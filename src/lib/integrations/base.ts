// Generic device integration interfaces
import type { Device, Metric } from '@/lib/types';

export interface DeviceAdapter {
  id: string;
  name: string;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  onMetric(cb: (metric: Metric) => void): void; // subscribe to metric events
  listDevices?(): Promise<Device[]>;
}
