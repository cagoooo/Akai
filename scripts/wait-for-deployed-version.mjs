import { appendFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

export function matchesDeployment(version, expectedSha) {
  return typeof version?.gitHash === 'string'
    && /^[a-f0-9]{7,40}$/i.test(version.gitHash)
    && expectedSha.toLowerCase().startsWith(version.gitHash.toLowerCase());
}

export async function waitForDeployment({ expectedSha, siteUrl, maxWaitMs = 600000, pollMs = 15000 }) {
  if (!/^[a-f0-9]{40}$/i.test(expectedSha || '')) throw new Error('必須指定完整部署 SHA');
  const deadline = Date.now() + maxWaitMs;
  do {
    try {
      const url = new URL('version.json', siteUrl);
      url.searchParams.set('quality-check', `${expectedSha}-${Date.now()}`);
      const response = await fetch(url, { cache: 'no-store', signal: AbortSignal.timeout(10000) });
      if (!response.ok) throw new Error(`version.json HTTP ${response.status}`);
      const version = await response.json();
      if (matchesDeployment(version, expectedSha)) {
        console.log(`已確認正式站版本 ${version.version}，SHA ${version.gitHash}`);
        return version;
      }
      console.log(`等待部署 ${expectedSha.slice(0, 8)}，目前正式站 ${version.gitHash ?? '未知'}`);
    } catch (error) {
      console.log(`尚未確認部署：${error.message}`);
    }
    if (Date.now() >= deadline) break;
    await new Promise(resolve => setTimeout(resolve, Math.min(pollMs, deadline - Date.now())));
  } while (Date.now() < deadline);
  throw new Error('正式站 SHA 與本次部署不一致，停止品質檢查，避免誤測舊版');
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const version = await waitForDeployment({
      expectedSha: process.env.EXPECTED_SHA,
      siteUrl: process.env.SITE_URL || 'https://cagoooo.github.io/Akai/',
      maxWaitMs: process.argv.includes('--once') ? 0 : 600000,
    });
    if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY,
      `\n已核對正式站 **v${version.version}**，部署 SHA \`${version.gitHash}\`。\n`);
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
