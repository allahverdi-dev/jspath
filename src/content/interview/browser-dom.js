import { INTERVIEW_KIND as K, INTERVIEW_LEVEL as L } from '../schema/types.js';

/**
 * Browser, DOM, events, forms, storage and HTTP.
 *
 * Frontend interviews lean heavily here, and the scenario questions matter as
 * much as the definitions — knowing what event delegation **is** is table stakes;
 * knowing when to reach for it is the actual signal.
 */

const TOPIC = 'Browser & DOM';

export const questions = [
  {
    id: 'iv-dom-event-delegation',
    question: 'What is event delegation and why does it work?',
    topic: TOPIC,
    level: L.JUNIOR_PLUS,
    kind: K.BROWSER,
    topicIds: ['events', 'dom', 'dom-manipulation'],
    relatedLessons: ['l-m19-01'],
    relatedChallenges: ['ch-dom-delegation'],
    shortAnswer:
      'Attach one listener to a common ancestor instead of one per child, and identify the real target from the event. It works because most events **bubble** up through ancestors — so the parent sees events that originated on any descendant, including elements added later.',
    deepAnswer: [
      'The mechanism is bubbling. After an event fires on its target, it propagates up through every ancestor, so a listener on the container receives events that started on any descendant.',
      '`event.target` is the deepest element the event actually originated on; `event.currentTarget` is the element whose listener is running. In delegation those differ, and confusing them is the classic bug — you almost always want `target` to find what was clicked and `currentTarget` for the container.',
      '`event.target.closest(selector)` is the piece that makes it robust. Clicking an icon **inside** a button should count as clicking the button; `target` alone reports the icon, and `closest` walks up to the nearest matching ancestor. Guarding with `container.contains(match)` prevents matching something above the container.',
      '**Why it matters, in order of importance.** First, it works for **dynamically added elements** — they need no wiring because the listener was never on them. Second, memory and setup cost: one listener rather than hundreds. Third, removal is one call.',
      'It also matters for **teardown correctness**: hundreds of individual listeners are hundreds of chances to leak by forgetting to remove one.',
      '**Limits worth naming**: some events do not bubble — `focus`, `blur`, `load`, and most notably `mouseenter`/`mouseleave`. Use `focusin`/`focusout` and `mouseover`/`mouseout` when you need delegated equivalents.',
    ],
    keyPoints: [
      'One listener on an ancestor; identify the origin from the event',
      'Works because most events bubble',
      '`target` is where it originated; `currentTarget` is where the listener is',
      '`closest(selector)` handles clicks on nested children',
      'Main benefit: dynamically added elements need no wiring',
      '`focus`, `blur`, `mouseenter`/`mouseleave` do not bubble',
    ],
    commonMistakes: [
      'Using `currentTarget` where `target` was needed.',
      'Claiming all events bubble.',
    ],
    followUps: [
      'Which events do not bubble, and what are the delegated alternatives?',
      'What is the difference between `target` and `currentTarget`?',
      'Why does `closest` matter here?',
    ],
  },

  {
    id: 'iv-dom-delegation-scenario',
    question: 'You render 500 rows, each with a nested delete icon, and rows are added dynamically. How do you handle the delete interaction?',
    topic: TOPIC,
    level: L.INTERMEDIATE,
    kind: K.SCENARIO,
    topicIds: ['events', 'dom-manipulation', 'performance'],
    relatedLessons: ['l-m19-01'],
    relatedChallenges: ['ch-dom-delegation', 'ch-dom-virtual-diff'],
    shortAnswer:
      'One click listener on the list container. Use `event.target.closest("[data-delete]")` to find the control, guard against clicks that miss it, read the row id from a `data-` attribute, and update state — then re-render. New rows work with no extra wiring.',
    deepAnswer: [
      '**The approach.** A single listener on the `<ul>` or table body. In the handler: `const button = event.target.closest("[data-delete]"); if (!button) return;` — that guard is essential, because most clicks in the container are not on a delete control. Then `const id = button.closest("[data-id]").dataset.id;` and dispatch the delete.',
      '**Why `closest` rather than checking `target` directly**: the icon inside the button is what receives the click, so an equality check against the button would fail. `closest` walks up from the icon and finds it.',
      '**Why delegation rather than 500 listeners**: the decisive reason is that rows are added dynamically. With per-row listeners, every new row needs wiring and every removed row needs unwiring, and forgetting the latter leaks. With delegation, neither is needed. The memory saving is real but secondary.',
      '**Identify by data, not by DOM position.** Reading the id from `dataset` rather than computing an index from the node\'s position means the handler stays correct if rows reorder or if the list is filtered.',
      '**State, then render.** Delete from the underlying array and re-render from it, rather than removing the `<li>` directly. Otherwise the DOM and the data diverge, and the next render resurrects the row.',
      '**What I would ask about first**: whether 500 rows are all rendered at once. If the list can grow large, virtualisation matters more than the listener strategy — but delegation is what makes virtualisation practical, since recycled rows need no re-wiring.',
      '**Accessibility**: the delete control must be a real `<button>` with an accessible name, so it is keyboard-reachable — delegation handles keyboard-triggered clicks identically, since activating a button fires a `click`.',
    ],
    keyPoints: [
      'One delegated listener on the container',
      '`closest()` to find the control from a nested icon',
      'Guard for clicks that match nothing',
      'Read the id from `data-` attributes, not DOM position',
      'Update state and re-render — do not remove the node directly',
      'Use a real `<button>` so keyboard activation works',
    ],
    commonMistakes: [
      'Removing the DOM node without updating the underlying data.',
      'Omitting the "no match" guard, so unrelated clicks throw.',
      'Using the row index instead of a stable id.',
    ],
    followUps: [
      'What if the list needs to be virtualised?',
      'How does this behave for keyboard users?',
      'Why read the id from a data attribute rather than the node index?',
    ],
  },

  {
    id: 'iv-dom-bubbling-capturing',
    question: 'Explain the phases of event propagation.',
    topic: TOPIC,
    level: L.INTERMEDIATE,
    kind: K.BROWSER,
    topicIds: ['events', 'dom'],
    relatedLessons: ['l-m19-01'],
    shortAnswer:
      'Three phases: **capture** from the root down to the target, **target** at the element itself, then **bubble** back up to the root. Listeners run in the bubble phase by default; pass `true` or `{ capture: true }` to run during capture.',
    deepAnswer: [
      'An event dispatched on an element travels the whole ancestor path twice. **Capturing** goes root → target, **target** fires on the element itself, and **bubbling** goes target → root.',
      'By default `addEventListener` registers for the bubble phase, which is why nested handlers fire innermost-first in most code. Registering with `{ capture: true }` puts the listener in the descending phase, so an outer capturing listener runs **before** an inner one.',
      '**Why capture exists in practice**: it lets an ancestor see an event before any descendant can act on it or stop it — useful for global interception, analytics, or a modal that must intercept clicks regardless of what a child does.',
      '**Stopping propagation**: `stopPropagation()` prevents the event travelling further along the path, and `stopImmediatePropagation()` additionally prevents other listeners **on the same element** from running. Both are worth using sparingly — they break delegation on ancestors, and a component that stops propagation can silently disable an application-level handler somewhere else.',
      '`preventDefault()` is orthogonal and often confused with these: it cancels the browser\'s **default action** (following a link, submitting a form, checking a checkbox) but does **not** stop propagation. `event.defaultPrevented` reports whether it was called.',
      '`event.stopPropagation()` inside a delegated handler is a particularly common source of "why did my other handler stop firing" bugs, which is a good concrete example to offer.',
    ],
    keyPoints: [
      'Capture (root→target), target, bubble (target→root)',
      'Listeners bubble by default; `{ capture: true }` opts into the descending phase',
      '`stopPropagation` halts travel; `stopImmediatePropagation` also blocks same-element listeners',
      '`preventDefault` cancels the default action, not propagation',
      'Stopping propagation can silently break ancestor delegation',
    ],
    commonMistakes: [
      'Conflating `preventDefault` with `stopPropagation`.',
      'Reaching for `stopPropagation` as a default, breaking delegated handlers elsewhere.',
    ],
    followUps: [
      'What is the difference between `stopPropagation` and `preventDefault`?',
      'When would a capturing listener be the right choice?',
      'What problem does `stopImmediatePropagation` solve?',
    ],
  },

  {
    id: 'iv-dom-textcontent-innerhtml',
    question: 'When would you use `textContent` versus `innerHTML`?',
    topic: TOPIC,
    level: L.JUNIOR,
    kind: K.SECURITY,
    topicIds: ['dom-manipulation', 'security', 'dom'],
    relatedLessons: ['l-m18-01', 'l-m44-01'],
    relatedChallenges: ['ch-str-escape-html'],
    shortAnswer:
      'Use `textContent` for any text — always, unless you specifically need to insert markup you control. `innerHTML` parses its input as HTML, so putting user-controlled data through it is an XSS vulnerability. `textContent` is also faster and cannot execute anything.',
    deepAnswer: [
      '`textContent` sets a text node — every character is displayed literally. `innerHTML` parses the string as HTML and builds real elements from it.',
      '**The security consequence.** If any part of that string came from a user, a URL, or an API, `innerHTML` lets them inject markup. `<img src=x onerror="...">` is the standard demonstration: it does not need a `<script>` tag, because inline event handlers execute. This is stored or reflected XSS, and it is the single most common frontend vulnerability class.',
      '**The default rule**: text goes through `textContent`. Reach for `innerHTML` only when you are inserting markup you authored, with no interpolated untrusted values — and even then, building elements with `createElement` is usually clearer.',
      '**If user content genuinely must contain markup** — a rich-text comment, for instance — the answer is a well-maintained sanitiser such as DOMPurify, applied server-side or before insertion. Writing your own regex-based sanitiser is a reliably bad idea: the attack surface includes nested encodings, malformed tags, `javascript:` URLs and mutation XSS, and hand-rolled filters have failed on all of them repeatedly.',
      '**Secondary benefits of `textContent`**: it is faster, because there is no HTML parsing; it does not destroy and recreate child nodes with attached listeners the way reassigning `innerHTML` does; and it does not trigger a reparse of a large subtree.',
      '`innerText` is a third option worth distinguishing: it is layout-aware (it respects CSS visibility and collapses whitespace as rendered), which makes it slower and means it can force a reflow. `textContent` returns the raw text regardless of styling.',
    ],
    keyPoints: [
      '`textContent` inserts literal text; `innerHTML` parses markup',
      'User data through `innerHTML` is XSS — `<img onerror>` needs no `<script>`',
      'Default to `textContent`; use `createElement` for structure',
      'For genuine rich text, use a maintained sanitiser, never a homemade regex',
      '`textContent` is faster and does not destroy existing nodes',
      '`innerText` is layout-aware and can force reflow',
    ],
    commonMistakes: [
      'Believing an XSS payload needs a `<script>` tag.',
      'Proposing a hand-written regex sanitiser.',
    ],
    followUps: [
      'How would an attacker exploit `innerHTML` without a `<script>` tag?',
      'What if the content legitimately needs to be rich text?',
      'How does `innerText` differ from `textContent`?',
    ],
  },

  {
    id: 'iv-dom-queryselector-getelementbyid',
    question: 'Compare `querySelector`, `getElementById` and `getElementsByClassName`.',
    topic: TOPIC,
    level: L.JUNIOR,
    kind: K.COMPARISON,
    topicIds: ['dom', 'dom-manipulation'],
    relatedLessons: ['l-m17-01'],
    shortAnswer:
      '`getElementById` is fastest and returns one element or `null`. `querySelector`/`querySelectorAll` accept any CSS selector and return a **static** result. `getElementsByClassName` returns a **live** `HTMLCollection` that updates as the DOM changes — which is the difference that actually causes bugs.',
    deepAnswer: [
      '`getElementById(id)` — one element or `null`, and the fastest because ids are indexed. It exists only on `document`, not on elements.',
      '`querySelector(sel)` — the first match for any CSS selector, or `null`. `querySelectorAll(sel)` — a **static** `NodeList` snapshot. Both work on `document` and on any element, which makes scoped queries easy.',
      '`getElementsByClassName` / `getElementsByTagName` — a **live** `HTMLCollection`. This is the important distinction: the collection reflects the DOM as it changes. Looping forward over a live collection while removing elements skips items, because the collection shrinks underneath the loop — the same bug shape as splicing an array during a forward loop.',
      '**Static versus live** is the answer an interviewer is listening for. `querySelectorAll` gives a snapshot that stays put; that is usually what you want, and it is why converting a live collection to an array with `Array.from` is a common defensive step.',
      '**Iterability**: a modern `NodeList` is iterable, so `for...of` and spread work. An `HTMLCollection` is **not** iterable, so `[...collection]` throws while `Array.from(collection)` succeeds.',
      '**Performance**: the difference matters only in tight loops over large documents. `getElementById` wins on a micro level, but selecting once and caching the reference matters far more than which method you used.',
    ],
    keyPoints: [
      '`getElementById`: one element or `null`, fastest, `document` only',
      '`querySelector`/`All`: any CSS selector, static result, works on elements too',
      '`getElementsByClassName`: **live** `HTMLCollection`',
      'Live collections break forward loops that remove elements',
      '`NodeList` is iterable; `HTMLCollection` is not — use `Array.from`',
    ],
    commonMistakes: [
      'Not knowing which return a live collection.',
      'Spreading an `HTMLCollection`.',
    ],
    followUps: [
      'Show me a bug caused by a live collection.',
      'Why does spread fail on an `HTMLCollection`?',
      'Does `querySelectorAll` update if the DOM changes?',
    ],
  },

  {
    id: 'iv-dom-reflow-repaint',
    question: 'What causes layout thrashing, and how do you avoid it?',
    topic: TOPIC,
    level: L.ADVANCED,
    kind: K.PERFORMANCE,
    topicIds: ['performance', 'dom-manipulation', 'dom'],
    relatedLessons: ['l-m43-01'],
    shortAnswer:
      'Interleaving DOM writes with reads of layout properties like `offsetHeight` forces the browser to recalculate layout synchronously on every iteration. Batch all reads first, then all writes — or use `requestAnimationFrame` to group the writes.',
    deepAnswer: [
      'The browser batches style and layout work: it queues changes and recalculates once before painting. That optimisation is defeated when you **read** a value that depends on layout, because the browser must flush all pending changes to answer accurately.',
      '**Layout-forcing reads** include `offsetTop/Left/Width/Height`, `clientWidth/Height`, `scrollTop/Height`, `getBoundingClientRect()` and `getComputedStyle()`.',
      '**The thrashing pattern**: a loop that reads `element.offsetHeight` and then writes `element.style.height`. Each write invalidates layout; each read forces a synchronous recalculation. An O(n) loop becomes O(n) **full layout passes**, which on a large DOM is catastrophic — this is a genuine cause of multi-second jank.',
      '**The fix is to separate the phases.** Read every value you need into variables first, then perform every write. Same work, one layout pass instead of n.',
      '**`requestAnimationFrame`** batches writes into the frame before paint, which both groups them and aligns them with the render cycle. Libraries like FastDOM formalise the read-then-write split.',
      'Other reductions worth naming: build a subtree off-document (or in a `DocumentFragment`) and insert once rather than appending in a loop; animate `transform` and `opacity`, which can be composited without layout, rather than `top`/`left`/`width`; and use `content-visibility` or virtualisation for very long lists.',
      '**The discipline that matters most**: measure with the Performance panel before optimising. "Layout thrashing" is a specific, observable pattern in a flame chart — long purple layout bars in a loop — not something to guess at.',
    ],
    keyPoints: [
      'Reading a layout property forces a synchronous recalculation of pending writes',
      'Read-write-read-write in a loop causes n layout passes',
      'Layout-forcing reads: `offsetHeight`, `getBoundingClientRect`, `getComputedStyle`, `scrollTop`',
      'Fix: batch all reads, then all writes; or use `requestAnimationFrame`',
      'Prefer `transform`/`opacity`; build subtrees off-document',
      'Measure in the Performance panel before optimising',
    ],
    commonMistakes: [
      'Naming the fix as "use `requestAnimationFrame`" without explaining the read/write split.',
      'Claiming specific millisecond figures without measurement.',
    ],
    followUps: [
      'Which property reads force layout?',
      'Why are `transform` and `opacity` cheaper to animate?',
      'How would you confirm this is the actual bottleneck?',
    ],
  },

  {
    id: 'iv-dom-forms-validation',
    question: 'How do you handle form validation, and is client-side validation enough?',
    topic: TOPIC,
    level: L.JUNIOR_PLUS,
    kind: K.SECURITY,
    topicIds: ['forms', 'security', 'events'],
    relatedLessons: ['l-m20-01', 'l-m44-01'],
    shortAnswer:
      'Client-side validation is a **user-experience** feature, never a security control. It gives fast feedback; the server must re-validate everything because anyone can bypass the browser entirely with a direct request.',
    deepAnswer: [
      '**Client-side** validation exists to give immediate, specific feedback: validate a field on `blur` once touched, re-validate on submit, show a message per field, and move focus to the first invalid field so the user is not hunting.',
      '**It provides zero security.** An attacker does not use your form. They send a request directly with `curl` or a script, at which point every client-side check is irrelevant. The same applies to disabled buttons, hidden fields and `maxlength` attributes — all are trivially bypassed.',
      'So the server must **re-validate everything**: types, ranges, required fields, authorisation to perform the action, and business rules. The client duplicates a subset of that purely for responsiveness.',
      '**Native constraint validation** — `required`, `type="email"`, `pattern`, `min`/`max` — is worth using because it works without JavaScript and is accessible by default. The Constraint Validation API (`checkValidity()`, `setCustomValidity()`, `validity` flags) lets you keep native semantics while customising the messages, rather than reimplementing everything.',
      '**Accessibility details** that separate a good answer: associate the message with the field via `aria-describedby`, mark the field `aria-invalid="true"`, and make sure the error is announced — a message that only appears visually is invisible to a screen reader user.',
      '**Do not validate email with a complex regex.** The full RFC grammar is famously not practically regex-able, and aggressive patterns reject valid addresses. A loose shape check plus a confirmation email is the correct approach.',
    ],
    keyPoints: [
      'Client-side validation is UX; the server must re-validate everything',
      'Disabled buttons, hidden fields and `maxlength` are not security',
      'Validate on blur once touched, and again on submit; focus the first error',
      'Native constraint validation works without JS and is accessible',
      '`aria-describedby` + `aria-invalid` so errors are announced',
      'Do not attempt a strict email regex',
    ],
    commonMistakes: [
      'Treating client-side validation as a security boundary.',
      'Showing errors visually only, with no accessible association.',
    ],
    followUps: [
      'Why is a disabled submit button not a security control?',
      'How should an error be exposed to a screen reader?',
      'Why not validate email addresses with a strict regex?',
    ],
  },

  {
    id: 'iv-dom-storage-comparison',
    question: 'Compare `localStorage`, `sessionStorage` and cookies.',
    topic: TOPIC,
    level: L.JUNIOR_PLUS,
    kind: K.COMPARISON,
    topicIds: ['storage', 'security', 'http'],
    relatedLessons: ['l-m27-01'],
    shortAnswer:
      '`localStorage` persists until cleared; `sessionStorage` lasts for the tab. Both are origin-scoped, synchronous, string-only, around 5–10MB, and readable by any JavaScript on the page. Cookies are smaller, sent with every matching request, and can be `HttpOnly` — which is why tokens belong there, not in `localStorage`.',
    deepAnswer: [
      '**Lifetime.** `localStorage` survives restarts until explicitly cleared. `sessionStorage` is per-tab and dies with it — a second tab on the same origin gets its own, separate store, which surprises people.',
      '**Shared traits.** Both are scoped to the origin, store **strings only** (so objects need `JSON.stringify`, with all the losses that implies), have roughly a 5–10MB quota, and are **synchronous** — a large read or write blocks the main thread, which matters on low-end devices.',
      '**Cookies** are ~4KB, are attached to every matching request automatically (which costs bandwidth on every call), and have attributes storage does not: `Expires`/`Max-Age`, `Domain`, `Path`, `Secure`, `SameSite`, and crucially **`HttpOnly`**.',
      '**The security point, which is the one that matters.** Anything in `localStorage` or `sessionStorage` is readable by any JavaScript running on the page — including injected script from an XSS. So a token in `localStorage` is exfiltrable the moment you have one XSS bug anywhere on the origin. An `HttpOnly` cookie cannot be read by JavaScript at all, which is why session tokens belong in `HttpOnly`, `Secure`, `SameSite` cookies.',
      'The honest caveat: `HttpOnly` cookies bring CSRF exposure precisely because they are sent automatically, so they need `SameSite` and, for sensitive actions, anti-CSRF tokens. Neither option is free; the trade-off is XSS-exfiltration risk versus CSRF risk, and the standard answer is cookies plus CSRF defences.',
      '**Never store secrets in any of them.** Anything shipped to the browser is visible to the user — there is no such thing as a client-side secret.',
      'For larger or structured data, **IndexedDB** is the right tool: asynchronous, much larger quota, and stores structured values rather than strings.',
    ],
    keyPoints: [
      '`localStorage` persists; `sessionStorage` is per-tab',
      'Both: origin-scoped, string-only, ~5–10MB, synchronous',
      'Cookies: ~4KB, sent on every request, support `HttpOnly`/`Secure`/`SameSite`',
      'Web Storage is readable by any script — XSS exfiltrates tokens',
      '`HttpOnly` cookies resist XSS but need CSRF protection',
      'IndexedDB for large or structured data',
    ],
    commonMistakes: [
      'Recommending `localStorage` for auth tokens without mentioning XSS.',
      'Forgetting that Web Storage is synchronous.',
    ],
    followUps: [
      'Where would you store a session token, and why?',
      'What does `HttpOnly` protect against, and what does it not?',
      'When would you reach for IndexedDB?',
    ],
  },

  {
    id: 'iv-dom-cors',
    question: 'What is CORS? Is it a security mechanism that protects your API?',
    topic: TOPIC,
    level: L.INTERMEDIATE,
    kind: K.HTTP,
    topicIds: ['http', 'security', 'web-apis'],
    relatedLessons: ['l-m26-01', 'l-m44-01'],
    shortAnswer:
      'CORS is a **browser** mechanism that relaxes the same-origin policy, letting a server opt into being read by pages from other origins. It protects users from malicious pages reading data they should not — it does **not** protect your API, which still needs real authentication and authorisation.',
    deepAnswer: [
      'By default the same-origin policy stops a page reading a response from a different origin. CORS is how a server says "these origins may read my responses", via `Access-Control-Allow-Origin` and related headers.',
      '**Enforcement is in the browser.** The request often still reaches your server and still executes; the browser then refuses to hand the response to the page. That single fact answers most CORS misconceptions.',
      '**It is not API security.** `curl`, Postman, a mobile app and any server-side client ignore CORS entirely. If your endpoint returns sensitive data to anyone who asks, CORS changes nothing — you need authentication and authorisation. What CORS protects is the **user**: it stops a random page they visit from silently reading their authenticated responses from your API.',
      '**Preflight.** For requests that are not "simple" — a non-standard method, a custom header, certain content types — the browser first sends an `OPTIONS` request. The server must answer with the allowed origin, methods and headers before the real request is sent. A surprising number of "CORS errors" are actually a missing or misconfigured `OPTIONS` handler.',
      '**Credentials.** With `credentials: "include"`, the server must send `Access-Control-Allow-Credentials: true` **and** an explicit origin — the wildcard `*` is rejected in that combination, deliberately.',
      '**Who fixes it**: the **server** owner, by sending the right headers. Front-end "fixes" are not fixes — `mode: "no-cors"` gives you an opaque response you cannot read, disabling browser security flags only changes your own machine, and a proxy just moves the request server-side where CORS does not apply. In development, a dev-server proxy is a legitimate convenience; in production, the API must send correct headers.',
    ],
    keyPoints: [
      'A browser mechanism relaxing the same-origin policy',
      'Enforced client-side — the request usually still reaches the server',
      'Protects users, not your API; auth is still required',
      'Preflight `OPTIONS` for non-simple requests',
      '`Allow-Credentials` cannot be combined with `*`',
      'Fixed by the server sending headers, not by the frontend',
    ],
    commonMistakes: [
      '"Disable CORS in the frontend" — there is nothing to disable client-side.',
      'Using `mode: "no-cors"` and being confused by an unreadable opaque response.',
      'Believing CORS prevents non-browser clients calling the API.',
    ],
    followUps: [
      'Why does `mode: "no-cors"` not solve the problem?',
      'What triggers a preflight request?',
      'If CORS is not API security, what is?',
    ],
  },

  {
    id: 'iv-dom-http-methods',
    question: 'What does it mean for an HTTP method to be idempotent, and why does it matter?',
    topic: TOPIC,
    level: L.INTERMEDIATE,
    kind: K.HTTP,
    topicIds: ['http', 'errors'],
    relatedLessons: ['l-m26-01'],
    shortAnswer:
      'An idempotent request produces the same server state whether made once or many times. `GET`, `PUT` and `DELETE` are idempotent; `POST` and `PATCH` generally are not. It matters because only idempotent operations are safe to retry automatically.',
    deepAnswer: [
      '**Safe** methods do not change state at all — `GET`, `HEAD`, `OPTIONS`. **Idempotent** methods may change state, but repeating them lands on the same result: `PUT` sets a resource to a given value, so doing it three times is the same as once; `DELETE` removes it, and deleting again leaves it deleted.',
      '`POST` is neither — three POSTs to `/orders` create three orders. `PATCH` is usually not idempotent either, since a partial update like "increment quantity by 1" compounds.',
      '**Why it matters practically**: retry logic. A network timeout leaves you genuinely unsure whether the server processed the request. Retrying an idempotent request is safe. Retrying a `POST` may duplicate an order or a payment. This is the concrete reason to know the distinction.',
      'When a non-idempotent operation must be retriable, the standard solution is an **idempotency key**: the client generates a unique key per logical operation and sends it as a header; the server records it and returns the original result for a repeat rather than performing the work twice. Payment APIs do exactly this.',
      'Status codes worth having straight: 200 OK, 201 Created (with a `Location`), 204 No Content, 400 bad request, 401 unauthenticated, 403 authenticated but not permitted, 404 not found, 409 conflict, 422 validation failure, 429 rate-limited, 500 server error, 503 unavailable. The 401/403 distinction — "who are you?" versus "I know who you are and no" — is a frequent follow-up.',
      'Caching also keys off this: `GET` responses are cacheable by default; `POST` responses generally are not.',
    ],
    keyPoints: [
      'Safe: no state change. Idempotent: repeating gives the same state',
      '`GET`, `PUT`, `DELETE` idempotent; `POST`, usually `PATCH`, not',
      'Only idempotent requests are safe to retry blindly',
      'Idempotency keys make `POST` safely retriable',
      '401 = unauthenticated, 403 = authenticated but forbidden',
    ],
    commonMistakes: [
      'Confusing "safe" with "idempotent" — `DELETE` is idempotent but not safe.',
      'Retrying `POST` requests in a generic retry helper.',
    ],
    followUps: [
      'How would you make a payment request safely retriable?',
      'What is the difference between 401 and 403?',
      'Is `PATCH` idempotent?',
    ],
  },

  {
    id: 'iv-dom-xss',
    question: 'What is XSS and how do you prevent it in a frontend application?',
    topic: TOPIC,
    level: L.INTERMEDIATE,
    kind: K.SECURITY,
    topicIds: ['security', 'dom-manipulation'],
    relatedLessons: ['l-m44-01'],
    relatedChallenges: ['ch-str-escape-html'],
    shortAnswer:
      'Cross-site scripting is attacker-controlled content being executed as code in your page. Prevent it by treating all untrusted data as text — `textContent`, not `innerHTML` — sanitising with a maintained library when rich content is genuinely required, and adding a Content Security Policy as defence in depth.',
    deepAnswer: [
      'XSS happens when data crosses into a code context. The main varieties: **stored** (persisted on the server and served to others — the most damaging), **reflected** (echoed back from a URL parameter), and **DOM-based** (entirely client-side, where JavaScript writes untrusted data into a dangerous sink).',
      '**The dangerous sinks** are worth naming: `innerHTML`, `outerHTML`, `document.write`, `insertAdjacentHTML`, `eval`, `new Function`, assigning to an `on*` handler, and setting `src`/`href` to a `javascript:` URL.',
      '**The primary defence is context-correct output encoding**, and in practice that means: render untrusted data as **text**. `textContent` cannot execute anything. Frameworks like React escape interpolated values by default, which is why `dangerouslySetInnerHTML` is deliberately named to make you stop.',
      '**Escaping is context-dependent**, which is the nuance that separates a real answer. Escaping for HTML body text is not sufficient inside an attribute, a URL, a `<script>` block or a CSS context — each needs its own encoding. This is why "just escape it" is an incomplete answer and why using a framework\'s built-in handling is safer than hand-rolling.',
      '**If rich content is required**, use a maintained sanitiser like DOMPurify, and prefer sanitising as late as possible. Do not write your own — mutation XSS and encoding tricks have defeated hand-written filters repeatedly.',
      '**Defence in depth**: a Content Security Policy that disallows inline scripts limits the damage of a bug that slips through; `HttpOnly` cookies mean a successful XSS cannot read the session token; and validating URLs before using them as `href` prevents `javascript:` injection.',
      'I would not describe attack payloads beyond the minimum needed to explain the sink — the useful part of this answer is the defence.',
    ],
    keyPoints: [
      'Untrusted data reaching a code context',
      'Stored, reflected and DOM-based varieties',
      'Sinks: `innerHTML`, `document.write`, `eval`, `on*` handlers, `javascript:` URLs',
      'Primary defence: render as text (`textContent`); frameworks escape by default',
      'Escaping is context-specific — HTML, attribute, URL and CSS differ',
      'Rich content: a maintained sanitiser, never homemade',
      'Defence in depth: CSP, `HttpOnly` cookies, URL validation',
    ],
    commonMistakes: [
      'Believing escaping once is sufficient for every context.',
      'Proposing a hand-written sanitiser.',
      'Treating CSP as a primary defence rather than a backstop.',
    ],
    followUps: [
      'Why is escaping context-dependent?',
      'What does a CSP actually buy you?',
      'How does React protect against this by default?',
    ],
  },

  {
    id: 'iv-dom-debug-listener-leak',
    question: 'This component leaks memory and eventually fires handlers multiple times. Why?',
    topic: TOPIC,
    level: L.INTERMEDIATE,
    kind: K.DEBUGGING,
    topicIds: ['events', 'performance', 'closures'],
    relatedLessons: ['l-m19-01', 'l-m43-01'],
    relatedChallenges: ['ch-dom-observer-cleanup'],
    code:
      'function mountWidget(container, data) {\n' +
      '  function onResize() {\n' +
      '    render(container, data);\n' +
      '  }\n' +
      '\n' +
      '  window.addEventListener("resize", onResize);\n' +
      '  container.innerHTML = "";\n' +
      '  render(container, data);\n' +
      '}',
    shortAnswer:
      'Every call adds another `resize` listener and never removes one. After n mounts, one resize event triggers n renders, and every old `onResize` closure keeps its `container` and `data` alive — so nothing can be garbage collected.',
    deepAnswer: [
      '**Two symptoms, one cause.** The listener is added to `window`, which outlives the widget, and nothing ever removes it. Mount the widget five times and `window` holds five listeners; a single resize runs `render` five times, with four of them targeting stale containers.',
      '**The leak.** Each `onResize` closure captures `container` and `data`. Because `window` holds a reference to the closure, both stay reachable forever — including detached DOM nodes, which is the classic detached-node leak visible in a heap snapshot.',
      '**The fix is a teardown.** Return a cleanup function that removes the listener:',
      '```\nreturn () => window.removeEventListener("resize", onResize);\n```',
      'and call it when the widget is destroyed. `removeEventListener` matches on **the same function reference**, so `onResize` must be the identical object — passing an inline arrow or a fresh `.bind(this)` removes nothing, which is a very common follow-up mistake.',
      '**`AbortController` is the tidier modern option**: pass `{ signal }` to `addEventListener` and a single `controller.abort()` removes every listener registered with that signal at once — much harder to get wrong than tracking each removal.',
      '**A second issue worth flagging**: a `resize` handler that re-renders on every event will fire dozens of times per drag. It should be throttled (or scheduled with `requestAnimationFrame`), which is a performance bug independent of the leak.',
      '**How to confirm it**: take a heap snapshot, mount and unmount repeatedly, snapshot again, and look for a growing count of detached nodes and listener objects. Chrome DevTools also lists an element\'s listeners directly.',
    ],
    keyPoints: [
      'Listeners on `window` outlive the component and are never removed',
      'n mounts → n handlers firing per event',
      'Each closure retains `container` and `data` — detached-node leak',
      'Return a cleanup; `removeEventListener` needs the same function reference',
      '`AbortController` + `{ signal }` removes many listeners at once',
      'Separately, `resize` should be throttled or rAF-scheduled',
    ],
    commonMistakes: [
      'Trying to remove a listener with a new inline arrow or a fresh `bind`.',
      'Fixing the leak but not noticing the unthrottled resize handler.',
    ],
    followUps: [
      'Why does removing with `fn.bind(this)` fail?',
      'How would you confirm the leak in DevTools?',
      'How would you handle the resize frequency?',
    ],
  },

  {
    id: 'iv-dom-fragment',
    question: 'What is a `DocumentFragment` and when is it worth using?',
    topic: TOPIC,
    level: L.INTERMEDIATE,
    kind: K.PERFORMANCE,
    topicIds: ['dom-manipulation', 'performance', 'dom'],
    relatedLessons: ['l-m18-01'],
    relatedChallenges: ['ch-dom-build-list'],
    shortAnswer:
      'A lightweight container that is not part of the live document. Build a subtree inside it, then insert it once — the browser does one layout pass instead of one per element. Appending the fragment moves its children in and leaves the fragment empty.',
    deepAnswer: [
      'Appending 500 elements one at a time to a live parent can trigger layout work repeatedly. Building them in a `DocumentFragment` and appending it once means a single insertion into the live tree.',
      'When appended, the fragment\'s **children are moved** into the target and the fragment is left empty — it does not appear in the DOM itself, so there is no wrapper element.',
      '**The honest caveat**: modern browsers batch DOM mutations well, so the difference is smaller than it used to be and often unmeasurable for small lists. Appending to an element that is **not yet in the document** achieves much the same thing. Claiming a large speedup without measuring is the kind of overstatement an interviewer will probe.',
      'Where it clearly still helps is large batch insertions, and where it always helps is **readability** — assembling a subtree and inserting it once expresses the intent better than incremental appends.',
      '`element.replaceChildren(...nodes)` is often the better modern tool for "replace all the contents", clearing and inserting in one call without an intermediate fragment.',
      'The genuinely bigger wins for long lists are elsewhere: virtualisation so only visible rows exist, and keyed reconciliation so unchanged rows are not recreated — which also preserves focus and scroll position that a full innerHTML rebuild destroys.',
    ],
    keyPoints: [
      'An off-document container; insert once instead of n times',
      'Its children are moved on append; the fragment itself never appears',
      'Modern browsers batch well — the gain is smaller than often claimed',
      '`replaceChildren` is usually the better "replace contents" tool',
      'For long lists, virtualisation and keyed updates matter far more',
    ],
    commonMistakes: [
      'Claiming a dramatic speedup without measurement.',
      'Not knowing the fragment is emptied when appended.',
    ],
    followUps: [
      'How would you verify it actually helps here?',
      'What does `replaceChildren` do?',
      'What is the bigger win for a 10,000-row list?',
    ],
  },

  {
    id: 'iv-dom-accessibility-basics',
    question: 'What makes an interactive widget accessible, and why prefer a `<button>` over a `<div>`?',
    topic: TOPIC,
    level: L.INTERMEDIATE,
    kind: K.BROWSER,
    topicIds: ['dom', 'events', 'forms'],
    relatedLessons: ['l-m20-01'],
    relatedChallenges: ['ch-dom-keyboard-nav'],
    shortAnswer:
      'A native `<button>` gives keyboard focus, Enter and Space activation, a focus indicator, and the correct role announced to assistive technology — all for free. A clickable `<div>` provides none of it, so you must reimplement every one correctly.',
    deepAnswer: [
      'Using a `<div onclick>` means adding, by hand: `tabindex="0"` for focusability, keydown handling for **both** Enter and Space (they behave differently on native buttons), `role="button"`, a visible focus style, and disabled-state handling. Each is a chance to get it wrong, and the failure is invisible to a mouse user testing their own work.',
      '**The first rule of ARIA is that no ARIA is better than bad ARIA** — a native element with correct semantics beats a `div` patched with attributes.',
      '**What a widget needs generally**: keyboard operability for everything reachable by mouse; a visible focus indicator; an accessible name (visible text, `aria-label`, or `aria-labelledby`); correct state exposure (`aria-expanded` on a disclosure, `aria-selected` on a tab, `aria-invalid` on a bad field); and focus management for overlays — trap focus inside a modal and return it to the trigger on close.',
      '**Composite widgets** like tabs, menus and listboxes use a single tab stop with arrow-key navigation: one item has `tabindex="0"` and the rest `-1`. Tab moves past the whole widget; arrows move within it. That is the pattern the WAI-ARIA Authoring Practices describe, and following it is better than inventing one.',
      '**Live regions** (`aria-live`) announce dynamic changes that are not tied to focus — a validation summary or a "saved" toast.',
      '**Testing**: tab through the interface with the mouse untouched, check the accessibility tree in DevTools, and run axe. Automated tools catch perhaps a third of issues; keyboard-only navigation catches most of the rest.',
    ],
    keyPoints: [
      'Native `<button>`: focusable, Enter/Space, focus ring, correct role — free',
      'A `div` requires `tabindex`, both key handlers, `role`, and focus styling',
      'No ARIA beats bad ARIA',
      'Expose state: `aria-expanded`, `aria-selected`, `aria-invalid`',
      'Modals: trap focus, restore it to the trigger on close',
      'Composite widgets: one tab stop plus arrow keys',
      'Test with keyboard only; automation catches roughly a third',
    ],
    commonMistakes: [
      'Adding `role="button"` and considering it done, without keyboard handling.',
      'Removing focus outlines for aesthetics with no replacement.',
    ],
    followUps: [
      'Why do Enter and Space both need handling on a fake button?',
      'How does focus management work for a modal?',
      'What does a single-tab-stop widget look like?',
    ],
  },

  {
    id: 'iv-dom-architecture-scenario',
    question: 'A single 2,000-line file contains API calls, DOM rendering, validation, state and event listeners. How would you improve it?',
    topic: TOPIC,
    level: L.ADVANCED,
    kind: K.ARCHITECTURE,
    topicIds: ['modules', 'clean-code', 'testing', 'design-patterns'],
    relatedLessons: ['l-m28-01', 'l-m40-01'],
    shortAnswer:
      'Separate by responsibility with a one-directional dependency flow: data access, pure state and business logic, rendering, and event wiring. The immediate payoff is testability — pure logic can be tested without a DOM or a network — and the ability to change one concern without touching the others.',
    deepAnswer: [
      '**The concrete split** I would aim for: an `api` layer that is the only place that talks to the network; a `state` layer holding data and the **pure** functions that derive from it, with no DOM access; a `render` layer that turns state into DOM and contains no business logic; an `events` layer wiring user input to state changes; and a small `main` that composes them.',
      '**Dependency direction matters more than the file names.** State must not import render; render must not fetch. If everything imports everything, you have the same tangle in more files. I would write the intended direction down and check the actual imports against it.',
      '**Why it pays off, concretely.** Pure state functions are testable with no jsdom, no mocks and no network — which means they actually get tested. Swapping `localStorage` for a real backend touches one file. And a rendering bug is findable because rendering is the only thing that touches the DOM.',
      '**How I would approach it on a real codebase**, which is what an interviewer is really asking: not a big-bang rewrite. Get characterisation tests around current behaviour first, then extract the least-coupled piece — usually pure helpers, then the API layer — incrementally, keeping it shippable throughout. A rewrite that takes three months and reintroduces old bugs is a worse outcome than a slower, safe extraction.',
      '**What I would not impose**: a specific folder convention, a framework, or an architecture pattern chosen in advance. The right split depends on how this application actually changes — if every feature touches all layers, a feature-based split may serve better than a technical-layer one.',
      '**The signal I would look for first**: which parts change most often together. Things that change together belong together; that is more informative than any diagram.',
    ],
    keyPoints: [
      'Split by responsibility: api, state (pure), render, events, composition root',
      'Enforce a one-directional dependency flow, not just more files',
      'Payoff: pure logic testable without DOM or network',
      'Refactor incrementally behind characterisation tests, not a big-bang rewrite',
      'Let change patterns decide layer-based versus feature-based grouping',
      'Do not impose a folder structure without context',
    ],
    commonMistakes: [
      'Proposing one universal folder structure as the answer.',
      'Recommending a full rewrite rather than incremental extraction.',
      'Splitting files without fixing the dependency direction.',
    ],
    followUps: [
      'How would you do this safely on a codebase with no tests?',
      'When is a feature-based split better than a layer-based one?',
      'How do you stop the tangle re-forming?',
    ],
  },
];

export default questions;
