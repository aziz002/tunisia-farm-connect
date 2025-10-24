import { lazy } from 'react';
import type { ModuleMeta } from './types';

// Registry of built-in modules; third-party can be merged at runtime.
// Use React.lazy for route-level code splitting.
export const builtInModules: (ModuleMeta & { component: React.LazyExoticComponent<any> })[] = [
  {
    id: 'dashboard',
    name: 'Dashboard',
    description: 'Your unified farm overview',
    route: '/dashboard',
    icon: 'LayoutDashboard',
    enabled: true,
    component: lazy(() => import('@/pages/Dashboard')),
  },
  {
    id: 'smart-irrigation',
    name: 'Smart Irrigation',
    description: 'Automated schedules and sensor-driven control',
    route: '/smart-irrigation',
    icon: 'Droplets',
    enabled: true,
    component: lazy(() => import('@/pages/SmartIrrigation')),
  },
  {
    id: 'livestock',
    name: 'Livestock',
    description: 'Health, feed, and vaccination schedules',
    route: '/livestock',
    icon: 'Beef',
    enabled: true,
    component: lazy(() => import('@/pages/Livestock')),
  },
  {
    id: 'marketplace',
    name: 'Marketplace',
    description: 'Extend FarmHub with community tools',
    route: '/marketplace',
    icon: 'Store',
    enabled: true,
    component: lazy(() => import('@/pages/Marketplace')),
  },
  {
    id: 'my-plugins',
    name: 'My Tools',
    description: 'Manage installed tools',
    route: '/my-plugins',
    icon: 'Puzzle',
    enabled: true,
    component: lazy(() => import('@/pages/MyPlugins')),
  },
];

export type ModuleRegistry = typeof builtInModules;
