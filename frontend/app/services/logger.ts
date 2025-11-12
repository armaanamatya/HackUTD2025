type LogLevel = 'silent' | 'error' | 'warn' | 'info' | 'debug'

const LOG_LEVEL: LogLevel = (process.env.NEXT_PUBLIC_LOG_LEVEL as LogLevel) || 'info'

const shouldLog = (level: LogLevel) => {
  const order: Record<LogLevel, number> = {
    silent: 0,
    error: 1,
    warn: 2,
    info: 3,
    debug: 4,
  }
  return order[level] <= order[LOG_LEVEL]
}

const timestamp = () => new Date().toISOString()

export const logger = {
  info(message: string, data?: any) {
    if (shouldLog('info')) console.log(`[FRONTEND] ${timestamp()} | INFO | ${message}`, data || '')
  },
  warn(message: string, data?: any) {
    if (shouldLog('warn')) console.warn(`[FRONTEND] ${timestamp()} | WARN | ${message}`, data || '')
  },
  error(message: string, error?: any) {
    if (shouldLog('error')) console.error(`[FRONTEND] ${timestamp()} | ERROR | ${message}`, error || '')
  },
  request(method: string, url: string, data?: any) {
    if (shouldLog('debug')) console.log(`[FRONTEND] ${timestamp()} | REQUEST | ${method} ${url}`, data ? { payload: data } : '')
  },
  response(method: string, url: string, status: number, data?: any) {
    if (shouldLog('debug')) console.log(`[FRONTEND] ${timestamp()} | RESPONSE | ${method} ${url} | Status: ${status}`, data || '')
  },
}

export default logger
