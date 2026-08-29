import { DIFFICULTY } from '../schema/types.js';

/**
 * Medium projects — the step from a single-page interaction to a small
 * application: structured state with several moving parts, filtering,
 * persistence, and the first projects that talk to an "API" — always a mock
 * or an injected fetch, never a live network dependency, so the build is
 * fully offline-testable and so is the learner's own verification.
 */

export const projects = [
  {
    id: 'pr-todo-application',
    slug: 'todo-application',
    title: 'Todo Application',
    difficulty: DIFFICULTY.MEDIUM,
    tagline: 'Add, edit, delete, complete and filter tasks, persisted and rendered correctly at every count.',
    brief:
      'Build a real todo application: add, edit, delete and complete tasks, filter by all/active/completed, ' +
      'and persist everything so a reload does not lose the list. It looks familiar, which is exactly why it ' +
      'is a good project — the difficulty is entirely in getting the state, the rendering, and the edge cases ' +
      '(zero tasks, all completed, editing while a filter is active) right at the same time.',
    estimatedHours: '3–5',
    topicIds: ['arrays', 'objects', 'dom-manipulation', 'events', 'storage'],
    prerequisites: [
      'Comfortable with array methods (`map`, `filter`, `find`) over an array of objects.',
      'Has used `localStorage` to persist simple data before, or completed the Bookmark Manager project.',
    ],
    relatedLessons: ['l-m13-01', 'l-m27-01', 'l-m19-01'],
    relatedChallenges: ['ch-arr-partition', 'ch-obj-pick-omit', 'ch-dom-delegation'],
    objectives: [
      'Model a list of tasks as an array of objects and render the visible list purely as a function of that array plus the active filter — never edit the DOM directly to reflect a state change.',
      'Use event delegation so adding a hundredth task does not mean adding a hundredth listener.',
      'Keep persistence, filtering and editing correct simultaneously, including the edge cases each one introduces for the other two.',
    ],
    requirements: [
      'Add a task via a text input; empty or whitespace-only input is rejected.',
      'Each task shows its text, a checkbox (or equivalent) to toggle completion, an edit control, and a delete control.',
      'Editing a task lets the user change its text in place, with a way to save or cancel the edit.',
      'Filter tabs: All, Active, Completed — the visible list updates immediately when the filter changes.',
      'A count of remaining active tasks is shown and stays accurate through every operation.',
      'An empty state is shown when the current filter has nothing to display — distinct messaging for "no tasks at all" versus "no tasks match this filter."',
      'The full task list, including completion state, persists in `localStorage` and survives a reload.',
    ],
    milestones: [
      {
        id: 'm1',
        title: 'Render tasks from an array',
        tasks: [
          'Build an in-memory array of task objects (`{ id, text, completed }`) and a render function that draws the list from it.',
          'Confirm the render function can be called repeatedly and always produces a correct list — this is what every later milestone will lean on.',
        ],
      },
      {
        id: 'm2',
        title: 'Add and delete',
        tasks: [
          'Wire the add form: reject empty/whitespace input, push a new task with a unique id, re-render.',
          'Wire delete, using event delegation on the list container rather than a listener per task, re-render.',
        ],
      },
      {
        id: 'm3',
        title: 'Toggle completion and edit in place',
        tasks: [
          'Wire the completion toggle to flip a task\'s `completed` flag and re-render.',
          'Wire edit: entering edit mode for one task at a time, saving the new text (rejecting empty) or cancelling back to the original text.',
        ],
      },
      {
        id: 'm4',
        title: 'Filtering',
        tasks: [
          'Wire the three filter tabs to change which subset of tasks is rendered, without mutating the underlying array.',
          'Confirm toggling completion or deleting a task while a filter other than "All" is active still behaves correctly — a task that becomes invisible under the current filter should still exist in the data.',
        ],
      },
      {
        id: 'm5',
        title: 'Counts and empty states',
        tasks: [
          'Compute and display the count of active (incomplete) tasks, accurate after every operation.',
          'Show a distinct empty-state message for "no tasks exist yet" versus "no tasks match the current filter."',
        ],
      },
      {
        id: 'm6',
        title: 'Persistence',
        tasks: [
          'Save the full task array to `localStorage` after every operation that changes it.',
          'Load from `localStorage` on startup, handling both a first-ever visit and a corrupted stored value without crashing.',
        ],
      },
    ],
    hints: [
      'Keep exactly one array as the source of truth and one `render()` that reads it. Every action — add, delete, toggle, edit, filter — changes the array (or the filter state) and then calls `render()`. Reaching directly into the DOM to add or remove a single `<li>` from an action handler is where this project usually goes wrong.',
      'The filter should never delete or hide data from the underlying array — it only changes what `render()` chooses to display. That is what keeps "delete a task while filtered to Active" from silently corrupting the Completed list.',
      'Edit mode needs its own small piece of state (which task id, if any, is currently being edited) so that only one task can be in edit mode at a time and the render function knows to show an input instead of static text for that one task.',
    ],
    stretchGoals: [
      'Due dates, with overdue tasks visually flagged.',
      'Priority levels, sortable.',
      'A search box that filters by text, combined with the existing All/Active/Completed filter.',
      'Reordering tasks — even a simple "move up / move down" control counts; full drag-and-drop is optional beyond that.',
    ],
    completionCriteria: [
      'A user can add, edit, complete, and delete tasks, in any order, and the list stays correct throughout.',
      'All three filters show exactly the right subset at all times.',
      'The active-task count is accurate after every single operation, not just on load.',
      'Reloading the page preserves the full list, including completion state.',
      'The correct empty state appears for both "nothing exists" and "nothing matches this filter."',
    ],
    testingChecklist: [
      'Add several tasks, complete some, then reload — confirm everything, including completion state, survived.',
      'Delete a task while filtered to "Active" and confirm it is also gone from "All" and "Completed" — it should be genuinely deleted, not just hidden by the filter.',
      'Start editing a task, then click edit on a different task without saving the first — decide and verify what happens.',
      'Delete every task and confirm the "no tasks at all" empty state appears, distinct from filtering to a set with nothing in it.',
      'Rapidly add ten tasks in a row and confirm the list and the count both keep up correctly.',
    ],
    reflectionQuestions: [
      'Why does keeping the filter as "what to display" rather than "what to delete" matter for correctness, not just convenience?',
      'If you added a search box tomorrow, would it combine cleanly with your existing filter logic, or would you need to restructure how filtering works? Why?',
    ],
  },

  {
    id: 'pr-quiz-application',
    slug: 'quiz-application',
    title: 'Quiz Application',
    difficulty: DIFFICULTY.MEDIUM,
    tagline: 'A scored multiple-choice quiz with a shuffled-but-deterministic question order and a completion screen.',
    brief:
      'Build a quiz engine: present questions one at a time from local data, track the score as answers come ' +
      'in, and show a completion screen with a full breakdown at the end. The one requirement that makes this ' +
      'more than a slideshow is shuffling the question order without making the app untestable — randomness ' +
      'has to be injectable so an automated check can run the exact same "random" sequence twice.',
    estimatedHours: '3–5',
    topicIds: ['arrays', 'objects', 'control-flow', 'dom-manipulation'],
    prerequisites: [
      'Comfortable managing an index into an array (current question) alongside a separate score.',
      'Understands why hardcoding `Math.random()` directly into game logic makes that logic hard to test.',
    ],
    relatedLessons: ['l-m13-01', 'l-m08-01'],
    relatedChallenges: ['ch-arr-unique-by', 'ch-cls-result'],
    objectives: [
      'Separate quiz data (questions, options, correct answers) from quiz logic (current index, score, answered state) cleanly enough that either could change independently.',
      'Implement a shuffle whose randomness source is injected, so the exact same sequence can be reproduced in a test.',
      'Build a completion screen that accurately summarises a run, including which questions were missed.',
    ],
    requirements: [
      'A local array of at least 10 multiple-choice questions, each with several options and one correct answer.',
      'One question is shown at a time, with its options as selectable controls.',
      'Selecting an answer locks that question (no changing the answer after selecting) and shows whether it was correct.',
      'A **Next** control advances to the next question; the score updates as each question is answered, not only at the end.',
      'A progress indicator shows position in the quiz (e.g. "Question 4 of 10").',
      'A completion screen appears after the last question, showing the final score and a **Restart** control.',
      'The question order is shuffled at the start of each run, using a shuffle function that accepts an injectable random source so it can be tested deterministically.',
    ],
    milestones: [
      {
        id: 'm1',
        title: 'Render one question',
        tasks: [
          'Build the question data array.',
          'Render the question at a given index, with its options, from that array.',
        ],
      },
      {
        id: 'm2',
        title: 'Answer, lock, and score',
        tasks: [
          'Wire option selection: record the chosen answer, lock further changes to that question, and show correct/incorrect feedback.',
          'Update a running score as each question is answered.',
        ],
      },
      {
        id: 'm3',
        title: 'Navigate and track progress',
        tasks: [
          'Wire Next to advance the current-question index and render the next question.',
          'Show a position indicator that updates with the index.',
        ],
      },
      {
        id: 'm4',
        title: 'Injectable shuffle',
        tasks: [
          'Write a shuffle function taking the array to shuffle *and* a random-number source function as parameters, defaulting to `Math.random` but overridable.',
          'Shuffle the question order once at the start of each run using this function, and confirm — by passing in a fixed, repeating sequence in place of `Math.random` — that the same input sequence always produces the same shuffled order.',
        ],
      },
      {
        id: 'm5',
        title: 'Completion screen and restart',
        tasks: [
          'Detect the end of the quiz and show a completion screen with the final score out of the total.',
          'List which questions were answered incorrectly, with the correct answer shown.',
          'Wire Restart to reshuffle and begin a fresh run with the score and locked answers all reset.',
        ],
      },
    ],
    hints: [
      'Keep the question *data* and the *run state* (current index, answers given, score) as two separate values. Shuffling only ever touches an array of indices or question copies for the current run — the original question bank never changes.',
      'An injectable random source means writing your shuffle as `shuffle(array, random = Math.random)` and using `random()` instead of `Math.random()` inside it. A test can then pass a function that returns a fixed sequence of numbers and assert the exact resulting order — that is what "deterministic" means here, and it is the difference between a shuffle you can verify and one you can only eyeball.',
      'Locking a question after it is answered is a piece of per-question state (`answered: true`), not something you can infer from the score alone — without it, nothing stops a user from clicking a second option after already answering.',
    ],
    stretchGoals: [
      'A timer per question, with an automatic "no answer" if time runs out.',
      'Categories or difficulty levels that filter which questions are eligible for a run.',
      'Explanations shown after each answer, not just correct/incorrect.',
      'A persisted high-score list across multiple runs.',
    ],
    completionCriteria: [
      'A full run — every question, in shuffled order — produces an accurate final score matching the answers actually given.',
      'Once a question is answered, its answer cannot be changed.',
      'The completion screen correctly lists every missed question with its correct answer.',
      'Restart produces a fresh, correctly reset run, including a newly shuffled order.',
      'The shuffle function, given the same injected random sequence twice, produces the same order both times.',
    ],
    testingChecklist: [
      'Answer every question wrong on purpose and confirm the completion screen lists all of them as missed, with correct answers shown.',
      'Answer every question right and confirm a perfect score displays correctly.',
      'Try to change an answer after selecting one and confirm it is genuinely locked.',
      'Call your shuffle function twice with the same fixed random sequence and confirm the resulting order is identical both times — this is the test that proves the shuffle is truly injectable, not just theoretically so.',
    ],
    reflectionQuestions: [
      'Why does hardcoding `Math.random()` inside your shuffle function make it harder to test than passing the random source in as a parameter?',
      'What would you need to change if questions could have more than one correct answer?',
    ],
  },

  {
    id: 'pr-notes-application',
    slug: 'notes-application',
    title: 'Notes Application',
    difficulty: DIFFICULTY.MEDIUM,
    tagline: 'A notes app that renders user-written text safely, with autosave and full-text search.',
    brief:
      'Build a notes app: create, edit, delete and search plain-text notes, autosaved as the user types and ' +
      'persisted across reloads. The requirement that makes this a genuine security-habits project, not just ' +
      'another CRUD list: a note\'s content is untrusted user input, and it must be rendered as text, never as ' +
      'HTML — this project is where the platform\'s "avoid unsafe `innerHTML`" habit gets put into practice.',
    estimatedHours: '3–4',
    topicIds: ['storage', 'security', 'dom-manipulation', 'events'],
    prerequisites: [
      'Comfortable with `localStorage` persistence, ideally from the Todo or Bookmark project.',
      'Knows the difference between `textContent` and `innerHTML` and why it matters for untrusted content.',
    ],
    relatedLessons: ['l-m44-01', 'l-m27-01'],
    relatedChallenges: ['ch-str-escape-html', 'ch-dom-build-list'],
    objectives: [
      'Render arbitrary, untrusted user text safely — as text, never interpreted as markup — even when a note deliberately contains characters like `<`, `>` or `&`.',
      'Implement autosave that debounces writes rather than saving on every keystroke, and never loses the most recent change.',
      'Build search across note content, not just titles, correctly handling notes with no matches.',
    ],
    requirements: [
      'Create a new note, giving it a title and body.',
      'Notes are listed with a preview of their content; selecting one shows the full note for editing.',
      'Edits to the title or body autosave a short time after the user stops typing, without an explicit save button being required.',
      'A note\'s content — including any characters that look like HTML — is always displayed as literal text, never rendered as markup. A note whose body is literally `<script>alert(1)</script>` displays that text on screen, harmlessly, rather than doing anything else.',
      'A search box filters the note list by matching text anywhere in the title or body.',
      'Delete removes a note, with a confirmation step to guard against accidental loss.',
      'All notes persist in `localStorage`.',
    ],
    milestones: [
      {
        id: 'm1',
        title: 'Create and list notes safely',
        tasks: [
          'Build the create-note form and an in-memory array of notes.',
          'Render the note list using `textContent` (or an equivalent safe-text approach) for every piece of user-authored content — never `innerHTML` with raw note text.',
        ],
      },
      {
        id: 'm2',
        title: 'Select, view, and edit',
        tasks: [
          'Wire selecting a note from the list to show its full content in an editable view.',
          'Wire edits to title and body to update the in-memory note object.',
        ],
      },
      {
        id: 'm3',
        title: 'Debounced autosave',
        tasks: [
          'Write a debounce helper (or reuse a existing pattern) so that edits trigger a save only after the user pauses typing for a short interval, not on every keystroke.',
          'Confirm that switching away from a note, or closing the tab shortly after the last keystroke, does not lose an unsaved change — the debounce delay has to be short enough that this is not a real risk in practice.',
        ],
      },
      {
        id: 'm4',
        title: 'Search',
        tasks: [
          'Wire a search box that filters the visible note list by matching text in the title or body.',
          'Handle the no-results case with a clear message.',
        ],
      },
      {
        id: 'm5',
        title: 'Delete with confirmation, and persistence',
        tasks: [
          'Wire delete with a confirmation step before the note is actually removed.',
          'Persist the note array to `localStorage` on every save, and load it back correctly on startup, including the first-visit and corrupted-data cases.',
        ],
      },
    ],
    hints: [
      'Every place a note\'s title or body reaches the page — the list preview, the full editor view, search results — has to go through `textContent` or an equivalent, never string-concatenated into `innerHTML`. Test this deliberately by typing `<b>test</b>` into a note and confirming it shows those literal characters rather than bold text.',
      'A debounce wraps your save function so that calling it repeatedly in quick succession only actually executes once, after the calls stop — track a pending timeout, clear it on every new call, and only let the save run when the timeout finally fires uninterrupted.',
      'Search across both title and body is one `filter` call with a condition that checks both fields against the lowercased search term — case-insensitive matching is what most people expect from a search box, so lowercase both sides before comparing.',
    ],
    stretchGoals: [
      'Basic Markdown-style formatting (bold, italic) rendered safely — meaning the formatting is parsed by your own code into safe elements, not by dumping user text into `innerHTML`.',
      'Tags or folders for organizing notes, combined with search.',
      'A trash/undo window after delete, before the note is permanently gone.',
      'Export a single note, or all notes, as plain text or JSON.',
    ],
    completionCriteria: [
      'A note containing HTML-like text always displays as literal text, confirmed by an explicit test with a note body like `<img src=x onerror=alert(1)>`.',
      'Edits autosave without an explicit save button, and no keystroke is ever lost.',
      'Search correctly matches on both title and body, and handles zero matches gracefully.',
      'Delete requires confirmation and, once confirmed, is permanent and reflected in `localStorage`.',
      'A reload preserves every note and its full content.',
    ],
    testingChecklist: [
      'Create a note with the body `<img src=x onerror="window.__hacked = true">` and confirm nothing executes — the text displays literally and `window.__hacked` is never set.',
      'Type into a note, wait for autosave, then reload immediately — confirm the change survived.',
      'Search for a term that appears only in a note\'s body, not its title, and confirm it is found.',
      'Search for something that matches nothing and confirm the empty-results state is clear, not a blank list indistinguishable from "still loading."',
      'Delete a note and confirm the confirmation step actually blocks accidental deletion if dismissed.',
    ],
    reflectionQuestions: [
      'What specifically would go wrong — and how badly — if you rendered note bodies with `innerHTML` instead of `textContent`?',
      'Why debounce the autosave instead of either saving on every keystroke or requiring an explicit save button? What does debouncing trade away, and what does it buy?',
    ],
  },

  {
    id: 'pr-expense-tracker',
    slug: 'expense-tracker',
    title: 'Expense Tracker',
    difficulty: DIFFICULTY.MEDIUM,
    tagline: 'Track income and expenses by category with exact totals — money handled in integer cents throughout.',
    brief:
      'Track transactions — income and expenses, each with a category — and compute running totals: overall ' +
      'balance, totals by type, and totals by category. This project has an explicit testing requirement: the ' +
      'money arithmetic is exactly the kind of logic that silently drifts under floating point, so a chunk of ' +
      'this project is proving your totals are exact, not just eyeballing that they look right.',
    estimatedHours: '3–5',
    topicIds: ['arrays', 'objects', 'numbers', 'storage', 'testing'],
    prerequisites: [
      'Comfortable summing and grouping an array of objects by a field.',
      'Aware that `0.1 + 0.2 !== 0.3` in JavaScript, and roughly why.',
    ],
    relatedLessons: ['l-m13-01', 'l-m42-01'],
    relatedChallenges: ['ch-num-money', 'ch-arr-group-by', 'ch-arr-partition'],
    objectives: [
      'Represent money as integer cents throughout the application, converting only at the display boundary, to avoid floating-point drift entirely.',
      'Compute grouped totals (by type, by category) correctly and keep them in sync as transactions are added, edited and deleted.',
      'Write actual tests for the totalling logic — not just requirements — that would catch a regression if the arithmetic broke later.',
    ],
    requirements: [
      'Add a transaction: amount, type (income or expense), category, and a date.',
      'Transactions are listed, most recent first, each showing all its fields.',
      'A running balance (income minus expenses) is always visible and correct.',
      'Totals broken down by type (total income, total expenses) and by category are shown and update live as transactions change.',
      'Deleting a transaction updates every total that included it, correctly.',
      'A filter narrows the visible transactions and their corresponding totals by category, by type, or both.',
      'All monetary values are stored and computed as integer cents internally; only the display layer formats them as currency.',
    ],
    milestones: [
      {
        id: 'm1',
        title: 'Money in integer cents',
        tasks: [
          'Write a small money module: parse a user-entered amount string into integer cents, and format integer cents back into a display string — reuse the approach from the `money without rounding errors` challenge if you have solved it.',
          'Confirm, deliberately, that summing many small cent amounts (e.g. one hundred entries of 10 cents) gives exactly 1000 cents, not something drifted like 999.9999999999999.',
        ],
      },
      {
        id: 'm2',
        title: 'Add and list transactions',
        tasks: [
          'Wire the add form, converting the entered amount to integer cents immediately, and storing type, category and date alongside it.',
          'Render the transaction list, most recent first, formatting cents back to a currency string only at render time.',
        ],
      },
      {
        id: 'm3',
        title: 'Totals: overall, by type, by category',
        tasks: [
          'Compute the overall balance as one reduce over all transactions, in cents.',
          'Compute totals grouped by type and by category, updating whenever the transaction list changes.',
        ],
      },
      {
        id: 'm4',
        title: 'Delete and filter, keeping totals correct',
        tasks: [
          'Wire delete, and confirm every total correctly reflects the transaction\'s removal.',
          'Wire filtering by category and by type, and confirm the totals shown reflect the *filtered* set, not the full list, when a filter is active.',
        ],
      },
      {
        id: 'm5',
        title: 'Test the money logic explicitly',
        tasks: [
          'Write a handful of test cases (using the project\'s existing test setup, or a simple manual assertion script) for your money parsing, formatting, and total-computing functions specifically.',
          'Include at least: summing values that would drift under naive floating point, an empty transaction list, and a list of all-income or all-expense transactions.',
        ],
      },
      {
        id: 'm6',
        title: 'Persistence',
        tasks: [
          'Persist transactions to `localStorage`, storing amounts as integer cents, and load them back correctly — including the first-visit and corrupted-data cases.',
        ],
      },
    ],
    hints: [
      'The whole point of storing cents as integers is that they add and subtract exactly, with no floating-point surprises — the moment you convert a dollar amount to a JavaScript `Number` with a decimal point and start doing arithmetic on it, you have reintroduced the exact bug this project is designed to teach you to avoid.',
      'Grouped totals (by category, by type) are a single pass building a `Map` from key to running total — the same shape as a "group by" or "count by" utility, just accumulating cents instead of counting occurrences.',
      'When you write the tests for milestone 5, pick numbers that specifically would fail under naive floating point — `10` cents summed `100` times is a much better test than `100` and `200`, because the first one is exactly where `0.1 + 0.2` -style drift would show up if you had used dollars-as-floats instead of cents-as-integers.',
    ],
    stretchGoals: [
      'A monthly summary view, grouping transactions by month.',
      'A simple bar or pie breakdown by category (even a CSS-only bar chart counts — a full charting library is not required).',
      'Recurring transactions that auto-generate on a schedule.',
      'CSV export of the transaction list.',
    ],
    completionCriteria: [
      'Every total — overall balance, by type, by category — is exactly correct after any sequence of adds and deletes, verified against numbers you have checked by hand.',
      'Money is never stored or computed as a JavaScript float with a decimal point anywhere in the application logic.',
      'Filtering narrows both the visible list and the totals shown consistently.',
      'At least a few explicit tests exist for the money-handling functions and pass.',
      'Reloading the page preserves all transactions and their exact amounts.',
    ],
    testingChecklist: [
      'Add one hundred transactions of 10 cents each and confirm the total is exactly 1000 cents (`$10.00`), not a value with visible floating-point drift.',
      'Add a mix of income and expenses, then delete one, and confirm the balance, the by-type totals and the by-category totals all update correctly together.',
      'Filter to a category with a single transaction, confirm the shown total matches that one transaction, then clear the filter and confirm the total returns to the full sum.',
      'Reload after adding transactions with amounts that have a fractional cent risk if mishandled (e.g. `$19.99`, `$0.01`) and confirm they survive exactly.',
    ],
    reflectionQuestions: [
      'Show, with a concrete example, what would go wrong if you stored amounts as dollars-with-decimals instead of integer cents.',
      'Which function in your project was the most important to test explicitly, and what specific bug would a missing test there have let through unnoticed?',
    ],
  },

  {
    id: 'pr-weather-application',
    slug: 'weather-application',
    title: 'Weather Application',
    difficulty: DIFFICULTY.MEDIUM,
    tagline: 'Search a city for its weather via an injected fetch, with real loading, error and empty states.',
    brief:
      'Search for a city and show its current weather — temperature, conditions, a short forecast — using an ' +
      'async request layer with proper loading, error and success states. The request layer itself is designed ' +
      'to accept an **injected fetch function**, so the whole app can be built, run and automatically verified ' +
      'entirely offline against fixture data; connecting it to a real weather API afterwards is a documented, ' +
      'optional final step, not a requirement of the build.',
    estimatedHours: '3–5',
    topicIds: ['async-await', 'http', 'errors', 'forms', 'dom-manipulation'],
    prerequisites: [
      'Comfortable with `async`/`await`, `try`/`catch`, and the general shape of a `fetch` call.',
      'Understands why `fetch` resolving does not by itself mean the request succeeded — `response.ok` still has to be checked.',
    ],
    relatedLessons: ['l-m26-01', 'l-m25-01', 'l-m22-01'],
    relatedChallenges: ['ch-async-fetch-json', 'ch-async-poll', 'ch-eng-parse-safely'],
    objectives: [
      'Build a request layer that takes its `fetch` implementation as a parameter, which is what makes the whole app testable without a live network and without embedding a real API key anywhere.',
      'Represent a request\'s lifecycle explicitly — idle, loading, success, error — and render each state correctly, rather than inferring state from which variables happen to be set.',
      'Handle the specific failure shapes an API client actually has to deal with: a network failure, a non-OK HTTP response, and an empty or malformed result — each shown to the user differently.',
    ],
    requirements: [
      'A search field for a city name, submitted via a button or Enter.',
      'A **loading** state is shown while a request is in flight.',
      'A **success** state shows the city name, temperature, conditions, and a short multi-day forecast.',
      'An **error** state is shown distinctly for at least two different failure kinds: the city was not found, and the request failed outright (network or server error) — with different messages for each.',
      'The weather-fetching function accepts an injected `fetch`-like function as a parameter (or via a small client object), defaulting to the real `fetch` but overridable, so it can be driven entirely by fixture data in tests.',
      'No real API key is embedded in the client code. A short note in the project explains how a learner could wire in a real weather API of their choice afterwards, using an environment variable, not a hardcoded key.',
    ],
    milestones: [
      {
        id: 'm1',
        title: 'A fetch client you can inject',
        tasks: [
          'Write a `getWeather(city, { fetch })` function that calls the injected `fetch`, checks `response.ok`, and parses the JSON — following the pattern from the equivalent challenge if you have solved it.',
          'Write two or three fixture responses (a successful city, an unknown city, a malformed body) and call `getWeather` directly with a fake `fetch` returning each one, confirming the function behaves correctly for all three without touching the network.',
        ],
      },
      {
        id: 'm2',
        title: 'Wire the search form and loading state',
        tasks: [
          'Wire the search input and submit action to call `getWeather`.',
          'Show a visible loading state the instant a search starts, and clear it once the request settles, whichever way it goes.',
        ],
      },
      {
        id: 'm3',
        title: 'Success and result rendering',
        tasks: [
          'Render the city, temperature, conditions and forecast from a successful result.',
          'Confirm searching a second city fully replaces the first result rather than appending to it.',
        ],
      },
      {
        id: 'm4',
        title: 'Distinct error states',
        tasks: [
          'Show a specific "city not found" message when the API reports no match.',
          'Show a different, generic failure message when the request itself fails (network error or unexpected server error) — the two should read differently to the user.',
          'Confirm that an error from one search does not leave stale success data visible underneath it.',
        ],
      },
      {
        id: 'm5',
        title: 'Optional: connect a real API',
        tasks: [
          'As an optional final step, read the notes on wiring in a real weather API using your own key via an environment variable, and try it — this step is not required for the project to be considered complete.',
        ],
      },
    ],
    hints: [
      'The injected-fetch pattern is: your weather function takes an options object with a `fetch` property, defaulting to the real global `fetch`, and calls `options.fetch(...)` instead of the bare global everywhere inside it. A test then passes `{ fetch: async () => fixtureResponse }` and gets fully deterministic behaviour with zero network calls.',
      '`fetch` only rejects on a genuine network failure — a 404 or a 500 still resolves successfully as far as `fetch` is concerned, which is why checking `response.ok` explicitly is what separates "the city was not found" from "the request itself failed." Conflating the two is the most common bug in a first attempt at this project.',
      'Model the request state as one variable with a small set of values (`"idle" | "loading" | "success" | "error"`) rather than several booleans that could disagree with each other — render a single view based on that one variable.',
    ],
    stretchGoals: [
      'Remember the last few searched cities and let the user reselect one quickly.',
      'Units toggle (Celsius/Fahrenheit) applied without a new request.',
      'A five-day forecast rendered as a small horizontal strip.',
      'Debounce or dedupe rapid repeated searches for the same city (see the related async challenges for the underlying technique).',
    ],
    completionCriteria: [
      'The loading, success and error states are each visibly distinct and each appears at the correct moment.',
      'The weather-fetching function works correctly when driven entirely by injected fixture data, with no live network call in the automated verification path.',
      '"City not found" and "request failed" show different messages.',
      'No API key appears anywhere in the client-side source code.',
      'Searching a new city always replaces, rather than appends to, the previously shown result.',
    ],
    testingChecklist: [
      'Call your weather function directly with a fake `fetch` returning a successful fixture, and confirm the parsed result is correct.',
      'Call it with a fake `fetch` returning a 404-style not-found response, and confirm the specific not-found path is taken.',
      'Call it with a fake `fetch` that rejects (simulating an offline network), and confirm the generic failure path is taken, distinctly from the not-found path.',
      'In the actual UI, search a city, then immediately search another before the first (simulated) request settles, and confirm the final displayed result matches the most recent search.',
    ],
    reflectionQuestions: [
      'Why is "the fetch promise resolved" not the same thing as "the request succeeded," and where in your code do you draw the line between the two?',
      'What would you have had to build differently if `getWeather` called the global `fetch` directly instead of accepting it as a parameter?',
    ],
  },

  {
    id: 'pr-recipe-finder',
    slug: 'recipe-finder',
    title: 'Recipe Finder',
    difficulty: DIFFICULTY.MEDIUM,
    tagline: 'Search recipes by ingredient with pagination, favorites, and an offline-testable mock API layer.',
    brief:
      'Search a recipe collection by ingredient or keyword, page through results, view full details, and save ' +
      'favorites. Like the Weather project, the data layer is built around an injected fetch function backed by ' +
      'local fixture data — the search, pagination and detail-view logic are all real and fully verifiable ' +
      'offline, whether or not a real recipe API is ever connected.',
    estimatedHours: '3–5',
    topicIds: ['async-await', 'http', 'arrays', 'storage', 'errors'],
    prerequisites: [
      'Comfortable with `async`/`await` and array pagination logic (slicing a results array into pages).',
      'Has built at least one prior project with `localStorage` persistence.',
    ],
    relatedLessons: ['l-m26-01', 'l-m13-01'],
    relatedChallenges: ['ch-async-fetch-json', 'ch-arr-chunk', 'ch-eng-parse-safely'],
    objectives: [
      'Build a searchable, paginated result list from an async data source, correctly handling empty results and a query that changes mid-request.',
      'Persist a set of favorites (recipe ids) independently of the search results themselves, and let it survive a reload and new searches.',
      'Keep the mock data layer swappable for a real API without changing any of the surrounding UI logic.',
    ],
    requirements: [
      'A search field for an ingredient or keyword; submitting it fetches (via the injected client) matching recipes.',
      'Results are shown a page at a time (e.g. 6 or 8 per page) with Next/Previous controls; the total result count and current page are visible.',
      'Clicking a recipe shows its full detail: ingredients, instructions, and any other fields your fixture data provides.',
      'A favorite control on each recipe (in the list and in the detail view) toggles it in and out of a persisted favorites list.',
      'A separate view (or filter) shows only favorited recipes.',
      'An empty-results state is shown distinctly from the loading state and from a genuine error.',
      'The recipe client accepts an injected fetch-like function, defaulting to a local mock dataset, so search and pagination are fully testable offline.',
    ],
    milestones: [
      {
        id: 'm1',
        title: 'Mock data and an injectable client',
        tasks: [
          'Build a local fixture dataset of at least 20 recipes with varied ingredients.',
          'Write a `searchRecipes(query, { fetch })` (or an equivalent client function over your mock data) that filters by ingredient/keyword — call it directly with a few queries and confirm the results are correct before wiring any UI.',
        ],
      },
      {
        id: 'm2',
        title: 'Search and render a results list',
        tasks: [
          'Wire the search form to call the client and render the resulting list.',
          'Show loading and empty-results states correctly, distinct from each other and from an error state.',
        ],
      },
      {
        id: 'm3',
        title: 'Pagination',
        tasks: [
          'Slice the full result set into pages of a fixed size and render only the current page.',
          'Wire Next/Previous, disabling or hiding whichever control does not apply at the first or last page.',
          'Confirm starting a new search resets pagination back to the first page.',
        ],
      },
      {
        id: 'm4',
        title: 'Detail view',
        tasks: [
          'Wire clicking a recipe to show its full detail — ingredients and instructions at minimum.',
          'Confirm navigating back to the results list preserves the current search and page.',
        ],
      },
      {
        id: 'm5',
        title: 'Favorites, persisted',
        tasks: [
          'Wire a favorite toggle available both in the list and the detail view, keeping them in sync for the same recipe.',
          'Persist the favorites list (recipe ids only, not full recipe data) to `localStorage`.',
          'Build a favorites-only view that resolves the stored ids back against the recipe dataset and renders them.',
        ],
      },
    ],
    hints: [
      'Persist only the favorited *ids*, not the full recipe objects — then a favorites view is just "filter the full dataset (or a fresh fetch) down to the ids I have stored," which stays correct even if the underlying recipe data changes.',
      'Pagination is one `array.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize)` over the already-filtered results — computed fresh from the current search results and current page index, never mutated in place.',
      'Because the client takes an injectable fetch-like function, your automated tests (and your own manual verification) can call it directly with a controlled fixture and check the exact returned results — you do not need to click through the UI to prove the search logic itself is correct.',
    ],
    stretchGoals: [
      'Filter by multiple ingredients at once (must contain all, or must contain any — pick one and document it).',
      'Sort results by name, by number of ingredients, or by another field in your fixture data.',
      'A "surprise me" control that picks a random recipe from the current results.',
      'Connect a real recipe API afterwards as an optional step, following the same injected-client pattern.',
    ],
    completionCriteria: [
      'Search returns correct, filtered results from the mock dataset for several different queries, verified by calling the client function directly.',
      'Pagination correctly slices the results and resets to page one on every new search.',
      'The detail view shows complete, correct information for any selected recipe.',
      'Favoriting a recipe in the list and the detail view stay in sync, and favorites survive a reload.',
      'Loading, empty-results and error states are each visually distinct.',
    ],
    testingChecklist: [
      'Search a term that matches many recipes and confirm pagination produces the correct number of pages with no recipe appearing on two pages or missing entirely.',
      'Search a term that matches nothing and confirm the empty-results state appears, not an error or an infinite loading spinner.',
      'Favorite several recipes across different search results, reload the page, and confirm the favorites view still shows exactly those recipes.',
      'Un-favorite a recipe from the detail view and confirm it also updates in the list view without needing a manual refresh.',
    ],
    reflectionQuestions: [
      'Why store only recipe ids in the favorites list instead of full recipe objects? What would break, or become harder, if you stored full objects instead?',
      'What would need to change in your client function — and, ideally, nothing else in your UI code — to point this app at a real recipe API?',
    ],
  },

  {
    id: 'pr-habit-tracker',
    slug: 'habit-tracker',
    title: 'Habit Tracker',
    difficulty: DIFFICULTY.MEDIUM,
    tagline: 'Track daily habits with a streak calculation that is correct across real calendar boundaries.',
    brief:
      'Track a set of daily habits, mark each one done for a given day, and compute a genuinely correct streak ' +
      '— consecutive days completed, ending today or yesterday, broken by any missed day. Streak logic looks ' +
      'trivial until you actually implement it against real dates: month boundaries, differing month lengths, ' +
      'and "did they do it today yet" are exactly where naive versions quietly get the count wrong.',
    estimatedHours: '3–5',
    topicIds: ['dates', 'arrays', 'objects', 'storage', 'dom-manipulation'],
    prerequisites: [
      'Comfortable computing with `Date` objects, including comparing two dates by calendar day rather than by timestamp.',
      'Has persisted structured data to `localStorage` in a previous project.',
    ],
    relatedLessons: ['l-m16-01', 'l-m27-01'],
    relatedChallenges: ['ch-date-days-between', 'ch-date-business-days'],
    objectives: [
      'Represent "done" as a per-habit set of calendar days, keyed consistently regardless of time of day, rather than a fragile boolean-per-day array.',
      'Compute a correct current streak — including the "have they done it yet today" edge case, which changes whether an unbroken streak still counts as active.',
      'Render a simple calendar or grid view that accurately reflects the stored completion data at a glance.',
    ],
    requirements: [
      'Add and remove habits from a tracked list, each with a name.',
      'For each habit, mark today as done or not done, and view completion history for at least the last 30 days.',
      'A current streak (consecutive completed days, most recent first) is computed and shown per habit.',
      'The streak calculation correctly handles: a streak still counting as "current" if today is not yet marked but yesterday was (the day is not over), and a streak resetting to zero the day after a day was missed.',
      'A simple visual grid (a week or month view) shows completed versus missed days for a habit at a glance.',
      'All habits and their completion history persist in `localStorage`.',
    ],
    milestones: [
      {
        id: 'm1',
        title: 'Habits and daily marking',
        tasks: [
          'Wire add/remove for habits, stored in an in-memory array.',
          'For each habit, store completed days as a set of date-key strings (e.g. `"2024-03-01"`), and wire a toggle for "today."',
        ],
      },
      {
        id: 'm2',
        title: 'History grid',
        tasks: [
          'Render the last 30 days for a habit as a grid or strip, each cell reflecting whether that specific calendar day is in the habit\'s completed set.',
          'Confirm the grid is built from real calendar days working backwards from today, not just "the last 30 entries added," which would be wrong if a day were skipped.',
        ],
      },
      {
        id: 'm3',
        title: 'Streak calculation',
        tasks: [
          'Write a `currentStreak(completedDays, today)` function, taking "today" as a parameter rather than reading `new Date()` internally, so it can be tested against fixed dates.',
          'Walk backwards day by day from today: if today is done, start counting from today; if today is not done but yesterday is, start counting from yesterday (today is still "in progress"); otherwise the streak is 0.',
          'Test explicitly across a month boundary (e.g. a streak ending on the 1st of a month, counting back into the last few days of the previous month) and confirm the day-length difference between months does not break the count.',
        ],
      },
      {
        id: 'm4',
        title: 'Persistence',
        tasks: [
          'Persist habits and their completed-day sets to `localStorage`, and load them back correctly on startup — including a first visit and a corrupted stored value.',
        ],
      },
    ],
    hints: [
      'Storing completed days as `"YYYY-MM-DD"` strings sidesteps almost every time-of-day and time-zone headache a raw timestamp would introduce — two visits on the same calendar day, at different times, produce the same key, and comparing keys is just string equality.',
      'Taking "today" as an explicit parameter into your streak function (rather than calling `new Date()` inside it) is what makes the month-boundary case testable at all — you can pass in a fixed date like `new Date("2024-03-01")` and get a reproducible, checkable answer.',
      'The "today not yet marked, but yesterday was" rule is the detail almost every first attempt misses: a user who has a real unbroken streak but has not yet done today\'s habit should not see their streak reset to zero at midnight — it should still show as active until the day is actually over and missed.',
    ],
    stretchGoals: [
      'A longest-streak-ever record per habit, kept alongside the current streak.',
      'Weekly or monthly completion percentage per habit.',
      'Reminders or a "habits not yet done today" summary at the top of the page.',
      'Habit categories or colour coding.',
    ],
    completionCriteria: [
      'The current streak is correct for a variety of hand-checked scenarios, including one that crosses a month boundary.',
      'A habit done every day up to and including yesterday, but not yet today, still shows an active streak rather than resetting to zero.',
      'A habit with a missed day resets its streak to zero starting the day after the miss.',
      'The 30-day grid accurately reflects real calendar days, not just a count of stored entries.',
      'All data survives a reload.',
    ],
    testingChecklist: [
      'Call `currentStreak` directly with a fixed "today" and a hand-built set of completed days spanning a month boundary — verify the result by counting on a calendar yourself.',
      'Mark a habit done for several consecutive days including yesterday, but not today, and confirm the streak still shows as active, not reset.',
      'Miss one day in the middle of an otherwise unbroken run and confirm the streak correctly resets starting from the day after the miss.',
      'Add a habit, mark several days, reload the page, and confirm both the habit and its full history survived.',
    ],
    reflectionQuestions: [
      'Why does taking "today" as a parameter rather than calling `new Date()` internally matter for testing your streak logic?',
      'What is the actual rule your app uses to decide whether an unbroken streak is still "current" versus broken, and can you state it in one sentence?',
    ],
  },
];

export default projects;
