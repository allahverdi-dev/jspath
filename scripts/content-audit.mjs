#!/usr/bin/env node
/**
 * npm run content:audit
 *
 * Loads every authored piece of content, validates it against the schema, checks
 * every cross-reference, hunts for placeholder text and duplicated material, and
 * prints real counts computed from the content itself.
 *
 * Exit code 1 on any error. Warnings do not fail the build.
 */
import { writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { loadAllContent } from './lib/load-content.mjs';
import { VALIDATORS, scanForPlaceholders } from '../src/content/schema/validate.js';
import { SECTION, PLACEMENT_DOMAINS, PLACEMENT_DOMAIN_TOPICS } from '../src/content/schema/types.js';
import { PRO_CONTENT_IDS, FREE_SAMPLE_CONTENT_IDS } from '../src/features/billing/accessCatalog.js';
import { requiredPlanForContent } from '../src/features/billing/access.js';

const errors = [];
let stats_relations = 0;
const warnings = [];

const err = (msg, where) => errors.push(where ? `${msg}\n      ↳ ${where}` : msg);
const warn = (msg, where) => warnings.push(where ? `${msg}\n      ↳ ${where}` : msg);

const c = process.stdout.isTTY
  ? { red: (s) => `\x1b[31m${s}\x1b[0m`, yellow: (s) => `\x1b[33m${s}\x1b[0m`, green: (s) => `\x1b[32m${s}\x1b[0m`, dim: (s) => `\x1b[2m${s}\x1b[0m`, bold: (s) => `\x1b[1m${s}\x1b[0m`, cyan: (s) => `\x1b[36m${s}\x1b[0m` }
  : { red: (s) => s, yellow: (s) => s, green: (s) => s, dim: (s) => s, bold: (s) => s, cyan: (s) => s };

const content = await loadAllContent();
const src = (e) => content.sourceOf.get(e) ?? 'unknown file';

/* ------------------------------------------------------------------ *
 * 1. Schema validation
 * ------------------------------------------------------------------ */
const collections = [
  ['module', content.modules],
  ['lesson', content.lessons],
  ['exercise', content.exercises],
  ['quiz', content.quizzes],
  ['challenge', content.challenges],
  ['project', content.projects],
  ['interview', content.interview],
  ['reference', content.references],
  ['cheatsheet', content.cheatSheets],
  ['placement', content.placement],
];

for (const [kind, items] of collections) {
  const validate = VALIDATORS[kind];
  for (const item of items) {
    for (const problem of validate(item)) err(problem, src(item));
  }
}

/* ------------------------------------------------------------------ *
 * 2. Duplicate ids and slugs
 * ------------------------------------------------------------------ */
function checkUnique(items, field, kind) {
  const seen = new Map();
  for (const item of items) {
    const value = item?.[field];
    if (value == null) continue;
    if (seen.has(value)) {
      err(`duplicate ${kind} ${field} "${value}"`, `${src(item)} and ${seen.get(value)}`);
    } else {
      seen.set(value, src(item));
    }
  }
}

for (const [kind, items] of collections) {
  checkUnique(items, 'id', kind);
  if (items.some((i) => i.slug)) checkUnique(items, 'slug', kind);
}
checkUnique(content.projects, 'title', 'project');
// An interview bank is padded by rephrasing the same question. Exact-duplicate
// question text is an error, not a warning — near-duplicates are caught by the
// shortAnswer warning below.
checkUnique(content.interview, 'question', 'interview');

/* ------------------------------------------------------------------ *
 * 3. Cross-reference integrity
 * ------------------------------------------------------------------ */
const moduleIds = new Set(content.modules.map((m) => m.id));
const lessonIds = new Set(content.lessons.map((l) => l.id));
const exerciseIds = new Set(content.exercises.map((e) => e.id));
const challengeIds = new Set(content.challenges.map((ch) => ch.id));
const topicIds = new Set(content.topicIds);

const checkTopics = (item, label) => {
  for (const t of item.topicIds ?? []) {
    if (!topicIds.has(t)) err(`${label} references unknown topic "${t}"`, src(item));
  }
};

for (const m of content.modules) {
  checkTopics(m, `module ${m.id}`);
  for (const p of m.prerequisites ?? []) {
    if (!moduleIds.has(p)) err(`module ${m.id} has unknown prerequisite "${p}"`, src(m));
  }
  if (m.lessonIds.length === 0) {
    err(`module ${m.id} (${m.title}) has no lessons — every module must be taught`, src(m));
  }
}

for (const l of content.lessons) {
  checkTopics(l, `lesson ${l.id}`);
  if (!moduleIds.has(l.moduleId)) err(`lesson ${l.id} references unknown module "${l.moduleId}"`, src(l));
  for (const p of l.prerequisites ?? []) {
    if (!lessonIds.has(p)) err(`lesson ${l.id} has unknown prerequisite lesson "${p}"`, src(l));
  }
  for (const r of l.relatedLessons ?? []) {
    if (!lessonIds.has(r)) err(`lesson ${l.id} links to unknown lesson "${r}"`, src(l));
  }
  for (const s of l.sections ?? []) {
    if (s.kind === SECTION.EXERCISE_REF && !exerciseIds.has(s.exerciseId)) {
      err(`lesson ${l.id} references unknown exercise "${s.exerciseId}"`, src(l));
    }
  }
}

for (const items of [
  content.exercises, content.challenges, content.projects,
  content.interview, content.references, content.cheatSheets, content.placement,
]) {
  for (const item of items) checkTopics(item, `${item.id}`);
}

for (const q of content.interview) {
  for (const lid of q.relatedLessons ?? []) {
    if (!lessonIds.has(lid)) err(`interview question ${q.id} links to unknown lesson "${lid}"`, src(q));
  }
}

for (const p of content.projects) {
  for (const lid of p.relatedLessons ?? []) {
    if (!lessonIds.has(lid)) err(`project ${p.id} links to unknown lesson "${lid}"`, src(p));
  }
  for (const cid of p.relatedChallenges ?? []) {
    if (!challengeIds.has(cid)) err(`project ${p.id} links to unknown challenge "${cid}"`, src(p));
  }
}

const referenceIds = new Set(content.references.map((r) => r.id));

/**
 * One API, one canonical article.
 *
 * `map`, `Array.map` and `Array.prototype.map()` are the same thing, and shipping
 * them as three entries makes the reference worse, not bigger. Ids and slugs are
 * already unique-checked, but those differ trivially between near-duplicates —
 * it is the *canonical name*, normalised, that has to be unique.
 */
const canonicalName = (name) =>
  String(name).toLowerCase().replace(/\(\s*\)$/, '').replace(/\s+/g, ' ').trim();

const seenCanonical = new Map();
for (const r of content.references) {
  const key = canonicalName(r.name);
  if (seenCanonical.has(key)) {
    err(`duplicate reference API "${r.name}" — already covered by ${seenCanonical.get(key)}`, src(r));
  } else {
    seenCanonical.set(key, r.id);
  }
}

/* An alias must not collide with another entry's canonical name, or search
 * becomes ambiguous about which article actually documents the API. */
for (const r of content.references) {
  for (const alias of r.aliases ?? []) {
    const key = canonicalName(alias);
    const owner = seenCanonical.get(key);
    if (owner && owner !== r.id) {
      err(`reference ${r.id} claims alias "${alias}", which is the canonical name of ${owner}`, src(r));
    }
  }
}

for (const r of content.references) {
  if (r.lessonId && !lessonIds.has(r.lessonId)) {
    err(`reference ${r.id} links to unknown lesson "${r.lessonId}"`, src(r));
  }
  for (const lid of r.relatedLessons ?? []) {
    if (!lessonIds.has(lid)) err(`reference ${r.id} links to unknown lesson "${lid}"`, src(r));
  }
  for (const rid of r.relatedEntries ?? []) {
    if (!referenceIds.has(rid)) {
      err(`reference ${r.id} links to unknown reference entry "${rid}"`, src(r));
    }
    if (rid === r.id) err(`reference ${r.id} lists itself as a related entry`, src(r));
  }
  for (const cid of r.practiceIds ?? []) {
    if (!exerciseIds.has(cid) && !challengeIds.has(cid)) {
      err(`reference ${r.id} links to unknown practice item "${cid}"`, src(r));
    }
  }
}

/**
 * A cheat sheet library is padded by shipping three near-identical sheets for
 * one topic, so titles are unique-checked like project titles, and every
 * outbound link must resolve — a revision sheet that sends you to a dead
 * reference entry is worse than one with no links at all.
 */
checkUnique(content.cheatSheets, 'title', 'cheat sheet');

for (const cs of content.cheatSheets) {
  for (const lid of cs.relatedLessons ?? []) {
    if (!lessonIds.has(lid)) err(`cheat sheet ${cs.id} links to unknown lesson "${lid}"`, src(cs));
  }
  for (const rid of cs.relatedReference ?? []) {
    if (!referenceIds.has(rid)) {
      err(`cheat sheet ${cs.id} links to unknown reference entry "${rid}"`, src(cs));
    }
  }
  for (const cid of cs.relatedChallenges ?? []) {
    if (!challengeIds.has(cid)) {
      err(`cheat sheet ${cs.id} links to unknown challenge "${cid}"`, src(cs));
    }
  }
}

/* ------------------------------------------------------------------ *
 * 4. Placeholder detection
 * ------------------------------------------------------------------ */
for (const [kind, items] of collections) {
  for (const item of items) {
    for (const hit of scanForPlaceholders(item)) {
      err(`placeholder text in ${kind} ${item.id} at ${hit.path} (/${hit.pattern}/)`, src(item));
    }
  }
}

/* ------------------------------------------------------------------ *
 * 5. Duplicate-content detection
 * ------------------------------------------------------------------ */
const normalise = (s) => String(s).toLowerCase().replace(/\s+/g, ' ').trim();

function checkDuplicateText(items, field, kind, minLength = 60) {
  const seen = new Map();
  for (const item of items) {
    const value = item?.[field];
    if (typeof value !== 'string' || value.length < minLength) continue;
    const key = normalise(value);
    if (seen.has(key)) {
      warn(`${kind} ${item.id} has the same ${field} as ${seen.get(key)} — is one of them filler?`, src(item));
    } else {
      seen.set(key, item.id);
    }
  }
}

checkDuplicateText(content.lessons, 'description', 'lesson');
checkDuplicateText(content.lessons, 'summary', 'lesson');
checkDuplicateText(content.exercises, 'instructions', 'exercise');
checkDuplicateText(content.challenges, 'prompt', 'challenge');
checkDuplicateText(content.projects, 'brief', 'project');
checkDuplicateText(content.interview, 'shortAnswer', 'interview question');
checkDuplicateText(content.references, 'summary', 'reference');

// Identical quiz questions across the whole bank usually means copy-paste padding.
// Output-prediction questions legitimately share a generic prompt ("What does this
// print?") because the *code* is the question — so the snippet is part of the key.
const quizPrompts = new Map();
for (const quiz of content.quizzes) {
  for (const q of quiz.questions ?? []) {
    const key = normalise(q.prompt) + ' ' + normalise(q.code ?? '');
    if (quizPrompts.has(key)) {
      warn(`quiz question ${q.id} duplicates ${quizPrompts.get(key)}`, src(quiz));
    } else {
      quizPrompts.set(key, q.id);
    }
  }
}

/* ------------------------------------------------------------------ *
 * 6. Counts — computed, never hardcoded
 * ------------------------------------------------------------------ */
const countExamples = (lesson) =>
  (lesson.sections ?? []).filter(
    (s) => s.kind === SECTION.CODE || s.kind === SECTION.ANNOTATED_CODE || s.kind === SECTION.COMPARISON,
  ).length;

/* ------------------------------------------------------------------ *
 * Placement assessment
 * ------------------------------------------------------------------ *
 * Placement is small and every question carries real weight, so a duplicate or
 * a stale answer key distorts a learner's whole recommendation. Prompts are
 * compared together with their code, because "What is logged?" is a legitimately
 * repeated prompt attached to different snippets.
 */
checkUnique(content.placement, 'id', 'placement question');

{
  const seen = new Map();
  const norm = (s) => String(s ?? '').replace(/\s+/g, ' ').trim().toLowerCase();
  for (const q of content.placement) {
    const key = norm(q.prompt) + ' ' + norm(q.code);
    if (seen.has(key)) {
      err(`placement question ${q.id} duplicates ${seen.get(key)}`, src(q));
    } else {
      seen.set(key, q.id);
    }
  }

  // Placement must not become a re-export of the interview bank or the quizzes.
  const elsewhere = new Map();
  for (const q of content.interview) elsewhere.set(norm(q.prompt), `interview ${q.id}`);
  for (const quiz of content.quizzes) {
    for (const q of quiz.questions ?? []) elsewhere.set(norm(q.prompt), `quiz question ${q.id}`);
  }
  for (const q of content.placement) {
    const hit = elsewhere.get(norm(q.prompt));
    // Shared short prompts like "What is logged?" are fine; identical long ones
    // mean the question was copied rather than written for placement.
    if (hit && norm(q.prompt).length > 40) {
      err(`placement question ${q.id} reuses the prompt of ${hit}`, src(q));
    }
  }

  // Every domain must actually be assessed, or its breakdown bar is a lie.
  const covered = new Set(content.placement.map((q) => q.domain));
  for (const d of PLACEMENT_DOMAINS) {
    if (!covered.has(d)) err(`placement domain "${d}" has no questions`);
  }

  // The recommendation resolves against real modules, so every domain needs one.
  const moduleTopics = new Set(content.modules.flatMap((m) => m.topicIds ?? []));
  for (const d of PLACEMENT_DOMAINS) {
    const reachable = (PLACEMENT_DOMAIN_TOPICS[d] ?? []).some((t) => moduleTopics.has(t));
    if (!reachable) err(`placement domain "${d}" maps to no curriculum module`);
  }
}

/* ------------------------------------------------------------------ *
 * Cross-content graph
 * ------------------------------------------------------------------ *
 * The checks above validate each library against itself. These validate the
 * product as one graph: every relation that names an id must resolve, no entity
 * may point at itself or list the same neighbour twice, and every routable
 * entity must actually be reachable through the router's slug lookups.
 *
 * `project.prerequisites` is deliberately absent — it is authored prose ("comfortable
 * with template literals"), not ids, and treating it as a relation would be wrong.
 */
{
  const sets = {
    module: moduleIds,
    lesson: lessonIds,
    exercise: exerciseIds,
    challenge: challengeIds,
    project: new Set(content.projects.map((p) => p.id)),
    interview: new Set(content.interview.map((q) => q.id)),
    reference: referenceIds,
    cheatsheet: new Set(content.cheatSheets.map((cs) => cs.id)),
  };

  // [owning kind, items, field, target kind] — every id-bearing relation in the schemas.
  const RELATIONS = [
    ['interview', content.interview, 'relatedLessons', 'lesson'],
    ['interview', content.interview, 'relatedChallenges', 'challenge'],
    ['project', content.projects, 'relatedLessons', 'lesson'],
    ['project', content.projects, 'relatedChallenges', 'challenge'],
    ['reference', content.references, 'relatedLessons', 'lesson'],
    ['reference', content.references, 'relatedEntries', 'reference'],
    ['cheatsheet', content.cheatSheets, 'relatedLessons', 'lesson'],
    ['cheatsheet', content.cheatSheets, 'relatedReference', 'reference'],
    ['cheatsheet', content.cheatSheets, 'relatedChallenges', 'challenge'],
    ['module', content.modules, 'prerequisites', 'module'],
    ['module', content.modules, 'lessonIds', 'lesson'],
    ['lesson', content.lessons, 'prerequisites', 'lesson'],
  ];

  let relations = 0;
  for (const [kind, items, field, target] of RELATIONS) {
    for (const item of items) {
      const list = item[field];
      if (list === undefined) continue;
      if (!Array.isArray(list)) {
        err(`${kind} ${item.id}.${field} must be an array`, src(item));
        continue;
      }
      const seen = new Set();
      for (const id of list) {
        relations += 1;
        if (!sets[target].has(id)) {
          err(`${kind} ${item.id}.${field} links to unknown ${target} "${id}"`, src(item));
        }
        if (seen.has(id)) {
          err(`${kind} ${item.id}.${field} lists "${id}" twice`, src(item));
        }
        seen.add(id);
        if (kind === target && id === item.id) {
          err(`${kind} ${item.id}.${field} references itself`, src(item));
        }
      }
    }
  }
  stats_relations = relations;

  // Routability: the router resolves these kinds by slug, so a missing or
  // malformed slug is a page that cannot be opened however valid its content is.
  for (const [kind, items] of [
    ['module', content.modules],
    ['lesson', content.lessons],
    ['challenge', content.challenges],
    ['project', content.projects],
    ['reference', content.references],
    ['cheatsheet', content.cheatSheets],
  ]) {
    for (const item of items) {
      if (typeof item.slug !== 'string' || item.slug.length === 0) {
        err(`${kind} ${item.id} has no slug and cannot be routed`, src(item));
      } else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(item.slug)) {
        err(`${kind} ${item.id} has a slug that is not URL-safe: "${item.slug}"`, src(item));
      }
    }
  }
  // A lesson URL is /learn/<module slug>/<lesson slug>, so it needs both.
  for (const l of content.lessons) {
    const mod = content.modules.find((m) => m.id === l.moduleId);
    if (mod && !mod.slug) err(`lesson ${l.id} cannot be routed: module ${mod.id} has no slug`, src(l));
  }
}

