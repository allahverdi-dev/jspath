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
  'supabase/functions/_shared/premium-content-handler.ts',
);

const SANDBOX = read(
  'supabase/functions/premium-content-sandbox/index.ts',
);

const PRODUCTION = read(
  'supabase/functions/premium-content-production/index.ts',
);

describe('fixed premium content environments', () => {
  it('pins each endpoint to exactly one environment', () => {
    expect(SANDBOX).toContain(
      "createPremiumContentHandler('sandbox')",
    );

    expect(PRODUCTION).toContain(
      "createPremiumContentHandler('production')",
    );

    expect(SANDBOX).not.toContain("'production'");
    expect(PRODUCTION).not.toContain("'sandbox'");
  });

  it('requires sandbox authorization through the fixed environment', () => {
    expect(stripComments(HANDLER)).toContain(
      'canUsePaddleEnvironment(user.id, environment)',
    );
  });

  it('loads provider provenance with subscription state', () => {
    expect(stripComments(HANDLER)).toContain(
      ".select('plan, status, current_period_end, ended_at, last_verified_at, provider, provider_environment')",
    );
  });

  it('passes the fixed environment into entitlement resolution', () => {
    expect(stripComments(HANDLER)).toContain(
      'resolveEntitlement({ authenticated: true, subscriptions: subscriptions ?? [], environment })',
    );
  });

  it('keeps the premium payload outside the public wrappers', () => {
    expect(HANDLER).toContain(
      "import payload from '../premium-content/payload.json'",
    );

    expect(SANDBOX).not.toContain('payload.json');
    expect(PRODUCTION).not.toContain('payload.json');
  });

  it('does not use the global billing environment in the handler', () => {
    const code = stripComments(HANDLER);

    expect(code).not.toContain('currentBillingEnvironment(');
    expect(code).not.toContain('PADDLE_ENVIRONMENT');
  });

  it('does not trust environment or user identity from the request body', () => {
    const code = stripComments(HANDLER);

    expect(code).not.toMatch(
      /body\?\.(environment|provider|user_id)/,
    );
  });
});