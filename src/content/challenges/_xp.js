/**
 * Challenge XP — one rule, applied everywhere.
 *
 * Challenges are unguided: the learner decides which concepts apply, which data
 * structure fits, and how to handle the edges. They are therefore worth more
 * than the curriculum exercise that follows a lesson explaining exactly that.
 *
 * The scale is deliberately coarse. XP tracks *reasoning difficulty*, never how
 * long a solution happens to be, so two Medium challenges award the same amount
 * whether one is four lines and the other twenty.
 *
 * Do not hand-write an `xp` number on a challenge. Import `XP` and index it by
 * the challenge's own difficulty, so the two can never drift apart.
 */
import { DIFFICULTY } from '../schema/types.js';

export const XP = Object.freeze({
  [DIFFICULTY.BEGINNER]: 15,
  [DIFFICULTY.EASY]: 25,
  [DIFFICULTY.MEDIUM]: 40,
  [DIFFICULTY.HARD]: 60,
  [DIFFICULTY.EXPERT]: 90,
});
