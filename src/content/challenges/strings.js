import { DIFFICULTY } from '../schema/types.js';
import { XP } from './_xp.js';

const CATEGORY = 'Strings & Text';

export const challenges = [
  {
    id: 'ch-str-title-case',
    slug: 'title-case-a-heading',
    title: 'Title Case a Heading',
    difficulty: DIFFICULTY.BEGINNER,
    category: CATEGORY,
    topicIds: ['strings', 'array-methods'],
    xp: XP[DIFFICULTY.BEGINNER],
    prompt:
      'Write `titleCase(text)` that uppercases the first letter of every word and lowercases the rest, so `"hELLO wORLD"` becomes `"Hello World"`. Words are separated by single spaces, and the spacing of the input must be preserved exactly — if the input has two spaces between words, so does the output.',
    examples: ['titleCase("hello world");   // "Hello World"\ntitleCase("hELLO wORLD");   // "Hello World"\ntitleCase("a  b");          // "A  B"'],
    constraints: ['The input contains only letters and spaces.', 'The input may be empty.'],
    starterCode: 'function titleCase(text) {\n  // Your code here\n}\n',
    tests: [
      { name: 'capitalises each word', body: 'expect(titleCase("hello world")).toBe("Hello World");' },
      { name: 'lowercases the rest of each word', body: 'expect(titleCase("hELLO wORLD")).toBe("Hello World");' },
      { name: 'handles a single word', body: 'expect(titleCase("javascript")).toBe("Javascript");' },
      { name: 'handles an already-correct string', body: 'expect(titleCase("Hello World")).toBe("Hello World");' },
      { name: 'handles a single letter', body: 'expect(titleCase("a")).toBe("A");' },
      { name: 'handles an empty string', body: 'expect(titleCase("")).toBe("");' },
      { name: 'preserves doubled spaces', body: 'expect(titleCase("a  b")).toBe("A  B");' },
      { name: 'preserves a leading space', body: 'expect(titleCase(" hi")).toBe(" Hi");', hidden: true },
      { name: 'preserves a trailing space', body: 'expect(titleCase("hi ")).toBe("Hi ");', hidden: true },
    ],
    hints: [
      'Splitting on a single space and joining back with a single space is the natural first attempt — check what it does to `"a  b"` before you commit to it.',
      'Splitting on `" "` actually does preserve doubled spaces, because the gap between two adjacent spaces is an empty string element. Capitalising an empty string is safely an empty string.',
      '`charAt(0)` is safer than `[0]` on a possibly-empty piece: it returns `""` rather than `undefined`.',
    ],
    solution:
      'function titleCase(text) {\n' +
      '  return text\n' +
      '    .split(" ")\n' +
      '    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())\n' +
      '    .join(" ");\n' +
      '}\n',
    solutionExplanation:
      'Splitting on a literal single space rather than a whitespace regex is what preserves the original spacing: `"a  b"` splits into `["a", "", "b"]`, the empty middle element survives the map untouched, and joining restores both spaces. Using `charAt(0)` instead of `word[0]` matters for exactly that empty element — `""[0]` is `undefined`, and `undefined.toUpperCase()` throws. `slice(1)` on an empty string is safely `""` either way.',
  },

  {
    id: 'ch-str-truncate',
    slug: 'truncate-with-ellipsis',
    title: 'Truncate With Ellipsis',
    difficulty: DIFFICULTY.EASY,
    category: CATEGORY,
    topicIds: ['strings', 'control-flow'],
    xp: XP[DIFFICULTY.EASY],
    prompt:
      'Write `truncate(text, maxLength)` that shortens a string so the **result** is never longer than `maxLength`, appending `"…"` (a single ellipsis character) when anything was cut. A string that already fits is returned untouched, with no ellipsis. The ellipsis counts toward the limit, so truncating to 5 leaves room for 4 characters of text.',
    examples: [
      'truncate("Hello world", 8);  // "Hello w…"\ntruncate("Hi", 8);          // "Hi"\ntruncate("Hello", 5);       // "Hello"',
    ],
    constraints: ['`maxLength` is an integer of at least 1.', 'The ellipsis is the single character `"…"`, not three dots.', 'The result never exceeds `maxLength` characters.'],
    starterCode: 'function truncate(text, maxLength) {\n  // Your code here\n}\n',
    tests: [
      { name: 'truncates and appends an ellipsis', body: 'expect(truncate("Hello world", 8)).toBe("Hello w…");' },
      { name: 'leaves a short string alone', body: 'expect(truncate("Hi", 8)).toBe("Hi");' },
      { name: 'an exactly-fitting string gets no ellipsis', body: 'expect(truncate("Hello", 5)).toBe("Hello");' },
      { name: 'one character over does get truncated', body: 'expect(truncate("Hello!", 5)).toBe("Hell…");' },
      { name: 'the result never exceeds the limit', body: 'expect(truncate("abcdefghij", 4).length).toBe(4);' },
      { name: 'handles a limit of one', body: 'expect(truncate("abc", 1)).toBe("…");' },
      { name: 'handles an empty string', body: 'expect(truncate("", 5)).toBe("");' },
      { name: 'uses one ellipsis character, not three dots', body: 'expect(truncate("abcdef", 4)).toBe("abc…");', hidden: true },
    ],
    hints: [
      'Decide first whether truncation is needed at all — compare the length to the limit before doing anything else.',
      'When it is needed, you have `maxLength - 1` characters of room for the text itself.',
      'Check the boundary carefully: a string of exactly `maxLength` characters fits, so the condition is `>` and not `>=`.',
    ],
    solution:
      'function truncate(text, maxLength) {\n' +
      '  if (text.length <= maxLength) return text;\n' +
      '  return text.slice(0, maxLength - 1) + "…";\n' +
      '}\n',
    solutionExplanation:
      'The guard uses `<=` so that a string of exactly `maxLength` characters is returned untouched — truncating it would make the output *shorter* than necessary and add an ellipsis that lies about missing content. Once truncation is needed, the ellipsis is part of the budget, so only `maxLength - 1` characters of text survive; that is what keeps the promise that the result never exceeds the limit. With `maxLength` of 1, `slice(0, 0)` is `""` and the result is just the ellipsis.',
  },

  {
    id: 'ch-str-slugify',
    slug: 'url-slugs',
    title: 'URL Slugs',
    difficulty: DIFFICULTY.EASY,
    category: CATEGORY,
    topicIds: ['strings', 'regex'],
    xp: XP[DIFFICULTY.EASY],
    prompt:
      'Write `slugify(title)` turning a human title into a URL slug: lowercase, with runs of anything that is not a letter or digit collapsed into a single hyphen, and no hyphen at either end. `"  Hello, World! 2024  "` becomes `"hello-world-2024"`. A title with nothing usable in it produces an empty string.',
    examples: ['slugify("Hello, World!");        // "hello-world"\nslugify("  Spaced   Out  ");     // "spaced-out"\nslugify("!!!");                  // ""'],
    constraints: ['Only ASCII letters `a`–`z` and digits `0`–`9` survive.', 'Consecutive separators collapse into one hyphen.', 'No leading or trailing hyphen.'],
    starterCode: 'function slugify(title) {\n  // Your code here\n}\n',
    tests: [
      { name: 'lowercases and hyphenates', body: 'expect(slugify("Hello, World!")).toBe("hello-world");' },
      { name: 'collapses runs of separators', body: 'expect(slugify("Spaced   Out")).toBe("spaced-out");' },
      { name: 'trims leading and trailing separators', body: 'expect(slugify("  Hi  ")).toBe("hi");' },
      { name: 'keeps digits', body: 'expect(slugify("Top 10 Tips")).toBe("top-10-tips");' },
      { name: 'collapses mixed punctuation', body: 'expect(slugify("a - _ b")).toBe("a-b");' },
      { name: 'a title with nothing usable is empty', body: 'expect(slugify("!!!")).toBe("");' },
      { name: 'an empty title is empty', body: 'expect(slugify("")).toBe("");' },
      { name: 'does not double up existing hyphens', body: 'expect(slugify("well-known")).toBe("well-known");' },
      { name: 'strips a trailing punctuation run', body: 'expect(slugify("What?!")).toBe("what");', hidden: true },
      { name: 'handles a single character', body: 'expect(slugify("A")).toBe("a");', hidden: true },
    ],
    hints: [
      'Three transformations in order: lowercase, replace separator runs with a hyphen, then remove hyphens at the ends.',
      'A character class with a `+` quantifier replaces a whole run at once — that is what stops `"a   b"` becoming `"a---b"`.',
      'Anchors let you strip the ends: `^-+` and `-+$`, or one alternation with the global flag.',
    ],
    solution:
      'function slugify(title) {\n' +
      '  return title\n' +
      '    .toLowerCase()\n' +
      '    .replace(/[^a-z0-9]+/g, "-")\n' +
      '    .replace(/^-+|-+$/g, "");\n' +
      '}\n',
    solutionExplanation:
      'Lowercasing first is what lets the character class name only `a-z` rather than both cases. The `+` on `[^a-z0-9]+` is the important detail: it consumes an entire run of unwanted characters as one match, so `"Spaced   Out"` yields a single hyphen instead of three. Because that replacement happily creates hyphens at the ends when the input starts or finishes with punctuation, the trim has to come after it, not before — running them the other way round leaves `"what-"` from `"What?!"`.',
  },

  {
    id: 'ch-str-word-frequency',
    slug: 'word-frequency-count',
    title: 'Word Frequency Count',
    difficulty: DIFFICULTY.EASY,
    category: CATEGORY,
    topicIds: ['strings', 'objects', 'regex'],
    xp: XP[DIFFICULTY.EASY],
    prompt:
      'Write `wordFrequencies(text)` returning a `Map` from each word to how many times it appears. Words are case-insensitive (`"The"` and `"the"` are the same word) and punctuation attached to a word is not part of it. Return a `Map`, not a plain object — word lists contain entries like `"constructor"` that collide with inherited object keys.',
    examples: [
      'wordFrequencies("the cat the hat");\n// Map { "the" => 2, "cat" => 1, "hat" => 1 }',
      'wordFrequencies("Hi! Hi?");\n// Map { "hi" => 2 }',
    ],
    constraints: ['A word is a run of letters, digits or apostrophes.', 'Return a `Map` instance.', 'An empty or word-free string produces an empty `Map`.'],
    starterCode: 'function wordFrequencies(text) {\n  // Your code here\n}\n',
    tests: [
      { name: 'counts repeated words', body: 'const m = wordFrequencies("the cat the hat"); expect(m.get("the")).toBe(2); expect(m.get("cat")).toBe(1);' },
      { name: 'returns a Map', body: 'expect(wordFrequencies("a") instanceof Map).toBe(true);' },
      { name: 'is case-insensitive', body: 'expect(wordFrequencies("The the THE").get("the")).toBe(3);' },
      { name: 'strips attached punctuation', body: 'expect(wordFrequencies("Hi! Hi?").get("hi")).toBe(2);' },
      { name: 'keeps apostrophes inside words', body: "expect(wordFrequencies(\"don't don't\").get(\"don't\")).toBe(2);" },
      { name: 'an empty string gives an empty map', body: 'expect(wordFrequencies("").size).toBe(0);' },
      { name: 'a punctuation-only string gives an empty map', body: 'expect(wordFrequencies("... ---").size).toBe(0);' },
      { name: 'reports the right number of distinct words', body: 'expect(wordFrequencies("a b c a").size).toBe(3);' },
      { name: 'is not confused by inherited object keys', body: 'const m = wordFrequencies("constructor valueOf constructor"); expect(m.get("constructor")).toBe(2); expect(m.get("valueof")).toBe(1); expect(m.size).toBe(2);', hidden: true },
      { name: 'handles digits as words', body: 'expect(wordFrequencies("year 2024 and 2024").get("2024")).toBe(2);', hidden: true },
    ],
    hints: [
      'Extracting words with a pattern for what a word *is* handles punctuation better than splitting on what separates them.',
      '`String.prototype.match` with a global regex returns every match as an array — or `null` when there are none, which you must handle.',
      'The `constructor` test is the reason for the `Map`: on a plain object, `counts["constructor"]` starts out as an inherited function rather than `undefined`.',
    ],
    solution:
      'function wordFrequencies(text) {\n' +
      "  const words = text.toLowerCase().match(/[a-z0-9']+/g) ?? [];\n" +
      '  const counts = new Map();\n' +
      '  for (const word of words) {\n' +
      '    counts.set(word, (counts.get(word) ?? 0) + 1);\n' +
      '  }\n' +
      '  return counts;\n' +
      '}\n',
    solutionExplanation:
      'Matching what a word *is* rather than splitting on what separates it means punctuation never has to be stripped in a second pass. `match` returns `null` — not an empty array — when nothing matches, so the `?? []` is what keeps a punctuation-only input from throwing. The `Map` is not stylistic: with a plain object, `counts["constructor"]` inherits `Object.prototype.constructor`, a function, so `(counts["constructor"] ?? 0) + 1` would produce a string of source code rather than 1. `Map` keys have no such inheritance.',
  },

  {
    id: 'ch-str-palindrome',
    slug: 'palindrome-check',
    title: 'Palindrome Check',
    difficulty: DIFFICULTY.EASY,
    category: CATEGORY,
    topicIds: ['strings', 'regex', 'booleans'],
    xp: XP[DIFFICULTY.EASY],
    prompt:
      'Write `isPalindrome(text)` reporting whether a string reads the same forwards and backwards, ignoring case, spaces and punctuation. `"A man, a plan, a canal: Panama"` is a palindrome. A string with no letters or digits at all counts as one, since it trivially matches its own reverse.',
    examples: ['isPalindrome("A man, a plan, a canal: Panama"); // true\nisPalindrome("hello");                          // false\nisPalindrome("");                               // true'],
    constraints: ['Only letters and digits are considered.', 'Comparison is case-insensitive.', 'Return an actual boolean.'],
    starterCode: 'function isPalindrome(text) {\n  // Your code here\n}\n',
    tests: [
      { name: 'a classic phrase palindrome', body: 'expect(isPalindrome("A man, a plan, a canal: Panama")).toBe(true);' },
      { name: 'a non-palindrome', body: 'expect(isPalindrome("hello")).toBe(false);' },
      { name: 'a simple word palindrome', body: 'expect(isPalindrome("racecar")).toBe(true);' },
      { name: 'ignores case', body: 'expect(isPalindrome("RaceCar")).toBe(true);' },
      { name: 'an empty string counts', body: 'expect(isPalindrome("")).toBe(true);' },
      { name: 'a single character counts', body: 'expect(isPalindrome("x")).toBe(true);' },
      { name: 'punctuation only counts', body: 'expect(isPalindrome(".,!")).toBe(true);' },
      { name: 'digits participate', body: 'expect(isPalindrome("12321")).toBe(true);' },
      { name: 'an even-length palindrome', body: 'expect(isPalindrome("abba")).toBe(true);' },
      { name: 'nearly a palindrome', body: 'expect(isPalindrome("abca")).toBe(false);', hidden: true },
      { name: 'returns a real boolean', body: 'expect(typeof isPalindrome("abc")).toBe("boolean");', hidden: true },
    ],
    hints: [
      'Normalise first, compare second. Once the string is stripped down to lowercase letters and digits, the check itself is one comparison.',
      'A string has no `reverse` method, but an array does — and a string can become an array and back again.',
      'You can also compare from both ends inward with two indices, which avoids building a second string at all.',
    ],
    solution:
      'function isPalindrome(text) {\n' +
      '  const clean = text.toLowerCase().replace(/[^a-z0-9]/g, "");\n' +
      '  let left = 0;\n' +
      '  let right = clean.length - 1;\n' +
      '  while (left < right) {\n' +
      '    if (clean[left] !== clean[right]) return false;\n' +
      '    left += 1;\n' +
      '    right -= 1;\n' +
      '  }\n' +
      '  return true;\n' +
      '}\n',
    solutionExplanation:
      'Separating normalisation from comparison is what keeps this simple: after the `replace`, the palindrome question is asked of a string with no special cases left in it. The two-pointer walk compares from both ends inward and stops as soon as a pair disagrees, so a non-palindrome like `"abca"` is rejected on the first comparison rather than after building a whole reversed copy. Reversing via `[...clean].reverse().join("")` is equally correct and shorter; it just allocates a second string where this does not.',
  },

  {
    id: 'ch-str-word-wrap',
    slug: 'wrap-text-to-width',
    title: 'Wrap Text to Width',
    difficulty: DIFFICULTY.MEDIUM,
    category: CATEGORY,
    topicIds: ['strings', 'arrays', 'loops'],
    xp: XP[DIFFICULTY.MEDIUM],
    prompt:
      'Write `wrapText(text, width)` that breaks a sentence into lines no longer than `width` characters, returning an array of lines. Break only between words — never in the middle of one. A word longer than `width` cannot be broken and gets a line to itself, even though that line exceeds the width. Collapse runs of whitespace, and produce no empty lines.',
    examples: [
      'wrapText("the quick brown fox", 10);\n// ["the quick", "brown fox"]',
      'wrapText("a supercalifragilistic b", 5);\n// ["a", "supercalifragilistic", "b"]',
    ],
    constraints: ['`width` is a positive integer.', 'Words are separated by whitespace in the input; lines are joined by single spaces in the output.', 'An empty or whitespace-only input produces an empty array.'],
    starterCode: 'function wrapText(text, width) {\n  // Your code here\n}\n',
    tests: [
      { name: 'wraps at a word boundary', body: 'expect(wrapText("the quick brown fox", 10)).toEqual(["the quick", "brown fox"]);' },
      { name: 'a short text stays on one line', body: 'expect(wrapText("hi there", 20)).toEqual(["hi there"]);' },
      { name: 'never exceeds the width when it can avoid it', body: 'for (const line of wrapText("aa bb cc dd ee ff", 5)) expect(line.length <= 5).toBe(true);' },
      { name: 'an over-long word gets its own line', body: 'expect(wrapText("a supercalifragilistic b", 5)).toEqual(["a", "supercalifragilistic", "b"]);' },
      { name: 'collapses runs of whitespace', body: 'expect(wrapText("a   b", 10)).toEqual(["a b"]);' },
      { name: 'an empty string produces no lines', body: 'expect(wrapText("", 10)).toEqual([]);' },
      { name: 'a whitespace-only string produces no lines', body: 'expect(wrapText("   ", 10)).toEqual([]);' },
      { name: 'fills a line exactly to the width', body: 'expect(wrapText("abc def", 7)).toEqual(["abc def"]);' },
      { name: 'breaks one character past the width', body: 'expect(wrapText("abc defg", 7)).toEqual(["abc", "defg"]);' },
      { name: 'produces no empty lines', body: 'for (const line of wrapText("  a  b  ", 1)) expect(line.length > 0).toBe(true);', hidden: true },
      { name: 'every word survives in order', body: 'expect(wrapText("one two three four five", 9).join(" ")).toBe("one two three four five");', hidden: true },
    ],
    hints: [
      'Split into words first, then decide line by line. Trying to scan character by character makes the "never break a word" rule much harder.',
      'Keep a current line. For each word, ask whether adding it (plus the joining space) would exceed the width; if so, finish the current line and start a new one.',
      'The over-long-word case falls out naturally if you always place a word on an empty line regardless of whether it fits.',
    ],
    solution:
      'function wrapText(text, width) {\n' +
      '  const words = text.split(/\\s+/).filter((w) => w.length > 0);\n' +
      '  const lines = [];\n' +
      '  let current = "";\n' +
      '  for (const word of words) {\n' +
      '    if (current === "") {\n' +
      '      current = word;\n' +
      '    } else if (current.length + 1 + word.length <= width) {\n' +
      '      current += " " + word;\n' +
      '    } else {\n' +
      '      lines.push(current);\n' +
      '      current = word;\n' +
      '    }\n' +
      '  }\n' +
      '  if (current !== "") lines.push(current);\n' +
      '  return lines;\n' +
      '}\n',
    solutionExplanation:
      'The three branches are the whole algorithm: an empty line always accepts the next word, a non-empty line accepts it only if the word *and its joining space* still fit, and otherwise the line is flushed. Putting the empty-line case first is what handles an unbreakably long word — it goes onto its own line without a fit check, exactly as the specification requires. The `+ 1` in the fit test is the space that will be added, and forgetting it produces lines one character too long. The final flush after the loop is what saves the last line, which no word ever pushes.',
  },

  {
    id: 'ch-str-run-length',
    slug: 'run-length-encoding',
    title: 'Run-Length Encoding',
    difficulty: DIFFICULTY.MEDIUM,
    category: CATEGORY,
    topicIds: ['strings', 'loops'],
    xp: XP[DIFFICULTY.MEDIUM],
    prompt:
      'Run-length encoding replaces a run of repeated characters with the character followed by its count: `"aaabbc"` becomes `"a3b2c1"`. Write both `encode(text)` and `decode(encoded)`, exported as two separate functions, so that `decode(encode(x))` returns `x` for any lowercase-letter input. Counts can exceed 9, so `decode` must read multi-digit numbers.',
    examples: ['encode("aaabbc");    // "a3b2c1"\ndecode("a3b2c1");    // "aaabbc"\ndecode("a12");       // twelve a characters'],
    constraints: ['`encode` receives only lowercase letters, possibly empty.', 'Every character gets a count, including runs of one.', '`decode` receives well-formed output of `encode`.'],
    starterCode: 'function encode(text) {\n  // Your code here\n}\n\nfunction decode(encoded) {\n  // Your code here\n}\n',
    tests: [
      { name: 'encodes a simple run', body: 'expect(encode("aaabbc")).toBe("a3b2c1");' },
      { name: 'always writes a count, even for one', body: 'expect(encode("abc")).toBe("a1b1c1");' },
      { name: 'encodes an empty string', body: 'expect(encode("")).toBe("");' },
      { name: 'encodes a single character', body: 'expect(encode("z")).toBe("z1");' },
      { name: 'handles a run longer than nine', body: 'expect(encode("a".repeat(12))).toBe("a12");' },
      { name: 'decodes a simple string', body: 'expect(decode("a3b2c1")).toBe("aaabbc");' },
      { name: 'decodes multi-digit counts', body: 'expect(decode("a12")).toBe("a".repeat(12));' },
      { name: 'decodes an empty string', body: 'expect(decode("")).toBe("");' },
      { name: 'round-trips a repeated pattern', body: 'const s = "aabbbccccdd"; expect(decode(encode(s))).toBe(s);' },
      { name: 'round-trips a non-repeating string', body: 'const s = "abcdefg"; expect(decode(encode(s))).toBe(s);' },
      {
        name: 'round-trips a long generated string',
        body:
          'let s = "";\n' +
          'for (let i = 0; i < 40; i += 1) s += "abcde"[i % 5].repeat((i % 13) + 1);\n' +
          'expect(decode(encode(s))).toBe(s);',
        hidden: true,
      },
      { name: 'decoding does not stop at the first digit', body: 'expect(decode("a10b2").length).toBe(12);', hidden: true },
    ],
    hints: [
      'For encoding, walk the string tracking the current character and how many of it you have seen in a row. Flush the run when the character changes — and again after the loop.',
      'For decoding, the character is always one character but the count is one *or more* digits. Keep reading digits while the next character is a digit.',
      'A regex with a global flag and a capture group for the digits does the decoding scan for you: a letter followed by one-or-more digits.',
    ],
    solution:
      'function encode(text) {\n' +
      '  let out = "";\n' +
      '  let i = 0;\n' +
      '  while (i < text.length) {\n' +
      '    let run = 1;\n' +
      '    while (text[i + run] === text[i]) run += 1;\n' +
      '    out += text[i] + run;\n' +
      '    i += run;\n' +
      '  }\n' +
      '  return out;\n' +
      '}\n' +
      '\n' +
      'function decode(encoded) {\n' +
      '  let out = "";\n' +
      '  for (const [, char, count] of encoded.matchAll(/([a-z])(\\d+)/g)) {\n' +
      '    out += char.repeat(Number(count));\n' +
      '  }\n' +
      '  return out;\n' +
      '}\n',
    solutionExplanation:
      'Encoding measures each run with an inner loop and then jumps the outer index past it, so every character is visited once. Decoding is where the interesting bug lives: reading exactly one digit after each letter works perfectly on `"a3b2c1"` and silently corrupts `"a12"` into eleven characters instead of twelve. The `\\d+` in the pattern is what makes multi-digit counts work, and `matchAll` hands back the character and the digits as separate capture groups so no manual index tracking is needed.',
  },

  {
    id: 'ch-str-mask-card',
    slug: 'masking-a-card-number',
    title: 'Masking a Card Number',
    difficulty: DIFFICULTY.EASY,
    category: CATEGORY,
    topicIds: ['strings', 'security'],
    xp: XP[DIFFICULTY.EASY],
    prompt:
      'When a stored card is shown back to a user, only the last four digits should be readable. Write `maskCard(number)` replacing every digit except the final four with `"•"`, while leaving any spaces or hyphens exactly where they are so the grouping still reads naturally. A number with four digits or fewer is returned unchanged — there is nothing left to mask.',
    examples: ['maskCard("4111111111111111");    // "••••••••••••1111"\nmaskCard("4111 1111 1111 1111"); // "•••• •••• •••• 1111"\nmaskCard("123");                 // "123"'],
    constraints: ['The input contains digits, spaces and hyphens only.', 'Separators are preserved in place and do not count as digits.', 'The mask character is `"•"` (U+2022).'],
    starterCode: 'function maskCard(number) {\n  // Your code here\n}\n',
    tests: [
      { name: 'masks all but the last four', body: 'expect(maskCard("4111111111111111")).toBe("••••••••••••1111");' },
      { name: 'preserves spaces in place', body: 'expect(maskCard("4111 1111 1111 1111")).toBe("•••• •••• •••• 1111");' },
      { name: 'preserves hyphens in place', body: 'expect(maskCard("4111-1111-1111-1111")).toBe("••••-••••-••••-1111");' },
      { name: 'leaves a four-digit number alone', body: 'expect(maskCard("1234")).toBe("1234");' },
      { name: 'leaves a shorter number alone', body: 'expect(maskCard("123")).toBe("123");' },
      { name: 'masks exactly one digit when there are five', body: 'expect(maskCard("12345")).toBe("•2345");' },
      { name: 'keeps the overall length', body: 'expect(maskCard("4111 1111 1111 1111").length).toBe(19);' },
      { name: 'separators do not count toward the four', body: 'expect(maskCard("12 34")).toBe("12 34");' },
      { name: 'handles an empty string', body: 'expect(maskCard("")).toBe("");', hidden: true },
      { name: 'the last four visible characters are the original digits', body: 'const out = maskCard("4000056655665556"); expect(out.slice(-4)).toBe("5556");', hidden: true },
    ],
    hints: [
      'The "last four" is counted in digits, not in characters — a separator sitting near the end must not use up part of that budget.',
      'Count the digits first. Then walk the string once, masking a digit only while you have not yet reached the final four.',
      'Walking backwards is an alternative: count digits from the right and start masking once you pass four.',
    ],
    solution:
      'function maskCard(number) {\n' +
      '  const digitCount = number.replace(/\\D/g, "").length;\n' +
      '  if (digitCount <= 4) return number;\n' +
      '  let seen = 0;\n' +
      '  let out = "";\n' +
      '  for (const char of number) {\n' +
      '    if (char >= "0" && char <= "9") {\n' +
      '      seen += 1;\n' +
      '      out += seen <= digitCount - 4 ? "•" : char;\n' +
      '    } else {\n' +
      '      out += char;\n' +
      '    }\n' +
      '  }\n' +
      '  return out;\n' +
      '}\n',
    solutionExplanation:
      'The two-pass structure exists because "keep the last four digits" cannot be answered until you know how many digits there are — and separators must not be counted, which is what `replace(/\\D/g, "")` strips. The single walk then rebuilds the string in place, so every space and hyphen lands at its original index and the output length matches the input length. Masking by character position instead of digit position is the tempting shortcut, and `"12 34"` is the case that exposes it.',
  },

  {
    id: 'ch-str-query-string',
    slug: 'parsing-a-query-string',
    title: 'Parsing a Query String',
    difficulty: DIFFICULTY.MEDIUM,
    category: CATEGORY,
    topicIds: ['strings', 'objects', 'web-apis'],
    xp: XP[DIFFICULTY.MEDIUM],
    prompt:
      'Write `parseQuery(queryString)` turning a URL query string into an object. Handle a leading `?` if present. Percent-encoding must be decoded, and `+` means a space. A key that appears more than once collects its values into an array, in order. A key with no `=` at all is present with a value of `""`. An empty query string gives an empty object.',
    examples: [
      'parseQuery("?a=1&b=two");        // { a: "1", b: "two" }',
      'parseQuery("tag=x&tag=y");       // { tag: ["x", "y"] }',
      'parseQuery("q=hello+world");     // { q: "hello world" }',
      'parseQuery("flag");              // { flag: "" }',
    ],
    constraints: ['Values stay strings; do not convert `"1"` into a number.', 'A repeated key becomes an array only from the second occurrence onward.', 'Use `decodeURIComponent` for percent-encoding.'],
    starterCode: 'function parseQuery(queryString) {\n  // Your code here\n}\n',
    tests: [
      { name: 'parses simple pairs', body: 'expect(parseQuery("a=1&b=two")).toEqual({ a: "1", b: "two" });' },
      { name: 'strips a leading question mark', body: 'expect(parseQuery("?a=1")).toEqual({ a: "1" });' },
      { name: 'keeps values as strings', body: 'expect(typeof parseQuery("n=42").n).toBe("string");' },
      { name: 'collects a repeated key into an array', body: 'expect(parseQuery("tag=x&tag=y")).toEqual({ tag: ["x", "y"] });' },
      { name: 'collects three occurrences', body: 'expect(parseQuery("t=a&t=b&t=c")).toEqual({ t: ["a", "b", "c"] });' },
      { name: 'a single occurrence is not an array', body: 'expect(Array.isArray(parseQuery("t=a").t)).toBe(false);' },
      { name: 'decodes plus as a space', body: 'expect(parseQuery("q=hello+world")).toEqual({ q: "hello world" });' },
      { name: 'decodes percent encoding', body: 'expect(parseQuery("q=a%20b%26c")).toEqual({ q: "a b&c" });' },
      { name: 'decodes keys too', body: 'expect(parseQuery("a%20b=1")).toEqual({ "a b": "1" });' },
      { name: 'a bare key has an empty value', body: 'expect(parseQuery("flag")).toEqual({ flag: "" });' },
      { name: 'an empty query gives an empty object', body: 'expect(parseQuery("")).toEqual({});' },
      { name: 'a lone question mark gives an empty object', body: 'expect(parseQuery("?")).toEqual({});', hidden: true },
      { name: 'keeps an equals sign inside a value', body: 'expect(parseQuery("eq=a=b")).toEqual({ eq: "a=b" });', hidden: true },
    ],
    hints: [
      'Split on `&` to get the pairs, then split each pair on `=` — but only on the *first* `=`, or a value containing one will be truncated.',
      '`decodeURIComponent` does not turn `+` into a space. Replace `+` yourself before decoding, or the plus survives literally.',
      'For repeated keys, check whether the key is already present: absent means store the value, present-and-not-an-array means wrap both into one, already-an-array means push.',
    ],
    solution:
      'function parseQuery(queryString) {\n' +
      '  const body = queryString.startsWith("?") ? queryString.slice(1) : queryString;\n' +
      '  const result = {};\n' +
      '  if (body === "") return result;\n' +
      '  const decode = (s) => decodeURIComponent(s.replace(/\\+/g, " "));\n' +
      '  for (const pair of body.split("&")) {\n' +
      '    if (pair === "") continue;\n' +
      '    const eq = pair.indexOf("=");\n' +
      '    const key = decode(eq === -1 ? pair : pair.slice(0, eq));\n' +
      '    const value = eq === -1 ? "" : decode(pair.slice(eq + 1));\n' +
      '    if (!Object.hasOwn(result, key)) result[key] = value;\n' +
      '    else if (Array.isArray(result[key])) result[key].push(value);\n' +
      '    else result[key] = [result[key], value];\n' +
      '  }\n' +
      '  return result;\n' +
      '}\n',
    solutionExplanation:
      'Splitting each pair with `indexOf("=")` rather than `split("=")` is what preserves an equals sign inside a value — `"eq=a=b"` must yield `"a=b"`, not `"a"`. The `+`-to-space replacement has to happen *before* `decodeURIComponent`, since that function leaves `+` untouched by design. The three-branch accumulation is the repeated-key rule stated directly, and `Object.hasOwn` is used rather than `key in result` so an inherited name like `"toString"` is not mistaken for a value already collected.',
  },

  {
    id: 'ch-str-template',
    slug: 'filling-a-template',
    title: 'Filling a Template',
    difficulty: DIFFICULTY.MEDIUM,
    category: CATEGORY,
    topicIds: ['strings', 'regex', 'objects'],
    xp: XP[DIFFICULTY.MEDIUM],
    prompt:
      'Write `fillTemplate(template, values)` replacing every `{{key}}` placeholder with the matching value from an object. Whitespace inside the braces is allowed and ignored, so `{{ name }}` and `{{name}}` are the same placeholder. A placeholder with no matching key is left in the string exactly as written, so the gap is visible rather than silently becoming `"undefined"`. Values that are not strings are converted; a value of `null` renders as `""`.',
    examples: [
      'fillTemplate("Hi {{name}}!", { name: "Ada" });   // "Hi Ada!"',
      'fillTemplate("{{ a }}-{{b}}", { a: 1, b: 2 });   // "1-2"',
      'fillTemplate("Hi {{who}}", {});                  // "Hi {{who}}"',
    ],
    constraints: ['Keys are letters, digits and underscores.', 'A missing key leaves the original placeholder text intact.', '`null` and `undefined` values render as an empty string, but only when the key exists.'],
    starterCode: 'function fillTemplate(template, values) {\n  // Your code here\n}\n',
    tests: [
      { name: 'fills a single placeholder', body: 'expect(fillTemplate("Hi {{name}}!", { name: "Ada" })).toBe("Hi Ada!");' },
      { name: 'fills several placeholders', body: 'expect(fillTemplate("{{a}}-{{b}}", { a: "x", b: "y" })).toBe("x-y");' },
      { name: 'ignores whitespace inside the braces', body: 'expect(fillTemplate("{{ a }}", { a: "x" })).toBe("x");' },
      { name: 'converts non-string values', body: 'expect(fillTemplate("{{n}}", { n: 42 })).toBe("42");' },
      { name: 'leaves an unknown key in place', body: 'expect(fillTemplate("Hi {{who}}", {})).toBe("Hi {{who}}");' },
      { name: 'renders a present null as empty', body: 'expect(fillTemplate("[{{x}}]", { x: null })).toBe("[]");' },
      { name: 'repeats a value used twice', body: 'expect(fillTemplate("{{a}}{{a}}", { a: "z" })).toBe("zz");' },
      { name: 'leaves text with no placeholders alone', body: 'expect(fillTemplate("plain", { a: 1 })).toBe("plain");' },
      { name: 'does not treat single braces as placeholders', body: 'expect(fillTemplate("{a}", { a: "x" })).toBe("{a}");' },
      { name: 'never emits the word undefined', body: 'expect(fillTemplate("{{nope}}", { other: 1 }).includes("undefined")).toBe(false);', hidden: true },
      { name: 'does not resolve inherited keys', body: 'expect(fillTemplate("{{toString}}", {})).toBe("{{toString}}");', hidden: true },
    ],
    hints: [
      '`String.prototype.replace` accepts a function as its second argument. It is called for each match and its return value becomes the replacement.',
      'The replacer receives the whole match first, then each capture group — so you can return the whole match unchanged when the key is missing.',
      'Check for the key with `Object.hasOwn`, not by testing whether the value is falsy: a present value of `0` or `""` must still be substituted.',
    ],
    solution:
      'function fillTemplate(template, values) {\n' +
      '  return template.replace(/\\{\\{\\s*(\\w+)\\s*\\}\\}/g, (whole, key) => {\n' +
      '    if (!Object.hasOwn(values, key)) return whole;\n' +
      '    const value = values[key];\n' +
      '    return value === null || value === undefined ? "" : String(value);\n' +
      '  });\n' +
      '}\n',
    solutionExplanation:
      'A function replacer is what makes "leave it alone if the key is missing" expressible at all — returning `whole`, the full matched text, puts the placeholder back byte for byte. The presence check uses `Object.hasOwn` for two reasons: a value of `0` or `""` is present and must be substituted, so a truthiness test would be wrong, and an inherited name like `toString` is not a real value, so `key in values` would be wrong too. Converting through `String(value)` rather than concatenation keeps the `null` case explicit instead of letting it stringify to `"null"`.',
  },

  {
    id: 'ch-str-escape-html',
    slug: 'escaping-html-text',
    title: 'Escaping HTML Text',
    difficulty: DIFFICULTY.EASY,
    category: CATEGORY,
    topicIds: ['strings', 'security', 'dom'],
    xp: XP[DIFFICULTY.EASY],
    prompt:
      'When untrusted text is inserted into an HTML document as markup rather than as text, the characters that carry meaning in HTML have to be neutralised first. Write `escapeHtml(text)` replacing `&`, `<`, `>`, `"` and `\'` with their entity forms `&amp;`, `&lt;`, `&gt;`, `&quot;` and `&#39;`. Order matters: escaping `&` after the others would corrupt the entities you just produced.',
    examples: [
      'escapeHtml("<b>hi</b>");    // "&lt;b&gt;hi&lt;/b&gt;"',
      'escapeHtml("a & b");        // "a &amp; b"',
      'escapeHtml(\'say "hi"\');    // "say &quot;hi&quot;"',
    ],
    constraints: ['Exactly those five characters are escaped; everything else passes through unchanged.', 'The function is pure — it does not touch the DOM.'],
    starterCode: 'function escapeHtml(text) {\n  // Your code here\n}\n',
    tests: [
      { name: 'escapes angle brackets', body: 'expect(escapeHtml("<b>")).toBe("&lt;b&gt;");' },
      { name: 'escapes an ampersand', body: 'expect(escapeHtml("a & b")).toBe("a &amp; b");' },
      { name: 'escapes double quotes', body: 'expect(escapeHtml(\'say "hi"\')).toBe("say &quot;hi&quot;");' },
      { name: 'escapes single quotes', body: 'expect(escapeHtml("it\'s")).toBe("it&#39;s");' },
      { name: 'escapes a full tag', body: 'expect(escapeHtml("<b>hi</b>")).toBe("&lt;b&gt;hi&lt;/b&gt;");' },
      { name: 'leaves ordinary text alone', body: 'expect(escapeHtml("hello world")).toBe("hello world");' },
      { name: 'handles an empty string', body: 'expect(escapeHtml("")).toBe("");' },
      { name: 'does not double-escape its own output', body: 'expect(escapeHtml("&lt;")).toBe("&amp;lt;");' },
      { name: 'escapes the ampersand before the others', body: 'expect(escapeHtml("<&>")).toBe("&lt;&amp;&gt;");' },
      { name: 'leaves no raw angle bracket behind', body: 'const out = escapeHtml("<img src=x onerror=y>"); expect(out.includes("<")).toBe(false); expect(out.includes(">")).toBe(false);', hidden: true },
      { name: 'handles a long mixed string', body: 'expect(escapeHtml("a<b>c&d\\"e\'f")).toBe("a&lt;b&gt;c&amp;d&quot;e&#39;f");', hidden: true },
    ],
    hints: [
      'A single pass with a lookup object is both simpler and safer than five chained `replace` calls.',
      'If you do chain replacements, `&` must be first — escaping it last would turn the `&` in `&lt;` into `&amp;lt;`.',
      'A character class matching all five characters, with the global flag, lets one `replace` handle every case.',
    ],
    solution:
      'function escapeHtml(text) {\n' +
      '  const entities = {\n' +
      '    "&": "&amp;",\n' +
      '    "<": "&lt;",\n' +
      '    ">": "&gt;",\n' +
      '    \'"\': "&quot;",\n' +
      '    "\'": "&#39;",\n' +
      '  };\n' +
      '  return text.replace(/[&<>"\']/g, (char) => entities[char]);\n' +
      '}\n',
    solutionExplanation:
      'A single pass with a lookup sidesteps the ordering trap entirely: each character is examined once and replaced once, so no replacement can ever see the output of another. That is why `escapeHtml("&lt;")` correctly yields `&amp;lt;` — the literal text the user typed, rendered visibly, rather than a working tag. Chained `replace` calls can be made correct by escaping `&` first, but the ordering constraint is invisible in the code and easy to break later. Note the scope of this function: it makes text safe as *element content and attribute values*, which is not the same as making it safe inside a `<script>` block, a URL, or a CSS context — each of those needs its own escaping.',
  },
];

export default challenges;