/* ------------------------------------------------------------------ *
 * Access catalog
 * ------------------------------------------------------------------ *
 * The catalog is hand-maintained id lists. A stale id there is invisible in the
 * UI — the item simply stops being Pro, or a "free sample" silently disappears —
 * so it is exactly the kind of drift that needs a machine check.
 */
{
  const byKind = {
    exercise: exerciseIds,
    challenge: challengeIds,
    project: new Set(content.projects.map((p) => p.id)),
    interview: new Set(content.interview.map((q) => q.id)),
  };
  for (const [label, catalog] of [
    ['PRO_CONTENT_IDS', PRO_CONTENT_IDS],
    ['FREE_SAMPLE_CONTENT_IDS', FREE_SAMPLE_CONTENT_IDS],
  ]) {
    for (const [kind, ids] of Object.entries(catalog)) {
      const known = byKind[kind];
      if (!known) {
        err(`${label} names unknown content kind "${kind}"`);
        continue;
      }
      const seen = new Set();
      for (const id of ids) {
        if (!known.has(id)) err(`${label}.${kind} lists "${id}", which is not real content`);
        if (seen.has(id)) err(`${label}.${kind} lists "${id}" twice`);
        seen.add(id);
      }
    }
  }

  // Free practice must survive the allocation: a lesson whose every exercise is
  // Pro leaves a Free learner reading with nothing to do.
  const byLesson = new Map();
  for (const e of content.exercises) {
    if (!e.lessonId) continue;
    if (!byLesson.has(e.lessonId)) byLesson.set(e.lessonId, []);
    byLesson.get(e.lessonId).push(e);
  }
  for (const [lessonId, list] of byLesson) {
    if (!list.some((e) => requiredPlanForContent('exercise', e.id) === 'free')) {
      err(`lesson ${lessonId} has ${list.length} exercises and every one of them is Pro`);
    }
  }
}

