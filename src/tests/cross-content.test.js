import { describe, it, expect } from 'vitest';
import {
  modules, lessons, exercises, challenges, projects,
  interviewQuestions, references, cheatSheets,
  moduleById, moduleBySlug, lessonById, lessonBySlug, exerciseById,
  challengeById, challengeBySlug, projectById, projectBySlug,
  interviewById, referenceById, referenceBySlug,
  cheatSheetById, cheatSheetBySlug, quizIndex, lessonOrder, contentStats,
} from '../content/registry.js';
import PLACEMENT_QUESTIONS from '../content/placement/index.js';
import { TOPIC_IDS, TOPICS } from '../content/topics.js';
import { search, getIndex } from '../features/search/searchIndex.js';
import { PRO_CONTENT_IDS, FREE_SAMPLE_CONTENT_IDS } from '../features/billing/accessCatalog.js';
import { requiredPlanForContent, canAccessContent } from '../features/billing/access.js';
import { CONTENT_ALLOCATION } from '../features/billing/contentAllocation.js';
import { placeLearner } from '../features/placement/placementEngine.js';
import searchOverlaySource from '../features/search/SearchOverlay.jsx?raw';
import searchPageSource from '../pages/SearchPage.jsx?raw';
import practiceHubSource from '../pages/PracticeHub.jsx?raw';
import exerciseRunnerSource from '../features/exercises/ExerciseRunner.jsx?raw';
import quizRunnerSource from '../features/quizzes/QuizRunner.jsx?raw';

/**
 * Cross-content validation.
 *
 * Every other test file proves one library is internally correct. This one proves
 * the libraries fit together as a single product: that every id a piece of content
 * names actually exists, that every routable entity can be reached, that the
 * access catalog describes real content, and that the numbers the Pricing page
 * quotes are the numbers the registry actually contains.
 *
 * These are the invariants that break silently — a renamed challenge leaves a
 * dead "related practice" link that no page crashes on, it just quietly goes
 * nowhere. Nothing here should ever need a fixture: it all derives from content.
 */

const idsOf = (items) => items.map((i) => i.id);
const setOf = (items) => new Set(idsOf(items));

const ID_SETS = {
  module: setOf(modules),
  lesson: setOf(lessons),
  exercise: setOf(exercises),
  challenge: setOf(challenges),
  project: setOf(projects),
  interview: setOf(interviewQuestions),
  reference: setOf(references),
  cheatsheet: setOf(cheatSheets),
};

/**
 * Every id-bearing relation the *registry* carries.
 *
 * The manifest is a card projection: it ships `relatedLessons` because cards and
 * search need it, but the deeper relations (relatedReference, relatedChallenges,
 * relatedEntries) live in lesson/entry bodies that load lazily. Those are
 * validated against source by `npm run content:audit`, which loads the real
 * files; duplicating that here would only test the projection.
 */
const RELATIONS = [
  ['interview', interviewQuestions, 'relatedLessons', 'lesson'],
  ['project', projects, 'relatedLessons', 'lesson'],
  ['reference', references, 'lessonId', 'lesson'],
  ['module', modules, 'prerequisites', 'module'],
  ['module', modules, 'lessonIds', 'lesson'],
];

/* ------------------------------------------------------------------ *
 * Identity
 * ------------------------------------------------------------------ */

