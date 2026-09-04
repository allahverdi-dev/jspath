import { createPaddlePortalHandler } from '../_shared/paddle-portal-handler.ts';

Deno.serve(createPaddlePortalHandler('sandbox'));
