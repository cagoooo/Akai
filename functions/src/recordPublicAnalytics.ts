/**
 * 公開站台分析事件入口。
 *
 * 瀏覽器只能提交經白名單驗證的事件；所有聚合資料由 Admin SDK 原子遞增，
 * Firestore Rules 因此可以完全禁止 client 直接寫 analytics / visitorStats。
 */
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';
import * as logger from 'firebase-functions/logger';
import { createHash } from 'node:crypto';
import {
  appCheckDecision,
  isAnalyticsKind,
  nextRateLimitState,
  validateEventId,
  type AnalyticsKind,
  type RateLimitState,
} from './analyticsPolicy';

const REGION = 'asia-east1';
const MAX_TOOL_ID = 200;
const FUNNEL_EVENTS = new Set([
  'opened',
  'audienceSelected',
  'schoolLevelSelected',
  'teacherRoleSelected',
  'departmentSelected',
  'painPointsConfirmed',
  'resultsShown',
  'dismissed',
  'reshuffled',
]);
const WIZARD_STEPS = new Set([
  'audience',
  'school-level',
  'teacher-role',
  'department',
  'pain-points',
  'thinking',
  'results',
]);
const SELECTIONS: Record<string, Set<string>> = {
  audience: new Set(['teacher', 'student']),
  schoolLevels: new Set(['elementary', 'junior', 'senior']),
  teacherRoles: new Set(['homeroom', 'subject', 'admin']),
  departments: new Set(['academic', 'student-affairs', 'general-affairs', 'counseling', 'other']),
  painPoints: new Set([
    'lesson-planning',
    'assessment',
    'classroom-management',
    'student-practice',
    'teacher-workload',
    'communication',
    'administration',
    'meeting-productivity',
    'content-creation',
    'presentation',
    'language-learning',
    'reading-literacy',
    'digital-literacy',
    'creative-learning',
    'event-management',
    'it-support',
    'media-production',
    'professional-learning',
    'accessibility',
    'resource-discovery',
  ]),
};
const SLOTS = new Set([
  'universal',
  'role',
  'stage',
  'popular',
  'discovery',
  'painpoint',
  'unknown',
]);
const SURFACES = new Set(['wizard', 'strip']);
const BATCHES = new Set(['initial', 'reshuffled']);
const WEB_VITALS = new Set(['LCP', 'INP', 'CLS', 'FCP', 'TTFB']);
const RATINGS = new Set(['good', 'needs-improvement', 'poor']);

function todayInTaipei(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Taipei',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

function requireAuth(request: { auth?: unknown }): void {
  if (!request.auth) throw new HttpsError('unauthenticated', 'authentication required');
}

function stringValue(value: unknown, maxLength: number): string {
  if (typeof value !== 'string') throw new HttpsError('invalid-argument', 'invalid string');
  const clean = value.trim();
  if (!clean || clean.length > maxLength)
    throw new HttpsError('invalid-argument', 'invalid string length');
  return clean;
}

function enumValue(value: unknown, allowed: Set<string>, label: string): string {
  const clean = stringValue(value, 80);
  if (!allowed.has(clean)) throw new HttpsError('invalid-argument', `invalid ${label}`);
  return clean;
}

function toolIdValue(value: unknown): number {
  const id = Number(value);
  if (!Number.isInteger(id) || id < 1 || id > MAX_TOOL_ID) {
    throw new HttpsError('invalid-argument', 'invalid tool id');
  }
  return id;
}

function segmentValue(value: unknown): string {
  const segment = stringValue(value, 80);
  if (!/^[a-z-]+(?:_[a-z-]+){0,3}$/.test(segment)) {
    throw new HttpsError('invalid-argument', 'invalid segment');
  }
  return segment;
}

function incrementMap(values: string[]): Record<string, admin.firestore.FieldValue> {
  return Object.fromEntries(
    values.map((value) => [value, admin.firestore.FieldValue.increment(1)]),
  );
}

function simpleHash(value: string): string {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) hash = ((hash << 5) - hash + value.charCodeAt(i)) | 0;
  return Math.abs(hash).toString(36);
}

