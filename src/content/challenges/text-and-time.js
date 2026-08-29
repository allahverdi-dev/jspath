import { DIFFICULTY } from '../schema/types.js';
import { XP } from './_xp.js';

const CATEGORY = 'Regex, Dates & Numbers';

export const challenges = [
  {
    id: 'ch-rx-extract-links',
    slug: 'extract-markdown-links',
    title: 'Extract Markdown Links',
    difficulty: DIFFICULTY.MEDIUM,
    category: CATEGORY,
    topicIds: ['regex', 'strings', 'arrays'],
    xp: XP[DIFFICULTY.MEDIUM],
    prompt:
      'Write `extractLinks(markdown)` returning every `[text](url)` link as `{ text, url }`, in order. An image, written `![alt](url)`, is not a link and must be skipped. Link text may be empty, and a URL may contain parentheses in a query string — but a link never spans a line break, so stop at one.',
    examples: [
      'extractLinks("See [docs](https://x.dev) and ![img](a.png)");\n// [{ text: "docs", url: "https://x.dev" }]',
    ],
    constraints: ['Images (`![...](...)`) are excluded.', 'Neither the text nor the URL may contain a line break.', 'Order follows the input.'],
    starterCode: 'function extractLinks(markdown) {\n  // Your code here\n}\n',
    tests: [
      { name: 'extracts a single link', body: 'expect(extractLinks("[docs](https://x.dev)")).toEqual([{ text: "docs", url: "https://x.dev" }]);' },
      { name: 'extracts a link from surrounding prose', body: 'expect(extractLinks("See [docs](https://x.dev) now")).toEqual([{ text: "docs", url: "https://x.dev" }]);' },
      { name: 'extracts several links in order', body: 'expect(extractLinks("[a](1) and [b](2)").map((l) => l.text)).toEqual(["a", "b"]);' },
      { name: 'skips images', body: 'expect(extractLinks("![img](a.png)")).toEqual([]);' },
      { name: 'keeps a link next to an image', body: 'expect(extractLinks("![img](a.png) [docs](b)")).toEqual([{ text: "docs", url: "b" }]);' },
      { name: 'no links gives an empty array', body: 'expect(extractLinks("plain text")).toEqual([]);' },
      { name: 'an empty string gives an empty array', body: 'expect(extractLinks("")).toEqual([]);' },
      { name: 'allows empty link text', body: 'expect(extractLinks("[](url)")).toEqual([{ text: "", url: "url" }]);' },
      { name: 'works across lines', body: 'expect(extractLinks("[a](1)\\n[b](2)").length).toBe(2);' },
      { name: 'does not span a line break', body: 'expect(extractLinks("[a\\n](url)")).toEqual([]);' },
      { name: 'ignores unmatched brackets', body: 'expect(extractLinks("[not a link")).toEqual([]);' },
      { name: 'ignores parentheses with no bracket part', body: 'expect(extractLinks("(just parens)")).toEqual([]);' },
      { name: 'handles a url with a query string', body: 'expect(extractLinks("[a](https://x.dev?q=1&b=2)")[0].url).toBe("https://x.dev?q=1&b=2");', hidden: true },
      { name: 'an image between two links does not merge them', body: 'expect(extractLinks("[a](1) ![i](p) [b](2)").map((l) => l.url)).toEqual(["1", "2"]);', hidden: true },
    ],
    hints: [
      'Two capture groups: one for the text between the brackets, one for the URL between the parentheses.',
      'Use `[^\\]\\n]*` and `[^)\\n]*` rather than `.*` — a greedy `.*` would run past the first closing bracket and swallow several links at once.',
      'To skip images, require that the character before the `[` is not a `!`. A negative lookbehind `(?<!!)` does it, or you can capture the preceding character and check it.',
    ],
    solution:
      'function extractLinks(markdown) {\n' +
      '  const pattern = /(?<!!)\\[([^\\]\\n]*)\\]\\(([^)\\n]*)\\)/g;\n' +
      '  const out = [];\n' +
      '  for (const match of markdown.matchAll(pattern)) {\n' +
      '    out.push({ text: match[1], url: match[2] });\n' +
      '  }\n' +
      '  return out;\n' +
      '}\n',
    solutionExplanation:
      'Two decisions carry this pattern. Using negated character classes rather than `.*` keeps each match tight: `.` is greedy and would match past the first `]`, so `"[a](1) and [b](2)"` would come back as a single link with the text `a](1) and [b`. Excluding `\\n` in the same classes is what enforces the no-line-break rule, since `.` already excludes newlines but the negated classes do not. The negative lookbehind `(?<!!)` asserts that the position before the `[` is not a `!` without consuming a character — that last part matters, because a version that consumed the preceding character would fail on a link at the very start of the string, and would also let two adjacent constructs interfere.',
  },

  {
    id: 'ch-rx-parse-log',
    slug: 'parsing-log-lines',
    title: 'Parsing Log Lines',
    difficulty: DIFFICULTY.MEDIUM,
    category: CATEGORY,
    topicIds: ['regex', 'strings', 'objects'],
    xp: XP[DIFFICULTY.MEDIUM],
    prompt:
      'Log lines look like `2024-03-01T10:15:00Z ERROR api Request failed`. Write `parseLog(line)` returning `{ timestamp, level, source, message }`, or `null` if the line does not match the format. Use **named capture groups** so the pattern documents itself instead of relying on group numbers. The level is one of `DEBUG`, `INFO`, `WARN`, `ERROR`; the source is a single word; the message is everything remaining and may contain spaces.',
    examples: [
      'parseLog("2024-03-01T10:15:00Z ERROR api Request failed");\n// { timestamp: "2024-03-01T10:15:00Z", level: "ERROR",\n//   source: "api", message: "Request failed" }',
      'parseLog("garbage");  // null',
    ],
    constraints: ['Use named capture groups.', 'An unrecognised level makes the line unparseable.', 'The message is the rest of the line and may be empty.'],
    starterCode: 'function parseLog(line) {\n  // Your code here\n}\n',
    tests: [
      {
        name: 'parses a well-formed line',
        body:
          'expect(parseLog("2024-03-01T10:15:00Z ERROR api Request failed")).toEqual({\n' +
          '  timestamp: "2024-03-01T10:15:00Z", level: "ERROR", source: "api", message: "Request failed",\n' +
          '});',
      },
      { name: 'returns null for garbage', body: 'expect(parseLog("garbage")).toBe(null);' },
      { name: 'returns null for an empty line', body: 'expect(parseLog("")).toBe(null);' },
      { name: 'accepts every valid level', body: 'for (const level of ["DEBUG", "INFO", "WARN", "ERROR"]) expect(parseLog("2024-03-01T10:15:00Z " + level + " api msg").level).toBe(level);' },
      { name: 'rejects an unknown level', body: 'expect(parseLog("2024-03-01T10:15:00Z TRACE api msg")).toBe(null);' },
      { name: 'rejects a lowercase level', body: 'expect(parseLog("2024-03-01T10:15:00Z error api msg")).toBe(null);' },
      { name: 'keeps spaces in the message', body: 'expect(parseLog("2024-03-01T10:15:00Z INFO db a b c").message).toBe("a b c");' },
      { name: 'allows an empty message', body: 'expect(parseLog("2024-03-01T10:15:00Z INFO db ").message).toBe("");' },
      { name: 'captures the source', body: 'expect(parseLog("2024-03-01T10:15:00Z INFO auth-service msg").source).toBe("auth-service");' },
      { name: 'rejects a malformed timestamp', body: 'expect(parseLog("2024-3-1 INFO api msg")).toBe(null);' },
      { name: 'the message may contain punctuation', body: 'expect(parseLog("2024-03-01T10:15:00Z WARN api rate: 90% (high)").message).toBe("rate: 90% (high)");' },
      { name: 'returns exactly four keys', body: 'expect(Object.keys(parseLog("2024-03-01T10:15:00Z INFO api m")).sort()).toEqual(["level", "message", "source", "timestamp"]);' },
      { name: 'rejects a line missing the source', body: 'expect(parseLog("2024-03-01T10:15:00Z INFO")).toBe(null);', hidden: true },
      { name: 'parses many lines', body: 'const lines = Array.from({ length: 200 }, (_, i) => "2024-03-01T10:15:00Z INFO api line " + i); expect(lines.map(parseLog).filter(Boolean).length).toBe(200);', hidden: true },
    ],
    hints: [
      'Named groups are written `(?<name>...)` and come back on `match.groups`.',
      'Anchor the pattern with `^` and `$` so a line with trailing junk before the message is not partially matched.',
      'The level should be an explicit alternation of the four words, not `\\w+` — that is what makes an unknown level fail rather than parse.',
    ],
    solution:
      'function parseLog(line) {\n' +
      '  const pattern = /^(?<timestamp>\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}Z) (?<level>DEBUG|INFO|WARN|ERROR) (?<source>\\S+) (?<message>.*)$/;\n' +
      '  const match = pattern.exec(line);\n' +
      '  if (match === null) return null;\n' +
      '  const { timestamp, level, source, message } = match.groups;\n' +
      '  return { timestamp, level, source, message };\n' +
      '}\n',
    solutionExplanation:
      'Named groups turn the pattern into something readable — `match.groups.level` says what it means where `match[2]` does not, and inserting a group at the front no longer renumbers everything downstream. Spelling the level out as an alternation rather than `\\w+` is what makes validation part of the match: an unrecognised level fails the whole pattern and returns `null`, which is the honest answer for a line the parser does not understand. Anchoring with `^` and `$` prevents a partial match on a line that merely starts correctly. Note that `.*` for the message is safe here precisely because it is anchored at the end and `.` excludes newlines, so it cannot run away.',
  },

  {
    id: 'ch-rx-escape-and-highlight',
    slug: 'highlighting-a-user-query',
    title: 'Highlighting a User Query',
    difficulty: DIFFICULTY.MEDIUM,
    category: CATEGORY,
    topicIds: ['regex', 'strings', 'security'],
    xp: XP[DIFFICULTY.MEDIUM],
    prompt:
      'Building a regex from user input is how search boxes break: a query of `"c++"` throws, and `".*"` matches everything. Write `escapeRegExp(text)` making a string safe to embed in a pattern, then `highlight(text, query)` wrapping every case-insensitive occurrence of the query in `<mark>` and `</mark>`. An empty query returns the text unchanged. The original casing of the text must be preserved in the output.',
    examples: [
      'highlight("The cat sat", "cat");    // "The <mark>cat</mark> sat"',
      'highlight("a.b acb", ".");          // "a<mark>.</mark>b acb" — the dot is literal',
    ],
    constraints: ['Matching is case-insensitive; the output preserves the original casing.', 'Regex metacharacters in the query are literal.', 'An empty query changes nothing.'],
    starterCode: 'function escapeRegExp(text) {\n  // Your code here\n}\n\nfunction highlight(text, query) {\n  // Your code here\n}\n',
    tests: [
      { name: 'highlights a match', body: 'expect(highlight("The cat sat", "cat")).toBe("The <mark>cat</mark> sat");' },
      { name: 'highlights every occurrence', body: 'expect(highlight("aXaXa", "a")).toBe("<mark>a</mark>X<mark>a</mark>X<mark>a</mark>");' },
      { name: 'matches case-insensitively', body: 'expect(highlight("The Cat", "cat")).toBe("The <mark>Cat</mark>");' },
      { name: 'preserves the original casing', body: 'expect(highlight("CAT", "cat")).toBe("<mark>CAT</mark>");' },
      { name: 'an empty query changes nothing', body: 'expect(highlight("hello", "")).toBe("hello");' },
      { name: 'no match changes nothing', body: 'expect(highlight("hello", "zzz")).toBe("hello");' },
      { name: 'treats a dot as literal', body: 'expect(highlight("a.b acb", ".")).toBe("a<mark>.</mark>b acb");' },
      { name: 'treats a star as literal without throwing', body: 'expect(highlight("a*b", "*")).toBe("a<mark>*</mark>b");' },
      { name: 'does not throw on unbalanced brackets', body: 'expect(() => highlight("text", "(")).not.toThrow();' },
      { name: 'handles a plus in the query', body: 'expect(highlight("c++ rocks", "c++")).toBe("<mark>c++</mark> rocks");' },
      { name: 'escapeRegExp escapes a dot', body: 'expect(new RegExp(escapeRegExp("a.b")).test("a.b")).toBe(true); expect(new RegExp(escapeRegExp("a.b")).test("axb")).toBe(false);' },
      { name: 'escapeRegExp leaves ordinary text alone', body: 'expect(new RegExp(escapeRegExp("abc")).test("abc")).toBe(true);' },
      { name: 'escapeRegExp handles a backslash', body: 'expect(() => new RegExp(escapeRegExp("a\\\\b"))).not.toThrow();' },
      { name: 'a query matching everything does not run away', body: 'expect(highlight("abc", ".*")).toBe("abc");', hidden: true },
      { name: 'handles a query longer than the text', body: 'expect(highlight("ab", "abcdef")).toBe("ab");', hidden: true },
    ],
    hints: [
      'Escaping means putting a backslash in front of every character that has a special meaning in a pattern: `. * + ? ^ $ { } ( ) | [ ] \\`.',
      'One `replace` with a character class covers them all, using `$&` or a function to reference the matched character.',
      'For `highlight`, build the pattern from the escaped query with the `g` and `i` flags, and use a replacer function so the *matched text* is what goes inside the tags — that is what preserves the original casing.',
    ],
    solution:
      'function escapeRegExp(text) {\n' +
      '  return text.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\\\$&");\n' +
      '}\n' +
      '\n' +
      'function highlight(text, query) {\n' +
      '  if (query === "") return text;\n' +
      '  const pattern = new RegExp(escapeRegExp(query), "gi");\n' +
      '  return text.replace(pattern, (match) => "<mark>" + match + "</mark>");\n' +
      '}\n',
    solutionExplanation:
      'Escaping is not optional politeness here — without it, a query of `"("` throws a `SyntaxError` and crashes the search box, and a query of `".*"` matches the entire string. That is the regex equivalent of an injection bug: user data being interpreted as code. The `$&` in the replacement means "the matched text", which is the shortest way to write "put a backslash before whatever this was". In `highlight`, using a replacer function rather than a fixed string is what preserves casing: `match` holds the text as it appeared in the original, so a search for `"cat"` in `"CAT"` wraps `CAT` and not `cat`. Note what this deliberately does not do — it inserts raw `<mark>` tags, so `text` must already be trusted or separately escaped before it reaches the page.',
  },

  {
    id: 'ch-rx-csv-line',
    slug: 'parsing-a-csv-line',
    title: 'Parsing a CSV Line',
    difficulty: DIFFICULTY.HARD,
    category: CATEGORY,
    topicIds: ['strings', 'loops', 'regex'],
    xp: XP[DIFFICULTY.HARD],
    prompt:
      'Splitting a CSV line on commas breaks the moment a field contains one. Write `parseCsvLine(line)` returning the fields as an array, honouring the quoting rules: a field may be wrapped in double quotes, a quoted field may contain commas, and a literal double quote inside a quoted field is written as two double quotes. Unquoted fields are taken as they are, with no trimming. An empty line is one empty field.',
    examples: [
      'parseCsvLine(\'a,b,c\');              // ["a", "b", "c"]',
      'parseCsvLine(\'a,"b,c",d\');          // ["a", "b,c", "d"]',
      'parseCsvLine(\'"say ""hi"""\');       // [\'say "hi"\']',
    ],
    constraints: ['A quoted field may contain commas and escaped quotes.', 'An escaped quote is two double quotes inside a quoted field.', 'Fields are not trimmed.'],
    starterCode: 'function parseCsvLine(line) {\n  // Your code here\n}\n',
    tests: [
      { name: 'splits plain fields', body: 'expect(parseCsvLine("a,b,c")).toEqual(["a", "b", "c"]);' },
      { name: 'a single field', body: 'expect(parseCsvLine("only")).toEqual(["only"]);' },
      { name: 'an empty line is one empty field', body: 'expect(parseCsvLine("")).toEqual([""]);' },
      { name: 'keeps empty fields', body: 'expect(parseCsvLine("a,,c")).toEqual(["a", "", "c"]);' },
      { name: 'keeps a trailing empty field', body: 'expect(parseCsvLine("a,")).toEqual(["a", ""]);' },
      { name: 'keeps a leading empty field', body: 'expect(parseCsvLine(",a")).toEqual(["", "a"]);' },
      { name: 'unwraps a quoted field', body: 'expect(parseCsvLine(\'"a",b\')).toEqual(["a", "b"]);' },
      { name: 'a quoted field may contain a comma', body: 'expect(parseCsvLine(\'a,"b,c",d\')).toEqual(["a", "b,c", "d"]);' },
      { name: 'handles a doubled quote', body: 'expect(parseCsvLine(\'"say ""hi"""\')).toEqual([\'say "hi"\']);' },
      { name: 'handles an empty quoted field', body: 'expect(parseCsvLine(\'a,"",b\')).toEqual(["a", "", "b"]);' },
      { name: 'does not trim unquoted fields', body: 'expect(parseCsvLine(" a , b ")).toEqual([" a ", " b "]);' },
      { name: 'a quoted field may contain spaces', body: 'expect(parseCsvLine(\'"  spaced  "\')).toEqual(["  spaced  "]);' },
      { name: 'several quoted fields in a row', body: 'expect(parseCsvLine(\'"a","b","c"\')).toEqual(["a", "b", "c"]);' },
      { name: 'a quoted field holding only a quote', body: 'expect(parseCsvLine(\'""""\')).toEqual([\'"\']);', hidden: true },
      { name: 'handles many fields', body: 'const line = Array.from({ length: 200 }, (_, i) => "f" + i).join(","); expect(parseCsvLine(line).length).toBe(200);', hidden: true },
    ],
    hints: [
      'Walk the line character by character with a flag for whether you are currently inside a quoted field.',
      'A comma only separates fields when you are *not* inside quotes. That single condition is what makes quoted commas work.',
      'Inside quotes, a `"` followed by another `"` is a literal quote — consume both and append one. A lone `"` ends the quoted section.',
    ],
    solution:
      'function parseCsvLine(line) {\n' +
      '  const fields = [];\n' +
      '  let field = "";\n' +
      '  let inQuotes = false;\n' +
      '\n' +
      '  for (let i = 0; i < line.length; i += 1) {\n' +
      '    const char = line[i];\n' +
      '    if (inQuotes) {\n' +
      '      if (char === \'"\') {\n' +
      '        if (line[i + 1] === \'"\') {\n' +
      '          field += \'"\';\n' +
      '          i += 1;\n' +
      '        } else {\n' +
      '          inQuotes = false;\n' +
      '        }\n' +
      '      } else {\n' +
      '        field += char;\n' +
      '      }\n' +
      '    } else if (char === \'"\') {\n' +
      '      inQuotes = true;\n' +
      '    } else if (char === ",") {\n' +
      '      fields.push(field);\n' +
      '      field = "";\n' +
      '    } else {\n' +
      '      field += char;\n' +
      '    }\n' +
      '  }\n' +
      '\n' +
      '  fields.push(field);\n' +
      '  return fields;\n' +
      '}\n',
    solutionExplanation:
      'This is a small state machine, and it is a state machine because CSV is not a regular language once quoting is involved — the meaning of a comma depends on context, which a single pattern cannot express cleanly. The `inQuotes` flag is that context. Looking one character ahead at `line[i + 1]` distinguishes an escaped quote from a closing one, and advancing `i` past the second quote is what stops it being reinterpreted. The final `fields.push(field)` outside the loop is essential and easy to forget: no comma follows the last field, so nothing inside the loop ever emits it — which is also why an empty line correctly yields one empty field rather than none.',
  },

  {
    id: 'ch-date-days-between',
    slug: 'counting-days-between-dates',
    title: 'Counting Days Between Dates',
    difficulty: DIFFICULTY.MEDIUM,
    category: CATEGORY,
    topicIds: ['dates', 'numbers', 'errors'],
    xp: XP[DIFFICULTY.MEDIUM],
    prompt:
      'Write `daysBetween(a, b)` returning the whole number of calendar days from `a` to `b`, ignoring the time of day. Dividing the millisecond difference by 86,400,000 is wrong wherever daylight saving exists — some local days are 23 or 25 hours long. Compare the dates at UTC midnight instead. The result is negative when `b` is earlier, and 0 for two times on the same day.',
    examples: [
      'daysBetween(new Date("2024-03-01"), new Date("2024-03-05"));  // 4',
      'daysBetween(new Date("2024-03-05"), new Date("2024-03-01"));  // -4',
    ],
    constraints: ['Compare by UTC calendar date; the time of day is ignored.', 'The result may be negative.', 'The inputs are `Date` objects and are not modified.'],
    starterCode: 'function daysBetween(a, b) {\n  // Your code here\n}\n',
    tests: [
      { name: 'counts forward', body: 'expect(daysBetween(new Date(Date.UTC(2024, 2, 1)), new Date(Date.UTC(2024, 2, 5)))).toBe(4);' },
      { name: 'counts backward', body: 'expect(daysBetween(new Date(Date.UTC(2024, 2, 5)), new Date(Date.UTC(2024, 2, 1)))).toBe(-4);' },
      { name: 'the same day is zero', body: 'expect(daysBetween(new Date(Date.UTC(2024, 2, 1)), new Date(Date.UTC(2024, 2, 1)))).toBe(0);' },
      { name: 'ignores the time of day', body: 'expect(daysBetween(new Date(Date.UTC(2024, 2, 1, 23, 59)), new Date(Date.UTC(2024, 2, 2, 0, 1)))).toBe(1);' },
      { name: 'the same day at different times is zero', body: 'expect(daysBetween(new Date(Date.UTC(2024, 2, 1, 0, 0)), new Date(Date.UTC(2024, 2, 1, 23, 59)))).toBe(0);' },
      { name: 'crosses a month boundary', body: 'expect(daysBetween(new Date(Date.UTC(2024, 0, 31)), new Date(Date.UTC(2024, 1, 1)))).toBe(1);' },
      { name: 'crosses a year boundary', body: 'expect(daysBetween(new Date(Date.UTC(2023, 11, 31)), new Date(Date.UTC(2024, 0, 1)))).toBe(1);' },
      { name: 'handles a leap day', body: 'expect(daysBetween(new Date(Date.UTC(2024, 1, 28)), new Date(Date.UTC(2024, 2, 1)))).toBe(2);' },
      { name: 'a non-leap year has no 29 February', body: 'expect(daysBetween(new Date(Date.UTC(2023, 1, 28)), new Date(Date.UTC(2023, 2, 1)))).toBe(1);' },
      { name: 'a full non-leap year is 365 days', body: 'expect(daysBetween(new Date(Date.UTC(2023, 0, 1)), new Date(Date.UTC(2024, 0, 1)))).toBe(365);' },
      { name: 'a full leap year is 366 days', body: 'expect(daysBetween(new Date(Date.UTC(2024, 0, 1)), new Date(Date.UTC(2025, 0, 1)))).toBe(366);' },
      { name: 'does not modify the inputs', body: 'const a = new Date(Date.UTC(2024, 2, 1)); const t = a.getTime(); daysBetween(a, new Date(Date.UTC(2024, 2, 5))); expect(a.getTime()).toBe(t);' },
      { name: 'spans a daylight-saving transition cleanly', body: 'expect(daysBetween(new Date(Date.UTC(2024, 2, 9)), new Date(Date.UTC(2024, 2, 12)))).toBe(3);', hidden: true },
      { name: 'returns a whole number', body: 'expect(Number.isInteger(daysBetween(new Date(Date.UTC(2024, 2, 1, 13)), new Date(Date.UTC(2024, 5, 9, 4))))).toBe(true);', hidden: true },
    ],
    hints: [
      'Reduce each date to a UTC midnight timestamp first: `Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())`.',
      'Once both are at UTC midnight, the difference really is an exact multiple of 86,400,000, because UTC has no daylight saving.',
      'Do not mutate the inputs with `setHours` — build new timestamps instead.',
    ],
    solution:
      'function daysBetween(a, b) {\n' +
      '  const DAY = 86400000;\n' +
      '  const startOf = (d) => Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());\n' +
      '  return (startOf(b) - startOf(a)) / DAY;\n' +
      '}\n',
    solutionExplanation:
      'Normalising both dates to UTC midnight *before* subtracting is what makes the division exact. The naive version — subtracting the raw timestamps and dividing — is off by a fraction of a day whenever the two dates straddle a daylight-saving transition in the local zone, because a local day can be 23 or 25 hours long; rounding papers over it most of the time and then produces an off-by-one at the worst moment. UTC has no such transitions, so once both values are at UTC midnight the difference is genuinely a whole number of days. `Date.UTC` returns a timestamp rather than a `Date`, which conveniently means nothing is allocated and neither input is touched.',
  },

  {
    id: 'ch-date-business-days',
    slug: 'adding-business-days',
    title: 'Adding Business Days',
    difficulty: DIFFICULTY.MEDIUM,
    category: CATEGORY,
    topicIds: ['dates', 'loops', 'arrays'],
    xp: XP[DIFFICULTY.MEDIUM],
    prompt:
      'Write `addBusinessDays(date, count, holidays = [])` returning a new `Date` that many working days later, skipping Saturdays, Sundays and any date in `holidays` (an array of `YYYY-MM-DD` strings). Work entirely in UTC. A `count` of 0 returns an equivalent date even if it falls on a weekend. A negative `count` moves backwards. The input date must not be modified.',
    examples: [
      'addBusinessDays(new Date("2024-03-01"), 1);  // Monday 2024-03-04 (the 1st is a Friday)',
      'addBusinessDays(new Date("2024-03-04"), -1); // Friday 2024-03-01',
    ],
    constraints: ['All calculation is in UTC.', 'Holidays are `YYYY-MM-DD` strings.', 'The input `Date` is not modified.'],
    starterCode: 'function addBusinessDays(date, count, holidays = []) {\n  // Your code here\n}\n',
    tests: [
      { name: 'adds one weekday', body: 'expect(addBusinessDays(new Date(Date.UTC(2024, 2, 4)), 1).toISOString().slice(0, 10)).toBe("2024-03-05");' },
      { name: 'skips the weekend', body: 'expect(addBusinessDays(new Date(Date.UTC(2024, 2, 1)), 1).toISOString().slice(0, 10)).toBe("2024-03-04");' },
      { name: 'skips a whole weekend when adding several', body: 'expect(addBusinessDays(new Date(Date.UTC(2024, 2, 1)), 3).toISOString().slice(0, 10)).toBe("2024-03-06");' },
      { name: 'zero returns the same date', body: 'expect(addBusinessDays(new Date(Date.UTC(2024, 2, 1)), 0).toISOString().slice(0, 10)).toBe("2024-03-01");' },
      { name: 'zero on a weekend returns that weekend date', body: 'expect(addBusinessDays(new Date(Date.UTC(2024, 2, 2)), 0).toISOString().slice(0, 10)).toBe("2024-03-02");' },
      { name: 'moves backwards', body: 'expect(addBusinessDays(new Date(Date.UTC(2024, 2, 4)), -1).toISOString().slice(0, 10)).toBe("2024-03-01");' },
      { name: 'moves backwards across a weekend', body: 'expect(addBusinessDays(new Date(Date.UTC(2024, 2, 4)), -2).toISOString().slice(0, 10)).toBe("2024-02-29");' },
      { name: 'skips a holiday', body: 'expect(addBusinessDays(new Date(Date.UTC(2024, 2, 4)), 1, ["2024-03-05"]).toISOString().slice(0, 10)).toBe("2024-03-06");' },
      { name: 'skips several holidays', body: 'expect(addBusinessDays(new Date(Date.UTC(2024, 2, 4)), 1, ["2024-03-05", "2024-03-06"]).toISOString().slice(0, 10)).toBe("2024-03-07");' },
      { name: 'a holiday on a weekend changes nothing', body: 'expect(addBusinessDays(new Date(Date.UTC(2024, 2, 1)), 1, ["2024-03-02"]).toISOString().slice(0, 10)).toBe("2024-03-04");' },
      { name: 'crosses a month boundary', body: 'expect(addBusinessDays(new Date(Date.UTC(2024, 2, 28)), 3).toISOString().slice(0, 10)).toBe("2024-04-02");' },
      { name: 'does not modify the input', body: 'const d = new Date(Date.UTC(2024, 2, 1)); const t = d.getTime(); addBusinessDays(d, 5); expect(d.getTime()).toBe(t);' },
      { name: 'returns a new Date object', body: 'const d = new Date(Date.UTC(2024, 2, 1)); expect(addBusinessDays(d, 0)).not.toBe(d);' },
      { name: 'never lands on a weekend for a positive count', body: 'for (let n = 1; n <= 20; n += 1) { const out = addBusinessDays(new Date(Date.UTC(2024, 2, 1)), n); expect(out.getUTCDay()).not.toBe(0); expect(out.getUTCDay()).not.toBe(6); }', hidden: true },
      { name: 'ten business days from a Monday is two weeks later', body: 'expect(addBusinessDays(new Date(Date.UTC(2024, 2, 4)), 10).toISOString().slice(0, 10)).toBe("2024-03-18");', hidden: true },
    ],
    hints: [
      'Work with a copy: `new Date(date.getTime())`. Everything after that uses the UTC getters and setters.',
      'Step one day at a time in the right direction, and only decrement the remaining count when the day you land on is a working day.',
      'A `Set` of the holiday strings makes the check constant-time, and `toISOString().slice(0, 10)` gives you the same `YYYY-MM-DD` shape to compare against.',
    ],
    solution:
      'function addBusinessDays(date, count, holidays = []) {\n' +
      '  const closed = new Set(holidays);\n' +
      '  const result = new Date(date.getTime());\n' +
      '  if (count === 0) return result;\n' +
      '\n' +
      '  const step = count > 0 ? 1 : -1;\n' +
      '  let remaining = Math.abs(count);\n' +
      '  while (remaining > 0) {\n' +
      '    result.setUTCDate(result.getUTCDate() + step);\n' +
      '    const day = result.getUTCDay();\n' +
      '    const isWeekend = day === 0 || day === 6;\n' +
      '    if (!isWeekend && !closed.has(result.toISOString().slice(0, 10))) {\n' +
      '      remaining -= 1;\n' +
      '    }\n' +
      '  }\n' +
      '  return result;\n' +
      '}\n',
    solutionExplanation:
      'Stepping one day at a time and only decrementing on a working day is what makes weekends and holidays compose without any arithmetic tricks — three consecutive holidays simply take three extra steps, with no special case. `setUTCDate` handles month and year rollover for you: setting the date to 32 in March lands correctly on 1 April, which is why the month-boundary test needs no code of its own. Copying the input first is not politeness but necessity, since `setUTCDate` mutates in place and a caller\'s date silently shifting is a genuinely nasty bug. The zero case returns before the loop precisely so that it can return a weekend date unchanged, as specified. Using the UTC getters throughout keeps the result independent of the machine running it.',
  },

  {
    id: 'ch-date-relative-time',
    slug: 'relative-time-labels',
    title: 'Relative Time Labels',
    difficulty: DIFFICULTY.MEDIUM,
    category: CATEGORY,
    topicIds: ['dates', 'numbers', 'strings'],
    xp: XP[DIFFICULTY.MEDIUM],
    prompt:
      'Write `relativeTime(then, now)` producing a label like `"3 hours ago"` or `"in 2 days"`. Both arguments are timestamps in milliseconds — taking `now` as a parameter rather than calling `Date.now()` is what makes this testable. Use the largest unit that fits: seconds under a minute, then minutes, hours, days, months (30 days) and years (365 days). Under 10 seconds either way is `"just now"`. Singular units drop the `s`.',
    examples: [
      'relativeTime(now - 3 * 3600e3, now);  // "3 hours ago"',
      'relativeTime(now + 2 * 86400e3, now); // "in 2 days"',
      'relativeTime(now - 3000, now);        // "just now"',
    ],
    constraints: ['Both arguments are millisecond timestamps.', 'Under 10 seconds in either direction is `"just now"`.', 'A count of 1 uses the singular unit name.'],
    starterCode: 'function relativeTime(then, now) {\n  // Your code here\n}\n',
    tests: [
      { name: 'a few seconds ago is just now', body: 'expect(relativeTime(1000 - 3000, 1000)).toBe("just now");' },
      { name: 'a few seconds ahead is just now', body: 'expect(relativeTime(1000 + 3000, 1000)).toBe("just now");' },
      { name: 'the same instant is just now', body: 'expect(relativeTime(1000, 1000)).toBe("just now");' },
      { name: 'seconds in the past', body: 'expect(relativeTime(100000 - 30000, 100000)).toBe("30 seconds ago");' },
      { name: 'minutes in the past', body: 'expect(relativeTime(1e9 - 5 * 60000, 1e9)).toBe("5 minutes ago");' },
      { name: 'a single minute is singular', body: 'expect(relativeTime(1e9 - 60000, 1e9)).toBe("1 minute ago");' },
      { name: 'hours in the past', body: 'expect(relativeTime(1e9 - 3 * 3600000, 1e9)).toBe("3 hours ago");' },
      { name: 'a single hour is singular', body: 'expect(relativeTime(1e9 - 3600000, 1e9)).toBe("1 hour ago");' },
      { name: 'days in the past', body: 'expect(relativeTime(1e10 - 3 * 86400000, 1e10)).toBe("3 days ago");' },
      { name: 'days in the future', body: 'expect(relativeTime(1e10 + 2 * 86400000, 1e10)).toBe("in 2 days");' },
      { name: 'a single day in the future is singular', body: 'expect(relativeTime(1e10 + 86400000, 1e10)).toBe("in 1 day");' },
      { name: 'months', body: 'expect(relativeTime(1e11 - 60 * 86400000, 1e11)).toBe("2 months ago");' },
      { name: 'years', body: 'expect(relativeTime(1e11 - 2 * 365 * 86400000, 1e11)).toBe("2 years ago");' },
      { name: 'rounds down to the largest whole unit', body: 'expect(relativeTime(1e10 - (90 * 60000), 1e10)).toBe("1 hour ago");' },
      { name: 'the boundary at ten seconds is not just now', body: 'expect(relativeTime(1e10 - 10000, 1e10)).toBe("10 seconds ago");', hidden: true },
      { name: 'a single year is singular', body: 'expect(relativeTime(1e11 - 365 * 86400000, 1e11)).toBe("1 year ago");', hidden: true },
    ],
    hints: [
      'Work with the absolute difference to choose the unit, and use the sign only to pick between `"... ago"` and `"in ..."`.',
      'A table of `[unitName, milliseconds]` from largest to smallest lets one loop find the right unit — take the first whose size fits.',
      'Pluralise from the count, not the unit: append an `s` unless the count is exactly 1.',
    ],
    solution:
      'function relativeTime(then, now) {\n' +
      '  const diff = then - now;\n' +
      '  const abs = Math.abs(diff);\n' +
      '  if (abs < 10000) return "just now";\n' +
      '\n' +
      '  const units = [\n' +
      '    ["year", 365 * 86400000],\n' +
      '    ["month", 30 * 86400000],\n' +
      '    ["day", 86400000],\n' +
      '    ["hour", 3600000],\n' +
      '    ["minute", 60000],\n' +
      '    ["second", 1000],\n' +
      '  ];\n' +
      '\n' +
      '  for (const [name, size] of units) {\n' +
      '    if (abs >= size) {\n' +
      '      const count = Math.floor(abs / size);\n' +
      '      const label = count + " " + name + (count === 1 ? "" : "s");\n' +
      '      return diff < 0 ? label + " ago" : "in " + label;\n' +
      '    }\n' +
      '  }\n' +
      '  return "just now";\n' +
      '}\n',
    solutionExplanation:
      'Ordering the unit table from largest to smallest means the first unit that fits is the right one, so "90 minutes" becomes "1 hour ago" rather than "90 minutes ago" without any extra comparison. Separating magnitude from direction early — the absolute value chooses the unit, the sign chooses the phrasing — halves the number of branches. Taking `now` as a parameter is what makes every one of these tests deterministic; a version calling `Date.now()` internally could only be tested against itself or with a mocked clock. In production `Intl.RelativeTimeFormat` does this properly, with correct pluralisation in every language, and is what you should reach for — the month and year approximations here are exactly the kind of thing a real internationalisation library handles for you.',
  },

  {
    id: 'ch-num-money',
    slug: 'money-without-rounding-errors',
    title: 'Money Without Rounding Errors',
    difficulty: DIFFICULTY.MEDIUM,
    category: CATEGORY,
    topicIds: ['numbers', 'arrays', 'strings'],
    xp: XP[DIFFICULTY.MEDIUM],
    prompt:
      'Binary floating point cannot represent 0.1 exactly, which is why `0.1 + 0.2` is `0.30000000000000004` and why money should never be stored as a fractional number. Write `parseAmount(text)` turning a string like `"12.34"` into an integer number of cents, and `sumAmounts(texts)` adding a list of them and returning the total formatted back to two decimal places. All arithmetic happens in integer cents.',
    examples: [
      'parseAmount("12.34");                    // 1234',
      'sumAmounts(["0.10", "0.20"]);            // "0.30"',
      'sumAmounts(["19.99", "5.01"]);           // "25.00"',
    ],
    constraints: ['Amounts have zero, one or two decimal places.', 'A leading minus sign is allowed.', '`sumAmounts` always returns exactly two decimal places.'],
    starterCode: 'function parseAmount(text) {\n  // Your code here\n}\n\nfunction sumAmounts(texts) {\n  // Your code here\n}\n',
    tests: [
      { name: 'parses two decimal places', body: 'expect(parseAmount("12.34")).toBe(1234);' },
      { name: 'parses one decimal place', body: 'expect(parseAmount("12.3")).toBe(1230);' },
      { name: 'parses a whole number', body: 'expect(parseAmount("12")).toBe(1200);' },
      { name: 'parses zero', body: 'expect(parseAmount("0")).toBe(0);' },
      { name: 'parses a small amount', body: 'expect(parseAmount("0.05")).toBe(5);' },
      { name: 'parses a negative amount', body: 'expect(parseAmount("-1.50")).toBe(-150);' },
      { name: 'returns an integer', body: 'expect(Number.isInteger(parseAmount("0.07"))).toBe(true);' },
      { name: 'sums exactly where floats would not', body: 'expect(sumAmounts(["0.10", "0.20"])).toBe("0.30");' },
      { name: 'the float version really is wrong', body: 'expect(0.1 + 0.2).not.toBe(0.3);' },
      { name: 'sums to a round total', body: 'expect(sumAmounts(["19.99", "5.01"])).toBe("25.00");' },
      { name: 'always shows two decimal places', body: 'expect(sumAmounts(["1"])).toBe("1.00");' },
      { name: 'an empty list sums to zero', body: 'expect(sumAmounts([])).toBe("0.00");' },
      { name: 'handles negatives in the sum', body: 'expect(sumAmounts(["10.00", "-2.50"])).toBe("7.50");' },
      { name: 'sums to a negative total', body: 'expect(sumAmounts(["1.00", "-3.00"])).toBe("-2.00");' },
      { name: 'a long list stays exact', body: 'expect(sumAmounts(Array.from({ length: 1000 }, () => "0.01"))).toBe("10.00");', hidden: true },
      { name: 'a negative total under a unit formats correctly', body: 'expect(sumAmounts(["-0.05"])).toBe("-0.05");', hidden: true },
    ],
    hints: [
      'Do not multiply by 100 and round — `parseFloat("0.07") * 100` is 7.000000000000001, and `"1.15" * 100` is 114.99999999999999.',
      'Split the string on the decimal point instead, and pad the fractional part to two digits. That is pure string work with no float involved.',
      'Formatting back is the same operation reversed: divide by 100 with integer division and remainder, then pad the remainder to two digits — and be careful with the sign.',
    ],
    solution:
      'function parseAmount(text) {\n' +
      '  const negative = text.startsWith("-");\n' +
      '  const body = negative ? text.slice(1) : text;\n' +
      '  const [whole, fraction = ""] = body.split(".");\n' +
      '  const cents = Number(whole) * 100 + Number(fraction.padEnd(2, "0"));\n' +
      '  return negative ? -cents : cents;\n' +
      '}\n' +
      '\n' +
      'function sumAmounts(texts) {\n' +
      '  const total = texts.reduce((sum, text) => sum + parseAmount(text), 0);\n' +
      '  const sign = total < 0 ? "-" : "";\n' +
      '  const abs = Math.abs(total);\n' +
      '  return sign + Math.floor(abs / 100) + "." + String(abs % 100).padStart(2, "0");\n' +
      '}\n',
    solutionExplanation:
      'Parsing through string manipulation rather than `parseFloat(text) * 100` is the whole point: that multiplication is not reliable, since `"0.07"` becomes 7.000000000000001 and `"1.15"` becomes 114.99999999999999, so rounding is required and the rounding direction becomes a source of half-cent errors. Splitting on the decimal point and padding never involves a fractional value at all. Once everything is integer cents, addition is exact — the thousand-times-one-penny test would drift with floats and lands on exactly `"10.00"` here. The sign is handled explicitly at both ends because `Math.floor(-5 / 100)` is `-1`, not `0`, which would render `-0.05` as `"-1.95"`; working with the absolute value and prefixing the sign avoids reasoning about how floor behaves on negatives.',
  },

  {
    id: 'ch-num-precision',
    slug: 'comparing-floats-safely',
    title: 'Comparing Floats Safely',
    difficulty: DIFFICULTY.EASY,
    category: CATEGORY,
    topicIds: ['numbers', 'operators', 'booleans'],
    xp: XP[DIFFICULTY.EASY],
    prompt:
      'Write `nearlyEqual(a, b, relativeTolerance = 1e-9)` reporting whether two numbers are equal to within a **relative** tolerance — the difference scaled to the size of the values, so it works for 0.3 and for 3 billion alike. A fixed absolute tolerance fails at both extremes: too coarse for tiny numbers, too fine for huge ones. Handle the special cases explicitly: two identical infinities are equal, `NaN` is equal to nothing, and two zeros of either sign are equal.',
    examples: [
      'nearlyEqual(0.1 + 0.2, 0.3);            // true',
      'nearlyEqual(1e12, 1e12 + 1);            // true  — 1 is negligible at that scale',
      'nearlyEqual(1e-12, 2e-12);              // false — a factor of two, however small',
      'nearlyEqual(NaN, NaN);                  // false',
    ],
    constraints: ['The tolerance is relative to the larger magnitude.', '`NaN` is never nearly equal to anything, including itself.', '`Infinity` is nearly equal only to the same infinity.'],
    starterCode: 'function nearlyEqual(a, b, relativeTolerance = 1e-9) {\n  // Your code here\n}\n',
    tests: [
      { name: 'the classic floating-point sum', body: 'expect(nearlyEqual(0.1 + 0.2, 0.3)).toBe(true);' },
      { name: 'strict equality really does fail there', body: 'expect(0.1 + 0.2 === 0.3).toBe(false);' },
      { name: 'identical values are equal', body: 'expect(nearlyEqual(1.5, 1.5)).toBe(true);' },
      { name: 'clearly different values are not', body: 'expect(nearlyEqual(1, 2)).toBe(false);' },
      { name: 'zero equals zero', body: 'expect(nearlyEqual(0, 0)).toBe(true);' },
      { name: 'negative zero equals zero', body: 'expect(nearlyEqual(0, -0)).toBe(true);' },
      { name: 'zero is not nearly equal to a small number', body: 'expect(nearlyEqual(0, 0.001)).toBe(false);' },
      { name: 'works at a large scale', body: 'expect(nearlyEqual(1e12, 1e12 + 1)).toBe(true);' },
      { name: 'a large relative difference is caught at a large scale', body: 'expect(nearlyEqual(1e12, 1.1e12)).toBe(false);' },
      { name: 'works at a small scale', body: 'expect(nearlyEqual(1e-12, 1.0000000001e-12)).toBe(true);' },
      { name: 'a large relative difference is caught at a small scale', body: 'expect(nearlyEqual(1e-12, 2e-12)).toBe(false);' },
      { name: 'NaN is equal to nothing', body: 'expect(nearlyEqual(NaN, NaN)).toBe(false); expect(nearlyEqual(NaN, 1)).toBe(false);' },
      { name: 'the same infinity is equal', body: 'expect(nearlyEqual(Infinity, Infinity)).toBe(true);' },
      { name: 'opposite infinities are not', body: 'expect(nearlyEqual(Infinity, -Infinity)).toBe(false);' },
      { name: 'infinity is not nearly equal to a finite number', body: 'expect(nearlyEqual(Infinity, 1e308)).toBe(false);' },
      { name: 'honours a looser tolerance', body: 'expect(nearlyEqual(1, 1.05, 0.1)).toBe(true); expect(nearlyEqual(1, 1.05, 0.001)).toBe(false);', hidden: true },
      { name: 'negative values compare by magnitude', body: 'expect(nearlyEqual(-0.1 - 0.2, -0.3)).toBe(true);', hidden: true },
    ],
    hints: [
      'Handle the exact cases first: if `a === b`, they are equal (this also covers both infinities and both zeros).',
      '`NaN` fails every comparison, so a `Number.isNaN` check on either value returning false handles it — and a non-finite value that was not caught by `a === b` cannot be nearly equal to anything.',
      'The relative test is `Math.abs(a - b) <= tolerance * Math.max(Math.abs(a), Math.abs(b))`.',
    ],
    solution:
      'function nearlyEqual(a, b, relativeTolerance = 1e-9) {\n' +
      '  if (a === b) return true;\n' +
      '  if (!Number.isFinite(a) || !Number.isFinite(b)) return false;\n' +
      '  const scale = Math.max(Math.abs(a), Math.abs(b));\n' +
      '  return Math.abs(a - b) <= relativeTolerance * scale;\n' +
      '}\n',
    solutionExplanation:
      'The `a === b` shortcut does more work than it looks: it settles two identical infinities, and it makes `0` and `-0` equal, since `===` considers them so. Everything non-finite that survives that check — a `NaN`, or two opposite infinities — is then rejected by the finiteness guard, which also stops `Infinity - Infinity` producing a `NaN` that would silently fail the final comparison anyway. Scaling the tolerance by the larger magnitude is what makes one function work across the whole range: an absolute tolerance of 1e-9 would call 1e12 and 1e12+1 different (they are indistinguishable at that precision) and would call 1e-12 and 2e-12 equal (they differ by a factor of two). The one case relative tolerance cannot handle is comparison against exact zero, where no non-zero value is ever within a relative distance — which is why `nearlyEqual(0, 0.001)` is correctly false, and why code comparing against zero needs an absolute threshold chosen for its domain.',
  },
];

export default challenges;
