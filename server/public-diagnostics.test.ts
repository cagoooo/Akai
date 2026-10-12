import { describe, expect, it } from 'vitest';
import { publicErrorResponse, publicHealthStatus, validErrorStatus } from './public-diagnostics';
import { literalChatText } from './chat-card-escape';

describe('公開診斷不外送內部錯誤與系統路徑', () => {
  it('沒有健康檢查結果時標示未知，不把系統資訊查詢誤稱健康', () => {
    expect(publicHealthStatus({ timestamp: '2026-10-12', environment: 'private' })).toEqual({ status: 'unknown', timestamp: '2026-10-12' });
    expect(publicHealthStatus({ status: { secret: 'private' } }).status).toBe('unknown');
  });
  it('Express 通知純文字不能插入提及全體或偽造連結', () => {
    expect(literalChatText('錯誤 <users/all> <https://example.test|假連結>'))
      .toBe('錯誤 ‹users/all› ‹https://example.test|假連結›');
  });
  it('公開健康檢查只保留狀態，開發環境仍可查看完整診斷', () => {
    const details = { status: 'degraded', timestamp: '2026-10-12', database: 'error',
      dbFile: '內部路徑', errorStack: '內部堆疊', environment: '內部設定', memoryUsage: { heapUsed: 1 } };
    expect(publicHealthStatus(details)).toEqual({ status: 'degraded', timestamp: '2026-10-12', database: 'error' });
    expect(publicHealthStatus(details, true)).toBe(details);
  });

  it('公開錯誤保留識別碼，內部訊息不出現在回應', () => {
    expect(publicErrorResponse('服務暫時無法完成要求', new Error('內部資料'), false, 123))
      .toEqual({ message: '服務暫時無法完成要求', errorId: 123, success: false });
    expect(publicErrorResponse('開發診斷', new Error('內部資料'), true, 123).error).toBe('內部資料');
  });

  it('不接受非 HTTP 錯誤狀態或字串注入', () => {
    for (const value of [200, 600, 400.5, '500', undefined, '<script>']) expect(validErrorStatus(value)).toBe(500);
    expect(validErrorStatus(400)).toBe(400);
    expect(validErrorStatus(503)).toBe(503);
  });
});
