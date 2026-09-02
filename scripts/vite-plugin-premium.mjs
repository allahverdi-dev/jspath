import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { PREMIUM_FIELDS, PREMIUM_WITHHELD } from '../src/features/billing/premiumFields.js';
import { requiredPlanForContent } from '../src/features/billing/access.js';

/**
 * Strip the paid half of Pro content out of the production bundle.
 *
 * The content files stay exactly as authored — the audit, the solution verifier
 * and the example runner all read them straight off disk in Node, so none of
 * that is affected. What changes is only what Vite emits: for items the access
 * catalog marks as Pro, the fields listed in `PREMIUM_FIELDS` are removed and
 * the body is flagged so the app knows to fetch them from the server.
 *
 * This runs on `build` alone. In development and in tests the full content is
 * loaded as before, which keeps the authoring loop and the existing suite
 * working; the security boundary is the production artifact plus the Edge
 * Function that serves the payload, and both are tested directly.
 *
 * Content modules are pure data — verified: no field anywhere holds a function —
 * so re-emitting them as JSON is lossless.
 */

const CONTENT_DIR = path.join('src', 'content');

/** Which content kind a file under src/content belongs to. */
function kindForFile(id) {
  const rel = id.replace(/\\/g, '/');
  if (rel.includes('/src/content/challenges/')) return 'challenge';
  if (rel.includes('/src/content/projects/')) return 'project';
  if (rel.includes('/src/content/interview/')) return 'interview';
  if (rel.includes('/src/content/exercises/')) return 'exercise';
  // Lessons carry their exercises inline, so they need walking too.
  if (rel.includes('/src/content/curriculum/')) return 'lesson';
  return null;
}

function stripItem(kind, item) {
  const fields = PREMIUM_FIELDS[kind];
  if (!fields || !item?.id) return { item, stripped: 0 };
  if (requiredPlanForContent(kind, item.id) !== 'pro') return { item, stripped: 0 };

  const out = {};
  let stripped = 0;
  for (const [key, value] of Object.entries(item)) {
    if (fields.includes(key) && value !== undefined) {
      stripped += 1;
      continue;
    }
    out[key] = value;
  }
  if (stripped > 0) out[PREMIUM_WITHHELD] = true;
  return { item: out, stripped };
}

export function premiumContentPlugin({ report } = {}) {
  const counts = { challenge: 0, exercise: 0, interview: 0, project: 0 };
  let removedFields = 0;

  return {
    name: 'jspath-strip-premium',
    apply: 'build',
    enforce: 'pre',

    async transform(_code, id) {
      const normalised = id.split('?')[0];
      if (!normalised.includes(`/${CONTENT_DIR.replace(/\\/g, '/')}/`) &&
          !normalised.replace(/\\/g, '/').includes('/src/content/')) return null;
      if (!normalised.endsWith('.js')) return null;

      const kind = kindForFile(normalised);
      if (!kind) return null;

      // Load the authored module and rebuild it as data with the paid fields gone.
      const mod = await import(pathToFileURL(normalised).href + `?premium=${Date.now()}`);
      const items = [].concat(mod.default ?? mod.lessons ?? mod.questions ?? mod.cheatSheets ?? []);
      if (items.length === 0 || typeof items[0] !== 'object') return null;

      let touched = false;
      const rebuilt = items.map((item) => {
        if (kind === 'lesson') {
          // A lesson is free, but the exercises inside it may not be.
          const exercises = item.exercises ?? [];
          if (exercises.length === 0) return item;
          let lessonTouched = false;
          const next = exercises.map((ex) => {
            const { item: stripped, stripped: n } = stripItem('exercise', ex);
            if (n > 0) { lessonTouched = true; touched = true; counts.exercise += 1; removedFields += n; }
            return stripped;
          });
          return lessonTouched ? { ...item, exercises: next } : item;
        }
        const { item: stripped, stripped: n } = stripItem(kind, item);
        if (n > 0) { touched = true; counts[kind] += 1; removedFields += n; }
        return stripped;
      });

      if (!touched) return null;
      return { code: `export default ${JSON.stringify(rebuilt)};\n`, map: null };
    },

    closeBundle() {
      const total = Object.values(counts).reduce((n, v) => n + v, 0);
      const line =
        `  premium: withheld ${removedFields} paid fields from ${total} Pro items ` +
        `(${counts.challenge} challenges, ${counts.exercise} exercises, ` +
        `${counts.interview} interview questions, ${counts.project} projects)`;
      if (report) report({ counts, removedFields, total });
      // eslint-disable-next-line no-console
      console.log(line);
    },
  };
}
