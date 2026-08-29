import { DIFFICULTY } from '../schema/types.js';

/**
 * Hard projects — real architecture demands, not just more markup. Two of
 * these require an explicit multi-file module split (api/state/render/events)
 * so the learner practises dependency direction, not just more JavaScript in
 * one file; one requires debounce, caching and request deduplication against
 * a live-feeling but fully mocked search API.
 */

export const projects = [
  {
    id: 'pr-movie-search',
    slug: 'movie-search',
    title: 'Movie Search',
    difficulty: DIFFICULTY.HARD,
    tagline: 'A search-as-you-type movie finder with debounced input, response caching, and request deduplication.',
    brief:
      'Build a search-as-you-type interface over a movie dataset: results update as the user types, without ' +
      'firing a request on every keystroke, without racing an old slow response against a newer one, and ' +
      'without re-fetching a query the app already has cached. This is the project built specifically around ' +
      'debounce, caching and deduplication — three closely related but genuinely different problems that a ' +
      'realistic search box actually has all at once.',
    estimatedHours: '5–8',
    topicIds: ['async-await', 'performance', 'http', 'errors', 'event-loop'],
    prerequisites: [
      'Comfortable with `async`/`await`, and has built at least one project with an injected-fetch client (Weather or Recipe Finder).',
      'Understands, at least at a basic level, why an older slow response arriving after a newer fast one is a real bug, not a theoretical one.',
    ],
    relatedLessons: ['l-m43-01', 'l-m26-01'],
    relatedChallenges: ['ch-fn-debounce', 'ch-async-dedupe', 'ch-eng-memo-cache-size', 'ch-async-fetch-json'],
    objectives: [
      'Implement debounce correctly on real user input, distinguishing it clearly from throttling.',
      'Prevent a race condition where an older, slower request\'s response overwrites a newer one that already arrived — a bug that is invisible on a fast connection and constant on a slow one.',
      'Add a bounded response cache and in-flight request deduplication, and be able to demonstrate, with a counter, that repeated identical searches do not re-hit the mock network.',
    ],
    requirements: [
      'A search field over a local mock movie dataset (at least 30 titles), searched via an injected-fetch-style async client, not synchronously.',
      'Input is debounced — a request fires only after the user pauses typing for a short interval, not on every keystroke.',
      'Results always reflect the **most recently submitted** query, even if an earlier query\'s (simulated) response arrives later — a stale response must never overwrite a fresher one.',
      'Identical searches within a short window are served from a cache instead of re-invoking the mock network layer, demonstrably (a visible or logged request counter is enough proof).',
      'Two components requesting the same in-flight query at the same time trigger only one underlying request, both resolving from it.',
      'Loading, empty-results, and error states are each shown distinctly.',
    ],
    milestones: [
      {
        id: 'm1',
        title: 'Mock client with artificial, variable latency',
        tasks: [
          'Build the local movie dataset and a `searchMovies(query, { fetch })`-style function filtering it.',
          'Give the mock fetch an artificial, variable delay (e.g. random between 50–500ms) so that response ordering is not guaranteed to match request ordering — this is what will let you actually observe a race condition instead of only reading about one.',
        ],
      },
      {
        id: 'm2',
        title: 'Debounce the input',
        tasks: [
          'Wire the search field so a request only fires after the user has paused typing, using a debounce implementation you understand rather than one copied without reading.',
          'Confirm — by counting requests — that typing a full word quickly triggers roughly one request, not one per keystroke.',
        ],
      },
      {
        id: 'm3',
        title: 'Fix the race condition',
        tasks: [
          'Type a query, then quickly change it before the first request\'s (artificially delayed) response arrives, and observe — before fixing anything — that the stale first response can currently overwrite the second query\'s correct results on screen.',
          'Fix it: tag each request with an identifier (an incrementing counter, or the query itself) and, when a response arrives, only apply it to the UI if it is still the most recent request made.',
        ],
      },
      {
        id: 'm4',
        title: 'Cache and deduplicate',
        tasks: [
          'Add a bounded cache keyed by query, so a repeated identical search within a short window returns the cached result instead of calling the mock fetch again.',
          'Add deduplication for concurrent identical in-flight requests, so two near-simultaneous searches for the same query share one underlying call rather than issuing two.',
          'Instrument a visible request counter and demonstrate, by searching the same term repeatedly, that the counter does not increase on a cache hit.',
        ],
      },
      {
        id: 'm5',
        title: 'States and polish',
        tasks: [
          'Show loading, empty-results and error states distinctly, correctly interacting with the debounce (e.g. do not show "no results" while still debouncing, before any request has even fired).',
        ],
      },
    ],
    hints: [
      'Debounce and throttle solve different problems and are easy to mix up: debounce waits for a pause in activity before acting once; throttle acts at a steady maximum rate throughout continuous activity. A search box wants debounce — you want to know the user has stopped typing, not to search once every N milliseconds while they are still typing.',
      'The stale-response race is reproducible on purpose here because of the artificial variable delay: fire a search for `"a"`, then before it can possibly resolve, search for `"b"` — if your first attempt shows `"a"`\'s results after `"b"`\'s request was the last one made, you have found the exact bug this milestone exists to teach you to fix.',
      'Tagging each request with a sequence number and checking `if (thisRequestId !== latestRequestId) return;` right before applying a response to the UI is the standard, minimal fix for the stale-response race — it does not need to cancel the old request, only ignore its result.',
      'A cache and a request counter are two different but related pieces of state: the cache decides whether to call the network at all, and the counter (or an equivalent test hook) is how you *prove*, rather than merely claim, that the cache is doing its job.',
    ],
    stretchGoals: [
      'Use `AbortController` to genuinely cancel a stale in-flight request rather than only ignoring its result when it arrives.',
      'Show cached results instantly while a background refresh silently checks whether they are still current ("stale-while-revalidate").',
      'A visible cache-hit indicator distinct from a fresh network response, purely for demonstration.',
      'Highlight the matched portion of each result\'s title.',
    ],
    completionCriteria: [
      'Typing a full search term quickly triggers roughly one request, not one per keystroke — confirmed with a request counter.',
      'A demonstrated race (old query changed to a new one before the first response arrives) never results in stale data being shown.',
      'Repeating an identical search within the cache window does not increase the request counter.',
      'Two near-simultaneous identical searches result in exactly one underlying mock-network call.',
      'Loading, empty and error states are each correct and visually distinct.',
    ],
    testingChecklist: [
      'Search `"a"`, then immediately search `"al"` before the mock network could plausibly have responded to the first — confirm the final displayed results match `"al"`, never `"a"`.',
      'Search the same exact term three times in a row and confirm the request counter increases by at most one (the first search), not three.',
      'Fire two components (or two calls) requesting the same in-flight query simultaneously and confirm only one request was actually made.',
      'Search a term matching nothing and confirm the empty-results state appears, distinct from a loading state that never resolves.',
    ],
    reflectionQuestions: [
      'Before you fixed it, what exactly caused the stale response to win — and why does a slower connection make that bug more likely to be seen, rather than less?',
      'What is the concrete difference in behaviour between your cache (which avoids a request entirely) and your deduplication (which shares one in-flight request)? Give an example where only one of the two would help.',
    ],
  },

  {
    id: 'pr-github-profile-finder',
    slug: 'github-profile-finder',
    title: 'GitHub Profile Finder',
    difficulty: DIFFICULTY.HARD,
    tagline: 'Look up a developer profile and repositories via a mocked GitHub-shaped API, with real error handling.',
    brief:
      'Search a username and show their profile and repositories, built against a **mocked GitHub-shaped API** ' +
      'so the whole project is verifiable offline with no rate limits, no real network dependency, and no ' +
      'account required. The design work is in handling everything a real API client has to handle: a user ' +
      'that does not exist, a user with zero public repositories, and a request that fails outright — each ' +
      'shown correctly and distinctly.',
    estimatedHours: '4–7',
    topicIds: ['async-await', 'http', 'errors', 'dom-manipulation', 'dom'],
    prerequisites: [
      'Comfortable with an injected-fetch client, ideally from the Weather or Recipe Finder project.',
      'Basic familiarity with how the real GitHub REST API is shaped (a user object, a list of repos) is helpful but not required — your mock defines the shape.',
    ],
    relatedLessons: ['l-m26-01', 'l-m22-01'],
    relatedChallenges: ['ch-async-fetch-json', 'ch-eng-parse-safely', 'ch-str-escape-html'],
    objectives: [
      'Build a client against a documented, GitHub-shaped response format, entirely mocked, so the exact same client code would work against the real API with only the base URL and auth changed.',
      'Handle the specific error shapes a real profile lookup has to handle: not-found, zero-repositories, and outright request failure — each distinctly.',
      'Render user-controlled or API-sourced text (bios, repo descriptions) safely, and build accessible profile and repo cards.',
    ],
    requirements: [
      'A search field for a GitHub-style username, submitted via a mocked client with a fixture dataset of at least 5 sample users, one of which has zero repositories and one of which does not exist.',
      'On a found user, show their avatar (a placeholder image is fine), name, bio, and basic stats (followers, public repo count).',
      'Below the profile, show a list of the user\'s repositories with name, description, and primary language, sourced from the mock.',
      'A user with zero public repositories shows a specific "no public repositories" state, distinct from a user not being found at all.',
      'A username that does not exist in the mock dataset shows a clear "user not found" message, distinct from a generic request failure.',
      'A simulated request failure (your mock client should support forcing this for testing) shows a distinct, generic error state.',
      'All text sourced from the mock data (bio, repo descriptions) is rendered safely — as text, never interpreted as HTML.',
    ],
    milestones: [
      {
        id: 'm1',
        title: 'Mock client and fixture data',
        tasks: [
          'Design a small, GitHub-shaped fixture dataset: at least 5 users with realistic-looking fields, one with an empty repo list.',
          'Write `getUser(username, { fetch })` and `getRepos(username, { fetch })` (or a combined function) that look up the fixture data and return a not-found error for anything not in it.',
        ],
      },
      {
        id: 'm2',
        title: 'Search and render a found profile',
        tasks: [
          'Wire the search form to call the client and render a successful profile, including stats and the repo list.',
          'Render every piece of API-sourced text safely (as text, never `innerHTML`).',
        ],
      },
      {
        id: 'm3',
        title: 'Not-found and zero-repos states',
        tasks: [
          'Show a specific message when the searched username does not exist in the mock data.',
          'Show a specific, different message when the user exists but has no public repositories — do not conflate this with not-found.',
        ],
      },
      {
        id: 'm4',
        title: 'Simulated failure and loading',
        tasks: [
          'Add a way to force your mock client to simulate an outright request failure (a flag, a special "always fails" username, or similar), and wire a distinct error state for it.',
          'Show a loading state while a lookup is in progress.',
        ],
      },
      {
        id: 'm5',
        title: 'Accessible cards',
        tasks: [
          'Confirm the profile and repo cards use meaningful headings and alt text, and that everything interactive is keyboard-reachable.',
          'Check color contrast on any status/error text you have added.',
        ],
      },
    ],
    hints: [
      'Designing your mock client\'s function signature to match how you would call a real API (`getUser(username, options)`, returning a promise, throwing or rejecting with typed error information) is what makes "connect this to the real GitHub API later" a small, mechanical change rather than a rewrite — the point is not to fake GitHub forever, it is to build against a realistic contract without a live dependency.',
      'Not-found and zero-repositories are two different facts about two different things — one says "this user does not exist," the other says "this user exists but chose to publish nothing." Conflating them into one "nothing to show" state loses real information the user would want.',
      'A dedicated "always fails" test username (or an injectable failure flag) in your mock is what lets you actually exercise and verify the generic-failure UI path, rather than only trusting it looks right by reading the code.',
    ],
    stretchGoals: [
      'Sort or filter the repository list by language or star count.',
      'A small language-distribution chart across a user\'s repositories (a CSS bar breakdown is enough).',
      'Recently-searched usernames, persisted and quick to reselect.',
      'Connect the real GitHub REST API afterwards as an optional final step, swapping only the client\'s base URL and adding rate-limit-aware error handling.',
    ],
    completionCriteria: [
      'A found user with repositories renders a complete, correct profile and repo list from the mock data.',
      'A found user with zero repositories shows a distinct message, not the not-found message.',
      'A username not in the mock dataset shows a distinct not-found message.',
      'A simulated request failure shows a distinct generic error message.',
      'No API-sourced text is ever rendered as HTML — verified with a fixture bio containing HTML-like characters.',
    ],
    testingChecklist: [
      'Search a username known to exist with repositories and confirm every field renders correctly.',
      'Search the username you designated as having zero repositories and confirm the correct distinct state appears.',
      'Search a username not present anywhere in your fixture data and confirm the not-found state, not a crash or a blank screen.',
      'Trigger your simulated-failure path and confirm the generic error state appears and is visually distinct from not-found.',
      'Add a fixture bio containing `<script>` or similar and confirm it renders as literal text.',
    ],
    reflectionQuestions: [
      'What is the actual difference, in your code, between "not found" and "zero repositories," and why does the distinction matter to whoever is using the app?',
      'If a real API rate-limited you mid-search, where in your current client would that fit — as a new error type, or as one of the two you have already built?',
    ],
  },

  {
    id: 'pr-kanban-board',
    slug: 'kanban-board',
    title: 'Kanban Board',
    difficulty: DIFFICULTY.HARD,
    tagline: 'A multi-column task board with move controls, persisted structured state, and drag-and-drop as a stretch.',
    brief:
      'Build a Kanban board: multiple named columns, cards that can be created, edited, deleted and moved ' +
      'between columns — and, within a column, reordered. Full drag-and-drop is offered as a stretch goal, not ' +
      'a core requirement, specifically so the project stays about state and architecture rather than becoming ' +
      'a fight with the HTML Drag and Drop API; explicit move controls (or keyboard-driven moves) are the ' +
      'required baseline.',
    estimatedHours: '5–8',
    topicIds: ['data-structures', 'objects', 'arrays', 'dom-manipulation', 'storage'],
    prerequisites: [
      'Comfortable modelling nested structured data (columns containing ordered lists of cards).',
      'Has built at least one project with `localStorage` persistence of non-trivial structured data.',
    ],
    relatedLessons: ['l-m34-01', 'l-m13-01'],
    relatedChallenges: ['ch-ds-linked-list', 'ch-obj-set-in', 'ch-dom-delegation'],
    objectives: [
      'Model a board as columns of ordered cards, and change that structure correctly for every operation: add, edit, delete, move between columns, reorder within a column.',
      'Implement moves without full drag-and-drop first, so the underlying state operations are correct and tested before any pointer-tracking complexity is added.',
      'Persist and restore genuinely nested structured data, not a flat list.',
    ],
    requirements: [
      'At least three named columns (e.g. To Do, In Progress, Done), configurable in count and name.',
      'Add a card to a column with a title and optional description.',
      'Edit and delete an existing card.',
      'Move a card to an adjacent column (or any column, via a control) without full drag-and-drop — buttons, a select control, or keyboard shortcuts are all acceptable.',
      'Reorder cards within a column (move up / move down is sufficient).',
      'A card count is shown per column.',
      'The full board — columns, their cards, and card order — persists in `localStorage` and survives a reload.',
    ],
    milestones: [
      {
        id: 'm1',
        title: 'Model and render the board',
        tasks: [
          'Design the data shape: an ordered list of columns, each holding an ordered list of card objects.',
          'Render the board from this structure — every column with its cards, in order.',
        ],
      },
      {
        id: 'm2',
        title: 'Add, edit, delete',
        tasks: [
          'Wire adding a card to a specific column.',
          'Wire editing a card\'s title and description in place.',
          'Wire deleting a card, removing it from its column\'s list.',
        ],
      },
      {
        id: 'm3',
        title: 'Move between columns',
        tasks: [
          'Wire a move control (buttons or a select) that relocates a card from its current column into another, at the end of the destination column\'s list.',
          'Confirm moving a card removes it from exactly its origin column and adds it to exactly the destination — no duplication, no card left behind in two places.',
        ],
      },
      {
        id: 'm4',
        title: 'Reorder within a column',
        tasks: [
          'Wire move-up/move-down controls that swap a card\'s position with its neighbour within the same column.',
          'Confirm the first card cannot move up further and the last cannot move down further — the controls should be disabled or absent at the edges, not silently do nothing.',
        ],
      },
      {
        id: 'm5',
        title: 'Persistence',
        tasks: [
          'Persist the entire nested board structure to `localStorage` and restore it correctly on load, including the first-visit and corrupted-data cases.',
          'Confirm card order within each column, and column order itself, both survive a reload exactly as left.',
        ],
      },
    ],
    hints: [
      'Building move-between-columns and reorder-within-a-column as explicit button-driven operations first is what lets you verify the underlying state transitions are correct in isolation — full drag-and-drop, if you attempt it as a stretch goal, becomes "call the same already-correct move function, triggered by a drop event" rather than a rewrite of your data logic under pointer-tracking pressure.',
      'A move is a delete from one list plus an insert into another, done as one operation against your data — not two separate, independently-triggered steps that could leave the board in an inconsistent state if only one of them ran.',
      'When persisting nested data, serialise and restore the *whole* board structure as one JSON blob rather than trying to persist columns and cards as separate, correlated pieces — keeping the structure in one place removes an entire category of "the columns and the cards disagree after reload" bugs.',
    ],
    stretchGoals: [
      'Full HTML5 drag-and-drop for moving and reordering cards, built on top of your already-correct move functions.',
      'Card labels or tags, filterable across the whole board.',
      'A due date per card, with overdue cards visually flagged.',
      'Column-level actions: clear all cards in a column, or archive a column.',
    ],
    completionCriteria: [
      'Every operation — add, edit, delete, move between columns, reorder within a column — leaves the board in a correct, consistent state.',
      'A moved card never ends up duplicated or lost.',
      'Reordering respects the edges of a column (no moving past the first or last position).',
      'The full nested board structure, including order, survives a reload exactly as it was left.',
      'Per-column card counts are always accurate.',
    ],
    testingChecklist: [
      'Move a card from the first column to the last, then check both columns\' contents to confirm it appears in exactly one place.',
      'Reorder a card to the very top of a column and try to move it up again — confirm nothing breaks and it does not disappear or duplicate.',
      'Add several cards across multiple columns, reload, and confirm every column has the same cards in the same order as before.',
      'Delete a card that was not at the end of its column\'s list and confirm the remaining cards keep their relative order.',
    ],
    reflectionQuestions: [
      'Why does implementing move-by-button before attempting drag-and-drop make the eventual drag-and-drop implementation, if you build it, easier and more likely to be correct?',
      'What specific bug would you expect if "delete from origin column" and "add to destination column" were two independent operations instead of one?',
    ],
  },

  {
    id: 'pr-product-search-filter',
    slug: 'product-search-and-filter',
    title: 'Product Search & Filter',
    difficulty: DIFFICULTY.HARD,
    tagline: 'Combine free-text search, multiple filters and sorting over a product catalog — all composing correctly.',
    brief:
      'Build a product catalog browser: free-text search, filter by category and price range, and sort by ' +
      'several fields — all applied together, correctly, in any order the user chooses to use them. The hard ' +
      'part is not any single filter; it is making search, category, price range and sort all compose without ' +
      'one silently overriding another, which is exactly what happens in most first attempts.',
    estimatedHours: '4–7',
    topicIds: ['arrays', 'array-methods', 'forms', 'dom-manipulation', 'performance'],
    prerequisites: [
      'Very comfortable chaining `filter`, `sort` and derived state over an array of objects.',
      'Understands why deriving the visible list fresh from the full dataset each time is safer than mutating a working copy.',
    ],
    relatedLessons: ['l-m13-01', 'l-m20-01'],
    relatedChallenges: ['ch-arr-sort-by', 'ch-arr-partition', 'ch-fn-debounce'],
    objectives: [
      'Compose several independent filtering and sorting operations into one pipeline that produces a correct result regardless of the order the user applies them in.',
      'Derive the visible product list fresh from the full catalog on every change, rather than progressively narrowing a working copy that cannot be widened again.',
      'Keep the UI responsive on a reasonably large catalog by debouncing the free-text search specifically, while filters and sort apply immediately.',
    ],
    requirements: [
      'A local product catalog of at least 50 items, each with a name, category, price and a couple of other filterable fields (e.g. rating, in-stock status).',
      'A free-text search box matching product names (and optionally descriptions), debounced so it does not re-filter on every keystroke.',
      'A category filter (multi-select or checkboxes) narrowing to one or more categories at once.',
      'A price range filter (min and/or max).',
      'A sort control: by price ascending/descending, by name, and at least one other field.',
      'All active filters, search and sort combine correctly and simultaneously — narrowing by category and then searching narrows further within that category, not instead of it, and vice versa.',
      'A visible count of matching products, and a clear empty-state message when no products match the combined criteria.',
      'Clearing all filters returns to the full, unsorted-or-default-sorted catalog.',
    ],
    milestones: [
      {
        id: 'm1',
        title: 'Render the full catalog',
        tasks: [
          'Build the product dataset and render it as a grid or list, unfiltered.',
        ],
      },
      {
        id: 'm2',
        title: 'One filter at a time, derived fresh',
        tasks: [
          'Wire the category filter: derive the visible list as `fullCatalog.filter(...)` based on current filter state, never by mutating a shrinking working array.',
          'Wire the price range filter the same way, and confirm combining it with the category filter narrows correctly — both conditions apply at once, in one derivation.',
        ],
      },
      {
        id: 'm3',
        title: 'Debounced search, combined with filters',
        tasks: [
          'Wire the search box with a debounce, and combine its condition into the same derivation as the other filters — search narrows within whatever categories and price range are currently active, not instead of them.',
          'Confirm typing quickly does not cause visible flicker or lag from re-deriving the list on every keystroke.',
        ],
      },
      {
        id: 'm4',
        title: 'Sorting, applied after filtering',
        tasks: [
          'Wire the sort control to order the already-filtered result — sorting must never reintroduce items the filters excluded, and filtering must never disturb a chosen sort once reapplied.',
          'Confirm changing the sort while filters are active re-sorts only the currently-visible, filtered set.',
        ],
      },
      {
        id: 'm5',
        title: 'Count, empty state, and clear',
        tasks: [
          'Show an accurate count of the currently-visible products.',
          'Show a clear, specific empty state when the combination of filters and search matches nothing.',
          'Wire a "clear all filters" control that resets search, category, price range and sort back to their defaults in one action.',
        ],
      },
    ],
    hints: [
      'Deriving the visible list as one function — `deriveVisible(fullCatalog, { search, categories, minPrice, maxPrice, sort })` — called fresh whenever any input changes, is what prevents filters from stepping on each other. The tempting alternative, progressively `.filter()`-ing a shrinking working array as each control changes, cannot be un-narrowed when a filter is cleared, which is exactly the bug that shows up the first time someone removes a category filter and the products do not come back.',
      'Filter first, sort second, always, inside that one derivation function — sorting a list and then filtering it produces the same *contents* as filtering then sorting, but doing it in the other order invites subtle bugs if a future filter ever depends on sort-order-sensitive logic (like "top N").',
      'Debounce only the free-text search input specifically. Category checkboxes and the sort control should feel instant — debouncing everything uniformly would make the whole filter panel feel sluggish for no benefit, since only typed text produces a rapid burst of events.',
    ],
    stretchGoals: [
      'URL query parameters reflecting the current search/filter/sort state, so a filtered view is shareable via a link.',
      'A "recently viewed" or "recently searched" strip.',
      'Faceted counts — showing how many products are in each category *given the current search and price filter*, updating live.',
      'Virtualised rendering for a much larger catalog (500+ items) if performance becomes visibly an issue.',
    ],
    completionCriteria: [
      'Search, category, price range and sort all compose correctly together, in any order applied, verified by combining at least three of them at once.',
      'Clearing a filter widens the result back out correctly rather than leaving it permanently narrowed.',
      'The free-text search is debounced; the other controls are not, and both behaviours feel appropriate.',
      'The visible count is always accurate for the current combination of criteria.',
      'The empty state appears exactly when the combination matches nothing, and clears correctly when a criterion is loosened.',
    ],
    testingChecklist: [
      'Apply a category filter, then a price range, then search — confirm the result is the intersection of all three, not just the most recently applied one.',
      'Remove the category filter after having applied several filters and confirm products from that category reappear (proof the derivation is fresh, not progressively narrowed).',
      'Change the sort order while a search term and a category filter are both active, and confirm the sorted result still respects both.',
      'Search or filter down to zero results and confirm the empty state is clear and specific, then clear all filters and confirm the full catalog returns.',
    ],
    reflectionQuestions: [
      'What specific bug appears if you filter progressively — narrowing a working array step by step — instead of deriving the visible list fresh from the full catalog every time?',
      'Why debounce the search box specifically, rather than debouncing every filter control uniformly?',
    ],
  },

  {
    id: 'pr-ecommerce-cart',
    slug: 'ecommerce-cart',
    title: 'E-commerce Cart',
    difficulty: DIFFICULTY.HARD,
    tagline: 'A shopping cart with quantities, stock limits and exact monetary totals in integer cents.',
    brief:
      'Build a shopping cart on top of a product catalog: add to cart, adjust quantities, remove items, respect ' +
      'per-product stock limits, and compute an exact subtotal and total. Like the Expense Tracker, every ' +
      'monetary value is handled as integer cents throughout — a cart that is a few cents off after several ' +
      'quantity changes is a real, embarrassing bug class, and this project is built specifically to avoid it.',
    estimatedHours: '5–8',
    topicIds: ['arrays', 'objects', 'numbers', 'dom-manipulation', 'storage'],
    prerequisites: [
      'Comfortable with the integer-cents money pattern, ideally from the Expense Tracker project.',
      'Comfortable deriving totals from an array of line items.',
    ],
    relatedLessons: ['l-m14-01', 'l-m13-01'],
    relatedChallenges: ['ch-num-money', 'ch-arr-group-by', 'ch-obj-deep-merge'],
    objectives: [
      'Model a cart as line items derived from a product catalog plus quantities, keeping the catalog and the cart cleanly separate.',
      'Enforce stock limits correctly at every point a quantity can change — adding, incrementing, and directly editing a quantity field.',
      'Compute exact monetary totals — per-line, subtotal, and grand total — in integer cents, with no drift across repeated changes.',
    ],
    requirements: [
      'A product catalog (reuse or extend the one from Product Search & Filter if you built it) with a price and a stock quantity per product.',
      'Add a product to the cart; adding an already-in-cart product increases its quantity rather than creating a duplicate line.',
      'Adjust a line\'s quantity directly (not just +/- one at a time) and remove a line entirely.',
      'A product cannot be added, or have its quantity increased, beyond its available stock — the UI prevents this and communicates why, rather than silently capping or allowing it.',
      'An out-of-stock product (zero available) shows a clear disabled state and cannot be added at all.',
      'Per-line subtotal (price × quantity), an overall subtotal, and a grand total are all shown and always exactly correct, computed in integer cents.',
      'The cart persists across a reload.',
    ],
    milestones: [
      {
        id: 'm1',
        title: 'Catalog and cart as separate, related state',
        tasks: [
          'Set up the product catalog with price (integer cents) and stock quantity per product.',
          'Model the cart as an array of `{ productId, quantity }`, deriving displayed line details (name, price, subtotal) by looking up the product each time, rather than duplicating product data into the cart.',
        ],
      },
      {
        id: 'm2',
        title: 'Add to cart, with stock enforcement',
        tasks: [
          'Wire "add to cart," incrementing an existing line\'s quantity instead of duplicating it.',
          'Enforce the stock limit at the moment of adding: refuse (with a clear message) to add more than is available.',
          'Show a disabled, out-of-stock state for a product with zero remaining stock.',
        ],
      },
      {
        id: 'm3',
        title: 'Adjust and remove',
        tasks: [
          'Wire direct quantity editing on a cart line (not only +/- one at a time), re-clamping to the product\'s stock limit if the entered value exceeds it.',
          'Wire removing a line entirely.',
        ],
      },
      {
        id: 'm4',
        title: 'Exact totals',
        tasks: [
          'Compute each line\'s subtotal, the cart subtotal, and the grand total, entirely in integer cents.',
          'Confirm, with a deliberately awkward test case (e.g. an odd price times an odd quantity, repeated several times with quantity changes), that the totals never drift.',
        ],
      },
      {
        id: 'm5',
        title: 'Persistence',
        tasks: [
          'Persist the cart (product ids and quantities, not full product data) to `localStorage` and restore it correctly, re-deriving line details from the current catalog on load.',
          'Handle the case where a previously-carted product no longer exists in the catalog, or now has less stock than the cart quantity, on reload — decide explicitly what happens (clamp, remove, or flag) and be consistent.',
        ],
      },
    ],
    hints: [
      'Storing only `productId` and `quantity` per cart line — and looking up name, price and current stock from the catalog every time you render — is what keeps the cart and the catalog from disagreeing with each other. If the cart stored a copy of the price at add-time, a later catalog change (or a bug) could make the cart show stale figures.',
      'Enforce the stock limit at the single point where quantity actually changes — one function, used by "add to cart," the +/- controls, and direct quantity editing alike — rather than checking it separately (and possibly inconsistently) in three different event handlers.',
      'The reload edge case — a cart quantity that now exceeds the product\'s current stock — is exactly the kind of state your persistence code has to actively decide about rather than silently trust. Clamping the quantity down to the current stock on load, with a visible note to the user, is a reasonable default; whichever you choose, apply it consistently.',
    ],
    stretchGoals: [
      'A discount code system, applied to the subtotal, still in integer cents.',
      'Shipping cost rules based on subtotal or item count.',
      'Save the cart for later, distinct from a checkout event, if you added an even minimal "checkout" step.',
      'A running "you are $X away from free shipping" style prompt.',
    ],
    completionCriteria: [
      'Adding an already-in-cart product increases its quantity rather than creating a duplicate line.',
      'No cart operation can ever push a line\'s quantity above the product\'s current stock.',
      'An out-of-stock product cannot be added at all, and communicates why.',
      'Every total — per-line, subtotal, grand total — is exactly correct after any sequence of adds, quantity changes and removals, verified by hand for at least one non-trivial scenario.',
      'The cart survives a reload, correctly re-deriving current line details from the catalog.',
    ],
    testingChecklist: [
      'Add a product to the cart twice in a row and confirm it results in one line with quantity 2, not two separate lines.',
      'Try to add more of a product than is in stock, both via "add to cart" repeatedly and via direct quantity editing, and confirm both paths are correctly blocked.',
      'Build a cart with several odd prices and quantities, change quantities a few times, and verify the grand total by adding the numbers up yourself.',
      'Reload after carting a product, then (in your data) reduce that product\'s stock below the carted quantity, reload again, and confirm your chosen handling (clamp, remove, or flag) actually happens.',
    ],
    reflectionQuestions: [
      'Why look up product details from the catalog on every render instead of copying them into the cart when an item is added?',
      'What decision did you make for a cart quantity that exceeds current stock after a reload, and why is that the right default for a real store, rather than just the easiest to implement?',
    ],
  },

  {
    id: 'pr-finance-dashboard',
    slug: 'finance-dashboard',
    title: 'Finance Dashboard',
    difficulty: DIFFICULTY.HARD,
    tagline: 'A modular budgeting dashboard split into api/state/render/events/utils files with a strict dependency direction.',
    brief:
      'Build a personal finance dashboard — accounts, transactions, category budgets, and a spending summary — ' +
      'and, unlike every earlier project, split the implementation across dedicated files: `api.js`, `state.js`, ' +
      '`render.js`, `events.js`, `utils.js` and a `main.js` that wires them together. The application logic is ' +
      'a natural extension of the Expense Tracker; the actual point of this project is the architecture — ' +
      'each module has one job, and dependencies flow in one direction only.',
    estimatedHours: '6–10',
    topicIds: ['modules', 'data-structures', 'numbers', 'dom-manipulation', 'clean-code'],
    prerequisites: [
      'Completed the Expense Tracker, or is equally comfortable with the integer-cents money pattern and grouped totals.',
      'Comfortable with ES modules — `export`/`import` — across multiple files.',
    ],
    relatedLessons: ['l-m28-01', 'l-m40-01'],
    relatedChallenges: ['ch-num-money', 'ch-arr-group-by', 'ch-eng-batch-writes'],
    objectives: [
      'Split an application into modules with a single responsibility each, and enforce a strict, one-directional dependency graph between them.',
      'Keep all DOM access confined to the render and events modules — state and business logic never touch the DOM directly.',
      'Build budgets per category, with correct over-budget detection, on top of the same integer-cents discipline as the Expense Tracker.',
    ],
    requirements: [
      'Multiple accounts (e.g. checking, savings), each with its own transactions.',
      'Add a transaction to a specific account: amount, category, type (income/expense), date.',
      'A monthly budget per category; the dashboard shows spending against budget per category, for the current month, with a clear over-budget indicator when spending exceeds the budget.',
      'A summary view: total balance across all accounts, total spending this month, and spending broken down by category.',
      'The codebase is split into distinct files with the responsibilities below, and `main.js` is the only file that imports from more than one of them to wire the app together:',
      '  `api.js` — the data-access layer (reading/writing persisted data; can be backed by `localStorage` or an injected mock, following the same injectable pattern as the async projects).',
      '  `state.js` — in-memory application state and the pure functions that derive totals, budgets-vs-spending, and summaries from it. No DOM access here.',
      '  `render.js` — turns state into DOM output. No business logic and no direct data mutation here.',
      '  `events.js` — wires DOM events to state-changing actions. Talks to `state.js` to change things and to `render.js` to reflect the result; it does not compute totals itself.',
      '  `utils.js` — small, generic, reusable helpers (money formatting, date-key helpers) with no dependency on any of the other modules.',
      'All monetary values are handled in integer cents throughout, exactly as in the Expense Tracker.',
    ],
    milestones: [
      {
        id: 'm1',
        title: 'Scaffold the modules and the dependency direction',
        tasks: [
          'Create the six files and write out, in comments, exactly what each one is and is not allowed to import from — `utils.js` imports nothing of yours; `api.js` may use `utils.js`; `state.js` may use `api.js` and `utils.js`; `render.js` may use `utils.js` only; `events.js` may use `state.js` and `render.js`; `main.js` wires everything.',
          'Stub each module with its planned exports (even as placeholders) and confirm `main.js` can import from all of them without a circular dependency.',
        ],
      },
      {
        id: 'm2',
        title: 'Accounts and transactions, in state and api',
        tasks: [
          'Implement account and transaction data structures in `state.js`, with pure functions for adding a transaction, computing an account balance, and computing an overall balance.',
          'Implement persistence in `api.js` (integer cents throughout), and wire `state.js` to load from and save through it — `state.js` should not touch `localStorage` directly.',
        ],
      },
      {
        id: 'm3',
        title: 'Render from state, wire events',
        tasks: [
          'Implement `render.js` functions that take state (or a derived slice of it) and produce DOM output — no reading `localStorage`, no computing totals here, only display.',
          'Implement `events.js` to wire form submissions and clicks to `state.js` actions, then call the relevant `render.js` function with the updated state.',
        ],
      },
      {
        id: 'm4',
        title: 'Budgets per category',
        tasks: [
          'Add category budgets to `state.js`, and a pure function computing spending-vs-budget per category for the current month.',
          'Render the over-budget indicator in `render.js`, driven entirely by that computed data, not by re-deriving anything in the render layer.',
        ],
      },
      {
        id: 'm5',
        title: 'Summary view and dependency audit',
        tasks: [
          'Build the summary view (total balance, monthly spending, category breakdown) from `state.js` derivations, rendered by `render.js`.',
          'Do a final pass: check that no file imports from a module "below" it in the intended direction (for example, that `render.js` never imports from `api.js` or `events.js`), and fix any violation you find.',
        ],
      },
    ],
    hints: [
      'Write the allowed-imports rule down explicitly before writing much code, and check your actual `import` statements against it as you go — the value of this project is largely lost if the module boundaries exist in name only and every file quietly imports whatever it needs from everywhere.',
      '`render.js` functions should be close to pure: given the same state, they produce the same DOM output, with no side effects beyond that output. If you find yourself computing a total inside a render function, that computation almost certainly belongs in `state.js` instead, with `render.js` only displaying the already-computed number.',
      'Category budgets and the Expense Tracker\'s grouped totals are the same underlying operation — summing transactions grouped by category — reused for a new purpose (comparing against a budget) rather than reimplemented from scratch.',
    ],
    stretchGoals: [
      'Transfers between accounts, correctly affecting both account balances without double-counting in the overall total.',
      'A rolling multi-month view of spending by category.',
      'Export the full dashboard state as JSON via `api.js`.',
      'A basic automated test file exercising the pure functions in `state.js` directly, with no DOM involved — proof that separating state from render actually paid off.',
    ],
    completionCriteria: [
      'The six-module structure exists with the described responsibilities, and no file imports in a direction that violates the intended dependency graph.',
      'Adding transactions, viewing balances, and viewing budget-vs-spending all work correctly end to end through `main.js` wiring the modules together.',
      'Over-budget categories are correctly flagged for the current month.',
      'All monetary figures are exact, computed in integer cents throughout.',
      'State and rendering are cleanly separated: `state.js` contains no DOM access, and `render.js` contains no direct data mutation or `localStorage` access.',
    ],
    testingChecklist: [
      'Grep your own `render.js` and `state.js` for `document.`, `localStorage`, and `fetch` — confirm they appear only where your architecture says they should.',
      'Add transactions across two accounts and confirm both the per-account balances and the overall total are correct.',
      'Set a category budget below your actual spending in that category for the month and confirm the over-budget indicator appears; raise the budget above spending and confirm it clears.',
      'Trace one full action (adding a transaction) through the files by hand — which function in `events.js` is called, which function in `state.js` it calls, and which function in `render.js` reflects the result — and confirm it matches your intended dependency direction.',
    ],
    reflectionQuestions: [
      'Which module was hardest to keep "pure" or single-responsibility, and why — what kept pulling logic into the wrong place?',
      'If you needed to swap `localStorage` for a real backend API tomorrow, which files would you need to touch, and which would stay completely unchanged? What does that tell you about whether the module boundaries are in the right place?',
    ],
  },
];

export default projects;
