import {
  DIFFICULTY_ORDER, SECTION, QUIZ_KIND, EXERCISE_KIND, TRACK,
  INTERVIEW_KINDS, INTERVIEW_LEVELS,
  REFERENCE_CATEGORIES, REFERENCE_ENVS,
  SHEET_CATEGORIES, SHEET_GROUPS,
  PLACEMENT_DOMAINS, PLACEMENT_DOMAIN_TOPICS,
} from './types.js';

/* ------------------------------------------------------------------ *
 * Placeholder detection
 * ------------------------------------------------------------------ */

/**
 * Patterns that must never appear in shipped educational content.
 * Content that legitimately needs to name one of these words can opt out with
 * the `@allow-placeholder` marker.
 */
export const PLACEHOLDER_PATTERNS = [
  /\blorem ipsum\b/i,
  /\bcoming soon\b/i,
  /\bTODO\b/,
  /\bTBD\b/,
  // Filler uses of "placeholder" only. The bare word is a legitimate technical
  // term — the HTML `placeholder` attribute (taught in Module 20, where
  // placeholder-only labels are covered as an accessibility failure) and
  // "placeholder value" generally — so matching it alone produced false
  // positives on real prose. The `@allow-placeholder` escape hatch cannot be
  // used for prose because it is never stripped at render time and would be
  // shown to learners, so the pattern itself has to be the precise one.
  /\bplaceholder (lesson|module|exercise|quiz|section)\b/i,
  /\bthis is (just )?a placeholder\b/i,
  /\badd content later\b/i,
  /\bexample lesson\b/i,
  /\bsample content\b/i,
  /\blesson content goes here\b/i,
  /\bcontent can be expanded\b/i,
  /\bfill this in\b/i,
  /\bwrite this later\b/i,
  /\bFIXME\b/,
];

/** Escape hatch: content that intentionally names a placeholder pattern. */
export const PLACEHOLDER_ALLOW = /@allow-placeholder/;

export function findPlaceholders(text) {
  if (typeof text !== 'string' || PLACEHOLDER_ALLOW.test(text)) return [];
  return PLACEHOLDER_PATTERNS.filter((re) => re.test(text)).map((re) => re.source);
}

/** Walk any nested content value and collect placeholder hits with a path. */
export function scanForPlaceholders(value, path = '', out = []) {
  if (typeof value === 'string') {
    for (const hit of findPlaceholders(value)) out.push({ path, pattern: hit });
  } else if (Array.isArray(value)) {
    value.forEach((v, i) => scanForPlaceholders(v, path + '[' + i + ']', out));
  } else if (value && typeof value === 'object') {
    for (const [k, v] of Object.entries(value)) {
      scanForPlaceholders(v, path ? path + '.' + k : k, out);
    }
  }
  return out;
}

/* ------------------------------------------------------------------ *
 * Assertion helpers
 * ------------------------------------------------------------------ */

const isStr = (v) => typeof v === 'string' && v.trim().length > 0;
const isArr = (v, min = 1) => Array.isArray(v) && v.length >= min;

function req(errors, cond, message) {
  if (!cond) errors.push(message);
}

/* ------------------------------------------------------------------ *
 * Entity validators
 * ------------------------------------------------------------------ */

export function validateModule(mod) {
  const e = [];
  const at = 'module ' + (mod?.id ?? '<missing id>');
  req(e, isStr(mod?.id), at + ': missing id');
  req(e, isStr(mod?.slug), at + ': missing slug');
  req(e, isStr(mod?.title), at + ': missing title');
  req(e, isStr(mod?.description), at + ': missing description');
  req(e, Number.isInteger(mod?.order), at + ': order must be an integer');
  req(e, Object.values(TRACK).includes(mod?.track), at + ': invalid track "' + mod?.track + '"');
  req(e, DIFFICULTY_ORDER.includes(mod?.difficulty), at + ': invalid difficulty "' + mod?.difficulty + '"');
  req(e, isArr(mod?.lessonIds), at + ': must declare at least one lesson');
  req(e, isArr(mod?.objectives), at + ': must declare learning objectives');
  return e;
}

