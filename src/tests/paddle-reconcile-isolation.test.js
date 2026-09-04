import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const read = (file) =>
  fs.readFileSync(path.resolve(process.cwd(), file), 'utf8');

const stripComments = (source) =>
  source
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '');

const HANDLER = read(
  'supabase/functions/_shared/paddle-reconcile-handler.ts',
);
const SANDBOX = read(
  'supabase/functions/reconcile-paddle-sandbox/index.ts',
);
const PRODUCTION = read(
  'supabase/functions/reconcile-paddle-production/index.ts',
);

describe('fixed Paddle reconcile environments', () => {
  it('pins both endpoints to one environment', () => {
    expect(SANDBOX).toContain(
      "createPaddleReconcileHandler('sandbox')",
    );
    expect(PRODUCTION).toContain(
      "createPaddleReconcileHandler('production')",
    );
  });

  it('uses explicit environment authorization and catalogue', () => {
    const code = stripComments(HANDLER);

    expect(code).toContain(
      'canUsePaddleEnvironment(user.id, environment)',
    );
    expect(code).toContain(
      'catalog = paddleCatalogFor(environment)',
    );
  });

  it('passes environment into every provider lookup', () => {
    const code = stripComments(HANDLER);

    expect(code).toContain(
      'getPaddleSubscription(row.provider_subscription_id, environment)',
    );
    expect(code).toContain(
      'getPaddleTransaction(session.provider_transaction_id, environment)',
    );
    expect(code).toContain(
      'getPaddleSubscription(subscriptionId, environment)',
    );
  });

  it('normalizes subscriptions with the fixed environment', () => {
    expect(stripComments(HANDLER)).toContain(
      'normalizePaddleSubscription({ subscription, catalog, environment, now })',
    );
  });

  it('scopes database reads and updates by provider environment', () => {
    const code = stripComments(HANDLER);

    expect(
      (code.match(/\.eq\('provider_environment', environment\)/g) ?? []).length,
    ).toBeGreaterThanOrEqual(5);
  });

  it('contains no global environment selector', () => {
    const code = stripComments(HANDLER);

    expect(code).not.toContain('isSandboxTester(');
    expect(code).not.toContain('paddleCatalog()');
    expect(code).not.toContain('paddleEnvironment()');
  });
});