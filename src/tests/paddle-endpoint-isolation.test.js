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
  'supabase/functions/_shared/paddle-checkout-handler.ts',
);
const SANDBOX = read(
  'supabase/functions/paddle-checkout-sandbox/index.ts',
);
const PRODUCTION = read(
  'supabase/functions/paddle-checkout-production/index.ts',
);

describe('fixed Paddle checkout environments', () => {
  it('pins each public endpoint to exactly one environment', () => {
    expect(SANDBOX).toContain(
      "createPaddleCheckoutHandler('sandbox')",
    );
    expect(PRODUCTION).toContain(
      "createPaddleCheckoutHandler('production')",
    );

    expect(SANDBOX).not.toContain("'production'");
    expect(PRODUCTION).not.toContain("'sandbox'");
  });

  it('uses the fixed environment for authorization and catalogue selection', () => {
    const code = stripComments(HANDLER);

    expect(code).toContain(
      'canUsePaddleEnvironment(user.id, environment)',
    );
    expect(code).toContain(
      'catalog = paddleCatalogFor(environment)',
    );
  });

  it('uses the fixed environment for the provider API call', () => {
    const code = stripComments(HANDLER);

    expect(code).toMatch(
      /paddleFetch\('\/transactions',\s*\{[\s\S]*?environment,/,
    );
  });

  it('records the same fixed environment in the checkout mapping', () => {
    const code = stripComments(HANDLER);

    expect(code).toContain(
      'provider_environment: environment',
    );
  });

  it('does not fall back to the global environment selector', () => {
    const code = stripComments(HANDLER);

    expect(code).not.toContain('isSandboxTester(');
    expect(code).not.toContain('paddleEnvironment(');
    expect(code).not.toContain('paddleCatalog()');
    expect(code).not.toMatch(
      /body\?\.(environment|provider|user_id)/,
    );
  });
});