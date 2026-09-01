/**
 * JSPath content model.
 *
 * Content is plain data, authored in `src/content/**`, validated at build time by
 * `npm run content:audit` and (in dev) at load time by `validate.js`.
 *
 * Every entity carries a stable string `id`. Relationships are expressed with ids,
 * never titles, so content can be retitled without breaking references.
 */

/** Difficulty ladder shared by lessons, exercises, challenges and interview questions. */
export const DIFFICULTY = Object.freeze({
  BEGINNER: 'beginner',
  EASY: 'easy',
  MEDIUM: 'medium',
  HARD: 'hard',
  EXPERT: 'expert',
});

export const DIFFICULTY_ORDER = [
  DIFFICULTY.BEGINNER,
  DIFFICULTY.EASY,
  DIFFICULTY.MEDIUM,
  DIFFICULTY.HARD,
  DIFFICULTY.EXPERT,
];

export const DIFFICULTY_LABEL = {
  [DIFFICULTY.BEGINNER]: 'Beginner',
  [DIFFICULTY.EASY]: 'Easy',
  [DIFFICULTY.MEDIUM]: 'Medium',
  [DIFFICULTY.HARD]: 'Hard',
  [DIFFICULTY.EXPERT]: 'Expert',
};

/** Module-level track, drives curriculum grouping and colour chips. */
export const TRACK = Object.freeze({
  FOUNDATIONS: 'foundations',
  CORE: 'core',
  BROWSER: 'browser',
  ASYNC: 'async',
  ADVANCED: 'advanced',
  PROFESSIONAL: 'professional',
  INTERVIEW: 'interview',
});

export const TRACK_LABEL = {
  [TRACK.FOUNDATIONS]: 'Foundations',
  [TRACK.CORE]: 'Core Language',
  [TRACK.BROWSER]: 'Browser & DOM',
  [TRACK.ASYNC]: 'Asynchronous',
  [TRACK.ADVANCED]: 'Advanced',
  [TRACK.PROFESSIONAL]: 'Professional',
  [TRACK.INTERVIEW]: 'Interview',
};

/**
 * Lesson section kinds. The lesson renderer maps each kind to a component;
 * an unknown kind renders as prose rather than crashing the page.
 */
export const SECTION = Object.freeze({
  PROSE: 'prose',            /* { body: string[] }                              */
  HEADING: 'heading',        /* { text }                                        */
  CODE: 'code',              /* { code, language?, caption?, output?, runnable? } */
  ANNOTATED_CODE: 'annotatedCode', /* { code, annotations: [{line, text}] }     */
  CALLOUT: 'callout',        /* { tone: tip|warning|danger|info, title, body[] }*/
  LIST: 'list',              /* { ordered?, items: string[] }                   */
  TABLE: 'table',            /* { headers: [], rows: [[]] }                     */
  COMPARISON: 'comparison',  /* { left:{title,code}, right:{title,code}, note } */
  PREDICT: 'predict',        /* { code, options[], correct, explanation }       */
  DIAGRAM: 'diagram',        /* { diagram: <registered id>, caption? }          */
  STEPS: 'steps',            /* { steps: [{title, body}] }                      */
  TERMS: 'terms',            /* { terms: [{term, definition}] }                 */
  EXERCISE_REF: 'exerciseRef', /* { exerciseId }                                */
});

export const CALLOUT_TONE = Object.freeze({
  TIP: 'tip',
  WARNING: 'warning',
  DANGER: 'danger',
  INFO: 'info',
  MISTAKE: 'mistake',
  INTERVIEW: 'interview',
});

/** Exercise kinds understood by the exercise engine. */
export const EXERCISE_KIND = Object.freeze({
  WRITE_FUNCTION: 'writeFunction',
  COMPLETE_CODE: 'completeCode',
  FIX_BUG: 'fixBug',
  PREDICT_OUTPUT: 'predictOutput',
  REFACTOR: 'refactor',
  TRANSFORM_DATA: 'transformData',
  DOM_TASK: 'domTask',
  ASYNC_TASK: 'asyncTask',
  CONCEPTUAL: 'conceptual',
  CHOOSE_IMPLEMENTATION: 'chooseImplementation',
});

