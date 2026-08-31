import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, Button, Icon, Badge, Tabs, EmptyState, Input, Select, SectionLabel, ProgressBar } from '../components/ui/index.jsx';
import { InlineMarkup } from '../components/learning/InlineMarkup.jsx';
import { useUserState } from '../state/UserStateProvider.jsx';
import { interviewQuestions, contentIndex } from '../content/registry.js';
import { weakTopics } from '../features/mastery/masteryEngine.js';
import { INTERVIEW_LEVELS, INTERVIEW_KIND_LABEL } from '../content/schema/types.js';
import { useEntitlements } from '../state/EntitlementProvider.jsx';
import { FEATURE } from '../features/billing/plans.js';

const LEVELS = INTERVIEW_LEVELS;

export default function InterviewPrep() {
  const { state } = useUserState();
  const { hasFeature } = useEntitlements();
  const interviewUnlocked = hasFeature(FEATURE.INTERVIEW_PRO);
  const [level, setLevel] = useState('all');
  const [topic, setTopic] = useState('all');
  const [kind, setKind] = useState('all');
  const [query, setQuery] = useState('');

  const topics = useMemo(() => [...new Set(interviewQuestions.map((q) => q.topic))].sort(), []);
  const kinds = useMemo(() => [...new Set(interviewQuestions.map((q) => q.kind))].sort(), []);
  const weak = useMemo(() => weakTopics(state, contentIndex.topics, contentIndex, { limit: 4 }), [state]);

  const filtered = useMemo(
    () => interviewQuestions.filter((q) => {
      const s = query.trim().toLowerCase();
      if (s && !`${q.question} ${q.shortAnswer}`.toLowerCase().includes(s)) return false;
      if (level !== 'all' && q.level !== level) return false;
      if (topic !== 'all' && q.topic !== topic) return false;
      if (kind !== 'all' && q.kind !== kind) return false;
      return true;
    }),
    [level, topic, kind, query],
  );

  const seen = Object.keys(state.interview).length;

  return (
    <div className="animate-fade-in">
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="font-display text-display-lg text-on-surface">Interview Prep</h1>
          <p className="mt-2 max-w-2xl font-body-lg text-on-surface-variant">
            Every question has a 30-second answer for the room and a deeper explanation for
            understanding. {seen} of {interviewQuestions.length} worked through.
          </p>
        </div>
        <Button to="/interview/session" size="lg" icon={interviewUnlocked ? 'play_arrow' : 'lock'}>
          {interviewUnlocked ? 'Start practice session' : 'Pro practice session'}
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <div className="mb-4 space-y-3">
            <Input icon="search" placeholder="Search questions…" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search interview questions" />
            <Tabs tabs={[{ value: 'all', label: 'All levels' }, ...LEVELS.map((l) => ({ value: l, label: l }))]} value={level} onChange={setLevel} />
            <div className="grid gap-3 sm:grid-cols-2">
              <Select label="Topic" value={topic} onChange={(e) => setTopic(e.target.value)}>
                <option value="all">All topics</option>
                {topics.map((t) => <option key={t} value={t}>{t}</option>)}
              </Select>
              <Select label="Question type" value={kind} onChange={(e) => setKind(e.target.value)}>
                <option value="all">All types</option>
                {kinds.map((k) => <option key={k} value={k}>{INTERVIEW_KIND_LABEL[k] ?? k}</option>)}
              </Select>
            </div>
          </div>

          <p className="mb-3 font-body-sm text-on-surface-variant">{filtered.length} question{filtered.length === 1 ? '' : 's'}</p>

          {filtered.length === 0 ? (
            <EmptyState
              icon={interviewQuestions.length === 0 ? 'hourglass_empty' : 'filter_alt_off'}
              title={interviewQuestions.length === 0 ? 'No questions in this build' : 'No questions match'}
              message={interviewQuestions.length === 0 ? 'The interview bank has not been authored yet in this build.' : 'Try widening your filters.'}
            />
          ) : (
            <div className="space-y-2">
              {filtered.map((q) => {
                const record = state.interview[q.id];
                return (
                  <Card key={q.id} as={Link} to={`/interview/question/${q.id}`} interactive className="flex items-start gap-3 p-4">
                    <Icon
                      name={record ? 'check_circle' : 'radio_button_unchecked'}
                      size={18}
                      filled={Boolean(record)}
                      className={`mt-0.5 shrink-0 ${record ? 'text-success' : 'text-on-surface-variant'}`}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="font-body-md font-medium text-on-surface"><InlineMarkup text={q.question} /></span>
                      <span className="mt-1 block line-clamp-2 font-body-sm text-on-surface-variant"><InlineMarkup text={q.shortAnswer} /></span>
                      <span className="mt-2 flex flex-wrap gap-2">
                        <Badge tone="neutral">{q.topic}</Badge>
                        <Badge tone="info">{q.level}</Badge>
                        {!interviewUnlocked && <Badge tone="primary" icon="lock">Pro</Badge>}
                      </span>
                    </span>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        <div className="space-y-4 lg:col-span-4">
          <Card className="p-5">
            <SectionLabel className="mb-3">How to use this</SectionLabel>
            <ul className="space-y-2 font-body-sm text-on-surface-variant">
              <li>• Read the question and answer it out loud before revealing anything.</li>
              <li>• Compare against the key-points checklist, not just the model answer.</li>
              <li>• Score yourself honestly — the checklist exists so you can.</li>
            </ul>
            <p className="mt-3 font-body-sm text-on-surface-variant">
              Open answers are self-assessed. There is no AI grader here, and pretending otherwise
              would give you false confidence.
            </p>
          </Card>

          {weak.length > 0 && (
            <Card className="p-5">
              <SectionLabel className="mb-3">Shore these up first</SectionLabel>
              <div className="space-y-3">
                {weak.map((t) => (
                  <div key={t.topicId}>
                    <div className="mb-1 flex items-center justify-between font-body-sm">
                      <span className="truncate text-on-surface-variant">{t.label}</span>
                      <span className="ml-2 font-mono text-on-surface">{Math.round(t.score * 100)}%</span>
                    </div>
                    <ProgressBar value={t.score} />
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
