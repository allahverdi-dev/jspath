import foundations from './foundations.js';
import coreLanguage from './core-language.js';
import browserDom from './browser-dom.js';
import async from './async.js';
import advancedLanguage from './advanced-language.js';
import engineering from './engineering.js';
import { QUIZ_KIND } from '../schema/types.js';

/**
 * The placement question bank.
 *
 * **Authoring convention:** inside the domain files the correct option is always
 * written first. That keeps the source readable and reviewable — you can check an
 * answer key by reading one line — but it would obviously make the assessment
 * gameable if it shipped that way.
 *
 * So the exported bank rotates each question's options by an amount derived from
 * its own id. The rotation is a pure function of the id, which means it is stable
 * across reloads, identical in tests and in the browser, and changes only if a
 * question is renamed. It is not shuffling: nothing here is random, and two runs
 * of the assessment always present the same order.
 */

/** A tiny deterministic string hash. Stable across engines; not cryptographic. */
function hashId(id) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return h;
}

/** Rotate `options` right by `shift`, moving the answer key with them. */
function rotate(question) {
  const n = question.options.length;
  const shift = hashId(question.id) % n;
  if (shift === 0) return { ...question };

  const options = question.options.map((_, i) => question.options[(i - shift + n * 2) % n]);
  const moved = (i) => (i + shift) % n;
  const correct =
    question.kind === QUIZ_KIND.MULTIPLE
      ? [...question.correct].map(moved).sort((a, b) => a - b)
      : moved(question.correct);

  const optionExplanations = question.optionExplanations
    ? question.optionExplanations.map((_, i) => question.optionExplanations[(i - shift + n * 2) % n])
    : undefined;

  return optionExplanations
    ? { ...question, options, correct, optionExplanations }
    : { ...question, options, correct };
}

const AUTHORED = [
  ...foundations,
  ...coreLanguage,
  ...browserDom,
  ...async,
  ...advancedLanguage,
  ...engineering,
];

/**
 * The assessment, in presentation order.
 *
 * Questions are ordered by ascending difficulty so the test opens accessibly and
 * becomes progressively more diagnostic, with domains interleaved inside each
 * difficulty band so a learner is never asked eight questions about one topic in
 * a row. The sort is stable and driven only by authored data.
 */
const DIFFICULTY_RANK = { beginner: 0, easy: 1, medium: 2, hard: 3, expert: 4 };

export const PLACEMENT_QUESTIONS = AUTHORED.map(rotate).sort(
  (a, b) => DIFFICULTY_RANK[a.difficulty] - DIFFICULTY_RANK[b.difficulty],
);

export default PLACEMENT_QUESTIONS;