export function validateSection(section, at) {
  const e = [];
  if (!Object.values(SECTION).includes(section?.kind)) {
    e.push(at + ': unknown section kind "' + section?.kind + '"');
    return e;
  }
  switch (section.kind) {
    case SECTION.PROSE:
      req(e, isArr(section.body), at + ': prose section has empty body');
      break;
    case SECTION.HEADING:
      req(e, isStr(section.text), at + ': heading has no text');
      break;
    case SECTION.CODE:
      req(e, isStr(section.code), at + ': code section has no code');
      // A runnable example touching document/window must declare needsDom, or it
      // runs in the Web Worker host (which deliberately has no DOM) and fails for
      // the learner with "document is not defined" the moment they click Run.
      req(
        e,
        !(section.runnable && /\bdocument\b|\bwindow\b/.test(section.code ?? '') && !section.needsDom),
        at + ': runnable code uses document/window but does not set needsDom: true',
      );
      break;
    case SECTION.ANNOTATED_CODE:
      req(e, isStr(section.code), at + ': annotated code has no code');
      req(e, isArr(section.annotations), at + ': annotated code has no annotations');
      break;
    case SECTION.CALLOUT:
      req(e, isStr(section.title), at + ': callout has no title');
      req(e, isArr(section.body), at + ': callout has empty body');
      break;
    case SECTION.LIST:
      req(e, isArr(section.items), at + ': list has no items');
      break;
    case SECTION.TABLE:
      req(e, isArr(section.headers), at + ': table has no headers');
      req(e, isArr(section.rows), at + ': table has no rows');
      break;
    case SECTION.COMPARISON:
      req(e, isStr(section.left?.code) && isStr(section.right?.code), at + ': comparison needs left and right code');
      break;
    case SECTION.PREDICT:
      req(e, isStr(section.code), at + ': predict section has no code');
      req(e, isArr(section.options, 2), at + ': predict section needs >= 2 options');
      req(e, Number.isInteger(section.correct), at + ': predict section has no correct index');
      req(e, isStr(section.explanation), at + ': predict section has no explanation');
      break;
    case SECTION.STEPS:
      req(e, isArr(section.steps), at + ': steps section has no steps');
      break;
    case SECTION.TERMS:
      req(e, isArr(section.terms), at + ': terms section has no terms');
      break;
    case SECTION.DIAGRAM:
      req(e, isStr(section.diagram), at + ': diagram section has no diagram id');
      break;
    case SECTION.EXERCISE_REF:
      req(e, isStr(section.exerciseId), at + ': exerciseRef has no exerciseId');
      break;
    default:
      break;
  }
  return e;
}

/** A lesson must actually teach: real objectives, real sections, a summary. */
export function validateLesson(lesson) {
  const e = [];
  const at = 'lesson ' + (lesson?.id ?? '<missing id>');
  req(e, isStr(lesson?.id), at + ': missing id');
  req(e, isStr(lesson?.slug), at + ': missing slug');
  req(e, isStr(lesson?.moduleId), at + ': missing moduleId');
  req(e, isStr(lesson?.title), at + ': missing title');
  req(e, isStr(lesson?.description), at + ': missing description');
  req(e, Number.isInteger(lesson?.order), at + ': order must be an integer');
  req(e, DIFFICULTY_ORDER.includes(lesson?.difficulty), at + ': invalid difficulty');
  req(e, Number.isFinite(lesson?.estimatedMinutes) && lesson.estimatedMinutes > 0, at + ': invalid estimatedMinutes');
  req(e, Number.isFinite(lesson?.xp) && lesson.xp > 0, at + ': invalid xp');
  req(e, isArr(lesson?.learningObjectives), at + ': has no learning objectives');
  req(e, isArr(lesson?.sections), at + ': has no sections — a lesson must teach something');
  req(e, isArr(lesson?.keyTakeaways), at + ': has no key takeaways');
  req(e, isStr(lesson?.summary), at + ': has no summary');
  req(e, isArr(lesson?.topicIds), at + ': must declare topicIds for mastery tracking');

  // Substance check: a lesson needs real explanation, not just a code dump.
  const proseChars = (lesson?.sections ?? [])
    .filter((s) => s.kind === SECTION.PROSE || s.kind === SECTION.CALLOUT)
    .flatMap((s) => s.body ?? [])
    .join(' ').length;
  req(
    e,
    proseChars >= 400,
    at + ': only ' + proseChars + ' chars of explanatory prose (min 400) — this reads as a stub',
  );

  (lesson?.sections ?? []).forEach((s, i) => {
    e.push(...validateSection(s, at + ' section[' + i + ']'));
  });
  return e;
}