/** Quiz question kinds understood by the quiz engine. */
export const QUIZ_KIND = Object.freeze({
  SINGLE: 'single',
  MULTIPLE: 'multiple',
  TRUE_FALSE: 'trueFalse',
  OUTPUT: 'output',
});

/**
 * Interview question kinds.
 *
 * `OUTPUT` and `CHOICE` are the two **objective** kinds — they carry `options`
 * and a `correct` index, and `InterviewAnswer` scores them automatically. Every
 * other kind is open-ended and self-assessed against `keyPoints`, which is
 * deliberate: the product has no AI grader and does not pretend to have one.
 *
 * Adding a kind here is safe — anything that is not `OUTPUT` or `CHOICE` falls
 * through to the self-assessed path with no engine change.
 */
export const INTERVIEW_KIND = Object.freeze({
  CONCEPT: 'concept',
  COMPARISON: 'comparison',
  OUTPUT: 'output',
  CHOICE: 'choice',
  DEBUGGING: 'debugging',
  CODING: 'coding',
  REFACTORING: 'refactoring',
  BROWSER: 'browser',
  ASYNC: 'async',
  ARCHITECTURE: 'architecture',
  PERFORMANCE: 'performance',
  SECURITY: 'security',
  ALGORITHMS: 'algorithms',
  HTTP: 'http',
  TESTING: 'testing',
  SCENARIO: 'scenario',
});

export const INTERVIEW_KINDS = Object.values(INTERVIEW_KIND);

/** Human labels for the interview kind filter. */
export const INTERVIEW_KIND_LABEL = {
  [INTERVIEW_KIND.CONCEPT]: 'Conceptual',
  [INTERVIEW_KIND.COMPARISON]: 'Comparison',
  [INTERVIEW_KIND.OUTPUT]: 'Output prediction',
  [INTERVIEW_KIND.CHOICE]: 'Multiple choice',
  [INTERVIEW_KIND.DEBUGGING]: 'Debugging',
  [INTERVIEW_KIND.CODING]: 'Coding',
  [INTERVIEW_KIND.REFACTORING]: 'Refactoring',
  [INTERVIEW_KIND.BROWSER]: 'Browser / DOM',
  [INTERVIEW_KIND.ASYNC]: 'Async / event loop',
  [INTERVIEW_KIND.ARCHITECTURE]: 'Architecture',
  [INTERVIEW_KIND.PERFORMANCE]: 'Performance',
  [INTERVIEW_KIND.SECURITY]: 'Security',
  [INTERVIEW_KIND.ALGORITHMS]: 'Algorithms',
  [INTERVIEW_KIND.HTTP]: 'HTTP / APIs',
  [INTERVIEW_KIND.TESTING]: 'Testing',
  [INTERVIEW_KIND.SCENARIO]: 'Scenario',
};

/**
 * Interview levels. These are deliberately **not** `DIFFICULTY` — an interview
 * ladder is a different axis from lesson difficulty, and `InterviewPrep.jsx`
 * and `InterviewSession.jsx` already filter on exactly these four strings.
 */
export const INTERVIEW_LEVEL = Object.freeze({
  JUNIOR: 'junior',
  JUNIOR_PLUS: 'junior+',
  INTERMEDIATE: 'intermediate',
  ADVANCED: 'advanced',
});

export const INTERVIEW_LEVELS = Object.values(INTERVIEW_LEVEL);

/** Mastery states. Order matters — index is used for comparisons. */
export const MASTERY = Object.freeze({
  NOT_STARTED: 'notStarted',
  LEARNING: 'learning',
  PRACTICING: 'practicing',
  MASTERED: 'mastered',
});

export const MASTERY_ORDER = [
  MASTERY.NOT_STARTED,
  MASTERY.LEARNING,
  MASTERY.PRACTICING,
  MASTERY.MASTERED,
];