const stats = {
  modules: content.modules.length,
  modulesWithLessons: content.modules.filter((m) => m.lessonIds.length > 0).length,
  lessons: content.lessons.length,
  lessonSections: content.lessons.reduce((n, l) => n + (l.sections?.length ?? 0), 0),
  workedExamples: content.lessons.reduce((n, l) => n + countExamples(l), 0),
  exercises: content.exercises.length,
  quizzes: content.quizzes.length,
  quizQuestions: content.quizzes.reduce((n, q) => n + (q.questions?.length ?? 0), 0),
  challenges: content.challenges.length,
  projects: content.projects.length,
  interviewQuestions: content.interview.length,
  references: content.references.length,
  cheatSheets: content.cheatSheets.length,
  placementQuestions: content.placement.length,
  topics: content.topics.length,
  crossContentRelations: stats_relations,
  estimatedMinutes: content.lessons.reduce((n, l) => n + (l.estimatedMinutes ?? 0), 0),
};

/* ------------------------------------------------------------------ *
 * 7. Coverage manifest
 * ------------------------------------------------------------------ */
const coverage = content.modules.map((m) => {
  const lessons = content.lessons.filter((l) => l.moduleId === m.id);
  const exercises = content.exercises.filter((e) => e.moduleId === m.id);
  const quizzes = content.quizzes.filter((q) => q.moduleId === m.id);
  return {
    id: m.id,
    order: m.order,
    title: m.title,
    track: m.track,
    lessons: lessons.length,
    exercises: exercises.length,
    quizQuestions: quizzes.reduce((n, q) => n + (q.questions?.length ?? 0), 0),
    workedExamples: lessons.reduce((n, l) => n + countExamples(l), 0),
    estimatedMinutes: lessons.reduce((n, l) => n + (l.estimatedMinutes ?? 0), 0),
    status: lessons.length === 0 ? 'EMPTY' : 'covered',
  };
});

