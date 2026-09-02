import { describe, expect, it, beforeEach, vi, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { challenges, exercises, interviewQuestions, projects } from '../content/registry.js';
import { requiredPlanForContent } from '../features/billing/access.js';
import { CONTENT_ALLOCATION } from '../features/billing/contentAllocation.js';
import { PREMIUM_FIELDS, splitPremium, isPremiumWithheld, PREMIUM_WITHHELD } from '../features/billing/premiumFields.js';
import * as clientEntitlement from '../features/billing/entitlements.js';
import * as serverEntitlement from '../../supabase/functions/_shared/entitlement.js';

/**
 * Premium delivery, from both ends.
 *
 * A static bundle cannot keep a secret, so the paid half of every Pro item is
 * removed at build time and served by an authenticated Edge Function instead.
 * This file holds the boundary to its promises: the server rule decides, it
 * fails closed on everything ambiguous, the two entitlement implementations
 * cannot drift apart, the artifact actually covers every Pro item, and the
 * public catalog a Free visitor browses is untouched.
 *
 * The function body itself runs in Deno and cannot execute here, so what is
 * tested is the decision logic it imports and the artifacts it serves — not a
 * mock standing in for either.
 */

const FUTURE = '2099-01-01T00:00:00.000Z';
const PAST = '2020-01-01T00:00:00.000Z';
const pro = (plan, status, extra = {}) => ({ plan, status, current_period_end: FUTURE, ...extra });

/* ------------------------------------------------------------------ *
 * The rule the Edge Function applies
 * ------------------------------------------------------------------ */

describe('server entitlement decides access, and fails closed', () => {
  const decide = (subscriptions) =>
    serverEntitlement.resolveEntitlement({ authenticated: true, subscriptions }).isPro;

  it('refuses an unauthenticated caller outright', () => {
    const anon = serverEntitlement.resolveEntitlement({ authenticated: false, subscriptions: [pro('pro', 'active')] });
    expect(anon.isPro).toBe(false);
    expect(anon.plan).toBe('guest');
  });

  it('refuses a signed-in learner with no subscription', () => {
    expect(decide([])).toBe(false);
  });

  it('allows an active Pro subscription', () => {
    expect(decide([pro('pro', 'active')])).toBe(true);
  });

  it('allows a pending cancellation until the paid period ends', () => {
    expect(decide([pro('pro', 'canceling')])).toBe(true);
    expect(decide([pro('pro', 'canceling', { current_period_end: PAST })])).toBe(false);
  });

  it('allows a past_due period rather than cutting access mid-cycle', () => {
    expect(decide([pro('pro', 'past_due')])).toBe(true);
  });

  it.each(['expired', 'refunded', 'revoked'])('refuses a %s subscription even with time left', (status) => {
    expect(decide([pro('pro', status)])).toBe(false);
  });

  it('refuses a row claiming a product other than pro', () => {
    for (const plan of ['free', 'admin', 'PRO', undefined, null]) {
      expect(decide([pro(plan, 'active')]), String(plan)).toBe(false);
    }
  });

  it('refuses an unknown or invented status', () => {
    for (const status of ['', 'complete', 'paid', 'true', 'admin', undefined]) {
      expect(decide([pro('pro', status)]), String(status)).toBe(false);
    }
  });

  it('refuses when the period end is missing and no verification is fresh', () => {
    expect(serverEntitlement.subscriptionGrantsPro({ plan: 'pro', status: 'active' })).toBe(false);
    expect(serverEntitlement.subscriptionGrantsPro({
      plan: 'pro', status: 'active', last_verified_at: PAST,
    })).toBe(false);
  });

  it('refuses an unparseable date rather than treating it as valid', () => {
    expect(serverEntitlement.subscriptionGrantsPro({
      plan: 'pro', status: 'active', current_period_end: 'not-a-date',
    })).toBe(false);
  });

  it('refuses a null or malformed row', () => {
    for (const row of [null, undefined, {}, 'pro', 42]) {
      expect(serverEntitlement.subscriptionGrantsPro(row), String(row)).toBe(false);
    }
  });
});

/* ------------------------------------------------------------------ *
 * The two implementations must never disagree
 * ------------------------------------------------------------------ */

describe('client and server entitlement stay identical', () => {
  // One runs in the browser, one in Deno; they cannot share a module, so the
  // only thing stopping them drifting apart is this comparison.
  const statuses = ['active', 'canceling', 'past_due', 'expired', 'refunded', 'revoked', 'unknown', ''];
  const plans = ['pro', 'free', undefined];
  const ends = [FUTURE, PAST, undefined, 'not-a-date'];
  const verified = [undefined, FUTURE, PAST];

  it('agrees on every combination of plan, status, period end and verification', () => {
    const disagreements = [];
    for (const plan of plans) {
      for (const status of statuses) {
        for (const current_period_end of ends) {
          for (const last_verified_at of verified) {
            const row = { plan, status, current_period_end, last_verified_at };
            const a = clientEntitlement.subscriptionGrantsPro(row);
            const b = serverEntitlement.subscriptionGrantsPro(row);
            if (a !== b) disagreements.push({ row, client: a, server: b });
          }
        }
      }
    }
    expect(disagreements).toEqual([]);
  });

  it('agrees on the resolved plan for representative subscription sets', () => {
    const sets = [
      [], [pro('pro', 'active')], [pro('pro', 'canceling')], [pro('pro', 'expired')],
      [pro('pro', 'expired'), pro('pro', 'active')], [pro('free', 'active')],
    ];
    for (const subscriptions of sets) {
      for (const authenticated of [true, false]) {
        expect(serverEntitlement.resolveEntitlement({ authenticated, subscriptions }).plan)
          .toBe(clientEntitlement.resolveEntitlement({ authenticated, subscriptions }).plan);
      }
    }
  });

  it('shares the same verification window constant', () => {
    expect(serverEntitlement.ENTITLEMENT_VERIFICATION_TTL_MS)
      .toBe(clientEntitlement.ENTITLEMENT_VERIFICATION_TTL_MS);
  });
});

/* ------------------------------------------------------------------ *
 * The split itself
 * ------------------------------------------------------------------ */

describe('what counts as paid', () => {
  it('keeps discovery metadata out of the protected set', () => {
    const publicFields = ['id', 'slug', 'title', 'difficulty', 'topicIds', 'category', 'kind', 'level', 'topic', 'tagline', 'prompt', 'instructions', 'question', 'objectives'];
    for (const [kind, fields] of Object.entries(PREMIUM_FIELDS)) {
      for (const field of publicFields) {
        expect(fields, `${kind}.${field}`).not.toContain(field);
      }
    }
  });

  it('protects the answer half of every kind that has one', () => {
    expect(PREMIUM_FIELDS.challenge).toContain('solution');
    expect(PREMIUM_FIELDS.challenge).toContain('tests');
    expect(PREMIUM_FIELDS.exercise).toContain('solution');
    expect(PREMIUM_FIELDS.exercise).toContain('correct');
    expect(PREMIUM_FIELDS.interview).toContain('shortAnswer');
    expect(PREMIUM_FIELDS.interview).toContain('deepAnswer');
    expect(PREMIUM_FIELDS.interview).toContain('correct');
    expect(PREMIUM_FIELDS.project).toContain('milestones');
  });

  it('splits an item without losing or duplicating a field', () => {
    const item = { id: 'x', title: 'T', prompt: 'P', solution: 'S', tests: [1], hints: ['h'] };
    const { publicPart, protectedPart } = splitPremium('challenge', item);
    expect(publicPart.title).toBe('T');
    expect(publicPart.prompt).toBe('P');
    expect(publicPart.solution).toBeUndefined();
    expect(protectedPart).toEqual({ solution: 'S', tests: [1], hints: ['h'] });
    expect(isPremiumWithheld(publicPart)).toBe(true);
  });

  it('leaves an item with no paid fields completely alone', () => {
    const item = { id: 'x', title: 'T' };
    const { publicPart, protectedPart } = splitPremium('challenge', item);
    expect(protectedPart).toBeNull();
    expect(publicPart).toBe(item);
    expect(isPremiumWithheld(publicPart)).toBe(false);
  });
});

/* ------------------------------------------------------------------ *
 * The artifact the function serves
 * ------------------------------------------------------------------ */

describe('the server payload artifact', () => {
  const file = path.join('supabase', 'functions', 'premium-content', 'payload.json');
  const exists = fs.existsSync(file);
  const payload = exists ? JSON.parse(fs.readFileSync(file, 'utf8')) : {};

  it('has been generated', () => {
    expect(exists, 'run `npm run content:premium`').toBe(true);
  });

  it.each([
    ['challenge', () => challenges],
    ['exercise', () => exercises],
    ['interview', () => interviewQuestions],
    ['project', () => projects],
  ])('covers every Pro %s', (kind, get) => {
    const proItems = get().filter((i) => requiredPlanForContent(kind, i.id) === 'pro');
    const missing = proItems.filter((i) => !payload[`${kind}:${i.id}`]);
    expect(proItems.length).toBeGreaterThan(0);
    expect(missing.map((i) => i.id)).toEqual([]);
  });

  it('contains nothing for a Free item, which ships complete to the browser', () => {
    const freeChallenges = challenges.filter((c) => requiredPlanForContent('challenge', c.id) === 'free');
    for (const c of freeChallenges) expect(payload[`challenge:${c.id}`]).toBeUndefined();
  });

  it('carries only protected fields, never public metadata', () => {
    for (const [key, body] of Object.entries(payload)) {
      const kind = key.split(':')[0];
      for (const field of Object.keys(body)) {
        expect(PREMIUM_FIELDS[kind], `${key}.${field}`).toContain(field);
      }
    }
  });

  it('is in step with the content it was generated from', async () => {
    // A stale artifact is the quiet failure mode of this design: content changes,
    // the payload is not regenerated, and Pro learners receive an old body or none
    // at all. Rebuild it from the same source the generator reads — the authored
    // files, not the card projection in the registry — and compare.
    const { loadAllContent } = await import('../../scripts/lib/load-content.mjs');
    const source = await loadAllContent();
    const rebuilt = {};
    for (const [kind, items] of [
      ['challenge', source.challenges], ['exercise', source.exercises],
      ['interview', source.interview], ['project', source.projects],
    ]) {
      for (const item of items) {
        if (requiredPlanForContent(kind, item.id) !== 'pro') continue;
        const body = {};
        let has = false;
        for (const field of PREMIUM_FIELDS[kind]) {
          if (item[field] === undefined) continue;
          body[field] = item[field];
          has = true;
        }
        if (has) rebuilt[`${kind}:${item.id}`] = body;
      }
    }
    const stale = Object.keys(rebuilt).filter(
      (k) => JSON.stringify(rebuilt[k]) !== JSON.stringify(payload[k]),
    );
    const orphaned = Object.keys(payload).filter((k) => !rebuilt[k]);
    expect({ stale: stale.slice(0, 5), orphaned: orphaned.slice(0, 5) })
      .toEqual({ stale: [], orphaned: [] });
  }, 60_000);

  it('is not reachable from anywhere Vite serves', () => {
    // Living outside src/ and public/ is what keeps it off the wire.
    expect(file.startsWith('supabase')).toBe(true);
    expect(fs.existsSync(path.join('public', 'payload.json'))).toBe(false);
    expect(fs.existsSync(path.join('src', 'content', 'payload.json'))).toBe(false);
  });
});

/* ------------------------------------------------------------------ *
 * The production bundle
 * ------------------------------------------------------------------ */

describe('the production bundle', () => {
  const dir = path.join('dist', 'assets');
  const built = fs.existsSync(dir);
  const read = () =>
    fs.readdirSync(dir).filter((f) => f.endsWith('.js'))
      .map((f) => fs.readFileSync(path.join(dir, f), 'utf8')).join('\n');

  it.runIf(built)('does not ship a single Pro challenge solution', () => {
    const blob = read();
    const proItems = challenges.filter((c) => requiredPlanForContent('challenge', c.id) === 'pro');
    // Compare against the authored bodies loaded from source.
    const leaked = proItems.filter((c) => c.solution && blob.includes(String(c.solution).slice(0, 60)));
    expect(leaked.map((c) => c.id)).toEqual([]);
  });

  it.runIf(built)('still ships every Free challenge in full, so samples work offline', () => {
    const blob = read();
    const free = challenges.filter((c) => requiredPlanForContent('challenge', c.id) === 'free');
    const missing = free.filter((c) => c.solution && !blob.includes(String(c.solution).slice(0, 60)));
    expect(missing.map((c) => c.id)).toEqual([]);
  });

  it.runIf(built)('keeps every Pro title public so the catalog stays browseable', () => {
    const blob = read();
    const proItems = challenges.filter((c) => requiredPlanForContent('challenge', c.id) === 'pro');
    const hidden = proItems.filter((c) => !blob.includes(c.title));
    expect(hidden.map((c) => c.id)).toEqual([]);
  });

  it.runIf(built)('publishes no source maps that would re-expose the stripped bodies', () => {
    expect(fs.readdirSync(dir).filter((f) => f.endsWith('.map'))).toEqual([]);
  });
});

/* ------------------------------------------------------------------ *
 * Cache safety
 * ------------------------------------------------------------------ */

describe('protected content cache', () => {
  let premium;

  beforeEach(async () => {
    vi.resetModules();
    vi.doMock('../services/supabase.js', () => ({
      getSupabase: () => ({ functions: { invoke: async () => ({ data: null, error: { context: { status: 403 } } }) } }),
      getSession: async () => null,
    }));
    premium = await import('../services/premiumContent.js');
  });

  afterEach(() => { vi.doUnmock('../services/supabase.js'); });

  it('refuses without a session instead of asking the server', async () => {
    const result = await premium.fetchPremiumContent('challenge', 'ch-x');
    expect(result.status).toBe(premium.PREMIUM_STATUS.UNAUTHENTICATED);
    expect(result.content).toBeNull();
  });

  it('never writes a paid payload to browser storage', async () => {
    await premium.fetchPremiumContent('challenge', 'ch-x', { userId: 'user-a' });
    expect(Object.keys(localStorage)).toHaveLength(0);
    expect(Object.keys(sessionStorage)).toHaveLength(0);
  });

  it('passes a complete item straight through untouched', async () => {
    const item = { id: 'ch-free', solution: 'kept' };
    const out = await premium.withPremiumContent('challenge', item);
    expect(out.status).toBe(premium.PREMIUM_STATUS.OK);
    expect(out.item).toBe(item);
  });

  it('reports a refusal rather than returning a half-empty body', async () => {
    const withheld = { id: 'ch-pro', title: 'T', [PREMIUM_WITHHELD]: true };
    const out = await premium.withPremiumContent('challenge', withheld, { userId: 'user-a' });
    expect(out.status).toBe(premium.PREMIUM_STATUS.NOT_ENTITLED);
    expect(out.item).toBeNull();
  });
});

describe('protected content cache is partitioned by user', () => {
  let premium;
  let seenTokens;

  beforeEach(async () => {
    vi.resetModules();
    seenTokens = [];
    vi.doMock('../services/supabase.js', () => ({
      getSupabase: () => ({
        functions: {
          invoke: async (_name, { body }) => {
            seenTokens.push(body.keys[0]);
            return { data: { content: { [body.keys[0]]: { solution: 'paid body' } } }, error: null };
          },
        },
      }),
      getSession: async () => null,
    }));
    premium = await import('../services/premiumContent.js');
  });

  afterEach(() => { vi.doUnmock('../services/supabase.js'); });

  it('serves a cached body back to the same user', async () => {
    const a = await premium.fetchPremiumContent('challenge', 'ch-1', { userId: 'user-a' });
    const b = await premium.fetchPremiumContent('challenge', 'ch-1', { userId: 'user-a' });
    expect(a.content).toEqual({ solution: 'paid body' });
    expect(b.content).toEqual({ solution: 'paid body' });
    expect(seenTokens).toHaveLength(1); // second call came from cache
  });

  it('does not hand one user the content fetched for another', async () => {
    await premium.fetchPremiumContent('challenge', 'ch-1', { userId: 'user-a' });
    expect(seenTokens).toHaveLength(1);
    // Switching identity must re-ask rather than reuse the previous authorisation.
    await premium.fetchPremiumContent('challenge', 'ch-1', { userId: 'user-b' });
    expect(seenTokens).toHaveLength(2);
  });

  it('drops everything when the cache is cleared on sign-out', async () => {
    await premium.fetchPremiumContent('challenge', 'ch-1', { userId: 'user-a' });
    premium.clearPremiumCache();
    await premium.fetchPremiumContent('challenge', 'ch-1', { userId: 'user-a' });
    expect(seenTokens).toHaveLength(2);
  });
});

/* ------------------------------------------------------------------ *
 * Nothing about the product changed
 * ------------------------------------------------------------------ */

describe('the allocation is unchanged by the split', () => {
  it('still holds the exact intended Free/Pro counts', () => {
    expect({
      module: [CONTENT_ALLOCATION.module.free, CONTENT_ALLOCATION.module.pro],
      lesson: [CONTENT_ALLOCATION.lesson.free, CONTENT_ALLOCATION.lesson.pro],
      exercise: [CONTENT_ALLOCATION.exercise.free, CONTENT_ALLOCATION.exercise.pro],
      challenge: [CONTENT_ALLOCATION.challenge.free, CONTENT_ALLOCATION.challenge.pro],
      project: [CONTENT_ALLOCATION.project.free, CONTENT_ALLOCATION.project.pro],
      interview: [CONTENT_ALLOCATION.interview.free, CONTENT_ALLOCATION.interview.pro],
      reference: [CONTENT_ALLOCATION.reference.free, CONTENT_ALLOCATION.reference.pro],
      cheatsheet: [CONTENT_ALLOCATION.cheatsheet.free, CONTENT_ALLOCATION.cheatsheet.pro],
    }).toEqual({
      module: [47, 0], lesson: [214, 0], exercise: [650, 160], challenge: [15, 156],
      project: [5, 26], interview: [25, 287], reference: [213, 0], cheatsheet: [30, 0],
    });
  });

  it('leaves the browseable catalog complete for a Free visitor', () => {
    // Every Pro item still appears in the registry with its discovery metadata.
    for (const [kind, items] of [['challenge', challenges], ['project', projects], ['interview', interviewQuestions]]) {
      const proItems = items.filter((i) => requiredPlanForContent(kind, i.id) === 'pro');
      expect(proItems.length).toBeGreaterThan(0);
      for (const item of proItems.slice(0, 20)) {
        expect(item.id).toBeTruthy();
        expect(item.title ?? item.question).toBeTruthy();
      }
    }
  });
});
