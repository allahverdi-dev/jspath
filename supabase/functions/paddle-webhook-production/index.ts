import { createPaddleWebhookHandler } from '../_shared/paddle-webhook-handler.ts';

Deno.serve(createPaddleWebhookHandler('production'));