await mkdir(path.join(process.cwd(), 'src', 'content', 'generated'), { recursive: true });
await writeFile(
  path.join(process.cwd(), 'src', 'content', 'generated', 'coverage.json'),
  JSON.stringify({ generatedAt: new Date().toISOString(), stats, coverage }, null, 2) + '\n',
  'utf8',
);

/* ------------------------------------------------------------------ *
 * 8. Report
 * ------------------------------------------------------------------ */
const pad = (s, n) => String(s).padEnd(n);
const padStart = (s, n) => String(s).padStart(n);

console.log('');
console.log(c.bold('  JSPath content audit'));
console.log(c.dim('  ─────────────────────────────────────────────────────────────'));

const rows = [
  ['Modules', stats.modules],
  ['Modules with lessons', `${stats.modulesWithLessons}/${stats.modules}`],
  ['Lessons', stats.lessons],
  ['Lesson sections', stats.lessonSections],
  ['Worked code examples', stats.workedExamples],
  ['Exercises', stats.exercises],
  ['Quiz questions', stats.quizQuestions],
  ['Challenges', stats.challenges],
  ['Projects', stats.projects],
  ['Interview questions', stats.interviewQuestions],
  ['Reference entries', stats.references],
  ['Cheat sheets', stats.cheatSheets],
  ['Placement questions', stats.placementQuestions],
  ['Topics tracked', stats.topics],
  ['Cross-content relations', stats.crossContentRelations],
  ['Estimated learning time', `${Math.round(stats.estimatedMinutes / 60)}h`],
];
for (const [label, value] of rows) {
  console.log(`  ${pad(label, 26)} ${c.cyan(padStart(value, 8))}`);
}

