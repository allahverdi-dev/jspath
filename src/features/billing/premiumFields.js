/**
 * Which fields of a paid item are the paid payload.
 *
 * Static bundles cannot keep a secret: anything shipped to the browser can be
 * read out of the compiled JavaScript. So the answer half of every Pro item is
 * removed from the production bundle and served from an authenticated Edge
 * Function instead, while the discovery half stays public.
 *
 * The split is drawn so that a Free visitor can still understand what Pro
 * contains — title, difficulty, topic, and the statement of the task — but
 * receives none of the work they would be paying for.
 *
 * This module is the single definition, shared by the build-time stripper, the
 * Edge Function that serves the payload, and the tests that police both.
 */

export const PREMIUM_FIELDS = Object.freeze({
  // The statement (`prompt`) stays public so catalog cards and search keep
  // working; the solution, its explanation, the graded tests and the laddered
  // hints do not.
  challenge: Object.freeze(['solution', 'solutionExplanation', 'tests', 'hints', 'starterCode']),

  // `instructions` stays public for the practice catalog. `correct` is an answer
  // key for the multiple-choice kinds and must travel with the rest.
  exercise: Object.freeze(['solution', 'solutionExplanation', 'tests', 'hints', 'starterCode', 'correct']),

  // The question stays public; every form of the answer is paid.
  interview: Object.freeze([
    'shortAnswer', 'deepAnswer', 'keyPoints', 'commonMistakes', 'followUps', 'correct',
  ]),

  // Tagline and objectives stay public so the project is browseable; the
  // build guidance a learner is paying for does not.
  project: Object.freeze([
    'requirements', 'requirementsNote', 'milestones', 'hints', 'testingChecklist',
    'completionCriteria', 'stretchGoals', 'reflectionQuestions',
  ]),
});

export const PREMIUM_KINDS = Object.freeze(Object.keys(PREMIUM_FIELDS));

/** Marks a body whose paid fields were removed at build time. */
export const PREMIUM_WITHHELD = '__premiumWithheld';

/**
 * Split one item into the part that may ship and the part that may not.
 * Returns `null` for `protectedPart` when the item carries no paid fields.
 */
export function splitPremium(kind, item) {
  const fields = PREMIUM_FIELDS[kind];
  if (!fields) return { publicPart: item, protectedPart: null };

  const publicPart = {};
  const protectedPart = {};
  let withheld = false;

  for (const [key, value] of Object.entries(item)) {
    if (fields.includes(key) && value !== undefined) {
      protectedPart[key] = value;
      withheld = true;
    } else {
      publicPart[key] = value;
    }
  }

  if (!withheld) return { publicPart: item, protectedPart: null };
  publicPart[PREMIUM_WITHHELD] = true;
  return { publicPart, protectedPart };
}

/** Has this body had its paid fields removed? */
export function isPremiumWithheld(item) {
  return Boolean(item?.[PREMIUM_WITHHELD]);
}
