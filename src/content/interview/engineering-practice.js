import { INTERVIEW_KIND as K, INTERVIEW_LEVEL as L } from '../schema/types.js';

/**
 * Engineering-practice questions: the browser platform under load, async
 * correctness beyond syntax, and the performance, security, HTTP and testing
 * judgment an interviewer uses to separate "can build a feature" from "can own
 * one in production".
 *
 * The security questions here are defensive: what the attack class is in one
 * sentence, then how to prevent it, how to limit the damage when a layer
 * fails, and how to verify. None of them is an exploitation walkthrough.
 */

const BROWSER = 'Browser Under Load';
const ASYNC = 'Async Correctness';
const PERF = 'Performance';
const SEC = 'Security';
const ARCH = 'Architecture';
const HTTP = 'HTTP & APIs';
const TESTING = 'Testing';

export const questions = [
  /* --------------------------------------------------------------- browser */
  {
    id: 'iv-bul-virtualisation',
    question: 'A table needs to show 50,000 rows. How do you make that work?',
    topic: BROWSER,
    level: L.INTERMEDIATE,
    kind: K.BROWSER,
    topicIds: ['performance', 'dom-manipulation'],
    relatedLessons: ['l-m43-02', 'l-m18-03'],
    shortAnswer:
      'Do not put 50,000 rows in the DOM. Render only the visible window plus a small buffer, absolutely positioned inside a container sized to the full list — virtualisation. Before that, ask whether the user needs 50,000 rows at all, because pagination or server-side search is often the better product answer.',
    deepAnswer: [
      'The reason it fails naively is that every node costs memory, layout and style recalculation. Fifty thousand rows with ten cells each is half a million elements; layout alone takes seconds, scrolling drops frames, and the memory footprint can crash a mobile browser.',
      'Virtualisation renders only what is visible. The mechanics: a scroll container with a spacer sized to `rowCount × rowHeight` so the scrollbar is correct, a computed start index from `scrollTop / rowHeight`, and roughly `viewportHeight / rowHeight` rows rendered plus a few above and below as overscan. On scroll, recompute the window and translate the rendered block into position.',
      'Recycling matters as much as windowing: reusing the same DOM nodes and updating their content avoids creating and destroying elements on every scroll event, which is what causes garbage-collection pauses mid-scroll.',
      'Variable row heights are where it gets hard, and it is worth saying so. Fixed heights make the arithmetic trivial. Variable heights need measurement and an estimate that is corrected as rows are measured, which can cause the scrollbar to jump. That complexity is the main argument for using a maintained library rather than writing it.',
      'The costs to state honestly: Ctrl+F does not find unrendered rows, screen readers only see the rendered window unless `aria-rowcount`/`aria-rowindex` are set correctly, print output is wrong, and deep-linking to a row needs explicit scroll-to-index support. Accessibility in particular is the part hand-rolled implementations usually get wrong.',
      'Cheaper alternatives worth considering first: `content-visibility: auto` lets the browser skip rendering work for off-screen content with a one-line CSS change; pagination avoids the problem entirely and is often what users prefer for tabular data; and server-side filtering means the client never receives 50,000 rows in the first place.',
      'And the data side matters independently of rendering: transferring and parsing a 50,000-row JSON payload is its own cost, so the fix is frequently in the API rather than the view.',
    ],
    keyPoints: [
      'Render only the visible window plus overscan; size a spacer for the scrollbar',
      'Recycle nodes rather than recreating them each scroll',
      'Variable row heights require measurement and cause scroll jumps',
      'Costs: Ctrl+F, screen readers, printing, deep links — set `aria-rowcount`/`aria-rowindex`',
      '`content-visibility: auto` and pagination are cheaper first options',
      'Question whether the client should receive 50,000 rows at all',
    ],
    commonMistakes: [
      'Reaching for virtualisation before asking whether pagination fits the product.',
      'Shipping a virtual list with no accessibility attributes.',
    ],
    followUps: ['What breaks for a screen-reader user?', 'Why are variable row heights hard?'],
  },

  {
    id: 'iv-bul-offline',
    question: 'How do you handle the user losing their network connection?',
    topic: BROWSER,
    level: L.JUNIOR_PLUS,
    kind: K.BROWSER,
    topicIds: ['web-apis', 'http', 'errors'],
    relatedLessons: ['l-m27-05', 'l-m26-05'],
    shortAnswer:
      'Treat request failure as the source of truth and `navigator.onLine` as a hint. Show a clear offline state, queue or preserve the user\'s unsaved work, and retry when connectivity returns — driven by the `online` event plus a real request, not by the flag alone.',
    deepAnswer: [
      '`navigator.onLine` and the `online`/`offline` events are unreliable in a specific way worth knowing: `false` means definitively no network, but `true` only means the device has **a** network interface. Connected to a wifi captive portal with no internet, it reports `true`. So it is useful for reacting quickly, never for deciding whether a request will succeed.',
      'The reliable signal is a failed `fetch`. `fetch` rejects on network failure — as opposed to resolving with an error status — so `catch` with a check that it is not an `AbortError` is where offline actually surfaces.',
      'What the UI owes the user: say plainly that the connection was lost rather than showing a generic error; never discard what they typed; disable or clearly mark actions that cannot succeed; and retry automatically when the connection returns rather than making them find the button again.',
      'Preserving unsaved work is the part that matters most and is skipped most often. Persisting a draft to `localStorage` or IndexedDB as the user types means a dropped connection plus a refresh does not lose an hour of writing.',
      'For queued mutations, the pattern is an outbox: store the intended change locally, apply it optimistically to the UI, and flush the queue when connectivity returns. That requires the requests to be idempotent or to carry an idempotency key, or a flush after a partial failure duplicates work.',
      'A service worker is what makes a genuinely offline-capable app possible — cache the shell so the page loads at all, serve cached data with a clear "showing offline data" indicator, and use Background Sync where available to flush the outbox even after the tab is closed. It is also the layer most likely to serve stale content after a deploy, so it needs a deliberate update strategy.',
      'Testing this is straightforward and worth mentioning: DevTools has an offline throttling preset, and Playwright can simulate offline, so the offline path should be covered rather than assumed.',
    ],
    keyPoints: [
      '`navigator.onLine === true` only means an interface exists — captive portals report online',
      'A rejected `fetch` is the reliable signal; distinguish it from `AbortError`',
      'Never discard unsaved input; persist drafts locally',
      'An outbox queue needs idempotent requests or idempotency keys',
      'A service worker enables offline loading and Background Sync',
      'Simulate offline in DevTools and in end-to-end tests',
    ],
    commonMistakes: [
      'Trusting `navigator.onLine` as a guarantee that requests will succeed.',
      'Queuing non-idempotent mutations and duplicating them on flush.',
    ],
    followUps: ['Why does a captive portal report online?', 'What makes an outbox safe to flush twice?'],
  },

  {
    id: 'iv-bul-layout-shift',
    question: 'Content jumps around as the page loads. What causes that and how do you stop it?',
    topic: BROWSER,
    level: L.INTERMEDIATE,
    kind: K.BROWSER,
    topicIds: ['performance', 'dom', 'web-apis'],
    relatedLessons: ['l-m43-03'],
    shortAnswer:
      'Layout shift comes from content whose size is not known until it arrives — images without dimensions, web fonts swapping in, ads and embeds, and content injected above what the user is already reading. The fix is to reserve the space in advance so the arriving content lands in a box that already exists.',
    deepAnswer: [
      'Cumulative Layout Shift measures this, and it is a user-experience problem before it is a metric: the classic damage is tapping a button that moves at the moment of the tap, so the user activates something else.',
      '**Images and video**: always set `width` and `height` attributes (or an `aspect-ratio` in CSS). Modern browsers use them to compute the aspect ratio and reserve the correct box before the file loads, even for a responsive image whose rendered size differs.',
      '**Fonts**: a web font that replaces the fallback at a different metric reflows every line of text. `font-display: swap` avoids invisible text but makes the shift visible; `size-adjust` and `ascent-override` on the fallback face, or a metric-compatible fallback, minimise the difference. Preloading the font shortens the window in which any of it matters.',
      '**Injected content**: anything inserted above the current scroll position — a cookie banner, a promotional bar, an error message — pushes everything down. Reserve the space, or overlay it rather than inserting it into flow.',
      '**Async content**: an ad slot, an embed, or a lazily-loaded component needs a container with a fixed minimum height. A skeleton placeholder that matches the final dimensions solves the problem and improves perceived speed at the same time.',
      'The deliberate exception: a shift within 500ms of a user interaction is excluded from the metric, because expanding an accordion the user clicked is expected. Shifts that are not caused by an interaction are the ones that count.',
      'Measurement: the Performance panel highlights shifted regions and names the culprit, and `PerformanceObserver` with the `layout-shift` entry type reports it from real users — which is where you find the shifts that only happen on slow connections.',
    ],
    keyPoints: [
      'Reserve space before content arrives — do not let arrival resize the box',
      '`width`/`height` attributes or `aspect-ratio` on every image and video',
      'Font swaps reflow text; use metric-compatible fallbacks and preload',
      'Overlay injected banners rather than inserting them into flow',
      'Skeletons with the final dimensions fix async content and perceived speed together',
      'Shifts within 500ms of an interaction are excluded; measure the rest with `PerformanceObserver`',
    ],
    commonMistakes: [
      'Omitting image dimensions because the CSS sets the size responsively.',
      'Inserting a cookie banner into normal flow above the fold.',
    ],
    followUps: ['Why do image attributes still help a responsive image?', 'Why are interaction-adjacent shifts excluded?'],
  },

  {
    id: 'iv-bul-cross-tab',
    question: 'The user has your app open in three tabs. What breaks, and how do the tabs stay in sync?',
    topic: BROWSER,
    level: L.ADVANCED,
    kind: K.BROWSER,
    topicIds: ['storage', 'web-apis', 'events'],
    relatedLessons: ['l-m27-01', 'l-m27-05'],
    shortAnswer:
      'Each tab is a separate JavaScript context with its own memory, so in-memory state diverges immediately while `localStorage`, cookies and IndexedDB are shared. `BroadcastChannel` is the direct way to notify sibling tabs; the `storage` event is the older fallback, and it fires in **other** tabs only.',
    deepAnswer: [
      'What actually breaks: logging out in one tab leaves the others showing an authenticated UI until their next failed request; a stale tab overwrites a newer edit made elsewhere; polling and websockets are duplicated per tab, multiplying server load; and a token refreshed in two tabs at once can invalidate itself if the backend rotates refresh tokens.',
      '**`BroadcastChannel`** is the purpose-built mechanism:\n\n```js\nconst channel = new BroadcastChannel("auth");\nchannel.postMessage({ type: "logout" });\nchannel.addEventListener("message", (event) => {\n  if (event.data.type === "logout") redirectToLogin();\n});\n```\n\nSame-origin, structured-cloned messages, and the sender does not receive its own message — which is usually what you want.',
      '**The `storage` event** is the fallback and has one property people trip over: it fires in every **other** tab on the origin but never in the tab that made the write. That makes it usable as a signal, but it means the writing tab must update itself separately.',
      'For the auth case specifically, an `HttpOnly` cookie is shared across tabs automatically, so a logout that clears the cookie affects all of them at the request level — the broadcast is then only about updating the UI promptly rather than about correctness.',
      'To avoid duplicated work, elect one tab as the leader and let it own the websocket or polling loop, broadcasting results to the others. `navigator.locks.request` with a never-released lock is a clean way to do leader election; a `SharedWorker` is the alternative where supported, giving one shared context for all tabs of the origin.',
      'For concurrent edits, the last-write-wins default is what causes silent data loss. A version or `ETag` on the record lets the server reject a stale write with `409 Conflict`, which the client can surface as "this changed elsewhere" rather than overwriting.',
      'Testing this is easy to skip and worth doing: open two tabs and exercise logout, session expiry and a concurrent edit. Most cross-tab bugs are found in about two minutes that way, and never by a single-tab test suite.',
    ],
    keyPoints: [
      'Tabs share storage and cookies but not memory — in-memory state diverges',
      '`BroadcastChannel` for direct same-origin messaging; the sender is excluded',
      'The `storage` event fires only in **other** tabs',
      'Elect a leader (Web Locks or `SharedWorker`) so polling is not duplicated',
      'Version records so a stale write gets a `409` instead of overwriting',
      'Test logout, expiry and concurrent edits with two tabs open',
    ],
    commonMistakes: [
      'Expecting the `storage` event to fire in the tab that wrote the value.',
      'Letting every tab open its own websocket.',
    ],
    followUps: ['How would you elect a leader tab?', 'What stops a stale tab overwriting a newer edit?'],
  },

  /* ----------------------------------------------------------------- async */
  {
    id: 'iv-ac-race-conditions',
    question: 'JavaScript is single-threaded. How can it still have race conditions?',
    topic: ASYNC,
    level: L.INTERMEDIATE,
    kind: K.ASYNC,
    topicIds: ['event-loop', 'async-await', 'promises'],
    relatedLessons: ['l-m25-03'],
    shortAnswer:
      'Single-threaded rules out **data** races — no torn reads, no half-finished writes. It does not rule out **ordering** races: every `await` is a suspension point where other code runs, so state you read before it may have changed by the time you resume.',
    deepAnswer: [
      'The guarantee run-to-completion gives you is that a synchronous block cannot be interrupted. `count += 1` is atomic. What it does not give you is that `const a = state.x; await f(); use(a, state.x)` sees a consistent `state.x` — anything can have run in between.',
      'The recurring shapes:\n\n- **Stale response**: two requests in flight, the slower one returns last and overwrites the newer result.\n- **Write after unmount / navigation**: an `await` resolves after the component or view is gone, and the continuation writes to something that should no longer exist.\n- **Read-modify-write across an await**: two handlers both read a value, both compute a new one from it, and the second overwrites the first\'s change.\n- **Double submit**: the user clicks twice before the first request settles, creating two records.',
      'The defences, and they are different per shape. For stale responses, a sequence number checked **after** the await, or `AbortController` to cancel the superseded request. For unmount, an abort signal or a liveness flag checked after the await. For read-modify-write, do not carry a read across an await — re-read after it, or use a functional update (`setState(prev => ...)`) so the computation happens against current state.',
      'For double submit, disable the control and deduplicate the in-flight promise by key, so concurrent callers share one request rather than starting several.',
      'The reviewing heuristic worth stating: **treat every `await` as a place where the world may have changed**. Anything read before it and used after it is a candidate bug. That single habit catches most of these before they ship.',
      'Server-side races are a separate problem the client cannot fix. Two tabs updating the same record need optimistic concurrency — a version or `ETag` the server checks — because no amount of client-side sequencing prevents two legitimate clients from conflicting.',
      'And these are exactly the bugs that are hard to reproduce, because they depend on timing. That is why the fix is structural rather than "add a small delay", and why network throttling is the tool that makes them reproducible.',
    ],
    keyPoints: [
      'Single-threaded prevents data races, not ordering races',
      'Every `await` is a suspension point where other code runs',
      'Shapes: stale response, write after unmount, read-modify-write, double submit',
      'Check sequence or abort after the await; re-read rather than carrying state across it',
      'Deduplicate in-flight requests and disable the control for double submit',
      'Cross-client conflicts need server-side optimistic concurrency',
    ],
    commonMistakes: [
      'Concluding that single-threaded means race-free.',
      'Fixing a timing bug with a delay rather than a sequence or abort check.',
    ],
    followUps: ['Why must the staleness check come after the await?', 'What can the client not fix?'],
  },

  {
    id: 'iv-ac-forawait-vs-all',
    question: 'When would you use `for await...of` rather than `Promise.all`?',
    topic: ASYNC,
    level: L.INTERMEDIATE,
    kind: K.ASYNC,
    topicIds: ['async-await', 'promises', 'iterators'],
    relatedLessons: ['l-m25-03'],
    shortAnswer:
      '`Promise.all` when the work is independent and you want it concurrent — it starts everything at once and waits. `for await...of` when the items must be processed in order, when each depends on the previous, when the source is a genuine stream, or when you must not overwhelm a service.',
    deepAnswer: [
      '`Promise.all(items.map(fn))` starts every operation immediately. Total time is roughly the slowest one, which is the right default for N independent requests.',
      '`for await (const x of source)` processes one at a time. Total time is the sum. That is the correct choice when the operations are genuinely dependent — each request needs the previous cursor — or when order of side effects matters.',
      'The distinction people miss: `for await...of` also consumes an **async iterable**, which `Promise.all` cannot. Paginated APIs, streamed response bodies, and anything where the number of items is not known upfront can only be driven this way — you cannot build an array of promises for pages whose cursors do not exist yet.',
      'Memory is the other axis. `Promise.all` holds every result until all settle, so a thousand large responses are all resident at once. A `for await` loop can process and discard each item, which is what makes it viable for streams.',
      'Failure semantics differ too. `Promise.all` rejects on the first failure while the rest continue unobserved; a `for await` loop throws at the item that failed and simply stops, leaving later items untouched. Which is correct depends on whether partial progress is acceptable — and `allSettled` is the third option when you want every result regardless.',
      'The practical middle ground is bounded concurrency: neither one-at-a-time nor all-at-once, but N in flight. For a few hundred items against a rate-limited API that is almost always the right answer, and it is worth naming rather than presenting the choice as binary.',
      'The anti-pattern to call out: `items.forEach(async (x) => await fn(x))` looks like sequencing and is neither — `forEach` discards the promises, so everything starts at once and nothing is awaited. If you want concurrency use `Promise.all`; if you want sequence use `for...of`.',
    ],
    keyPoints: [
      '`Promise.all` for independent work — time is the slowest item',
      '`for await` for dependent, ordered, or streamed work — time is the sum',
      'Only `for await` can consume an async iterable of unknown length',
      '`Promise.all` holds every result in memory; a loop can discard as it goes',
      'First-failure-aborts versus stop-at-the-failing-item',
      'Bounded concurrency is usually the real answer for large lists',
    ],
    commonMistakes: [
      'Using sequential awaits for independent requests and multiplying latency.',
      'Using `forEach` with `async` and getting neither concurrency control nor sequencing.',
    ],
    followUps: ['Why can `Promise.all` not consume a paginated API?', 'How would you cap concurrency at five?'],
  },

  {
    id: 'iv-ac-double-submit',
    question: 'A user double-clicks Submit and two orders are created. How do you fix it properly?',
    topic: ASYNC,
    level: L.JUNIOR_PLUS,
    kind: K.SCENARIO,
    topicIds: ['async-await', 'http', 'forms'],
    relatedLessons: ['l-m20-03', 'l-m26-04'],
    shortAnswer:
      'Disable the control and guard with an in-flight flag on the client, but the actual fix is server-side: send a client-generated idempotency key with the request so a duplicate is recognised and the original result returned. Client guards improve the experience; only the server can guarantee correctness.',
    deepAnswer: [
      'The client-side guard, which should exist regardless:\n\n```js\nlet inFlight = false;\n\nform.addEventListener("submit", async (event) => {\n  event.preventDefault();\n  if (inFlight) return;\n  inFlight = true;\n  button.disabled = true;\n  try {\n    await createOrder(payload, { idempotencyKey });\n  } finally {\n    inFlight = false;\n    button.disabled = false;\n  }\n});\n```\n\nThe boolean matters as well as the `disabled` attribute, because the disable happens a frame later than a fast second click can arrive, and because the form can also be submitted with Enter.',
      'The `finally` is essential: without it, a failed request leaves the button permanently disabled and the user stuck.',
      'Why that is not sufficient: the network can duplicate a request without any second click. A request that times out may have succeeded with the response lost, and a retry — yours, or the browser\'s, or a proxy\'s — creates a second order. No amount of client-side guarding prevents that.',
      'The correct mechanism is an **idempotency key**: the client generates a unique id (`crypto.randomUUID()`) once per logical operation, sends it as a header, and the server records it. A second request with the same key returns the stored result rather than performing the work again. This is exactly what payment APIs do, and it is the answer that shows production experience.',
      'The key must be generated when the user starts the operation, not per HTTP attempt — otherwise a retry sends a new key and defeats the purpose.',
      'Also worth covering: after success, navigate away or reset the form so the same submission cannot be repeated; and if the user genuinely might want two identical orders, the deduplication window has to be bounded rather than permanent.',
      'The general principle to state: client-side controls are user-experience improvements, and correctness for anything that creates, charges or deletes has to be enforced where the data lives.',
    ],
    keyPoints: [
      'Disable the control and guard with an in-flight flag — reset it in `finally`',
      'A `disabled` attribute alone can lose to a fast second click or an Enter submit',
      'The network can duplicate a request with no second click at all',
      'An idempotency key generated once per operation is the real fix',
      'Do not regenerate the key per retry',
      'Client guards are UX; correctness belongs on the server',
    ],
    commonMistakes: [
      'Treating the disabled button as the complete solution.',
      'Generating a new idempotency key for each retry attempt.',
    ],
    followUps: ['Why does a timeout not tell you whether the write happened?', 'When should the dedup window expire?'],
  },

  {
    id: 'iv-ac-optimistic-ui',
    question: 'What is optimistic UI, and what has to be true for it to be safe?',
    topic: ASYNC,
    level: L.ADVANCED,
    kind: K.SCENARIO,
    topicIds: ['async-await', 'http', 'clean-code'],
    relatedLessons: ['l-m26-05'],
    shortAnswer:
      'Applying the expected result to the UI immediately and reconciling when the server responds. It is safe when the operation almost always succeeds, the failure is cheap to undo and explain, and you keep enough information to roll back to the exact previous state.',
    deepAnswer: [
      'The motivation is perceived latency. A like button that waits 300ms for a round trip feels broken; one that fills in instantly and quietly reconciles feels native. For high-frequency, low-stakes interactions the difference is large.',
      'The mechanics: snapshot the current state, apply the predicted change, send the request, and on failure restore the snapshot and tell the user. The snapshot is the part people skip — "undo by decrementing" is wrong if something else changed the value in the meantime, whereas restoring a captured previous value is not.',
      'The conditions under which it is appropriate: a high success rate; a change the user can absorb being reverted; and a prediction the client can actually make correctly. If the server assigns an id, computes a price, or applies rules the client does not know, the optimistic state is a guess and reconciling it is messy.',
      'Where it is inappropriate: anything that charges money, sends a message, or deletes data. Showing "payment complete" and retracting it is worse than a spinner. The rule of thumb is that the cost of being wrong must be lower than the cost of the wait.',
      'Reconciliation details that decide whether it feels good or broken. Concurrent optimistic updates must not clobber each other, so keeping a queue of pending mutations and re-deriving the view from server state plus pending changes is more robust than mutating a single copy. A temporary client-side id has to be swapped for the server id once known. And a rollback needs a visible, non-startling explanation — a toast with a retry, not a value that silently jumps back.',
      'The interaction with retries matters too: an optimistic update plus an automatic retry means the same mutation may reach the server twice, so the request should carry an idempotency key.',
      'What to say if asked whether to build it yourself: query libraries implement this pattern with rollback and refetch built in, and hand-rolling it across a codebase tends to produce inconsistent behaviour per feature. Use one mechanism, not one per screen.',
    ],
    keyPoints: [
      'Apply the predicted result immediately; reconcile on response',
      'Snapshot and restore — never "undo" by applying the inverse operation',
      'Needs a high success rate, a cheap rollback, and a prediction the client can make',
      'Never for payments, sends or deletes',
      'Derive the view from server state plus pending mutations so concurrent updates compose',
      'Swap temporary ids; explain rollbacks visibly; pair with idempotency keys',
    ],
    commonMistakes: [
      'Rolling back by applying the inverse operation instead of restoring a snapshot.',
      'Using it for irreversible or high-stakes actions.',
    ],
    followUps: ['Why is inverse-operation rollback unsafe?', 'How do concurrent optimistic updates compose?'],
  },

  /* ----------------------------------------------------------- performance */
  {
    id: 'iv-ep-web-vitals',
    question: 'What do LCP, INP and CLS each measure, and what would you change to improve each?',
    topic: PERF,
    level: L.INTERMEDIATE,
    kind: K.PERFORMANCE,
    topicIds: ['performance', 'web-apis'],
    relatedLessons: ['l-m43-01', 'l-m43-03'],
    shortAnswer:
      'LCP is how long the largest piece of content takes to appear — a loading problem. INP is how quickly the page responds to interaction — a main-thread problem. CLS is how much content moves unexpectedly — a reserved-space problem. Each has a different cause and a different fix.',
    deepAnswer: [
      '**LCP (Largest Contentful Paint)** — when the biggest above-the-fold element renders; good is under 2.5s. The causes are almost always loading: a slow server response, render-blocking CSS or synchronous scripts, or the hero image being discovered late. Fixes: preload the LCP image, inline critical CSS and defer the rest, use a CDN, avoid lazy-loading the hero, and serve modern image formats at the right size.',
      '**INP (Interaction to Next Paint)** — the worst interaction latency across the visit, from input to the next frame that reflects it; good is under 200ms. It replaced First Input Delay, which only measured the first interaction and only the delay before the handler ran, hiding slow handlers and slow rendering. The causes are long tasks: heavy handlers, expensive re-renders, hydration. Fixes: break long tasks up and yield, move heavy computation to a worker, reduce the work a handler triggers, and give immediate visual feedback before the expensive part.',
      '**CLS (Cumulative Layout Shift)** — how much visible content moves without a user interaction causing it; good is under 0.1. Causes: images and embeds without reserved dimensions, font swaps, and content injected above the fold. Fixes: set `width`/`height` or `aspect-ratio`, use metric-compatible font fallbacks, and reserve space for anything asynchronous.',
      'The most important framing: these are measured at the **75th percentile of real users**, not on your machine. Lab tools give reproducible diagnosis, field data tells you what actually happens on median hardware and networks. They frequently disagree, and the field data is the one that counts.',
      'Collect field data with `PerformanceObserver` on the `largest-contentful-paint`, `event` and `layout-shift` entry types, or with the `web-vitals` library, and send it to your analytics — otherwise you are optimising blind.',
      'A caution worth stating: the specific thresholds and even the metrics change over time — INP replaced FID recently. Treat them as a useful, evolving proxy for user experience rather than as the definition of it, and remember a page can score well on all three and still be unpleasant to use.',
    ],
    keyPoints: [
      'LCP: largest content paints — a loading problem; preload, inline critical CSS, CDN',
      'INP: interaction to next paint — a main-thread problem; break up long tasks',
      'INP replaced FID, which hid slow handlers and slow rendering',
      'CLS: unexpected movement — reserve space for images, fonts and async content',
      'Scored at the 75th percentile of real users, not in the lab',
      'Collect field data with `PerformanceObserver`; the metrics themselves evolve',
    ],
    commonMistakes: [
      'Quoting lab scores as if they described real users.',
      'Confusing INP with FID and only measuring the first interaction.',
    ],
    followUps: ['Why did INP replace FID?', 'Why can lab and field data disagree?'],
  },

  {
    id: 'iv-ep-dom-size',
    question: 'What does a large DOM actually cost, and how would you measure it?',
    topic: PERF,
    level: L.ADVANCED,
    kind: K.PERFORMANCE,
    topicIds: ['performance', 'dom'],
    relatedLessons: ['l-m43-02'],
    shortAnswer:
      'Memory per node, longer style recalculation and layout on every change, slower selector queries, and a larger accessibility tree. The cost is not paid once at render — it is paid on every subsequent style or layout invalidation, which is why a large DOM makes interactions feel slow rather than just loading slow.',
    deepAnswer: [
      'Each element carries a JavaScript object, computed styles, layout boxes and an accessibility node. A few thousand elements is unremarkable; tens of thousands is where style recalculation and layout start showing up as long tasks.',
      'The recurring cost is the point. When a class changes near the root, the browser must recompute styles for everything affected and re-run layout for the affected subtree. With a deep, wide tree that is a large amount of work repeated on every interaction, so the symptom is a page that loads acceptably and then responds sluggishly.',
      'Depth matters as well as count. Deeply nested trees make selector matching and layout more expensive, and complex descendant selectors amplify it. Flatter markup is cheaper to style and easier to read.',
      'Measuring it: `document.querySelectorAll("*").length` for a quick count; Lighthouse flags excessive DOM size with node count, maximum depth and maximum children; the Performance panel shows recalculate-style and layout durations and how many nodes each affected; and a heap snapshot attributes memory to detached versus attached nodes.',
      'A specific and common cause worth naming: detached nodes retained by JavaScript references or unremoved listeners. They are not visible on screen but still occupy memory, and they accumulate in a single-page app until something forces a reload.',
      'The fixes are structural rather than micro-optimisations: virtualise long lists, render only what is needed rather than hiding with CSS, avoid wrapper elements added purely for styling, unmount rather than hide when content is genuinely gone, and use `content-visibility: auto` so off-screen sections skip rendering work.',
      'The honest caveat: DOM size is rarely the first thing to fix. Bundle size, request waterfalls and long tasks usually dominate, and node count is a symptom of a rendering strategy rather than a problem to attack directly. Measure before acting on it.',
    ],
    keyPoints: [
      'Memory, style recalculation, layout, selector matching and the accessibility tree',
      'The cost recurs on every invalidation — interactions get slow, not just loading',
      'Depth matters as much as node count',
      'Measure with Lighthouse, the Performance panel and heap snapshots',
      'Detached retained nodes accumulate invisibly in single-page apps',
      'Fix by virtualising and unmounting, not by micro-optimising markup',
    ],
    commonMistakes: [
      'Hiding content with CSS and assuming it costs nothing.',
      'Treating node count as a target rather than a symptom.',
    ],
    followUps: ['Why does hiding with `display: none` still cost something?', 'How do detached nodes stay reachable?'],
  },

  /* --------------------------------------------------------------- security */
  {
    id: 'iv-ep-csrf',
    question: 'What is CSRF, and how do you defend against it?',
    topic: SEC,
    level: L.INTERMEDIATE,
    kind: K.SECURITY,
    topicIds: ['security', 'http'],
    relatedLessons: ['l-m44-02'],
    shortAnswer:
      'Cross-site request forgery is another site causing the user\'s browser to send an authenticated request to yours, relying on cookies being attached automatically. The defences are `SameSite` cookies, an anti-CSRF token the other site cannot read, and never performing state changes on a `GET`.',
    deepAnswer: [
      'The mechanism in one sentence: cookies are attached by the browser based on the destination, not on which site initiated the request, so a request triggered from anywhere carries the user\'s session. The victim does not have to do anything unusual — being logged in is enough.',
      'This is why it only affects **cookie-based** (or HTTP-Basic) authentication. A token held in memory and attached explicitly by your own code is not sent automatically, so CSRF does not apply — though that design has its own exposure to XSS, which is the trade discussed in token-storage questions.',
      '**`SameSite` cookies** are the primary modern defence. `SameSite=Lax` — now the browser default — withholds the cookie from cross-site subrequests and from cross-site `POST`s, while still sending it on top-level navigations so ordinary inbound links keep working. `Strict` withholds it even then, which is safest but means a link from an email lands logged-out.',
      '**Anti-CSRF tokens** remain necessary where `SameSite` is insufficient — cross-origin flows, older browsers, or a strict security requirement. The server issues a random token, the page includes it in the form or a header, and the server verifies it. It works because the same-origin policy prevents another site from **reading** your page to obtain the token.',
      '**Never mutate on `GET`.** A state-changing `GET` is trivially triggered by an image tag or a link and bypasses much of the protection above. It also gets fired by prefetchers and crawlers, so it is a correctness bug independent of security.',
      'Supporting measures: `Secure` so cookies never travel over plain HTTP; checking `Origin` or `Sec-Fetch-Site` headers server-side; and re-authenticating for genuinely sensitive actions such as changing a password.',
      'The relationship to CORS is a common confusion worth pre-empting: CORS governs whether your script may **read** a cross-origin response. It does not prevent the request being sent, and a simple form `POST` is not subject to preflight at all — so CORS is not a CSRF defence.',
    ],
    keyPoints: [
      'Cookies are attached by destination, so any site can trigger an authenticated request',
      'Only affects cookie/Basic auth — not tokens your code attaches explicitly',
      '`SameSite=Lax` is the default and primary defence; `Strict` breaks inbound links',
      'Anti-CSRF tokens work because another origin cannot read your page',
      'Never change state on a `GET`',
      'CORS is not a CSRF defence — it governs reading responses, not sending requests',
    ],
    commonMistakes: [
      'Believing CORS prevents CSRF.',
      'Assuming a token-in-`localStorage` design has no equivalent risk — it trades CSRF for XSS exposure.',
    ],
    followUps: ['Why does `SameSite=Strict` break email links?', 'Why is a form `POST` not preflighted?'],
  },

  {
    id: 'iv-ep-csp',
    question: 'What is a Content Security Policy, and what does it actually protect you from?',
    topic: SEC,
    level: L.ADVANCED,
    kind: K.SECURITY,
    topicIds: ['security', 'http'],
    relatedLessons: ['l-m44-01', 'l-m44-02'],
    shortAnswer:
      'A response header telling the browser which sources of script, style, images and connections are allowed. It is a **second line of defence**: it does not stop an injection happening, it stops the injected content from executing or exfiltrating, which limits the damage when your escaping fails.',
    deepAnswer: [
      'The header is a set of directives: `script-src`, `style-src`, `img-src`, `connect-src`, `frame-ancestors`, with `default-src` as the fallback. The browser refuses to load or execute anything that violates them.',
      'The single most valuable effect is blocking inline script. Most injected payloads rely on an inline `<script>` or an inline event handler; a policy without `unsafe-inline` makes both inert. That is why `unsafe-inline` in `script-src` removes most of the protection, and why `unsafe-eval` is worth eliminating too.',
      'Because real applications do need some inline script, the mechanism is a **nonce** or a hash: the server generates a random nonce per response, puts it in the header and on the legitimate `<script nonce="...">`, and injected script — which cannot know the nonce — is blocked. The nonce must be unpredictable and per-response; a static one is no protection at all.',
      '`strict-dynamic` is the modern recommendation, allowing scripts loaded by an already-trusted script rather than maintaining a host allowlist. Host allowlists turn out to be weak in practice, because a permitted CDN often hosts something that can be used to execute arbitrary code.',
      '`connect-src` limits where `fetch`, XHR and websockets may go, which constrains exfiltration even if script does run. `frame-ancestors` prevents your page being framed, which is the modern replacement for `X-Frame-Options` and the defence against clickjacking.',
      'Deployment is the practical part: start with `Content-Security-Policy-Report-Only` plus a `report-uri`/`report-to` endpoint, collect violations from real traffic, fix the legitimate ones, and only then enforce. Enforcing a hand-written policy directly usually breaks the site.',
      'What CSP does not do, so the boundaries are clear: it does not sanitise anything, it does not protect against a compromised dependency that runs **as** your trusted script, it does not stop CSRF, and a wide policy is largely decorative. It complements safe rendering rather than replacing it — Trusted Types is the related mechanism that goes further, making dangerous DOM sinks reject plain strings outright.',
    ],
    keyPoints: [
      'Declares allowed sources; the browser enforces — a second line of defence',
      'Blocking inline script is the main benefit; `unsafe-inline`/`unsafe-eval` negate it',
      'Per-response nonces or hashes allow legitimate inline script',
      '`strict-dynamic` beats host allowlists, which are weak in practice',
      '`connect-src` limits exfiltration; `frame-ancestors` prevents clickjacking',
      'Roll out with report-only first; it never replaces safe rendering',
    ],
    commonMistakes: [
      'Shipping a policy with `unsafe-inline` and considering the work done.',
      'Reusing a static nonce, which provides no protection.',
    ],
    followUps: ['Why are host allowlists weak?', 'What does Trusted Types add on top?'],
  },

  {
    id: 'iv-ep-frontend-secrets',
    question: 'Can you keep an API key secret in a front-end application?',
    topic: SEC,
    level: L.JUNIOR,
    kind: K.SECURITY,
    topicIds: ['security', 'tooling', 'http'],
    relatedLessons: ['l-m44-02'],
    shortAnswer:
      'No. Anything shipped to the browser is readable by the user — build-time environment variables are inlined into the bundle, not hidden. A key that must stay private belongs on a server that proxies the call; keys that must be public have to be restricted at the provider instead.',
    deepAnswer: [
      'The misconception is specific and common: `VITE_API_KEY` or `REACT_APP_API_KEY` in a `.env` file feels like a server secret, but the bundler **substitutes the literal value into the JavaScript at build time**. It is in the file the browser downloads. Opening DevTools and searching the bundle finds it in seconds.',
      'Obfuscation, minification, base64, and assembling the key at runtime are all ineffective for the same reason — the code that reconstructs the key is also shipped, and the finished request is visible in the Network tab regardless.',
      'The correct pattern for a genuine secret is a **backend proxy**: the browser calls your server, your server adds the key and calls the third party. The key never leaves your infrastructure, and you gain rate limiting, caching and auditing at the same point.',
      'Some keys are legitimately public — a Google Maps browser key, a Stripe publishable key, a Sentry DSN, a Supabase anon key. These are **designed** to be exposed, and they are protected by restrictions at the provider rather than by secrecy: allowed HTTP referrers or origins, scoped permissions, quota caps, and server-side row-level authorisation. The important habit is knowing which category a key is in before shipping it.',
      'The same applies to anything else client-side: feature flags, prices, discount rules and validation logic can all be read and modified by the user. Client-side checks are user experience; the server must enforce.',
      'Prevention in practice: keep a `.env` out of version control, never commit real credentials, add a secret scanner to CI and to pre-commit hooks, and treat any key that reaches a public bundle or a git history as compromised — rotate it rather than deleting the commit, because the history has already been cloned and indexed.',
    ],
    keyPoints: [
      'Build-time env vars are inlined into the bundle, not hidden',
      'Obfuscation does not help — the request is visible in the Network tab',
      'Route genuine secrets through a backend proxy',
      'Publishable keys are protected by origin restrictions, scopes and quotas',
      'Prices, flags and validation are all client-modifiable — the server must enforce',
      'Scan for secrets in CI; rotate anything exposed rather than deleting the commit',
    ],
    commonMistakes: [
      'Assuming a `.env` file keeps a value out of the bundle.',
      'Deleting a leaked commit instead of rotating the key.',
    ],
    followUps: ['How is a publishable key protected?', 'Why does removing the commit not fix a leak?'],
  },

  /* ----------------------------------------------------------- architecture */
  {
    id: 'iv-ep-breaking-change',
    question: 'You need to change the signature of a function used in 200 places. How do you do it?',
    topic: ARCH,
    level: L.ADVANCED,
    kind: K.ARCHITECTURE,
    topicIds: ['modules', 'clean-code', 'tooling'],
    relatedLessons: ['l-m28-05', 'l-m45-02'],
    shortAnswer:
      'Add the new form alongside the old one, migrate call sites incrementally, then remove the old one — an expand-migrate-contract sequence. A single atomic change across 200 sites is unreviewable, conflicts with everything in flight, and gives you no safe rollback.',
    deepAnswer: [
      '**Expand.** Introduce the new signature without removing the old one. Either a new export (`createUserV2`, later renamed) or the same function accepting both shapes and normalising internally. Nothing breaks; nothing has to be coordinated.',
      '**Migrate.** Move call sites in reviewable batches — by module, by team, by risk. Mark the old path `@deprecated` so editors surface it, and add a lint rule or a runtime warning in development so new usages are not added while you migrate. Codemods (jscodeshift, ast-grep) do the mechanical rewriting reliably where the change is structural.',
      '**Contract.** Once no call sites remain — verified by search, by lint, and ideally by a deprecation counter reported from production — delete the old path. This is the step teams skip, leaving both forms forever and doubling the maintenance surface. It belongs on the plan with an owner.',
      'The reason not to do it in one commit: 200 changed files cannot be meaningfully reviewed; the branch conflicts with every other change in flight; a rollback reverts unrelated work; and if something is wrong it is wrong everywhere simultaneously.',
      'If the module is published as a package, the same shape applies with versioning: deprecate in a minor release with a documented migration path and a warning, remove in the next major. Publishing a codemod alongside it is what turns "breaking change" into something consumers can actually adopt.',
      'Tests do most of the safety work. A comprehensive suite makes each migration batch verifiable; without one, this is exactly the situation where characterisation tests should be added around the affected behaviour first.',
      'And the question to ask before starting: is the change worth it? Two hundred call sites is a real cost. If the improvement is stylistic, the answer may be no — whereas if the old signature is a recurring source of bugs, the migration pays for itself.',
    ],
    keyPoints: [
      'Expand, migrate, contract — never one atomic 200-file change',
      'Support both forms during the transition; deprecate the old one visibly',
      'Lint or warn to stop new usages appearing mid-migration',
      'Use codemods for mechanical rewrites; batch by module or risk',
      'Actually delete the old path — assign the contract step an owner',
      'For published packages: deprecate in a minor, remove in a major, ship a codemod',
    ],
    commonMistakes: [
      'Leaving both signatures in place indefinitely.',
      'Attempting one atomic change that conflicts with everything in flight.',
    ],
    followUps: ['How do you know no call sites remain?', 'When is the migration not worth doing?'],
  },

  {
    id: 'iv-ep-comments',
    question: 'What belongs in a code comment?',
    topic: ARCH,
    level: L.JUNIOR,
    kind: K.ARCHITECTURE,
    topicIds: ['clean-code'],
    relatedLessons: ['l-m40-01', 'l-m45-02'],
    shortAnswer:
      'Why, not what. The code already says what it does; a comment should capture the reasoning a reader cannot recover — the constraint, the tradeoff, the bug being worked around, the link to the ticket. A comment explaining **what** usually means the code should be clearer instead.',
    deepAnswer: [
      'The comments that earn their place: a non-obvious constraint (`// The API caps page size at 100`), a workaround with a reference (`// Safari 15 fires this twice — see BUG-482`), a deliberate choice against the obvious one (`// Sequential on purpose: the endpoint rate-limits at 2 req/s`), and a warning about a consequence (`// Changing this order breaks the migration in 2024_03`).',
      'What all of those share is information that is **not in the code and not recoverable from it**. Someone reading the function can see what it does; they cannot see the constraint that forced it, and without the comment they will "clean it up" and reintroduce the bug.',
      'The comments that do not earn their place: restating the line (`// increment i`), section banners that exist because the function is too long, and commented-out code — version control already keeps that, and dead code in the file is noise that nobody dares delete.',
      'A comment explaining a confusing block is usually a signal to extract and name it. `// check if the user can edit` above five lines of conditions wants to be `if (canEdit(user, doc))`, where the name does the explaining and is checkable by the compiler and the tests.',
      'The maintenance problem is the real argument for restraint: comments are not executed, so nothing enforces that they stay true. A wrong comment is worse than none, because it is trusted. The fewer comments there are, the more likely each is accurate.',
      'API documentation is a separate category with different rules. A JSDoc block on an exported function — parameters, return value, thrown errors, an example — serves callers who will never read the body, and shows up in editor tooltips. That is worth writing even where inline comments would not be.',
      'And the honest boundary: "self-documenting code" is often used to justify no explanation at all. Good names remove the need to explain **what**; they cannot express **why this and not the obvious alternative**. That still needs a sentence.',
    ],
    keyPoints: [
      'Explain why — constraints, tradeoffs, workarounds, links to tickets',
      'The test: is this recoverable from the code alone?',
      'A comment explaining a block usually means extract and name it',
      'Delete commented-out code; version control has it',
      'Comments are unenforced and rot — a wrong one is worse than none',
      'JSDoc on exported functions is a separate, worthwhile category',
    ],
    commonMistakes: [
      'Restating the code in English.',
      'Using "self-documenting code" to justify omitting the reasoning.',
    ],
    followUps: ['Why is a wrong comment worse than no comment?', 'What does a section banner comment usually indicate?'],
  },

  /* ------------------------------------------------------------------- HTTP */
  {
    id: 'iv-ep-rest-graphql-rpc',
    question: 'From a front-end perspective, how do REST, GraphQL and RPC-style APIs differ?',
    topic: HTTP,
    level: L.INTERMEDIATE,
    kind: K.HTTP,
    topicIds: ['http', 'design-patterns'],
    relatedLessons: ['l-m26-01'],
    shortAnswer:
      'REST gives you fixed resource-shaped endpoints, so you often over-fetch or make several round trips. GraphQL lets the client specify exactly the fields it needs in one request, at the cost of a more complex client and weaker HTTP caching. RPC exposes named operations, which fits action-shaped work that does not map onto resources.',
    deepAnswer: [
      '**REST**: `GET /users/1`, `GET /users/1/posts`. Predictable, cacheable by URL, and it uses HTTP semantics — status codes, methods, `ETag`s — as designed. The friction is shape mismatch: a screen needing a user, their last three posts and a comment count either makes three requests (waterfall latency) or hits a bespoke endpoint someone added for that screen.',
      '**GraphQL**: one endpoint, and the query declares the fields. It eliminates over-fetching and lets one request satisfy a screen. The costs are real and worth naming: HTTP caching mostly stops working because everything is a `POST` to one URL, so caching moves into a client library; errors arrive as `200 OK` with an `errors` array, so status-code-based handling does not apply; and an unbounded query is a denial-of-service risk, which is why servers need depth and complexity limits.',
      '**RPC** (including tRPC and gRPC-web): named procedures — `createOrder`, `cancelSubscription`. It fits operations that are genuinely actions rather than resource manipulations, where forcing REST semantics produces awkward endpoints like `POST /orders/1/cancellation`. Typed RPC in a TypeScript monorepo gives end-to-end type safety with no schema duplication, which is a significant practical advantage.',
      'The front-end consequences that actually differ: **caching** (URL-based and free in REST; library-managed in GraphQL), **error handling** (status codes versus an errors array), **type safety** (GraphQL and typed RPC generate types; REST needs OpenAPI or hand-written ones), and **payload control** (only GraphQL lets the client decide).',
      'What does not differ: you still need loading, empty and error states; you still need to handle the network failing; and you still need to treat every response as untrusted input.',
      'The pragmatic view to express: this is usually not the front-end developer\'s decision, and all three work. The right answer to "which is better" is that it depends on how well the domain maps onto resources, whether many different clients need different shapes, and what the team can operate — not on which is newer.',
    ],
    keyPoints: [
      'REST: resource endpoints, free HTTP caching, over-fetching and waterfalls',
      'GraphQL: client-specified fields, one round trip, but caching moves into the client',
      'GraphQL errors arrive with `200 OK` — status-code handling does not apply',
      'RPC fits action-shaped operations; typed RPC gives end-to-end types',
      'The real differences are caching, error handling, type safety and payload control',
      'All three still need loading states, failure handling and untrusted-input treatment',
    ],
    commonMistakes: [
      'Claiming GraphQL is strictly better without naming the caching and DoS costs.',
      'Expecting HTTP status codes to signal GraphQL errors.',
    ],
    followUps: ['Why does GraphQL weaken HTTP caching?', 'When does REST feel forced?'],
  },

  {
    id: 'iv-ep-content-type',
    question: 'What do `Content-Type` and `Accept` do, and what breaks when they are wrong?',
    topic: HTTP,
    level: L.JUNIOR_PLUS,
    kind: K.HTTP,
    topicIds: ['http'],
    relatedLessons: ['l-m26-04', 'l-m26-03'],
    shortAnswer:
      '`Content-Type` describes the body you are sending; `Accept` states what you would like back. Getting `Content-Type` wrong means the server parses your body incorrectly — typically a JSON payload arriving as an empty object, which looks like a client bug and is not.',
    deepAnswer: [
      'Sending JSON requires both the header and the serialisation:\n\n```js\nawait fetch("/api/orders", {\n  method: "POST",\n  headers: { "Content-Type": "application/json" },\n  body: JSON.stringify(order),\n});\n```\n\nOmit the header and many servers default to treating the body as form-encoded, parse it as one field with a bizarre name, and hand your handler an empty object. The request succeeds, the data is lost, and nothing points at the header.',
      'The common body types: `application/json` for APIs; `application/x-www-form-urlencoded` for classic form posts; `multipart/form-data` for file uploads; and `text/plain`, which is one of the few types that does not trigger a CORS preflight.',
      'A detail that catches people out: when the body is a `FormData` object you must **not** set `Content-Type` yourself. The browser sets it and appends the multipart boundary; setting it manually omits the boundary and the server cannot parse the body at all.',
      '`Accept` is a request for a representation — `Accept: application/json` tells a server that can produce several formats which one you want. Many APIs ignore it and always return JSON, but it matters for content-negotiating servers, and an API returning an HTML error page to an API client is often a missing `Accept`.',
      'On the response side, `Content-Type` decides how you should read the body. Checking it before calling `res.json()` avoids the misleading `SyntaxError` you get when an error page or an empty `204` arrives instead of JSON.',
      'The CORS interaction is worth knowing: `application/json` is not a "simple" content type, so it triggers a preflight `OPTIONS` request. That is why nearly every cross-origin JSON API sees preflights, and why a request that works same-origin can fail cross-origin with no code change.',
      'Related headers in the same family: `Content-Encoding` for compression, `Content-Disposition` for downloads and filenames, and `X-Content-Type-Options: nosniff`, which stops the browser second-guessing a declared type — a real defence against a user-uploaded file being interpreted as script.',
    ],
    keyPoints: [
      '`Content-Type` describes what you send; `Accept` asks for what you want back',
      'Missing `Content-Type` on JSON silently yields an empty body server-side',
      'Never set `Content-Type` manually for `FormData` — the boundary is lost',
      'Check the response `Content-Type` before calling `res.json()`',
      '`application/json` triggers a CORS preflight; `text/plain` does not',
      '`nosniff` prevents the browser reinterpreting a declared type',
    ],
    commonMistakes: [
      'Setting `Content-Type: multipart/form-data` by hand for a `FormData` body.',
      'Calling `res.json()` without checking what the server actually returned.',
    ],
    followUps: ['Why does the boundary matter for multipart?', 'Why does JSON trigger a preflight?'],
  },

  /* ---------------------------------------------------------------- testing */
  {
    id: 'iv-ep-test-naming',
    question: 'What makes a good test name and a good assertion?',
    topic: TESTING,
    level: L.JUNIOR,
    kind: K.TESTING,
    topicIds: ['testing', 'clean-code'],
    relatedLessons: ['l-m42-01'],
    shortAnswer:
      'A name should state the behaviour and the condition, so a failure in CI is diagnosable without opening the file. An assertion should check one meaningful outcome with a specific matcher, so the failure message tells you what was wrong rather than just that something was.',
    deepAnswer: [
      'A useful name answers: what is being tested, under what condition, and what is expected. `"returns null when the user is not found"` beats `"test getUser"`. The test that fails at 3am is read as a line in a CI log, so the name is the primary diagnostic.',
      'A convention like `describe("getUser")` + `it("returns null when the user is not found")` composes into a readable sentence, which is why the `it` phrasing exists.',
      'Avoid names that describe implementation (`"calls the repository"`) — they date immediately and describe how rather than what.',
      'On assertions: prefer the specific matcher. `expect(list).toHaveLength(3)` fails with "expected length 3, received 5"; `expect(list.length === 3).toBe(true)` fails with "expected true, received false", which tells you nothing. Every framework has specific matchers for exactly this reason.',
      'One meaningful outcome per test, but not dogmatically one `expect`. Several assertions about the same behaviour are fine; several assertions about unrelated behaviours mean the first failure hides the rest, and the test name cannot describe both.',
      'Arrange-Act-Assert structure, with the arrangement kept minimal and visible. A test that depends on a large shared fixture is hard to read because the relevant input is somewhere else — inline the data that matters to this case, even at the cost of a little duplication. Duplication in tests is much cheaper than in production code, because tests are read individually.',
      'Assert on the observable outcome rather than on the mechanism: the returned value, the rendered text, the request that was sent. Asserting that an internal function was called ties the test to the implementation and breaks on refactors that change nothing a user can see.',
      'The final check: make the test fail on purpose. A test that passes whether or not the code works — usually a missing `await`, or an assertion inside a callback that never runs — is worse than no test, because it creates confidence without providing any.',
    ],
    keyPoints: [
      'Name the behaviour and the condition — the name is the CI diagnostic',
      'Do not name the implementation',
      'Use specific matchers so the failure message is informative',
      'One behaviour per test; multiple assertions about it are fine',
      'Inline the relevant fixture data; duplication in tests is cheap',
      'Assert observable outcomes, not internal calls',
      'Verify the test can actually fail',
    ],
    commonMistakes: [
      'Asserting `toBe(true)` on a computed boolean and losing the failure detail.',
      'Naming tests after the function only, so a CI failure says nothing.',
    ],
    followUps: ['Why is duplication acceptable in tests?', 'How do you prove a test can fail?'],
  },

  {
    id: 'iv-ep-snapshot-tests',
    question: 'What is a snapshot test good for, and how does it go wrong?',
    topic: TESTING,
    level: L.INTERMEDIATE,
    kind: K.TESTING,
    topicIds: ['testing', 'clean-code'],
    relatedLessons: ['l-m42-03'],
    shortAnswer:
      'It records the serialised output of something and fails when it changes. That is genuinely useful for small, stable, structured values. It goes wrong when the snapshot is large: nobody reviews the diff, updating becomes reflexive, and the test stops catching anything while still breaking on every change.',
    deepAnswer: [
      'The appeal is that it is cheap — no assertions to write, and any unintended change is detected. For a serialiser, a formatter, a generated configuration or a small component\'s output, that is a reasonable trade.',
      'The failure mode is specific and predictable. A 400-line snapshot of a rendered tree produces a diff nobody can evaluate, so the response to a failure becomes "run with `-u` and move on". At that point the test costs review time and provides no protection — the worst combination.',
      'It also encodes irrelevant detail. A snapshot of markup fails when a class name, a wrapper element or an attribute order changes, none of which a user can observe. That is implementation coupling by another name, and it makes refactoring expensive.',
      'The rules that keep them useful: keep each snapshot small enough to read in a diff; snapshot the **data** rather than the rendering where possible; use inline snapshots so the expected value sits next to the test instead of in a distant file; and never update a snapshot without reading what changed.',
      'For components, targeted assertions are usually better: `expect(screen.getByRole("button", { name: "Save" })).toBeEnabled()` states the intent, survives markup changes, and produces a meaningful failure. The snapshot says "something is different"; the assertion says what is wrong.',
      'Where snapshots genuinely shine is at boundaries with a stable contract — an API response shape, a generated SQL string, a serialised error format — because there the whole value **is** the contract, and any change to it should require a human decision.',
      'A related tool worth distinguishing: visual regression testing compares rendered screenshots rather than markup. It catches actual visual changes that a DOM snapshot misses entirely, at the cost of flakiness from font rendering and animation. Different tool, different failure mode — not a substitute for either assertions or snapshots.',
    ],
    keyPoints: [
      'Records serialised output and fails on any change — cheap to write',
      'Large snapshots stop being reviewed and updating becomes reflexive',
      'They encode irrelevant detail and couple tests to markup',
      'Keep them small, prefer data over rendering, and use inline snapshots',
      'Targeted role/text assertions are better for components',
      'Best at stable contracts; visual regression is a different tool again',
    ],
    commonMistakes: [
      'Snapshotting a whole component tree and calling it coverage.',
      'Updating a failing snapshot without reading the diff.',
    ],
    followUps: ['When is a snapshot clearly the right tool?', 'How does visual regression differ?'],
  },
];

export default questions;
