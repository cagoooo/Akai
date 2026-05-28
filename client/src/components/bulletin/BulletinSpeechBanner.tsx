/**
 * BulletinSpeechBanner — 2026 AIFED 演講入口 thin wrapper
 *
 * v3.6.66 起改用通用 ExternalWorkBanner + externalWorks.ts 資料設定檔。
 * 此 wrapper 保留：(1) BulletinHome 既有 import 不破壞；
 * (2) 仍發 `aifed_speech_click` GA 事件相容舊資料；
 * (3) 未來如果要展示多筆作品 carousel，可在此擴展為 map。
 */
import { ExternalWorkBanner } from './ExternalWorkBanner';
import { EXTERNAL_WORKS } from '@/data/externalWorks';

export function BulletinSpeechBanner() {
  const work = EXTERNAL_WORKS.find((w) => w.id === 'aifed-2026');
  if (!work) return null;
  return <ExternalWorkBanner work={work} legacyEventName="aifed_speech_click" />;
}