export function validateExercise(ex) {
  const e = [];
  const at = 'exercise ' + (ex?.id ?? '<missing id>');
  req(e, isStr(ex?.id), at + ': missing id');
  req(e, isStr(ex?.title), at + ': missing title');
  req(e, Object.values(EXERCISE_KIND).includes(ex?.kind), at + ': invalid kind "' + ex?.kind + '"');
  req(e, isStr(ex?.instructions), at + ': missing instructions');
  req(e, DIFFICULTY_ORDER.includes(ex?.difficulty), at + ': invalid difficulty');
  req(e, Number.isFinite(ex?.xp) && ex.xp > 0, at + ': invalid xp');
  req(e, isArr(ex?.topicIds), at + ': must declare topicIds');
  req(e, isStr(ex?.solution), at + ': missing reference solution');
  req(e, isStr(ex?.solutionExplanation), at + ': missing solution explanation');

  const choiceKinds = [
    EXERCISE_KIND.PREDICT_OUTPUT,
    EXERCISE_KIND.CONCEPTUAL,
    EXERCISE_KIND.CHOOSE_IMPLEMENTATION,
  ];
  if (choiceKinds.includes(ex?.kind)) {
    req(e, isArr(ex?.options, 2), at + ': choice exercise needs >= 2 options');
    req(e, Number.isInteger(ex?.correct), at + ': choice exercise needs a correct index');
    req(
      e,
      Number.isInteger(ex?.correct) && ex.correct >= 0 && ex.correct < (ex?.options?.length ?? 0),
      at + ': correct index out of range',
    );
  } else {
    req(e, isStr(ex?.starterCode), at + ': code exercise needs starter code');
    req(e, isArr(ex?.tests), at + ': code exercise has no tests — it cannot be validated');
    (ex?.tests ?? []).forEach((t, i) => {
      req(e, isStr(t?.name), at + ' test[' + i + ']: missing name');
      req(e, isStr(t?.body), at + ' test[' + i + ']: missing assertion body');
    });
  }
  req(e, isArr(ex?.hints), at + ': needs at least one hint');
  return e;
}

export function validateQuizQuestion(q, at) {
  const e = [];
  req(e, isStr(q?.id), at + ': missing id');
  req(e, Object.values(QUIZ_KIND).includes(q?.kind), at + ': invalid kind "' + q?.kind + '"');
  req(e, isStr(q?.prompt), at + ': missing prompt');
  req(e, isArr(q?.options, 2), at + ': needs >= 2 options');
  req(e, isStr(q?.explanation), at + ': every quiz answer requires an explanation');
  req(e, isArr(q?.topicIds), at + ': must declare topicIds');

  if (q?.kind === QUIZ_KIND.MULTIPLE) {
    req(e, isArr(q?.correct), at + ': multi-select needs a correct array');
    const bad = (q?.correct ?? []).some(
      (i) => !Number.isInteger(i) || i < 0 || i >= (q?.options?.length ?? 0),
    );
    req(e, !bad, at + ': correct index out of range');
  } else {
    req(e, Number.isInteger(q?.correct), at + ': missing correct answer index');
    req(
      e,
      Number.isInteger(q?.correct) && q.correct >= 0 && q.correct < (q?.options?.length ?? 0),
      at + ': correct index ' + q?.correct + ' out of range',
    );
  }
  // Distractor rationales make wrong answers teach rather than just fail.
  if (q?.optionExplanations) {
    req(
      e,
      q.optionExplanations.length === q.options.length,
      at + ': optionExplanations length must match options length',
    );
  }
  return e;
}

export function validateQuiz(quiz) {
  const e = [];
  const at = 'quiz ' + (quiz?.id ?? '<missing id>');
  req(e, isStr(quiz?.id), at + ': missing id');
  req(e, isArr(quiz?.questions), at + ': has no questions');
  (quiz?.questions ?? []).forEach((q, i) => {
    e.push(...validateQuizQuestion(q, at + ' q[' + i + '] (' + (q?.id ?? '?') + ')'));
  });
  return e;
}

