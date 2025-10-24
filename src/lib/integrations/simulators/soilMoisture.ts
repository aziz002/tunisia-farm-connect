import type { DeviceAdapter } from '../base';
import type { Metric } from '@/lib/types';

export class SoilMoistureSimulator implements DeviceAdapter {
  id = 'sim-soil-moisture';
  name = 'Soil Moisture Simulator';
  private timer?: number;
  private listeners: ((m: Metric) => void)[] = [];

  async connect() {
    // Emit a metric every 3 seconds
    this.timer = window.setInterval(() => {
      const moisture = 20 + Math.random() * 40; // 20%..60%
      const metric: Metric = {
        deviceId: 'sensor-1',
        key: 'soil_moisture',
        value: Number(moisture.toFixed(1)),
        unit: '%',
        at: new Date().toISOString(),
      };
      this.listeners.forEach((cb) => cb(metric));
    }, 3000);
  }

  async disconnect() {
    if (this.timer) window.clearInterval(this.timer);
  }

  onMetric(cb: (metric: Metric) => void) {
    this.listeners.push(cb);
  }
}
