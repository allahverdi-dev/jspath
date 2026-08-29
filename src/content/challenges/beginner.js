import { DIFFICULTY } from '../schema/types.js';
import { XP } from './_xp.js';

const CATEGORY = 'First Steps';
const XP_B = XP[DIFFICULTY.BEGINNER];

export const challenges = [
  {
    id: 'ch-beg-initials',
    slug: 'initials-from-a-name',
    title: 'Initials from a Name',
    difficulty: DIFFICULTY.BEGINNER,
    category: CATEGORY,
    topicIds: ['strings', 'arrays', 'array-methods'],
    xp: XP_B,
    prompt:
      'Write `initials(fullName)` returning the uppercase first letter of each word, joined by dots and ending with one: `"ada lovelace"` becomes `"A.L."`. Extra spaces between or around the words must not produce empty initials. An empty name gives an empty string.',
    examples: ['initials("ada lovelace");   // "A.L."\ninitials("  grace  hopper "); // "G.H."'],
    constraints: ['Words are separated by one or more spaces.', 'Each initial is followed by a dot, including the last.', 'An empty or space-only name gives `""`.'],
    starterCode: 'function initials(fullName) {\n  // Your code here\n}\n',
    tests: [
      { name: 'two names', body: 'expect(initials("ada lovelace")).toBe("A.L.");' },
      { name: 'uppercases the letters', body: 'expect(initials("ADA LOVELACE")).toBe("A.L.");' },
      { name: 'a single name', body: 'expect(initials("prince")).toBe("P.");' },
      { name: 'three names', body: 'expect(initials("john ronald tolkien")).toBe("J.R.T.");' },
      { name: 'ignores extra spaces between words', body: 'expect(initials("ada    lovelace")).toBe("A.L.");' },
      { name: 'ignores leading and trailing spaces', body: 'expect(initials("  grace  hopper ")).toBe("G.H.");' },
      { name: 'an empty name gives an empty string', body: 'expect(initials("")).toBe("");' },
      { name: 'a space-only name gives an empty string', body: 'expect(initials("   ")).toBe("");' },
      { name: 'produces no empty initials', body: 'expect(initials(" a  b ").includes("..")).toBe(false);', hidden: true },
    ],
    hints: [
      'Split the name into words, take the first character of each, uppercase it, and join the results.',
      'Splitting on a single space leaves empty strings where there were extra spaces. Splitting on `/\\s+/` collapses runs — but can still leave one empty string at the start if the input begins with a space.',
      'Trimming first, then splitting, avoids both problems.',
    ],
    solution:
      'function initials(fullName) {\n' +
      '  const words = fullName.trim().split(/\\s+/).filter((w) => w.length > 0);\n' +
      '  return words.map((word) => word[0].toUpperCase() + ".").join("");\n' +
      '}\n',
    solutionExplanation:
      'Trimming before splitting is what keeps a leading space from producing an empty first word — `" a b".split(/\\s+/)` gives `["", "a", "b"]`, and that empty string would become an initial of `"undefined"` or throw. The `filter` covers the remaining edge case: a name of only spaces trims to `""`, which still splits into `[""]`. Adding the dot inside the `map` rather than using `join(".")` is what puts a dot after the *last* initial too, which `join` never would.',
  },

  {
    id: 'ch-beg-swap-case',
    slug: 'swap-the-case',
    title: 'Swap the Case',
    difficulty: DIFFICULTY.BEGINNER,
    category: CATEGORY,
    topicIds: ['strings', 'loops', 'control-flow'],
    xp: XP_B,
    prompt:
      'Write `swapCase(text)` turning every uppercase letter lowercase and every lowercase letter uppercase, leaving everything else — digits, spaces, punctuation — exactly as it is.',
    examples: ['swapCase("Hello World!");  // "hELLO wORLD!"'],
    constraints: ['Non-letters are unchanged.', 'The length of the result matches the input.'],
    starterCode: 'function swapCase(text) {\n  // Your code here\n}\n',
    tests: [
      { name: 'swaps a mixed string', body: 'expect(swapCase("Hello World")).toBe("hELLO wORLD");' },
      { name: 'swaps all uppercase', body: 'expect(swapCase("ABC")).toBe("abc");' },
      { name: 'swaps all lowercase', body: 'expect(swapCase("abc")).toBe("ABC");' },
      { name: 'leaves digits alone', body: 'expect(swapCase("a1B2")).toBe("A1b2");' },
      { name: 'leaves punctuation alone', body: 'expect(swapCase("Hi!")).toBe("hI!");' },
      { name: 'leaves spaces alone', body: 'expect(swapCase("a b")).toBe("A B");' },
      { name: 'handles an empty string', body: 'expect(swapCase("")).toBe("");' },
      { name: 'preserves the length', body: 'expect(swapCase("Hello, World! 123").length).toBe(17);' },
      { name: 'swapping twice restores the original', body: 'const s = "Hello, World! 123"; expect(swapCase(swapCase(s))).toBe(s);', hidden: true },
    ],
    hints: [
      'Go character by character and decide what each one should become.',
      'A character is uppercase if it equals its own uppercase version *and* differs from its lowercase version — the second half matters, because a digit equals both.',
      'Comparing `char === char.toUpperCase()` alone would wrongly treat `"1"` as uppercase and lowercase it, which happens to be harmless here but is the wrong reasoning.',
    ],
    solution:
      'function swapCase(text) {\n' +
      '  let out = "";\n' +
      '  for (const char of text) {\n' +
      '    const lower = char.toLowerCase();\n' +
      '    const upper = char.toUpperCase();\n' +
      '    if (char === lower && char !== upper) out += upper;\n' +
      '    else if (char === upper && char !== lower) out += lower;\n' +
      '    else out += char;\n' +
      '  }\n' +
      '  return out;\n' +
      '}\n',
    solutionExplanation:
      'The two-part test is what makes "is this a letter with a case" precise. A digit or a space is equal to both its uppercase and its lowercase form, so `char !== upper` (or `char !== lower`) is what rules it out — testing only `char === char.toLowerCase()` would classify every non-letter as lowercase. Reasoning in terms of what the character *is* rather than checking against an alphabet range also means it behaves sensibly for accented letters, where a hard-coded `a`–`z` check would not.',
  },

  {
    id: 'ch-beg-longest-word',
    slug: 'the-longest-word',
    title: 'The Longest Word',
    difficulty: DIFFICULTY.BEGINNER,
    category: CATEGORY,
    topicIds: ['strings', 'arrays', 'loops'],
    xp: XP_B,
    prompt:
      'Write `longestWord(sentence)` returning the longest word. Words are separated by spaces, and attached punctuation does not count toward the length — `"amazing!"` is 7 letters. When two words tie, return the one that appears first. A sentence with no words gives `""`.',
    examples: ['longestWord("the quick brown fox");  // "quick"\nlongestWord("hi there!");             // "there"'],
    constraints: ['Only letters, digits and apostrophes count as part of a word.', 'Ties go to the first word.', 'The returned word has no punctuation attached.'],
    starterCode: 'function longestWord(sentence) {\n  // Your code here\n}\n',
    tests: [
      { name: 'finds the longest word', body: 'expect(longestWord("the quick brown fox")).toBe("quick");' },
      { name: 'strips attached punctuation', body: 'expect(longestWord("hi there!")).toBe("there");' },
      { name: 'a single word', body: 'expect(longestWord("hello")).toBe("hello");' },
      { name: 'ties go to the first', body: 'expect(longestWord("cat dog")).toBe("cat");' },
      { name: 'an empty sentence gives an empty string', body: 'expect(longestWord("")).toBe("");' },
      { name: 'a punctuation-only sentence gives an empty string', body: 'expect(longestWord("... !!!")).toBe("");' },
      { name: 'the longest word is at the end', body: 'expect(longestWord("a bb ccc")).toBe("ccc");' },
      { name: 'the longest word is at the start', body: 'expect(longestWord("ccc bb a")).toBe("ccc");' },
      { name: 'keeps an apostrophe', body: "expect(longestWord(\"it's a test\")).toBe(\"it's\");" },
      { name: 'handles many words', body: 'expect(longestWord("a bb ccc dddd ccc bb a")).toBe("dddd");', hidden: true },
    ],
    hints: [
      'Extract the words with a pattern for what a word is, rather than splitting on spaces and stripping punctuation afterwards.',
      '`sentence.match(/[a-zA-Z0-9\']+/g)` returns every word — but `null` when there are none, which you must handle.',
      'Track the best word so far and only replace it when a *strictly* longer one appears. Using `>` rather than `>=` is what makes ties go to the first.',
    ],
    solution:
      'function longestWord(sentence) {\n' +
      "  const words = sentence.match(/[a-zA-Z0-9']+/g) ?? [];\n" +
      '  let best = "";\n' +
      '  for (const word of words) {\n' +
      '    if (word.length > best.length) best = word;\n' +
      '  }\n' +
      '  return best;\n' +
      '}\n',
    solutionExplanation:
      'Matching what a word *is* handles the punctuation requirement in one step — `"there!"` never becomes a candidate, so nothing has to be stripped afterwards. `match` returns `null` rather than an empty array when nothing matches, so the `?? []` is what stops a punctuation-only sentence from throwing. The strict `>` comparison is the tie-breaking rule made concrete: a later word of equal length never displaces the earlier one, and starting `best` at `""` means the first real word always wins its comparison.',
  },

  {
    id: 'ch-beg-sum-digits',
    slug: 'summing-the-digits',
    title: 'Summing the Digits',
    difficulty: DIFFICULTY.BEGINNER,
    category: CATEGORY,
    topicIds: ['numbers', 'loops', 'operators'],
    xp: XP_B,
    prompt:
      'Write `sumDigits(n)` adding up the digits of a whole number: 1234 gives 10. A negative number uses its digits regardless of sign, so -1234 also gives 10. Do it with arithmetic rather than by converting to a string — extracting digits with `%` and `/` is a technique worth having.',
    examples: ['sumDigits(1234);   // 10\nsumDigits(-1234);  // 10\nsumDigits(0);      // 0'],
    constraints: ['`n` is an integer.', 'The sign is ignored.', 'Use arithmetic, not string conversion.'],
    starterCode: 'function sumDigits(n) {\n  // Your code here\n}\n',
    tests: [
      { name: 'sums a four-digit number', body: 'expect(sumDigits(1234)).toBe(10);' },
      { name: 'a single digit is itself', body: 'expect(sumDigits(7)).toBe(7);' },
      { name: 'zero sums to zero', body: 'expect(sumDigits(0)).toBe(0);' },
      { name: 'ignores the sign', body: 'expect(sumDigits(-1234)).toBe(10);' },
      { name: 'a negative single digit', body: 'expect(sumDigits(-7)).toBe(7);' },
      { name: 'handles zeros inside the number', body: 'expect(sumDigits(1002)).toBe(3);' },
      { name: 'handles a trailing zero', body: 'expect(sumDigits(100)).toBe(1);' },
      { name: 'handles a long number', body: 'expect(sumDigits(999999999)).toBe(81);' },
      { name: 'returns a number', body: 'expect(typeof sumDigits(12)).toBe("number");', hidden: true },
    ],
    hints: [
      '`n % 10` gives the last digit; `Math.floor(n / 10)` removes it. Repeat until nothing is left.',
      'Take the absolute value first, so a negative number does not produce negative digits.',
      'Zero needs care: a `while (n > 0)` loop never runs for 0, which is correct here since the sum starts at 0.',
    ],
    solution:
      'function sumDigits(n) {\n' +
      '  let left = Math.abs(n);\n' +
      '  let total = 0;\n' +
      '  while (left > 0) {\n' +
      '    total += left % 10;\n' +
      '    left = Math.floor(left / 10);\n' +
      '  }\n' +
      '  return total;\n' +
      '}\n',
    solutionExplanation:
      'The pair `% 10` and `Math.floor(n / 10)` is the standard way to walk a number\'s digits: the remainder peels off the last one and the division shifts everything right. Taking the absolute value up front is what handles negatives — without it, `-1234 % 10` is `-4` in JavaScript, since the remainder keeps the sign of its left operand, and the total would come out negative. The zero case works without a special branch: the loop condition is false immediately and the total is already 0.',
  },

  {
    id: 'ch-beg-min-max',
    slug: 'smallest-and-largest',
    title: 'Smallest and Largest',
    difficulty: DIFFICULTY.BEGINNER,
    category: CATEGORY,
    topicIds: ['arrays', 'numbers', 'loops'],
    xp: XP_B,
    prompt:
      'Write `minMax(numbers)` returning `{ min, max }` after a **single** pass through the array. Calling `Math.min` and `Math.max` separately walks the data twice; one loop is enough. An empty array has neither, so return `null`.',
    examples: ['minMax([3, 1, 4, 1, 5]);  // { min: 1, max: 5 }\nminMax([]);               // null'],
    constraints: ['One pass through the array.', 'An empty array returns `null`.', 'The array is not modified.'],
    starterCode: 'function minMax(numbers) {\n  // Your code here\n}\n',
    tests: [
      { name: 'finds both', body: 'expect(minMax([3, 1, 4, 1, 5])).toEqual({ min: 1, max: 5 });' },
      { name: 'a single element is both', body: 'expect(minMax([7])).toEqual({ min: 7, max: 7 });' },
      { name: 'an empty array gives null', body: 'expect(minMax([])).toBe(null);' },
      { name: 'handles negatives', body: 'expect(minMax([-5, -1, -10])).toEqual({ min: -10, max: -1 });' },
      { name: 'handles a mix of signs', body: 'expect(minMax([-2, 0, 3])).toEqual({ min: -2, max: 3 });' },
      { name: 'handles all-identical values', body: 'expect(minMax([4, 4, 4])).toEqual({ min: 4, max: 4 });' },
      { name: 'the minimum can be last', body: 'expect(minMax([5, 4, 1]).min).toBe(1);' },
      { name: 'the maximum can be first', body: 'expect(minMax([9, 4, 1]).max).toBe(9);' },
      { name: 'does not modify the array', body: 'const xs = [3, 1, 2]; minMax(xs); expect(xs).toEqual([3, 1, 2]);' },
      { name: 'handles a large array', body: 'const xs = Array.from({ length: 10000 }, (_, i) => (i * 7919) % 10000); expect(minMax(xs)).toEqual({ min: 0, max: 9999 });', hidden: true },
      { name: 'handles zero correctly', body: 'expect(minMax([0, 0])).toEqual({ min: 0, max: 0 });', hidden: true },
    ],
    hints: [
      'Seed both `min` and `max` with the first element, then compare against every element from index 1 onward.',
      'Do not seed with 0 — an array of all-negative numbers would then report a maximum of 0, which is not in the array.',
      'Check the empty case before reading `numbers[0]`.',
    ],
    solution:
      'function minMax(numbers) {\n' +
      '  if (numbers.length === 0) return null;\n' +
      '  let min = numbers[0];\n' +
      '  let max = numbers[0];\n' +
      '  for (let i = 1; i < numbers.length; i += 1) {\n' +
      '    if (numbers[i] < min) min = numbers[i];\n' +
      '    if (numbers[i] > max) max = numbers[i];\n' +
      '  }\n' +
      '  return { min, max };\n' +
      '}\n',
    solutionExplanation:
      'Seeding from the first element rather than from 0 or `Infinity` is the detail that matters: seeding `max` with 0 would report 0 as the maximum of `[-5, -1]`, a value that is not in the array at all. Starting from a real element guarantees the answer is always something the array actually contains. One loop doing both comparisons visits each element once, where separate `Math.min` and `Math.max` calls would visit it twice — the difference is invisible on five elements and real on ten million.',
  },

  {
    id: 'ch-beg-count-character',
    slug: 'counting-a-character',
    title: 'Counting a Character',
    difficulty: DIFFICULTY.BEGINNER,
    category: CATEGORY,
    topicIds: ['strings', 'loops', 'control-flow'],
    xp: XP_B,
    prompt:
      'Write `countChar(text, char, caseSensitive = true)` returning how many times a single character appears. When `caseSensitive` is false, `"a"` and `"A"` count as the same character. Searching for a character that is not there gives 0.',
    examples: ['countChar("banana", "a");           // 3\ncountChar("Banana", "b", false);   // 1'],
    constraints: ['`char` is a single character.', 'Case sensitivity is controlled by the third argument, defaulting to true.', 'Return a number.'],
    starterCode: 'function countChar(text, char, caseSensitive = true) {\n  // Your code here\n}\n',
    tests: [
      { name: 'counts occurrences', body: 'expect(countChar("banana", "a")).toBe(3);' },
      { name: 'counts a single occurrence', body: 'expect(countChar("banana", "b")).toBe(1);' },
      { name: 'an absent character gives zero', body: 'expect(countChar("banana", "z")).toBe(0);' },
      { name: 'is case-sensitive by default', body: 'expect(countChar("Banana", "b")).toBe(0);' },
      { name: 'ignores case when asked', body: 'expect(countChar("Banana", "b", false)).toBe(1);' },
      { name: 'case-insensitive counts both cases', body: 'expect(countChar("aAaA", "a", false)).toBe(4);' },
      { name: 'handles an empty string', body: 'expect(countChar("", "a")).toBe(0);' },
      { name: 'counts spaces', body: 'expect(countChar("a b c", " ")).toBe(2);' },
      { name: 'counts punctuation', body: 'expect(countChar("a.b.c", ".")).toBe(2);' },
      { name: 'handles a long string', body: 'expect(countChar("x".repeat(5000) + "y", "x")).toBe(5000);', hidden: true },
    ],
    hints: [
      'Walk the string and compare each character to the target, keeping a running count.',
      'For the case-insensitive mode, lowercase both sides *once* before the loop rather than inside it.',
      'Do not use `split(char).length - 1` for the case-insensitive version — it would need the same normalisation anyway.',
    ],
    solution:
      'function countChar(text, char, caseSensitive = true) {\n' +
      '  const haystack = caseSensitive ? text : text.toLowerCase();\n' +
      '  const needle = caseSensitive ? char : char.toLowerCase();\n' +
      '  let count = 0;\n' +
      '  for (const current of haystack) {\n' +
      '    if (current === needle) count += 1;\n' +
      '  }\n' +
      '  return count;\n' +
      '}\n',
    solutionExplanation:
      'Normalising both strings once before the loop rather than calling `toLowerCase()` on every character is the difference between one conversion and one per character — a habit worth forming early, since the same shape appears whenever a comparison needs preparing. Deciding the case mode up front also keeps the loop body down to a single comparison with no branching, which is easier to read than a condition that has to re-check the mode on every character.',
  },

  {
    id: 'ch-beg-remove-falsy',
    slug: 'cleaning-a-list',
    title: 'Cleaning a List',
    difficulty: DIFFICULTY.BEGINNER,
    category: CATEGORY,
    topicIds: ['arrays', 'array-methods', 'booleans'],
    xp: XP_B,
    prompt:
      'Write `compact(items)` returning a new array with every falsy value removed, and `compactStrict(items)` removing only `null` and `undefined` — keeping `0`, `false` and `""`, which are usually real data. The difference between the two is the difference between "empty" and "absent", and choosing the wrong one is a common source of silent data loss.',
    examples: [
      'compact([0, 1, "", "a", null]);        // [1, "a"]',
      'compactStrict([0, 1, "", "a", null]);  // [0, 1, "", "a"]',
    ],
    constraints: ['Neither function modifies the input.', '`compactStrict` removes exactly `null` and `undefined`.', 'Both return new arrays.'],
    starterCode: 'function compact(items) {\n  // Your code here\n}\n\nfunction compactStrict(items) {\n  // Your code here\n}\n',
    tests: [
      { name: 'compact removes falsy values', body: 'expect(compact([0, 1, "", "a", null])).toEqual([1, "a"]);' },
      { name: 'compact removes every falsy kind', body: 'expect(compact([false, 0, -0, "", null, undefined, NaN, 1])).toEqual([1]);' },
      { name: 'compact keeps empty collections', body: 'expect(compact([[], {}]).length).toBe(2);' },
      { name: 'compact on an all-truthy array changes nothing', body: 'expect(compact([1, "a", true])).toEqual([1, "a", true]);' },
      { name: 'compact on an empty array', body: 'expect(compact([])).toEqual([]);' },
      { name: 'compactStrict keeps zero', body: 'expect(compactStrict([0, 1])).toEqual([0, 1]);' },
      { name: 'compactStrict keeps false and empty string', body: 'expect(compactStrict([false, ""])).toEqual([false, ""]);' },
      { name: 'compactStrict removes null and undefined', body: 'expect(compactStrict([1, null, 2, undefined])).toEqual([1, 2]);' },
      { name: 'compactStrict keeps NaN', body: 'expect(compactStrict([NaN]).length).toBe(1);' },
      { name: 'neither modifies the input', body: 'const xs = [0, 1, null]; compact(xs); compactStrict(xs); expect(xs).toEqual([0, 1, null]);' },
      { name: 'both return new arrays', body: 'const xs = [1]; expect(compact(xs)).not.toBe(xs); expect(compactStrict(xs)).not.toBe(xs);' },
      { name: 'the two really differ', body: 'const xs = [0, false, "", null]; expect(compact(xs).length).toBe(0); expect(compactStrict(xs).length).toBe(3);', hidden: true },
    ],
    hints: [
      '`filter` with `Boolean` as the callback keeps exactly the truthy values.',
      'For the strict version, the idiomatic test is `value != null` — the one place a loose comparison is genuinely the right tool, since it matches `null` and `undefined` and nothing else.',
      '`filter` always returns a new array, so neither function can modify the input.',
    ],
    solution:
      'function compact(items) {\n' +
      '  return items.filter(Boolean);\n' +
      '}\n' +
      '\n' +
      'function compactStrict(items) {\n' +
      '  return items.filter((value) => value !== null && value !== undefined);\n' +
      '}\n',
    solutionExplanation:
      'These two functions look almost identical and mean very different things. `compact` treats `0`, `false` and `""` as nothing worth keeping, which is right for a list of optional labels and badly wrong for a list of scores or checkbox states — dropping a score of 0 is silent data loss that only shows up in a report weeks later. `compactStrict` distinguishes "the value is empty" from "there is no value", which is almost always the distinction you actually mean. The idiomatic shorthand for the strict test is `value != null`, which matches `null` and `undefined` and nothing else; it is the one place a loose comparison is clearer than the strict one, though writing both checks out — as here — leaves no doubt.',
  },

  {
    id: 'ch-beg-anagram',
    slug: 'are-they-anagrams',
    title: 'Are They Anagrams?',
    difficulty: DIFFICULTY.BEGINNER,
    category: CATEGORY,
    topicIds: ['strings', 'arrays', 'booleans'],
    xp: XP_B,
    prompt:
      'Write `isAnagram(a, b)` reporting whether two words use exactly the same letters the same number of times, ignoring case and spaces. `"Listen"` and `"Silent"` are anagrams; `"aab"` and `"abb"` are not, because the counts differ.',
    examples: ['isAnagram("Listen", "Silent");  // true\nisAnagram("aab", "abb");        // false'],
    constraints: ['Case and spaces are ignored.', 'Letter counts must match, not just the set of letters.', 'Return an actual boolean.'],
    starterCode: 'function isAnagram(a, b) {\n  // Your code here\n}\n',
    tests: [
      { name: 'a classic pair', body: 'expect(isAnagram("Listen", "Silent")).toBe(true);' },
      { name: 'a non-anagram', body: 'expect(isAnagram("hello", "world")).toBe(false);' },
      { name: 'counts matter, not just letters', body: 'expect(isAnagram("aab", "abb")).toBe(false);' },
      { name: 'ignores case', body: 'expect(isAnagram("ABC", "cba")).toBe(true);' },
      { name: 'ignores spaces', body: 'expect(isAnagram("conversation", "voices rant on")).toBe(true);' },
      { name: 'different lengths are not anagrams', body: 'expect(isAnagram("abc", "abcd")).toBe(false);' },
      { name: 'two empty strings are anagrams', body: 'expect(isAnagram("", "")).toBe(true);' },
      { name: 'a word is an anagram of itself', body: 'expect(isAnagram("test", "test")).toBe(true);' },
      { name: 'returns a real boolean', body: 'expect(typeof isAnagram("a", "b")).toBe("boolean");' },
      { name: 'a repeated letter in only one word', body: 'expect(isAnagram("aa", "a")).toBe(false);', hidden: true },
      { name: 'handles a longer pair', body: 'expect(isAnagram("the eyes", "they see")).toBe(true);', hidden: true },
    ],
    hints: [
      'Normalise both words the same way first: lowercase them and remove the spaces.',
      'Two words are anagrams exactly when their sorted letters are identical — sorting turns the question into a single string comparison.',
      'A string has no `sort` method, but spreading it into an array gives you one.',
    ],
    solution:
      'function isAnagram(a, b) {\n' +
      '  const normalise = (text) => [...text.toLowerCase().replace(/ /g, "")].sort().join("");\n' +
      '  return normalise(a) === normalise(b);\n' +
      '}\n',
    solutionExplanation:
      'Sorting turns a comparison of *contents* into a comparison of *strings*: two words with the same letters in the same quantities sort to exactly the same sequence, so one `===` settles it. That also handles the counts correctly for free — `"aab"` sorts to `"aab"` and `"abb"` to `"abb"`, which differ, where a naive "does every letter of a appear in b" check would wrongly say yes. Extracting `normalise` as a helper guarantees both words go through identical preparation; doing it inline twice is where a case or a space gets handled on one side and not the other.',
  },

  {
    id: 'ch-beg-toggle',
    slug: 'toggling-a-selection',
    title: 'Toggling a Selection',
    difficulty: DIFFICULTY.BEGINNER,
    category: CATEGORY,
    topicIds: ['arrays', 'array-methods', 'control-flow'],
    xp: XP_B,
    prompt:
      'A list of selected filters needs an item added when it is not there and removed when it is. Write `toggle(items, value)` returning a **new** array with that behaviour — adding the value at the end when absent, removing every occurrence when present. The original array must not change, because a selection is state that something else may still be rendering.',
    examples: [
      'toggle(["a"], "b");   // ["a", "b"]',
      'toggle(["a", "b"], "a");   // ["b"]',
    ],
    constraints: ['Return a new array; do not modify the input.', 'Adding appends to the end.', 'Removing removes every occurrence.'],
    starterCode: 'function toggle(items, value) {\n  // Your code here\n}\n',
    tests: [
      { name: 'adds an absent value', body: 'expect(toggle(["a"], "b")).toEqual(["a", "b"]);' },
      { name: 'removes a present value', body: 'expect(toggle(["a", "b"], "a")).toEqual(["b"]);' },
      { name: 'adds to an empty array', body: 'expect(toggle([], "a")).toEqual(["a"]);' },
      { name: 'removing the only value gives an empty array', body: 'expect(toggle(["a"], "a")).toEqual([]);' },
      { name: 'appends at the end', body: 'expect(toggle(["a", "b"], "c")).toEqual(["a", "b", "c"]);' },
      { name: 'removes every occurrence', body: 'expect(toggle(["a", "b", "a"], "a")).toEqual(["b"]);' },
      { name: 'does not modify the input', body: 'const xs = ["a"]; toggle(xs, "b"); expect(xs).toEqual(["a"]);' },
      { name: 'returns a new array when adding', body: 'const xs = ["a"]; expect(toggle(xs, "b")).not.toBe(xs);' },
      { name: 'returns a new array when removing', body: 'const xs = ["a"]; expect(toggle(xs, "a")).not.toBe(xs);' },
      { name: 'works with numbers', body: 'expect(toggle([1, 2], 2)).toEqual([1]);' },
      { name: 'toggling twice restores the original contents', body: 'const xs = ["a", "b"]; expect(toggle(toggle(xs, "c"), "c")).toEqual(["a", "b"]);' },
      { name: 'does not confuse a number with its string', body: 'expect(toggle([1], "1")).toEqual([1, "1"]);', hidden: true },
    ],
    hints: [
      '`includes` tells you which of the two things to do.',
      'To add without modifying, spread the original into a new array with the value on the end: `[...items, value]`.',
      'To remove, `filter` out the value — `filter` already returns a new array, so nothing is modified.',
    ],
    solution:
      'function toggle(items, value) {\n' +
      '  if (items.includes(value)) {\n' +
      '    return items.filter((item) => item !== value);\n' +
      '  }\n' +
      '  return [...items, value];\n' +
      '}\n',
    solutionExplanation:
      'Both branches build a new array, which is what makes this safe to use as state: `push` and `splice` would modify the array in place, and anything else holding a reference to it — a rendered list, a previous snapshot, an undo stack — would silently change underneath. That is also why comparing the old and new arrays with `===` correctly reports that something changed, which is how a UI framework decides whether to re-render. `includes` uses SameValueZero, so a number and its string form stay distinct, and `filter` removing every occurrence rather than just the first keeps the result consistent even if duplicates crept in.',
  },

  {
    id: 'ch-beg-cart-total',
    slug: 'a-shopping-cart-total',
    title: 'A Shopping Cart Total',
    difficulty: DIFFICULTY.BEGINNER,
    category: CATEGORY,
    topicIds: ['arrays', 'objects', 'array-methods'],
    xp: XP_B,
    prompt:
      'Write `cartTotal(items)` where each item is `{ price, quantity }` in whole cents, returning the total in cents. An item with a missing `quantity` counts as 1. An item with a `quantity` of 0 contributes nothing. An empty cart totals 0.',
    examples: [
      'cartTotal([{ price: 250, quantity: 2 }, { price: 100 }]);  // 600',
    ],
    constraints: ['Prices and quantities are whole numbers.', 'A missing `quantity` defaults to 1.', 'Return a number of cents.'],
    starterCode: 'function cartTotal(items) {\n  // Your code here\n}\n',
    tests: [
      { name: 'totals a simple cart', body: 'expect(cartTotal([{ price: 250, quantity: 2 }])).toBe(500);' },
      { name: 'totals several items', body: 'expect(cartTotal([{ price: 250, quantity: 2 }, { price: 100, quantity: 1 }])).toBe(600);' },
      { name: 'a missing quantity counts as one', body: 'expect(cartTotal([{ price: 100 }])).toBe(100);' },
      { name: 'a quantity of zero contributes nothing', body: 'expect(cartTotal([{ price: 100, quantity: 0 }])).toBe(0);' },
      { name: 'a zero quantity does not become one', body: 'expect(cartTotal([{ price: 500, quantity: 0 }, { price: 100 }])).toBe(100);' },
      { name: 'an empty cart totals zero', body: 'expect(cartTotal([])).toBe(0);' },
      { name: 'a free item contributes nothing', body: 'expect(cartTotal([{ price: 0, quantity: 5 }])).toBe(0);' },
      { name: 'handles a large quantity', body: 'expect(cartTotal([{ price: 199, quantity: 100 }])).toBe(19900);' },
      { name: 'does not modify the items', body: 'const items = [{ price: 100 }]; cartTotal(items); expect(items[0].quantity).toBe(undefined);' },
      { name: 'handles a long cart', body: 'expect(cartTotal(Array.from({ length: 100 }, () => ({ price: 5, quantity: 2 })))).toBe(1000);', hidden: true },
    ],
    hints: [
      '`reduce` with a starting value of 0 adds up a computed value from each item.',
      'For the default quantity, use `??` rather than `||` — `0 || 1` is `1`, which would turn a removed item back into a purchase.',
      'That single operator choice is what the "a zero quantity does not become one" test is checking.',
    ],
    solution:
      'function cartTotal(items) {\n' +
      '  return items.reduce((total, item) => total + item.price * (item.quantity ?? 1), 0);\n' +
      '}\n',
    solutionExplanation:
      'The whole challenge turns on `??` versus `||`. Both supply a default, but `||` fires for every falsy value, so a `quantity` of 0 — a real, meaningful value here — would be replaced by 1 and the customer would be charged for an item they removed. `??` fires only for `null` and `undefined`, which is exactly the "no value was given" case the specification describes. This is the single most common place the two get confused, and the cost of the confusion is usually a billing bug. Working entirely in whole cents also keeps the arithmetic exact, avoiding the floating-point rounding that decimal currency amounts would introduce.',
  },

  {
    id: 'ch-beg-word-count',
    slug: 'counting-words',
    title: 'Counting Words',
    difficulty: DIFFICULTY.BEGINNER,
    category: CATEGORY,
    topicIds: ['strings', 'arrays', 'regex'],
    xp: XP_B,
    prompt:
      'Write `wordCount(text)` returning how many words a piece of text contains. Words are runs of non-whitespace separated by any amount of whitespace — spaces, tabs or newlines. Leading, trailing and repeated whitespace must not inflate the count, and an empty or whitespace-only text has 0 words.',
    examples: ['wordCount("the quick brown fox");  // 4\nwordCount("  spaced   out  ");     // 2\nwordCount("   ");                  // 0'],
    constraints: ['Any whitespace separates words.', 'Repeated separators do not create empty words.', 'An empty or whitespace-only text gives 0.'],
    starterCode: 'function wordCount(text) {\n  // Your code here\n}\n',
    tests: [
      { name: 'counts simple words', body: 'expect(wordCount("the quick brown fox")).toBe(4);' },
      { name: 'a single word', body: 'expect(wordCount("hello")).toBe(1);' },
      { name: 'ignores extra spaces', body: 'expect(wordCount("a    b")).toBe(2);' },
      { name: 'ignores leading and trailing spaces', body: 'expect(wordCount("  spaced   out  ")).toBe(2);' },
      { name: 'an empty string has no words', body: 'expect(wordCount("")).toBe(0);' },
      { name: 'a whitespace-only string has no words', body: 'expect(wordCount("   ")).toBe(0);' },
      { name: 'newlines separate words', body: 'expect(wordCount("a\\nb")).toBe(2);' },
      { name: 'tabs separate words', body: 'expect(wordCount("a\\tb")).toBe(2);' },
      { name: 'punctuation does not split a word', body: 'expect(wordCount("well-known thing")).toBe(2);' },
      { name: 'counts a longer passage', body: 'expect(wordCount("one two three four five six seven")).toBe(7);' },
      { name: 'mixed whitespace kinds', body: 'expect(wordCount(" a \\n\\t b  ")).toBe(2);', hidden: true },
    ],
    hints: [
      'Trim the text first, then split on runs of whitespace.',
      '`/\\s+/` matches any run of whitespace of any kind, which is what makes tabs and newlines work without extra cases.',
      'Trimming first is essential: without it, a leading space produces an empty first element that would be counted as a word. Check the empty case too, since `"".split(/\\s+/)` is `[""]`, not `[]`.',
    ],
    solution:
      'function wordCount(text) {\n' +
      '  const trimmed = text.trim();\n' +
      '  if (trimmed === "") return 0;\n' +
      '  return trimmed.split(/\\s+/).length;\n' +
      '}\n',
    solutionExplanation:
      'Two small traps are the whole exercise. Splitting without trimming leaves an empty string at the front when the text starts with whitespace, so `" a b"` would count 3 words. And `"".split(/\\s+/)` returns `[""]` — an array of length 1 — so an empty text would count as one word without the explicit guard. Using `\\s+` rather than a literal space is what makes tabs and newlines behave the same as spaces, and the `+` is what collapses runs so `"a    b"` is 2 rather than 5.',
  },

  {
    id: 'ch-beg-ordinal',
    slug: 'ordinal-suffixes',
    title: 'Ordinal Suffixes',
    difficulty: DIFFICULTY.BEGINNER,
    category: CATEGORY,
    topicIds: ['numbers', 'strings', 'control-flow'],
    xp: XP_B,
    prompt:
      'Write `ordinal(n)` turning a positive whole number into its English ordinal: 1 is `"1st"`, 2 is `"2nd"`, 3 is `"3rd"`, and most others take `"th"`. The catch is the teens: 11, 12 and 13 are `"11th"`, `"12th"` and `"13th"`, not `"11st"`. The pattern repeats every hundred, so 111 is `"111th"` and 121 is `"121st"`.',
    examples: ['ordinal(1);    // "1st"\nordinal(11);   // "11th"\nordinal(21);   // "21st"\nordinal(113);  // "113th"'],
    constraints: ['`n` is a positive integer.', 'The teens 11, 12 and 13 always take `"th"`, at every hundred.', 'The number itself is part of the result.'],
    starterCode: 'function ordinal(n) {\n  // Your code here\n}\n',
    tests: [
      { name: 'first', body: 'expect(ordinal(1)).toBe("1st");' },
      { name: 'second', body: 'expect(ordinal(2)).toBe("2nd");' },
      { name: 'third', body: 'expect(ordinal(3)).toBe("3rd");' },
      { name: 'fourth', body: 'expect(ordinal(4)).toBe("4th");' },
      { name: 'the teens take th', body: 'expect(ordinal(11)).toBe("11th"); expect(ordinal(12)).toBe("12th"); expect(ordinal(13)).toBe("13th");' },
      { name: 'the pattern resumes after the teens', body: 'expect(ordinal(21)).toBe("21st"); expect(ordinal(22)).toBe("22nd"); expect(ordinal(23)).toBe("23rd");' },
      { name: 'the teen exception repeats at 111', body: 'expect(ordinal(111)).toBe("111th"); expect(ordinal(112)).toBe("112th"); expect(ordinal(113)).toBe("113th");' },
      { name: 'the pattern holds at 121', body: 'expect(ordinal(121)).toBe("121st");' },
      { name: 'a round hundred', body: 'expect(ordinal(100)).toBe("100th");' },
      { name: 'other digits take th', body: 'expect(ordinal(5)).toBe("5th"); expect(ordinal(9)).toBe("9th"); expect(ordinal(10)).toBe("10th");' },
      { name: 'a large number', body: 'expect(ordinal(1001)).toBe("1001st");' },
      { name: 'no number under 100 is wrong', body: 'for (let i = 1; i < 100; i += 1) { const out = ordinal(i); expect(out.startsWith(String(i))).toBe(true); expect(["st", "nd", "rd", "th"].includes(out.slice(-2))).toBe(true); }', hidden: true },
      { name: 'the 211 to 213 range takes th', body: 'expect(ordinal(211)).toBe("211th"); expect(ordinal(212)).toBe("212th"); expect(ordinal(213)).toBe("213th");', hidden: true },
    ],
    hints: [
      'The suffix depends on the last digit — except when the last *two* digits are 11, 12 or 13.',
      'Check the exception first: `n % 100` between 11 and 13 always gives `"th"`.',
      'Otherwise switch on `n % 10`: 1 gives `"st"`, 2 gives `"nd"`, 3 gives `"rd"`, everything else `"th"`.',
    ],
    solution:
      'function ordinal(n) {\n' +
      '  const lastTwo = n % 100;\n' +
      '  if (lastTwo >= 11 && lastTwo <= 13) return n + "th";\n' +
      '  const lastOne = n % 10;\n' +
      '  if (lastOne === 1) return n + "st";\n' +
      '  if (lastOne === 2) return n + "nd";\n' +
      '  if (lastOne === 3) return n + "rd";\n' +
      '  return n + "th";\n' +
      '}\n',
    solutionExplanation:
      'The rule has an exception, and the exception has to be checked *first* — that ordering is the entire problem. Testing the last digit before the teens would give `"11st"` and `"113rd"`, which is the bug almost every first attempt has. Because the exception is expressed as `n % 100`, it automatically repeats at 111, 211, 311 and so on, without listing any of them. This shape — check the narrow exception, then the general rule — recurs constantly in formatting and validation code, and getting the order wrong is a much more common bug than getting the rule wrong.',
  },

  {
    id: 'ch-beg-has-duplicate',
    slug: 'spotting-duplicates',
    title: 'Spotting Duplicates',
    difficulty: DIFFICULTY.BEGINNER,
    category: CATEGORY,
    topicIds: ['arrays', 'data-structures', 'booleans'],
    xp: XP_B,
    prompt:
      'Write `hasDuplicate(items)` reporting whether any value appears more than once. Comparing every element against every other works but is slow on a long list — use a `Set` so each value is checked in roughly constant time.',
    examples: ['hasDuplicate([1, 2, 3]);     // false\nhasDuplicate([1, 2, 1]);     // true'],
    constraints: ['Values are primitives.', 'One test uses 50,000 elements; a nested loop will time out.', 'Return an actual boolean.'],
    starterCode: 'function hasDuplicate(items) {\n  // Your code here\n}\n',
    tests: [
      { name: 'an all-distinct array has none', body: 'expect(hasDuplicate([1, 2, 3])).toBe(false);' },
      { name: 'finds a duplicate', body: 'expect(hasDuplicate([1, 2, 1])).toBe(true);' },
      { name: 'finds adjacent duplicates', body: 'expect(hasDuplicate([1, 1])).toBe(true);' },
      { name: 'an empty array has none', body: 'expect(hasDuplicate([])).toBe(false);' },
      { name: 'a single element has none', body: 'expect(hasDuplicate([1])).toBe(false);' },
      { name: 'works with strings', body: 'expect(hasDuplicate(["a", "b", "a"])).toBe(true);' },
      { name: 'does not confuse a number with its string', body: 'expect(hasDuplicate([1, "1"])).toBe(false);' },
      { name: 'treats NaN as a duplicate of itself', body: 'expect(hasDuplicate([NaN, NaN])).toBe(true);' },
      { name: 'handles falsy values', body: 'expect(hasDuplicate([0, false, ""])).toBe(false); expect(hasDuplicate([0, 0])).toBe(true);' },
      { name: 'returns a real boolean', body: 'expect(typeof hasDuplicate([1])).toBe("boolean");' },
      { name: 'a duplicate at the very end is found', body: 'expect(hasDuplicate([1, 2, 3, 4, 1])).toBe(true);' },
      {
        name: 'stays fast on a long list',
        body:
          'const xs = Array.from({ length: 50000 }, (_, i) => i);\n' +
          'expect(hasDuplicate(xs)).toBe(false);\n' +
          'xs.push(0);\n' +
          'expect(hasDuplicate(xs)).toBe(true);',
        hidden: true,
      },
    ],
    hints: [
      'Walk the array once, remembering every value you have already seen in a `Set`.',
      'If a value is already in the set, you have found a duplicate and can return immediately.',
      'There is also a one-line version: compare the size of a `Set` built from the array against the array\'s length.',
    ],
    solution:
      'function hasDuplicate(items) {\n' +
      '  const seen = new Set();\n' +
      '  for (const item of items) {\n' +
      '    if (seen.has(item)) return true;\n' +
      '    seen.add(item);\n' +
      '  }\n' +
      '  return false;\n' +
      '}\n',
    solutionExplanation:
      'A `Set` answers "have I seen this?" in roughly constant time, so one pass settles the question — where comparing every pair would take 1.25 billion comparisons on the 50,000-element test instead of 50,000. Returning as soon as a repeat appears also means a duplicate near the front costs almost nothing. The one-liner `new Set(items).size !== items.length` is equally correct and shorter, but always builds the whole set even when the first two elements already match. `Set` membership uses SameValueZero, which is why `NaN` is correctly reported as a duplicate of itself even though `NaN === NaN` is false.',
  },

  {
    id: 'ch-beg-align-right',
    slug: 'aligning-a-column',
    title: 'Aligning a Column',
    difficulty: DIFFICULTY.BEGINNER,
    category: CATEGORY,
    topicIds: ['strings', 'arrays', 'array-methods'],
    xp: XP_B,
    prompt:
      'Write `alignRight(values)` turning an array of values into an array of strings all padded to the same width, right-aligned — the width being that of the longest one. This is what makes a column of numbers readable in a terminal. An empty input gives an empty array.',
    examples: [
      'alignRight([1, 22, 333]);\n// ["  1", " 22", "333"]',
    ],
    constraints: ['Values are converted to strings first.', 'The width is that of the longest value.', 'Padding is spaces on the left.'],
    starterCode: 'function alignRight(values) {\n  // Your code here\n}\n',
    tests: [
      { name: 'pads to the longest', body: 'expect(alignRight([1, 22, 333])).toEqual(["  1", " 22", "333"]);' },
      { name: 'all the same width', body: 'expect(alignRight([1, 2])).toEqual(["1", "2"]);' },
      { name: 'a single value needs no padding', body: 'expect(alignRight([42])).toEqual(["42"]);' },
      { name: 'an empty input gives an empty array', body: 'expect(alignRight([])).toEqual([]);' },
      { name: 'every result has the same length', body: 'const out = alignRight([1, 22, 333, 4444]); expect(new Set(out.map((s) => s.length)).size).toBe(1);' },
      { name: 'works with strings', body: 'expect(alignRight(["a", "bbb"])).toEqual(["  a", "bbb"]);' },
      { name: 'handles a mix of types', body: 'expect(alignRight([1, "bb"])).toEqual([" 1", "bb"]);' },
      { name: 'handles negative numbers', body: 'expect(alignRight([-1, 100])).toEqual([" -1", "100"]);' },
      { name: 'handles an empty string', body: 'expect(alignRight(["", "ab"])).toEqual(["  ", "ab"]);' },
      { name: 'does not modify the input', body: 'const xs = [1, 22]; alignRight(xs); expect(xs).toEqual([1, 22]);' },
      { name: 'the longest value is unpadded', body: 'const out = alignRight([1, 22, 333]); expect(out[2]).toBe("333");', hidden: true },
    ],
    hints: [
      'Convert every value to a string first, then find the longest.',
      '`Math.max(...lengths)` finds the width — but check what it does with an empty array before relying on it.',
      '`padStart(width, " ")` adds spaces on the left and leaves an already-wide-enough string alone.',
    ],
    solution:
      'function alignRight(values) {\n' +
      '  const strings = values.map(String);\n' +
      '  if (strings.length === 0) return [];\n' +
      '  const width = Math.max(...strings.map((s) => s.length));\n' +
      '  return strings.map((s) => s.padStart(width, " "));\n' +
      '}\n',
    solutionExplanation:
      'Converting first means the width calculation and the padding both work on the same values, so a number and a string of the same visible length are treated identically. The empty-input guard is genuinely needed: `Math.max()` with no arguments returns `-Infinity`, and `padStart(-Infinity)` would silently do nothing rather than fail loudly. `padStart` is safe when a string already meets the width — it returns it unchanged rather than truncating, which is what keeps the longest value intact.',
  },

  {
    id: 'ch-beg-capitalize-sentences',
    slug: 'capitalising-sentences',
    title: 'Capitalising Sentences',
    difficulty: DIFFICULTY.BEGINNER,
    category: CATEGORY,
    topicIds: ['strings', 'regex', 'control-flow'],
    xp: XP_B,
    prompt:
      'Write `capitalizeSentences(text)` uppercasing the first letter of each sentence, where a sentence starts at the beginning of the text or after a `.`, `!` or `?` followed by whitespace. The rest of each sentence is left exactly as written — this fixes capitalisation, it does not rewrite the text.',
    examples: [
      'capitalizeSentences("hello there. how are you?");\n// "Hello there. How are you?"',
    ],
    constraints: ['Only the first letter of each sentence changes.', 'The rest of the text keeps its original casing.', 'Whitespace and punctuation are preserved exactly.'],
    starterCode: 'function capitalizeSentences(text) {\n  // Your code here\n}\n',
    tests: [
      { name: 'capitalises two sentences', body: 'expect(capitalizeSentences("hello there. how are you?")).toBe("Hello there. How are you?");' },
      { name: 'capitalises the very first letter', body: 'expect(capitalizeSentences("hello")).toBe("Hello");' },
      { name: 'leaves the rest of a sentence alone', body: 'expect(capitalizeSentences("hello WORLD here")).toBe("Hello WORLD here");' },
      { name: 'handles an exclamation mark', body: 'expect(capitalizeSentences("wow! amazing")).toBe("Wow! Amazing");' },
      { name: 'handles a question mark', body: 'expect(capitalizeSentences("really? yes")).toBe("Really? Yes");' },
      { name: 'leaves an already-correct text alone', body: 'expect(capitalizeSentences("Hello. World.")).toBe("Hello. World.");' },
      { name: 'handles an empty string', body: 'expect(capitalizeSentences("")).toBe("");' },
      { name: 'preserves a trailing period', body: 'expect(capitalizeSentences("done.")).toBe("Done.");' },
      { name: 'preserves double spaces after a period', body: 'expect(capitalizeSentences("one.  two")).toBe("One.  Two");' },
      { name: 'capitalises across a newline', body: 'expect(capitalizeSentences("one.\\ntwo")).toBe("One.\\nTwo");' },
      { name: 'does not change the length', body: 'const s = "one. two! three?"; expect(capitalizeSentences(s).length).toBe(s.length);' },
      { name: 'a period with no space does not start a sentence', body: 'expect(capitalizeSentences("version 1.2 here")).toBe("Version 1.2 here");', hidden: true },
      { name: 'handles three sentences', body: 'expect(capitalizeSentences("a. b. c.")).toBe("A. B. C.");', hidden: true },
    ],
    hints: [
      'A sentence-starting letter is one that appears either at the very start of the text, or after `.`/`!`/`?` and some whitespace.',
      'A single regex with an alternation for those two positions, plus the global flag, finds every one of them.',
      'Use a replacer function so you can uppercase whatever was matched while putting the punctuation and whitespace back unchanged.',
    ],
    solution:
      'function capitalizeSentences(text) {\n' +
      '  return text.replace(/(^|[.!?]\\s+)([a-z])/g, (whole, prefix, letter) => prefix + letter.toUpperCase());\n' +
      '}\n',
    solutionExplanation:
      'The pattern captures two things: the *context* that marks a sentence start, and the letter itself. Putting the context in its own group and re-emitting it unchanged is what preserves the exact punctuation and whitespace — `"one.  two"` keeps both spaces because the group matched both. Requiring whitespace after the punctuation is what stops `"version 1.2 here"` being treated as two sentences, since the `.` there is followed immediately by a digit. Matching only `[a-z]` means an already-capitalised sentence simply does not match and passes through untouched, so the function is safe to run on text that is already correct.',
  },

  {
    id: 'ch-beg-every-nth',
    slug: 'taking-every-nth-item',
    title: 'Taking Every Nth Item',
    difficulty: DIFFICULTY.BEGINNER,
    category: CATEGORY,
    topicIds: ['arrays', 'loops', 'errors'],
    xp: XP_B,
    prompt:
      'Write `everyNth(items, n)` returning a new array containing the first item and then every `n`th one after it — so `n` of 2 gives items at index 0, 2, 4 and so on. An `n` of 1 returns a copy of everything. An `n` below 1 makes no sense: throw a `RangeError`.',
    examples: [
      'everyNth([1, 2, 3, 4, 5], 2);  // [1, 3, 5]',
      'everyNth([1, 2, 3], 1);        // [1, 2, 3]',
    ],
    constraints: ['The first item is always included when the array is non-empty.', '`n` of 1 returns a copy, not the original array.', '`n` below 1 throws a `RangeError`.'],
    starterCode: 'function everyNth(items, n) {\n  // Your code here\n}\n',
    tests: [
      { name: 'takes every second item', body: 'expect(everyNth([1, 2, 3, 4, 5], 2)).toEqual([1, 3, 5]);' },
      { name: 'takes every third item', body: 'expect(everyNth([1, 2, 3, 4, 5, 6, 7], 3)).toEqual([1, 4, 7]);' },
      { name: 'an n of one copies everything', body: 'expect(everyNth([1, 2, 3], 1)).toEqual([1, 2, 3]);' },
      { name: 'an n of one returns a new array', body: 'const xs = [1, 2]; expect(everyNth(xs, 1)).not.toBe(xs);' },
      { name: 'always includes the first item', body: 'expect(everyNth([9, 1, 2], 5)[0]).toBe(9);' },
      { name: 'an n larger than the array gives one item', body: 'expect(everyNth([1, 2, 3], 10)).toEqual([1]);' },
      { name: 'an empty array gives an empty array', body: 'expect(everyNth([], 2)).toEqual([]);' },
      { name: 'does not modify the input', body: 'const xs = [1, 2, 3]; everyNth(xs, 2); expect(xs).toEqual([1, 2, 3]);' },
      { name: 'rejects an n of zero', body: 'expect(() => everyNth([1], 0)).toThrow(RangeError);' },
      { name: 'rejects a negative n', body: 'expect(() => everyNth([1], -2)).toThrow(RangeError);' },
      { name: 'an even-length array with n of two', body: 'expect(everyNth([1, 2, 3, 4], 2)).toEqual([1, 3]);' },
      { name: 'produces the expected count', body: 'expect(everyNth(Array.from({ length: 100 }, (_, i) => i), 7).length).toBe(15);', hidden: true },
    ],
    hints: [
      'Rather than looping over every item and testing the index, step the loop counter by `n`.',
      'That way there is no condition inside the loop at all — the increment does the selecting.',
      'Validate `n` before the loop; an `n` of 0 would never advance the counter.',
    ],
    solution:
      'function everyNth(items, n) {\n' +
      '  if (n < 1) throw new RangeError("n must be at least 1");\n' +
      '  const out = [];\n' +
      '  for (let i = 0; i < items.length; i += n) {\n' +
      '    out.push(items[i]);\n' +
      '  }\n' +
      '  return out;\n' +
      '}\n',
    solutionExplanation:
      'Stepping the counter by `n` instead of testing `i % n === 0` inside the loop does the same job while visiting only the items it needs — the difference is small here but it is the clearer expression of the intent either way. The empty array and the too-large `n` both fall out without special cases: the loop simply runs zero or one time. The `n < 1` guard is not decoration, since a step of 0 would leave the counter at 0 forever and hang the program, which is a worse outcome than an exception.',
  },

  {
    id: 'ch-beg-password-rules',
    slug: 'checking-password-rules',
    title: 'Checking Password Rules',
    difficulty: DIFFICULTY.BEGINNER,
    category: CATEGORY,
    topicIds: ['strings', 'arrays', 'security'],
    xp: XP_B,
    prompt:
      'Write `checkPassword(password)` returning an array of the rules the password **fails**, so the user can be told everything that is wrong at once rather than one problem per attempt. The rules, in this order: `"at least 12 characters"`, `"a lowercase letter"`, `"an uppercase letter"`, `"a number"`. A password meeting every rule returns an empty array.',
    examples: [
      'checkPassword("short");\n// ["at least 12 characters", "an uppercase letter", "a number"]',
      'checkPassword("LongEnough123");  // []',
    ],
    constraints: ['Failures are listed in the order given, not the order discovered.', 'A passing password returns an empty array.', 'Return the failures, not a boolean.'],
    starterCode: 'function checkPassword(password) {\n  // Your code here\n}\n',
    tests: [
      { name: 'a valid password has no failures', body: 'expect(checkPassword("LongEnough123")).toEqual([]);' },
      { name: 'reports a short password', body: 'expect(checkPassword("Short1")).toContain("at least 12 characters");' },
      { name: 'reports a missing uppercase letter', body: 'expect(checkPassword("alllowercase123")).toEqual(["an uppercase letter"]);' },
      { name: 'reports a missing lowercase letter', body: 'expect(checkPassword("ALLUPPERCASE123")).toEqual(["a lowercase letter"]);' },
      { name: 'reports a missing number', body: 'expect(checkPassword("NoDigitsAtAllHere")).toEqual(["a number"]);' },
      { name: 'reports several failures at once', body: 'expect(checkPassword("short")).toEqual(["at least 12 characters", "an uppercase letter", "a number"]);' },
      { name: 'reports failures in the given order', body: 'const out = checkPassword("abc"); expect(out.indexOf("at least 12 characters")).toBeLessThan(out.indexOf("a number"));' },
      { name: 'an empty password fails everything', body: 'expect(checkPassword("").length).toBe(4);' },
      { name: 'exactly twelve characters is long enough', body: 'expect(checkPassword("Abcdefghij12")).toEqual([]);' },
      { name: 'eleven characters is too short', body: 'expect(checkPassword("Abcdefghi12")).toEqual(["at least 12 characters"]);' },
      { name: 'symbols count toward the length', body: 'expect(checkPassword("Ab1!!!!!!!!!")).toEqual([]);' },
      { name: 'returns an array, not a boolean', body: 'expect(Array.isArray(checkPassword("anything"))).toBe(true);', hidden: true },
    ],
    hints: [
      'Check each rule in turn and push its message when the rule fails.',
      'Writing the rules in the required order means the output order needs no sorting.',
      '`/[a-z]/.test(password)` reports whether a lowercase letter appears anywhere; `/[0-9]/` does the same for digits.',
    ],
    solution:
      'function checkPassword(password) {\n' +
      '  const failures = [];\n' +
      '  if (password.length < 12) failures.push("at least 12 characters");\n' +
      '  if (!/[a-z]/.test(password)) failures.push("a lowercase letter");\n' +
      '  if (!/[A-Z]/.test(password)) failures.push("an uppercase letter");\n' +
      '  if (!/[0-9]/.test(password)) failures.push("a number");\n' +
      '  return failures;\n' +
      '}\n',
    solutionExplanation:
      'Returning the full list of failures rather than a boolean is the design decision worth taking away: a form that reports one problem at a time makes the user guess repeatedly, while one list lets them fix everything in a single attempt. Checking the rules in the order they are specified means the output order is correct by construction, with no sorting step to get wrong.\n\nOn the rules themselves — length is by far the most important of the four. Composition requirements like "must contain a number" push people toward predictable substitutions (`Password1!`) without adding much real strength, which is why modern guidance from bodies such as NIST favours long passphrases and screening against known-breached passwords over character-class rules. This function implements the rules as specified; it is worth knowing which of them actually earns its place.',
  },
];

export default challenges;