export function validateChallenge(ch) {
  const e = [];
  const at = 'challenge ' + (ch?.id ?? '<missing id>');
  req(e, isStr(ch?.id), at + ': missing id');
  req(e, isStr(ch?.slug), at + ': missing slug');
  req(e, isStr(ch?.title), at + ': missing title');
  req(e, isStr(ch?.prompt), at + ': missing prompt');
  req(e, DIFFICULTY_ORDER.includes(ch?.difficulty), at + ': invalid difficulty');
  req(e, isStr(ch?.category), at + ': missing category');
  req(e, isArr(ch?.topicIds), at + ': must declare topicIds');
  req(e, isStr(ch?.starterCode), at + ': missing starter code');
  req(e, isArr(ch?.tests), at + ': has no tests — it cannot be validated');
  req(e, isStr(ch?.solution), at + ': missing reference solution');
  req(e, isStr(ch?.solutionExplanation), at + ': missing solution explanation');
  req(e, Number.isFinite(ch?.xp) && ch.xp > 0, at + ': invalid xp');
  req(e, isArr(ch?.hints), at + ': needs at least one hint');
  return e;
}

export function validateProject(p) {
  const e = [];
  const at = 'project ' + (p?.id ?? '<missing id>');
  req(e, isStr(p?.id), at + ': missing id');
  req(e, isStr(p?.slug), at + ': missing slug');
  req(e, isStr(p?.title), at + ': missing title');
  req(e, isStr(p?.brief), at + ': missing brief');
  req(e, DIFFICULTY_ORDER.includes(p?.difficulty), at + ': invalid difficulty');
  req(e, isArr(p?.objectives), at + ': missing learning objectives');
  req(e, isArr(p?.requirements), at + ': missing required features');
  req(e, isArr(p?.milestones), at + ': missing milestones');
  req(e, isArr(p?.completionCriteria), at + ': missing completion criteria');
  req(e, isArr(p?.hints), at + ': missing hints');
  req(e, isArr(p?.stretchGoals), at + ': missing stretch goals');
  req(e, isArr(p?.topicIds), at + ': must declare topicIds');
  (p?.milestones ?? []).forEach((m, i) => {
    req(e, isStr(m?.id), at + ' milestone[' + i + ']: missing id');
    req(e, isStr(m?.title), at + ' milestone[' + i + ']: missing title');
    req(e, isArr(m?.tasks), at + ' milestone[' + i + ']: has no tasks');
  });
  // Optional richer fields: validated for shape only when present, so they
  // stay backward compatible with any project that omits them.
  if (p?.prerequisites !== undefined) req(e, isArr(p.prerequisites, 0), at + ': prerequisites must be an array');
  if (p?.relatedLessons !== undefined) req(e, isArr(p.relatedLessons, 0), at + ': relatedLessons must be an array');
  if (p?.relatedChallenges !== undefined) req(e, isArr(p.relatedChallenges, 0), at + ': relatedChallenges must be an array');
  if (p?.testingChecklist !== undefined) req(e, isArr(p.testingChecklist, 0), at + ': testingChecklist must be an array');
  if (p?.reflectionQuestions !== undefined) req(e, isArr(p.reflectionQuestions, 0), at + ': reflectionQuestions must be an array');
  if (p?.solutionNotes !== undefined) req(e, isStr(p.solutionNotes), at + ': solutionNotes must be non-empty when present');
  if (p?.starterFiles !== undefined) {
    req(e, isArr(p.starterFiles, 0), at + ': starterFiles must be an array');
    (p.starterFiles ?? []).forEach((f, i) => {
      req(e, isStr(f?.filename), at + ' starterFiles[' + i + ']: missing filename');
      req(e, isStr(f?.code), at + ' starterFiles[' + i + ']: missing code');
    });
  }
  return e;
}

