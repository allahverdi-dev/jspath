import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const read = (file) =>
  fs.readFileSync(path.resolve(process.cwd(), file), 'utf8');

const CHECKOUT = read(
  'supabase/functions/_shared/paddle-checkout-handler.ts',
);

const RECONCILE = read(
  'supabase/functions/_shared/paddle-reconcile-handler.ts',
);

const MIGRATION = read(
  'supabase/migrations/202609050001_paddle_environment_uniqueness.sql',
);

describe('Paddle environment-aware provider identities', () => {
  it('uses environment-aware checkout transaction conflicts', () => {
    expect(CHECKOUT).toContain(
      "onConflict: 'provider,provider_environment,provider_transaction_id'",
    );
  });

  it('uses environment-aware subscription conflicts', () => {
    expect(RECONCILE).toContain(
      "onConflict: 'provider,provider_environment,provider_subscription_id'",
    );
  });

  it('adds an environment-aware subscription identity constraint', () => {
    expect(MIGRATION).toContain(
      'unique (provider, provider_environment, provider_subscription_id)',
    );
  });

  it('adds an environment-aware checkout transaction constraint', () => {
    expect(MIGRATION).toContain(
      'unique (provider, provider_environment, provider_transaction_id)',
    );
  });

  it('does not remove the legacy constraints during migration', () => {
    expect(MIGRATION).not.toMatch(/drop\s+constraint/i);
  });
});