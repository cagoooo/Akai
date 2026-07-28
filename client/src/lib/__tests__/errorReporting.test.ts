import { afterEach, describe, expect, it, vi } from 'vitest';
import { shouldReportErrorToFirestore } from '../errorReporting';

function setHostname(hostname: string) {
  vi.stubGlobal('location', { ...window.location, hostname });
}

describe('shouldReportErrorToFirestore', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it('vite dev 模式一律不寫進正式 errorLogs', () => {
    vi.stubEnv('DEV', true);
    setHostname('cagoooo.github.io');
    expect(shouldReportErrorToFirestore()).toBe(false);
  });

  it.each(['localhost', '127.0.0.1', '::1', '0.0.0.0', 'akai.local', 'app.localhost'])(
    '本機 hostname %s 不寫進正式 errorLogs',
    (hostname) => {
      vi.stubEnv('DEV', false);
      setHostname(hostname);
      expect(shouldReportErrorToFirestore()).toBe(false);
    },
  );

  it('正式站照常回報', () => {
    vi.stubEnv('DEV', false);
    setHostname('cagoooo.github.io');
    expect(shouldReportErrorToFirestore()).toBe(true);
  });
});