export function validateInterviewQuestion(q) {
  const e = [];
  const at = 'interview ' + (q?.id ?? '<missing id>');
  req(e, isStr(q?.id), at + ': missing id');
  req(e, isStr(q?.question), at + ': missing question');
  req(e, isStr(q?.topic), at + ': missing topic');
  req(e, isStr(q?.level), at + ': missing level');
  req(e, isStr(q?.shortAnswer), at + ': missing 30-second answer');
  req(e, isArr(q?.deepAnswer), at + ': missing deep answer');
  req(e, isArr(q?.keyPoints), at + ': missing key points checklist');
  req(e, isArr(q?.topicIds), at + ': must declare topicIds');

  // `level` and `kind` are constrained to the enums the UI already filters on,
  // so a typo becomes an audit error rather than a question that silently
  // disappears from every filter tab.
  req(e, INTERVIEW_LEVELS.includes(q?.level), at + `: invalid level "${q?.level}" (expected one of ${INTERVIEW_LEVELS.join(', ')})`);
  if (q?.kind !== undefined) {
    req(e, INTERVIEW_KINDS.includes(q.kind), at + `: invalid kind "${q.kind}"`);
  }

  if (q?.kind === 'output' || q?.kind === 'choice') {
    req(e, isArr(q?.options, 2), at + ': objective question needs options');
    req(e, Number.isInteger(q?.correct), at + ': objective question needs a correct index');
    req(
      e,
      Number.isInteger(q?.correct) && q.correct >= 0 && q.correct < (q?.options?.length ?? 0),
      at + ': correct index out of range',
    );
  }

  // An output-prediction question is only honest if the code is actually shown
  // and its real output is machine-checkable — `verify-examples.mjs` executes
  // every one of these and asserts the correct option is what the code prints.
  if (q?.kind === 'output') {
    req(e, isStr(q?.code), at + ': an output-prediction question must include the code being predicted');
  }

  // Optional richer fields — shape-checked only when present, so anything that
  // omits them stays valid.
  if (q?.relatedLessons !== undefined) req(e, isArr(q.relatedLessons, 0), at + ': relatedLessons must be an array');
  if (q?.relatedChallenges !== undefined) req(e, isArr(q.relatedChallenges, 0), at + ': relatedChallenges must be an array');
  if (q?.commonMistakes !== undefined) req(e, isArr(q.commonMistakes, 0), at + ': commonMistakes must be an array');
  if (q?.followUps !== undefined) req(e, isArr(q.followUps, 0), at + ': followUps must be an array');
  if (q?.code !== undefined) req(e, isStr(q.code), at + ': code must be a non-empty string when present');
  if (q?.example !== undefined) req(e, isStr(q.example), at + ': example must be a non-empty string when present');
  return e;
}

export function validateReference(r) {
  const e = [];
  const at = 'reference ' + (r?.id ?? '<missing id>');
  req(e, isStr(r?.id), at + ': missing id');
  req(e, isStr(r?.slug), at + ': missing slug');
  req(e, isStr(r?.name), at + ': missing name');
  req(e, isStr(r?.category), at + ': missing category');
  req(e, isStr(r?.syntax), at + ': missing syntax');
  req(e, isStr(r?.summary), at + ': missing summary');
  req(e, Array.isArray(r?.parameters), at + ': parameters must be an array (use [] for none)');
  req(e, isStr(r?.returns), at + ': missing return value description');
  req(e, typeof r?.mutates === 'boolean', at + ': must state whether it mutates');
  req(e, isArr(r?.examples), at + ': missing examples');

  // The category and environment are constrained to the enums the Reference UI
  // filters on, so a typo becomes an audit error rather than an entry that
  // silently vanishes from every filter tab.
  req(e, REFERENCE_CATEGORIES.includes(r?.category), at + `: invalid category "${r?.category}"`);
  req(
    e,
    REFERENCE_ENVS.includes(r?.environment),
    at + `: must declare environment (one of ${REFERENCE_ENVS.join(', ')}) — an API reference that`
      + ' blurs ECMAScript, DOM and Web API boundaries misleads the reader',
  );
  req(e, isArr(r?.topicIds), at + ': must declare topicIds');

  // Every parameter needs a name and a description; "options" with no explanation
  // of what goes in it is the shape reference material fails at most often.
  (r?.parameters ?? []).forEach((p, i) => {
    req(e, isStr(p?.name), at + ` parameters[${i}]: missing name`);
    req(e, isStr(p?.description), at + ` parameters[${i}]: missing description`);
  });

  (r?.examples ?? []).forEach((ex, i) => {
    req(e, isStr(ex?.code), at + ` examples[${i}]: missing code`);
  });

  // Optional richer fields — shape-checked only when present, so a minimal entry
  // stays valid.
  if (r?.aliases !== undefined) req(e, isArr(r.aliases, 0), at + ': aliases must be an array');
  if (r?.description !== undefined) req(e, isArr(r.description, 0), at + ': description must be an array of paragraphs');
  if (r?.caveats !== undefined) req(e, isArr(r.caveats, 0), at + ': caveats must be an array');
  if (r?.commonMistakes !== undefined) req(e, isArr(r.commonMistakes, 0), at + ': commonMistakes must be an array');
  if (r?.relatedEntries !== undefined) req(e, isArr(r.relatedEntries, 0), at + ': relatedEntries must be an array');
  if (r?.practiceIds !== undefined) req(e, isArr(r.practiceIds, 0), at + ': practiceIds must be an array');
  if (r?.throws !== undefined) req(e, isStr(r.throws), at + ': throws must be a non-empty string when present');
  return e;
}

