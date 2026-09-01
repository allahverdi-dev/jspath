import { SHEET_CATEGORY as C, SHEET_GROUP as G } from '../schema/types.js';

/**
 * Three sheets closing genuine curriculum gaps found by the coverage review:
 * loops/iteration (m11 + m35), numbers/dates (m06 + m16) and browser
 * storage/Web APIs (m27). All three are high-frequency, trap-heavy areas that
 * the other sheets only touch in passing.
 */

export default [
  {
    id: 'cs-loops',
    slug: 'loops-iteration',
    title: 'Loops & Iteration',
    category: C.LANGUAGE,
    icon: 'repeat',
    aliases: ['loops', 'for of', 'for in', 'while', 'break continue', 'iterable', 'generator', 'yield'],
    topicIds: ['loops', 'iterators'],
    description: 'Which loop to reach for, why `for...in` is wrong for arrays, and how iterables and generators fit.',
    groups: [
      {
        title: 'Choose a loop',
        kind: G.TABLE,
        columns: ['Need', 'Use', 'Gives you'],
        rows: [
          ['array **values**', '`for...of`', 'each value; `break` and `await` work'],
          ['**object** keys', '`for...in`', 'string keys — **including inherited**'],
          ['index arithmetic / step', 'counted `for`', 'full control'],
          ['remove while looping', 'counted `for`, **backwards**', 'no skipped elements'],
          ['unknown iteration count', '`while`', 'condition-driven'],
          ['run at least once', '`do...while`', 'body first, then test'],
          ['side effect per item', '`forEach`', '**cannot `break`**'],
          ['transform / select / fold', '`map` / `filter` / `reduce`', 'states the intent'],
        ],
      },
      {
        title: 'for...of vs for...in',
        kind: G.SNIPPETS,
        entries: [
          { code: 'for (const value of ["a", "b"]) { … }   // "a", "b"\nfor (const key in ["a", "b"]) { … }     // "0", "1" — STRINGS', description: '`for...in` gives **string keys**, walks the prototype chain, and puts integer-like keys first. **Never use it on an array.**' },
          { code: 'for (const [i, value] of arr.entries()) { … }', description: 'The clean way to get index **and** value from `for...of`.' },
          { code: 'for (const key in obj) {\n  if (!Object.hasOwn(obj, key)) continue;\n}', description: 'Guard inherited keys — or avoid the issue entirely with `Object.entries(obj)`.' },
          { code: 'for (const x of { a: 1 }) { … }  // TypeError ✗', description: 'A plain object is **not iterable**. Use `Object.entries()`, or give it a `Symbol.iterator`.' },
        ],
      },
      {
        title: 'break, continue, labels',
        kind: G.SNIPPETS,
        entries: [
          { code: 'for (const x of xs) {\n  if (skip(x)) continue;   // next iteration\n  if (done(x)) break;      // exit the loop\n}', description: 'Both work in `for`, `for...of`, `for...in`, `while` — **not** in `forEach`.' },
          { code: 'outer:\nfor (const a of as) {\n  for (const b of bs) {\n    if (match(a, b)) break outer;\n  }\n}', description: 'A label breaks out of **nested** loops in one step. Rare, but far clearer than a flag variable.' },
          { code: 'arr.some((x) => { … return true; });  // early exit\nfor (const x of arr) { … break; }     // early exit', description: '`forEach` cannot be exited: `return` ends only that callback, and `break` is a syntax error.' },
        ],
      },
      {
        title: 'Async in loops',
        kind: G.SNIPPETS,
        entries: [
          { code: 'for (const x of xs) await work(x);        // sequential ✓\nawait Promise.all(xs.map(work));          // concurrent ✓\nxs.forEach(async (x) => await work(x));   // ✗ waits for nothing', description: '`for...of` is the only one of the three that genuinely sequences.' },
          { code: 'for await (const page of paginate(url)) { … }', description: 'Consumes an **async iterable** — paginated APIs and streaming responses.' },
        ],
      },
      {
        title: 'Iterables & iterators',
        kind: G.RULES,
        items: [
          'An **iterable** has a `[Symbol.iterator]()` method. An **iterator** has `next()` returning `{ value, done }`.',
          'Implementing `Symbol.iterator` earns an object `for...of`, spread, destructuring, `Array.from`, `Promise.all` and `new Map(...)` — all at once.',
          'Built-in iterables: arrays, strings (**by code point**), `Map`, `Set`, `NodeList`, `arguments`, generators.',
          'Iterators returned by `entries()`/`keys()`/`values()` are **single-use** — spread them if you need two passes.',
        ],
      },
      {
        title: 'Generators',
        kind: G.SNIPPETS,
        entries: [
          { code: 'function* range(from, to) {\n  for (let i = from; i <= to; i++) yield i;\n}\n[...range(1, 3)];   // [1, 2, 3]', description: 'Calling it runs **no** body. Execution starts on the first `next()` and pauses at each `yield`.' },
          { code: 'function* ids() {\n  let n = 0;\n  while (true) yield n++;   // safe: lazy\n}', description: 'Only the values actually requested are computed — infinite sequences are fine, as long as you never spread them.' },
          { code: 'yield* otherIterable;', description: 'Delegates, splicing the other sequence in — the natural way to compose or flatten.' },
        ],
      },
      {
        title: 'Traps',
        kind: G.RULES,
        items: [
          '`for (var i …)` shares **one** binding across all iterations; `for (let i …)` creates a **fresh** one per iteration.',
          'Mutating the length of a collection while looping forwards **skips elements** — including live `HTMLCollection`s.',
          '`break`ing out of `for...of` over a generator calls its `return()`, which unwinds it and runs any `finally`. Driving `next()` by hand and abandoning it does **not**.',
          'Prefer an array method when it names the intent; prefer a loop when you need `break`, `await`, or complex control flow.',
        ],
      },
    ],
    relatedLessons: ['l-m11-04', 'l-m11-05', 'l-m35-01', 'l-m35-03'],
    relatedReference: ['ref-symbol-iterator', 'ref-generator-function', 'ref-array-entries', 'ref-array-foreach'],
    relatedChallenges: ['ch-adv-take', 'ch-adv-lazy-pipeline', 'ch-adv-tree-generator'],
  },

  {
    id: 'cs-numbers-dates',
    slug: 'numbers-dates',
    title: 'Numbers & Dates',
    category: C.DATA,
    icon: 'calculate',
    aliases: ['numbers', 'math', 'rounding', 'float precision', 'date', 'getMonth', 'timezone', 'Intl'],
    topicIds: ['numbers', 'dates'],
    description: 'Float precision, rounding, and the date traps — zero-based months, `getDate` vs `getDay`, and UTC versus local.',
    groups: [
      {
        title: 'Every number is a double',
        kind: G.SNIPPETS,
        entries: [
          { code: '0.1 + 0.2 === 0.3            // false\n0.1 + 0.2                    // 0.30000000000000004\nMath.abs(a - b) < Number.EPSILON  // compare with tolerance', description: 'Not a JavaScript flaw — the same happens in C, Java and Python. `EPSILON` is only valid near magnitude 1; scale the tolerance for large values.' },
          { code: 'Number.MAX_SAFE_INTEGER      // 9007199254740991 (2^53 - 1)\n2 ** 53 === 2 ** 53 + 1      // true ✗', description: 'Past this, consecutive integers stop being distinguishable. Keep 64-bit ids as **strings**, or use `BigInt`.' },
          { code: 'JSON.parse("9007199254740993")  // 9007199254740992 ✗', description: 'Oversized integers are corrupted **during parsing**, before any check can run. Fix it on the wire format.' },
        ],
      },
      {
        title: 'Validating',
        kind: G.TABLE,
        columns: ['Check', 'True for', 'Coerces?'],
        rows: [
          ['`Number.isNaN(x)`', 'exactly `NaN`', '**no**'],
          ['`isNaN(x)` (global)', 'anything that converts to `NaN`', '**yes** — usually wrong'],
          ['`Number.isFinite(x)`', 'a finite **number**', 'no'],
          ['`Number.isInteger(x)`', 'whole-valued number', 'no'],
          ['`Number.isSafeInteger(x)`', 'integer within ±(2^53−1)', 'no'],
        ],
        note: 'Convert then check: `const n = Number(raw); if (!Number.isFinite(n)) reject();` — but guard emptiness first, because `Number("")` is `0`. `NaN !== NaN`, so `x === NaN` never works.',
      },
      {
        title: 'Rounding',
        kind: G.TABLE,
        columns: ['Call', '`2.5`', '`-2.5`', 'Rounds towards'],
        rows: [
          ['`Math.round`', '`3`', '**`-2`**', '+∞ for halves'],
          ['`Math.floor`', '`2`', '`-3`', '−∞'],
          ['`Math.ceil`', '`3`', '`-2`', '+∞'],
          ['`Math.trunc`', '`2`', '`-2`', 'zero'],
        ],
        note: '`Math.round(-2.5)` is `-2`, not `-3` — halves go **up numerically**, not away from zero. For money, work in **integer cents** and format only for display.',
      },
      {
        title: 'Formatting',
        kind: G.SNIPPETS,
        entries: [
          { code: '(3.14159).toFixed(2)     // "3.14" — a STRING\n(1.5).toFixed(2) + 1     // "1.501" ✗ concatenation', description: '`toFixed` returns a string and rounds the **stored binary value** — `(1.005).toFixed(2)` is `"1.00"`.' },
          { code: 'n.toLocaleString("en-US", { style: "currency", currency: "USD" })', description: 'The correct way to show a number to a person — separators, currency symbol and locale decimal marks. Never build these by hand.' },
        ],
      },
      {
        title: 'Date traps',
        kind: G.TABLE,
        columns: ['Call', 'Returns', 'Watch out'],
        rows: [
          ['`getFullYear()`', 'e.g. `2024`', '`getYear()` is legacy and broken'],
          ['`getMonth()`', '**0–11**', '**zero-based** — January is `0`'],
          ['`getDate()`', '**1–31**', 'day of the **month**'],
          ['`getDay()`', '**0–6**', 'day of the **week**, Sunday `0`'],
          ['`getTime()`', 'ms since epoch', 'the value to compare and subtract'],
        ],
        note: '`getDate()` and `getDay()` are completely different and one letter apart. All the plain getters read in **local time**; the `getUTC*` variants are timezone-independent.',
      },
      {
        title: 'Working with dates',
        kind: G.SNIPPETS,
        entries: [
          { code: 'a === b               // false — different objects\na.getTime() === b.getTime()   // ✓\nend - start                   // duration in ms', description: '`===` compares identity. Relational operators (`<`, `>`) do work, because they coerce via `valueOf()`.' },
          { code: 'new Date("2024-03-15")            // parsed as UTC\nnew Date("2024-03-15T00:00:00")    // parsed as LOCAL', description: 'Date-only ISO is UTC; date-time without an offset is local. They can be a day apart. Non-ISO formats are implementation-defined.' },
          { code: 'const next = new Date(d);          // clone first!\nnext.setDate(next.getDate() + 1);  // mutates, rolls over correctly', description: 'The setters **mutate** and return a timestamp, not the date — so they cannot be chained.' },
          { code: 'new Date(Date.UTC(2024, 1, 0));    // last day of January', description: '`setDate(0)` / day `0` gives the previous month\'s last day — the idiomatic month-length trick.' },
          { code: 'Number.isNaN(d.getTime())          // the only validity check', description: 'An invalid date does not throw — `new Date("nonsense")` silently produces one.' },
        ],
      },
      {
        title: 'Storage & display',
        kind: G.RULES,
        items: [
          'Store and transmit with **`toISOString()`** — always UTC, unambiguous, and sorts correctly as a string.',
          '`JSON.stringify` calls `toJSON()`, so a `Date` serialises to an ISO string — but `JSON.parse` gives you the **string back**, not a `Date`. Revive it explicitly.',
          'Display with `toLocaleDateString()` — `03/04` is 3 April in Britain and 4 March in the United States.',
          'Pass `{ timeZone: "UTC" }` when output must be deterministic, and pin locale **and** timezone in tests.',
          'Adding 24 hours is **not** the same as adding one calendar day across a daylight-saving change — use `setDate`.',
          '`Date.now()` follows the system clock and can jump backwards. Use `performance.now()` to measure durations.',
        ],
      },
    ],
    relatedLessons: ['l-m06-01', 'l-m06-02', 'l-m16-01', 'l-m16-02', 'l-m16-04'],
    relatedReference: ['ref-number-isfinite', 'ref-number-tofixed', 'ref-math-round', 'ref-date-getmonth', 'ref-date-toisostring'],
    relatedChallenges: ['ch-num-money', 'ch-date-days-between', 'ch-date-relative-time'],
  },

  {
    id: 'cs-browser-apis',
    slug: 'browser-storage-apis',
    title: 'Storage & Browser APIs',
    category: C.BROWSER,
    icon: 'devices',
    aliases: ['localStorage', 'sessionStorage', 'storage', 'observers', 'timers', 'history', 'web apis'],
    topicIds: ['storage', 'web-apis'],
    description: 'Where to put client state, which observer replaces which polling loop, and the timer facts that matter.',
    groups: [
      {
        title: 'Where client state goes',
        kind: G.TABLE,
        columns: ['Store', 'Lifetime', 'Scope', 'Sent to server'],
        rows: [
          ['`localStorage`', 'until cleared', 'origin, **all tabs**', 'no'],
          ['`sessionStorage`', 'until the tab closes', '**one tab**', 'no'],
          ['Cookie', 'until expiry', 'origin + path', '**yes, automatically**'],
          ['URL / query string', 'the navigation', 'shareable, bookmarkable', 'yes, in the request'],
          ['`IndexedDB`', 'until cleared', 'origin', 'no — and **asynchronous**'],
        ],
        note: 'Filters, search terms and pagination belong in the **URL** — that gives shareable links, a working back button and reload survival for free.',
      },
      {
        title: 'Web Storage',
        kind: G.SNIPPETS,
        entries: [
          { code: 'localStorage.setItem("k", JSON.stringify(value));\nconst raw = localStorage.getItem("k");   // string or NULL', description: '**Values are strings.** `setItem("k", obj)` stores the literal `"[object Object]"` — the data is destroyed on write, not on read.' },
          { code: 'try {\n  const raw = localStorage.getItem(key);\n  return raw === null ? fallback : JSON.parse(raw);\n} catch {\n  localStorage.removeItem(key);   // clear corrupt data\n  return fallback;\n}', description: 'Treat storage as **untrusted input** — it is shared with other tabs, older app versions and devtools. Clear the bad entry or the failure repeats every load.' },
        ],
      },
      {
        title: 'Storage rules',
        kind: G.RULES,
        items: [
          '`getItem` returns **`null`** for a missing key — and `JSON.parse(null)` is `null` rather than an error, which hides a missing value.',
          '`setItem` **can throw**: `QuotaExceededError` at roughly 5MB, and in Safari private browsing. Even *accessing* the property can throw when site data is blocked.',
          'It is fully **synchronous** — large reads and writes block the main thread. Use `IndexedDB` for anything substantial.',
          'JSON loses fidelity: `Date` becomes a string, `Map`/`Set` become `{}`, `undefined` disappears.',
          'The **`storage` event** fires on *other* tabs of the same origin, never the one that made the change — the simplest way to propagate a logout.',
          '**Never store tokens or personal data.** Any script on the origin can read the whole store, so one XSS becomes credential theft.',
        ],
      },
      {
        title: 'Timers',
        kind: G.RULES,
        items: [
          '`setTimeout(fn, ms)` — `ms` is a **minimum**, never a guarantee. The callback queues behind all pending microtasks and any running code.',
          'Nested timers are clamped to about **4ms**; background tabs are throttled far harder.',
          '`setInterval` schedules **by the clock**, so slow callbacks queue back to back — for async work use a **recursive `setTimeout`** that schedules the next run only after the current one finishes.',
          'Always keep the id and clear it on teardown. An uncleared interval is one of the most common single-page-app leaks.',
          'Never accumulate elapsed time by counting ticks — derive it from a stored deadline and `Date.now()`.',
          '`requestAnimationFrame` for anything visual: it runs before the next paint, matches the refresh rate, and pauses in background tabs.',
        ],
      },
      {
        title: 'Observers replace polling',
        kind: G.TABLE,
        columns: ['Observer', 'Watches', 'Replaces'],
        rows: [
          ['`IntersectionObserver`', 'viewport visibility', 'scroll + `getBoundingClientRect()`'],
          ['`ResizeObserver`', '**element** size, any cause', '`window.resize` (which misses most of them)'],
          ['`MutationObserver`', 'DOM changes', 'deprecated mutation events'],
        ],
        note: 'All three batch their callbacks and run off the layout hot path, so they avoid the forced synchronous layout that polling causes. All three **retain their targets** — call `disconnect()` on teardown. `IntersectionObserver` also fires **once immediately** on `observe()` with the current state.',
      },
      {
        title: 'Navigation & misc',
        kind: G.SNIPPETS,
        entries: [
          { code: 'history.pushState(state, "", "/items/42");\nrender();   // pushState does NOT fire popstate', description: 'Only Back/Forward fires `popstate`. Path routing also needs the **server** to serve the app shell for any path, or a refresh 404s.' },
          { code: 'new URL(raw).protocol   // validate before using a URL\nnew URLSearchParams(location.search).get("q")', description: 'Parse URLs; never slice them by hand.' },
          { code: 'crypto.randomUUID()          // secure ids\nnavigator.clipboard.writeText(t)   // needs a user gesture', description: 'Clipboard and geolocation need a **secure context** and permission, and both reject — always handle it.' },
        ],
      },
    ],
    relatedLessons: ['l-m27-01', 'l-m27-03', 'l-m27-04'],
    relatedReference: ['ref-storage-local', 'ref-storage-setitem', 'ref-settimeout', 'ref-intersectionobserver', 'ref-history-pushstate'],
    relatedChallenges: ['ch-dom-scroll-spy', 'ch-dom-observer-cleanup'],
  },
];
