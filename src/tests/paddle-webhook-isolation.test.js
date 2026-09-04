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
  'supabase/functions/_shared/paddle-webhook-handler.ts',
);

const SANDBOX = read(
  'supabase/functions/paddle-webhook-sandbox/index.ts',
);

const PRODUCTION = read(
  'supabase/functions/paddle-webhook-production/index.ts',
);

describe('fixed Paddle webhook environments', () => {
  it('pins each webhook endpoint to one environment', () => {
    expect(SANDBOX).toContain(
      "createPaddleWebhookHandler('sandbox')",
    );

    expect(PRODUCTION).toContain(
      "createPaddleWebhookHandler('production')",
    );

    expect(SANDBOX).not.toContain("'production'");
    expect(PRODUCTION).not.toContain("'sandbox'");
  });

  it('uses the environment-specific webhook secret', () => {
    expect(stripComments(HANDLER)).toContain(
      'secret: paddleWebhookSecret(environment)',
    );
  });

  it('verifies the raw payload before parsing JSON', () => {
    const code = stripComments(HANDLER);

    const verifyIndex = code.indexOf('verifyPaddleSignature');
    const parseIndex = code.indexOf('JSON.parse(rawBody)');

    expect(verifyIndex).toBeGreaterThanOrEqual(0);
    expect(parseIndex).toBeGreaterThan(verifyIndex);
  });

  it('uses the environment-specific catalogue', () => {
    expect(stripComments(HANDLER)).toContain(
      'catalog = paddleCatalogFor(environment)',
    );
  });

  it('normalizes the subscription with the fixed environment', () => {
    expect(stripComments(HANDLER)).toContain(
      'normalizePaddleSubscription({ subscription, catalog, environment })',
    );
  });

  it('namespaces billing event identities by environment', () => {
    const code = stripComments(HANDLER);

    expect(code).toContain(
      'const eventKey = `${environment}:${eventId}`',
    );

    expect(code).toContain(
      'event_key: eventKey',
    );

    expect(
      (code.match(/\.eq\('event_key', eventKey\)/g) ?? []).length,
    ).toBeGreaterThanOrEqual(2);
  });

  it('scopes provider records by environment', () => {
    const code = stripComments(HANDLER);

    expect(
      (code.match(/\.eq\('provider_environment', environment\)/g) ?? []).length,
    ).toBeGreaterThanOrEqual(3);
  });

  it('uses environment-aware subscription upserts', () => {
    expect(stripComments(HANDLER)).toContain(
      "onConflict: 'provider,provider_environment,provider_subscription_id'",
    );
  });

  it('contains no global Paddle webhook configuration', () => {
    const code = stripComments(HANDLER);

    expect(code).not.toContain(
      "Deno.env.get('PADDLE_WEBHOOK_SECRET')",
    );

    expect(code).not.toContain('paddleCatalog()');
    expect(code).not.toContain('paddleEnvironment()');
  });
});