describe('id and slug integrity', () => {
  it.each([
    ['module', modules],
    ['lesson', lessons],
    ['exercise', exercises],
    ['challenge', challenges],
    ['project', projects],
    ['interview question', interviewQuestions],
    ['reference entry', references],
    ['cheat sheet', cheatSheets],
    ['placement question', PLACEMENT_QUESTIONS],
  ])('every %s id is unique', (_label, items) => {
    const ids = idsOf(items);
    const seen = new Set();
    const dupes = ids.filter((id) => (seen.has(id) ? true : (seen.add(id), false)));
    expect(dupes).toEqual([]);
    expect(ids.every((id) => typeof id === 'string' && id.length > 0)).toBe(true);
  });

  it.each([
    ['module', modules],
    ['lesson', lessons],
    ['challenge', challenges],
    ['project', projects],
    ['reference entry', references],
    ['cheat sheet', cheatSheets],
  ])('every %s slug is unique and URL-safe', (_label, items) => {
    const slugs = items.map((i) => i.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const slug of slugs) expect(slug).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
  });

  it('keeps reference canonical names unique', () => {
    const names = references.map((r) => r.name.toLowerCase().replace(/\(\)$/, '').trim());
    expect(new Set(names).size).toBe(names.length);
  });

  it('keeps cheat sheet titles unique', () => {
    const titles = cheatSheets.map((cs) => cs.title);
    expect(new Set(titles).size).toBe(titles.length);
  });

  it('never lets a reference alias collide with another canonical name', () => {
    const canonical = new Map(
      references.map((r) => [r.name.toLowerCase().replace(/\(\)$/, '').trim(), r.id]),
    );
    for (const r of references) {
      for (const alias of r.aliases ?? []) {
        const owner = canonical.get(alias.toLowerCase().replace(/\(\)$/, '').trim());
        expect(owner === undefined || owner === r.id, `${r.id} alias "${alias}"`).toBe(true);
      }
    }
  });
});

/* ------------------------------------------------------------------ *
 * The relation graph
 * ------------------------------------------------------------------ */

describe('cross-content relation graph', () => {
  it.each(RELATIONS)('%s.%s resolves to a real %s', (kind, items, field, target) => {
    const dead = [];
    for (const item of items) {
      const value = item[field];
      for (const id of Array.isArray(value) ? value : [value].filter(Boolean)) {
        if (!ID_SETS[target].has(id)) dead.push(`${kind} ${item.id}.${field} -> ${id}`);
      }
    }
    expect(dead).toEqual([]);
  });

  it('never lists the same neighbour twice in one entity', () => {
    const dupes = [];
    for (const [kind, items, field] of RELATIONS) {
      for (const item of items) {
        const list = item[field];
        if (!Array.isArray(list)) continue;
        if (new Set(list).size !== list.length) dupes.push(`${kind} ${item.id}.${field}`);
      }
    }
    expect(dupes).toEqual([]);
  });

  it('never lets an entity reference itself', () => {
    const selfRefs = [];
    for (const [kind, items, field, target] of RELATIONS) {
      if (kind !== target) continue;
      for (const item of items) {
        const list = item[field];
        if (Array.isArray(list) && list.includes(item.id)) selfRefs.push(`${kind} ${item.id}.${field}`);
      }
    }
    expect(selfRefs).toEqual([]);
  });

  it('validates a meaningful number of relations, so this test cannot silently pass on nothing', () => {
    const total = RELATIONS.reduce(
      (n, [, items, field]) => n + items.reduce((m, i) => {
        const v = i[field];
        return m + (Array.isArray(v) ? v.length : v ? 1 : 0);
      }, 0),
      0,
    );
    expect(total).toBeGreaterThan(500);
  });
});

/* ------------------------------------------------------------------ *
 * Topics
 * ------------------------------------------------------------------ */

describe('topic taxonomy', () => {
  const TAGGED = [
    ['module', modules], ['lesson', lessons], ['exercise', exercises],
    ['challenge', challenges], ['project', projects], ['interview', interviewQuestions],
    ['reference', references], ['cheatsheet', cheatSheets], ['placement', PLACEMENT_QUESTIONS],
  ];

  it.each(TAGGED)('every topic id used by a %s exists in the taxonomy', (_kind, items) => {
    const known = new Set(TOPIC_IDS);
    const unknown = [];
    for (const i of items) {
      for (const t of i.topicIds ?? []) if (!known.has(t)) unknown.push(`${i.id} -> ${t}`);
    }
    expect(unknown).toEqual([]);
  });

  it('has no orphan topic that nothing anywhere uses', () => {
    const used = new Set(TAGGED.flatMap(([, items]) => items.flatMap((i) => i.topicIds ?? [])));
    expect(TOPIC_IDS.filter((t) => !used.has(t))).toEqual([]);
  });

  it('teaches every topic in the curriculum before testing it anywhere else', () => {
    const taught = new Set(lessons.flatMap((l) => l.topicIds ?? []));
    const assessed = new Set(
      [...challenges, ...interviewQuestions, ...PLACEMENT_QUESTIONS].flatMap((i) => i.topicIds ?? []),
    );
    expect([...assessed].filter((t) => !taught.has(t))).toEqual([]);
  });
});

