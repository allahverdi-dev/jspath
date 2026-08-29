# The learning model

## Mastery is evidence-based

Marking lessons complete can never reach **Mastered**. That is the entire point of
having a mastery model rather than a completion checkbox.

Topic score is a weighted blend. When a source has no content for a topic, its weight
is redistributed across the sources that do:

| Source | Weight |
| --- | --- |
| Lesson coverage | 30% |
| Exercises solved | 30% |
| Quiz accuracy | 25% |
| Challenges solved | 15% |

Then two adjustments:

- **Attempt quality.** A solve on the first try scores 1.0; two attempts 0.9; three
  0.8; four or five 0.7; six or more 0.6. Never below 0.6 — struggling and then
  succeeding is still genuine learning.
- **Recency decay.** After 21 idle days the score tapers toward a floor of 75%.
  Knowledge you have not touched in months is not knowledge you can rely on in an
  interview.

Implementation: `src/features/mastery/masteryEngine.js`. The function returns the
component scores and the underlying evidence alongside the final number, and the
**My Learning** page shows all of it — a learner can always see why they sit where
they do.

## States

| State | Requirement |
| --- | --- |
| Not Started | No lessons completed, no score |
| Learning | Any activity |
| Practicing | Score >= 0.55 **and** >= 2 assessments |
| Mastered | Score >= 0.85 **and** >= 4 assessments **and** quiz accuracy >= 0.8 |

An "assessment" is a solved exercise, a solved challenge, or three answered quiz
questions. The quiz-accuracy gate only applies once there is quiz data.

## XP

XP measures effort; mastery measures knowledge. They are deliberately different
numbers, and the UI never conflates them.

Every award is keyed by `(kind, refId)` and granted at most once, so re-opening a
finished lesson or re-solving a solved exercise adds nothing. This is what makes XP
farming by clicking impossible.

| Event | XP |
| --- | --- |
| Lesson complete | the lesson's own value (20 default) |
| First exercise solve | the exercise's value (15 default) |
| Solved on the first attempt | +5 bonus |
| Quiz passed (>= 70%) | 20 |
| Perfect quiz | +10 bonus |
| Challenge solved | the challenge's value (40 default) |
| Project milestone | 25 |
| Project complete | 100 |
| Interview question worked through | 5 |
| Achievement unlocked | 25 |

## Streaks

A day counts once regardless of volume, so the streak measures consistency rather than
grinding. Day keys are local to the learner's clock, so "today" matches what their
device says. A gap of exactly one day continues the streak; anything larger resets it
to 1. A clock moving backwards cannot reduce it.

A streak is only *reported* as current if there was activity today or yesterday —
stored state is never rewritten on read.

## Achievements

Every achievement is a pure predicate over user state plus content metadata, so
unlocking is always derivable; there is no separate flag that can drift from reality.
Locked cards show real progress (`3 / 10`), not a mystery box.

## The learning loop

Understand → See → Predict → Code → Test → Debug → Explain → Apply → Review → Master.

This shows up concretely rather than as a slogan:

- `PREDICT` sections force a commitment before the answer is revealed.
- Exercises require code that passes real assertions in a sandbox.
- Quizzes diagnose with per-option rationales, so wrong answers teach.
- Wrong answers land in the mistake queue and resurface in the Practice Hub.
- Mastery decays if a topic is abandoned, so review is genuinely necessary.

## Feedback, never just "Wrong"

The exercise engine reveals in stages: per-assertion results first, then a conceptual
hint, then a stronger hint, then the worked solution — and only when the learner
deliberately asks for it. Projects follow the same shape: brief, requirements,
milestones, hints on request, and never a finished solution handed over up front.

## Recommendations

Deterministic rules over the learner's own data, never a simulated AI tutor. Every
recommendation carries the reason it was made, and closing a gap is ranked above
moving forward:

1. An unsolved exercise on the weakest *started* topic.
2. A lesson on that topic if no exercise is left.
3. Anything recently failed and still unsolved.
4. The lesson last opened but unfinished, else the next in curriculum order.
5. An unsolved challenge, to break up reading.

Untouched topics are excluded from "weak" — you cannot be weak at something you have
not started; that is simply the next thing to learn, which is a different list.

## What is deliberately not claimed

- Open conceptual interview answers are **self-assessed** against an explicit
  key-points checklist. There is no AI grader, and pretending otherwise would give
  learners false confidence.
- The placement check is ten sampled questions. It recommends a starting module and
  says plainly that it is a sample, not a verdict.
- Nothing is ever locked. Module order is a recommended path, not a gate.
