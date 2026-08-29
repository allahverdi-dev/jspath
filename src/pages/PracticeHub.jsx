import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Card, Button, Icon, Badge, DifficultyBadge, Tabs, EmptyState, SectionLabel, ProgressBar, Select,
} from '../components/ui/index.jsx';
import { useUserState } from '../state/UserStateProvider.jsx';
import { contentIndex, exercises as allExercises } from '../content/registry.js';
import { weakTopics, allTopicMastery } from '../features/mastery/masteryEngine.js';
import { reviewQueue } from '../features/progress/recommendations.js';
import { TOPIC_BY_ID } from '../content/topics.js';
import { DIFFICULTY_ORDER, EXERCISE_KIND } from '../content/schema/types.js';

const STATUS_TABS = [
  { value: 'all', label: 'All' },
  { value: 'unsolved', label: 'Unsolved' },
  { value: 'solved', label: 'Solved' },
  { value: 'attempted', label: 'Attempted' },
];

export default function PracticeHub() {
  const { state } = useUserState();
  const [status, setStatus] = useState('all');
  const [topic, setTopic] = useState('all');
  const [difficulty, setDifficulty] = useState('all');
  const [kind, setKind] = useState('all');

  const weak = useMemo(() => weakTopics(state, contentIndex.topics, contentIndex, { limit: 5 }), [state]);
  const review = useMemo(() => reviewQueue(state, contentIndex), [state]);
  const topicScores = useMemo(() => allTopicMastery(state, contentIndex.topics, contentIndex), [state]);

  const filtered = useMemo(
    () =>
      allExercises.filter((e) => {
        const record = state.exercises[e.id];
        if (status === 'solved' && !record?.solved) return false;
        if (status === 'unsolved' && record?.solved) return false;
        if (status === 'attempted' && !record?.attempts) return false;
        if (topic !== 'all' && !e.topicIds.includes(topic)) return false;
        if (difficulty !== 'all' && e.difficulty !== difficulty) return false;
        if (kind !== 'all' && e.kind !== kind) return false;
        return true;
      }),
    [state, status, topic, difficulty, kind],
  );

  const solvedCount = allExercises.filter((e) => state.exercises[e.id]?.solved).length;
  const usedTopics = useMemo(() => {
    const ids = new Set(allExercises.flatMap((e) => e.topicIds));
    return contentIndex.topics.filter((t) => ids.has(t.id));
  }, []);

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="font-display text-display-lg text-on-surface">Practice Hub</h1>
        <p className="mt-2 max-w-2xl font-body-lg text-on-surface-variant">
          Targeted practice built from your own results. {solvedCount} of {allExercises.length}{' '}
          exercises solved.
        </p>
      </div>

      {/* Session starters */}
      <div className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            title: 'Daily practice',
            description: 'A short mixed set to keep your streak alive.',
            icon: 'today',
            to: '/practice/session?mode=daily',
            tone: 'primary',
          },
          {
            title: 'Weak topics',
            description: weak.length > 0 ? `Focus on ${weak[0].label}` : 'Complete some work first',
            icon: 'trending_down',
            to: '/practice/session?mode=weak',
            disabled: weak.length === 0,
          },
          {
            title: 'Review mistakes',
            description: review.length > 0 ? `${review.length} item${review.length === 1 ? '' : 's'} to revisit` : 'No mistakes recorded',
            icon: 'history',
            to: '/practice/session?mode=mistakes',
            disabled: review.length === 0,
          },
          {
            title: 'Random practice',
            description: 'Ten exercises, mixed topics.',
            icon: 'shuffle',
            to: '/practice/session?mode=random',
          },
        ].map((card) => (
          <Card
            key={card.title}
            as={card.disabled ? 'div' : Link}
            to={card.disabled ? undefined : card.to}
            interactive={!card.disabled}
            className={`block p-5 ${card.disabled ? 'opacity-50' : ''}`}
          >
            <Icon name={card.icon} size={22} className={card.tone === 'primary' ? 'text-primary-ink' : 'text-on-surface-variant'} />
            <p className="mt-3 font-body-md font-semibold text-on-surface">{card.title}</p>
            <p className="mt-1 font-body-sm text-on-surface-variant">{card.description}</p>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-8">
          {/* Filters */}
          <div className="mb-4 space-y-3">
            <Tabs tabs={STATUS_TABS} value={status} onChange={setStatus} />
            <div className="grid gap-3 sm:grid-cols-3">
              <Select label="Topic" value={topic} onChange={(e) => setTopic(e.target.value)}>
                <option value="all">All topics</option>
                {usedTopics.map((t) => (
                  <option key={t.id} value={t.id}>{t.label}</option>
                ))}
              </Select>
              <Select label="Difficulty" value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                <option value="all">All levels</option>
                {DIFFICULTY_ORDER.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </Select>
              <Select label="Type" value={kind} onChange={(e) => setKind(e.target.value)}>
                <option value="all">All types</option>
                {Object.values(EXERCISE_KIND).map((k) => (
                  <option key={k} value={k}>{k}</option>
                ))}
              </Select>
            </div>
          </div>

          <p className="mb-3 font-body-sm text-on-surface-variant">
            {filtered.length} exercise{filtered.length === 1 ? '' : 's'}
          </p>

          {filtered.length === 0 ? (
            <EmptyState
              icon="filter_alt_off"
              title="No exercises match"
              message="Try widening your filters."
              action={
                <Button variant="secondary" onClick={() => { setStatus('all'); setTopic('all'); setDifficulty('all'); setKind('all'); }}>
                  Clear filters
                </Button>
              }
            />
          ) : (
            <div className="space-y-2">
              {filtered.map((exercise) => {
                const record = state.exercises[exercise.id];
                return (
                  <Card key={exercise.id} as={Link} to={`/practice/exercise/${exercise.id}`} interactive className="flex items-start gap-3 p-4">
                    <Icon
                      name={record?.solved ? 'check_circle' : record?.attempts ? 'pending' : 'radio_button_unchecked'}
                      size={19}
                      filled={record?.solved}
                      className={`mt-0.5 shrink-0 ${record?.solved ? 'text-success' : record?.attempts ? 'text-warning' : 'text-on-surface-variant'}`}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="font-body-md font-medium text-on-surface">{exercise.title}</span>
                      <span className="mt-1 block line-clamp-2 font-body-sm text-on-surface-variant">{exercise.instructions}</span>
                      <span className="mt-2 flex flex-wrap items-center gap-2">
                        <DifficultyBadge difficulty={exercise.difficulty} />
                        {exercise.topicIds.slice(0, 2).map((t) => (
                          <Badge key={t} tone="neutral">{TOPIC_BY_ID[t]?.label ?? t}</Badge>
                        ))}
                        <Badge tone="primary">+{exercise.xp} XP</Badge>
                      </span>
                    </span>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Rail */}
        <div className="space-y-4 lg:col-span-4">
          <Card className="p-5">
            <SectionLabel className="mb-3">Weakest topics</SectionLabel>
            {weak.length === 0 ? (
              <p className="font-body-sm text-on-surface-variant">
                Complete exercises and quizzes and your weakest areas will surface here.
              </p>
            ) : (
              <div className="space-y-3">
                {weak.map((t) => (
                  <div key={t.topicId}>
                    <div className="mb-1 flex items-center justify-between font-body-sm">
                      <span className="truncate text-on-surface-variant">{t.label}</span>
                      <span className="ml-2 shrink-0 font-mono text-on-surface">{Math.round(t.score * 100)}%</span>
                    </div>
                    <ProgressBar value={t.score} />
                  </div>
                ))}
              </div>
            )}
          </Card>

          {review.length > 0 && (
            <Card className="p-5">
              <SectionLabel className="mb-3">Review your mistakes</SectionLabel>
              <ul className="space-y-2">
                {review.slice(0, 6).map((item, i) => (
                  <li key={`${item.refId}-${i}`}>
                    <Link to={item.to} className="flex items-start gap-2 font-body-sm text-on-surface-variant transition hover:text-on-surface">
                      <Icon name={item.icon} size={15} className="mt-0.5 shrink-0" />
                      <span className="min-w-0 flex-1 truncate">{item.title}</span>
                    </Link>
                  </li>
                ))}
              </ul>
              <Button to="/practice/session?mode=mistakes" variant="secondary" size="sm" className="mt-4 w-full">
                Practise these
              </Button>
            </Card>
          )}

          <Card className="p-5">
            <SectionLabel className="mb-3">Mastery overview</SectionLabel>
            <div className="space-y-2">
              {['mastered', 'practicing', 'learning', 'notStarted'].map((level) => {
                const count = topicScores.filter((t) => t.level === level).length;
                const labels = { mastered: 'Mastered', practicing: 'Practicing', learning: 'Learning', notStarted: 'Not started' };
                return (
                  <div key={level} className="flex items-center justify-between font-body-sm">
                    <span className="text-on-surface-variant">{labels[level]}</span>
                    <span className="font-mono text-on-surface">{count}</span>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
