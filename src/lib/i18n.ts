// Minimal i18n stub; can be replaced with i18next later.
const dict: Record<string, string> = {
  'cta.getStarted': 'Get started',
};

export function t(key: string, fallback?: string) {
  return dict[key] || fallback || key;
}
