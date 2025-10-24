import { create } from 'zustand';

type UIActionType = 'openAddSensor' | 'openAddSection' | 'openScheduleEditor';
export interface UIAction { id: number; type: UIActionType; payload?: any }

interface UIState {
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  // Cross-app UI action bus
  actionSeq: number;
  lastAction?: UIAction;
  dispatchAction: (type: UIActionType, payload?: any) => void;
  clearAction: () => void;
}

interface PluginState {
  enabledModules: Record<string, boolean>;
  setModuleEnabled: (id: string, enabled: boolean) => void;
  pinnedModules: Record<string, boolean>;
  togglePinned: (id: string) => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarCollapsed: false,
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  actionSeq: 0,
  lastAction: undefined,
  dispatchAction: (type, payload) =>
    set((s) => ({ actionSeq: s.actionSeq + 1, lastAction: { id: s.actionSeq + 1, type, payload } })),
  clearAction: () => set(() => ({ lastAction: undefined })),
}));

export const usePluginStore = create<PluginState>((set) => ({
  enabledModules: {},
  setModuleEnabled: (id, enabled) => set((s) => ({ enabledModules: { ...s.enabledModules, [id]: enabled } })),
  pinnedModules: (typeof window !== 'undefined' && JSON.parse(localStorage.getItem('fh_pins') || '{}')) || {},
  togglePinned: (id) =>
    set((s) => {
      const next = { ...s.pinnedModules, [id]: !s.pinnedModules[id] };
      if (typeof window !== 'undefined') localStorage.setItem('fh_pins', JSON.stringify(next));
      return { pinnedModules: next };
    }),
}));

// App settings: theme and language
type ThemeMode = 'light' | 'dark';
type Lang = 'en' | 'ar';

interface SettingsState {
  theme: ThemeMode;
  lang: Lang;
  setTheme: (t: ThemeMode) => void;
  setLang: (l: Lang) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  theme: (typeof window !== 'undefined' && (localStorage.getItem('theme') as ThemeMode)) || 'light',
  lang: (typeof window !== 'undefined' && (localStorage.getItem('lang') as Lang)) || 'en',
  setTheme: (t) => {
    if (typeof window !== 'undefined') localStorage.setItem('theme', t);
    set({ theme: t });
  },
  setLang: (l) => {
    if (typeof window !== 'undefined') localStorage.setItem('lang', l);
    set({ lang: l });
  },
}));
