/** 對外僅提供可維運的狀態與錯誤識別，詳細堆疊／路徑留在受限日誌。 */
export function publicErrorResponse(message: string, error: unknown, development = false, errorId = Date.now()) {
  return {
    message,
    errorId,
    success: false,
    ...(development ? { error: error instanceof Error ? error.message : String(error) } : {}),
  };
}

export function publicHealthStatus(details: Record<string, unknown>, development = false) {
  if (development) return details;
  return {
    status: typeof details.status === 'string' && ['healthy', 'degraded', 'connected', 'error'].includes(details.status)
      ? details.status : 'unknown',
    timestamp: details.timestamp,
    ...(details.database === 'connected' || details.database === 'error' ? { database: details.database } : {}),
  };
}

export function validErrorStatus(value: unknown): number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 400 && value <= 599 ? value : 500;
}
