/**
 * embeddingSearch — Gemini Embedding 語意搜尋 client 端
 *
 * 流程：
 *   1. 載入 build-time 產的 tool-embeddings.json（97 個工具的向量）
 *   2. 使用者輸入 query → 呼叫 Cloud Function embedQuery 拿到 query 向量
 *   3. 算 cosine similarity → 排序 top N
 *
 * Fallback：
 *   - tool-embeddings.json 不存在 → isAvailable = false（client 用 fuzzy）
 *   - Cloud Function 沒部署 → search 拋錯（client 接住 fallback fuzzy）
 */

import { getFunctions, httpsCallable } from 'firebase/functions';
import app from '@/lib/firebase';
import { ensureSignedIn } from '@/lib/authService';

interface EmbeddingsFile {
  model: string;
  dimensions: number;
  generatedAt: string;
  toolCount: number;
  embeddings: Record<string, number[]>; // { "1": [...], "2": [...] }
}

let embeddingsCache: EmbeddingsFile | null = null;
let loadingPromise: Promise<EmbeddingsFile | null> | null = null;

/**
 * 載入 tool-embeddings.json（lazy + cache）
 */
export async function loadEmbeddings(): Promise<EmbeddingsFile | null> {
  if (embeddingsCache) return embeddingsCache;
  if (loadingPromise) return loadingPromise;

  loadingPromise = (async () => {
    try {
      const base = import.meta.env.BASE_URL || '/';
      const version = import.meta.env.VITE_APP_VERSION || Date.now();
      const res = await fetch(`${base}api/tool-embeddings.json?v=${version}`);
      if (!res.ok) {
        console.log('[embeddingSearch] tool-embeddings.json 不存在（404）→ fuzzy 模式');
        return null;
      }
      const data: EmbeddingsFile = await res.json();
      embeddingsCache = data;
      return data;
    } catch (err) {
      console.warn('[embeddingSearch] 載入 embeddings 失敗', err);
      return null;
    } finally {
      loadingPromise = null;
    }
  })();

  return loadingPromise;
}

/** 語意搜尋是否可用（tool-embeddings.json 存在） */
export async function isSemanticSearchAvailable(): Promise<boolean> {
  const data = await loadEmbeddings();
  return data !== null;
}

/** cosine similarity（兩向量越接近 1 越像） */
function cosineSim(a: number[], b: number[]): number {
  let dot = 0, magA = 0, magB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }
  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}

/**
 * 呼叫 Cloud Function embedQuery 拿 query 向量
 */
async function embedQuery(query: string): Promise<number[]> {
  if (!app) throw new Error('Firebase not initialized');
  // 確保至少有匿名 auth（Cloud Function 要求 request.auth.uid）
  await ensureSignedIn();
  const functions = getFunctions(app, 'asia-east1');
  const callable = httpsCallable<{ query: string }, { vector: number[] }>(functions, 'embedQuery');
  const result = await callable({ query });
  if (!Array.isArray(result.data?.vector)) {
    throw new Error('Cloud Function 回傳格式異常');
  }
  return result.data.vector;
}

/**
 * 主入口：用 query 找最相似的 top N 工具
 * 回傳 [{ toolId, score }, ...] 按 score 降序
 *
 * 失敗時拋錯，呼叫方應該 try/catch 然後 fallback fuzzy
 */
export async function semanticSearch(
  query: string,
  topN = 5
): Promise<Array<{ toolId: number; score: number }>> {
  const embeddings = await loadEmbeddings();
  if (!embeddings) {
    throw new Error('embeddings 未載入（tool-embeddings.json 不存在）');
  }

  const queryVec = await embedQuery(query);
  if (queryVec.length !== embeddings.dimensions) {
    throw new Error(
      `維度不匹配：query ${queryVec.length} vs tools ${embeddings.dimensions}`
    );
  }

  // 計算 cosine similarity for each tool
  const scores: Array<{ toolId: number; score: number }> = [];
  for (const [idStr, vec] of Object.entries(embeddings.embeddings)) {
    const toolId = parseInt(idStr, 10);
    if (!Number.isFinite(toolId)) continue;
    scores.push({ toolId, score: cosineSim(queryVec, vec) });
  }

  scores.sort((a, b) => b.score - a.score);
  return scores.slice(0, topN);
}
