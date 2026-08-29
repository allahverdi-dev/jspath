import { DIFFICULTY } from '../schema/types.js';
import { XP } from './_xp.js';

const CATEGORY = 'Fundamentals';

export const challenges = [
  {
    id: 'ch-fund-clock',
    slug: 'stopwatch-display',
    title: 'Stopwatch Display',
    difficulty: DIFFICULTY.BEGINNER,
    category: CATEGORY,
    topicIds: ['numbers', 'strings', 'operators'],
    xp: XP[DIFFICULTY.BEGINNER],
    prompt:
      'A stopwatch counts whole seconds. Write `formatClock(totalSeconds)` that renders the elapsed time as `M:SS` — minutes with no leading zero, seconds always two digits. Once the elapsed time reaches an hour, switch to `H:MM:SS`, where minutes are also padded. Negative input is not a real elapsed time; return `"0:00"` for it.',
    examples: [
      'formatClock(9);      // "0:09"\nformatClock(75);     // "1:15"\nformatClock(600);    // "10:00"',
      'formatClock(3600);   // "1:00:00"\nformatClock(3725);   // "1:02:05"',
    ],
    constraints: ['`totalSeconds` is an integer.', 'No hour cap — 100 hours should render as `100:00:00`.'],
    starterCode: 'function formatClock(totalSeconds) {\n  // Your code here\n}\n',
    tests: [
      { name: 'pads seconds under ten', body: 'expect(formatClock(9)).toBe("0:09");' },
      { name: 'handles zero', body: 'expect(formatClock(0)).toBe("0:00");' },
      { name: 'splits minutes and seconds', body: 'expect(formatClock(75)).toBe("1:15");' },
      { name: 'does not pad the minutes field below an hour', body: 'expect(formatClock(540)).toBe("9:00");' },
      { name: 'allows two-digit minutes', body: 'expect(formatClock(600)).toBe("10:00");' },
      { name: 'switches to hours at exactly 3600', body: 'expect(formatClock(3600)).toBe("1:00:00");' },
      { name: 'pads minutes once hours appear', body: 'expect(formatClock(3725)).toBe("1:02:05");' },
      { name: 'stays in minute form at 3599', body: 'expect(formatClock(3599)).toBe("59:59");' },
      { name: 'does not cap the hours field', body: 'expect(formatClock(360000)).toBe("100:00:00");', hidden: true },
      { name: 'clamps negative input', body: 'expect(formatClock(-5)).toBe("0:00");', hidden: true },
    ],
    hints: [
      'Integer division gives you the larger unit and the remainder operator gives you what is left over: 3725 seconds is 3725 / 3600 hours with 125 seconds remaining.',
      'Padding is easier as a string operation than an arithmetic one. `String(n).padStart(2, "0")` turns 5 into "05" and leaves 15 alone.',
      'The minutes field is padded in one branch and not in the other. Compute the number first, decide the padding second.',
    ],
    solution:
      'function formatClock(totalSeconds) {\n' +
      '  if (totalSeconds < 0) return "0:00";\n' +
      '  const pad = (n) => String(n).padStart(2, "0");\n' +
      '  const hours = Math.floor(totalSeconds / 3600);\n' +
      '  const minutes = Math.floor((totalSeconds % 3600) / 60);\n' +
      '  const seconds = totalSeconds % 60;\n' +
      '  if (hours > 0) return hours + ":" + pad(minutes) + ":" + pad(seconds);\n' +
      '  return minutes + ":" + pad(seconds);\n' +
      '}\n',
    solutionExplanation:
      'Each field is one division and one remainder. Hours are the whole 3600s; the leftover seconds (`totalSeconds % 3600`) are divided again by 60 for minutes, and the final `% 60` gives seconds. The padding rule differs between the two output shapes — seconds are always two digits, minutes only once an hours field exists — so the shape is chosen last, after the three numbers are already known.',
  },

  {
    id: 'ch-fund-leap-year',
    slug: 'leap-year-rule',
    title: 'The Leap Year Rule',
    difficulty: DIFFICULTY.BEGINNER,
    category: CATEGORY,
    topicIds: ['control-flow', 'operators', 'booleans'],
    xp: XP[DIFFICULTY.BEGINNER],
    prompt:
      'The Gregorian calendar adds a leap day when a year is divisible by 4 — except that century years are skipped, unless they are divisible by 400. So 1996 and 2000 are leap years; 1900 and 2023 are not. Write `isLeapYear(year)` returning a boolean.',
    examples: ['isLeapYear(2024); // true\nisLeapYear(1900); // false\nisLeapYear(2000); // true'],
    constraints: ['`year` is a positive integer.', 'Return an actual boolean, not a truthy number.'],
    starterCode: 'function isLeapYear(year) {\n  // Your code here\n}\n',
    tests: [
      { name: 'an ordinary leap year', body: 'expect(isLeapYear(2024)).toBe(true);' },
      { name: 'an ordinary common year', body: 'expect(isLeapYear(2023)).toBe(false);' },
      { name: 'a skipped century', body: 'expect(isLeapYear(1900)).toBe(false);' },
      { name: 'a century that is still a leap year', body: 'expect(isLeapYear(2000)).toBe(true);' },
      { name: 'another skipped century', body: 'expect(isLeapYear(2100)).toBe(false);' },
      { name: 'the 400 rule again', body: 'expect(isLeapYear(2400)).toBe(true);' },
      { name: 'returns a real boolean, not a number', body: 'expect(typeof isLeapYear(2024)).toBe("boolean");' },
      { name: 'handles year 4', body: 'expect(isLeapYear(4)).toBe(true);', hidden: true },
      { name: 'handles year 1', body: 'expect(isLeapYear(1)).toBe(false);', hidden: true },
    ],
    hints: [
      'There are three rules and the later ones override the earlier ones. Write them in the order they override: divisible by 400 wins outright, then divisible by 100 rules the year out, then divisible by 4 rules it in.',
      'You can also write it as a single expression combining `&&` and `||` — but only if you are confident about which parts need parentheses.',
      'Do not build a Date to answer this. The rule is pure arithmetic, and constructing dates drags in timezone behaviour you do not want here.',
    ],
    solution:
      'function isLeapYear(year) {\n' +
      '  if (year % 400 === 0) return true;\n' +
      '  if (year % 100 === 0) return false;\n' +
      '  return year % 4 === 0;\n' +
      '}\n',
    solutionExplanation:
      'The three rules are checked most-specific first, so each `return` fires only for years the later rules would get wrong. Ordering them the other way round — testing `% 4` first — would return `true` for 1900 before the century exception ever ran. The `=== 0` comparisons also give you real booleans for free; returning `year % 4` alone would hand back 0, 1, 2 or 3.',
  },

  {
    id: 'ch-fund-average',
    slug: 'safe-average',
    title: 'Safe Average',
    difficulty: DIFFICULTY.BEGINNER,
    category: CATEGORY,
    topicIds: ['arrays', 'numbers', 'array-methods'],
    xp: XP[DIFFICULTY.BEGINNER],
    prompt:
      'Write `average(numbers)` returning the arithmetic mean. An empty array has no mean, and returning `NaN` for it forces every caller to guess what went wrong — return `null` instead so the "no answer" case is explicit. Do not round the result.',
    examples: ['average([2, 4, 6]);   // 4\naverage([1, 2]);      // 1.5\naverage([]);          // null'],
    constraints: ['Every element is a finite number.', 'Do not mutate the input array.'],
    starterCode: 'function average(numbers) {\n  // Your code here\n}\n',
    tests: [
      { name: 'averages whole numbers', body: 'expect(average([2, 4, 6])).toBe(4);' },
      { name: 'returns a fraction when it should', body: 'expect(average([1, 2])).toBe(1.5);' },
      { name: 'returns null for an empty array', body: 'expect(average([])).toBe(null);' },
      { name: 'handles a single element', body: 'expect(average([7])).toBe(7);' },
      { name: 'handles negative numbers', body: 'expect(average([-4, 4])).toBe(0);' },
      { name: 'does not mutate the input', body: 'const xs = [1, 2, 3]; average(xs); expect(xs).toEqual([1, 2, 3]);' },
      { name: 'does not round', body: 'expect(average([1, 2, 2])).toBeCloseTo(1.6667, 3);' },
      { name: 'zero is a real value, not an empty case', body: 'expect(average([0, 0])).toBe(0);', hidden: true },
    ],
    hints: [
      'Guard the empty case before you divide. Dividing 0 by 0 produces NaN, and NaN spreads silently through everything downstream.',
      '`reduce` with a starting value of 0 sums the array without needing a loop variable.',
      'Be careful that your empty check tests the *length*, not the sum — `[0, 0]` sums to 0 but is not empty.',
    ],
    solution:
      'function average(numbers) {\n' +
      '  if (numbers.length === 0) return null;\n' +
      '  const total = numbers.reduce((sum, n) => sum + n, 0);\n' +
      '  return total / numbers.length;\n' +
      '}\n',
    solutionExplanation:
      'The length guard comes first because it is the only case with no meaningful answer, and `null` says so far more clearly than `NaN`. Note the trap the last test checks: `[0, 0]` has a sum of 0 but is not empty, so a guard written as `if (!total)` would wrongly report it as having no average. `reduce` with an explicit `0` seed also keeps the single-element and empty cases from taking different code paths.',
  },

  {
    id: 'ch-fund-round-to',
    slug: 'round-to-places',
    title: 'Round To Places',
    difficulty: DIFFICULTY.EASY,
    category: CATEGORY,
    topicIds: ['numbers', 'operators'],
    xp: XP[DIFFICULTY.EASY],
    prompt:
      'Write `roundTo(value, places)` that rounds a number to a given number of decimal places and returns a **number**, not a string. `roundTo(2.567, 2)` is `2.57`. Zero places rounds to a whole number. Negative places round to the left of the decimal point: `roundTo(1234, -2)` is `1200`.',
    examples: ['roundTo(2.567, 2);  // 2.57\nroundTo(2.5, 0);    // 3\nroundTo(1234, -2);  // 1200'],
    constraints: ['`value` is finite.', '`places` is an integer between -6 and 10.', 'The return value must be a number.'],
    starterCode: 'function roundTo(value, places) {\n  // Your code here\n}\n',
    tests: [
      { name: 'rounds up at two places', body: 'expect(roundTo(2.567, 2)).toBe(2.57);' },
      { name: 'rounds down at two places', body: 'expect(roundTo(2.564, 2)).toBe(2.56);' },
      { name: 'zero places gives a whole number', body: 'expect(roundTo(2.5, 0)).toBe(3);' },
      { name: 'returns a number, not a string', body: 'expect(typeof roundTo(1.005, 2)).toBe("number");' },
      { name: 'does not leave trailing precision', body: 'expect(roundTo(1.1 + 2.2, 1)).toBe(3.3);' },
      { name: 'negative places round left of the point', body: 'expect(roundTo(1234, -2)).toBe(1200);' },
      { name: 'rounds negative values toward positive infinity at .5', body: 'expect(roundTo(-2.5, 0)).toBe(-2);' },
      { name: 'leaves an already-short number alone', body: 'expect(roundTo(3, 2)).toBe(3);' },
      { name: 'handles many places', body: 'expect(roundTo(1 / 3, 5)).toBe(0.33333);', hidden: true },
      { name: 'handles zero', body: 'expect(roundTo(0, 3)).toBe(0);', hidden: true },
    ],
    hints: [
      'Shift the decimal point right by `places`, round, then shift back. `10 ** places` is the shift factor, and it works for negative `places` too.',
      '`toFixed` returns a string, so it cannot be your final answer. You could wrap it in `Number(...)`, but that only handles non-negative `places`.',
      'Test your shift with `roundTo(1.1 + 2.2, 1)`. That sum is 3.3000000000000003, and a correct implementation still returns exactly 3.3.',
    ],
    solution:
      'function roundTo(value, places) {\n' +
      '  const factor = 10 ** places;\n' +
      '  return Math.round(value * factor) / factor;\n' +
      '}\n',
    solutionExplanation:
      'Multiplying by `10 ** places` moves the digits you want to keep to the left of the decimal point, `Math.round` discards the rest, and dividing puts them back. Because `places` can be negative, `10 ** -2` gives 0.01 and the same two lines handle rounding to hundreds. `Math.round` breaks .5 ties toward positive infinity, which is why `-2.5` rounds to `-2` rather than `-3` — worth knowing before you rely on it for money.',
  },

  {
    id: 'ch-fund-coin-change',
    slug: 'till-breakdown',
    title: 'Till Breakdown',
    difficulty: DIFFICULTY.EASY,
    category: CATEGORY,
    topicIds: ['objects', 'loops', 'numbers'],
    xp: XP[DIFFICULTY.EASY],
    prompt:
      'A till holds coins worth 100, 25, 10, 5 and 1 units. Write `breakdown(amount)` returning an object mapping each denomination it actually uses to the count of that coin, always using the fewest coins possible. Denominations that are not used must be **absent** from the object, not present with a value of 0.',
    examples: ['breakdown(141);  // { "100": 1, "25": 1, "10": 1, "5": 1, "1": 1 }\nbreakdown(30);   // { "25": 1, "5": 1 }\nbreakdown(0);    // {}'],
    constraints: ['`amount` is a non-negative integer.', 'Object keys are numeric strings, as JavaScript object keys always are.'],
    starterCode: 'function breakdown(amount) {\n  // Your code here\n}\n',
    tests: [
      { name: 'uses one of each', body: 'expect(breakdown(141)).toEqual({ 100: 1, 25: 1, 10: 1, 5: 1, 1: 1 });' },
      { name: 'omits unused denominations', body: 'expect(breakdown(30)).toEqual({ 25: 1, 5: 1 });' },
      { name: 'zero produces an empty object', body: 'expect(breakdown(0)).toEqual({});' },
      { name: 'uses several of one coin', body: 'expect(breakdown(300)).toEqual({ 100: 3 });' },
      { name: 'a single unit', body: 'expect(breakdown(1)).toEqual({ 1: 1 });' },
      { name: 'really omits the zero keys', body: 'expect(Object.keys(breakdown(100))).toEqual(["100"]);' },
      { name: 'picks the fewest coins', body: 'expect(breakdown(25)).toEqual({ 25: 1 });' },
      { name: 'a mixed awkward amount', body: 'expect(breakdown(87)).toEqual({ 25: 3, 10: 1, 1: 2 });' },
      { name: 'the counts add back up', body: 'const b = breakdown(9999); let sum = 0; for (const k of Object.keys(b)) sum += Number(k) * b[k]; expect(sum).toBe(9999);', hidden: true },
    ],
    hints: [
      'Walk the denominations from largest to smallest. At each one, take as many as fit, then carry the remainder to the next.',
      'Integer division tells you how many fit; the remainder operator tells you what is left.',
      'Only write the key when the count is greater than zero — that is what keeps unused denominations out of the result.',
    ],
    solution:
      'function breakdown(amount) {\n' +
      '  const coins = [100, 25, 10, 5, 1];\n' +
      '  const result = {};\n' +
      '  let left = amount;\n' +
      '  for (const coin of coins) {\n' +
      '    const count = Math.floor(left / coin);\n' +
      '    if (count > 0) {\n' +
      '      result[coin] = count;\n' +
      '      left -= count * coin;\n' +
      '    }\n' +
      '  }\n' +
      '  return result;\n' +
      '}\n',
    solutionExplanation:
      'Taking as many of the largest coin as possible before moving on is a greedy strategy, and it happens to be optimal for this particular set of denominations — 100, 25, 10, 5, 1. That is a property of the set, not a general law: for a set like 1, 3, 4 the greedy choice for 6 gives three coins (4+1+1) where two (3+3) would do. The `count > 0` guard is what satisfies the "absent, not zero" requirement, and the hidden test confirms the breakdown actually reconstructs the original amount.',
  },

  {
    id: 'ch-fund-format-bytes',
    slug: 'human-readable-size',
    title: 'Human-Readable Size',
    difficulty: DIFFICULTY.EASY,
    category: CATEGORY,
    topicIds: ['numbers', 'strings', 'loops'],
    xp: XP[DIFFICULTY.EASY],
    prompt:
      'Write `formatBytes(bytes)` that turns a byte count into a short human label using the units `B`, `KB`, `MB`, `GB` and `TB`, each 1024 of the previous. Choose the largest unit that leaves a value of at least 1. Show one decimal place unless the unit is bytes — `"512 B"` never needs a fraction — and drop a trailing `.0` so 2048 reads `"2 KB"` rather than `"2.0 KB"`.',
    examples: ['formatBytes(512);      // "512 B"\nformatBytes(2048);     // "2 KB"\nformatBytes(1536);     // "1.5 KB"\nformatBytes(0);        // "0 B"'],
    constraints: ['`bytes` is a non-negative integer.', 'Values at or above 1 TB stay in TB; there is no larger unit.', 'A single space separates the number and the unit.'],
    starterCode: 'function formatBytes(bytes) {\n  // Your code here\n}\n',
    tests: [
      { name: 'small values stay in bytes', body: 'expect(formatBytes(512)).toBe("512 B");' },
      { name: 'zero is zero bytes', body: 'expect(formatBytes(0)).toBe("0 B");' },
      { name: 'exactly one kilobyte', body: 'expect(formatBytes(1024)).toBe("1 KB");' },
      { name: 'drops a trailing .0', body: 'expect(formatBytes(2048)).toBe("2 KB");' },
      { name: 'keeps a real fraction', body: 'expect(formatBytes(1536)).toBe("1.5 KB");' },
      { name: 'stays in bytes just below the boundary', body: 'expect(formatBytes(1023)).toBe("1023 B");' },
      { name: 'megabytes', body: 'expect(formatBytes(1048576)).toBe("1 MB");' },
      { name: 'rounds to one place', body: 'expect(formatBytes(1258291)).toBe("1.2 MB");' },
      { name: 'gigabytes', body: 'expect(formatBytes(5368709120)).toBe("5 GB");' },
      { name: 'does not run past terabytes', body: 'expect(formatBytes(1024 ** 5)).toBe("1024 TB");', hidden: true },
    ],
    hints: [
      'Divide by 1024 repeatedly while the value is still at least 1024 — and stop when you reach the last unit, or you will index past the end of your unit list.',
      '`toFixed(1)` gives you the one decimal place. Turning it back into a `Number` is what drops a trailing `.0`, since `Number("2.0")` is `2`.',
      'The bytes unit is a special case: it never gets a decimal place at all.',
    ],
    solution:
      'function formatBytes(bytes) {\n' +
      '  const units = ["B", "KB", "MB", "GB", "TB"];\n' +
      '  let value = bytes;\n' +
      '  let unit = 0;\n' +
      '  while (value >= 1024 && unit < units.length - 1) {\n' +
      '    value /= 1024;\n' +
      '    unit += 1;\n' +
      '  }\n' +
      '  const shown = unit === 0 ? value : Number(value.toFixed(1));\n' +
      '  return shown + " " + units[unit];\n' +
      '}\n',
    solutionExplanation:
      'The loop has two exit conditions and both matter: it stops when the value is small enough for the current unit, *and* when there is no larger unit left — without the second, a petabyte-sized input would index past the array and produce `"undefined"`. Rounding through `Number(value.toFixed(1))` handles the trailing-zero rule by accident of how numbers stringify: `toFixed` gives `"2.0"`, `Number` makes it `2`, and concatenation renders it `"2"`. Bytes skip the rounding entirely, since a fractional byte is meaningless.',
  },

  {
    id: 'ch-fund-roman-to-int',
    slug: 'reading-roman-numerals',
    title: 'Reading Roman Numerals',
    difficulty: DIFFICULTY.EASY,
    category: CATEGORY,
    topicIds: ['strings', 'loops', 'objects'],
    xp: XP[DIFFICULTY.EASY],
    prompt:
      'Roman numerals are normally written largest to smallest and added up — `XVI` is 16. The exception is subtractive pairs: when a smaller symbol sits directly before a larger one, it is subtracted instead, so `IV` is 4 and `CM` is 900. Write `romanToInt(roman)` returning the number for a valid uppercase numeral.',
    examples: ['romanToInt("XVI");     // 16\nromanToInt("IV");      // 4\nromanToInt("MCMXCIV"); // 1994'],
    constraints: ['The input is a valid numeral from I to MMMCMXCIX (1–3999).', 'Symbols are I, V, X, L, C, D, M — always uppercase.'],
    starterCode: 'function romanToInt(roman) {\n  // Your code here\n}\n',
    tests: [
      { name: 'a single symbol', body: 'expect(romanToInt("I")).toBe(1);' },
      { name: 'plain addition', body: 'expect(romanToInt("XVI")).toBe(16);' },
      { name: 'a subtractive pair', body: 'expect(romanToInt("IV")).toBe(4);' },
      { name: 'nine', body: 'expect(romanToInt("IX")).toBe(9);' },
      { name: 'forty', body: 'expect(romanToInt("XL")).toBe(40);' },
      { name: 'ninety-nine', body: 'expect(romanToInt("XCIX")).toBe(99);' },
      { name: 'a full year', body: 'expect(romanToInt("MCMXCIV")).toBe(1994);' },
      { name: 'repeated symbols', body: 'expect(romanToInt("MMM")).toBe(3000);' },
      { name: 'the largest valid numeral', body: 'expect(romanToInt("MMMCMXCIX")).toBe(3999);', hidden: true },
      { name: 'four hundred', body: 'expect(romanToInt("CD")).toBe(400);', hidden: true },
    ],
    hints: [
      'Map each symbol to its value once, up front, rather than writing a chain of comparisons inside the loop.',
      'At each position, compare the current symbol to the one after it. If the current one is smaller, it is being subtracted.',
      'Subtracting instead of adding is a sign change, not a special case — you can write both branches as one running total with the sign decided beforehand.',
    ],
    solution:
      'function romanToInt(roman) {\n' +
      '  const values = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };\n' +
      '  let total = 0;\n' +
      '  for (let i = 0; i < roman.length; i += 1) {\n' +
      '    const current = values[roman[i]];\n' +
      '    const next = values[roman[i + 1]];\n' +
      '    if (next !== undefined && current < next) total -= current;\n' +
      '    else total += current;\n' +
      '  }\n' +
      '  return total;\n' +
      '}\n',
    solutionExplanation:
      'Reading left to right, a symbol is subtracted exactly when the symbol after it is larger — that single comparison covers all six subtractive pairs (IV, IX, XL, XC, CD, CM) without listing any of them. On the final character `roman[i + 1]` is `undefined`, so the lookup yields `undefined` and the guard sends it down the addition branch. Note that `MCMXCIV` never needs to be split into chunks: M adds 1000, C subtracts 100, M adds 1000, X subtracts 10, C adds 100, I subtracts 1, V adds 5.',
  },

  {
    id: 'ch-fund-int-to-roman',
    slug: 'writing-roman-numerals',
    title: 'Writing Roman Numerals',
    difficulty: DIFFICULTY.MEDIUM,
    category: CATEGORY,
    topicIds: ['numbers', 'loops', 'arrays'],
    xp: XP[DIFFICULTY.MEDIUM],
    prompt:
      'Write `intToRoman(n)` producing the standard Roman numeral for a number from 1 to 3999. Standard form uses the subtractive pairs — 4 is `IV`, not `IIII`, and 900 is `CM`, not `DCCCC` — and never repeats a symbol more than three times in a row.',
    examples: ['intToRoman(16);   // "XVI"\nintToRoman(4);    // "IV"\nintToRoman(1994); // "MCMXCIV"'],
    constraints: ['`n` is an integer from 1 to 3999.', 'Output is uppercase.'],
    starterCode: 'function intToRoman(n) {\n  // Your code here\n}\n',
    tests: [
      { name: 'one', body: 'expect(intToRoman(1)).toBe("I");' },
      { name: 'plain addition', body: 'expect(intToRoman(16)).toBe("XVI");' },
      { name: 'uses the subtractive four', body: 'expect(intToRoman(4)).toBe("IV");' },
      { name: 'uses the subtractive nine', body: 'expect(intToRoman(9)).toBe("IX");' },
      { name: 'never writes four in a row', body: 'expect(intToRoman(40)).toBe("XL");' },
      { name: 'nine hundred', body: 'expect(intToRoman(900)).toBe("CM");' },
      { name: 'a full year', body: 'expect(intToRoman(1994)).toBe("MCMXCIV");' },
      { name: 'three thousand', body: 'expect(intToRoman(3000)).toBe("MMM");' },
      { name: 'the largest input', body: 'expect(intToRoman(3999)).toBe("MMMCMXCIX");', hidden: true },
      {
        name: 'every value round-trips back to itself',
        body:
          'const v = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };\n' +
          'for (let i = 1; i <= 3999; i += 7) {\n' +
          '  const s = intToRoman(i);\n' +
          '  let t = 0;\n' +
          '  for (let j = 0; j < s.length; j += 1) {\n' +
          '    t += v[s[j]] < v[s[j + 1]] ? -v[s[j]] : v[s[j]];\n' +
          '  }\n' +
          '  expect(t).toBe(i);\n' +
          '}',
        hidden: true,
      },
    ],
    hints: [
      'The subtractive pairs are much easier to handle if you treat them as denominations in their own right rather than as exceptions applied afterwards.',
      'Build a list of value/symbol pairs sorted largest to smallest, including 900/CM, 400/CD, 90/XC, 40/XL, 9/IX and 4/IV alongside the plain symbols.',
      'Then it is the same greedy loop as making change: take the largest value that still fits, append its symbol, subtract, repeat.',
    ],
    solution:
      'function intToRoman(n) {\n' +
      '  const table = [\n' +
      '    [1000, "M"], [900, "CM"], [500, "D"], [400, "CD"],\n' +
      '    [100, "C"], [90, "XC"], [50, "L"], [40, "XL"],\n' +
      '    [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"],\n' +
      '  ];\n' +
      '  let left = n;\n' +
      '  let out = "";\n' +
      '  for (const [value, symbol] of table) {\n' +
      '    while (left >= value) {\n' +
      '      out += symbol;\n' +
      '      left -= value;\n' +
      '    }\n' +
      '  }\n' +
      '  return out;\n' +
      '}\n',
    solutionExplanation:
      'The insight is that "IV" is not an exception to the rules — it is simply a denomination worth 4. Once the six subtractive pairs sit in the table alongside the seven plain symbols, the whole problem collapses into the same greedy loop you would write for coin change, and the "never four in a row" rule holds automatically. The inner `while` rather than an `if` is what allows `MMM`.',
  },

  {
    id: 'ch-fund-gcd-lcm',
    slug: 'reducing-a-fraction',
    title: 'Reducing a Fraction',
    difficulty: DIFFICULTY.EASY,
    category: CATEGORY,
    topicIds: ['numbers', 'loops', 'arrays'],
    xp: XP[DIFFICULTY.EASY],
    prompt:
      'Write `reduceFraction(numerator, denominator)` returning the fraction in lowest terms as a two-element array `[numerator, denominator]`. Keep the sign on the numerator, so `[1, -2]` reduces to `[-1, 2]`. A numerator of 0 reduces to `[0, 1]`.',
    examples: ['reduceFraction(6, 8);    // [3, 4]\nreduceFraction(1, -2);   // [-1, 2]\nreduceFraction(0, 5);    // [0, 1]'],
    constraints: ['Both arguments are integers.', '`denominator` is never 0.', 'The denominator of the result is always positive.'],
    starterCode: 'function reduceFraction(numerator, denominator) {\n  // Your code here\n}\n',
    tests: [
      { name: 'reduces a common fraction', body: 'expect(reduceFraction(6, 8)).toEqual([3, 4]);' },
      { name: 'leaves an already-reduced fraction alone', body: 'expect(reduceFraction(3, 4)).toEqual([3, 4]);' },
      { name: 'reduces to a whole number over one', body: 'expect(reduceFraction(10, 5)).toEqual([2, 1]);' },
      { name: 'moves the sign to the numerator', body: 'expect(reduceFraction(1, -2)).toEqual([-1, 2]);' },
      { name: 'keeps a negative numerator negative', body: 'expect(reduceFraction(-6, 8)).toEqual([-3, 4]);' },
      { name: 'two negatives make a positive', body: 'expect(reduceFraction(-6, -8)).toEqual([3, 4]);' },
      { name: 'zero reduces to zero over one', body: 'expect(reduceFraction(0, 5)).toEqual([0, 1]);' },
      { name: 'handles coprime values', body: 'expect(reduceFraction(97, 89)).toEqual([97, 89]);' },
      { name: 'handles a large common factor', body: 'expect(reduceFraction(123456, 789012)).toEqual([10288, 65751]);', hidden: true },
    ],
    hints: [
      "Divide both parts by their greatest common divisor. Euclid's algorithm finds it: repeatedly replace the pair with the second number and the remainder of dividing the first by the second, until the second is 0.",
      'Work out the GCD on the absolute values — a negative GCD would flip signs unpredictably.',
      'Handle the sign as a separate, deliberate step at the end rather than hoping the division works it out.',
    ],
    solution:
      'function reduceFraction(numerator, denominator) {\n' +
      '  if (numerator === 0) return [0, 1];\n' +
      '  let a = Math.abs(numerator);\n' +
      '  let b = Math.abs(denominator);\n' +
      '  while (b !== 0) {\n' +
      '    const t = b;\n' +
      '    b = a % b;\n' +
      '    a = t;\n' +
      '  }\n' +
      '  const sign = numerator * denominator < 0 ? -1 : 1;\n' +
      '  return [sign * (Math.abs(numerator) / a), Math.abs(denominator) / a];\n' +
      '}\n',
    solutionExplanation:
      "Euclid's algorithm is the loop in the middle: each pass replaces the pair `(a, b)` with `(b, a % b)`, and because the remainder shrinks every time it terminates in a handful of steps even for six-digit inputs. Running it on absolute values keeps the divisor positive, and the sign is then reapplied once, deliberately, to the numerator. The zero guard comes first because the GCD of 0 and anything is that other number, which would leave `[0, 1]` correct by luck rather than by design.",
  },

  {
    id: 'ch-fund-grade-bands',
    slug: 'grade-bands',
    title: 'Grade Bands',
    difficulty: DIFFICULTY.BEGINNER,
    category: CATEGORY,
    topicIds: ['control-flow', 'numbers', 'errors'],
    xp: XP[DIFFICULTY.BEGINNER],
    prompt:
      'Write `gradeFor(score)` mapping a percentage to a letter: 90 and above is `"A"`, 80–89 is `"B"`, 70–79 is `"C"`, 60–69 is `"D"`, below 60 is `"F"`. Boundaries are inclusive at the bottom of each band — exactly 90 is an A. A score outside 0–100 is not a percentage at all: throw a `RangeError` for it.',
    examples: ['gradeFor(90);   // "A"\ngradeFor(89.9); // "B"\ngradeFor(101);  // throws RangeError'],
    constraints: ['`score` may be fractional.', 'The thrown error must be a `RangeError`.'],
    starterCode: 'function gradeFor(score) {\n  // Your code here\n}\n',
    tests: [
      { name: 'a clear A', body: 'expect(gradeFor(95)).toBe("A");' },
      { name: 'the A boundary is inclusive', body: 'expect(gradeFor(90)).toBe("A");' },
      { name: 'just below the A boundary', body: 'expect(gradeFor(89.9)).toBe("B");' },
      { name: 'a C', body: 'expect(gradeFor(70)).toBe("C");' },
      { name: 'a D', body: 'expect(gradeFor(60)).toBe("D");' },
      { name: 'an F', body: 'expect(gradeFor(59.9)).toBe("F");' },
      { name: 'zero is still a valid score', body: 'expect(gradeFor(0)).toBe("F");' },
      { name: 'one hundred is still a valid score', body: 'expect(gradeFor(100)).toBe("A");' },
      { name: 'rejects scores above one hundred', body: 'expect(() => gradeFor(101)).toThrow(RangeError);' },
      { name: 'rejects negative scores', body: 'expect(() => gradeFor(-1)).toThrow(RangeError);', hidden: true },
    ],
    hints: [
      'Validate before you classify. Once you know the score is in range, the bands can assume it.',
      'If you check the bands from highest to lowest, each check only needs a lower bound — reaching the 80 test already means the score is under 90.',
      'Watch the shape of your range guard. `score >= 0 || score <= 100` is true for every number ever.',
    ],
    solution:
      'function gradeFor(score) {\n' +
      '  if (score < 0 || score > 100) {\n' +
      '    throw new RangeError("score must be between 0 and 100, got " + score);\n' +
      '  }\n' +
      '  if (score >= 90) return "A";\n' +
      '  if (score >= 80) return "B";\n' +
      '  if (score >= 70) return "C";\n' +
      '  if (score >= 60) return "D";\n' +
      '  return "F";\n' +
      '}\n',
    solutionExplanation:
      'Checking the bands top-down means each condition needs only one comparison: if the `>= 90` test failed, the score is already known to be under 90, so `>= 80` is a complete description of the B band. Writing them bottom-up would need two comparisons each. The range guard runs first and throws `RangeError` specifically — the built-in type that exists for exactly this situation — and includes the offending value in the message, which is what turns a bug report into a diagnosis.',
  },

  {
    id: 'ch-fund-postfix',
    slug: 'postfix-calculator',
    title: 'Postfix Calculator',
    difficulty: DIFFICULTY.MEDIUM,
    category: CATEGORY,
    topicIds: ['arrays', 'data-structures', 'errors'],
    xp: XP[DIFFICULTY.MEDIUM],
    prompt:
      'In postfix notation the operator comes after its operands, so `3 4 +` is 7 and `5 1 2 + 4 * + 3 -` is 14. There are no parentheses and no precedence rules to apply. Write `evaluatePostfix(tokens)` taking an array of strings and returning the result. Support `+`, `-`, `*` and `/`, where division is real division rather than integer division. Throw a `SyntaxError` if the expression is malformed — too few operands for an operator, or more than one value left at the end.',
    examples: [
      'evaluatePostfix(["3", "4", "+"]);  // 7',
      'evaluatePostfix(["5", "1", "2", "+", "4", "*", "+", "3", "-"]);  // 14',
      'evaluatePostfix(["3", "+"]);  // throws SyntaxError',
    ],
    constraints: ['Tokens are numeric strings or one of `+ - * /`.', 'Numbers may be negative, e.g. `"-4"`.', 'Operators are binary and take the two most recent values, in order.'],
    starterCode: 'function evaluatePostfix(tokens) {\n  // Your code here\n}\n',
    tests: [
      { name: 'a single addition', body: 'expect(evaluatePostfix(["3", "4", "+"])).toBe(7);' },
      { name: 'a lone number', body: 'expect(evaluatePostfix(["42"])).toBe(42);' },
      { name: 'subtraction respects operand order', body: 'expect(evaluatePostfix(["10", "3", "-"])).toBe(7);' },
      { name: 'division respects operand order', body: 'expect(evaluatePostfix(["10", "4", "/"])).toBe(2.5);' },
      { name: 'a nested expression', body: 'expect(evaluatePostfix(["5", "1", "2", "+", "4", "*", "+", "3", "-"])).toBe(14);' },
      { name: 'handles negative literals', body: 'expect(evaluatePostfix(["-4", "2", "*"])).toBe(-8);' },
      { name: 'chained operators', body: 'expect(evaluatePostfix(["2", "3", "*", "4", "5", "*", "+"])).toBe(26);' },
      { name: 'rejects too few operands', body: 'expect(() => evaluatePostfix(["3", "+"])).toThrow(SyntaxError);' },
      { name: 'rejects leftover operands', body: 'expect(() => evaluatePostfix(["1", "2", "3", "+"])).toThrow(SyntaxError);', hidden: true },
      { name: 'rejects an empty expression', body: 'expect(() => evaluatePostfix([])).toThrow(SyntaxError);', hidden: true },
    ],
    hints: [
      'A stack is the whole algorithm. Push numbers as you meet them; when you meet an operator, pop two values, combine them, push the result back.',
      'Order matters for `-` and `/`. The value popped *second* is the left operand, because it was pushed first.',
      'A well-formed expression finishes with exactly one value on the stack. Anything else — zero, or two — is a syntax error.',
    ],
    solution:
      'function evaluatePostfix(tokens) {\n' +
      '  const ops = {\n' +
      '    "+": (a, b) => a + b,\n' +
      '    "-": (a, b) => a - b,\n' +
      '    "*": (a, b) => a * b,\n' +
      '    "/": (a, b) => a / b,\n' +
      '  };\n' +
      '  const stack = [];\n' +
      '  for (const token of tokens) {\n' +
      '    const op = ops[token];\n' +
      '    if (op === undefined) {\n' +
      '      stack.push(Number(token));\n' +
      '      continue;\n' +
      '    }\n' +
      '    if (stack.length < 2) throw new SyntaxError("not enough operands for " + token);\n' +
      '    const right = stack.pop();\n' +
      '    const left = stack.pop();\n' +
      '    stack.push(op(left, right));\n' +
      '  }\n' +
      '  if (stack.length !== 1) throw new SyntaxError("malformed expression");\n' +
      '  return stack[0];\n' +
      '}\n',
    solutionExplanation:
      'Postfix needs no precedence table and no parentheses because the order of the tokens already encodes the grouping — which is exactly why it is what calculators and virtual machines evaluate internally. The two pops are deliberately named `right` and `left`: the second pop yields the operand that was pushed first, and getting that backwards makes `+` and `*` look fine while quietly breaking `-` and `/`. The final length check catches leftover operands, which is the failure mode a naive `return stack.pop()` would hide.',
  },

  {
    id: 'ch-fund-base-convert',
    slug: 'base-conversion',
    title: 'Base Conversion',
    difficulty: DIFFICULTY.MEDIUM,
    category: CATEGORY,
    topicIds: ['numbers', 'strings', 'loops'],
    xp: XP[DIFFICULTY.MEDIUM],
    prompt:
      'Write `convertBase(digits, fromBase, toBase)` converting a non-negative number written as a string in one base into the same number written in another. Bases run from 2 to 36, using the digits `0`–`9` then `a`–`z`. Input may be in any letter case; output must be lowercase.',
    examples: ['convertBase("ff", 16, 2);   // "11111111"\nconvertBase("255", 10, 16); // "ff"\nconvertBase("0", 10, 2);    // "0"'],
    constraints: ['`digits` represents a value that fits in a safe integer.', 'Both bases are integers from 2 to 36.', 'The input never has a leading sign.'],
    starterCode: 'function convertBase(digits, fromBase, toBase) {\n  // Your code here\n}\n',
    tests: [
      { name: 'hex to binary', body: 'expect(convertBase("ff", 16, 2)).toBe("11111111");' },
      { name: 'decimal to hex', body: 'expect(convertBase("255", 10, 16)).toBe("ff");' },
      { name: 'zero survives', body: 'expect(convertBase("0", 10, 2)).toBe("0");' },
      { name: 'accepts uppercase input', body: 'expect(convertBase("FF", 16, 10)).toBe("255");' },
      { name: 'emits lowercase output', body: 'expect(convertBase("255", 10, 36)).toBe("73");' },
      { name: 'binary to decimal', body: 'expect(convertBase("1010", 2, 10)).toBe("10");' },
      { name: 'same base round-trips', body: 'expect(convertBase("1234", 10, 10)).toBe("1234");' },
      { name: 'base 36 both ways', body: 'expect(convertBase("zz", 36, 10)).toBe("1295");' },
      { name: 'a large value', body: 'expect(convertBase("9007199254740991", 10, 16)).toBe("1fffffffffffff");', hidden: true },
      { name: 'strips a leading zero', body: 'expect(convertBase("0010", 2, 10)).toBe("2");', hidden: true },
    ],
    hints: [
      'Do it in two stages: string in base N to a plain number, then that number back to a string in base M. Do not try to convert digit by digit between arbitrary bases.',
      'JavaScript has built-ins for both directions. Look at what the second argument to `parseInt` does, and what argument `Number.prototype.toString` accepts.',
      'Casing: normalise the input on the way in, and check what case the built-in produces on the way out.',
    ],
    solution:
      'function convertBase(digits, fromBase, toBase) {\n' +
      '  const value = parseInt(digits, fromBase);\n' +
      '  return value.toString(toBase);\n' +
      '}\n',
    solutionExplanation:
      'Both halves already exist in the language. `parseInt(digits, fromBase)` reads a string in any base from 2 to 36, accepting either letter case, and `Number.prototype.toString(toBase)` writes one back out — always in lowercase, which is why no manual casing is needed in either direction. Routing through a plain number is also what makes the leading-zero case fall out for free: `"0010"` parses to 2, and 2 has only one representation. The safe-integer constraint is the real limit here — beyond 2^53 the intermediate number stops being exact and a `BigInt` version would be needed.',
  },

  {
    id: 'ch-fund-truthiness',
    slug: 'counting-truthy-values',
    title: 'Counting Truthy Values',
    difficulty: DIFFICULTY.BEGINNER,
    category: CATEGORY,
    topicIds: ['booleans', 'coercion', 'array-methods'],
    xp: XP[DIFFICULTY.BEGINNER],
    prompt:
      'Write `countTruthy(values)` returning how many entries in the array are truthy. The point is knowing which values JavaScript treats as falsy without looking them up — an empty array and an empty object are both truthy, `"0"` is truthy, and `NaN` is not.',
    examples: ['countTruthy([1, 0, "a", "", null]);  // 2\ncountTruthy([[], {}, "0"]);          // 3'],
    constraints: ['The array may hold values of any type.', 'Return a number.'],
    starterCode: 'function countTruthy(values) {\n  // Your code here\n}\n',
    tests: [
      { name: 'counts a simple mix', body: 'expect(countTruthy([1, 0, "a", "", null])).toBe(2);' },
      { name: 'an empty array counts as zero', body: 'expect(countTruthy([])).toBe(0);' },
      { name: 'empty collections are truthy', body: 'expect(countTruthy([[], {}])).toBe(2);' },
      { name: 'the string zero is truthy', body: 'expect(countTruthy(["0"])).toBe(1);' },
      { name: 'the string false is truthy', body: 'expect(countTruthy(["false"])).toBe(1);' },
      { name: 'NaN is falsy', body: 'expect(countTruthy([NaN])).toBe(0);' },
      { name: 'undefined is falsy', body: 'expect(countTruthy([undefined, null])).toBe(0);' },
      { name: 'negative numbers are truthy but negative zero is not', body: 'expect(countTruthy([-1, -0])).toBe(1);' },
      { name: 'all seven falsy values', body: 'expect(countTruthy([false, 0, -0, "", null, undefined, NaN])).toBe(0);', hidden: true },
      { name: 'whitespace is a non-empty string', body: 'expect(countTruthy([" "])).toBe(1);', hidden: true },
    ],
    hints: [
      'You do not need to list the falsy values. JavaScript already knows them — use a value directly in a boolean position and it converts itself.',
      '`filter` with a callback that just returns its argument keeps exactly the truthy entries. `Boolean` works as that callback.',
      'Resist writing comparisons like `v !== null && v !== ""`. Enumerating the falsy list by hand is how `NaN` and `-0` get missed.',
    ],
    solution:
      'function countTruthy(values) {\n' +
      '  return values.filter(Boolean).length;\n' +
      '}\n',
    solutionExplanation:
      '`filter(Boolean)` works because `Boolean` used as a function performs exactly the conversion `filter` needs from its callback, so the falsy list never has to be written down. That matters: there are exactly seven falsy values — `false`, `0`, `-0`, `""`, `null`, `undefined` and `NaN` (plus `0n` once BigInt is in play) — and hand-written checks reliably miss `NaN` and `-0`. Everything else is truthy, including `[]`, `{}`, `"0"`, `"false"` and `" "`, all of which surprise people who expect emptiness to mean falsy.',
  },

  {
    id: 'ch-fund-number-words',
    slug: 'numbers-in-words',
    title: 'Numbers in Words',
    difficulty: DIFFICULTY.MEDIUM,
    category: CATEGORY,
    topicIds: ['numbers', 'strings', 'control-flow'],
    xp: XP[DIFFICULTY.MEDIUM],
    prompt:
      'Write `numberToWords(n)` spelling out an integer from 0 to 999 in lowercase English. The teens are irregular and cannot be built from parts — 13 is `"thirteen"`, not `"ten three"`. Tens and units are joined with a hyphen (`"forty-two"`), and a hundreds part is joined to the rest with `" and "` (`"three hundred and five"`).',
    examples: ['numberToWords(0);   // "zero"\nnumberToWords(42);  // "forty-two"\nnumberToWords(305); // "three hundred and five"\nnumberToWords(700); // "seven hundred"'],
    constraints: ['`n` is an integer from 0 to 999.', 'Output is lowercase with no leading or trailing spaces.'],
    starterCode: 'function numberToWords(n) {\n  // Your code here\n}\n',
    tests: [
      { name: 'zero', body: 'expect(numberToWords(0)).toBe("zero");' },
      { name: 'a single digit', body: 'expect(numberToWords(7)).toBe("seven");' },
      { name: 'an irregular teen', body: 'expect(numberToWords(13)).toBe("thirteen");' },
      { name: 'ten and eleven', body: 'expect(numberToWords(10)).toBe("ten"); expect(numberToWords(11)).toBe("eleven");' },
      { name: 'a round ten', body: 'expect(numberToWords(20)).toBe("twenty");' },
      { name: 'hyphenates tens and units', body: 'expect(numberToWords(42)).toBe("forty-two");' },
      { name: 'a round hundred has no trailing and', body: 'expect(numberToWords(700)).toBe("seven hundred");' },
      { name: 'joins hundreds to units with and', body: 'expect(numberToWords(305)).toBe("three hundred and five");' },
      { name: 'joins hundreds to a hyphenated part', body: 'expect(numberToWords(999)).toBe("nine hundred and ninety-nine");' },
      { name: 'joins hundreds to a teen', body: 'expect(numberToWords(115)).toBe("one hundred and fifteen");', hidden: true },
      { name: 'nineteen is a teen, not ten-nine', body: 'expect(numberToWords(19)).toBe("nineteen");', hidden: true },
    ],
    hints: [
      'Everything below 20 is irregular. Store those twenty words in a lookup array rather than trying to derive them.',
      'From 20 upward the pattern is regular: a tens word, optionally a hyphen and a units word.',
      'Handle the hundreds digit separately, then join it to the remainder — but only add `" and "` when there actually is a remainder.',
    ],
    solution:
      'function numberToWords(n) {\n' +
      '  const small = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine",\n' +
      '    "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"];\n' +
      '  const tens = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];\n' +
      '\n' +
      '  function below100(value) {\n' +
      '    if (value < 20) return small[value];\n' +
      '    const ten = tens[Math.floor(value / 10)];\n' +
      '    const unit = value % 10;\n' +
      '    return unit === 0 ? ten : ten + "-" + small[unit];\n' +
      '  }\n' +
      '\n' +
      '  if (n < 100) return below100(n);\n' +
      '  const hundreds = small[Math.floor(n / 100)] + " hundred";\n' +
      '  const rest = n % 100;\n' +
      '  return rest === 0 ? hundreds : hundreds + " and " + below100(rest);\n' +
      '}\n',
    solutionExplanation:
      'English is regular above 20 and irregular below it, so the solution splits exactly along that line: a twenty-entry lookup for the irregular part, and composition for everything else. Extracting `below100` as a helper is what keeps the hundreds branch short — it reuses the same logic rather than repeating the teens handling. The two "only if non-zero" checks (the hyphen and the `" and "`) are the entire difference between `"seven hundred"` and a wrong `"seven hundred and zero"`.',
  },

  {
    id: 'ch-fund-clamp-scale',
    slug: 'rescaling-a-value',
    title: 'Rescaling a Value',
    difficulty: DIFFICULTY.EASY,
    category: CATEGORY,
    topicIds: ['numbers', 'functions', 'errors'],
    xp: XP[DIFFICULTY.EASY],
    prompt:
      'Write `rescale(value, fromMin, fromMax, toMin, toMax)` mapping a value linearly from one range onto another, the way a slider position becomes a volume level. A value at the bottom of the source range lands at the bottom of the target range. Values outside the source range map outside the target range — do not clamp them. A source range of zero width has no unique answer: throw a `RangeError`.',
    examples: [
      'rescale(5, 0, 10, 0, 100);      // 50',
      'rescale(0, 0, 10, 32, 212);     // 32',
      'rescale(2, 0, 10, 100, 0);      // 80   (target range reversed)',
    ],
    constraints: ['All five arguments are finite numbers.', 'Either range may run downward.', 'Do not clamp the result.'],
    starterCode: 'function rescale(value, fromMin, fromMax, toMin, toMax) {\n  // Your code here\n}\n',
    tests: [
      { name: 'maps the midpoint', body: 'expect(rescale(5, 0, 10, 0, 100)).toBe(50);' },
      { name: 'maps the lower bound', body: 'expect(rescale(0, 0, 10, 32, 212)).toBe(32);' },
      { name: 'maps the upper bound', body: 'expect(rescale(10, 0, 10, 32, 212)).toBe(212);' },
      { name: 'handles a shifted source range', body: 'expect(rescale(15, 10, 20, 0, 1)).toBe(0.5);' },
      { name: 'a reversed target range still maps the midpoint', body: 'expect(rescale(5, 0, 10, 100, 0)).toBe(50);' },
      { name: 'a reversed target actually reverses', body: 'expect(rescale(2, 0, 10, 100, 0)).toBe(80);' },
      { name: 'does not clamp above the range', body: 'expect(rescale(20, 0, 10, 0, 100)).toBe(200);' },
      { name: 'does not clamp below the range', body: 'expect(rescale(-5, 0, 10, 0, 100)).toBe(-50);' },
      { name: 'rejects a zero-width source range', body: 'expect(() => rescale(5, 3, 3, 0, 100)).toThrow(RangeError);' },
      { name: 'converts a real temperature', body: 'expect(rescale(37, 0, 100, 32, 212)).toBeCloseTo(98.6, 6);', hidden: true },
    ],
    hints: [
      'Find where the value sits in the source range as a fraction from 0 to 1, then apply that fraction to the target range.',
      'That fraction is `(value - fromMin) / (fromMax - fromMin)`. Notice that its denominator is exactly the thing the error case is about.',
      'A reversed target range needs no special handling — if `toMax - toMin` is negative the arithmetic already runs backwards.',
    ],
    solution:
      'function rescale(value, fromMin, fromMax, toMin, toMax) {\n' +
      '  const span = fromMax - fromMin;\n' +
      '  if (span === 0) throw new RangeError("source range has zero width");\n' +
      '  const ratio = (value - fromMin) / span;\n' +
      '  return toMin + ratio * (toMax - toMin);\n' +
      '}\n',
    solutionExplanation:
      'Normalising to a 0-to-1 ratio first is what makes the rest trivial: the two ranges never have to be compared to each other, only each to itself. A reversed target range needs no branch because `toMax - toMin` simply comes out negative and the multiplication runs the other way — the test mapping 2 to 80 confirms it. The zero-width guard is not defensive noise: with `fromMin === fromMax` the division is 0/0, which yields `NaN` rather than throwing, and a silent `NaN` propagates far from where it started.',
  },
];

export default challenges;