export function validateCheatSheet(cs) {
  const e = [];
  const at = 'cheat sheet ' + (cs?.id ?? '<missing id>');
  req(e, isStr(cs?.id), at + ': missing id');
  req(e, isStr(cs?.slug), at + ': missing slug');
  req(e, isStr(cs?.title), at + ': missing title');
  req(e, isStr(cs?.description), at + ': missing description');
  req(e, isArr(cs?.groups), at + ': has no groups');

  req(e, SHEET_CATEGORIES.includes(cs?.category), at + `: invalid category "${cs?.category}"`);
  req(e, isArr(cs?.topicIds), at + ': must declare topicIds');

  (cs?.groups ?? []).forEach((g, i) => {
    const gat = at + ' group[' + i + ']';
    req(e, isStr(g?.title), gat + ': missing title');

    const kind = g?.kind ?? 'snippets';
    req(e, SHEET_GROUPS.includes(kind), gat + `: invalid group kind "${kind}"`);

    if (kind === 'table') {
      // A comparison matrix is only useful if every row lines up with the
      // header, so a ragged row is an error rather than a rendering surprise.
      req(e, isArr(g?.columns, 2), gat + ': a table group needs at least two columns');
      req(e, isArr(g?.rows), gat + ': a table group needs rows');
      (g?.rows ?? []).forEach((row, j) => {
        req(
          e,
          Array.isArray(row) && row.length === (g?.columns?.length ?? -1),
          gat + ` row[${j}]: has ${row?.length} cells but the table has ${g?.columns?.length} columns`,
        );
      });
    } else if (kind === 'rules') {
      req(e, isArr(g?.items), gat + ': a rules group needs items');
      (g?.items ?? []).forEach((item, j) => {
        req(e, isStr(item), gat + ` items[${j}]: must be a non-empty string`);
      });
    } else {
      req(e, isArr(g?.entries), gat + ': has no entries');
      (g?.entries ?? []).forEach((entry, j) => {
        // An empty code box is the shape a half-finished sheet takes.
        req(e, isStr(entry?.code), gat + ` entries[${j}]: missing code`);
      });
    }
  });

  // Optional richer fields — shape-checked only when present.
  if (cs?.aliases !== undefined) req(e, isArr(cs.aliases, 0), at + ': aliases must be an array');
  if (cs?.relatedLessons !== undefined) req(e, isArr(cs.relatedLessons, 0), at + ': relatedLessons must be an array');
  if (cs?.relatedReference !== undefined) req(e, isArr(cs.relatedReference, 0), at + ': relatedReference must be an array');
  if (cs?.relatedChallenges !== undefined) req(e, isArr(cs.relatedChallenges, 0), at + ': relatedChallenges must be an array');
  return e;
}

/**
 * A placement assessment question.
 *
 * Placement reuses the quiz question shape wholesale — the objective kinds it
 * needs already exist — and adds only the two fields placement scoring depends
 * on: the domain it belongs to, and its difficulty. Everything else is checked
 * by `validateQuizQuestion`, so there is one definition of a valid question.
 */
export function validatePlacementQuestion(q) {
  const at = 'placement question ' + (q?.id ?? '<missing id>');
  const e = validateQuizQuestion(q, at);

  req(e, PLACEMENT_DOMAINS.includes(q?.domain), at + ': invalid domain "' + q?.domain + '"');
  req(e, DIFFICULTY_ORDER.includes(q?.difficulty), at + ': invalid difficulty "' + q?.difficulty + '"');

  // A question must be scored in a domain that actually owns its topics,
  // otherwise the domain breakdown reports something the question never tested.
  const owned = new Set(PLACEMENT_DOMAIN_TOPICS[q?.domain] ?? []);
  for (const topic of q?.topicIds ?? []) {
    req(e, owned.has(topic), at + ': topic "' + topic + '" is not owned by domain "' + q?.domain + '"');
  }

  if (q?.code !== undefined) {
    req(e, isStr(q.code) && q.code.trim().length > 0, at + ': code block is present but empty');
  }
  return e;
}

export const VALIDATORS = {
  module: validateModule,
  lesson: validateLesson,
  exercise: validateExercise,
  quiz: validateQuiz,
  challenge: validateChallenge,
  project: validateProject,
  interview: validateInterviewQuestion,
  reference: validateReference,
  cheatsheet: validateCheatSheet,
  placement: validatePlacementQuestion,
};
