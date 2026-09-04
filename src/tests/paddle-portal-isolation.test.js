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
  'supabase/functions/_shared/paddle-portal-handler.ts',
);
const SANDBOX = read(
  'supabase/functions/paddle-portal-sandbox/index.ts',
);
const PRODUCTION = read(
  'supabase/functions/paddle-portal-production/index.ts',
);

describe('fixed Paddle portal environments', () => {
  it('pins both public endpoints to one environment', () => {
    expect(SANDBOX).toContain(
      "createPaddlePortalHandler('sandbox')",
    );
    expect(PRODUCTION).toContain(
      "createPaddlePortalHandler('production')",
    );

    expect(SANDBOX).not.toContain("'production'");
    expect(PRODUCTION).not.toContain("'sandbox'");
  });

  it('authorizes against the fixed environment', () => {
    expect(stripComments(HANDLER)).toContain(
      'canUsePaddleEnvironment(user.id, environment)',
    );
  });

  it('selects only subscriptions from the fixed environment', () => {
    expect(stripComments(HANDLER)).toContain(
      ".eq('provider_environment', environment)",
    );
  });

  it('uses the fixed environment for the Paddle API call', () => {
    const code = stripComments(HANDLER);

    expect(code).toMatch(
      /paddleFetch\([\s\S]*?\{[\s\S]*?method: 'POST',[\s\S]*?environment,/,
    );
  });

  it('never trusts environment or identity from the request body', () => {
    const code = stripComments(HANDLER);

    expect(code).not.toMatch(
      /body\?\.(environment|provider|user_id|customer|subscription)/,
    );
  });

  it('contains no global Paddle environment selector', () => {
    const code = stripComments(HANDLER);

    expect(code).not.toContain('isSandboxTester(');
    expect(code).not.toContain('paddleEnvironment()');
  });
});