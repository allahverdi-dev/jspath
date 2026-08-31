import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getInterviewQuestions, interviewQuestions } from '../content/registry.js';
import { InterviewAnswer } from '../features/interview/InterviewAnswer.jsx';
import { Card, Button, Icon, Badge, ProgressBar, Select, EmptyState, SectionLabel } from '../components/ui/index.jsx';
import { ContentSkeleton } from '../components/feedback/PageSkeleton.jsx';
import { Logo } from '../layouts/AppShell.jsx';

const LEVELS = ['junior', 'junior+', 'intermediate', 'advanced'];

export default function InterviewSession() {
  const navigate = useNavigate();
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
        <EmptyState icon="hourglass_empty" title="No interview questions in this build" message="The interview bank has not been authored yet." action={<Button to="/dashboard">Back to dashboard</Button>} />
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
            <Icon name="close" size={18} /> Exit
          </button>
          <Logo size="sm" className="mx-auto hidden sm:flex" />
          {started && questions && !finished && (
            <span className="ml-auto flex items-center gap-3 font-mono text-code-sm text-on-surface-variant">
              {config.timed && <span>{Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, '0')}</span>}
              <span>{index + 1} / {questions.length}</span>
            </span>
          )}
        </div>
        {started && questions && <ProgressBar value={questions.length ? index / questions.length : 0} height={2} label="Session progress" />}
      </header>

      <main id="main-content" className="mx-auto w-full max-w-3xl px-4 py-8">
        {!started ? (
          <Card className="p-6">
            <h1 className="font-display text-headline-md text-on-surface">Interview practice session</h1>
            <p className="mt-2 font-body-md text-on-surface-variant">
              Answer out loud before revealing. Objective questions are scored automatically;
              conceptual answers you assess yourself against a checklist.
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <Select label="Level" value={config.level} onChange={(e) => setConfig({ ...config, level: e.target.value })}>
                <option value="all">All levels</option>
                {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
              </Select>
              <Select label="Topic" value={config.topic} onChange={(e) => setConfig({ ...config, topic: e.target.value })}>
                <option value="all">All topics</option>
                {topics.map((t) => <option key={t} value={t}>{t}</option>)}
              </Select>
              <Select label="Questions" value={config.count} onChange={(e) => setConfig({ ...config, count: Number(e.target.value) })}>
                {[5, 10, 15, 20].map((n) => <option key={n} value={n}>{n}</option>)}
              </Select>
            </div>
            <label className="mt-4 flex items-center gap-2 font-body-sm text-on-surface-variant">
              <input type="checkbox" checked={config.timed} onChange={(e) => setConfig({ ...config, timed: e.target.checked })} className="accent-[rgb(var(--c-primary))]" />
              Show a timer
            </label>
            <p className="mt-4 font-body-sm text-on-surface-variant">{pool.length} question{pool.length === 1 ? '' : 's'} match your filters.</p>
            <Button className="mt-6" size="lg" onClick={start} disabled={pool.length === 0} icon="play_arrow">Start session</Button>
          </Card>
        ) : !questions ? (
          <ContentSkeleton lines={8} />
        ) : finished ? (
          <Card className="p-6">
            <h1 className="font-heading text-headline-md text-on-surface">Session complete</h1>
            <p className="mt-2 font-body-md text-on-surface-variant">
              You worked through {questions.length} questions and felt confident on {correctCount}.
            </p>
            <ProgressBar value={questions.length ? correctCount / questions.length : 0} className="mt-5" height={6} label="Session score" />
            <div className="mt-6">
              <SectionLabel className="mb-2">Weakest in this session</SectionLabel>
              <div className="flex flex-wrap gap-2">
                {[...new Set(results.filter((r) => !r.correct).map((r) => r.topic))].map((t) => (
                  <Badge key={t} tone="warning">{t}</Badge>
                ))}
                {results.every((r) => r.correct) && <p className="font-body-sm text-success">Nothing flagged — strong session.</p>}
              </div>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button onClick={() => { setStarted(false); setQuestions(null); setIndex(0); setResults([]); setSeconds(0); }} icon="refresh">
                New session
              </Button>
              <Button as={Link} to="/interview" variant="secondary">Back to question bank</Button>
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
                {index < questions.length - 1 ? 'Next question' : 'Finish session'}
              </Button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
