import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getChallenge, challengeBySlug } from '../content/registry.js';
import { CodeEditor } from '../components/code/CodeEditor.jsx';
import { HighlightedCode } from '../components/code/CodeBlock.jsx';
import { ConsoleOutput } from '../components/code/ConsoleOutput.jsx';
import { Button, Icon, Badge, DifficultyBadge, Card, Disclosure, cx } from '../components/ui/index.jsx';
import { ContentSkeleton } from '../components/feedback/PageSkeleton.jsx';
import { InlineMarkup } from '../components/learning/InlineMarkup.jsx';
import { Authored } from '../components/learning/Authored.jsx';
import { runCode } from '../services/sandbox/index.js';
import { useUserState } from '../state/UserStateProvider.jsx';
import { dayKey } from '../features/progress/progressEngine.js';
import { dailyChallenge } from '../features/progress/recommendations.js';
import { contentIndex } from '../content/registry.js';
import { ContentLoadState } from '../components/feedback/ContentLoadState.jsx';
import { useT } from '../i18n/index.jsx';

export default function ChallengeDetail() {
  const { slug } = useParams();
  const { state, actions } = useUserState();
  const t = useT();
  const [challenge, setChallenge] = useState(null);
  const [error, setError] = useState(null);
  const [code, setCode] = useState('');
  const [result, setResult] = useState(null);
  const [running, setRunning] = useState(false);
  const [hints, setHints] = useState(0);
  const [showSolution, setShowSolution] = useState(false);

  const meta = challengeBySlug[slug];

  useEffect(() => {
    let cancelled = false;
    setChallenge(null); setError(null); setResult(null); setHints(0); setShowSolution(false);
    if (!meta) { setError({ messageKey: 'challenges.doesNotExist' }); return undefined; }
    getChallenge(meta.id)
      .then((c) => { if (!cancelled) { setChallenge(c); setCode(state.challenges[c.id]?.lastCode ?? c.starterCode); } })
      .catch((e) => { if (!cancelled) setError({ message: e.message }); });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meta]);

  const run = useCallback(async () => {
    if (!challenge) return;
    setRunning(true);
    const res = await runCode(code, {
      tests: challenge.tests,
      timeout: challenge.timeout ?? 5000,
      needsDom: challenge.needsDom === true,
      html: challenge.html ?? '',
    });
    setResult(res);
    setRunning(false);
    actions.recordChallenge(challenge, { passed: res.passed, code });
    const daily = dailyChallenge(contentIndex.challenges);
    if (res.passed && daily?.id === challenge.id) actions.completeDailyChallenge(dayKey(), challenge.id);
  }, [challenge, code, actions]);

  if (error) {
    return <ContentLoadState error={error} kind="challenge" backTo="/challenges" backLabel={t('challenges.allChallenges')} />;
  }
  if (!challenge) return <ContentSkeleton lines={8} />;

  const record = state.challenges[challenge.id];
  const visibleTests = result?.tests?.filter((t) => !t.hidden) ?? [];
  const hiddenFailed = (result?.tests ?? []).filter((t) => t.hidden && !t.passed).length;

  return (
    <div className="animate-fade-in">
      <Link to="/challenges" className="mb-5 inline-flex items-center gap-1.5 font-body-sm text-on-surface-variant transition hover:text-on-surface">
        <Icon name="arrow_back" size={16} /> {t('challenges.title')}
      </Link>

      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <DifficultyBadge difficulty={challenge.difficulty} />
            <Badge tone="neutral"><Authored>{challenge.category}</Authored></Badge>
            <Badge tone="primary">{t('common.xpPlus', { count: challenge.xp })}</Badge>
            {record?.solved && <Badge tone="success" icon="check_circle">{t('learning.solved')}</Badge>}
          </div>
          <h1 className="font-display text-headline-md text-on-surface"><Authored>{challenge.title}</Authored></h1>
          <p className="mt-3 font-body-md leading-7 text-on-surface-variant"><InlineMarkup text={challenge.prompt} /></p>

          {challenge.examples?.length > 0 && (
            <div className="mt-5 space-y-3">
              {challenge.examples.map((ex, i) => (
                <Card key={i} className="p-4">
                  <p className="mb-2 font-mono text-label-caps uppercase tracking-wider text-on-surface-variant">{t('challenges.exampleNumber', { number: i + 1 })}</p>
                  <HighlightedCode code={ex} />
                </Card>
              ))}
            </div>
          )}

          {challenge.constraints?.length > 0 && (
            <Card className="mt-5 p-4">
              <p className="mb-2 font-mono text-label-caps uppercase tracking-wider text-on-surface-variant">{t('challenges.constraints')}</p>
              <ul className="list-disc space-y-1 pl-5 font-body-sm text-on-surface-variant">
                {challenge.constraints.map((c, i) => <li key={i}><InlineMarkup text={c} /></li>)}
              </ul>
            </Card>
          )}

          {hints < challenge.hints.length && (
            <Button variant="ghost" className="mt-5" onClick={() => setHints((n) => n + 1)} icon="lightbulb">
              {hints === 0 ? t('learning.needHint') : t('learning.anotherHint')}
            </Button>
          )}
          {hints > 0 && (
            <div className="mt-3 space-y-2">
              {challenge.hints.slice(0, hints).map((h, i) => (
                <div key={i} className="rounded border border-warning/30 bg-warning/5 px-3 py-2.5 font-body-sm text-on-surface-variant">
                  <span className="font-semibold text-on-surface">{t('learning.hintNumber', { number: i + 1 })} </span><InlineMarkup text={h} />
                </div>
              ))}
            </div>
          )}

          <div className="mt-5">
            {showSolution ? (
              <Disclosure title={t('challenges.referenceSolution')} icon="key" defaultOpen>
                <div className="overflow-hidden rounded border border-outline-variant px-4 py-3">
                  <HighlightedCode code={challenge.solution} showLineNumbers />
                </div>
                <p className="mt-3 font-body-md leading-7 text-on-surface-variant"><InlineMarkup text={challenge.solutionExplanation} /></p>
              </Disclosure>
            ) : (
              <button type="button" onClick={() => setShowSolution(true)} className="font-body-sm text-on-surface-variant underline underline-offset-2 hover:text-on-surface">
                {t('challenges.showReferenceSolution')}
              </button>
            )}
          </div>
        </div>

        <div>
          <CodeEditor value={code} onChange={setCode} onRun={run} height={420} ariaLabel={t('challenges.solutionEditorFor', { title: challenge.title })} />
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Button onClick={run} loading={running} icon="play_arrow">{running ? t('learning.running') : t('learning.runTests')}</Button>
            <Button variant="ghost" onClick={() => { setCode(challenge.starterCode); setResult(null); }} icon="restart_alt">{t('common.reset')}</Button>
            <span className="ml-auto hidden font-mono text-code-sm text-on-surface-variant sm:inline">{t('learning.runShortcut')}</span>
          </div>

          {result && (
            <Card className={cx('mt-4 p-4', result.passed ? 'border-success/40 bg-success/5' : 'border-error/40 bg-error/5')}>
              <p className={cx('flex items-center gap-2 font-body-sm font-bold', result.passed ? 'text-success' : 'text-error')}>
                <Icon name={result.passed ? 'check_circle' : 'info'} size={16} filled />
                {result.passed
                  ? t('learning.allTestsPassed')
                  : t('learning.testsPassedCount', {
                    passed: result.tests.filter((test) => test.passed).length,
                    total: result.tests.length,
                  })}
              </p>
              <ul className="mt-3 space-y-1.5">
                {visibleTests.map((test, i) => (
                  <li key={i} className="flex items-start gap-2 font-body-sm">
                    <Icon name={test.passed ? 'check' : 'close'} size={15} className={cx('mt-0.5 shrink-0', test.passed ? 'text-success' : 'text-error')} />
                    <span className="min-w-0 flex-1">
                      <span className="text-on-surface"><Authored>{test.name}</Authored></span>
                      {!test.passed && test.message && <span className="mt-0.5 block font-mono text-code-sm text-on-surface-variant">{test.message}</span>}
                    </span>
                  </li>
                ))}
                {hiddenFailed > 0 && (
                  <li className="flex items-start gap-2 font-body-sm text-on-surface-variant">
                    <Icon name="visibility_off" size={15} className="mt-0.5 shrink-0" />
                    {t('challenges.hiddenTestsFailing', { count: hiddenFailed })}
                  </li>
                )}
              </ul>
            </Card>
          )}

          {result && (result.logs?.length > 0 || result.error) && (
            <div className="mt-4 overflow-hidden rounded border border-outline-variant">
              <ConsoleOutput result={result} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
