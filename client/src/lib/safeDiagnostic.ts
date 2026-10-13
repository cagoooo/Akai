/** 只清洗可辨識的秘密／個資，保留錯誤訊息、代碼及來源堆疊供既有 Sentry 管道判讀。 */
export function redactDiagnosticText(value: string): string {
  return value
    .replace(/https?:\/\/[^\s<>"']+/g, raw => {
      const suffix = raw.match(/[),.;]+$/)?.[0] ?? '';
      try {
        const url = new URL(suffix ? raw.slice(0, -suffix.length) : raw);
        // 只重組協定、主機與路徑，帳密、查詢參數與錨點不會進入診斷。
        return `${url.protocol}//${url.host}${url.pathname}${suffix}`;
      } catch { return '[無效網址]' + suffix; }
    })
    .replace(/\bAIza[A-Za-z0-9_-]{20,}\b/g, '[金鑰已遮蔽]')
    .replace(/\bya29\.[A-Za-z0-9_-]+/g, '[權杖已遮蔽]')
    .replace(/\beyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\b/g, '[權杖已遮蔽]')
    .replace(/\bBearer\s+[A-Za-z0-9._~+/-]+=*/gi, 'Bearer [已遮蔽]')
    .replace(/\b(api[_-]?key|access[_-]?token|refresh[_-]?token|id[_-]?token|authorization|password|client[_-]?secret)\b["']?\s*[:=]\s*["']?[^\s,;"')]+/gi, '$1=[已遮蔽]')
    .replace(/[A-Z0-9._%+-]{1,64}@[A-Z0-9.-]{1,255}\.[A-Z]{2,20}\b/gi, '[電子郵件已遮蔽]');
}

export function sanitizedDiagnosticError(error: unknown): unknown {
  if (!(error instanceof Error)) return typeof error === 'string' ? redactDiagnosticText(error.slice(0, 2000)) : { type: 'Error' };
  const message = redactDiagnosticText(error.message.slice(0, 2000));
  const stack = error.stack ? redactDiagnosticText(error.stack.slice(0, 10000)) : undefined;
  const name = /^[A-Za-z][A-Za-z0-9_.-]{0,79}$/.test(error.name) ? error.name : 'Error';
  const rawCode = (error as Error & { code?: unknown }).code;
  const code = typeof rawCode === 'string' && /^(?:[a-z][a-z-]{0,59}|(?:auth|functions|firestore|appCheck)\/[a-z-]{1,60}|E[A-Z_]{1,40})$/.test(rawCode) ? rawCode : undefined;
  const extraProperties = Object.getOwnPropertyNames(error).some(key => !['name', 'message', 'stack', 'code'].includes(key));
  // 一般原生錯誤維持原物件，避免影響既有例外辨識與網路雜訊篩選。
  if (message === error.message && stack === error.stack && name === error.name && !extraProperties && code === rawCode) return error;
  const clean = new Error(message) as Error & { code?: string };
  clean.name = name;
  clean.stack = stack;
  if (code) clean.code = code;
  return clean;
}

export function safeDiagnostic(label: string, error: unknown, level: 'warn' | 'error' = 'warn'): void {
  // 仍走原本 console → Sentry 整合，不另送 captureException 造成重複事件。
  console[level](label, sanitizedDiagnosticError(error));
}