/* ------------------------------------------------------------------ *
 * Curriculum hierarchy
 * ------------------------------------------------------------------ */

describe('curriculum hierarchy', () => {
  it('gives every module a unique position', () => {
    const orders = modules.map((m) => m.order);
    expect(new Set(orders).size).toBe(orders.length);
  });

  it('derives module.lessonIds from the lessons themselves, in order', () => {
    for (const m of modules) {
      const derived = lessons
        .filter((l) => l.moduleId === m.id)
        .sort((a, b) => a.order - b.order)
        .map((l) => l.id);
      expect(m.lessonIds, m.id).toEqual(derived);
    }
  });

  it('puts every lesson in exactly one module, with a deterministic order', () => {
    expect(lessonOrder).toHaveLength(lessons.length);
    expect(new Set(lessonOrder).size).toBe(lessonOrder.length);
    for (const l of lessons) expect(moduleById[l.moduleId], l.id).toBeDefined();
  });

  it('never lists a module prerequisite that comes later in the curriculum', () => {
    const order = Object.fromEntries(modules.map((m) => [m.id, m.order]));
    for (const m of modules) {
      for (const p of m.prerequisites ?? []) {
        expect(order[p], `${m.id} requires ${p}`).toBeLessThan(m.order);
      }
    }
  });

  it('attaches every exercise and quiz to a real lesson', () => {
    for (const e of exercises) expect(lessonById[e.lessonId], e.id).toBeDefined();
    for (const q of quizIndex) expect(lessonById[q.lessonId], q.id).toBeDefined();
  });
});

/* ------------------------------------------------------------------ *
 * Routes
 * ------------------------------------------------------------------ */

describe('route integrity', () => {
  it.each([
    ['module', modules, moduleBySlug, (m) => `/curriculum/${m.slug}`],
    ['challenge', challenges, challengeBySlug, (c) => `/challenges/${c.slug}`],
    ['project', projects, projectBySlug, (p) => `/projects/${p.slug}`],
    ['reference', references, referenceBySlug, (r) => `/reference/${r.slug}`],
    ['cheat sheet', cheatSheets, cheatSheetBySlug, (cs) => `/cheat-sheets/${cs.slug}`],
  ])('every %s resolves through the router index it is looked up by', (_kind, items, index, url) => {
    for (const item of items) {
      expect(index[item.slug], item.id).toBeDefined();
      expect(index[item.slug].id).toBe(item.id);
      expect(url(item).split('/')).not.toContain('undefined');
    }
  });

  it('resolves every lesson URL, which needs both a module and a lesson slug', () => {
    for (const l of lessons) {
      const mod = moduleById[l.moduleId];
      expect(mod, l.id).toBeDefined();
      const url = `/learn/${mod.slug}/${l.slug}`;
      expect(url.split('/')).not.toContain('undefined');
      expect(lessonBySlug[l.slug].id).toBe(l.id);
    }
  });

  it('resolves every id-routed entity', () => {
    for (const q of interviewQuestions) expect(interviewById[q.id]).toBeDefined();
    for (const e of exercises) expect(exerciseById[e.id]).toBeDefined();
    for (const r of references) expect(referenceById[r.id]).toBeDefined();
    for (const cs of cheatSheets) expect(cheatSheetById[cs.id]).toBeDefined();
    for (const c of challenges) expect(challengeById[c.id]).toBeDefined();
    for (const p of projects) expect(projectById[p.id]).toBeDefined();
  });
});

/* ------------------------------------------------------------------ *
 * Search
 * ------------------------------------------------------------------ */

