import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync, writeFileSync, mkdirSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, dirname, join, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { FIREBASE_PUBLIC_PAGES, injectFirebasePublicConfig, firebasePublicConfigPlugin } from './firebase-public-config.mjs';

const environment = {
  VITE_FIREBASE_API_KEY: 'test-public-key',
  VITE_FIREBASE_AUTH_DOMAIN: 'test.firebaseapp.com',
  VITE_FIREBASE_PROJECT_ID: 'test-project',
  VITE_FIREBASE_STORAGE_BUCKET: 'test.firebasestorage.app',
  VITE_FIREBASE_MESSAGING_SENDER_ID: '123',
  VITE_FIREBASE_APP_ID: 'test-app-id',
};

const configFields = {
  apiKey: 'API_KEY',
  authDomain: 'AUTH_DOMAIN',
  projectId: 'PROJECT_ID',
  storageBucket: 'STORAGE_BUCKET',
  messagingSenderId: 'MESSAGING_SENDER_ID',
  appId: 'APP_ID',
};

function parsePublicConfig(html) {
  const source = html.match(/const firebaseConfig = (\{[\s\S]*?\});/)[1];
  return Function(`return (${source});`)();
}

function assertPublicConfig(html) {
  const config = parsePublicConfig(html);
  assert.deepEqual(Object.keys(config).sort(), Object.keys(configFields).sort());
  for (const [field, name] of Object.entries(configFields)) {
    assert.equal(config[field], environment[`VITE_FIREBASE_${name}`], field);
  }
}

for (const page of FIREBASE_PUBLIC_PAGES) {
  const html = readFileSync(fileURLToPath(new URL(`../client/public/${page}`, import.meta.url)), 'utf8');
  test(`${page} 使用公開設定佔位符且完整注入`, () => {
    assert.doesNotMatch(html, /AIza[0-9A-Za-z_-]+/);
    const result = injectFirebasePublicConfig(html, environment);
    assert.doesNotMatch(result, /__FIREBASE_[A-Z_]+__/);
    assertPublicConfig(result);
  });
  test(`${page} 缺少設定時拒絕建置`, () => {
    assert.throws(() => injectFirebasePublicConfig(html, { ...environment, VITE_FIREBASE_API_KEY: '' }), /VITE_FIREBASE_API_KEY/);
  });
  test(`${page} 設定含標籤及特殊字元也不能跳出 script`, () => {
    const malicious = '</script><script>alert("x")</script>\u2028\u2029';
    const result = injectFirebasePublicConfig(html, { ...environment, VITE_FIREBASE_API_KEY: malicious });
    assert.ok(!result.includes(malicious));
    const source = result.match(/const firebaseConfig = (\{[\s\S]*?\});/)[1];
    assert.equal(Function(`return (${source});`)().apiKey, malicious);
  });
  test(`${page} 美元符號保持原值而不觸發替換語法`, () => {
    for (const value of ['$&', "$'", '$`', '$$']) {
      const result = injectFirebasePublicConfig(html, { ...environment, VITE_FIREBASE_API_KEY: value });
      const source = result.match(/const firebaseConfig = (\{[\s\S]*?\});/)[1];
      assert.equal(Function(`return (${source});`)().apiKey, value);
      assert.equal((result.match(/<\/script>/g) || []).length, (html.match(/<\/script>/g) || []).length);
    }
  });
}

test('模板缺少佔位符時拒絕，不產生半套設定', () => {
  assert.throws(() => injectFirebasePublicConfig('<html></html>', environment), /缺少佔位符/);
});

