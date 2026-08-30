import { GUMROAD_RESOURCE_TYPES, createEventIdentity, sha256 } from '../_shared/gumroad.js';
import { adminClient, processSubscription } from '../_shared/billing-server.ts';

Deno.serve(async (request) => {
  if (request.method !== 'POST') return new Response('Method not allowed', { status: 405 });
  const url = new URL(request.url);
  const expectedToken = Deno.env.get('GUMROAD_WEBHOOK_TOKEN') ?? '';
  const suppliedToken = url.searchParams.get('token') ?? '';
  if (!expectedToken) return new Response('Webhook is not configured', { status: 503 });
  if ((await sha256(suppliedToken)) !== (await sha256(expectedToken))) return new Response('Unauthorized', { status: 401 });

  const eventType = url.searchParams.get('event') ?? '';
  if (!GUMROAD_RESOURCE_TYPES.includes(eventType)) return new Response('Unknown Gumroad resource', { status: 400 });

  const contentType = request.headers.get('content-type') ?? '';
  const payload = contentType.includes('application/json')
    ? await request.json()
    : Object.fromEntries((await request.formData()).entries());
  const identity = await createEventIdentity(eventType, payload);
  const admin = adminClient();
  const { error: insertError } = await admin.from('billing_events').insert({
    provider: 'gumroad',
    event_key: identity.eventKey,
    event_type: eventType,
    provider_object_id: identity.objectId,
    payload_sha256: identity.payloadSha256,
  });
  if (insertError?.code === '23505') {
    const { data: existing, error: lookupError } = await admin
      .from('billing_events')
      .select('processing_status')
      .eq('provider', 'gumroad')
      .eq('event_key', identity.eventKey)
      .maybeSingle();
    if (lookupError || existing?.processing_status !== 'failed') {
      return Response.json({ ok: true, duplicate: true });
    }
    const { error: retryError } = await admin.from('billing_events').update({
      processing_status: 'received',
      error_message: null,
      processed_at: null,
    }).eq('provider', 'gumroad').eq('event_key', identity.eventKey).eq('processing_status', 'failed');
    if (retryError) return Response.json({ ok: false }, { status: 500 });
  }
  if (insertError) return Response.json({ ok: false }, { status: 500 });

  try {
    const result = await processSubscription({ eventType, payload });
    await admin.from('billing_events').update({
      processing_status: result.outcome,
      error_message: result.reason ?? null,
      processed_at: new Date().toISOString(),
    }).eq('provider', 'gumroad').eq('event_key', identity.eventKey);
    return Response.json({ ok: true, outcome: result.outcome });
  } catch (error) {
    await admin.from('billing_events').update({
      processing_status: 'failed',
      error_message: String(error?.message ?? 'Processing failed').slice(0, 500),
      processed_at: new Date().toISOString(),
    }).eq('provider', 'gumroad').eq('event_key', identity.eventKey);
    return Response.json({ ok: false }, { status: 500 });
  }
});
