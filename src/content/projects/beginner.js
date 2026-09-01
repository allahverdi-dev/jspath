import { DIFFICULTY } from '../schema/types.js';

/**
 * Beginner projects — the first bridge from "I understand lessons" to
 * "I can build something." Each one is small enough to finish in a sitting,
 * but every one still requires state, not just a single function: a counter
 * that only increments teaches nothing a lesson didn't already show.
 */

export const projects = [
  {
    id: 'pr-counter-app',
    slug: 'counter-app',
    title: 'Counter App',
    difficulty: DIFFICULTY.BEGINNER,
    tagline: 'A counter with more than one button — increment, decrement, reset, and a configurable step.',
    brief:
      'Build a counter that does more than count. Increment and decrement by a step the user can change, ' +
      'reset back to a real starting value, and show at a glance whether the count is positive, negative or ' +
      'zero. It looks small, but wiring several controls to one piece of state without duplicating logic is ' +
      'the actual skill this project teaches.',
    estimatedHours: '0.5–1',
    topicIds: ['dom', 'dom-manipulation', 'events', 'functions', 'control-flow'],
    prerequisites: [
      'Comfortable selecting elements with `querySelector` and reading/writing `textContent`.',
      'Can attach a `click` listener and update the page in response.',
    ],
    relatedLessons: ['l-m17-01', 'l-m19-01'],
    relatedChallenges: ['ch-fn-private-state', 'ch-beg-toggle'],
    objectives: [
      'Keep a single source of truth for the count in a JavaScript variable, and treat the DOM as a reflection of that value rather than storing state in the page itself.',
      'Wire up several buttons to the same piece of state without duplicating logic between them.',
      'Practise input validation on a text field that controls behaviour, not just decoration.',
    ],
    requirements: [
      'A number is displayed on the page, starting at 0.',
      'An **increment** button raises the count; a **decrement** button lowers it.',
      'A **reset** button returns the count to 0.',
      'A step control (a number input or a small set of buttons) lets the user change how much each click adds or subtracts — default step is 1.',
      'The displayed count visually distinguishes positive, negative and zero (for example, a colour or a class change) without changing the layout.',
      'Decrementing below zero is allowed and displays correctly as a negative number.',
    ],
    milestones: [
      {
        id: 'm1',
        title: 'Render the initial state',
        description: 'Get a count of 0 on the screen before any button does anything.',
        tasks: [
          'Build the HTML: a display element, an increment button, a decrement button, a reset button.',
          'Store the count in a `let count = 0` variable and write one `render()` function that sets `textContent` from it.',
          'Call `render()` once on load and confirm the display matches the variable.',
        ],
      },
      {
        id: 'm2',
        title: 'Increment and decrement',
        description: 'Wire the two buttons that change the count by the current step.',
        tasks: [
          'Add click listeners to both buttons.',
          'Each listener changes `count` by the step amount and calls `render()` — do not update `textContent` directly inside the listener.',
          'Confirm rapid clicking keeps the display and the variable in sync.',
        ],
      },
      {
        id: 'm3',
        title: 'Reset',
        description: 'Add the third button and confirm it returns to the true starting value, not just zero.',
        tasks: [
          'Wire the reset button to set `count` back to its initial value and re-render.',
          'Decide deliberately: does reset also reset the step back to 1? Pick an answer and be consistent.',
        ],
      },
      {
        id: 'm4',
        title: 'Configurable step',
        description: 'Let the user change how much each click is worth.',
        tasks: [
          'Add a number input (or +/- step buttons) bound to a `step` variable, separate from `count`.',
          'Validate the step: reject zero, reject negative values, reject non-numeric input — decide what happens on an invalid entry rather than letting it silently break.',
          'Confirm increment and decrement both read the *current* step, including after it changes mid-session.',
        ],
      },
      {
        id: 'm5',
        title: 'Visual state',
        description: 'Make positive, negative and zero visually distinct.',
        tasks: [
          'Toggle a class on the display element based on the sign of `count`.',
          'Style all three states so the difference is visible without reading the number.',
        ],
      },
    ],
    hints: [
      'Reaching for one `render()` function that every action calls, rather than updating `textContent` from four different places, is what keeps this from turning into a debugging chore once the step control exists.',
      'The step and the count are two different pieces of state. Keeping them in two separate variables — rather than trying to derive one from the other — is what makes "does reset touch the step" a decision you make on purpose.',
      'For step validation, decide what "invalid" means before writing the code: is `0` invalid, is a negative number invalid, is `"abc"` invalid? Write down the rule, then implement exactly that rule.',
    ],
    stretchGoals: [
      'Keyboard support: `ArrowUp`/`ArrowDown` change the count, with focus visibly on the counter.',
      'Persist the count and step to `localStorage` so a reload does not lose progress.',
      'A small history log of the last five actions taken (`+5`, `-1`, `reset`).',
      'A maximum and minimum bound, configurable, with the buttons disabling at the edges.',
    ],
    completionCriteria: [
      'Increment, decrement and reset all work and stay in sync with the displayed number.',
      'The step control changes how much each click is worth, and rejects at least zero and negative input.',
      'The display looks different at positive, negative and zero without changing size or layout.',
      'No console errors on load or after rapid, repeated clicking.',
    ],
    testingChecklist: [
      'Click increment and decrement rapidly — the display never lags behind or skips a value.',
      'Set the step to a decimal, to `0`, to a negative number, and to letters — confirm each is handled deliberately, not silently ignored.',
      'Decrement well below zero and confirm the negative display state is correct.',
      'Reset after changing the step — confirm your chosen behaviour actually happens.',
    ],
    reflectionQuestions: [
      'Why does keeping `count` in a variable, rather than reading it back out of `textContent` on every click, matter once the step control exists?',
      'What would break first if you added a second counter to the same page using the same variable names?',
    ],
  },

  {
    id: 'pr-random-color-generator',
    slug: 'random-color-generator',
    title: 'Random Color Generator',
    difficulty: DIFFICULTY.BEGINNER,
    tagline: 'Generate, display and copy random hex colors — with a history you can click back through.',
    brief:
      'Generate a random color, apply it as a background, show its hex code, and let the user copy it in one ' +
      'click. The interesting part is not `Math.random()` — it is formatting the result into a valid six-digit ' +
      'hex code every time, including the zero-padding case a naive version misses, and keeping a small ' +
      'history the user can revisit.',
    estimatedHours: '0.5–1.5',
    topicIds: ['dom', 'dom-manipulation', 'events', 'strings', 'numbers'],
    prerequisites: [
      'Comfortable with template literals and basic string formatting.',
      'Knows `Math.random()` and can turn it into an integer in a range.',
    ],
    relatedLessons: ['l-m06-01', 'l-m18-01'],
    relatedChallenges: ['ch-fund-round-to'],
    objectives: [
      'Convert a random number into a correctly formatted hex color string, handling the zero-padding edge case that a naive implementation misses.',
      'Update both the page background and a text readout from a single generated value, without generating the color twice.',
      'Keep a bounded history of past results and let the user revisit one.',
    ],
    requirements: [
      'A **Generate** button produces a random hex color and applies it as the page (or a panel\'s) background.',
      'The hex code is displayed as readable text, e.g. `#3fae12`.',
      'A **copy** control copies the current hex code to the clipboard, with visible confirmation that it worked.',
      'The last 8 generated colors are shown as a history strip; clicking one re-applies it.',
      'Generated colors are always valid six-digit hex codes — no `#3fae1` or `#3fae1g`.',
    ],
    milestones: [
      {
        id: 'm1',
        title: 'Generate a valid hex color',
        tasks: [
          'Write a function that produces a random integer from 0 to 255 for each of red, green and blue.',
          'Convert each channel to a two-digit hex string, padding a single digit with a leading zero.',
          'Combine the three channels into one `#rrggbb` string and log it to confirm it is always six digits after the `#`.',
        ],
      },
      {
        id: 'm2',
        title: 'Apply and display',
        description: 'One button press should update the background and the text from the same value.',
        tasks: [
          'Wire the Generate button to call your color function once and store the result.',
          'Apply the stored value as a background color and render it as text in the same click handler.',
        ],
      },
      {
        id: 'm3',
        title: 'Copy to clipboard',
        tasks: [
          'Use the Clipboard API to copy the current hex code when the copy control is clicked.',
          'Show a short-lived confirmation (a label change, an icon swap) rather than a browser `alert`.',
          'Handle the case where the clipboard write fails or is not permitted, without breaking the rest of the page.',
        ],
      },
      {
        id: 'm4',
        title: 'History',
        tasks: [
          'Keep an array of the last 8 generated colors, most recent first.',
          'Render the history as small swatches; clicking one re-applies that color as current.',
          'Confirm the array never grows past 8 — decide what happens to the oldest entry.',
        ],
      },
    ],
    hints: [
      '`Math.floor(Math.random() * 256)` gives a channel value from 0 to 255 inclusive — check the boundary, since an off-by-one here either excludes 255 or allows 256.',
      'A channel value under 16 converts to a single hex digit. `.toString(16).padStart(2, "0")` is the fix, and it is worth testing specifically against a value like 5, which is where an unpadded version breaks.',
      'Generate the color once per click and reuse the value for the background, the text and the history entry — generating it three times means the three places can disagree.',
    ],
    stretchGoals: [
      'Lock individual channels (R, G or B) so regenerating only randomises the unlocked ones.',
      'Show the color in RGB and HSL alongside hex.',
      'A "favorites" list, separate from history, that persists across reloads.',
      'Keyboard shortcut (spacebar) to generate a new color.',
    ],
    completionCriteria: [
      'Every generated value is a valid six-digit hex color, including values that need zero-padding.',
      'The background and the displayed text always match after a generate.',
      'Copy works and gives visible feedback.',
      'History shows up to 8 past colors and clicking one re-applies it correctly.',
    ],
    testingChecklist: [
      'Generate colors repeatedly and check for any 5-digit or 7-digit hex string — that is the padding bug.',
      'Click copy, then paste somewhere else, and confirm the pasted value matches what was displayed.',
      'Generate more than 8 times and confirm the history caps at 8 rather than growing unbounded.',
      'Click an old history entry and confirm it becomes the current color, including in the copy control.',
    ],
    reflectionQuestions: [
      'What would happen to the on-screen text if you called your random-color function separately for the background and the label? Why?',
      'Why is padding to two digits a case worth testing explicitly rather than trusting by eye?',
    ],
  },

  {
    id: 'pr-character-counter',
    slug: 'character-counter',
    title: 'Character Counter',
    difficulty: DIFFICULTY.BEGINNER,
    tagline: 'A live character counter with a maximum length, a remaining count, and a clear warning state.',
    brief:
      'A text field with a maximum length is everywhere — bios, tweets, SMS. Build the live counter behind it: ' +
      'characters typed, characters remaining, and a warning state as the limit approaches, all updating on ' +
      'every keystroke including paste. The remaining count should go negative rather than silently truncate, ' +
      'which is the detail most first attempts get wrong.',
    estimatedHours: '0.5–1',
    topicIds: ['dom', 'forms', 'events', 'strings', 'control-flow'],
    prerequisites: [
      'Knows the difference between the `input` and `change` events on a text field.',
      'Comfortable reading `.length` off a string and doing simple arithmetic with it.',
    ],
    relatedLessons: ['l-m20-01', 'l-m05-01'],
    relatedChallenges: ['ch-beg-word-count'],
    objectives: [
      'React to text as it is typed using the correct event, rather than only on blur or submit.',
      'Compute and display a remaining-characters count that is always consistent with the actual input length.',
      'Introduce a warning state driven by a threshold, not by a fixed number of characters from the end.',
    ],
    requirements: [
      'A `textarea` (or text input) with a visible maximum length, e.g. 280 characters.',
      'A live count of characters typed, updating on every keystroke — not only when focus leaves the field.',
      'A live count of characters **remaining**, which goes negative if the user pastes text over the limit (do not silently truncate on paste).',
      'A warning state (color or text change) when remaining characters drops below 10% of the maximum.',
      'An error state, visually distinct from the warning state, when the limit is exceeded.',
    ],
    milestones: [
      {
        id: 'm1',
        title: 'Live count',
        tasks: [
          'Attach an `input` event listener to the textarea.',
          'On every input, read `value.length` and display it.',
          'Confirm the count updates immediately on typing, deleting, and pasting — not just on blur.',
        ],
      },
      {
        id: 'm2',
        title: 'Remaining count',
        tasks: [
          'Compute `remaining = max - value.length` and display it.',
          'Paste in text longer than the maximum and confirm `remaining` goes negative rather than being clamped — the point is to show the user they are over, not to hide it.',
        ],
      },
      {
        id: 'm3',
        title: 'Warning and error states',
        tasks: [
          'Add a warning class when `remaining` is positive but under 10% of the maximum.',
          'Add a distinct error class when `remaining` is negative.',
          'Confirm the two states are visually different from each other and from the normal state, and that only one applies at a time.',
        ],
      },
    ],
    hints: [
      'The `input` event fires on every change to the field\'s value — typing, deleting, pasting, cutting. The `change` event only fires once focus leaves. Using the wrong one is the most common bug in this project.',
      'Resist the urge to `slice()` the value down to the maximum on every keystroke. Showing a negative remaining count is a deliberate, better piece of feedback than silently truncating what the user typed.',
      'Compute the warning threshold as a fraction of the maximum (`max * 0.1`), not a hardcoded number of characters, so the same logic works if the maximum changes.',
    ],
    stretchGoals: [
      'Count words as well as characters, and let the user toggle which one drives the limit.',
      'A circular progress indicator instead of, or alongside, the numeric count.',
      'Multiple fields on one page, each with its own independent counter and limit.',
      'Announce the warning and error states to screen readers via `aria-live`.',
    ],
    completionCriteria: [
      'The count and remaining figures update on every keystroke, including paste.',
      'Pasting text over the limit shows a negative remaining count rather than truncating.',
      'The warning state appears exactly when remaining crosses below 10% of the maximum, and clears when it is typed back above it.',
      'The error state appears exactly when the limit is exceeded.',
    ],
    testingChecklist: [
      'Type past the limit character by character and confirm the error state appears at the exact boundary.',
      'Paste a very long string in one action and confirm the count reflects it immediately, with no lag or truncation.',
      'Delete characters to bring the count back under the limit and confirm the error state clears.',
      'Clear the field entirely and confirm the count reads 0 and remaining reads the full maximum.',
    ],
    reflectionQuestions: [
      'Why does `input` behave differently from `change` here, and where else might that distinction matter?',
      'What are the trade-offs between truncating on paste and showing a negative remaining count?',
    ],
  },

  {
    id: 'pr-tip-calculator',
    slug: 'tip-calculator',
    title: 'Tip Calculator',
    difficulty: DIFFICULTY.BEGINNER,
    tagline: 'Split a bill by percentage and headcount, with validation on every input.',
    brief:
      'Take a bill amount, a tip percentage and a headcount, and produce a correct per-person split. Every ' +
      'field can be typed wrong — empty, negative, zero people — and the calculator has to handle each case ' +
      'deliberately rather than showing `NaN` or dividing by zero. Money also has to be rounded once, at the ' +
      'end, not repeatedly as it flows through the calculation.',
    estimatedHours: '1–2',
    topicIds: ['forms', 'numbers', 'control-flow', 'dom-manipulation'],
    prerequisites: [
      'Comfortable converting form input strings to numbers and back.',
      'Can write validation that rejects bad input instead of silently producing `NaN`.',
    ],
    relatedLessons: ['l-m06-01', 'l-m20-01'],
    relatedChallenges: ['ch-fund-round-to', 'ch-num-money'],
    objectives: [
      'Read numeric values out of form fields safely, rejecting empty, negative and non-numeric input rather than computing with `NaN`.',
      'Apply a percentage calculation correctly, including a custom tip percentage the presets do not cover.',
      'Round money to the cent in a way that does not drift from repeated floating-point arithmetic.',
    ],
    requirements: [
      'Inputs for bill amount, tip percentage (a set of presets — e.g. 10%, 15%, 20% — plus a custom field) and number of people.',
      'Live output: tip amount per person, and total amount per person.',
      'A **reset** control that clears every field and the output back to a neutral empty state.',
      'Selecting a preset percentage should populate — and disable, or otherwise make visually secondary — the custom field, or clearly indicate which one is active.',
    ],
    requirementsNote: undefined,
    milestones: [
      {
        id: 'm1',
        title: 'Read and validate the bill amount',
        tasks: [
          'Wire the bill field and parse it as a number on input.',
          'Reject an empty field, a negative number, and non-numeric text — decide what the output shows in each case (probably nothing, not `$NaN`).',
        ],
      },
      {
        id: 'm2',
        title: 'Tip percentage — presets and custom',
        tasks: [
          'Wire the preset buttons so clicking one sets the active tip percentage.',
          'Wire the custom field so typing a value overrides the presets, and make it visually clear which source is currently active.',
          'Validate the custom percentage: reject negative values; decide whether you allow over 100%.',
        ],
      },
      {
        id: 'm3',
        title: 'Headcount and split',
        tasks: [
          'Wire the number-of-people field, defaulting to 1 and rejecting 0 and negative values — dividing by zero is the classic bug here.',
          'Compute total tip, total bill including tip, and the per-person share of each.',
        ],
      },
      {
        id: 'm4',
        title: 'Rounding and reset',
        tasks: [
          'Round every displayed money value to two decimal places without letting the rounding itself introduce drift across recalculations.',
          'Wire the reset control to clear all fields and outputs back to their empty starting state.',
        ],
      },
    ],
    hints: [
      'Do the calculation in a single function that takes the three current values and returns the results — call it from every input\'s event listener rather than duplicating the arithmetic in each handler.',
      'Zero people is a division by zero waiting to happen. Guard the headcount input before it ever reaches the division.',
      'Round only the *displayed* values, at the last step, using `toFixed(2)` or the cents-based approach from `ch-num-money` — rounding intermediate values and feeding them back into further arithmetic is what causes visible drift over several recalculations.',
    ],
    stretchGoals: [
      'Round the total up to the nearest dollar and show how much extra that adds to the tip.',
      'Remember the last-used tip percentage in `localStorage` for next time.',
      'Support splitting unevenly — e.g. one person pays double.',
      'Currency formatting via `Intl.NumberFormat` instead of hand-built strings.',
    ],
    completionCriteria: [
      'The bill, tip and per-person figures are all correct for at least three worked examples you check by hand.',
      'Zero people, a negative bill, and empty fields are all handled without crashing or showing `NaN`.',
      'Switching between a preset and a custom percentage always uses the one the user most recently interacted with.',
      'Reset genuinely clears everything, including which tip source was active.',
    ],
    testingChecklist: [
      'Empty bill amount.',
      'Zero people, and a negative number of people.',
      'A custom tip percentage of 0, and one with several decimal places.',
      'A very large bill, to check rounding does not misbehave at scale.',
      'Switching from a preset to custom and back — confirm the displayed total updates both times.',
    ],
    reflectionQuestions: [
      'Where exactly does your code decide "this input is invalid," and what does the user see when it happens?',
      'If you rounded at every intermediate step instead of only the final display, what would go wrong over several recalculations?',
    ],
  },

  {
    id: 'pr-number-guessing-game',
    slug: 'number-guessing-game',
    title: 'Number Guessing Game',
    difficulty: DIFFICULTY.BEGINNER,
    tagline: 'Guess a secret number with feedback, an attempt counter, and a fully working reset.',
    brief:
      'Pick a secret number, accept guesses, and give feedback that narrows the search — higher, lower, or ' +
      'correct. The real work is in the state: a secret, an attempt count and a win flag that all have to ' +
      'reset together and correctly when the user starts a new round, and randomness that is isolated cleanly ' +
      'enough to reason about.',
    estimatedHours: '0.5–1.5',
    topicIds: ['control-flow', 'dom-manipulation', 'events', 'numbers'],
    prerequisites: [
      'Comfortable with comparison operators and conditional branches.',
      'Knows how to generate a random integer in a range.',
    ],
    relatedLessons: ['l-m07-01', 'l-m06-01'],
    relatedChallenges: ['ch-fund-round-to'],
    objectives: [
      'Manage game state (the secret number, the attempt count, whether the game has ended) cleanly across many interactions.',
      'Give feedback that narrows the search — higher/lower — rather than only right/wrong.',
      'Make randomness testable by isolating exactly one function that touches `Math.random`.',
    ],
    requirements: [
      'On load (or on "new game"), a secret whole number is chosen in a stated range, e.g. 1–100.',
      'The user submits guesses through a numeric input.',
      'Each guess produces feedback: too high, too low, or correct.',
      'An attempt counter increases with every guess and is shown to the user.',
      'On a correct guess, the game ends, further guesses are disabled, and the number of attempts taken is shown.',
      'A **New Game** control starts over with a fresh secret number and a reset attempt counter.',
    ],
    milestones: [
      {
        id: 'm1',
        title: 'Pick a secret number',
        tasks: [
          'Write one function, `pickSecret(min, max)`, that returns a random integer in the inclusive range and nothing else — no DOM code inside it.',
          'Call it once at the start of a game and store the result.',
        ],
      },
      {
        id: 'm2',
        title: 'Accept and check a guess',
        tasks: [
          'Wire the guess input and a submit action (a button, or the Enter key).',
          'Parse the guess as a number and reject non-numeric input before comparing.',
          'Compare the guess to the secret and show one of three feedback messages.',
        ],
      },
      {
        id: 'm3',
        title: 'Attempt counting and win state',
        tasks: [
          'Increment an attempt counter on every valid guess and display it.',
          'On a correct guess, show a win message including the attempt count, and disable further guessing.',
        ],
      },
      {
        id: 'm4',
        title: 'New game',
        tasks: [
          'Wire a control that picks a fresh secret, resets the attempt counter to 0, clears the guess input, re-enables guessing, and clears the win message.',
          'Confirm starting a new game mid-guess does not leave any stale state from the previous round.',
        ],
      },
    ],
    hints: [
      'Isolating `pickSecret` as a pure function with no DOM access is what makes the game\'s logic testable in isolation — you can call it directly and check the result is always in range, without clicking anything.',
      'Store `secret`, `attempts` and `over` (whether the round has ended) as three separate variables rather than trying to infer game state from what is currently disabled in the DOM.',
      '"New game" has to reset every one of those three variables, plus the visible input and message. Missing one is the most common bug — the classic symptom is a win message that will not clear.',
    ],
    stretchGoals: [
      'A configurable range and/or a maximum number of attempts, with a loss state when attempts run out.',
      'A best-score (fewest attempts) tracked across rounds via `localStorage`.',
      'A hint that narrows the range visually as guesses come in (e.g., a shrinking slider bound).',
      'Difficulty presets that change the range and/or the attempt limit.',
    ],
    completionCriteria: [
      'A full round — several wrong guesses, then a correct one — works end to end with accurate feedback at each step.',
      'The attempt counter is accurate and resets correctly on a new game.',
      'Guessing is genuinely disabled after a win, not just visually discouraged.',
      'New Game produces a demonstrably different secret number across several runs, not the same one repeated.',
    ],
    testingChecklist: [
      'Guess non-numeric input and confirm it is rejected without incrementing the attempt counter.',
      'Guess the exact minimum and exact maximum of the range.',
      'Win, then try to submit another guess — confirm nothing happens.',
      'Start a new game after a win and confirm the message, counter and input are all genuinely reset.',
    ],
    reflectionQuestions: [
      'How would you prove to someone else that your secret number is genuinely random and not always the same value?',
      'What state would leak between rounds if "New Game" only reset the secret number and nothing else?',
    ],
  },

  {
    id: 'pr-digital-clock',
    slug: 'digital-clock',
    title: 'Digital Clock',
    difficulty: DIFFICULTY.BEGINNER,
    tagline: 'A live clock with a 12/24-hour toggle and a correctly cleaned-up timer.',
    brief:
      'Display the current time and keep it ticking, correctly, every second — then add a 12/24-hour toggle ' +
      'that gets midnight and noon right, which is the one place a naive `hour % 12` conversion breaks. Along ' +
      'the way you will manage a repeating timer properly, including making sure it never runs more than once ' +
      'at a time.',
    estimatedHours: '0.5–1',
    topicIds: ['dates', 'dom-manipulation', 'event-loop', 'control-flow'],
    prerequisites: [
      'Comfortable reading hours, minutes and seconds off a `Date` object.',
      'Knows `setInterval` and `clearInterval`.',
    ],
    relatedLessons: ['l-m16-01', 'l-m23-02'],
    relatedChallenges: ['ch-fund-clock'],
    objectives: [
      'Read the current time and format it correctly, including the 12-hour edge cases of midnight and noon.',
      'Keep a repeating timer running smoothly without drifting or stacking duplicate intervals.',
      'Practise disposing of a timer correctly — a skill that matters far beyond a clock.',
    ],
    requirements: [
      'The current time is displayed and updates every second without a visible jump or flicker.',
      'A toggle switches between 12-hour (with AM/PM) and 24-hour display.',
      'In 12-hour mode, midnight displays as 12:00:00 AM and noon as 12:00:00 PM — not 0:00:00.',
      'All displayed numbers are zero-padded (e.g. `09`, not `9`).',
    ],
    milestones: [
      {
        id: 'm1',
        title: 'Format and display once',
        tasks: [
          'Write a `formatTime(date, is24Hour)` function that returns a fully formatted, zero-padded string.',
          'Call it once with `new Date()` and confirm the output is correct by comparing against your system clock.',
        ],
      },
      {
        id: 'm2',
        title: 'Tick every second',
        tasks: [
          'Use `setInterval` to call your render function once a second.',
          'Confirm only one interval is ever running — starting the clock twice (for example, by navigating away and back, if applicable) should not create a second ticking interval.',
        ],
      },
      {
        id: 'm3',
        title: '12/24-hour toggle',
        tasks: [
          'Wire a toggle control that switches the format flag and immediately re-renders — do not wait for the next tick to reflect the change.',
          'Specifically test hour 0 and hour 12 in both formats, since that is where an off-by-one in the 12-hour conversion shows up.',
        ],
      },
    ],
    hints: [
      'The 12-hour conversion is `hour % 12 || 12` — the `|| 12` is what turns a computed `0` (midnight and noon both reduce to 0 under plain `% 12`) into the correct `12`.',
      'If your project has any concept of unmounting or navigating away, clearing the interval there is not optional — an interval that outlives the page section it was updating keeps running and doing work nobody can see, which is the same class of bug a memory leak is.',
      'Toggling the format should call your render function immediately, not just flip a flag and wait up to a second for the next tick to pick it up.',
    ],
    stretchGoals: [
      'Display the date alongside the time, correctly pluralised and formatted.',
      'A stopwatch mode alongside the clock, with start/stop/lap.',
      'Multiple clocks on the page for different time zones.',
      'A visual second-hand animation synced to the actual second boundary, not just the interval firing.',
    ],
    completionCriteria: [
      'The clock updates every second with no visible stutter or double-update.',
      'The 12/24-hour toggle is correct at every hour, especially midnight and noon.',
      'All fields are zero-padded.',
      'Only one interval is ever active at a time.',
    ],
    testingChecklist: [
      'Watch the clock across a minute boundary (e.g. 59 seconds to 00) and confirm minutes and hours roll over correctly.',
      'Toggle the format at several different times of day, including exactly at midnight and noon if you can simulate it.',
      'Leave the page open for several minutes and confirm the time has not drifted from your system clock.',
    ],
    reflectionQuestions: [
      'Why does `hour % 12` alone give the wrong answer at midnight and noon, and how does `|| 12` fix it?',
      'What would happen to your page if the interval were never cleared and the clock component were created and destroyed repeatedly?',
    ],
  },

  {
    id: 'pr-simple-calculator',
    slug: 'simple-calculator',
    title: 'Calculator',
    difficulty: DIFFICULTY.BEGINNER,
    tagline: 'A working four-function calculator, including correct operator precedence and a clear/all-clear split.',
    brief:
      'Build a real four-function calculator: digit entry, all four operators, a working equals, and two ' +
      'different clear buttons that do genuinely different things. The core design problem is modelling the ' +
      'calculator as explicit state — a current entry, a previous value, a pending operator — rather than ' +
      'trying to evaluate button presses directly as they arrive.',
    estimatedHours: '1.5–3',
    topicIds: ['control-flow', 'dom-manipulation', 'numbers', 'errors'],
    prerequisites: [
      'Comfortable with a `switch` or chained `if` for dispatching on an operator symbol.',
      'Understands why floating-point arithmetic occasionally shows extra decimal digits.',
    ],
    relatedLessons: ['l-m07-01', 'l-m06-01'],
    relatedChallenges: ['ch-fund-postfix', 'ch-num-precision'],
    objectives: [
      'Model a calculator as an explicit sequence of state (current entry, pending operator, previous value) rather than trying to evaluate a string of button presses directly.',
      'Get operator precedence right for a chain of operations, or deliberately choose — and document — that you are not supporting it.',
      'Handle the division-by-zero and repeated-decimal-point edge cases that trip up almost every first attempt.',
    ],
    requirements: [
      'Digit buttons 0–9 and a decimal point build up the current entry.',
      '`+`, `−`, `×`, `÷` set a pending operation; pressing another operator before `=` chains correctly for at least left-to-right evaluation.',
      '`=` computes and displays the result.',
      'A **Clear Entry** clears only the current number being typed; an **All Clear** resets the whole calculation.',
      'Dividing by zero shows a clear error state rather than `Infinity` or crashing.',
      'A second decimal point in one number is rejected — `3.1.4` never becomes a valid entry.',
    ],
    milestones: [
      {
        id: 'm1',
        title: 'Digit entry',
        tasks: [
          'Wire the digit buttons to append to a "current entry" string, displayed live.',
          'Wire the decimal point button, rejecting a second one in the same entry.',
        ],
      },
      {
        id: 'm2',
        title: 'Single operation',
        tasks: [
          'Wire one operator button: pressing it stores the current entry as the "previous value" and the operator, then clears the current entry for the next number.',
          'Wire `=`: apply the stored operator to the previous value and the current entry, and display the result.',
        ],
      },
      {
        id: 'm3',
        title: 'All four operators, chained left to right',
        tasks: [
          'Extend to all four operators using one dispatch function that takes an operator symbol and two numbers.',
          'Support pressing a second operator before `=` — decide explicitly whether this evaluates immediately (left to right) or waits, and be consistent.',
          'Guard division by zero with a visible error state instead of computing it.',
        ],
      },
      {
        id: 'm4',
        title: 'Clear Entry vs All Clear',
        tasks: [
          'Wire Clear Entry to blank only the number currently being typed.',
          'Wire All Clear to reset the entire calculation: current entry, previous value, and pending operator.',
        ],
      },
    ],
    hints: [
      'A calculator needs three pieces of state at minimum: the entry currently being typed, the previously entered value, and the pending operator. Trying to get by with less is where most confusion starts.',
      'One `compute(a, operator, b)` function that all four operators go through is what keeps `=` and "operator pressed while a pending one already exists" from needing separate, duplicated logic.',
      'Real calculators generally evaluate strictly left to right without true operator precedence (2 + 3 × 4 gives 20, not 14) — decide which behaviour you are building and say so, rather than accidentally landing on an inconsistent mix.',
    ],
    stretchGoals: [
      'Full operator precedence (multiplication and division before addition and subtraction) using two-stage evaluation.',
      'A running expression display showing the full calculation, not just the current entry.',
      'Keyboard support for digits, operators, Enter and Escape.',
      'A history of recent calculations that can be clicked to reuse a result.',
    ],
    completionCriteria: [
      'All four operators produce correct results for at least five worked-by-hand examples each.',
      'Chaining operators before pressing `=` behaves consistently and matches your documented rule.',
      'Division by zero shows an error state, not `Infinity` or a crash.',
      'Clear Entry and All Clear behave differently from each other, correctly.',
    ],
    testingChecklist: [
      '5 ÷ 0.',
      '3.1.4 — a second decimal point in one entry.',
      '2 + 3 × 4 with your chosen evaluation order — confirm it matches what you documented.',
      'A very long chain of operations to check nothing overflows the display awkwardly.',
      'Clear Entry mid-number, then continue the calculation — confirm the previous value and operator survived.',
    ],
    reflectionQuestions: [
      'Which piece of state would break first if you tried to remove it, and what does that tell you about why it is necessary?',
      'What is the actual difference in behaviour between your Clear Entry and All Clear, and is it what a user would expect from those two labels?',
    ],
  },

  {
    id: 'pr-quote-generator',
    slug: 'quote-generator',
    title: 'Quote Generator',
    difficulty: DIFFICULTY.BEGINNER,
    tagline: 'Cycle through a local quote collection without ever repeating one until every quote has been seen.',
    brief:
      'Show a random quote from a local collection on every click — but "random" here means something more ' +
      'specific than `Math.random()`: no quote repeats until every quote has been shown once. That requires a ' +
      'correct shuffle, not the biased one-liner most people reach for first, plus a copy action that formats ' +
      'structured data into a clean string.',
    estimatedHours: '0.5–1.5',
    topicIds: ['arrays', 'array-methods', 'dom-manipulation', 'events'],
    prerequisites: [
      'Comfortable working with an array of objects.',
      'Knows how to shuffle or otherwise randomise a sequence without bias.',
    ],
    relatedLessons: ['l-m12-01', 'l-m13-01'],
    relatedChallenges: ['ch-arr-unique-by'],
    objectives: [
      'Work with a small local dataset (array of `{ text, author }` objects) as the source of truth, rather than fetching from anywhere.',
      'Implement "random, but never repeat until everything has been shown" — a genuinely different requirement from plain `Math.random()` each time.',
      'Wire a share or copy action that formats structured data into a readable string.',
    ],
    requirements: [
      'A local array of at least 15 quotes, each with text and an author.',
      'A **New Quote** button shows a different quote from the last one shown.',
      'No quote repeats until every quote in the collection has been shown at least once in the current cycle.',
      'A copy or share control formats the current quote and author as one string (e.g. `"Text" — Author`) and copies it.',
      'The author is visually distinguished from the quote text.',
    ],
    milestones: [
      {
        id: 'm1',
        title: 'Local data and first render',
        tasks: [
          'Build the array of quote objects.',
          'Render one quote (e.g. the first) on load, with the author styled distinctly from the quote text.',
        ],
      },
      {
        id: 'm2',
        title: 'New Quote, naively',
        tasks: [
          'Wire the button to pick a random index and render that quote.',
          'Notice — by clicking repeatedly — that plain random selection can show the same quote twice in a row, or take a long time to reach some quotes. That observation is the reason for the next milestone.',
        ],
      },
      {
        id: 'm3',
        title: 'No-repeat-until-exhausted cycling',
        tasks: [
          'Build a shuffled queue of indices at the start of each cycle.',
          'Each New Quote press takes the next index off the queue rather than calling `Math.random()` directly.',
          'When the queue is empty, reshuffle a fresh one — and make sure the reshuffle cannot immediately repeat the quote that was just shown.',
        ],
      },
      {
        id: 'm4',
        title: 'Copy or share',
        tasks: [
          'Format the current quote and author into one string.',
          'Wire a copy action using the Clipboard API, with visible confirmation.',
        ],
      },
    ],
    hints: [
      'A correct shuffle needs to give every remaining item an equal chance, not just "sort by `Math.random() - 0.5`," which is a well-known biased shuffle. The Fisher–Yates algorithm is the standard correct approach — look it up and understand why it works rather than copying it blindly.',
      'The "reshuffle without repeating the last-shown quote" requirement is where this project stops being trivial: after reshuffling, check whether the new queue\'s first entry equals the previous quote\'s index, and if so, swap it with another position in the new queue.',
      'Keep the queue of remaining indices as state separate from the full quote array — the array itself never changes, only which indices are still "unseen" this cycle.',
    ],
    stretchGoals: [
      'Filter quotes by category or author before starting a cycle.',
      'A "tweet this quote" link that opens a pre-filled share intent.',
      'Fade or slide transition between quotes.',
      'Track and display how many full cycles the user has completed.',
    ],
    completionCriteria: [
      'Clicking New Quote repeatedly, logging the index each time, shows every quote exactly once before any repeats — verified over at least two full cycles.',
      'The quote immediately after a reshuffle is never the same as the quote immediately before it.',
      'Copy produces a correctly formatted string containing both the quote and the author.',
    ],
    testingChecklist: [
      'Click through a full cycle while logging indices to a variable or the console, and confirm no duplicates appear before the cycle completes.',
      'Continue past one full cycle into the next and confirm the boundary quote does not repeat itself.',
      'Copy the current quote and paste it elsewhere to confirm the format is exactly right.',
    ],
    reflectionQuestions: [
      'Why is `array.sort(() => Math.random() - 0.5)` not a fair shuffle, even though it looks like one?',
      'What data structure changes would this project need if the quote collection were too large to hold entirely in memory?',
    ],
  },

  {
    id: 'pr-faq-accordion',
    slug: 'interactive-faq-accordion',
    title: 'Interactive FAQ / Accordion',
    difficulty: DIFFICULTY.BEGINNER,
    tagline: 'A keyboard-accessible, single-open accordion built from real data, not copy-pasted markup per item.',
    brief:
      'Turn an array of question/answer pairs into a working accordion: click a question, its answer opens, ' +
      'and any other open answer closes. Generate every panel from data rather than writing repeated markup, ' +
      'delegate the click handling to one listener on the container, and make sure the whole thing works with ' +
      'a keyboard and announces its state correctly, not just to a mouse.',
    estimatedHours: '1–2',
    topicIds: ['dom', 'dom-manipulation', 'events', 'arrays'],
    prerequisites: [
      'Comfortable creating elements from an array with `createElement` or template rendering.',
      'Aware that `aria-expanded` and keyboard focus matter for interactive widgets, from Module 20 or general accessibility coverage.',
    ],
    relatedLessons: ['l-m18-01', 'l-m19-01'],
    relatedChallenges: ['ch-dom-toggle-class', 'ch-dom-build-list'],
    objectives: [
      'Generate a set of interactive panels from an array of data, rather than writing repeated HTML for each question.',
      'Implement the "opening one closes the others" behaviour correctly, including the case of clicking the already-open item.',
      'Make an accordion that works with a keyboard and announces its state to assistive technology, not just a mouse.',
    ],
    requirements: [
      'A local array of at least 6 question/answer pairs drives the rendered accordion — the HTML for each item is generated, not hand-written.',
      'Clicking a question toggles its answer open or closed.',
      'Opening one item closes any other currently-open item (single-open accordion).',
      'Clicking an already-open item closes it, leaving nothing open.',
      'Each toggle control is a real `<button>`, reachable and operable by keyboard (Tab to focus, Enter or Space to activate).',
      '`aria-expanded` on each toggle reflects its actual open/closed state.',
    ],
    milestones: [
      {
        id: 'm1',
        title: 'Render from data',
        tasks: [
          'Build the array of `{ question, answer }` objects.',
          'Write a render function that creates one accordion item per entry, all starting closed.',
        ],
      },
      {
        id: 'm2',
        title: 'Toggle one item',
        tasks: [
          'Use event delegation: one click listener on the container, matching which item\'s button was clicked rather than attaching a listener per item.',
          'Toggle the clicked item\'s open state and its `aria-expanded` attribute together — they must never disagree.',
        ],
      },
      {
        id: 'm3',
        title: 'Single-open behaviour',
        tasks: [
          'Before opening the clicked item, close every other open item.',
          'Handle the already-open case: clicking it should close it, not reopen it immediately.',
        ],
      },
      {
        id: 'm4',
        title: 'Keyboard and accessibility pass',
        tasks: [
          'Tab through every toggle using only the keyboard and confirm each one is reachable and shows a visible focus state.',
          'Activate a toggle with both Enter and Space and confirm both work, which they will for free if you used a real `<button>`.',
          'Check with the accessibility tree (browser dev tools) that `aria-expanded` is present and correct on every toggle in every state.',
        ],
      },
    ],
    hints: [
      'Event delegation — one listener on the container, checking `event.target.closest(...)` for which button was actually clicked — is what lets the render function generate any number of items without wiring a new listener for each one.',
      'A real `<button>` element gives you keyboard activation (Enter and Space), a focus outline, and correct screen-reader semantics for free. A `<div onclick>` gives you none of those and requires reimplementing all of it by hand — use the button.',
      'The "already open, clicking closes it" case is the one most single-open accordions get wrong on the first attempt: check whether the clicked item was already the open one *before* you close everything, and skip re-opening it if so.',
    ],
    stretchGoals: [
      'Allow multiple items open at once as a togglable mode, alongside the default single-open behaviour.',
      'Smooth height animation on open/close rather than an instant show/hide.',
      'A search box that filters which questions are shown.',
      'Deep-linking: opening the page with a URL hash opens the matching question.',
    ],
    completionCriteria: [
      'Every item opens and closes correctly, and opening one always closes any other open item.',
      'Clicking the open item closes it without anything else opening.',
      'Every toggle is operable with Tab, Enter and Space alone, with no mouse.',
      '`aria-expanded` is correct on every toggle in every state, confirmed in the accessibility tree.',
    ],
    testingChecklist: [
      'Open each item in turn and confirm the previously open one always closes.',
      'Open an item, then click it again, and confirm the result is everything closed.',
      'Navigate the whole accordion with Tab and Enter only, eyes closed to the mouse.',
      'Add a 7th item to your data array and confirm it works with zero code changes — proof the render is genuinely data-driven.',
    ],
    reflectionQuestions: [
      'What would go wrong if you attached a separate click listener to each accordion button instead of delegating to the container?',
      'How would a screen reader user know an item was open or closed if `aria-expanded` were missing? What would they experience instead?',
    ],
  },
];

export default projects;
