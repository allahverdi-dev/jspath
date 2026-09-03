/**
 * Global search.
 *
 * The index is built once from the manifest — which is already in memory — so
 * search costs no extra network requests and no lesson bodies. Scoring is a small
 * hand-written ranker rather than a dependency: exact title matches beat prefix
 * matches, which beat keyword-body matches, and shorter titles win ties so that
 * "map" surfaces `Array.prototype.map()` above "Mapping data with reduce".
 */
import {
  modules, lessons, exercises, challenges, projects,
  interviewQuestions, references, cheatSheets,
} from '../../content/registry.js';
import { CONTENT_KIND } from '../../content/schema/types.js';

const normalise = (s) => String(s ?? '').toLowerCase().trim();

let index = null;

function buildIndex() {
  const entries = [];

  for (const m of modules) {
    entries.push({
      kind: CONTENT_KIND.MODULE,
      id: m.id,
      title: m.title,
      subtitle: `Module ${String(m.order).padStart(2, '0')} · ${m.lessonIds.length} lessons`,
      description: m.description,
      to: `/curriculum/${m.slug}`,
      icon: m.icon ?? 'folder',
      haystack: normalise([m.title, m.shortTitle, m.description, ...(m.objectives ?? [])].join(' ')),
      boost: 1.15,
    });
  }

  for (const l of lessons) {
    const mod = modules.find((m) => m.id === l.moduleId);
    entries.push({
      kind: CONTENT_KIND.LESSON,
      id: l.id,
      title: l.title,
      subtitle: mod ? mod.shortTitle : 'Lesson',
      description: l.description,
      to: `/learn/${mod?.slug ?? 'lesson'}/${l.slug}`,
      icon: 'article',
      difficulty: l.difficulty,
      haystack: normalise([l.title, l.description, l.keywords].join(' ')),
      boost: 1.3,
    });
  }

  for (const e of exercises) {
    entries.push({
      kind: CONTENT_KIND.EXERCISE,
      id: e.id,
      title: e.title,
      subtitle: 'Exercise',
      description: e.instructions,
      to: `/practice/exercise/${e.id}`,
      icon: 'fitness_center',
      difficulty: e.difficulty,
      haystack: normalise([e.title, e.instructions].join(' ')),
      boost: 0.9,
    });
  }

  for (const c of challenges) {
    entries.push({
      kind: CONTENT_KIND.CHALLENGE,
      id: c.id,
      title: c.title,
      subtitle: `Challenge · ${c.category}`,
      description: c.prompt,
      to: `/challenges/${c.slug}`,
      icon: 'trophy',
      difficulty: c.difficulty,
      haystack: normalise([c.title, c.prompt, c.category].join(' ')),
      boost: 1,
    });
  }

  for (const p of projects) {
    entries.push({
      kind: CONTENT_KIND.PROJECT,
      id: p.id,
      title: p.title,
      subtitle: 'Project',
      description: p.tagline,
      to: `/projects/${p.slug}`,
      icon: 'folder_special',
      difficulty: p.difficulty,
      haystack: normalise([p.title, p.tagline].join(' ')),
      boost: 1,
    });
  }

  for (const q of interviewQuestions) {
    entries.push({
      kind: CONTENT_KIND.INTERVIEW,
      id: q.id,
      title: q.question,
      subtitle: `Interview · ${q.topic}`,
      description: `${q.topic} · ${q.level} · ${q.kind}`,
      to: `/interview/question/${q.id}`,
      icon: 'record_voice_over',
      difficulty: q.level,
      haystack: normalise([q.question, q.topic, q.kind].join(' ')),
      boost: 1.05,
    });
  }

  for (const r of references) {
    entries.push({
      kind: CONTENT_KIND.REFERENCE,
      id: r.id,
      title: r.name,
      subtitle: `Reference · ${r.category}`,
      description: r.summary,
      to: `/reference/${r.slug}`,
      icon: 'menu_book',
      haystack: normalise([r.name, ...(r.aliases ?? []), r.summary, r.syntax, r.category, r.environment].join(' ')),
      boost: 1.25,
    });
  }

  for (const cs of cheatSheets) {
    entries.push({
      kind: CONTENT_KIND.CHEATSHEET,
      id: cs.id,
      title: cs.title,
      subtitle: 'Cheat sheet',
      description: cs.description,
      to: `/cheat-sheets/${cs.slug}`,
      icon: 'description',
      haystack: normalise([cs.title, ...(cs.aliases ?? []), cs.description, cs.category].join(' ')),
      boost: 1.1,
    });
  }

  return entries;
}

export function getIndex() {
  if (!index) index = buildIndex();
  return index;
}

function scoreEntry(entry, query, terms) {
  const title = normalise(entry.title);

  let score = 0;
  if (title === query) score += 120;
  else if (title.startsWith(query)) score += 80;
  else if (title.includes(query)) score += 55;

  // Word-boundary hit in the title, e.g. "map" in "Array.prototype.map()".
  if (new RegExp(`\\b${escapeRegex(query)}`).test(title)) score += 25;

  for (const term of terms) {
    if (title.includes(term)) score += 14;
    else if (entry.haystack.includes(term)) score += 5;
    else return 0; // every term must appear somewhere
  }

  // Prefer concise titles when scores are otherwise equal.
  score += Math.max(0, 24 - title.length / 4);
  return score * (entry.boost ?? 1);
}

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * @param {string} rawQuery
 * @param {{limit?:number, kinds?:string[]}} options
 * @returns {Array} scored results, best first
 */
export function search(rawQuery, { limit = 40, kinds = null } = {}) {
  const query = normalise(rawQuery);
  if (query.length < 2) return [];
  const terms = query.split(/\s+/).filter(Boolean);

  const results = [];
  for (const entry of getIndex()) {
    if (kinds && !kinds.includes(entry.kind)) continue;
    const score = scoreEntry(entry, query, terms);
    if (score > 0) results.push({ ...entry, score });
  }

  results.sort((a, b) => b.score - a.score);
  return results.slice(0, limit);
}

/** Group results by content kind, preserving rank order within each group. */
export function groupResults(results) {
  const order = [
    CONTENT_KIND.LESSON,
    CONTENT_KIND.REFERENCE,
    CONTENT_KIND.MODULE,
    CONTENT_KIND.CHALLENGE,
    CONTENT_KIND.EXERCISE,
    CONTENT_KIND.INTERVIEW,
    CONTENT_KIND.PROJECT,
    CONTENT_KIND.CHEATSHEET,
  ];
  const groups = new Map();
  for (const r of results) {
    if (!groups.has(r.kind)) groups.set(r.kind, []);
    groups.get(r.kind).push(r);
  }
  return order.filter((k) => groups.has(k)).map((kind) => ({ kind, items: groups.get(kind) }));
}

/** Section headings for grouped results, as dictionary keys. */
export const KIND_KEY = {
  [CONTENT_KIND.MODULE]: 'search.kindModule',
  [CONTENT_KIND.LESSON]: 'search.kindLesson',
  [CONTENT_KIND.EXERCISE]: 'search.kindExercise',
  [CONTENT_KIND.CHALLENGE]: 'search.kindChallenge',
  [CONTENT_KIND.PROJECT]: 'search.kindProject',
  [CONTENT_KIND.INTERVIEW]: 'search.kindInterview',
  [CONTENT_KIND.REFERENCE]: 'search.kindReference',
  [CONTENT_KIND.CHEATSHEET]: 'search.kindCheatsheet',
};
