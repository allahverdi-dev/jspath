import { createPaddleReconcileHandler } from '../_shared/paddle-reconcile-handler.ts';

Deno.serve(createPaddleReconcileHandler('production'));