console.log('');
console.log(c.bold('  Per-module coverage'));
console.log(c.dim('  ─────────────────────────────────────────────────────────────'));
console.log(c.dim(`  ${pad('#', 4)}${pad('Module', 40)}${padStart('Les', 5)}${padStart('Ex', 5)}${padStart('Quiz', 6)}${padStart('Ex.', 5)}`));
for (const row of coverage) {
  const label = row.title.length > 37 ? row.title.slice(0, 36) + '…' : row.title;
  const line = `  ${pad(String(row.order).padStart(2, '0'), 4)}${pad(label, 40)}${padStart(row.lessons, 5)}${padStart(row.exercises, 5)}${padStart(row.quizQuestions, 6)}${padStart(row.workedExamples, 5)}`;
  console.log(row.status === 'EMPTY' ? c.red(line + '   EMPTY') : line);
}

console.log('');
console.log(c.dim('  ─────────────────────────────────────────────────────────────'));
console.log(`  Broken references / invalid content : ${errors.length === 0 ? c.green('0') : c.red(String(errors.length))}`);
console.log(`  Warnings                            : ${warnings.length === 0 ? c.green('0') : c.yellow(String(warnings.length))}`);
console.log('');

if (warnings.length) {
  console.log(c.yellow(c.bold('  Warnings')));
  for (const w of warnings.slice(0, 40)) console.log(c.yellow(`    • ${w}`));
  if (warnings.length > 40) console.log(c.yellow(`    … and ${warnings.length - 40} more`));
  console.log('');
}

if (errors.length) {
  console.log(c.red(c.bold('  Errors')));
  for (const e of errors.slice(0, 80)) console.log(c.red(`    • ${e}`));
  if (errors.length > 80) console.log(c.red(`    … and ${errors.length - 80} more`));
  console.log('');
  console.log(c.red(`  Audit FAILED with ${errors.length} error(s).`));
  console.log('');
  process.exit(1);
}

console.log(c.green('  Audit passed.'));
console.log(c.dim('  Coverage written to src/content/generated/coverage.json'));
console.log('');
