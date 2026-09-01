import { DIFFICULTY } from '../schema/types.js';

/**
 * Easy projects — still single-page and self-contained, but each one adds a
 * real complication beginner projects avoid: multi-field validation, browser
 * storage, drag-free interaction state, or a timer that has to survive being
 * paused and resumed correctly.
 */

export const projects = [
  {
    id: 'pr-form-validator',
    slug: 'simple-form-validator',
    title: 'Simple Form Validator',
    difficulty: DIFFICULTY.EASY,
    tagline: 'Validate a signup form field by field, on blur and on submit, with real error messages.',
    brief:
      'Build a signup form — name, email, password, confirm password — with validation that actually helps: ' +
      'a message under each field explaining what is wrong, checked as the user leaves a field and again on ' +
      'submit, with focus moving to the first invalid field rather than a form that silently refuses to submit.',
    estimatedHours: '1.5–2.5',
    topicIds: ['forms', 'regex', 'events', 'control-flow'],
    prerequisites: [
      'Comfortable with form events (`blur`, `submit`) and `event.preventDefault()`.',
      'Can write a simple regular expression for an email-shaped string.',
    ],
    relatedLessons: ['l-m20-01', 'l-m16-05'],
    relatedChallenges: ['ch-beg-password-rules', 'ch-rx-escape-and-highlight'],
    objectives: [
      'Validate each field independently with a rule and a specific error message, rather than one all-or-nothing check.',
      'Trigger validation at the right moments — on blur for a field just left, on submit for everything at once — without re-validating a field the user has not touched yet.',
      'Move focus to the first invalid field on a failed submit, which is what makes a validation error actually actionable.',
    ],
    requirements: [
      'Fields: name (required, non-empty after trimming), email (required, valid shape), password (required, at least 8 characters), confirm password (must match password).',
      'Each field shows its own error message, specific to what is wrong with it — not a generic "invalid" for everything.',
      'A field is validated when the user leaves it (`blur`), and its error clears the moment the field becomes valid, without waiting for another blur.',
      'Submitting validates every field at once. An invalid form does not submit, and focus moves to the first invalid field, in field order.',
      'A field that has never been touched shows no error before the user interacts with it or submits.',
    ],
    milestones: [
      {
        id: 'm1',
        title: 'One field, one rule',
        tasks: [
          'Wire the name field: required, non-empty after trimming whitespace.',
          'Show and hide its error message on blur, and clear it as soon as the field becomes valid.',
        ],
      },
      {
        id: 'm2',
        title: 'Every field, its own rule',
        tasks: [
          'Write a small table mapping each field to a validator function and an error message.',
          'Wire blur validation for email, password and confirm-password using the same table-driven approach — avoid four separate copy-pasted blur handlers.',
        ],
      },
      {
        id: 'm3',
        title: 'Submit validates everything',
        tasks: [
          'On submit, run every field\'s validator regardless of whether it has been touched, and show all resulting errors at once.',
          'Prevent the actual form submission when any field is invalid.',
          'Move keyboard focus to the first invalid field, in field order, so the user is not left guessing.',
        ],
      },
      {
        id: 'm4',
        title: 'Untouched-field polish',
        tasks: [
          'Confirm a completely fresh form shows no errors before any interaction.',
          'Confirm typing directly into the confirm-password field re-checks it against the current password value, even if the password field itself was not just edited.',
        ],
      },
    ],
    hints: [
      'A table of `{ field, validate(value, allValues), message }` entries, looped over for both blur and submit, is what keeps four fields from turning into four near-identical blocks of code.',
      'The confirm-password rule needs the *current* password value at the moment it is checked, not the value from when the page loaded — validating it should re-read the password field live rather than closing over a stale copy.',
      'Moving focus on a failed submit is one line, `element.focus()`, on the first field whose validator failed — but it only works if you check fields in a stable, predictable order.',
    ],
    stretchGoals: [
      'A password strength indicator alongside the length check (see the companion Password Strength UI project for the full version).',
      'Debounce validation while typing, rather than only validating on blur, once the field has already been touched once.',
      'Inline success indicators (a checkmark) on fields that pass, not just error messages on ones that fail.',
      'Async validation for email — simulate an "already registered" check with an injected mock, not a real request.',
    ],
    completionCriteria: [
      'Every field has its own accurate error message that appears and disappears at the right moments.',
      'Submitting an invalid form never actually submits, and moves focus to the first problem.',
      'A fresh, untouched form shows no errors.',
      'Confirm-password correctly reacts to changes in either password field.',
    ],
    testingChecklist: [
      'Tab through every field without typing anything, then submit — confirm every required error appears together.',
      'Fix the errors one at a time and confirm each error disappears independently as its field becomes valid.',
      'Type a password, then a non-matching confirmation, then fix the confirmation to match — confirm the mismatch error clears.',
      'Submit a fully valid form and confirm it is allowed through.',
    ],
    reflectionQuestions: [
      'Why validate on blur instead of on every keystroke from the very first character typed?',
      'What would a screen reader user experience if the error messages were not associated with their fields via `aria-describedby` or similar?',
    ],
  },

  {
    id: 'pr-password-strength',
    slug: 'password-strength-ui',
    title: 'Password Strength UI',
    difficulty: DIFFICULTY.EASY,
    tagline: 'A live strength meter that scores a password on several independent criteria, not just length.',
    brief:
      'Show a live strength meter as the user types a password, scored on several independent rules — length, ' +
      'character variety, and a check against a short list of known-common passwords — rather than a single ' +
      'pass/fail. The interesting design problem is combining several boolean checks into one meaningful score ' +
      'and label, and being honest about what the meter can and cannot guarantee.',
    estimatedHours: '1.5–2.5',
    topicIds: ['regex', 'strings', 'security', 'dom-manipulation'],
    prerequisites: [
      'Comfortable writing several independent regular expressions or character checks.',
      'Read or skimmed the security module\'s coverage of password practices.',
    ],
    relatedLessons: ['l-m44-01', 'l-m05-01'],
    relatedChallenges: ['ch-beg-password-rules'],
    objectives: [
      'Score a password against several independent criteria and combine the results into one meaningful strength level.',
      'Give specific, actionable feedback — which rule is unmet — rather than only a number or a color.',
      'Understand and state the real limits of a client-side strength meter, rather than presenting it as a security guarantee.',
    ],
    requirements: [
      'A password field with a live strength meter (a bar, or a set of segments) that updates on every keystroke.',
      'At least four independent criteria contribute to the score: minimum length, contains a lowercase letter, contains an uppercase letter, contains a digit or symbol.',
      'A short, hardcoded list (10–20 entries) of extremely common passwords (`"password"`, `"123456"`, `"qwerty"`, …) forces the score to the lowest level regardless of the other criteria, case-insensitively.',
      'A text label alongside the meter (e.g. Very Weak / Weak / Fair / Strong) and a list of which specific criteria are still unmet.',
      'An empty password shows a neutral, non-alarming initial state, not "Very Weak".',
    ],
    milestones: [
      {
        id: 'm1',
        title: 'Individual criteria',
        tasks: [
          'Write one small function per criterion, each returning a boolean for a given password.',
          'Log all four results for a few test passwords to confirm each is correct in isolation before combining them.',
        ],
      },
      {
        id: 'm2',
        title: 'Combine into a score',
        tasks: [
          'Combine the boolean results into a numeric score (e.g. count of criteria met).',
          'Map the score to a label and render both the meter and the label live as the user types.',
        ],
      },
      {
        id: 'm3',
        title: 'Common-password override',
        tasks: [
          'Add the hardcoded common-password list and check the current password against it case-insensitively.',
          'Force the lowest strength label when there is a match, regardless of what the other criteria say — a common password that happens to be long and mixed-case is still weak.',
        ],
      },
      {
        id: 'm4',
        title: 'Actionable feedback and empty state',
        tasks: [
          'List which specific criteria are unmet, updating live.',
          'Handle the empty password as a distinct neutral state rather than the lowest strength level.',
        ],
      },
    ],
    hints: [
      'Writing each criterion as its own small, named function (`hasMinLength`, `hasUppercase`, …) rather than one large conditional is what makes the "which criteria are unmet" feedback almost free — you already have a named boolean for each one.',
      'The common-password check should run *before* you decide the final label, and should be able to override a high score — being 12 characters with mixed case does not save `"Password1"` if it is on the list, because that transformation is exactly what real attackers try first.',
      'Comparing against the common-password list case-insensitively is what catches `"PASSWORD"` and `"Password"` as well as `"password"`.',
    ],
    stretchGoals: [
      'A visual breakdown showing each criterion with its own pass/fail icon, not just a combined bar.',
      'An estimate of how many characters would need to change to satisfy each unmet criterion.',
      'A "show password" toggle on the field.',
      'Support pasting and check that the meter updates immediately, same as typing.',
    ],
    completionCriteria: [
      'The meter updates live with no lag as the user types or deletes.',
      'A password from the common list scores as the weakest level even if it also satisfies length and variety criteria.',
      'The unmet-criteria list is always accurate and updates as the password changes.',
      'An empty field shows a neutral state, not a strength judgement.',
    ],
    testingChecklist: [
      'Type a password from your common list in a different case (e.g. `PassWord`) and confirm it is still flagged.',
      'Type a long, high-variety password not on the list and confirm it reaches the top strength level.',
      'Clear the field entirely and confirm the neutral empty state appears, not "Very Weak".',
      'Type one character at a time and confirm the meter never lags a keystroke behind.',
    ],
    reflectionQuestions: [
      'What does a green "Strong" label actually guarantee about a password, and what does it not guarantee?',
      'Why can a password be long and varied and still be one of the worst possible choices?',
    ],
  },

  {
    id: 'pr-image-gallery',
    slug: 'image-gallery-lightbox',
    title: 'Image Gallery with Lightbox',
    difficulty: DIFFICULTY.EASY,
    tagline: 'A responsive image grid with a keyboard-navigable lightbox — arrows, escape, and focus trapping.',
    brief:
      'Render a grid of images from data, and clicking any one opens a full-screen lightbox with next/previous ' +
      'navigation. The grid itself is the easy part; the lightbox is the real project — correct keyboard ' +
      'navigation, focus trapped inside it while open, and focus correctly returned to the thumbnail that ' +
      'opened it when the user closes it.',
    estimatedHours: '2–3',
    topicIds: ['dom-manipulation', 'events', 'arrays', 'dom'],
    prerequisites: [
      'Comfortable with event delegation and keyboard event handling (`keydown`, checking `event.key`).',
      'Aware of what focus trapping means and roughly why modal dialogs need it.',
    ],
    relatedLessons: ['l-m19-01', 'l-m18-01'],
    relatedChallenges: ['ch-dom-keyboard-nav', 'ch-dom-delegation'],
    objectives: [
      'Render a collection from data and open a detail view driven by which item was clicked, using delegation rather than one listener per thumbnail.',
      'Build keyboard navigation (arrow keys, Escape) for an overlay that behaves like a real modal, not just an absolutely positioned image.',
      'Trap focus inside an open overlay and correctly restore it afterwards — the accessibility requirement most lightboxes get wrong.',
    ],
    requirements: [
      'A local array of at least 10 images (can be placeholder URLs) drives a grid — clicking any thumbnail opens the lightbox on that image.',
      'The lightbox shows the full image, and Next/Previous controls (buttons and arrow keys) move through the collection, wrapping at both ends.',
      'Escape, or a visible close control, closes the lightbox.',
      'While the lightbox is open, Tab cycles only through controls inside it (close, previous, next) — it never reaches the grid behind it.',
      'Closing the lightbox returns keyboard focus to the exact thumbnail that opened it.',
    ],
    milestones: [
      {
        id: 'm1',
        title: 'Render the grid',
        tasks: [
          'Build the array of image data and render one thumbnail per entry.',
          'Confirm the grid is responsive at a couple of viewport widths.',
        ],
      },
      {
        id: 'm2',
        title: 'Open the lightbox on a specific image',
        tasks: [
          'Use event delegation on the grid container to detect which thumbnail was clicked.',
          'Open the lightbox showing that image, tracking its index in the collection.',
        ],
      },
      {
        id: 'm3',
        title: 'Next / Previous with wraparound',
        tasks: [
          'Wire Next and Previous controls, and the corresponding arrow keys, to move the tracked index.',
          'Wrap correctly at both ends — Next from the last image goes to the first, Previous from the first goes to the last.',
        ],
      },
      {
        id: 'm4',
        title: 'Close, Escape, and focus discipline',
        tasks: [
          'Wire a close control and the Escape key to close the lightbox.',
          'Save a reference to the thumbnail that was clicked, and return focus to it specifically when the lightbox closes.',
          'Trap Tab inside the lightbox while it is open — cycling forward from the last control returns to the first, and vice versa for Shift+Tab.',
        ],
      },
    ],
    hints: [
      'Delegation means one click listener on the grid container, using `event.target.closest(...)` to find which thumbnail was actually clicked and reading its index from a data attribute — not one listener per image.',
      'Focus trapping means: on every Tab and Shift+Tab keydown while the lightbox is open, check whether focus is about to leave the lightbox\'s set of focusable elements, and if so, redirect it back to the other end of that set.',
      'Save the clicked thumbnail element itself (not just its index) in a variable when the lightbox opens, so `element.focus()` on close returns to exactly the right place — even if the grid re-renders in between.',
    ],
    stretchGoals: [
      'Swipe gestures for touch devices.',
      'Preload the next and previous images so navigation feels instant.',
      'A thumbnail strip inside the lightbox showing nearby images.',
      'Captions and alt text shown in the lightbox, sourced from the same data.',
    ],
    completionCriteria: [
      'Every thumbnail opens the lightbox on the correct image.',
      'Next and Previous work by button and by arrow key, wrapping correctly at both ends.',
      'Tab never escapes the lightbox while it is open, confirmed by tabbing repeatedly with eyes on the focus outline.',
      'Closing the lightbox — by any method — returns focus to the specific thumbnail that opened it.',
    ],
    testingChecklist: [
      'Open the first image and press Previous — confirm it wraps to the last image, not nothing.',
      'Open the last image and press Next — confirm it wraps to the first.',
      'With the lightbox open, press Tab repeatedly and confirm focus never lands on anything in the grid behind it.',
      'Open an image partway through the grid, close the lightbox, and confirm focus is back on that exact thumbnail, not the top of the page.',
    ],
    reflectionQuestions: [
      'What would a keyboard-only user experience if focus were not trapped inside the open lightbox?',
      'Why does returning focus to the specific thumbnail matter more than just returning it to the page in general?',
    ],
  },

  {
    id: 'pr-pomodoro-timer',
    slug: 'pomodoro-timer',
    title: 'Pomodoro Timer',
    difficulty: DIFFICULTY.EASY,
    tagline: 'A work/break timer that survives pause, resume, and the tab losing focus without drifting.',
    brief:
      'Build a Pomodoro timer — 25 minutes of work, 5 minutes of break, repeating — with pause and resume that ' +
      'actually work. The trap almost everyone falls into is counting down with `setInterval` alone, which ' +
      'drifts under load and breaks entirely across a pause; this project is about measuring elapsed real time ' +
      'instead of trusting the interval to fire exactly on schedule.',
    estimatedHours: '1.5–2.5',
    topicIds: ['event-loop', 'dates', 'dom-manipulation', 'control-flow'],
    prerequisites: [
      'Comfortable with `setInterval`/`clearInterval` and reading time from `Date.now()`.',
      'Understands, at least roughly, that a page can be throttled or backgrounded and timers are not perfectly reliable.',
    ],
    relatedLessons: ['l-m23-02', 'l-m16-01'],
    relatedChallenges: ['ch-fund-clock'],
    objectives: [
      'Measure elapsed time from real timestamps rather than by counting interval ticks, so the display stays accurate under load.',
      'Implement pause and resume correctly, which means the timer has to remember how much time had elapsed, not just stop and restart a countdown.',
      'Transition cleanly between work and break phases, including notifying the user.',
    ],
    requirements: [
      'A visible countdown for a work session (25:00 default) that counts down accurately to zero.',
      'Start, Pause and Reset controls. Pause genuinely stops the countdown; Resume continues from exactly where it left off, not from the full duration again.',
      'On reaching zero, the timer automatically switches to a break session (5:00 default) and back again, alternating.',
      'A visible or audible cue (at minimum, a visible state change) marks the transition between work and break.',
      'The work and break durations are configurable.',
    ],
    milestones: [
      {
        id: 'm1',
        title: 'Accurate countdown from a timestamp',
        tasks: [
          'On Start, record the current time and the target end time (`start + durationMs`).',
          'On each tick (roughly once a second), compute the remaining time as `end - Date.now()`, not by decrementing a counter — this is what keeps the display accurate even if a tick is late.',
          'Format and display the remaining time as `MM:SS`, and stop at exactly zero.',
        ],
      },
      {
        id: 'm2',
        title: 'Pause and resume',
        tasks: [
          'On Pause, stop the interval and record how much time was remaining.',
          'On Resume, compute a new end time from the current moment plus the remaining time, and restart the interval — the timer must not jump back to the full duration.',
        ],
      },
      {
        id: 'm3',
        title: 'Work / break cycle',
        tasks: [
          'When the countdown reaches zero, switch to the other phase (work to break, or break to work) and start its countdown automatically.',
          'Show which phase is currently active, clearly.',
        ],
      },
      {
        id: 'm4',
        title: 'Configurable durations and reset',
        tasks: [
          'Let the user set the work and break durations before starting.',
          'Wire Reset to stop any running timer and return to the initial, unstarted state for the configured work duration.',
        ],
      },
    ],
    hints: [
      'The core fix that separates a working Pomodoro timer from a drifting one: never subtract a fixed amount per tick. Always compute remaining time as `endTimestamp - Date.now()`, computed fresh on every tick, so a late or skipped tick corrects itself automatically.',
      'Pausing correctly means storing the *remaining* milliseconds when Pause is pressed, and computing a fresh `endTimestamp` from `Date.now() + remaining` when Resume is pressed — resuming should never recompute from the original duration.',
      'One function, `startPhase(durationMs)`, used for both work and break, is what keeps the phase-switching logic from turning into two near-identical blocks of code.',
    ],
    stretchGoals: [
      'A count of completed work sessions ("pomodoros") in the current sitting, and a longer break after every fourth one.',
      'Browser notifications (with permission requested first) when a phase ends and the tab is not focused.',
      'Persist an in-progress session to `localStorage` so a reload does not lose the countdown.',
      'A subtle sound cue on phase transitions.',
    ],
    completionCriteria: [
      'The countdown reaches exactly zero and transitions phase automatically, without manual intervention.',
      'Pausing and resuming never loses or gains time compared to letting it run uninterrupted.',
      'Reset returns to a clean, unstarted state at the configured duration.',
      'Changing the configured durations before starting is reflected in the next countdown.',
    ],
    testingChecklist: [
      'Start a short test duration (e.g. 5 seconds) and let it run to completion, confirming the automatic phase switch.',
      'Pause partway through, wait several seconds, then resume — confirm the remaining time is what it should be, not reset or advanced by the wait.',
      'Switch to a different browser tab for a while during a running countdown, then switch back, and check whether the displayed time is still accurate — this is exactly where a naive tick-counting implementation reveals its drift.',
      'Reset mid-countdown and confirm no leftover interval keeps running in the background.',
    ],
    reflectionQuestions: [
      'Why does computing remaining time from timestamps survive a throttled or backgrounded tab better than counting down a fixed amount per tick?',
      'What state does Pause need to remember that a simple "stop the interval" does not capture on its own?',
    ],
  },

  {
    id: 'pr-bookmark-manager',
    slug: 'bookmark-manager',
    title: 'Bookmark Manager',
    difficulty: DIFFICULTY.EASY,
    tagline: 'Save, tag, search and persist links — with a URL validated before it is ever stored.',
    brief:
      'Build a personal bookmark manager: add a URL and a title, tag it, search across saved bookmarks, and ' +
      'keep everything in `localStorage` so it survives a reload. The two things that separate this from a ' +
      'todo-list-with-extra-steps are validating that a saved URL is actually a URL, and making the storage ' +
      'layer resilient to bad or missing data rather than crashing the whole page on load.',
    estimatedHours: '2–3',
    topicIds: ['storage', 'forms', 'arrays', 'array-methods'],
    prerequisites: [
      'Comfortable with `localStorage.getItem`/`setItem` and `JSON.stringify`/`parse`.',
      'Can filter and search an array of objects by more than one field.',
    ],
    relatedLessons: ['l-m27-01', 'l-m13-01'],
    relatedChallenges: ['ch-str-slugify', 'ch-obj-pick-omit'],
    objectives: [
      'Persist structured data to `localStorage` and load it back reliably, including the first-visit case where nothing has been saved yet.',
      'Validate a URL before storing it, rather than trusting whatever the user typed.',
      'Build search and tag filtering that combine correctly — search narrows by text, tags narrow by category, and both apply together.',
    ],
    requirements: [
      'A form to add a bookmark: title, URL, and one or more tags (comma-separated or similar).',
      'The URL is validated before saving — an unparseable or empty URL is rejected with a clear message, not silently stored.',
      'Bookmarks are listed with their title (linking to the URL), tags, and a delete control.',
      'A search box filters the visible list by title as the user types.',
      'Clicking a tag filters the list to only bookmarks carrying that tag; the search box and the tag filter combine, not replace each other.',
      'All bookmarks persist in `localStorage` and are still present after a page reload.',
    ],
    milestones: [
      {
        id: 'm1',
        title: 'Add and list, in memory first',
        tasks: [
          'Wire the add form to push a new bookmark object into an in-memory array and re-render the list.',
          'Wire delete to remove a bookmark from the array and re-render.',
        ],
      },
      {
        id: 'm2',
        title: 'URL validation',
        tasks: [
          'Validate the URL field using `new URL(...)` in a `try`/`catch`, or an equivalent check, before accepting the form.',
          'Show a specific error message for an invalid URL and do not add the bookmark until it is fixed.',
        ],
      },
      {
        id: 'm3',
        title: 'Persist to localStorage',
        tasks: [
          'Save the full bookmark array to `localStorage` after every add and delete.',
          'On load, read from `localStorage` and populate the in-memory array — handling the case where nothing has been saved yet, and the case where the stored value is corrupted or unparseable, without crashing the page.',
        ],
      },
      {
        id: 'm4',
        title: 'Search and tag filtering, combined',
        tasks: [
          'Wire the search box to filter the displayed list by title as the user types.',
          'Render clickable tags and wire tag selection to further filter the currently-searched list, not replace the search filter.',
          'Confirm searching and then selecting a tag narrows correctly, and clearing either widens the result back out.',
        ],
      },
    ],
    hints: [
      '`new URL(text)` throws for anything that is not a parseable URL, which makes it a one-line validity check inside a `try`/`catch` — much more reliable than a hand-written regular expression trying to cover every valid URL shape.',
      'Reading from `localStorage` on load needs a `try`/`catch` around the `JSON.parse` too: a first-time visitor has nothing stored at all (`getItem` returns `null`), and anyone who has ever manually edited the stored value could leave it genuinely broken JSON. Both cases should fall back to an empty list, not throw.',
      'Filtering is a single `array.filter` that checks both the search term and the active tag (when one is set) in the same predicate — write it as one combined condition rather than two separate filtering passes that overwrite each other.',
    ],
    stretchGoals: [
      'Edit an existing bookmark in place rather than only add and delete.',
      'Sort bookmarks by date added, alphabetically, or by tag.',
      'Import/export the bookmark collection as JSON.',
      'Fetch and display a favicon for each bookmark\'s domain.',
    ],
    completionCriteria: [
      'Adding, deleting, and reloading the page all leave the bookmark list in the expected state.',
      'An invalid URL is rejected with a specific message and never makes it into storage.',
      'Search and tag filtering both work individually and combine correctly when used together.',
      'A first visit with nothing in `localStorage`, and a visit with deliberately corrupted `localStorage`, both load to an empty list rather than a crashed page.',
    ],
    testingChecklist: [
      'Add a bookmark with a clearly invalid URL (e.g. `"not a url"`) and confirm it is rejected with a message, not silently dropped or stored anyway.',
      'Add several bookmarks with overlapping tags, then combine a search term with a tag filter and confirm the result is the intersection of both.',
      'Reload the page after adding bookmarks and confirm they are still there.',
      'Manually corrupt the stored value in your browser\'s dev tools and reload — confirm the app recovers to an empty list rather than showing a blank crashed page.',
    ],
    reflectionQuestions: [
      'What happens to your app on the very first visit, before anything has ever been saved to `localStorage` — did you test that path deliberately, or only after data already existed?',
      'Why is `new URL(...)` a more reliable validity check here than a hand-rolled regular expression?',
    ],
  },

  {
    id: 'pr-memory-match',
    slug: 'memory-match-game',
    title: 'Memory Match Game',
    difficulty: DIFFICULTY.EASY,
    tagline: 'A card-matching game with correct two-card-at-a-time logic and a move counter.',
    brief:
      'Build the classic memory-match game: a shuffled grid of face-down card pairs, flip two at a time, keep a ' +
      'match if they agree, flip them back if they do not, and track moves until every pair is found. The real ' +
      'design problem is state, not visuals — knowing exactly which cards are flipped, matched, or briefly ' +
      '"showing but about to flip back," and refusing input during that brief window.',
    estimatedHours: '2–3',
    topicIds: ['arrays', 'array-methods', 'dom-manipulation', 'control-flow'],
    prerequisites: [
      'Comfortable shuffling an array (Fisher–Yates or equivalent).',
      'Can manage more than one boolean or enum flag per element of state.',
    ],
    relatedLessons: ['l-m12-01', 'l-m19-01'],
    relatedChallenges: ['ch-arr-unique-by', 'ch-dom-toggle-class'],
    objectives: [
      'Model a grid of cards as data (value, flipped, matched) and render from that data, rather than tracking state in the DOM directly.',
      'Implement the two-cards-at-a-time rule correctly, including the brief window where a wrong pair is shown before flipping back.',
      'Prevent invalid input — clicking a third card, or the same card twice — without disabling the whole board.',
    ],
    requirements: [
      'A grid of cards, each showing a hidden back until clicked, built from an even number of paired values shuffled into random positions.',
      'Clicking a face-down card flips it face up. Clicking a second face-down card compares the two.',
      'A match: both cards stay face up permanently and are marked matched.',
      'A non-match: both cards briefly stay visible, then flip back face down after a short delay.',
      'While two cards are showing (matched or about to flip back), clicking anything else is ignored — no third card can flip early.',
      'Clicking an already-flipped or already-matched card does nothing.',
      'A move counter increases once per pair of cards compared. A win state appears when every pair is matched.',
    ],
    milestones: [
      {
        id: 'm1',
        title: 'Build and shuffle the deck',
        tasks: [
          'Generate an array of paired values (e.g. 8 pairs for a 4×4 grid) and shuffle it with a correct, unbiased shuffle.',
          'Render the grid from this array, all face down, with no values visible yet.',
        ],
      },
      {
        id: 'm2',
        title: 'Flip one card',
        tasks: [
          'Wire a click handler (delegated to the grid) that flips a face-down card to show its value.',
          'Ignore clicks on already-flipped or already-matched cards.',
        ],
      },
      {
        id: 'm3',
        title: 'Compare two cards',
        tasks: [
          'Track the currently-flipped card (or cards) as state, not just by reading the DOM.',
          'When a second card is flipped, compare the two values. On a match, mark both matched. On a mismatch, flip both back after a short delay.',
          'While two cards are showing, block further flips — clicking a third card does nothing until the current pair resolves.',
        ],
      },
      {
        id: 'm4',
        title: 'Moves and win state',
        tasks: [
          'Increment a move counter once per comparison (i.e. once every two cards flipped), and display it.',
          'Detect when every pair is matched and show a win message, including the final move count.',
        ],
      },
    ],
    hints: [
      'Model each card as `{ id, value, flipped, matched }` and render the grid purely from an array of these — clicking a card updates the data, then a render function reflects the data onto the DOM, never the other way around.',
      'The "block a third click" rule is the one that trips people up: it needs an explicit "busy" or "checking" flag, set the instant the second card of a pair is flipped and cleared only after the mismatch delay (or immediately on a match), checked at the very start of every click handler.',
      'A `setTimeout` for the mismatch flip-back needs to flip back the *specific two cards* that were just compared, not "whichever cards happen to be flipped" — capture their identities in the timeout\'s closure at the moment of the mismatch.',
    ],
    stretchGoals: [
      'A timer alongside the move counter, and a best-score record kept in `localStorage`.',
      'Difficulty levels that change the grid size and pair count.',
      'A brief flash or animation on a successful match, distinct from the mismatch flip-back.',
      'Two-player turn-based mode, alternating whose move counter increments.',
    ],
    completionCriteria: [
      'Every game is fully playable from a shuffled start to a win state, with an accurate move count.',
      'A third card can never be flipped while a mismatched pair is still showing.',
      'Clicking an already-flipped or already-matched card never does anything.',
      'The win state appears exactly when every pair is matched, not before and not after extra clicks.',
    ],
    testingChecklist: [
      'Deliberately click a third card immediately after flipping a mismatched pair, before the flip-back delay finishes — confirm it is ignored.',
      'Click the same card twice in a row and confirm nothing happens on the second click.',
      'Play a full game to completion and confirm the move counter matches the number of pairs you actually compared.',
      'Reload and start a new game, confirming the shuffle produces a different layout than the previous game.',
    ],
    reflectionQuestions: [
      'What specific piece of state is responsible for blocking the third click, and what would happen to the game without it?',
      'Why does modelling the cards as data first, and rendering from that data, make the matching logic easier to get right than manipulating flipped DOM elements directly?',
    ],
  },
];

export default projects;
