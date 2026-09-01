/**
 * Topic taxonomy.
 *
 * Topics are the unit of *mastery*. Modules organise teaching order; topics cut
 * across modules so that (for example) a closure question inside the event-loop
 * module still feeds the learner's "closures" mastery score.
 *
 * Every lesson, exercise, quiz question, challenge, project and interview
 * question declares `topicIds`. `content:audit` fails on unknown ids.
 */

export const TOPICS = [
  // Orientation
  { id: 'orientation', label: 'Programming Orientation', group: 'Foundations' },
  { id: 'js-runtime', label: 'JavaScript & Runtimes', group: 'Foundations' },
  { id: 'devtools', label: 'Developer Tools', group: 'Foundations' },
  { id: 'syntax', label: 'Syntax & Statements', group: 'Foundations' },

  // Language core
  { id: 'variables', label: 'Variables', group: 'Core Language' },
  { id: 'types', label: 'Data Types', group: 'Core Language' },
  { id: 'coercion', label: 'Type Conversion & Coercion', group: 'Core Language' },
  { id: 'operators', label: 'Operators & Expressions', group: 'Core Language' },
  { id: 'strings', label: 'Strings', group: 'Core Language' },
  { id: 'numbers', label: 'Numbers & Math', group: 'Core Language' },
  { id: 'booleans', label: 'Booleans & Truthiness', group: 'Core Language' },
  { id: 'control-flow', label: 'Control Flow', group: 'Core Language' },
  { id: 'loops', label: 'Loops & Iteration', group: 'Core Language' },
  { id: 'functions', label: 'Functions', group: 'Core Language' },
  { id: 'arrow-functions', label: 'Arrow Functions', group: 'Core Language' },
  { id: 'higher-order', label: 'Higher-Order Functions', group: 'Core Language' },
  { id: 'scope', label: 'Scope', group: 'Core Language' },
  { id: 'hoisting', label: 'Hoisting & TDZ', group: 'Core Language' },
  { id: 'arrays', label: 'Arrays', group: 'Core Language' },
  { id: 'array-methods', label: 'Array Iteration Methods', group: 'Core Language' },
  { id: 'objects', label: 'Objects', group: 'Core Language' },
  { id: 'object-utilities', label: 'Object Utilities', group: 'Core Language' },
  { id: 'destructuring', label: 'Destructuring & Spread', group: 'Core Language' },
  { id: 'dates', label: 'Dates & Intl', group: 'Core Language' },
  { id: 'regex', label: 'Regular Expressions', group: 'Core Language' },
  { id: 'modern-js', label: 'Modern JavaScript (ES6+)', group: 'Core Language' },
  { id: 'modules', label: 'Modules', group: 'Core Language' },

  // Browser
  { id: 'dom', label: 'DOM Fundamentals', group: 'Browser' },
  { id: 'dom-manipulation', label: 'DOM Creation & Traversal', group: 'Browser' },
  { id: 'events', label: 'Events', group: 'Browser' },
  { id: 'forms', label: 'Forms & Validation', group: 'Browser' },
  { id: 'storage', label: 'Browser Storage', group: 'Browser' },
  { id: 'web-apis', label: 'Web APIs', group: 'Browser' },

  // Async
  { id: 'async-foundations', label: 'Async Foundations', group: 'Asynchronous' },
  { id: 'promises', label: 'Promises', group: 'Asynchronous' },
  { id: 'async-await', label: 'async / await', group: 'Asynchronous' },
  { id: 'http', label: 'HTTP & Fetch', group: 'Asynchronous' },
  { id: 'event-loop', label: 'Event Loop', group: 'Asynchronous' },

  // Advanced
  { id: 'this', label: 'The this Keyword', group: 'Advanced' },
  { id: 'prototypes', label: 'Prototypes', group: 'Advanced' },
  { id: 'classes', label: 'Classes & OOP', group: 'Advanced' },
  { id: 'closures', label: 'Closures', group: 'Advanced' },
  { id: 'execution-context', label: 'Execution Context', group: 'Advanced' },
  { id: 'data-structures', label: 'Map, Set & Friends', group: 'Advanced' },
  { id: 'iterators', label: 'Iterators & Generators', group: 'Advanced' },
  { id: 'metaprogramming', label: 'Metaprogramming', group: 'Advanced' },
  { id: 'functional', label: 'Functional JavaScript', group: 'Advanced' },
  { id: 'recursion', label: 'Recursion', group: 'Advanced' },
  { id: 'algorithms', label: 'Algorithms & Big O', group: 'Advanced' },
  { id: 'copying', label: 'Shallow vs Deep Copy', group: 'Advanced' },

  // Professional
  { id: 'errors', label: 'Error Handling', group: 'Professional' },
  { id: 'debugging', label: 'Debugging', group: 'Professional' },
  { id: 'clean-code', label: 'Clean JavaScript', group: 'Professional' },
  { id: 'design-patterns', label: 'Design Patterns', group: 'Professional' },
  { id: 'testing', label: 'Testing', group: 'Professional' },
  { id: 'performance', label: 'Performance', group: 'Professional' },
  { id: 'security', label: 'Security', group: 'Professional' },
  { id: 'tooling', label: 'Tooling & Workflow', group: 'Professional' },
  { id: 'interview', label: 'Interview Technique', group: 'Professional' },
];

export const TOPIC_IDS = TOPICS.map((t) => t.id);
export const TOPIC_BY_ID = Object.fromEntries(TOPICS.map((t) => [t.id, t]));

export const TOPIC_GROUPS = TOPICS.reduce((acc, t) => {
  (acc[t.group] ??= []).push(t);
  return acc;
}, {});

export function topicLabel(id) {
  return TOPIC_BY_ID[id]?.label ?? id;
}