function secureHash(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

function requestIp(request: {
  rawRequest?: { ip?: string; headers?: Record<string, unknown> };
}): string {
  const direct = request.rawRequest?.ip;
  if (direct) return direct.slice(0, 80);
  const forwarded = request.rawRequest?.headers?.['x-forwarded-for'];
  return typeof forwarded === 'string' ? forwarded.split(',')[0].trim().slice(0, 80) : 'unknown';
}

async function enforcePersistentRateLimit(
  uid: string,
  ip: string,
  kind: AnalyticsKind,
  isAdmin: boolean,
): Promise<void> {
  const db = admin.firestore();
  const identityHash = secureHash(`${uid}|${ip}|${kind}`);
  const ref = db.collection('_analyticsRateLimits').doc(identityHash);
  const nowMs = Date.now();
  const result = await db.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(ref);
    const data = snapshot.data();
    const storedTimestamp = data?.windowStartedAt;
    const current: RateLimitState | null =
      snapshot.exists &&
      typeof data?.count === 'number' &&
      storedTimestamp &&
      typeof storedTimestamp.toMillis === 'function'
        ? { count: data.count, windowStartedAtMs: storedTimestamp.toMillis() }
        : null;
    const decision = nextRateLimitState(current, nowMs, kind, isAdmin);
    if (decision.allowed) {
      transaction.set(
        ref,
        {
          count: decision.state.count,
          kind,
          windowStartedAt: admin.firestore.Timestamp.fromMillis(decision.state.windowStartedAtMs),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          expiresAt: admin.firestore.Timestamp.fromMillis(
            decision.state.windowStartedAtMs + decision.policy.windowMs * 2,
          ),
        },
        { merge: true },
      );
    }
    return { allowed: decision.allowed, limit: decision.policy.limit, identityHash };
  });

  if (!result.allowed) {
    logger.warn('public_analytics_rate_limited', {
      kind,
      identityHash: result.identityHash.slice(0, 16),
      limit: result.limit,
    });
    throw new HttpsError('resource-exhausted', 'analytics rate limit exceeded');
  }
}

async function claimEvent(
  uid: string,
  kind: AnalyticsKind,
  eventId: string | null,
): Promise<{ duplicate: boolean; ref: admin.firestore.DocumentReference | null }> {
  if (!eventId) return { duplicate: false, ref: null };
  const db = admin.firestore();
  const ref = db.collection('_analyticsEventClaims').doc(secureHash(`${uid}|${eventId}`));
  const duplicate = await db.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(ref);
    if (snapshot.exists) return true;
    transaction.create(ref, {
      kind,
      identityHash: secureHash(uid).slice(0, 32),
      status: 'claimed',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      expiresAt: admin.firestore.Timestamp.fromMillis(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });
    return false;
  });
  return { duplicate, ref };
}

async function recordVisitorCount(): Promise<void> {
  const today = todayInTaipei();
  await admin
    .firestore()
    .collection('visitorStats')
    .doc('global')
    .set(
      {
        totalVisits: admin.firestore.FieldValue.increment(1),
        dailyVisits: { [today]: admin.firestore.FieldValue.increment(1) },
        lastVisitAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true },
    );
}

async function recordVisitorContext(
  data: Record<string, unknown>,
  isAdmin: boolean,
): Promise<void> {
  const category = enumValue(data.category, new Set(['device', 'referrer', 'geo']), 'category');
  const key = stringValue(data.key, 64);
  if (!/^[\p{L}\p{N} _.:/-]+$/u.test(key))
    throw new HttpsError('invalid-argument', 'invalid context key');
  const requestedCount = Number(data.count ?? 1);
  const max = isAdmin ? 100000 : 1;
  if (!Number.isInteger(requestedCount) || requestedCount < 1 || requestedCount > max) {
    throw new HttpsError('invalid-argument', 'invalid context count');
  }
  const field =
    category === 'device' ? 'deviceStats' : category === 'referrer' ? 'referrerStats' : 'geoStats';
  await admin
    .firestore()
    .collection('analytics')
    .doc('visitorContext')
    .set(
      {
        [field]: { [key]: admin.firestore.FieldValue.increment(requestedCount) },
        lastUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true },
    );
}