export const MASTERY_LABEL = {
  [MASTERY.NOT_STARTED]: 'Not Started',
  [MASTERY.LEARNING]: 'Learning',
  [MASTERY.PRACTICING]: 'Practicing',
  [MASTERY.MASTERED]: 'Mastered',
};

/**
 * Reference categories.
 *
 * These group the API reference for browsing and filtering. They are deliberately
 * coarse — a learner scanning for an array method should not have to guess between
 * six near-identical buckets.
 */
export const REFERENCE_CATEGORY = Object.freeze({
  LANGUAGE: 'Language & Globals',
  SYNTAX: 'Modern Syntax',
  MODULES: 'Modules',
  STRING: 'String',
  NUMBER: 'Number & Math',
  ARRAY: 'Array',
  OBJECT: 'Object',
  FUNCTION: 'Function',
  DATE: 'Date',
  REGEXP: 'RegExp',
  JSON: 'JSON',
  PROMISE: 'Promise & Async',
  ERROR: 'Error',
  COLLECTIONS: 'Map, Set & Collections',
  SYMBOL: 'Symbol & Iteration',
  METAPROGRAMMING: 'Proxy & Reflect',
  DOM_SELECT: 'DOM Selection',
  DOM_CONTENT: 'DOM Content & Attributes',
  DOM_MANIPULATE: 'DOM Manipulation',
  DOM_TRAVERSE: 'DOM Traversal',
  EVENTS: 'Events',
  FORMS: 'Forms',
  FETCH: 'Fetch & HTTP',
  URL: 'URL',
  STORAGE: 'Storage',
  WEB_APIS: 'Browser & Web APIs',
});
export const REFERENCE_CATEGORIES = Object.values(REFERENCE_CATEGORY);

/**
 * Where an API is actually specified.
 *
 * This distinction is not cosmetic: `Array.prototype.map()` exists in every
 * JavaScript runtime, `document.querySelector()` exists only where there is a
 * document, and `fetch()` is a separate web standard that Node adopted later.
 * Blurring the three is one of the most common ways reference material misleads.
 */
export const REFERENCE_ENV = Object.freeze({
  ECMASCRIPT: 'ECMAScript',
  DOM: 'DOM',
  WEB_API: 'Web API',
});
export const REFERENCE_ENVS = Object.values(REFERENCE_ENV);

/**
 * Cheat sheet categories.
 *
 * Deliberately few. A revision index is only scannable if the top-level buckets
 * fit on one screen.
 */
export const SHEET_CATEGORY = Object.freeze({
  LANGUAGE: 'Language Core',
  DATA: 'Data & Collections',
  FUNCTIONS: 'Functions & Objects',
  BROWSER: 'Browser & DOM',
  ASYNC: 'Async & Networking',
  ENGINEERING: 'Engineering',
});
export const SHEET_CATEGORIES = Object.values(SHEET_CATEGORY);

/**
 * How one group of a cheat sheet is laid out.
 *
 * `snippets` is the original shape — a run of `{ code, description }` pairs.
 * The other two exist because a revision sheet needs structures that code
 * blocks cannot express: a comparison or mutation matrix, and a list of rules
 * or gotchas that have no code of their own.
 */
export const SHEET_GROUP = Object.freeze({
  SNIPPETS: 'snippets',
  TABLE: 'table',
  RULES: 'rules',
});
export const SHEET_GROUPS = Object.values(SHEET_GROUP);

/**
 * Placement assessment domains.
 *
 * A domain is a band of the curriculum, not a track: it declares the topics it
 * covers and nothing else. The modules a domain maps to, and the order the
 * domains are visited in, are both derived from the real curriculum registry
 * (`module.order`) rather than restated here — there is exactly one curriculum
 * ordering in this codebase and it lives in the content.
 */
export const PLACEMENT_DOMAIN = Object.freeze({
  FOUNDATIONS: 'foundations',
  CORE_LANGUAGE: 'core-language',
  BROWSER_DOM: 'browser-dom',
  ASYNC: 'async',
  ADVANCED_LANGUAGE: 'advanced-language',
  ENGINEERING: 'engineering',
});
export const PLACEMENT_DOMAINS = Object.values(PLACEMENT_DOMAIN);

