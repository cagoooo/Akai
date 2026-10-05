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

/** Browser and bundler wording for a hashed chunk that another build has already replaced. */
export const CHUNK_LOAD_ERROR_PATTERNS: readonly RegExp[] = [
  /Failed to fetch dynamically imported module/i, // Chromium
  /error loading dynamically imported module/i, // Firefox
  /Importing a module script failed/i, // Safari
  /Unable to preload CSS/i, // Vite CSS preload helper
  /ChunkLoadError|Loading (?:CSS )?chunk [\w-]+ failed/i, // webpack-style loaders
];

export function isChunkLoadError(text: string | null | undefined): boolean {
  return !!text && CHUNK_LOAD_ERROR_PATTERNS.some((pattern) => pattern.test(text));
}

function hash(value: string): string {
  let result = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    result ^= value.charCodeAt(index);
    result = Math.imul(result, 16777619);
  }
  return (result >>> 0).toString(16);
}

function getFailureIdentity(reason: string): string {
  // Vite reports CSS preload failures with a root-relative path; resource errors carry the absolute URL.
  const candidate = (
    reason.match(/https?:\/\/[^\s"'<>]+/i)?.[0] ??
    reason.match(/\/[^\s"'<>]*\/assets\/[^\s"'<>]+/)?.[0]
  )?.replace(/[),.;]+$/, '');
  if (!candidate) return reason.trim().replace(/\s+/g, ' ').slice(0, 256) || 'unknown';

  try {
    // sessionStorage is already per origin; ignore query strings so retries of one hashed asset share the same guard.
    return new URL(candidate, 'https://chunk-recovery.invalid').pathname;
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

/** Same-origin JS/CSS emitted by Vite under `assets/`; third-party files never trigger a reload. */
export function isAppAssetUrl(url: string, origin: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.origin === origin && /\/assets\/.+\.(?:m?js|css)$/.test(parsed.pathname);
  } catch {
    return false;
  }
}

function getFailedAssetUrl(target: EventTarget | null): string {
  if (target instanceof HTMLScriptElement) return target.src;
  if (target instanceof HTMLLinkElement) return target.href;
  return '';
}

interface StaleChunkRecoveryOptions {
  target?: Window;
  origin?: string;
  beginRecovery?: (reason: string) => boolean;
  reload?: () => void;
}

/**
 * Listens before React mounts, sharing the recovery gate with App and ErrorBoundary.
 * Caches and the Service Worker stay intact: HTML is Network First, so a plain reload fetches the new entry.
 */
export function installStaleChunkRecovery({
  target = window,
  origin = window.location.origin,
  beginRecovery = tryBeginChunkRecovery,
  reload = () => window.location.reload(),
}: StaleChunkRecoveryOptions = {}): () => void {
  const recover = (reason: string) => {
    if (!beginRecovery(reason)) return;
    // Expected flow: captureConsoleIntegration turns console.warn/error into Sentry alerts, so stay at info.
    console.info('[self-heal] 🛟 偵測到 stale chunk，保留快取並重新載入。reason:', reason);
    reload();
  };

  const onRejection = (event: PromiseRejectionEvent) => {
    const message = String(event.reason?.message || event.reason || '');
    if (!isChunkLoadError(message)) return;
    event.preventDefault();
    recover(message);
  };

  // <script>/<link> load failures do not bubble; only a capture listener on window sees them.
  const onResourceError = (event: Event) => {
    const url = getFailedAssetUrl(event.target);
    if (url && isAppAssetUrl(url, origin)) recover(url);
  };

  target.addEventListener('unhandledrejection', onRejection);
  target.addEventListener('error', onResourceError, true);
  return () => {
    target.removeEventListener('unhandledrejection', onRejection);
    target.removeEventListener('error', onResourceError, true);
  };
}

/** Builds before v3.6.134 reloaded to `?_heal=<timestamp>`; drop it so the URL is not bookmarked or shared. */
export function removeLegacyHealParam(target: Window = window): void {
  const url = new URL(target.location.href);
  if (!url.searchParams.has('_heal')) return;
  url.searchParams.delete('_heal');
  target.history.replaceState(target.history.state, '', url);
}
