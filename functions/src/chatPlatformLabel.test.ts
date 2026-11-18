import { describe, expect, it } from 'vitest';
import { PLATFORM_NAME, withPlatformCards, withPlatformText } from './lib/chatPlatformLabel';

describe('Google Chat 通知一律標出平台名稱', () => {
  it('摘要把【平台名】放在開頭表情符號之後', () => {
    expect(withPlatformText('🪄 許願池收到新回饋（建議）— 小明')).toBe('🪄 【阿凱老師教育工具集】許願池收到新回饋（建議）— 小明');
    expect(withPlatformText('⚡ 使用者從詳情頁點擊使用工具：中文注音打字遊戲')).toBe('⚡ 【阿凱老師教育工具集】使用者從詳情頁點擊使用工具：中文注音打字遊戲');
    expect(withPlatformText('🛟 Anonymous Auth 已自動修復')).toBe('🛟 【阿凱老師教育工具集】Anonymous Auth 已自動修復');
    expect(withPlatformText('⚠️ Schema 漂移告警')).toBe('⚠️ 【阿凱老師教育工具集】Schema 漂移告警');
  });

  it('沒有表情符號就直接加在最前面；已有平台名不重複', () => {
    expect(withPlatformText('使用者從主頁點擊工具：#3')).toBe('【阿凱老師教育工具集】使用者從主頁點擊工具：#3');
    const done = '👤 【阿凱老師教育工具集】新使用者註冊：a@gmail.com（Google 帳號）';
    expect(withPlatformText(done)).toBe(done);
  });

  it('卡片標題後加「｜平台名」，不改動原物件、已有就不重複', () => {
    const cards = [
      { cardId: 'a', card: { header: { title: '📝 工具收到新評論', subtitle: 'x' }, sections: [] } },
      { cardId: 'b', card: { header: { title: `👤 新使用者註冊｜${PLATFORM_NAME}` } } },
      { cardId: 'c', card: { sections: [] } },
    ];
    const out = withPlatformCards(cards)!;
    expect(out[0].card.header!.title).toBe('📝 工具收到新評論｜阿凱老師教育工具集');
    expect(out[0].card.header!.subtitle).toBe('x');
    expect(out[1].card.header!.title).toBe(`👤 新使用者註冊｜${PLATFORM_NAME}`);
    expect(out[2]).toBe(cards[2]);
    expect(cards[0].card.header!.title).toBe('📝 工具收到新評論');
    expect(withPlatformCards(undefined)).toBeUndefined();
  });
});
