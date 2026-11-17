/**
 * 訪客里程碑通知（2026-11-17）
 *
 * 監聽 visitorStats/global：總訪客數跨過 10,000、20,000…時，
 * 1. 在同一份文件記下 milestonesReachedAt.{里程碑} = 達成時間（前端靠它顯示 14 天慶祝貼紙）
 * 2. 推一則 Google Chat 給阿凱老師
 *
 * 用 transaction 先記錄再通知：觸發器重試或同時多筆更新都只會發一次。
 * 不改 recordPublicAnalytics 的計數路徑，訪客計數照舊。
 */
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { onDocumentUpdated } from 'firebase-functions/v2/firestore';
import { defineSecret } from 'firebase-functions/params';
import * as logger from 'firebase-functions/logger';
import { pushToGoogleChat } from './lib/googleChatNotify';
import { crossedMilestones } from './lib/visitorMilestonePolicy';

const GOOGLE_CHAT_WEBHOOK_URL = defineSecret('GOOGLE_CHAT_WEBHOOK_URL');
const SITE_BASE = 'https://cagoooo.github.io/Akai/';

export const onVisitorMilestone = onDocumentUpdated(
  {
    document: 'visitorStats/global',
    secrets: [GOOGLE_CHAT_WEBHOOK_URL],
    region: 'asia-east1',
  },
  async (event) => {
    const before = event.data?.before.data();
    const after = event.data?.after.data();
    if (!before || !after) return;

    const candidates = crossedMilestones(
      before.totalVisits,
      after.totalVisits,
      after.milestonesReachedAt as Record<string, unknown> | undefined,
    );
    if (candidates.length === 0) return;

    const ref = getFirestore().collection('visitorStats').doc('global');
    const newlyReached = await getFirestore().runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      const reached = (snap.get('milestonesReachedAt') ?? {}) as Record<string, unknown>;
      const fresh = candidates.filter((m) => !reached[String(m)]);
      if (fresh.length === 0) return [];
      const update: Record<string, unknown> = {};
      for (const m of fresh) update[`milestonesReachedAt.${m}`] = FieldValue.serverTimestamp();
      tx.update(ref, update);
      return fresh;
    });
    if (newlyReached.length === 0) return;

    const milestone = Math.max(...newlyReached);
    const total = Number(after.totalVisits);
    const label = milestone.toLocaleString('en-US');
    logger.info('[onVisitorMilestone] 達成訪客里程碑', { milestone, total });

    const card = {
      cardId: `visitor-milestone-${milestone}`,
      card: {
        header: {
          title: `🎉 訪客突破 ${label} 人次！`,
          subtitle: '阿凱老師教育科技創新專區',
          imageUrl: 'https://fonts.gstatic.com/s/i/short-term/release/googlesymbols/celebration/default/48px.svg',
          imageType: 'CIRCLE',
        },
        sections: [
          {
            widgets: [
              { decoratedText: { topLabel: '目前累計', text: `<b>${total.toLocaleString('en-US')}</b> 人次` } },
              { decoratedText: { topLabel: '首頁', text: '計數器旁會顯示 14 天的慶祝貼紙' } },
              { buttonList: { buttons: [{ text: '打開首頁', onClick: { openLink: { url: SITE_BASE } } }] } },
            ],
          },
        ],
      },
    };

    await pushToGoogleChat(
      GOOGLE_CHAT_WEBHOOK_URL.value(),
      `🎉 恭喜！教育科技創新專區訪客突破 ${label} 人次（目前 ${total.toLocaleString('en-US')}）`,
      [card],
      'VisitorMilestone',
    );
  },
);
