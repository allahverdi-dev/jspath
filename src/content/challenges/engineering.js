import { DIFFICULTY } from '../schema/types.js';
import { XP } from './_xp.js';

const CATEGORY = 'Security & Engineering';

export const challenges = [
  {
    id: 'ch-sec-safe-redirect',
    slug: 'validating-a-redirect-target',
    title: 'Validating a Redirect Target',
    difficulty: DIFFICULTY.HARD,
    category: CATEGORY,
    topicIds: ['security', 'web-apis', 'strings'],
    xp: XP[DIFFICULTY.HARD],
    prompt:
      'After signing in, apps often redirect to a `next` parameter from the URL. Redirecting to whatever it says lets an attacker send users to a look-alike site from a link that genuinely starts with your domain. Write `safeRedirect(next, allowedOrigins)` returning a URL that is safe to navigate to, or `"/"` when the target cannot be trusted. Accept same-site relative paths and absolute URLs whose origin is in the allow list. This is a defensive validator — the point is deciding what to permit.',
    examples: [
      'safeRedirect("/dashboard", ["https://app.example.com"]);        // "/dashboard"',
      'safeRedirect("https://evil.test/login", [...]);                 // "/"',
      'safeRedirect("//evil.test", [...]);                             // "/" — protocol-relative',
    ],
    constraints: ['A relative path must begin with a single `/` and not `//`.', 'An absolute URL is allowed only if its full origin is in the list.', 'Anything unparseable or unrecognised falls back to `"/"`.'],
    starterCode: 'function safeRedirect(next, allowedOrigins) {\n  // Your code here\n}\n',
    tests: [
      { name: 'allows a relative path', body: 'expect(safeRedirect("/dashboard", ["https://app.example.com"])).toBe("/dashboard");' },
      { name: 'allows a relative path with a query string', body: 'expect(safeRedirect("/search?q=1", [])).toBe("/search?q=1");' },
      { name: 'allows the root', body: 'expect(safeRedirect("/", [])).toBe("/");' },
      { name: 'rejects a protocol-relative url', body: 'expect(safeRedirect("//evil.test", ["https://app.example.com"])).toBe("/");' },
      { name: 'rejects a protocol-relative url with a path', body: 'expect(safeRedirect("//evil.test/login", [])).toBe("/");' },
      { name: 'rejects an absolute url not on the list', body: 'expect(safeRedirect("https://evil.test/login", ["https://app.example.com"])).toBe("/");' },
      { name: 'allows an absolute url on the list', body: 'expect(safeRedirect("https://app.example.com/home", ["https://app.example.com"])).toBe("https://app.example.com/home");' },
      { name: 'matches the origin, not a prefix', body: 'expect(safeRedirect("https://app.example.com.evil.test/x", ["https://app.example.com"])).toBe("/");' },
      { name: 'the scheme is part of the origin', body: 'expect(safeRedirect("http://app.example.com/x", ["https://app.example.com"])).toBe("/");' },
      { name: 'the port is part of the origin', body: 'expect(safeRedirect("https://app.example.com:8443/x", ["https://app.example.com"])).toBe("/");' },
      { name: 'rejects a javascript url', body: 'expect(safeRedirect("javascript:alert(1)", [])).toBe("/");' },
      { name: 'rejects a data url', body: 'expect(safeRedirect("data:text/html,hi", [])).toBe("/");' },
      { name: 'rejects a bare path with no leading slash', body: 'expect(safeRedirect("dashboard", [])).toBe("/");' },
      { name: 'rejects an empty target', body: 'expect(safeRedirect("", [])).toBe("/");' },
      { name: 'rejects a non-string target', body: 'expect(safeRedirect(null, [])).toBe("/"); expect(safeRedirect(undefined, [])).toBe("/");' },
      { name: 'rejects a backslash-prefixed target', body: 'expect(safeRedirect("\\\\\\\\evil.test", [])).toBe("/");', hidden: true },
      { name: 'allows any of several listed origins', body: 'const list = ["https://a.example.com", "https://b.example.com"]; expect(safeRedirect("https://b.example.com/x", list)).toBe("https://b.example.com/x");', hidden: true },
    ],
    hints: [
      'Reject anything that is not a string, and anything that does not start with a single `/` before you consider treating it as relative.',
      '`//evil.test` is a *protocol-relative* URL: the browser reads it as an absolute address on another host, even though it starts with a slash. Reject a second leading slash — and a backslash too, since some parsers treat `\\` like `/`.',
      'For absolute URLs, parse with `new URL(...)` inside a `try` and compare `url.origin` against the allow list. Comparing with `startsWith` on the string is what lets `app.example.com.evil.test` through.',
    ],
    solution:
      'function safeRedirect(next, allowedOrigins) {\n' +
      '  const FALLBACK = "/";\n' +
      '  if (typeof next !== "string" || next === "") return FALLBACK;\n' +
      '\n' +
      '  if (next.startsWith("/")) {\n' +
      '    const second = next[1];\n' +
      '    if (second === "/" || second === "\\\\") return FALLBACK;\n' +
      '    return next;\n' +
      '  }\n' +
      '\n' +
      '  let url;\n' +
      '  try {\n' +
      '    url = new URL(next);\n' +
      '  } catch {\n' +
      '    return FALLBACK;\n' +
      '  }\n' +
      '  return allowedOrigins.includes(url.origin) ? next : FALLBACK;\n' +
      '}\n',
    solutionExplanation:
      'This is an allow-list validator, and every rejection is a default rather than a rule about a known attack — anything not positively recognised becomes `"/"`. Three details do the real work. A protocol-relative `//evil.test` starts with a slash but is an absolute address on another host, so the second character has to be checked; a backslash is rejected alongside it because some URL parsers normalise `\\` to `/`. Comparing `url.origin` rather than doing a string `startsWith` is what stops `https://app.example.com.evil.test` — a perfectly valid hostname that a prefix check would accept. And because `origin` includes scheme, host and port, an http downgrade or an unexpected port is rejected without extra code. `javascript:` and `data:` targets fail the allow-list comparison naturally, since their origin is `"null"`, which no sensible list contains.',
  },

  {
    id: 'ch-sec-constant-time',
    slug: 'comparing-secrets-safely',
    title: 'Comparing Secrets Safely',
    difficulty: DIFFICULTY.MEDIUM,
    category: CATEGORY,
    topicIds: ['security', 'strings', 'loops'],
    xp: XP[DIFFICULTY.MEDIUM],
    prompt:
      'Comparing two secret strings with `===` stops at the first differing character, so how long the comparison takes leaks how much of the guess was right. Given enough samples that is enough to recover the secret one character at a time. Write `constantTimeEqual(a, b)` comparing two strings without an early exit: examine every position regardless, and combine the results so the total work does not depend on where the first difference is. Strings of different lengths are unequal.',
    examples: [
      'constantTimeEqual("abc123", "abc123");  // true',
      'constantTimeEqual("abc123", "abcXXX");  // false — same work as any other mismatch',
    ],
    constraints: ['No early `return` inside the comparison loop.', 'Different lengths are unequal.', 'Return an actual boolean.'],
    starterCode: 'function constantTimeEqual(a, b) {\n  // Your code here\n}\n',
    tests: [
      { name: 'equal strings compare equal', body: 'expect(constantTimeEqual("abc123", "abc123")).toBe(true);' },
      { name: 'a difference at the end is caught', body: 'expect(constantTimeEqual("abc123", "abc124")).toBe(false);' },
      { name: 'a difference at the start is caught', body: 'expect(constantTimeEqual("abc123", "Xbc123")).toBe(false);' },
      { name: 'every character differing is caught', body: 'expect(constantTimeEqual("aaa", "bbb")).toBe(false);' },
      { name: 'different lengths are unequal', body: 'expect(constantTimeEqual("abc", "abcd")).toBe(false);' },
      { name: 'a prefix is not equal to the whole', body: 'expect(constantTimeEqual("abcd", "abc")).toBe(false);' },
      { name: 'two empty strings are equal', body: 'expect(constantTimeEqual("", "")).toBe(true);' },
      { name: 'an empty string is not equal to a non-empty one', body: 'expect(constantTimeEqual("", "a")).toBe(false);' },
      { name: 'returns a real boolean', body: 'expect(typeof constantTimeEqual("a", "a")).toBe("boolean"); expect(typeof constantTimeEqual("a", "b")).toBe("boolean");' },
      { name: 'is case-sensitive', body: 'expect(constantTimeEqual("Secret", "secret")).toBe(false);' },
      { name: 'handles long equal strings', body: 'const s = "x".repeat(1000); expect(constantTimeEqual(s, s)).toBe(true);' },
      { name: 'handles a single differing character in a long string', body: 'const a = "x".repeat(1000); const b = "x".repeat(999) + "y"; expect(constantTimeEqual(a, b)).toBe(false);' },
      {
        name: 'examines every character regardless of where the difference is',
        body:
          'let compares = 0;\n' +
          'const original = String.prototype.charCodeAt;\n' +
          'String.prototype.charCodeAt = function (...args) { compares += 1; return original.apply(this, args); };\n' +
          'try {\n' +
          '  compares = 0;\n' +
          '  constantTimeEqual("aaaaaaaa", "Xaaaaaaa");\n' +
          '  const early = compares;\n' +
          '  compares = 0;\n' +
          '  constantTimeEqual("aaaaaaaa", "aaaaaaaX");\n' +
          '  expect(compares).toBe(early);\n' +
          '} finally {\n' +
          '  String.prototype.charCodeAt = original;\n' +
          '}',
        hidden: true,
      },
      { name: 'handles unicode characters', body: 'expect(constantTimeEqual("café", "café")).toBe(true); expect(constantTimeEqual("café", "cafe")).toBe(false);', hidden: true },
    ],
    hints: [
      'Combine the per-character results with a bitwise OR into an accumulator, then check whether the accumulator is still zero at the end.',
      '`a.charCodeAt(i) ^ b.charCodeAt(i)` is 0 exactly when the characters match, so OR-ing every difference together gives 0 only if every position matched.',
      'The length check can still short-circuit — the length of a secret is not usually the thing being protected, and comparing different-length strings position by position is awkward anyway.',
    ],
    solution:
      'function constantTimeEqual(a, b) {\n' +
      '  if (a.length !== b.length) return false;\n' +
      '  let difference = 0;\n' +
      '  for (let i = 0; i < a.length; i += 1) {\n' +
      '    difference |= a.charCodeAt(i) ^ b.charCodeAt(i);\n' +
      '  }\n' +
      '  return difference === 0;\n' +
      '}\n',
    solutionExplanation:
      'The accumulator is what removes the early exit: XOR gives 0 for a matching pair and something non-zero otherwise, and OR-ing every result together means a single mismatch anywhere leaves the accumulator non-zero — but the loop still runs to the end either way. That is the point. With `===`, a guess sharing more of a prefix with the secret takes measurably longer to reject, and an attacker who can time the comparison recovers the secret one character at a time instead of guessing the whole thing at once.\n\nTwo honest caveats. The length check does exit early, which leaks the length; that is the standard trade-off, and in real systems secrets are usually compared as fixed-length hashes anyway, which makes it moot. And a JavaScript engine offers no true timing guarantees — JIT compilation, string interning and garbage collection all introduce variation this technique cannot control. For anything genuinely security-critical, use a platform primitive built for it, such as Node\'s `crypto.timingSafeEqual`. Writing this yourself is how you understand what that function is for.',
  },

  {
    id: 'ch-sec-sanitize-filename',
    slug: 'safe-file-names',
    title: 'Safe File Names',
    difficulty: DIFFICULTY.MEDIUM,
    category: CATEGORY,
    topicIds: ['security', 'strings', 'regex'],
    xp: XP[DIFFICULTY.MEDIUM],
    prompt:
      'A user-supplied file name used directly on disk is a path traversal waiting to happen: `../../etc/passwd` escapes the directory you meant to write to. Write `safeFileName(input)` producing a name that can only ever refer to a file in the current directory. Keep letters, digits, dots, dashes and underscores; replace every other character with an underscore. Strip leading dots so no hidden or relative name survives. An input that reduces to nothing becomes `"unnamed"`, and the result is capped at 100 characters.',
    examples: [
      'safeFileName("report 2024.pdf");     // "report_2024.pdf"',
      'safeFileName("../../etc/passwd");    // "_.._etc_passwd" — inert, whatever it looked like',
      'safeFileName("...");                 // "unnamed"',
    ],
    constraints: ['Only `A-Za-z0-9._-` survive; everything else becomes `_`.', 'The result never starts with a dot.', 'The result is 1 to 100 characters.'],
    starterCode: 'function safeFileName(input) {\n  // Your code here\n}\n',
    tests: [
      { name: 'keeps a simple name', body: 'expect(safeFileName("report.pdf")).toBe("report.pdf");' },
      { name: 'replaces spaces', body: 'expect(safeFileName("report 2024.pdf")).toBe("report_2024.pdf");' },
      { name: 'neutralises path traversal', body: 'expect(safeFileName("../../etc/passwd")).toBe("_.._etc_passwd");' },
      { name: 'strips a leading dot', body: 'expect(safeFileName(".bashrc")).toBe("bashrc");' },
      { name: 'replaces forward slashes', body: 'expect(safeFileName("a/b")).toBe("a_b");' },
      { name: 'replaces backslashes', body: 'expect(safeFileName("a\\\\b")).toBe("a_b");' },
      { name: 'replaces a null byte', body: 'expect(safeFileName("a\\u0000b.txt")).toBe("a_b.txt");' },
      { name: 'keeps dashes and underscores', body: 'expect(safeFileName("my-file_1.txt")).toBe("my-file_1.txt");' },
      { name: 'keeps an interior dot', body: 'expect(safeFileName("archive.tar.gz")).toBe("archive.tar.gz");' },
      { name: 'a dots-only name becomes unnamed', body: 'expect(safeFileName("...")).toBe("unnamed");' },
      { name: 'an empty input becomes unnamed', body: 'expect(safeFileName("")).toBe("unnamed");' },
      { name: 'caps the length', body: 'expect(safeFileName("a".repeat(500)).length).toBe(100);' },
      { name: 'the result never contains a separator', body: 'const out = safeFileName("../../../a/b\\\\c"); expect(out.includes("/")).toBe(false); expect(out.includes("\\\\")).toBe(false);' },
      { name: 'the result never starts with a dot', body: 'for (const input of [".hidden", "..", "....x", ". a"]) expect(safeFileName(input).startsWith(".")).toBe(false);' },
      { name: 'handles unicode by replacing it', body: 'expect(safeFileName("café.txt")).toBe("caf_.txt");', hidden: true },
      { name: 'a name that is only separators becomes unnamed', body: 'expect(safeFileName("/") === "unnamed" || safeFileName("/") === "_").toBe(true);', hidden: true },
    ],
    hints: [
      'One `replace` with a negated character class handles the substitution: everything not in the safe set becomes an underscore.',
      'Strip leading dots *after* substituting, and remember that `..` must not survive in any form — stripping every leading dot handles `.`, `..` and `...` alike.',
      'Order matters: substitute, strip leading dots, truncate, then fall back to `"unnamed"` if nothing is left.',
    ],
    solution:
      'function safeFileName(input) {\n' +
      '  const substituted = String(input).replace(/[^A-Za-z0-9._-]/g, "_");\n' +
      '  const withoutLeadingDots = substituted.replace(/^\\.+/, "");\n' +
      '  const capped = withoutLeadingDots.slice(0, 100);\n' +
      '  return capped === "" ? "unnamed" : capped;\n' +
      '}\n',
    solutionExplanation:
      'This is an allow-list, and that is what makes it trustworthy: rather than trying to enumerate dangerous sequences — `../`, `..\\`, URL-encoded variants, null bytes — it names the small set of characters that are permitted and replaces everything else. A deny-list approach fails as soon as someone finds an encoding you did not think of. Path traversal dies here because both separators are outside the safe set, so `../../etc/passwd` cannot address a parent directory whatever the platform. Stripping leading dots afterwards removes the remaining relative names (`.` and `..`) and prevents accidentally creating hidden files. The order matters: truncating before stripping could leave a dot exposed at the front, and checking for emptiness before truncating would miss a name that becomes empty only after the earlier steps.\n\nWorth knowing what this does not do: it does not prevent overwriting an existing file, and it does not make the name unique. In production you would normally store an opaque generated identifier and keep the user\'s name only as a display label.',
  },

  {
    id: 'ch-sec-rate-limit',
    slug: 'a-token-bucket-limiter',
    title: 'A Token Bucket Limiter',
    difficulty: DIFFICULTY.HARD,
    category: CATEGORY,
    topicIds: ['security', 'algorithms', 'classes'],
    xp: XP[DIFFICULTY.HARD],
    prompt:
      'Rate limiting protects a service from both abuse and accidents. Write a class `TokenBucket(capacity, refillPerSecond)` with `tryConsume(now, count = 1)` returning whether the request is allowed. The bucket starts full, each allowed request removes tokens, and tokens refill continuously at the given rate up to the capacity — never beyond. `now` is a millisecond timestamp passed in by the caller, which is what makes the behaviour testable without waiting. A request needing more tokens than are available is refused and consumes nothing.',
    examples: [
      'const bucket = new TokenBucket(3, 1);  // 3 requests, refilling 1 per second\nbucket.tryConsume(0);      // true\nbucket.tryConsume(0);      // true\nbucket.tryConsume(0);      // true\nbucket.tryConsume(0);      // false — empty\nbucket.tryConsume(1000);   // true — one token refilled',
    ],
    constraints: ['Time is injected as a millisecond timestamp.', 'Tokens never exceed the capacity.', 'A refused request consumes nothing.'],
    starterCode: 'class TokenBucket {\n  constructor(capacity, refillPerSecond) {\n    // Your code here\n  }\n\n  tryConsume(now, count = 1) {\n    // Your code here\n  }\n}\n',
    tests: [
      { name: 'starts full', body: 'const b = new TokenBucket(3, 1); expect(b.tryConsume(0)).toBe(true); expect(b.tryConsume(0)).toBe(true); expect(b.tryConsume(0)).toBe(true);' },
      { name: 'refuses when empty', body: 'const b = new TokenBucket(2, 1); b.tryConsume(0); b.tryConsume(0); expect(b.tryConsume(0)).toBe(false);' },
      { name: 'refills over time', body: 'const b = new TokenBucket(2, 1); b.tryConsume(0); b.tryConsume(0); expect(b.tryConsume(1000)).toBe(true);' },
      { name: 'refills proportionally', body: 'const b = new TokenBucket(10, 1); for (let i = 0; i < 10; i += 1) b.tryConsume(0); expect(b.tryConsume(500)).toBe(false); expect(b.tryConsume(1000)).toBe(true);' },
      { name: 'does not refill beyond the capacity', body: 'const b = new TokenBucket(2, 1); expect(b.tryConsume(1000000)).toBe(true); expect(b.tryConsume(1000000)).toBe(true); expect(b.tryConsume(1000000)).toBe(false);' },
      { name: 'consumes several tokens at once', body: 'const b = new TokenBucket(5, 1); expect(b.tryConsume(0, 3)).toBe(true); expect(b.tryConsume(0, 3)).toBe(false); expect(b.tryConsume(0, 2)).toBe(true);' },
      { name: 'a refused request consumes nothing', body: 'const b = new TokenBucket(5, 1); b.tryConsume(0, 4); expect(b.tryConsume(0, 3)).toBe(false); expect(b.tryConsume(0, 1)).toBe(true);' },
      { name: 'a request larger than the capacity is always refused', body: 'const b = new TokenBucket(2, 1); expect(b.tryConsume(0, 5)).toBe(false); expect(b.tryConsume(100000, 5)).toBe(false);' },
      { name: 'allows a burst up to the capacity after idling', body: 'const b = new TokenBucket(3, 1); b.tryConsume(0, 3); expect(b.tryConsume(5000, 3)).toBe(true);' },
      { name: 'a fast refill rate works', body: 'const b = new TokenBucket(10, 100); b.tryConsume(0, 10); expect(b.tryConsume(100, 10)).toBe(true);' },
      { name: 'time going backwards does not create tokens', body: 'const b = new TokenBucket(2, 1); b.tryConsume(1000, 2); expect(b.tryConsume(0)).toBe(false);' },
      { name: 'sustained rate is respected over a long run', body: 'const b = new TokenBucket(1, 1); let allowed = 0; for (let t = 0; t <= 10000; t += 100) { if (b.tryConsume(t)) allowed += 1; } expect(allowed).toBe(11);', hidden: true },
      { name: 'a capacity of one behaves as a strict interval', body: 'const b = new TokenBucket(1, 1); expect(b.tryConsume(0)).toBe(true); expect(b.tryConsume(999)).toBe(false); expect(b.tryConsume(1000)).toBe(true);', hidden: true },
    ],
    hints: [
      'Store the token count and the timestamp of the last update. On each call, first add the tokens earned since then, capped at the capacity.',
      'Tokens earned is `(now - lastUpdate) / 1000 * refillPerSecond`. Keep it fractional — rounding down every call would lose tokens on frequent small intervals.',
      'Guard against `now` moving backwards, which would otherwise subtract tokens.',
    ],
    solution:
      'class TokenBucket {\n' +
      '  #capacity;\n' +
      '\n' +
      '  #refillPerSecond;\n' +
      '\n' +
      '  #tokens;\n' +
      '\n' +
      '  #lastUpdate = null;\n' +
      '\n' +
      '  constructor(capacity, refillPerSecond) {\n' +
      '    this.#capacity = capacity;\n' +
      '    this.#refillPerSecond = refillPerSecond;\n' +
      '    this.#tokens = capacity;\n' +
      '  }\n' +
      '\n' +
      '  #available(now) {\n' +
      '    if (this.#lastUpdate === null) this.#lastUpdate = now;\n' +
      '    const elapsed = Math.max(0, now - this.#lastUpdate);\n' +
      '    return Math.min(this.#capacity, this.#tokens + (elapsed / 1000) * this.#refillPerSecond);\n' +
      '  }\n' +
      '\n' +
      '  tryConsume(now, count = 1) {\n' +
      '    const available = this.#available(now);\n' +
      '    if (count > available) return false;\n' +
      '    this.#tokens = available - count;\n' +
      '    this.#lastUpdate = Math.max(this.#lastUpdate, now);\n' +
      '    return true;\n' +
      '  }\n' +
      '}\n',
    solutionExplanation:
      'The token bucket is the standard shape for rate limiting because it separates two things a fixed interval conflates: a *sustained* rate, set by the refill, and a *burst* allowance, set by the capacity. A client that has been quiet can spend its accumulated tokens all at once, which is usually what you want — occasional bursts are normal, sustained flooding is not.\n\nRefilling lazily on each call rather than on a timer is what keeps this cheap and testable: no interval runs in the background, and injecting `now` means the tests drive time directly instead of sleeping.\n\nThe structure of the refill matters more than it first appears. `#lastUpdate` advances **only when a request is actually allowed**, so the token count is always computed as one multiplication from a fixed reference point rather than accumulated across calls. The accumulating alternative — adding a fraction of a token on every call and moving the reference each time — is subtly wrong: adding 0.1 ten times gives 0.9999999999999999, not 1, so a client polling every 100ms against a one-per-second limit would be refused at the exact moment it should be allowed and would drift further out with every cycle. Computing from a fixed reference makes `elapsed / 1000 * rate` land on exactly 1 at the one-second mark.\n\nClamping `elapsed` at zero stops a clock adjustment from removing tokens, and capping at capacity is what prevents an idle client from banking unlimited credit.',
  },

  {
    id: 'ch-eng-parse-safely',
    slug: 'parsing-untrusted-json',
    title: 'Parsing Untrusted JSON',
    difficulty: DIFFICULTY.MEDIUM,
    category: CATEGORY,
    topicIds: ['security', 'errors', 'objects'],
    xp: XP[DIFFICULTY.MEDIUM],
    prompt:
      'Write `parseJsonSafely(text, fallback = null)` returning the parsed value, or `fallback` when the text is not valid JSON. Beyond the parse failure, guard one specific hazard: a JSON payload containing a `"__proto__"` key can, when merged into an existing object by careless code, alter `Object.prototype` and affect every object in the program. Strip any `__proto__` and `constructor` keys from the result at every level, so what you hand back cannot be used that way.',
    examples: [
      'parseJsonSafely(\'{"a":1}\');              // { a: 1 }',
      'parseJsonSafely("not json", {});          // {}',
      'parseJsonSafely(\'{"__proto__":{"x":1}}\'); // {} — the dangerous key is removed',
    ],
    constraints: ['Invalid JSON returns the fallback rather than throwing.', '`__proto__` and `constructor` keys are removed at every depth.', 'Arrays and primitives pass through unchanged.'],
    starterCode: 'function parseJsonSafely(text, fallback = null) {\n  // Your code here\n}\n',
    tests: [
      { name: 'parses a valid object', body: 'expect(parseJsonSafely(\'{"a":1}\')).toEqual({ a: 1 });' },
      { name: 'parses an array', body: 'expect(parseJsonSafely("[1,2,3]")).toEqual([1, 2, 3]);' },
      { name: 'parses a primitive', body: 'expect(parseJsonSafely("42")).toBe(42); expect(parseJsonSafely("null")).toBe(null);' },
      { name: 'returns the fallback for invalid json', body: 'expect(parseJsonSafely("not json", "fallback")).toBe("fallback");' },
      { name: 'the fallback defaults to null', body: 'expect(parseJsonSafely("{bad")).toBe(null);' },
      { name: 'does not throw on invalid json', body: 'expect(() => parseJsonSafely("{bad")).not.toThrow();' },
      { name: 'returns the fallback for an empty string', body: 'expect(parseJsonSafely("", "fb")).toBe("fb");' },
      { name: 'strips a top-level __proto__ key', body: 'expect(parseJsonSafely(\'{"__proto__":{"x":1}}\')).toEqual({});' },
      { name: 'strips a nested __proto__ key', body: 'expect(parseJsonSafely(\'{"a":{"__proto__":{"x":1},"b":2}}\')).toEqual({ a: { b: 2 } });' },
      { name: 'strips a constructor key', body: 'expect(parseJsonSafely(\'{"constructor":{"x":1},"a":1}\')).toEqual({ a: 1 });' },
      { name: 'keeps ordinary keys alongside a stripped one', body: 'expect(parseJsonSafely(\'{"__proto__":1,"keep":2}\')).toEqual({ keep: 2 });' },
      { name: 'strips inside an array', body: 'expect(parseJsonSafely(\'[{"__proto__":1,"a":2}]\')).toEqual([{ a: 2 }]);' },
      { name: 'Object.prototype is not polluted', body: 'parseJsonSafely(\'{"__proto__":{"polluted":true}}\'); expect({}.polluted).toBe(undefined);' },
      { name: 'a plain object result is a normal object', body: 'const out = parseJsonSafely(\'{"a":1}\'); expect(Object.getPrototypeOf(out)).toBe(Object.prototype);' },
      { name: 'handles deep nesting', body: 'expect(parseJsonSafely(\'{"a":{"b":{"c":{"__proto__":1,"d":2}}}}\')).toEqual({ a: { b: { c: { d: 2 } } } });', hidden: true },
      { name: 'a key merely containing the text is kept', body: 'expect(parseJsonSafely(\'{"my__proto__key":1}\')).toEqual({ my__proto__key: 1 });', hidden: true },
    ],
    hints: [
      '`JSON.parse` accepts a second argument, a reviver function called for every key/value pair as the result is built.',
      'Returning `undefined` from the reviver removes that key from the result entirely — which is exactly what you want for the dangerous names.',
      'Wrap the whole call in `try`/`catch` for the parse failure.',
    ],
    solution:
      'function parseJsonSafely(text, fallback = null) {\n' +
      '  const BLOCKED = new Set(["__proto__", "constructor"]);\n' +
      '  try {\n' +
      '    return JSON.parse(text, function reviver(key, value) {\n' +
      '      if (BLOCKED.has(key)) return undefined;\n' +
      '      return value;\n' +
      '    });\n' +
      '  } catch {\n' +
      '    return fallback;\n' +
      '  }\n' +
      '}\n',
    solutionExplanation:
      'The reviver is the neat part: `JSON.parse` calls it for every key/value pair as it builds the result, and returning `undefined` deletes that key rather than setting it to undefined — so one comparison strips the dangerous names at every depth, with no manual recursion.\n\nIt is worth being precise about the risk, because it is often overstated. `JSON.parse` on its own does **not** pollute `Object.prototype` — it creates a plain own property named `__proto__`, which is inert. The danger comes later, when that parsed object is fed to a recursive merge or a deep-assign helper that uses ordinary property assignment: `target[key] = value` with a key of `__proto__` *does* reach the prototype, and from that moment every object in the program may appear to have properties it never had. Stripping the keys at the parse boundary means the hazardous value never enters your data at all, which is a better place to fix it than in every merge function. Note the last hidden test: only the exact key names are removed, so a legitimate key that merely contains the text survives.',
  },

  {
    id: 'ch-eng-assert',
    slug: 'building-a-tiny-test-runner',
    title: 'Building a Tiny Test Runner',
    difficulty: DIFFICULTY.MEDIUM,
    category: CATEGORY,
    topicIds: ['testing', 'errors', 'functions'],
    xp: XP[DIFFICULTY.MEDIUM],
    prompt:
      'Write `createRunner()` returning `{ test, run }`. `test(name, fn)` registers a case; `run()` executes every registered case and returns `{ passed, failed, results }`, where `results` is one `{ name, ok, error }` per case in registration order. A failing case must not stop the others — that is the single most important property of a test runner. `error` holds the message for a failure and is `null` for a pass. Cases run in registration order and `run()` can be called more than once with the same outcome.',
    examples: [
      'const { test, run } = createRunner();\ntest("adds", () => { if (1 + 1 !== 2) throw new Error("bad math"); });\nrun();  // { passed: 1, failed: 0, results: [...] }',
    ],
    constraints: ['A throwing case is recorded as a failure and the run continues.', 'Cases run in registration order.', '`run()` is repeatable and does not consume the registrations.'],
    starterCode: 'function createRunner() {\n  // Your code here\n}\n',
    tests: [
      { name: 'records a passing case', body: 'const r = createRunner(); r.test("ok", () => {}); expect(r.run().passed).toBe(1);' },
      { name: 'records a failing case', body: 'const r = createRunner(); r.test("bad", () => { throw new Error("nope"); }); expect(r.run().failed).toBe(1);' },
      { name: 'counts both', body: 'const r = createRunner(); r.test("a", () => {}); r.test("b", () => { throw new Error("x"); }); const out = r.run(); expect(out.passed).toBe(1); expect(out.failed).toBe(1);' },
      { name: 'a failure does not stop later cases', body: 'const r = createRunner(); let ran = 0; r.test("a", () => { throw new Error("x"); }); r.test("b", () => { ran += 1; }); r.run(); expect(ran).toBe(1);' },
      { name: 'reports the error message', body: 'const r = createRunner(); r.test("bad", () => { throw new Error("nope"); }); expect(r.run().results[0].error).toBe("nope");' },
      { name: 'a passing case has a null error', body: 'const r = createRunner(); r.test("ok", () => {}); expect(r.run().results[0].error).toBe(null);' },
      { name: 'reports the case name', body: 'const r = createRunner(); r.test("my case", () => {}); expect(r.run().results[0].name).toBe("my case");' },
      { name: 'reports ok per case', body: 'const r = createRunner(); r.test("a", () => {}); r.test("b", () => { throw new Error("x"); }); expect(r.run().results.map((x) => x.ok)).toEqual([true, false]);' },
      { name: 'runs in registration order', body: 'const r = createRunner(); const order = []; r.test("a", () => order.push("a")); r.test("b", () => order.push("b")); r.run(); expect(order).toEqual(["a", "b"]);' },
      { name: 'no cases gives an empty run', body: 'const out = createRunner().run(); expect(out.passed).toBe(0); expect(out.failed).toBe(0); expect(out.results).toEqual([]);' },
      { name: 'run is repeatable', body: 'const r = createRunner(); r.test("a", () => {}); r.run(); expect(r.run().passed).toBe(1);' },
      { name: 'a case runs once per run', body: 'const r = createRunner(); let ran = 0; r.test("a", () => { ran += 1; }); r.run(); expect(ran).toBe(1);' },
      { name: 'handles a thrown non-Error', body: 'const r = createRunner(); r.test("bad", () => { throw "plain string"; }); const out = r.run(); expect(out.failed).toBe(1); expect(typeof out.results[0].error).toBe("string");', hidden: true },
      { name: 'two runners are independent', body: 'const a = createRunner(); const b = createRunner(); a.test("x", () => {}); expect(b.run().results).toEqual([]);', hidden: true },
    ],
    hints: [
      'Keep the registered cases in an array in the closure. `run` walks it and builds the results.',
      'Each case goes in its own `try`/`catch` — that is what isolates a failure to one case.',
      'A thrown value need not be an `Error`. Read `.message` when it is one and fall back to `String(thrown)` otherwise.',
    ],
    solution:
      'function createRunner() {\n' +
      '  const cases = [];\n' +
      '\n' +
      '  function test(name, fn) {\n' +
      '    cases.push({ name, fn });\n' +
      '  }\n' +
      '\n' +
      '  function run() {\n' +
      '    const results = [];\n' +
      '    let passed = 0;\n' +
      '    let failed = 0;\n' +
      '    for (const item of cases) {\n' +
      '      try {\n' +
      '        item.fn();\n' +
      '        results.push({ name: item.name, ok: true, error: null });\n' +
      '        passed += 1;\n' +
      '      } catch (thrown) {\n' +
      '        const message = thrown instanceof Error ? thrown.message : String(thrown);\n' +
      '        results.push({ name: item.name, ok: false, error: message });\n' +
      '        failed += 1;\n' +
      '      }\n' +
      '    }\n' +
      '    return { passed, failed, results };\n' +
      '  }\n' +
      '\n' +
      '  return { test, run };\n' +
      '}\n',
    solutionExplanation:
      'Putting the `try`/`catch` *inside* the loop rather than around it is the entire design. Wrapped around the loop, the first failure would abandon every remaining case, and you would fix one bug at a time instead of seeing all of them — which is why every real runner isolates cases this way. Registration is separated from execution so `run` can be called repeatedly and so the cases array stays intact; a version that consumed the queue would report zero on a second run. Handling a thrown non-`Error` matters more than it seems: `throw "something"` is legal, and reading `.message` off a string gives `undefined`, turning a real failure into a confusingly blank report. That is the same reason `catch` blocks in application code should not assume they caught an `Error`.',
  },

  {
    id: 'ch-eng-find-the-bug',
    slug: 'fixing-a-shared-mutable-default',
    title: 'Fixing a Shared Mutable Default',
    difficulty: DIFFICULTY.MEDIUM,
    category: CATEGORY,
    topicIds: ['debugging', 'functions', 'copying'],
    xp: XP[DIFFICULTY.MEDIUM],
    prompt:
      'The starter code below has a bug that only appears on the second call. `addItem` is meant to return a new cart with an item appended, leaving the original alone, and to start an empty cart when none is given. Find what is wrong and fix it. The signature and behaviour should stay as documented — do not change the calling convention.',
    examples: [
      'const a = addItem("apple");\nconst b = addItem("pear");\n// a should be ["apple"] and b should be ["pear"]',
    ],
    constraints: ['The exported function keeps the same name and parameters.', 'Callers that pass a cart must get a new array back, not a mutated one.', 'Callers that pass nothing get a fresh cart each time.'],
    starterCode:
      'const EMPTY_CART = [];\n' +
      '\n' +
      '// Returns a NEW cart with the item appended.\n' +
      '// With no cart given, starts from an empty one.\n' +
      'function addItem(item, cart = EMPTY_CART) {\n' +
      '  cart.push(item);\n' +
      '  return cart;\n' +
      '}\n',
    tests: [
      { name: 'appends to a given cart', body: 'expect(addItem("apple", ["pear"])).toEqual(["pear", "apple"]);' },
      { name: 'starts an empty cart when none is given', body: 'expect(addItem("apple")).toEqual(["apple"]);' },
      { name: 'two default calls do not share state', body: 'const a = addItem("apple"); const b = addItem("pear"); expect(a).toEqual(["apple"]); expect(b).toEqual(["pear"]);' },
      { name: 'the default cart is fresh every time', body: 'addItem("x"); addItem("y"); expect(addItem("z")).toEqual(["z"]);' },
      { name: 'does not mutate the given cart', body: 'const cart = ["pear"]; addItem("apple", cart); expect(cart).toEqual(["pear"]);' },
      { name: 'returns a new array', body: 'const cart = ["pear"]; expect(addItem("apple", cart)).not.toBe(cart);' },
      { name: 'chains correctly', body: 'expect(addItem("c", addItem("b", addItem("a")))).toEqual(["a", "b", "c"]);' },
      { name: 'chaining leaves the intermediates alone', body: 'const first = addItem("a"); const second = addItem("b", first); expect(first).toEqual(["a"]); expect(second).toEqual(["a", "b"]);' },
      { name: 'handles an explicitly empty cart', body: 'expect(addItem("a", [])).toEqual(["a"]);' },
      { name: 'appends falsy items', body: 'expect(addItem(0, [])).toEqual([0]);' },
      { name: 'many default calls stay independent', body: 'const carts = Array.from({ length: 50 }, (_, i) => addItem(i)); expect(carts.every((c) => c.length === 1)).toBe(true);', hidden: true },
      { name: 'a shared source array is never modified', body: 'const shared = ["base"]; addItem("a", shared); addItem("b", shared); expect(shared).toEqual(["base"]);', hidden: true },
    ],
    hints: [
      'Run the second test and then the third. The function works once and then starts remembering — that is the shape of a shared-state bug.',
      'A default parameter expression is evaluated on each call, but here it evaluates to the *same array object* every time, because `EMPTY_CART` is one array created once at module load.',
      'There are two problems, not one: the shared default, and the fact that `push` mutates whatever cart it is given. Both must be fixed for the documented behaviour to hold.',
    ],
    solution:
      'function addItem(item, cart = []) {\n' +
      '  return [...cart, item];\n' +
      '}\n',
    solutionExplanation:
      'There were two defects hiding behind one symptom. The obvious one is the shared default: `EMPTY_CART` is a single array created once, and because a default parameter evaluates to that same object on every call, each defaulted call pushed into the same array — so the second call returned two items. Writing the default as `[]` fixes it, because *that* expression is evaluated afresh on each call and produces a new array each time.\n\nThe second defect survives fixing the first: `push` mutates, so a caller who passed their own cart had it modified behind their back, and the "returns a new cart" promise in the comment was never true. Replacing the push with `[...cart, item]` makes the function genuinely pure, which is what the chaining tests check — building a cart step by step should leave every intermediate exactly as it was. The lesson generalises past defaults: any mutable value created once and reused across calls is shared state, whether it arrives as a default parameter, a module-level constant, or a field on a singleton.',
  },

  {
    id: 'ch-eng-memo-cache-size',
    slug: 'a-cache-that-does-not-leak',
    title: 'A Cache That Does Not Leak',
    difficulty: DIFFICULTY.MEDIUM,
    category: CATEGORY,
    topicIds: ['performance', 'closures', 'data-structures'],
    xp: XP[DIFFICULTY.MEDIUM],
    prompt:
      'An unbounded memoisation cache is a memory leak with good intentions: a long-running process caching per-user results grows forever. Write `memoizeBounded(fn, maxEntries)` caching results by the first argument while keeping at most `maxEntries` of them, evicting the oldest **inserted** entry when full. Unlike an LRU, a cache hit does not refresh an entry — this is a FIFO bound, which is simpler and often enough. Expose `size` on the returned function.',
    examples: [
      'const f = memoizeBounded(expensive, 2);\nf(1); f(2); f(3);\nf.size;   // 2 — the entry for 1 was evicted',
    ],
    constraints: ['At most `maxEntries` results are held.', 'Eviction is by insertion order; a hit does not refresh.', '`size` reports the current number of cached entries.'],
    starterCode: 'function memoizeBounded(fn, maxEntries) {\n  // Your code here\n}\n',
    tests: [
      { name: 'returns the right value', body: 'const f = memoizeBounded((n) => n * 2, 3); expect(f(5)).toBe(10);' },
      { name: 'caches a repeated call', body: 'let calls = 0; const f = memoizeBounded((n) => { calls += 1; return n; }, 3); f(1); f(1); expect(calls).toBe(1);' },
      { name: 'computes again for a new key', body: 'let calls = 0; const f = memoizeBounded((n) => { calls += 1; return n; }, 3); f(1); f(2); expect(calls).toBe(2);' },
      { name: 'reports its size', body: 'const f = memoizeBounded((n) => n, 3); f(1); f(2); expect(f.size).toBe(2);' },
      { name: 'never exceeds the bound', body: 'const f = memoizeBounded((n) => n, 2); f(1); f(2); f(3); f(4); expect(f.size).toBe(2);' },
      { name: 'evicts the oldest entry', body: 'let calls = 0; const f = memoizeBounded((n) => { calls += 1; return n; }, 2); f(1); f(2); f(3); f(1); expect(calls).toBe(4);' },
      { name: 'keeps the newer entries', body: 'let calls = 0; const f = memoizeBounded((n) => { calls += 1; return n; }, 2); f(1); f(2); f(3); f(3); expect(calls).toBe(3);' },
      { name: 'a hit does not refresh the entry', body: 'let calls = 0; const f = memoizeBounded((n) => { calls += 1; return n; }, 2); f(1); f(2); f(1); f(3); f(1); expect(calls).toBe(4);' },
      { name: 'a bound of one holds only the newest', body: 'let calls = 0; const f = memoizeBounded((n) => { calls += 1; return n; }, 1); f(1); f(2); f(1); expect(calls).toBe(3); expect(f.size).toBe(1);' },
      { name: 'caches an undefined result', body: 'let calls = 0; const f = memoizeBounded(() => { calls += 1; }, 2); f(1); f(1); expect(calls).toBe(1);' },
      { name: 'keeps number and string keys apart', body: 'let calls = 0; const f = memoizeBounded((x) => { calls += 1; return x; }, 5); f(1); f("1"); expect(calls).toBe(2);' },
      { name: 'stays bounded under heavy use', body: 'const f = memoizeBounded((n) => n, 10); for (let i = 0; i < 10000; i += 1) f(i); expect(f.size).toBe(10);' },
      { name: 'two memoized functions have separate caches', body: 'const make = () => memoizeBounded((n) => n, 2); const a = make(); const b = make(); a(1); expect(b.size).toBe(0);', hidden: true },
      { name: 'the cached value is correct after eviction and recompute', body: 'const f = memoizeBounded((n) => n * 3, 1); expect(f(2)).toBe(6); expect(f(4)).toBe(12); expect(f(2)).toBe(6);', hidden: true },
    ],
    hints: [
      'A `Map` iterates in insertion order, so its first key is always the oldest inserted entry.',
      'After storing a new result, check the size and delete the first key if you are over the bound.',
      'Use `cache.has(key)` rather than comparing the value to `undefined`, so a cached `undefined` is not recomputed forever.',
    ],
    solution:
      'function memoizeBounded(fn, maxEntries) {\n' +
      '  const cache = new Map();\n' +
      '  const wrapped = function (...args) {\n' +
      '    const key = args[0];\n' +
      '    if (cache.has(key)) return cache.get(key);\n' +
      '    const result = fn.apply(this, args);\n' +
      '    cache.set(key, result);\n' +
      '    if (cache.size > maxEntries) {\n' +
      '      cache.delete(cache.keys().next().value);\n' +
      '    }\n' +
      '    return result;\n' +
      '  };\n' +
      '  Object.defineProperty(wrapped, "size", { get: () => cache.size });\n' +
      '  return wrapped;\n' +
      '}\n',
    solutionExplanation:
      'A bound is what turns memoisation from an optimisation into something safe to leave running. The unbounded version is genuinely dangerous in a server process: cache one result per user id and the map grows until the process dies, with the leak looking exactly like normal cache growth right up to the end.\n\n`Map` insertion order does the eviction bookkeeping for free — `cache.keys().next().value` is the oldest inserted key, so a single `delete` after each insert keeps the bound. The deliberate difference from an LRU is that a *hit* does not re-insert the key, which is what the "does not refresh" test pins down: key 1 is evicted despite being read repeatedly. FIFO is cheaper and often fine, but it is worth knowing which one you have chosen, because a workload with a small hot set repeatedly evicts exactly the entries it needs. Exposing `size` through `defineProperty` with a getter rather than a plain property keeps it live rather than a stale snapshot taken at wrap time.',
  },

  {
    id: 'ch-eng-batch-writes',
    slug: 'batching-work-into-one-pass',
    title: 'Batching Work into One Pass',
    difficulty: DIFFICULTY.HARD,
    category: CATEGORY,
    topicIds: ['performance', 'promises', 'closures'],
    xp: XP[DIFFICULTY.HARD],
    prompt:
      'Requesting one record at a time turns a page render into a hundred round trips. Write `createBatcher(loadMany, schedule)` returning `load(id)`, which returns a promise for one record but collects every id requested before the next flush and asks `loadMany(ids)` for all of them at once. `loadMany` resolves to an array of results **in the same order as the ids given**. `schedule(flush)` decides when the batch goes out — injecting it keeps the tests deterministic. Requesting the same id twice in one batch must ask for it only once, and both callers get the result.',
    examples: [
      'const load = createBatcher(fetchUsers, queueMicrotask);\nconst [a, b] = await Promise.all([load(1), load(2)]);\n// fetchUsers was called once, with [1, 2]',
    ],
    constraints: ['One `loadMany` call per batch.', 'A duplicate id within a batch is requested once and delivered to every caller.', 'A rejection from `loadMany` rejects every promise in that batch.'],
    starterCode: 'function createBatcher(loadMany, schedule) {\n  // Your code here\n}\n',
    tests: [
      {
        name: 'resolves a single request',
        body:
          'const loadMany = async (ids) => ids.map((id) => "v" + id);\n' +
          'const load = createBatcher(loadMany, queueMicrotask);\n' +
          'expect(await load(1)).toBe("v1");',
      },
      {
        name: 'batches several requests into one call',
        body:
          'let calls = 0;\n' +
          'const loadMany = async (ids) => { calls += 1; return ids.map((id) => "v" + id); };\n' +
          'const load = createBatcher(loadMany, queueMicrotask);\n' +
          'await Promise.all([load(1), load(2), load(3)]);\n' +
          'expect(calls).toBe(1);',
      },
      {
        name: 'each caller gets its own result',
        body:
          'const loadMany = async (ids) => ids.map((id) => "v" + id);\n' +
          'const load = createBatcher(loadMany, queueMicrotask);\n' +
          'expect(await Promise.all([load(1), load(2)])).toEqual(["v1", "v2"]);',
      },
      {
        name: 'passes the ids in request order',
        body:
          'let seen = null;\n' +
          'const loadMany = async (ids) => { seen = ids; return ids.map((id) => id); };\n' +
          'const load = createBatcher(loadMany, queueMicrotask);\n' +
          'await Promise.all([load(3), load(1), load(2)]);\n' +
          'expect(seen).toEqual([3, 1, 2]);',
      },
      {
        name: 'requests a duplicate id only once',
        body:
          'let seen = null;\n' +
          'const loadMany = async (ids) => { seen = ids; return ids.map((id) => "v" + id); };\n' +
          'const load = createBatcher(loadMany, queueMicrotask);\n' +
          'await Promise.all([load(1), load(1), load(2)]);\n' +
          'expect(seen).toEqual([1, 2]);',
      },
      {
        name: 'both callers of a duplicate get the result',
        body:
          'const loadMany = async (ids) => ids.map((id) => "v" + id);\n' +
          'const load = createBatcher(loadMany, queueMicrotask);\n' +
          'expect(await Promise.all([load(1), load(1)])).toEqual(["v1", "v1"]);',
      },
      {
        name: 'a later batch is a separate call',
        body:
          'let calls = 0;\n' +
          'const loadMany = async (ids) => { calls += 1; return ids.map((id) => "v" + id); };\n' +
          'const load = createBatcher(loadMany, queueMicrotask);\n' +
          'await load(1);\n' +
          'await load(2);\n' +
          'expect(calls).toBe(2);',
      },
      {
        name: 'does not call loadMany before the flush',
        body:
          'let calls = 0;\n' +
          'const loadMany = async (ids) => { calls += 1; return ids.map((id) => id); };\n' +
          'let flush = null;\n' +
          'const load = createBatcher(loadMany, (fn) => { flush = fn; });\n' +
          'load(1);\n' +
          'load(2);\n' +
          'expect(calls).toBe(0);\n' +
          'flush();\n' +
          'await new Promise((r) => setTimeout(r, 5));\n' +
          'expect(calls).toBe(1);',
      },
      {
        name: 'schedules only once per batch',
        body:
          'let scheduled = 0;\n' +
          'const loadMany = async (ids) => ids;\n' +
          'const load = createBatcher(loadMany, (fn) => { scheduled += 1; queueMicrotask(fn); });\n' +
          'await Promise.all([load(1), load(2), load(3)]);\n' +
          'expect(scheduled).toBe(1);',
      },
      {
        name: 'a rejection rejects every promise in the batch',
        body:
          'const loadMany = async () => { throw new Error("boom"); };\n' +
          'const load = createBatcher(loadMany, queueMicrotask);\n' +
          'const results = await Promise.allSettled([load(1), load(2)]);\n' +
          'expect(results.every((r) => r.status === "rejected")).toBe(true);\n' +
          'expect(results[0].reason.message).toBe("boom");',
      },
      {
        name: 'recovers after a failed batch',
        body:
          'let calls = 0;\n' +
          'const loadMany = async (ids) => { calls += 1; if (calls === 1) throw new Error("boom"); return ids.map((id) => "v" + id); };\n' +
          'const load = createBatcher(loadMany, queueMicrotask);\n' +
          'await load(1).catch(() => {});\n' +
          'expect(await load(2)).toBe("v2");',
      },
      {
        name: 'handles a large batch',
        body:
          'let seen = null;\n' +
          'const loadMany = async (ids) => { seen = ids; return ids.map((id) => id * 2); };\n' +
          'const load = createBatcher(loadMany, queueMicrotask);\n' +
          'const out = await Promise.all(Array.from({ length: 100 }, (_, i) => load(i)));\n' +
          'expect(seen.length).toBe(100);\n' +
          'expect(out[99]).toBe(198);',
        hidden: true,
      },
      {
        name: 'preserves a falsy result',
        body:
          'const loadMany = async (ids) => ids.map(() => 0);\n' +
          'const load = createBatcher(loadMany, queueMicrotask);\n' +
          'expect(await load(1)).toBe(0);',
        hidden: true,
      },
    ],
    hints: [
      'Keep a pending batch: a `Map` from id to the array of `{ resolve, reject }` pairs waiting on it.',
      'Call `schedule` only when starting a *new* batch — that is, when the pending map was empty. Otherwise you would flush once per request.',
      'At flush time, take the pending map and reset it *before* awaiting, so requests arriving during the load start a fresh batch rather than joining one already in flight.',
    ],
    solution:
      'function createBatcher(loadMany, schedule) {\n' +
      '  let pending = new Map();\n' +
      '\n' +
      '  async function flush() {\n' +
      '    const batch = pending;\n' +
      '    pending = new Map();\n' +
      '    const ids = [...batch.keys()];\n' +
      '    try {\n' +
      '      const values = await loadMany(ids);\n' +
      '      ids.forEach((id, i) => {\n' +
      '        for (const waiter of batch.get(id)) waiter.resolve(values[i]);\n' +
      '      });\n' +
      '    } catch (error) {\n' +
      '      for (const waiters of batch.values()) {\n' +
      '        for (const waiter of waiters) waiter.reject(error);\n' +
      '      }\n' +
      '    }\n' +
      '  }\n' +
      '\n' +
      '  return function load(id) {\n' +
      '    return new Promise((resolve, reject) => {\n' +
      '      if (pending.size === 0) schedule(flush);\n' +
      '      if (!pending.has(id)) pending.set(id, []);\n' +
      '      pending.get(id).push({ resolve, reject });\n' +
      '    });\n' +
      '  };\n' +
      '}\n',
    solutionExplanation:
      'This is the core of a dataloader, and it works because a promise can be created now and settled much later. Each `load` call hands back a promise immediately while stashing its `resolve` and `reject`; nothing is fetched until the flush arrives.\n\nThree details carry the implementation. Scheduling only when `pending.size === 0` is what makes exactly one flush per batch rather than one per request. Swapping in a fresh `pending` map at the *top* of `flush`, before the `await`, is what stops requests made during the load from being silently added to a batch whose ids have already been sent — a bug that would leave those promises pending forever. And keying the map by id with an array of waiters is what deduplicates: two components asking for user 7 produce one entry in `ids` and two `resolve` calls, which is the whole reason this pattern eliminates the N+1 query problem rather than merely reducing it.\n\nInjecting `schedule` is what makes the batching window a policy rather than a hard-coded guess — `queueMicrotask` batches within a single synchronous burst, while a timer-based scheduler batches across a wider slice of time.',
  },

  {
    id: 'ch-eng-error-chain',
    slug: 'error-context-without-losing-the-cause',
    title: 'Error Context Without Losing the Cause',
    difficulty: DIFFICULTY.MEDIUM,
    category: CATEGORY,
    topicIds: ['errors', 'debugging', 'classes'],
    xp: XP[DIFFICULTY.MEDIUM],
    prompt:
      'Catching an error and throwing a friendlier one discards the original — and with it the actual reason for the failure. Write `withContext(message, error)` returning a new `Error` whose message is `"<message>: <original message>"` and whose `cause` is the original, and `rootCause(error)` walking the `cause` chain to the deepest error. Also write `describeChain(error)` returning the messages from outermost to innermost as an array. A chain must not loop forever if a `cause` cycle somehow exists.',
    examples: [
      'const wrapped = withContext("saving profile", new Error("timeout"));\nwrapped.message;             // "saving profile: timeout"\nrootCause(wrapped).message;  // "timeout"',
    ],
    constraints: ['`cause` holds the original error object itself.', '`rootCause` of an error with no cause is that error.', 'A cyclic cause chain must terminate.'],
    starterCode: 'function withContext(message, error) {\n  // Your code here\n}\n\nfunction rootCause(error) {\n  // Your code here\n}\n\nfunction describeChain(error) {\n  // Your code here\n}\n',
    tests: [
      { name: 'builds a combined message', body: 'expect(withContext("saving", new Error("timeout")).message).toBe("saving: timeout");' },
      { name: 'keeps the original as cause', body: 'const original = new Error("timeout"); expect(withContext("saving", original).cause).toBe(original);' },
      { name: 'returns an Error', body: 'expect(withContext("a", new Error("b")) instanceof Error).toBe(true);' },
      { name: 'rootCause finds the deepest error', body: 'const original = new Error("timeout"); expect(rootCause(withContext("saving", original))).toBe(original);' },
      { name: 'rootCause through several layers', body: 'const original = new Error("socket closed"); const wrapped = withContext("request", withContext("saving", original)); expect(rootCause(wrapped)).toBe(original);' },
      { name: 'rootCause of an unwrapped error is itself', body: 'const e = new Error("plain"); expect(rootCause(e)).toBe(e);' },
      { name: 'nested messages accumulate', body: 'expect(withContext("request", withContext("saving", new Error("timeout"))).message).toBe("request: saving: timeout");' },
      { name: 'describeChain lists the messages outermost first', body: 'const wrapped = withContext("request", withContext("saving", new Error("timeout"))); expect(describeChain(wrapped)).toEqual(["request: saving: timeout", "saving: timeout", "timeout"]);' },
      { name: 'describeChain of a plain error is one message', body: 'expect(describeChain(new Error("plain"))).toEqual(["plain"]);' },
      { name: 'a cause cycle terminates', body: 'const a = new Error("a"); const b = new Error("b"); a.cause = b; b.cause = a; expect(() => rootCause(a)).not.toThrow();' },
      { name: 'describeChain terminates on a cycle', body: 'const a = new Error("a"); const b = new Error("b"); a.cause = b; b.cause = a; expect(describeChain(a).length).toBe(2);' },
      { name: 'a self-referencing cause terminates', body: 'const a = new Error("a"); a.cause = a; expect(rootCause(a)).toBe(a); expect(describeChain(a)).toEqual(["a"]);' },
      { name: 'works with a subclass of Error', body: 'class DbError extends Error {} const original = new DbError("deadlock"); expect(rootCause(withContext("saving", original))).toBe(original);', hidden: true },
      { name: 'a non-Error cause stops the walk', body: 'const e = new Error("outer"); e.cause = "a string"; expect(rootCause(e)).toBe(e);', hidden: true },
    ],
    hints: [
      '`new Error(message, { cause })` is the standard way to attach a cause — it is a real language feature, not a convention.',
      'Walk the chain with a loop, moving to `error.cause` while it is still an `Error`.',
      'Guard the loop with a `Set` of errors already seen, so a cycle stops rather than spinning.',
    ],
    solution:
      'function withContext(message, error) {\n' +
      '  return new Error(message + ": " + error.message, { cause: error });\n' +
      '}\n' +
      '\n' +
      'function rootCause(error) {\n' +
      '  const seen = new Set();\n' +
      '  let current = error;\n' +
      '  while (current.cause instanceof Error && !seen.has(current.cause)) {\n' +
      '    seen.add(current);\n' +
      '    current = current.cause;\n' +
      '  }\n' +
      '  return current;\n' +
      '}\n' +
      '\n' +
      'function describeChain(error) {\n' +
      '  const seen = new Set();\n' +
      '  const out = [];\n' +
      '  let current = error;\n' +
      '  while (current instanceof Error && !seen.has(current)) {\n' +
      '    seen.add(current);\n' +
      '    out.push(current.message);\n' +
      '    current = current.cause;\n' +
      '  }\n' +
      '  return out;\n' +
      '}\n',
    solutionExplanation:
      'The `cause` option is a standard part of the `Error` constructor, which matters: debuggers, test runners and logging tools know to display it, so an error built this way arrives with its full history attached rather than needing a custom convention everyone has to remember.\n\nThe pattern it enables is the point. Catching an error to add context — "saving profile" — and rethrowing without the cause replaces a specific, actionable failure ("connection reset") with a vague one, and the stack trace of the original is gone too. Wrapping keeps both: the outer message says what the program was trying to do, and `rootCause` still reaches the thing that actually broke.\n\nThe `Set` guard is not paranoia. A cause chain is data, and data assembled by error-handling code under pressure can easily end up pointing at itself — an `a.cause = b; b.cause = a` pair is enough to hang the process inside a `catch` block, which is the worst possible place for an infinite loop. Checking `instanceof Error` before descending also stops the walk at a `cause` someone set to a string or an object.',
  },
];

export default challenges;
