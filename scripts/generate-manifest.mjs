#!/usr/bin/env node
/**
 * Generates `src/content/generated/manifest.json`.
 *
 * The app imports the manifest statically — it is small, and it gives every
 * screen (curriculum, search, dashboard, practice hub) instant access to titles,
 * counts and relationships. Full lesson bodies stay in their own lazily-loaded
 * chunks, so the initial bundle never carries the whole curriculum.
 *
 * Runs automatically via `predev` and `prebuild`.
 */
import { writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { loadAllContent } from './lib/load-content.mjs';
import { SECTION } from '../src/content/schema/types.js';

const content = await loadAllContent();

/** Text a search index should match against, flattened from a lesson. */
function lessonKeywords(lesson) {
  const parts = [lesson.title, lesson.description, ...(lesson.learningObjectives ?? []), ...(lesson.keyTakeaways ?? [])];
  for (const s of lesson.sections ?? []) {
    if (s.kind === SECTION.HEADING) parts.push(s.text);
    if (s.kind === SECTION.TERMS) parts.push(...(s.terms ?? []).map((t) => t.term));
  }
  return parts.join(' ').toLowerCase().replace(/\s+/g, ' ').slice(0, 800);
}

/**
 * Shorten authored text for a card without breaking its markup.
 *
 * Descriptions, prompts and instructions are authored with inline code spans.
 * A plain `.slice()` can cut one in half, and the orphaned backtick then renders
 * literally on every card and search result - the string is no longer valid
 * markup. So after clipping we drop any trailing unpaired code span, then tidy
 * the dangling word and punctuation the cut left behind.
 */
function clip(text, max) {
  // A card has no room for a fenced block, and truncating one leaves a stray
  // fence behind, so drop fences entirely before measuring.
  const s = String(text ?? '')
    .replace(/```[\s\S]*?```/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
  if (s.length <= max) return s;
  let out = s.slice(0, max);
  // Trim to a word boundary first: this step can itself drop a backtick, so
  // the parity repair has to come after it or it fixes the wrong string.
  const lastSpace = out.lastIndexOf(' ');
  if (lastSpace > max * 0.6) out = out.slice(0, lastSpace);
  // Drop trailing unpaired markers: half a marker renders as a literal
  // backtick or asterisk on the card. Repairing one can truncate away the
  // other's partner, so repeat until both are balanced.
  for (const marker of ['`', '**', '`', '**']) {
    const n = out.split(marker).length - 1;
    if (n % 2 !== 0) out = out.slice(0, out.lastIndexOf(marker));
  }
  return out.replace(/[\s,;:(*-]+$/, '').trimEnd();
}

const relPath = (entity) => (content.sourceOf.get(entity) ?? '').replace(/\\/g, '/');

const manifest = {
  generatedAt: new Date().toISOString(),

  topics: content.topics,

  modules: content.modules.map((m) => ({
    id: m.id,
    slug: m.slug,
    order: m.order,
    title: m.title,
    shortTitle: m.shortTitle,
    description: m.description,
    icon: m.icon,
    track: m.track,
    difficulty: m.difficulty,
    topicIds: m.topicIds,
    objectives: m.objectives,
    prerequisites: m.prerequisites ?? [],
    lessonIds: m.lessonIds,
  })),

  lessons: content.lessons
    .slice()
    .sort((a, b) => a.moduleId.localeCompare(b.moduleId) || a.order - b.order)
    .map((l) => ({
      id: l.id,
      slug: l.slug,
      moduleId: l.moduleId,
      order: l.order,
      title: l.title,
      description: l.description,
      difficulty: l.difficulty,
      estimatedMinutes: l.estimatedMinutes,
      xp: l.xp,
      topicIds: l.topicIds,
      prerequisites: l.prerequisites ?? [],
      relatedLessons: l.relatedLessons ?? [],
      interviewConnections: l.interviewConnections ?? [],
      objectiveCount: (l.learningObjectives ?? []).length,
      sectionCount: (l.sections ?? []).length,
      exerciseIds: (l.exercises ?? []).map((e) => e.id),
      quizId: l.quiz?.id ?? null,
      quizQuestionCount: l.quiz?.questions?.length ?? 0,
      // Assessment evidence only: never publish answer keys in discovery metadata.
      quizQuestions: (l.quiz?.questions ?? []).map((q) => ({ id: q.id, topicIds: q.topicIds ?? [] })),
      keywords: lessonKeywords(l),
      source: relPath(l),
    })),

  exercises: content.exercises.map((e) => ({
    id: e.id,
    title: e.title,
    kind: e.kind,
    difficulty: e.difficulty,
    xp: e.xp,
    topicIds: e.topicIds,
    lessonId: e.lessonId ?? null,
    moduleId: e.moduleId ?? null,
    instructions: clip(e.instructions, 220),
    source: relPath(e),
  })),

  challenges: content.challenges.map((ch) => ({
    id: ch.id,
    slug: ch.slug,
    title: ch.title,
    category: ch.category,
    difficulty: ch.difficulty,
    xp: ch.xp,
    topicIds: ch.topicIds,
    prompt: clip(ch.prompt, 240),
    source: relPath(ch),
  })),

  projects: content.projects.map((p) => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    difficulty: p.difficulty,
    tagline: p.tagline ?? clip(p.brief, 160),
    topicIds: p.topicIds,
    estimatedHours: p.estimatedHours ?? null,
    milestoneCount: (p.milestones ?? []).length,
    requirementCount: (p.requirements ?? []).length,
    relatedLessons: p.relatedLessons ?? [],
    source: relPath(p),
  })),

  interview: content.interview.map((q) => ({
    id: q.id,
    question: q.question,
    topic: q.topic,
    level: q.level,
    kind: q.kind ?? 'concept',
    topicIds: q.topicIds,
    relatedLessons: q.relatedLessons ?? [],
    source: relPath(q),
  })),

  references: content.references.map((r) => ({
    id: r.id,
    slug: r.slug,
    name: r.name,
    category: r.category,
    environment: r.environment,
    syntax: r.syntax,
    summary: r.summary,
    mutates: r.mutates,
    // Aliases are the informal names people actually type — "map", "array map".
    // They live in the manifest so global search can match them without loading
    // a single reference body.
    aliases: r.aliases ?? [],
    topicIds: r.topicIds ?? [],
    lessonId: r.lessonId ?? null,
    source: relPath(r),
  })),

  cheatSheets: content.cheatSheets.map((cs) => ({
    id: cs.id,
    slug: cs.slug,
    title: cs.title,
    description: cs.description,
    icon: cs.icon ?? 'description',
    category: cs.category,
    aliases: cs.aliases ?? [],
    topicIds: cs.topicIds ?? [],
    entryCount: (cs.groups ?? []).reduce(
      (n, g) => n + (g.entries?.length ?? g.rows?.length ?? g.items?.length ?? 0),
      0,
    ),
    source: relPath(cs),
  })),
};

const outDir = path.join(process.cwd(), 'src', 'content', 'generated');
await mkdir(outDir, { recursive: true });
await writeFile(path.join(outDir, 'manifest.json'), JSON.stringify(manifest), 'utf8');

console.log(
  `content manifest: ${manifest.modules.length} modules, ${manifest.lessons.length} lessons, ` +
    `${manifest.exercises.length} exercises, ${manifest.challenges.length} challenges, ` +
    `${manifest.projects.length} projects, ${manifest.interview.length} interview questions, ` +
    `${manifest.references.length} references, ${manifest.cheatSheets.length} cheat sheets`,
);
