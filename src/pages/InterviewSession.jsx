import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getInterviewQuestions, interviewQuestions } from '../content/registry.js';
import { InterviewAnswer } from '../features/interview/InterviewAnswer.jsx';
import { Card, Button, Icon, Badge, ProgressBar, Select, EmptyState, SectionLabel } from '../components/ui/index.jsx';
import { ContentSkeleton } from '../components/feedback/PageSkeleton.jsx';
import { Logo } from '../layouts/AppShell.jsx';
import { useT } from '../i18n/index.jsx';
import { INTERVIEW_LEVELS, INTERVIEW_LEVEL_KEY } from '../content/schema/types.js';
import { Authored } from '../components/learning/Authored.jsx';

const LEVELS = INTERVIEW_LEVELS;

export default function InterviewSession() {
  const navigate = useNavigate();
  const t = useT();
  const [config, setConfig] = useState({ level: 'all', topic: 'all', count: 10, timed: false });
  const [started, setStarted] = useState(false);
  const [questions, setQuestions] = useState(null);
  const [index, setIndex] = useState(0);
  const [results, setResults] = useState([]);
  const [seconds, setSeconds] = useState(0);

  const topics = useMemo(() => [...new Set(interviewQuestions.map((q) => q.topic))].sort(), []);

  const pool = useMemo(
    () => interviewQuestions.filter((q) =>
      (config.level === 'all' || q.level === config.level) &&
      (config.topic === 'all' || q.topic === config.topic)),
    [config.level, config.topic],
  );

  useEffect(() => {
    if (!started || !config.timed) return undefined;
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [started, config.timed]);

  const start = async () => {
    const shuffled = [...pool].sort(() => Math.random() - 0.5).slice(0, config.count);
    setStarted(true);
    const full = await getInterviewQuestions(shuffled.map((q) => q.id));
    setQuestions(full);
  };

  if (interviewQuestions.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20">
        <EmptyState
          icon="hourglass_empty"
          title={t('interview.noQuestions')}
          message={t('interview.noQuestionsBody')}
          action={<Button to="/dashboard">{t('nav.backToDashboard')}</Button>}
        />
      </div>
    );
  }

  const finished = questions && index >= questions.length;
  const correctCount = results.filter((r) => r.correct).length;

  return (
    <div className="min-h-screen bg-background">
      <header className="safe-top sticky top-0 z-30 border-b border-outline-variant bg-surface/90 backdrop-blur-xl">
        <div className="mx-auto flex h-14 w-full max-w-3xl items-center gap-3 px-4">
          <button type="button" onClick={() => navigate('/interview')} className="flex items-center gap-1.5 font-body-sm text-on-surface-variant transition hover:text-on-surface">
            <Icon name="close" size={18} /> {t('interview.exit')}
          </button>
          <Logo size="sm" className="mx-auto hidden sm:flex" />
          {started && questions && !finished && (
            <span className="ml-auto flex items-center gap-3 font-mono text-code-sm text-on-surface-variant">
              {config.timed && <span>{Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, '0')}</span>}
              <span>{index + 1} / {questions.length}</span>
            </span>
          )}
        </div>
        {started && questions && <ProgressBar value={questions.length ? index / questions.length : 0} height={2} label={t('interview.sessionProgress')} />}
      </header>

      <main id="main-content" className="mx-auto w-full max-w-3xl px-4 py-8">
        {!started ? (
          <Card className="p-6">
            <h1 className="font-display text-headline-md text-on-surface">{t('interview.sessionTitle')}</h1>
            <p className="mt-2 font-body-md text-on-surface-variant">
              {t('interview.sessionIntro')}
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <Select label={t('interview.level')} value={config.level} onChange={(e) => setConfig({ ...config, level: e.target.value })}>
                <option value="all">{t('interview.allLevels')}</option>
                {LEVELS.map((l) => <option key={l} value={l}>{t(INTERVIEW_LEVEL_KEY[l])}</option>)}
              </Select>
              <Select label={t('interview.topic')} value={config.topic} onChange={(e) => setConfig({ ...config, topic: e.target.value })}>
                <option value="all">{t('interview.allTopics')}</option>
                {topics.map((name) => <option key={name} value={name} lang="en">{name}</option>)}
              </Select>
              <Select label={t('interview.questions')} value={config.count} onChange={(e) => setConfig({ ...config, count: Number(e.target.value) })}>
                {[5, 10, 15, 20].map((n) => <option key={n} value={n}>{n}</option>)}
              </Select>
            </div>
            <label className="mt-4 flex items-center gap-2 font-body-sm text-on-surface-variant">
              <input type="checkbox" checked={config.timed} onChange={(e) => setConfig({ ...config, timed: e.target.checked })} className="accent-[rgb(var(--c-primary))]" />
              {t('interview.showTimer')}
            </label>
            <p className="mt-4 font-body-sm text-on-surface-variant">{t('interview.matchingFilters', { count: pool.length })}</p>
            <Button className="mt-6" size="lg" onClick={start} disabled={pool.length === 0} icon="play_arrow">{t('interview.startSession')}</Button>
          </Card>
        ) : !questions ? (
          <ContentSkeleton lines={8} />
        ) : finished ? (
          <Card className="p-6">
            <h1 className="font-heading text-headline-md text-on-surface">{t('interview.sessionComplete')}</h1>
            <p className="mt-2 font-body-md text-on-surface-variant">
              {t('interview.sessionSummary', { total: questions.length, correct: correctCount })}
            </p>
            <ProgressBar value={questions.length ? correctCount / questions.length : 0} className="mt-5" height={6} label={t('interview.sessionScore')} />
            <div className="mt-6">
              <SectionLabel className="mb-2">{t('interview.weakestInSession')}</SectionLabel>
              <div className="flex flex-wrap gap-2">
                {[...new Set(results.filter((r) => !r.correct).map((r) => r.topic))].map((name) => (
                  <Badge key={name} tone="warning"><Authored>{name}</Authored></Badge>
                ))}
                {results.every((r) => r.correct) && <p className="font-body-sm text-success">{t('interview.nothingFlagged')}</p>}
              </div>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button onClick={() => { setStarted(false); setQuestions(null); setIndex(0); setResults([]); setSeconds(0); }} icon="refresh">
                {t('interview.newSession')}
              </Button>
              <Button as={Link} to="/interview" variant="secondary">{t('interview.backToQuestionBank')}</Button>
            </div>
          </Card>
        ) : (
          <>
            <InterviewAnswer
              key={questions[index].id}
              question={questions[index]}
              onAnswered={({ correct }) => setResults((r) => [...r, { correct, topic: questions[index].topic }])}
            />
            <div className="mt-4 flex justify-end">
              <Button onClick={() => setIndex((i) => i + 1)} iconRight="arrow_forward">
                {index < questions.length - 1 ? t('interview.nextQuestion') : t('interview.finishSession')}
              </Button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
