import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import en from './locales/en.js';
import az from './locales/az.js';
import ru from './locales/ru.js';
import {
  DIFFICULTY_ORDER, TRACK, MASTERY, EXERCISE_KIND, INTERVIEW_KIND,
  INTERVIEW_LEVEL_KEY, PLACEMENT_DOMAIN_KEY, PLACEMENT_LEVEL_KEY,
} from '../content/schema/types.js';
import { ACHIEVEMENTS } from '../features/achievements/achievements.js';

/**
 * Every key the source asks for must exist in every locale.
 *
 * `i18n.test.js` proves the three dictionaries agree with *each other*; this
 * proves they agree with the *code*. Without it, a component can call
 * `t('learning.somethingNew')`, the three files stay perfectly in sync because
 * none of them has the key, and the learner sees a humanised fallback.
 *
 * Literal calls are read out of the source. The derived families — enum tokens,
 * achievement ids, onboarding ids — are expanded from the same constants the app
 * uses, so this fails if either side drifts.
 */

const ROOT = path.resolve(__dirname, '..');

function sourceFiles() {
  const out = [];
  (function walk(dir) {
    for (const entry of fs.readdirSync(dir)) {
      const full = path.join(dir, entry);
      if (fs.statSync(full).isDirectory()) {
        // The dictionaries themselves are the answer, not a question.
        if (entry !== 'i18n') walk(full);
      } else if (/\.jsx?$/.test(entry) && !/\.test\./.test(entry)) {
        out.push(full);
      }
    }
  })(ROOT);
  return out;
}

function requiredKeys() {
  const keys = new Set();

  for (const file of sourceFiles()) {
    const src = fs.readFileSync(file, 'utf8');
    for (const m of src.matchAll(/\bt\(\s*'([A-Za-z0-9_.+-]+)'/g)) keys.add(m[1]);
    for (const m of src.matchAll(/(?:titleKey|labelKey|messageKey|reasonKey|metaKey|backLabelKey)\s*[:=]\s*["']([A-Za-z0-9_.+-]+)["']/g)) keys.add(m[1]);
    for (const m of src.matchAll(/key:\s*'([a-z][A-Za-z0-9]*\.[A-Za-z0-9_.]+)'/g)) keys.add(m[1]);
  }

  // Keys built by concatenation, expanded from the app's own constants.
  for (const v of DIFFICULTY_ORDER) keys.add(`difficulty.${v}`);
  for (const v of Object.values(TRACK)) keys.add(`track.${v}`);
  for (const v of Object.values(MASTERY)) keys.add(`mastery.${v}`);
  for (const v of Object.values(EXERCISE_KIND)) keys.add(`exerciseKind.${v}`);
  for (const v of Object.values(INTERVIEW_KIND)) keys.add(`interviewKind.${v}`);
  for (const v of Object.values(INTERVIEW_LEVEL_KEY)) keys.add(v);
  for (const v of Object.values(PLACEMENT_DOMAIN_KEY)) keys.add(v);
  for (const v of Object.values(PLACEMENT_LEVEL_KEY)) keys.add(v);
  for (const a of ACHIEVEMENTS) {
    keys.add(`achievements.items.${a.id}.title`);
    keys.add(`achievements.items.${a.id}.description`);
    keys.add(`achievements.tier.${a.tier}`);
  }
  for (const id of ['curriculum', 'practice', 'mastery', 'interview', 'runs', 'free']) {
    keys.add(`landing.feature.${id}.title`);
    keys.add(`landing.feature.${id}.body`);
  }
  for (const id of ['zero', 'basics', 'intermediate', 'experienced']) {
    for (const part of ['title', 'description', 'start']) keys.add(`onboarding.level.${id}.${part}`);
  }
  for (const id of ['job', 'interview', 'framework', 'fundamentals', 'projects', 'curiosity']) {
    keys.add(`onboarding.goal.${id}`);
  }
  for (const type of ['lesson.complete', 'exercise.solve', 'quiz.attempt', 'challenge.solve', 'project.milestone', 'project.complete']) {
    keys.add(`activity.${type}`);
  }
  for (const mode of ['system', 'light', 'dark']) keys.add(`settings.${mode}`);
  for (const kind of ['Challenge', 'Project', 'Interview', 'Exercise', 'Lesson', 'Module', 'Reference', 'Cheatsheet', 'Content']) {
    keys.add(`billing.kind${kind}`);
  }
  for (const status of ['Active', 'Canceling', 'Canceled', 'Expired', 'Refunded', 'Revoked', 'PastDue']) {
    keys.add(`billing.status${status}`);
  }
  for (const interval of ['monthly', 'annual']) keys.add(`billing.interval.${interval}`);
  for (const kind of ['module', 'lesson', 'exercise', 'challenge', 'project', 'reference', 'cheatsheet', 'interview']) {
    keys.add(`contentKind.${kind}`);
  }

  // A concatenation's literal prefix ("achievements.items.") is scraped as a
  // partial key; the real ones were expanded above.
  for (const key of [...keys]) if (key.endsWith('.')) keys.delete(key);

  return [...keys].sort();
}

const resolve = (dict, key) =>
  key.split('.').reduce((node, part) => (node == null ? undefined : node[part]), dict);

const usable = (value) =>
  (typeof value === 'string' && value.length > 0)
  || (value != null && typeof value === 'object' && typeof value.other === 'string');

describe('every key the code uses exists in every locale', () => {
  const keys = requiredKeys();

  it('finds the keys to check', () => {
    // A regex that silently stops matching would make the rest of this file pass
    // for the wrong reason.
    expect(keys.length).toBeGreaterThan(800);
    expect(keys).toContain('nav.dashboard');
    expect(keys).toContain('achievements.items.first-line.title');
    expect(keys).toContain('activity.lesson.complete');
  });

  it.each([['en', en], ['az', az], ['ru', ru]])('%s resolves all of them', (_name, dict) => {
    const missing = keys.filter((key) => !usable(resolve(dict, key)));
    expect(missing).toEqual([]);
  });
});
