import { createPaddleCheckoutHandler } from '../_shared/paddle-checkout-handler.ts';

Deno.serve(createPaddleCheckoutHandler('sandbox'));