export const PLACEMENT_DOMAIN_LABEL = {
  [PLACEMENT_DOMAIN.FOUNDATIONS]: 'Foundations',
  [PLACEMENT_DOMAIN.CORE_LANGUAGE]: 'Core language',
  [PLACEMENT_DOMAIN.BROWSER_DOM]: 'Browser & DOM',
  [PLACEMENT_DOMAIN.ASYNC]: 'Async',
  [PLACEMENT_DOMAIN.ADVANCED_LANGUAGE]: 'Advanced language',
  [PLACEMENT_DOMAIN.ENGINEERING]: 'Engineering',
};

/** Which topics each domain is responsible for. Every id must exist in topics.js. */
export const PLACEMENT_DOMAIN_TOPICS = Object.freeze({
  [PLACEMENT_DOMAIN.FOUNDATIONS]: ['variables', 'types', 'coercion', 'operators', 'booleans', 'control-flow', 'loops'],
  [PLACEMENT_DOMAIN.CORE_LANGUAGE]: ['strings', 'numbers', 'arrays', 'array-methods', 'objects', 'object-utilities', 'destructuring', 'functions', 'arrow-functions', 'higher-order', 'scope', 'hoisting'],
  [PLACEMENT_DOMAIN.BROWSER_DOM]: ['dom', 'dom-manipulation', 'events', 'forms', 'storage', 'web-apis'],
  [PLACEMENT_DOMAIN.ASYNC]: ['async-foundations', 'promises', 'async-await', 'event-loop', 'http'],
  [PLACEMENT_DOMAIN.ADVANCED_LANGUAGE]: ['modern-js', 'modules', 'this', 'prototypes', 'classes', 'closures', 'data-structures', 'copying', 'iterators'],
  [PLACEMENT_DOMAIN.ENGINEERING]: ['errors', 'debugging', 'testing', 'performance', 'security', 'algorithms'],
});

/**
 * Placement result bands.
 *
 * These are deliberately the *same* four ids the onboarding level step already
 * uses (`src/pages/OnboardingLevel.jsx`), so the assessment refines the
 * learner's self-reported level instead of introducing a rival vocabulary.
 */
export const PLACEMENT_LEVEL = Object.freeze({
  ZERO: 'zero',
  BASICS: 'basics',
  INTERMEDIATE: 'intermediate',
  EXPERIENCED: 'experienced',
});
export const PLACEMENT_LEVELS = Object.values(PLACEMENT_LEVEL);

export const PLACEMENT_LEVEL_LABEL = {
  [PLACEMENT_LEVEL.ZERO]: 'Starting out',
  [PLACEMENT_LEVEL.BASICS]: 'Knows the basics',
  [PLACEMENT_LEVEL.INTERMEDIATE]: 'Comfortable with JavaScript',
  [PLACEMENT_LEVEL.EXPERIENCED]: 'Experienced developer',
};

/**
 * Difficulty weights used by placement scoring.
 *
 * A small, explicit progression — not a tuned curve. The spread is deliberately
 * narrow (1 → 3) so that a single expert question can never outweigh a whole
 * foundational domain; scoring is per-domain first and overall second.
 */
export const PLACEMENT_DIFFICULTY_WEIGHT = Object.freeze({
  beginner: 1,
  easy: 1.5,
  medium: 2,
  hard: 2.5,
  expert: 3,
});

/** Content kinds — used by search, bookmarks and the audit script. */
export const CONTENT_KIND = Object.freeze({
  MODULE: 'module',
  LESSON: 'lesson',
  EXERCISE: 'exercise',
  QUIZ: 'quiz',
  CHALLENGE: 'challenge',
  PROJECT: 'project',
  INTERVIEW: 'interview',
  REFERENCE: 'reference',
  CHEATSHEET: 'cheatsheet',
});