async function recordReco(data: Record<string, unknown>): Promise<void> {
  const action = stringValue(data.action, 32);
  const today = todayInTaipei();
  const inc = admin.firestore.FieldValue.increment(1);
  const payload: Record<string, unknown> = {
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  if (action === 'funnel') {
    const event = enumValue(data.event, FUNNEL_EVENTS, 'funnel event');
    payload.funnel = { [event]: inc };
    payload.funnelDaily = { [today]: { [event]: inc } };
    if (data.step !== undefined) {
      const step = enumValue(data.step, WIZARD_STEPS, 'wizard step');
      payload.dismissedAtStep = { [step]: inc };
    }
  } else if (action === 'selection') {
    const dimension = enumValue(
      data.dimension,
      new Set(Object.keys(SELECTIONS).filter((key) => key !== 'painPoints')),
      'dimension',
    );
    const value = enumValue(data.value, SELECTIONS[dimension], 'selection value');
    const eventByDimension: Record<string, string> = {
      audience: 'audienceSelected',
      schoolLevels: 'schoolLevelSelected',
      teacherRoles: 'teacherRoleSelected',
      departments: 'departmentSelected',
    };
    const event = eventByDimension[dimension];
    payload.selections = { [dimension]: { [value]: inc } };
    payload.funnel = { [event]: inc };
    payload.funnelDaily = { [today]: { [event]: inc } };
  } else if (action === 'painSelection') {
    const raw = Array.isArray(data.painPoints) ? data.painPoints : [];
    const painPoints = [
      ...new Set(raw.map((value) => enumValue(value, SELECTIONS.painPoints, 'pain point'))),
    ].slice(0, 3);
    payload.funnel = { painPointsConfirmed: inc };
    payload.funnelDaily = { [today]: { painPointsConfirmed: inc } };
    if (painPoints.length > 0) payload.selections = { painPoints: incrementMap(painPoints) };
  } else if (action === 'impression') {
    const segment = segmentValue(data.segment);
    const rawIds = Array.isArray(data.toolIds) ? data.toolIds : [];
    const toolIds = [...new Set(rawIds.map(toolIdValue))].slice(0, 6);
    if (toolIds.length === 0) throw new HttpsError('invalid-argument', 'tool ids required');
    const surface = enumValue(data.surface ?? 'wizard', SURFACES, 'surface');
    payload.totalImpressions = inc;
    payload.tools = Object.fromEntries(toolIds.map((id) => [String(id), { imp: inc }]));
    payload.segments = { [segment]: { imp: inc } };
    payload.segmentDaily = { [today]: { [segment]: { imp: inc } } };
    payload.surfaces = { [surface]: { imp: inc } };
    payload.daily = { [today]: { imp: inc } };
    if (data.batch !== undefined) {
      const batch = enumValue(data.batch, BATCHES, 'batch');
      payload.batchStats = { [batch]: { imp: inc } };
    }
  } else if (action === 'click') {
    const segment = segmentValue(data.segment);
    const toolId = toolIdValue(data.toolId);
    const slot = enumValue(data.slot, SLOTS, 'slot');
    const surface = enumValue(data.surface ?? 'wizard', SURFACES, 'surface');
    const matchedPains = Number(data.matchedPains ?? 0);
    if (!Number.isInteger(matchedPains) || matchedPains < 0 || matchedPains > 3) {
      throw new HttpsError('invalid-argument', 'invalid matched pain count');
    }
    const rawPains = Array.isArray(data.painPoints) ? data.painPoints : [];
    const painPoints = [
      ...new Set(rawPains.map((value) => enumValue(value, SELECTIONS.painPoints, 'pain point'))),
    ].slice(0, 3);
    payload.totalClicks = inc;
    payload.tools = { [String(toolId)]: { clk: inc } };
    payload.segments = { [segment]: { clk: inc } };
    payload.segmentDaily = { [today]: { [segment]: { clk: inc } } };
    payload.surfaces = { [surface]: { clk: inc } };
    payload.slotClicks = { [slot]: inc };
    payload.daily = { [today]: { clk: inc, ...(matchedPains > 0 ? { painClk: inc } : {}) } };
    if (matchedPains > 0) payload.painClicks = inc;
    if (painPoints.length > 0) payload.painPointClicks = incrementMap(painPoints);
    if (data.batch !== undefined) {
      const batch = enumValue(data.batch, BATCHES, 'batch');
      payload.batchStats = { [batch]: { clk: inc } };
    }
  } else {
    throw new HttpsError('invalid-argument', 'invalid recommendation action');
  }

  await admin.firestore().collection('analytics').doc('recoStats').set(payload, { merge: true });
}

async function recordToolIndexQuery(data: Record<string, unknown>): Promise<void> {
  const query = stringValue(data.query, 80);
  if (query.length < 2) throw new HttpsError('invalid-argument', 'query too short');
  const resultCount = Number(data.resultCount);
  if (!Number.isInteger(resultCount) || resultCount < 0 || resultCount > 200) {
    throw new HttpsError('invalid-argument', 'invalid result count');
  }
  const ref = admin
    .firestore()
    .collection('analytics')
    .doc('toolIndexQueries')
    .collection('queries')
    .doc(simpleHash(query));
  await admin.firestore().runTransaction(async (transaction) => {
    const snapshot = await transaction.get(ref);
    const now = new Date().toISOString();
    if (snapshot.exists) {
      transaction.set(
        ref,
        {
          count: admin.firestore.FieldValue.increment(1),
          lastUsedAt: now,
          lastResultCount: resultCount,
        },
        { merge: true },
      );
    } else {
      transaction.set(ref, {
        query,
        count: 1,
        firstSeenAt: now,
        lastUsedAt: now,
        lastResultCount: resultCount,
      });
    }
  });
}

async function recordWebVital(data: Record<string, unknown>): Promise<void> {
  const name = enumValue(data.name, WEB_VITALS, 'metric');
  const rating = enumValue(data.rating, RATINGS, 'rating');
  const metricId = stringValue(data.metricId, 100);
  if (!/^[a-zA-Z0-9._-]+$/.test(metricId))
    throw new HttpsError('invalid-argument', 'invalid metric id');
  const value = Number(data.value);
  const delta = Number(data.delta);
  if (
    !Number.isFinite(value) ||
    value < 0 ||
    value > 120000 ||
    !Number.isFinite(delta) ||
    Math.abs(delta) > 120000
  ) {
    throw new HttpsError('invalid-argument', 'invalid metric value');
  }
  const path = typeof data.path === 'string' ? data.path.slice(0, 200) : '/';
  const ua = typeof data.ua === 'string' ? data.ua.slice(0, 200) : '';
  const navigationType =
    typeof data.navigationType === 'string' ? data.navigationType.slice(0, 40) : 'unknown';
  const keepsDecimal = name === 'CLS';
  await admin
    .firestore()
    .collection('analytics')
    .doc('webVitals')
    .collection(todayInTaipei())
    .doc(metricId)
    .set({
      name,
      value: keepsDecimal ? value : Math.round(value),
      rating,
      delta: keepsDecimal ? delta : Math.round(delta),
      navigationType,
      path,
      ua,
      ts: admin.firestore.FieldValue.serverTimestamp(),
    });
}

export const recordPublicAnalytics = onCall(
  {
    region: REGION,
    memory: '256MiB',
    maxInstances: 10,
    // 先蒐集 App Check 合法／缺漏比例；確認正式站與舊版快取皆穩定後再切成 true。
    enforceAppCheck: false,
  },
  async (request) => {
    requireAuth(request);
    const data = (request.data ?? {}) as Record<string, unknown>;
    const rawKind = stringValue(data.kind, 32);
    if (!isAnalyticsKind(rawKind))
      throw new HttpsError('invalid-argument', 'invalid analytics kind');
    const kind: AnalyticsKind = rawKind;
    const isAdmin = request.auth?.token?.admin === true;
    const uid = request.auth?.uid ?? 'unknown';
    const appCheck = appCheckDecision(Boolean(request.app), false);
    if (appCheck === 'monitor-missing') {
      logger.warn('public_analytics_app_check_missing', {
        kind,
        identityHash: secureHash(uid).slice(0, 16),
      });
    }

    let eventId: string | null;
    try {
      eventId = validateEventId(data.eventId);
    } catch {
      throw new HttpsError('invalid-argument', 'invalid event id');
    }
    if (!eventId) {
      logger.warn('public_analytics_legacy_event_without_id', {
        kind,
        identityHash: secureHash(uid).slice(0, 16),
      });
    }

    await enforcePersistentRateLimit(uid, requestIp(request), kind, isAdmin);
    const claim = await claimEvent(uid, kind, eventId);
    if (claim.duplicate) return { ok: true, duplicate: true };

    try {
      switch (kind) {
        case 'visitorCount':
          await recordVisitorCount();
          break;
        case 'visitorContext':
          await recordVisitorContext(data, isAdmin);
          break;
        case 'recommendation':
          await recordReco(data);
          break;
        case 'toolIndexQuery':
          await recordToolIndexQuery(data);
          break;
        case 'webVital':
          await recordWebVital(data);
          break;
      }
      if (claim.ref) {
        await claim.ref.set(
          {
            status: 'completed',
            completedAt: admin.firestore.FieldValue.serverTimestamp(),
          },
          { merge: true },
        );
      }
    } catch (error) {
      if (claim.ref) {
        await claim.ref.delete().catch((cleanupError) => {
          logger.error('public_analytics_claim_cleanup_failed', {
            kind,
            error: cleanupError instanceof Error ? cleanupError.message : 'unknown',
          });
        });
      }
      throw error;
    }
    return { ok: true };
  },
);
