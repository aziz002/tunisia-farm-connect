type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const levelOrder: Record<LogLevel, number> = { debug: 10, info: 20, warn: 30, error: 40 };
const envLevel = (import.meta as any).env?.VITE_LOG_LEVEL as LogLevel | undefined;
const currentLevel: LogLevel = envLevel || 'info';

export const logger = {
  log(level: LogLevel, message: string, meta?: unknown) {
    if (levelOrder[level] < levelOrder[currentLevel]) return;
    const payload = meta ? [message, meta] : [message];
    // eslint-disable-next-line no-console
    (console as any)[level === 'debug' ? 'log' : level](...payload);
  },
  debug: (m: string, meta?: unknown) => logger.log('debug', m, meta),
  info: (m: string, meta?: unknown) => logger.log('info', m, meta),
  warn: (m: string, meta?: unknown) => logger.log('warn', m, meta),
  error: (m: string, meta?: unknown) => logger.log('error', m, meta),
};