function pluginFixture(t, { command = 'build', base = '/Akai/' } = {}) {
  const root = mkdtempSync(join(tmpdir(), 'akai-public-config-test-'));
  t.after(() => {
    // 刪除前核對絕對路徑，只清理本測試建立的系統暫存資料夾。
    const absolute = resolve(root);
    assert.ok(absolute.startsWith(`${resolve(tmpdir())}${sep}`));
    assert.ok(basename(absolute).startsWith('akai-public-config-test-'));
    rmSync(absolute, { recursive: true, force: true });
  });
  const template = `<script>const firebaseConfig = {${Object.entries(configFields)
    .map(([field, name]) => `${field}: "__FIREBASE_${name}__"`).join(', ')}};</script>`;
  const publicDir = resolve(root, 'public');
  const outputDir = resolve(root, 'dist/public');
  for (const page of FIREBASE_PUBLIC_PAGES) {
    for (const folder of [publicDir, outputDir]) {
      const file = resolve(folder, page);
      mkdirSync(dirname(file), { recursive: true });
      writeFileSync(file, template);
    }
  }
  const config = {
    command, root, base, publicDir,
    build: { outDir: outputDir },
    env: { ...environment, PRIVATE_SENTINEL: 'private-marker-must-not-be-injected' },
  };
  const plugin = firebasePublicConfigPlugin();
  plugin.configResolved(config);
  let middleware;
  plugin.configureServer({ middlewares: { use(handler) { middleware = handler; } } });
  function request(url) {
    const response = {
      headers: {},
      setHeader(name, value) { this.headers[name] = value; },
      end(body) { this.body = body; },
    };
    let nextCalled = false;
    middleware({ url }, response, () => { nextCalled = true; });
    return { response, nextCalled };
  }
  return { plugin, config, template, publicDir, outputDir, request };
}

test('建置 hook 注入 3 份 public copy，保留來源且不注入非公開設定', t => {
  for (const relativeOutput of [false, true]) {
    const fixture = pluginFixture(t);
    if (relativeOutput) fixture.config.build.outDir = 'dist/public';
    fixture.plugin.closeBundle();
    for (const page of FIREBASE_PUBLIC_PAGES) {
      const html = readFileSync(resolve(fixture.outputDir, page), 'utf8');
      assertPublicConfig(html);
      assert.doesNotMatch(html, /__FIREBASE_[A-Z_]+__/);
      assert.ok(!html.includes(fixture.config.env.PRIVATE_SENTINEL));
      assert.equal(readFileSync(resolve(fixture.publicDir, page), 'utf8'), fixture.template);
    }
  }
});

test('serve 的 closeBundle 不改 public copy，也不要求建置設定', t => {
  const fixture = pluginFixture(t, { command: 'serve' });
  fixture.config.env = {};
  assert.doesNotThrow(() => fixture.plugin.closeBundle());
  for (const page of FIREBASE_PUBLIC_PAGES) {
    assert.equal(readFileSync(resolve(fixture.outputDir, page), 'utf8'), fixture.template);
  }
});

test('dev middleware 依 base 及 query 找目標頁，完整注入並禁止快取', t => {
  for (const base of ['/', '/Akai/']) {
    const fixture = pluginFixture(t, { command: 'serve', base });
    for (const page of FIREBASE_PUBLIC_PAGES) {
      const { response, nextCalled } = fixture.request(`${base}${page}?v=123`);
      assert.equal(nextCalled, false);
      assertPublicConfig(response.body);
      assert.equal(response.headers['Content-Type'], 'text/html; charset=utf-8');
      assert.equal(response.headers['Cache-Control'], 'no-store');
      assert.ok(!response.body.includes(fixture.config.env.PRIVATE_SENTINEL));
      assert.equal(readFileSync(resolve(fixture.publicDir, page), 'utf8'), fixture.template);
    }
    assert.equal(fixture.request(`${base}index.html`).nextCalled, true);
    if (base !== '/') {
      assert.equal(fixture.request(`/${FIREBASE_PUBLIC_PAGES[0]}`).nextCalled, true);
    }
  }
});

test('dev 缺少設定回 503 固定文字，build 缺少設定拒絕寫入', t => {
  const fixture = pluginFixture(t);
  fixture.config.env = {};
  const { response, nextCalled } = fixture.request(`/Akai/${FIREBASE_PUBLIC_PAGES[0]}`);
  assert.equal(nextCalled, false);
  assert.equal(response.statusCode, 503);
  assert.equal(response.headers['Content-Type'], 'text/plain; charset=utf-8');
  assert.doesNotMatch(response.body, /__FIREBASE_|private-marker/);
  assert.throws(() => fixture.plugin.closeBundle(), /Firebase 公開頁設定缺少/);
  for (const page of FIREBASE_PUBLIC_PAGES) {
    assert.equal(readFileSync(resolve(fixture.outputDir, page), 'utf8'), fixture.template);
  }
});
