import { useState } from 'react';
import { HighlightedCode } from '../../components/code/CodeBlock.jsx';
import { Card, Button, Icon, Badge, SectionLabel, cx } from '../../components/ui/index.jsx';
import { InlineMarkup } from '../../components/learning/InlineMarkup.jsx';
import { Authored } from '../../components/learning/Authored.jsx';
import { useUserState } from '../../state/UserStateProvider.jsx';
import { useT } from '../../i18n/index.jsx';
import { INTERVIEW_LEVEL_KEY, INTERVIEW_KIND_KEY } from '../../content/schema/types.js';

/**
 * One interview question, with a deliberate reveal flow.
 *
 * Objective questions (code output, multiple choice) are scored automatically.
 * Open conceptual questions are self-assessed against an explicit key-points
 * checklist — the product does not pretend to grade free text it cannot grade.
 */
export function InterviewAnswer({ question, onAnswered, bookmarkable = false }) {
  const { state, actions } = useUserState();
  const t = useT();
  const [revealed, setRevealed] = useState(false);
  const [choice, setChoice] = useState(null);
  const [checkedPoints, setCheckedPoints] = useState([]);
  const [rated, setRated] = useState(false);

  const objective = question.kind === 'output' || question.kind === 'choice';
  const correct = objective && choice === question.correct;
  const bookmarked = Boolean(state.bookmarks[`interview:${question.id}`]);

  const reveal = () => {
    setRevealed(true);
    if (objective) {
      actions.recordInterview(question, { correct: choice === question.correct });
      onAnswered?.({ correct: choice === question.correct });
    }
  };

  const selfRate = (rating) => {
    setRated(true);
    actions.recordInterview(question, { correct: rating >= 3, selfRating: rating });
    onAnswered?.({ correct: rating >= 3, selfRating: rating });
  };

  const togglePoint = (i) =>
    setCheckedPoints((p) => (p.includes(i) ? p.filter((x) => x !== i) : [...p, i]));

  return (
    <Card className="p-6">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <Badge tone="neutral"><Authored>{question.topic}</Authored></Badge>
          <Badge tone="info">{INTERVIEW_LEVEL_KEY[question.level] ? t(INTERVIEW_LEVEL_KEY[question.level]) : question.level}</Badge>
          {question.kind && question.kind !== 'concept' && (
            <Badge tone="warning">{INTERVIEW_KIND_KEY[question.kind] ? t(INTERVIEW_KIND_KEY[question.kind]) : question.kind}</Badge>
          )}
        </div>
        {bookmarkable && (
          <button
            type="button"
            onClick={() => actions.toggleBookmark('interview', question.id, { title: question.question, to: `/interview/question/${question.id}` })}
            className={cx('rounded p-1.5 transition', bookmarked ? 'text-primary-ink' : 'text-on-surface-variant hover:text-on-surface')}
            aria-pressed={bookmarked}
            aria-label={bookmarked ? t('bookmarks.remove') : t('bookmarks.addQuestion')}
          >
            <Icon name="bookmark" size={19} filled={bookmarked} />
          </button>
        )}
      </div>

      <h2 className="font-heading text-title-md leading-8 text-on-surface"><InlineMarkup text={question.question} /></h2>

      {question.code && (
        <div className="mt-4 overflow-hidden rounded border border-outline-variant bg-surface-container-lowest px-4 py-3">
          <HighlightedCode code={question.code} showLineNumbers />
        </div>
      )}

      {objective && (
        <fieldset className="mt-5 space-y-2">
          <legend className="sr-only">{t('learning.chooseAnswer')}</legend>
          {question.options.map((option, i) => (
            <label
              key={i}
              className={cx(
                'flex cursor-pointer items-start gap-3 rounded border px-3 py-2.5 transition-colors',
                revealed && i === question.correct && 'border-success/50 bg-success/10',
                revealed && choice === i && i !== question.correct && 'border-error/50 bg-error/10',
                !revealed && choice === i && 'border-primary bg-primary/5',
                !revealed && choice !== i && 'border-outline-variant hover:bg-surface-container',
              )}
            >
              <input
                type="radio"
                name={`iq-${question.id}`}
                checked={choice === i}
                disabled={revealed}
                onChange={() => setChoice(i)}
                className="mt-0.5 accent-[rgb(var(--c-primary))]"
              />
              {/* `whitespace-pre-wrap` matters: an output-prediction option is the
                  literal multi-line console output, and collapsing the newlines
                  would make several options look identical. */}
              <span className="min-w-0 flex-1 whitespace-pre-wrap font-mono text-code-md text-on-surface"><InlineMarkup text={option} /></span>
            </label>
          ))}
        </fieldset>
      )}

      {!revealed ? (
        <div className="mt-5">
          {!objective && (
            <p className="mb-3 font-body-sm text-on-surface-variant">
              {t('interview.answerOutLoud')}
            </p>
          )}
          <Button onClick={reveal} disabled={objective && choice == null} icon="visibility">
            {t('interview.reveal')}
          </Button>
        </div>
      ) : (
        <div className="mt-6 space-y-5">
          {objective && (
            <div className={cx('rounded border px-4 py-3', correct ? 'border-success/40 bg-success/10' : 'border-error/40 bg-error/10')}>
              <p className={cx('flex items-center gap-2 font-body-sm font-bold', correct ? 'text-success' : 'text-error')}>
                <Icon name={correct ? 'check_circle' : 'cancel'} size={16} filled />
                {correct ? t('interview.correct') : (
                  <>
                    {t('interview.theAnswerIs')}
                    <span className="whitespace-pre-wrap"><InlineMarkup text={question.options[question.correct]} /></span>
                  </>
                )}
              </p>
            </div>
          )}

          <div className="rounded border border-primary/30 bg-primary/5 px-4 py-3">
            <SectionLabel className="mb-1.5">{t('interview.thirtySecondAnswer')}</SectionLabel>
            <p className="font-body-md leading-7 text-on-surface"><InlineMarkup text={question.shortAnswer} /></p>
          </div>

          <div>
            <SectionLabel className="mb-2">{t('interview.goingDeeper')}</SectionLabel>
            <div className="space-y-3">
              {question.deepAnswer.map((p, i) => (
                <p key={i} className="font-body-md leading-7 text-on-surface-variant"><InlineMarkup text={p} /></p>
              ))}
            </div>
          </div>

          {question.example && (
            <div className="overflow-hidden rounded border border-outline-variant bg-surface-container-lowest px-4 py-3">
              <HighlightedCode code={question.example} showLineNumbers />
            </div>
          )}

          <div>
            <SectionLabel className="mb-2">{t('interview.didYourAnswerCover')}</SectionLabel>
            <ul className="space-y-1.5">
              {question.keyPoints.map((point, i) => (
                <li key={i}>
                  <label className="flex cursor-pointer items-start gap-2.5 font-body-sm text-on-surface-variant">
                    <input
                      type="checkbox"
                      checked={checkedPoints.includes(i)}
                      onChange={() => togglePoint(i)}
                      className="mt-1 accent-[rgb(var(--c-primary))]"
                    />
                    <InlineMarkup text={point} />
                  </label>
                </li>
              ))}
            </ul>
            <p className="mt-2 font-body-sm text-on-surface-variant">
              {t('interview.pointsCovered', { done: checkedPoints.length, total: question.keyPoints.length })}
            </p>
          </div>

          {question.commonMistakes?.length > 0 && (
            <div className="rounded border border-error/30 bg-error/5 px-4 py-3">
              <SectionLabel className="mb-2">{t('interview.commonMistakes')}</SectionLabel>
              <ul className="space-y-1.5">
                {question.commonMistakes.map((m, i) => (
                  <li key={i} className="flex items-start gap-2 font-body-sm text-on-surface-variant">
                    <Icon name="close" size={14} className="mt-1 shrink-0 text-error" /><InlineMarkup text={m} />
                  </li>
                ))}
              </ul>
            </div>
          )}

          {question.followUps?.length > 0 && (
            <div>
              <SectionLabel className="mb-2">{t('interview.likelyFollowUps')}</SectionLabel>
              <ul className="space-y-1.5">
                {question.followUps.map((f, i) => (
                  <li key={i} className="font-body-sm text-on-surface-variant">“<InlineMarkup text={f} />”</li>
                ))}
              </ul>
            </div>
          )}

          {!objective && !rated && (
            <div className="border-t border-outline-variant pt-4">
              <SectionLabel className="mb-2">{t('interview.rateYourself')}</SectionLabel>
              <div className="flex flex-wrap gap-2">
                {[
                  { rating: 1, labelKey: 'interview.rateNotAtAll' },
                  { rating: 2, labelKey: 'interview.ratePartly' },
                  { rating: 3, labelKey: 'interview.rateMostly' },
                  { rating: 4, labelKey: 'interview.rateConfidently' },
                ].map((r) => (
                  <Button key={r.rating} variant="secondary" size="sm" onClick={() => selfRate(r.rating)}>
                    {t(r.labelKey)}
                  </Button>
                ))}
              </div>
            </div>
          )}
          {rated && <p className="font-body-sm text-success">{t('interview.recorded')}</p>}
        </div>
      )}
    </Card>
  );
}
