interface ChunkRecoveryStorage {
  readonly length: number;
  key(index: number): string | null;
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

const RECOVERY_PREFIX = 'akai-chunk-recovery:v2';
const MAX_RECOVERIES_PER_BUILD = 2;
const BUILD_ID = String(
  import.meta.env.VITE_APP_CACHE_VERSION ||
  import.meta.env.VITE_APP_GIT_HASH ||
  import.meta.env.VITE_APP_VERSION ||
  'unknown',
);

function hash(value: string): string {
  let result = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    result ^= value.charCodeAt(index);
    result = Math.imul(result, 16777619);
  }
  return (result >>> 0).toString(16);
}

function getFailureIdentity(reason: string): string {
  const candidate = reason.match(/https?:\/\/[^\s"'<>]+/i)?.[0]?.replace(/[),.;]+$/, '');
  if (!candidate) return reason.trim().replace(/\s+/g, ' ').slice(0, 256) || 'unknown';

  try {
    const url = new URL(candidate);
    // Ignore query strings so retries of one hashed asset share the same guard.
    return `${url.origin}${url.pathname}`;
  } catch {
    return candidate;
  }
}

/** Creates a per-build, per-module recovery gate; a page can start only one reload at a time. */
export function createChunkRecoveryGate(
  storage: ChunkRecoveryStorage,
  buildId: string,
  maxRecoveries = MAX_RECOVERIES_PER_BUILD,
) {
  const prefix = `${RECOVERY_PREFIX}:${hash(buildId)}:`;
  let recoveryStarted = false;

  return (reason: string): boolean => {
    if (recoveryStarted) return false;

    const key = `${prefix}${hash(getFailureIdentity(reason))}`;
    try {
      if (storage.getItem(key) === '1') return false;

      let attempts = 0;
      for (let index = 0; index < storage.length; index += 1) {
        if (storage.key(index)?.startsWith(prefix)) attempts += 1;
      }
      if (attempts >= maxRecoveries) return false;

      storage.setItem(key, '1');
      recoveryStarted = true;
      return true;
    } catch {
      // Without durable session state a reload loop cannot be ruled out; let the error UI offer manual reload.
      return false;
    }
  };
}

function createSessionGate() {
  if (typeof window === 'undefined') return null;
  try {
    return createChunkRecoveryGate(window.sessionStorage, BUILD_ID);
  } catch {
    return null;
  }
}

const sessionGate = createSessionGate();

export function tryBeginChunkRecovery(reason: string): boolean {
  return sessionGate?.(reason) ?? false;
}
