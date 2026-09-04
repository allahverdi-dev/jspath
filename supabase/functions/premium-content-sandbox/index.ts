import { createPremiumContentHandler } from '../_shared/premium-content-handler.ts';

Deno.serve(createPremiumContentHandler('sandbox'));