describe('global search', () => {
  it('points every indexed entry at a target that really exists', () => {
    const resolvers = {
      module: (id) => moduleById[id],
      lesson: (id) => lessonById[id],
      exercise: (id) => exerciseById[id],
      challenge: (id) => challengeById[id],
      project: (id) => projectById[id],
      interview: (id) => interviewById[id],
      reference: (id) => referenceById[id],
      cheatsheet: (id) => cheatSheetById[id],
    };
    for (const entry of getIndex()) {
      expect(resolvers[entry.kind], `unindexable kind ${entry.kind}`).toBeDefined();
      expect(resolvers[entry.kind](entry.id), `${entry.kind} ${entry.id}`).toBeDefined();
      expect(entry.to.split('/')).not.toContain('undefined');
      expect(entry.to.startsWith('/')).toBe(true);
    }
  });

  it('indexes each content item exactly once', () => {
    const keys = getIndex().map((e) => `${e.kind}:${e.id}`);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('renders every result field that can carry authored markup through InlineMarkup', () => {
    // Interview prompts, lesson descriptions and reference summaries are authored
    // with inline code (`map`, `**shallow**`). Detail pages have always rendered
    // that through InlineMarkup; search used to print it literally. Both search
    // surfaces now pass title and description through the same component, so the
    // same string looks the same everywhere.
    for (const [name, source] of [
      ['SearchOverlay', searchOverlaySource],
      ['SearchPage', searchPageSource],
    ]) {
      expect(source, name).toContain('<InlineMarkup text={item.title} />');
      expect(source, name).toContain('<InlineMarkup text={item.description} />');
    }
  });

  it('keeps subtitles free of markup, because they are plain labels', () => {
    for (const entry of getIndex()) {
      expect(String(entry.subtitle ?? ''), entry.id).not.toMatch(/`|\*\*/);
    }
  });

  it('keeps placement questions out of the index', () => {
    const kinds = new Set(getIndex().map((e) => e.kind));
    expect(kinds.has('placement')).toBe(false);
    const placementIds = new Set(PLACEMENT_QUESTIONS.map((q) => q.id));
    expect(getIndex().some((e) => placementIds.has(e.id))).toBe(false);
  });

  it.each([
    ['array methods', 'cheatsheet'],
    ['closure', 'lesson'],
    ['this', 'reference'],
    ['prototype', 'lesson'],
    ['event delegation', 'lesson'],
    ['event loop', 'lesson'],
    ['promise', 'reference'],
    ['fetch', 'reference'],
    ['regex', 'lesson'],
    ['Map', 'reference'],
    ['Object.freeze', 'reference'],
    ['security', 'lesson'],
    ['Big O', 'lesson'],
    ['modules', 'lesson'],
  ])('finds results for "%s" including a %s', (term, expectedKind) => {
    const results = search(term);
    expect(results.length, term).toBeGreaterThan(0);
    expect(results.map((r) => r.kind), term).toContain(expectedKind);
    // No duplicate rows caused by alias indexing.
    const keys = results.map((r) => `${r.kind}:${r.id}`);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('matches a reference by its alias, not only its canonical name', () => {
    const withAlias = references.find((r) => (r.aliases ?? []).length > 0);
    const results = search(withAlias.aliases[0]);
    expect(results.length).toBeGreaterThan(0);
  });
});

/* ------------------------------------------------------------------ *
 * Card projections
 * ------------------------------------------------------------------ */

describe('card text keeps its markup intact', () => {
  // The manifest shortens instructions, prompts and taglines for cards. A plain
  // slice used to cut inline code in half, and the orphaned backtick then showed
  // literally on every card and search result.
  const balanced = (text, marker) => (String(text ?? '').split(marker).length - 1) % 2 === 0;

  it.each([
    ['exercise instructions', exercises, 'instructions'],
    ['challenge prompts', challenges, 'prompt'],
    ['project taglines', projects, 'tagline'],
  ])('never leaves an unpaired marker in %s', (_label, items, field) => {
    const broken = items
      .filter((i) => !balanced(i[field], '`') || !balanced(i[field], '**'))
      .map((i) => `${i.id}: ${String(i[field]).slice(-60)}`);
    expect(broken).toEqual([]);
  });

  it('leaves code-comparison exercise options as literal source, not markup', () => {
    // `chooseImplementation` options are four JavaScript literals the learner
    // compares — including a template literal whose backticks are real syntax.
    // Those render monospaced and verbatim on purpose: passing them through
    // InlineMarkup would strip the backticks and make the answer unrecognisable.
    // Quiz options are the opposite case: prose with inline code, so they do
    // render markup. The two must not be conflated.
    const source = practiceHubSource;
    expect(source).toContain('<InlineMarkup text={exercise.title} />');
    expect(exerciseRunnerSource).toContain('<InlineMarkup text={exercise.instructions} />');
    expect(exerciseRunnerSource).toContain('font-mono text-code-md text-on-surface"><Authored>{option}</Authored></span>');
    expect(exerciseRunnerSource).not.toContain('<InlineMarkup text={option} />');
    expect(quizRunnerSource).toContain('<InlineMarkup text={option} />');
  });

  it('keeps titles and labels free of markup, since they appear in <option> and aria text', () => {
    // <option> cannot contain elements, so a marked-up label can never render.
    for (const m of modules) {
      expect(m.title, m.id).not.toMatch(/`|\*\*/);
      expect(String(m.shortTitle ?? ''), m.id).not.toMatch(/`|\*\*/);
    }
    for (const t of TOPICS) expect(t.label, t.id).not.toMatch(/`|\*\*/);
    for (const c of challenges) expect(c.title, c.id).not.toMatch(/`|\*\*/);
    for (const p of projects) expect(p.title, p.id).not.toMatch(/`|\*\*/);
    for (const cs of cheatSheets) expect(cs.title, cs.id).not.toMatch(/`|\*\*/);
  });
});

/* ------------------------------------------------------------------ *
 * Free / Pro
 * ------------------------------------------------------------------ */

describe('free and pro allocation', () => {
  it('lists only real content in the access catalogs', () => {
    const byKind = {
      exercise: ID_SETS.exercise,
      challenge: ID_SETS.challenge,
      project: ID_SETS.project,
      interview: ID_SETS.interview,
    };
    for (const [label, catalog] of [
      ['PRO_CONTENT_IDS', PRO_CONTENT_IDS],
      ['FREE_SAMPLE_CONTENT_IDS', FREE_SAMPLE_CONTENT_IDS],
    ]) {
      for (const [kind, ids] of Object.entries(catalog)) {
        expect(byKind[kind], `${label}.${kind}`).toBeDefined();
        expect(new Set(ids).size, `${label}.${kind} duplicates`).toBe(ids.length);
        expect(ids.filter((id) => !byKind[kind].has(id)), `${label}.${kind} stale`).toEqual([]);
      }
    }
  });

  it('holds the exact intended allocation', () => {
    expect({
      module: [CONTENT_ALLOCATION.module.free, CONTENT_ALLOCATION.module.pro],
      lesson: [CONTENT_ALLOCATION.lesson.free, CONTENT_ALLOCATION.lesson.pro],
      exercise: [CONTENT_ALLOCATION.exercise.free, CONTENT_ALLOCATION.exercise.pro],
      challenge: [CONTENT_ALLOCATION.challenge.free, CONTENT_ALLOCATION.challenge.pro],
      project: [CONTENT_ALLOCATION.project.free, CONTENT_ALLOCATION.project.pro],
      interview: [CONTENT_ALLOCATION.interview.free, CONTENT_ALLOCATION.interview.pro],
      reference: [CONTENT_ALLOCATION.reference.free, CONTENT_ALLOCATION.reference.pro],
      cheatsheet: [CONTENT_ALLOCATION.cheatsheet.free, CONTENT_ALLOCATION.cheatsheet.pro],
    }).toEqual({
      module: [47, 0],
      lesson: [214, 0],
      exercise: [650, 160],
      challenge: [15, 156],
      project: [5, 26],
      interview: [25, 287],
      reference: [213, 0],
      cheatsheet: [30, 0],
    });
  });

  it('keeps the whole curriculum, reference, cheat sheets and placement free', () => {
    for (const m of modules) expect(requiredPlanForContent('module', m.id)).toBe('free');
    for (const l of lessons) expect(requiredPlanForContent('lesson', l.id)).toBe('free');
    for (const r of references) expect(requiredPlanForContent('reference', r.id)).toBe('free');
    for (const cs of cheatSheets) expect(requiredPlanForContent('cheatsheet', cs.id)).toBe('free');
    for (const q of PLACEMENT_QUESTIONS.slice(0, 5)) {
      expect(requiredPlanForContent('placement', q.id)).toBe('free');
    }
  });

  it('leaves every lesson with at least one free exercise', () => {
    const byLesson = new Map();
    for (const e of exercises) {
      if (!byLesson.has(e.lessonId)) byLesson.set(e.lessonId, []);
      byLesson.get(e.lessonId).push(e);
    }
    const starved = [...byLesson.entries()]
      .filter(([, list]) => !list.some((e) => requiredPlanForContent('exercise', e.id) === 'free'))
      .map(([id]) => id);
    expect(starved).toEqual([]);
  });

  it('lets a Pro plan reach every piece of content', () => {
    const all = [
      ['module', modules], ['lesson', lessons], ['exercise', exercises],
      ['challenge', challenges], ['project', projects], ['interview', interviewQuestions],
      ['reference', references], ['cheatsheet', cheatSheets],
    ];
    for (const [kind, items] of all) {
      for (const item of items) {
        expect(canAccessContent({ kind, id: item.id, plan: 'pro' }), `${kind} ${item.id}`).toBe(true);
      }
    }
  });

  it('does not let a guest or free plan reach Pro content', () => {
    const proChallenge = challenges.find((c) => requiredPlanForContent('challenge', c.id) === 'pro');
    const proProject = projects.find((p) => requiredPlanForContent('project', p.id) === 'pro');
    const proInterview = interviewQuestions.find((q) => requiredPlanForContent('interview', q.id) === 'pro');
    for (const plan of ['guest', 'free']) {
      expect(canAccessContent({ kind: 'challenge', id: proChallenge.id, plan })).toBe(false);
      expect(canAccessContent({ kind: 'project', id: proProject.id, plan })).toBe(false);
      expect(canAccessContent({ kind: 'interview', id: proInterview.id, plan })).toBe(false);
    }
  });
});

/* ------------------------------------------------------------------ *
 * Placement, progress and counts
 * ------------------------------------------------------------------ */

describe('placement fits the curriculum', () => {
  it('recommends only real, free modules across the whole score range', () => {
    for (let i = 0; i <= 10; i++) {
      const answers = {};
      PLACEMENT_QUESTIONS.forEach((q, n) => {
        answers[q.id] = n % 10 < i ? q.correct : (q.correct + 1) % q.options.length;
      });
      const { recommendedModuleId } = placeLearner({ questions: PLACEMENT_QUESTIONS, answers, modules });
      expect(moduleById[recommendedModuleId], `profile ${i}`).toBeDefined();
      expect(requiredPlanForContent('module', recommendedModuleId)).toBe('free');
    }
  });

  it('assesses only topics the curriculum actually teaches', () => {
    const taught = new Set(lessons.flatMap((l) => l.topicIds ?? []));
    for (const q of PLACEMENT_QUESTIONS) {
      for (const t of q.topicIds) expect(taught.has(t), `${q.id} -> ${t}`).toBe(true);
    }
  });
});

describe('derived counts', () => {
  it('derives contentStats from the registry rather than pinning them', () => {
    expect(contentStats.modules).toBe(modules.length);
    expect(contentStats.lessons).toBe(lessons.length);
    expect(contentStats.exercises).toBe(exercises.length);
    expect(contentStats.challenges).toBe(challenges.length);
    expect(contentStats.projects).toBe(projects.length);
    expect(contentStats.interviewQuestions).toBe(interviewQuestions.length);
    expect(contentStats.references).toBe(references.length);
    expect(contentStats.cheatSheets).toBe(cheatSheets.length);
  });

  it('matches the allocation totals to the real library sizes', () => {
    expect(CONTENT_ALLOCATION.exercise.total).toBe(exercises.length);
    expect(CONTENT_ALLOCATION.challenge.total).toBe(challenges.length);
    expect(CONTENT_ALLOCATION.project.total).toBe(projects.length);
    expect(CONTENT_ALLOCATION.interview.total).toBe(interviewQuestions.length);
  });
});
