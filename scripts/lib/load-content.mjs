import { readdir, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT = process.cwd();
const CONTENT = path.join(ROOT, 'src', 'content');

/** Recursively collect .js files under a directory (skipping generated/schema). */
async function collect(dir, out = []) {
  if (!existsSync(dir)) return out;
  for (const entry of await readdir(dir)) {
    const full = path.join(dir, entry);
    const s = await stat(full);
    if (s.isDirectory()) {
      if (entry === 'generated' || entry === 'schema') continue;
      await collect(full, out);
    } else if (entry.endsWith('.js') && !entry.endsWith('.test.js')) {
      out.push(full);
    }
  }
  return out;
}

const importFile = (f) => import(pathToFileURL(f).href);

/**
 * Load every piece of authored content from the filesystem.
 * Returns flat arrays plus the file each entity came from, so the audit can
 * point at a real path when something is wrong.
 */
export async function loadAllContent() {
  const modulesMod = await importFile(path.join(CONTENT, 'curriculum', 'modules.js'));
  const topicsMod = await importFile(path.join(CONTENT, 'topics.js'));

  const lessons = [];
  const exercises = [];
  const quizzes = [];
  const challenges = [];
  const projects = [];
  const interview = [];
  const references = [];
  const cheatSheets = [];
  const placement = [];
  const sourceOf = new Map();

  const note = (entity, file) => {
    if (entity && typeof entity === 'object') sourceOf.set(entity, path.relative(ROOT, file));
    return entity;
  };

  // --- Lessons (also the home of inline exercises + quizzes) ---
  const lessonFiles = await collect(path.join(CONTENT, 'curriculum'));
  for (const file of lessonFiles) {
    if (path.basename(file) === 'modules.js') continue;
    const mod = await importFile(file);
    const items = mod.default ?? mod.lesson ?? mod.lessons;
    for (const lesson of [].concat(items ?? [])) {
      if (!lesson || typeof lesson !== 'object') continue;
      lessons.push(note(lesson, file));
      for (const ex of lesson.exercises ?? []) {
        exercises.push(note({ ...ex, lessonId: lesson.id, moduleId: lesson.moduleId }, file));
      }
      if (lesson.quiz) {
        quizzes.push(note({ ...lesson.quiz, lessonId: lesson.id, moduleId: lesson.moduleId }, file));
      }
    }
  }

  // --- Standalone collections ---
  const bucket = async (dirName, sink, key) => {
    for (const file of await collect(path.join(CONTENT, dirName))) {
      const mod = await importFile(file);
      const items = mod.default ?? mod[key];
      for (const item of [].concat(items ?? [])) {
        if (item && typeof item === 'object') sink.push(note(item, file));
      }
    }
  };

  await bucket('exercises', exercises, 'exercises');
  await bucket('challenges', challenges, 'challenges');
  await bucket('projects', projects, 'projects');
  await bucket('interview', interview, 'questions');
  await bucket('references', references, 'references');
  await bucket('cheat-sheets', cheatSheets, 'cheatSheets');
  // Placement re-exports its domain files through index.js; loading both would
  // double every question, so the bank is taken from the index alone.
  {
    const file = path.join(CONTENT, 'placement', 'index.js');
    if (existsSync(file)) {
      const mod = await importFile(file);
      for (const item of mod.PLACEMENT_QUESTIONS ?? []) placement.push(note(item, file));
    }
  }

  // --- Assemble modules: lessonIds derive from the lessons themselves ---
  const modules = modulesMod.MODULES.map((m) => ({
    ...m,
    lessonIds: lessons
      .filter((l) => l.moduleId === m.id)
      .sort((a, b) => a.order - b.order)
      .map((l) => l.id),
  }));

  return {
    modules,
    lessons,
    exercises,
    quizzes,
    challenges,
    projects,
    interview,
    references,
    cheatSheets,
    placement,
    topics: topicsMod.TOPICS,
    topicIds: topicsMod.TOPIC_IDS,
    sourceOf,
  };
}
