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
import { DIFFICULTY_ORDER, DIFFICULTY_KEY, EXERCISE_KIND, MASTERY_ORDER, MASTERY_KEY } from '../content/schema/types.js';
import { useT } from '../i18n/index.jsx';
import { ContentAccessBadge } from '../components/billing/ContentAccessBadge.jsx';
import { AdvancedAnalyticsGate } from '../components/billing/AdvancedAnalyticsGate.jsx';
import { useEntitlements } from '../state/EntitlementProvider.jsx';
import { FEATURE } from '../features/billing/plans.js';
import { InlineMarkup } from '../components/learning/InlineMarkup.jsx';
import { Authored } from '../components/learning/Authored.jsx';

/* Stable filter tokens; the wording comes from the dictionaries. */
const STATUS_TABS = [
  { value: 'all', labelKey: 'common.all' },
  { value: 'unsolved', labelKey: 'practice.statusUnsolved' },
  { value: 'solved', labelKey: 'practice.statusSolved' },
  { value: 'attempted', labelKey: 'practice.statusAttempted' },
];

export default function PracticeHub() {
  const { state } = useUserState();
  const t = useT();
  const { hasFeature } = useEntitlements();
  const sessionsUnlocked = hasFeature(FEATURE.PREMIUM_PRACTICE);
  const analyticsUnlocked = hasFeature(FEATURE.ADVANCED_ANALYTICS);
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
    return contentIndex.topics.filter((topic) => ids.has(topic.id));
  }, []);

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="font-display text-display-lg text-on-surface">{t('practice.title')}</h1>
        <p className="mt-2 max-w-2xl font-body-lg text-on-surface-variant">
          {t('practice.subtitle', { solved: solvedCount, total: allExercises.length })}
        </p>
      </div>

      {/* Session starters */}
      <div className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            title: t('practice.dailyPractice'),
            description: t('practice.dailyPracticeBody'),
            icon: 'today',
            to: '/practice/session?mode=daily',
            tone: 'primary',
          },
          {
            title: t('practice.weakTopics'),
            description: analyticsUnlocked
              ? (weak.length > 0
                ? t('practice.focusOn', { topic: weak[0].label })
                : t('practice.completeWorkFirst'))
              : t('practice.weakTopicsBody'),
            icon: 'trending_down',
            to: '/practice/session?mode=weak',
            disabled: sessionsUnlocked && weak.length === 0,
          },
          {
            title: t('practice.reviewMistakes'),
            description: review.length > 0
              ? t('practice.itemsToRevisit', { count: review.length })
              : t('practice.noMistakesRecorded'),
            icon: 'history',
            to: '/practice/session?mode=mistakes',
            disabled: sessionsUnlocked && review.length === 0,
          },
          {
            title: t('practice.randomPractice'),
            description: t('practice.randomPracticeBody'),
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
            <p className="mt-3 flex flex-wrap items-center gap-2 font-body-md font-semibold text-on-surface">{card.title}<Badge tone="primary" icon="lock">{t('common.pro')}</Badge></p>
            <p className="mt-1 font-body-sm text-on-surface-variant">{card.description}</p>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-8">
          {/* Filters */}
          <div className="mb-4 space-y-3">
            <Tabs
              tabs={STATUS_TABS.map((tab) => ({ value: tab.value, label: t(tab.labelKey) }))}
              value={status}
              onChange={setStatus}
            />
            <div className="grid gap-3 sm:grid-cols-3">
              <Select label={t('common.topic')} value={topic} onChange={(e) => setTopic(e.target.value)}>
                <option value="all">{t('practice.allTopics')}</option>
                {usedTopics.map((entry) => (
                  <option key={entry.id} value={entry.id} lang="en">{entry.label}</option>
                ))}
              </Select>
              <Select label={t('common.difficulty')} value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                <option value="all">{t('practice.allLevels')}</option>
                {DIFFICULTY_ORDER.map((d) => (
                  <option key={d} value={d}>{t(DIFFICULTY_KEY[d])}</option>
                ))}
              </Select>
              <Select label={t('common.type')} value={kind} onChange={(e) => setKind(e.target.value)}>
                <option value="all">{t('practice.allTypes')}</option>
                {Object.values(EXERCISE_KIND).map((k) => (
                  <option key={k} value={k}>{t('exerciseKind.' + k)}</option>
                ))}
              </Select>
            </div>
          </div>

          <p className="mb-3 font-body-sm text-on-surface-variant">
            {t('common.exerciseCount', { count: filtered.length })}
          </p>

          {filtered.length === 0 ? (
            <EmptyState
              icon="filter_alt_off"
              title={t('practice.noExercisesMatch')}
              message={t('practice.tryWidening')}
              action={
                <Button variant="secondary" onClick={() => { setStatus('all'); setTopic('all'); setDifficulty('all'); setKind('all'); }}>
                  {t('common.clearFilters')}
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
                      <span className="font-body-md font-medium text-on-surface"><InlineMarkup text={exercise.title} /></span>
                      <span className="mt-1 block line-clamp-2 font-body-sm text-on-surface-variant"><InlineMarkup text={exercise.instructions} /></span>
                      <span className="mt-2 flex flex-wrap items-center gap-2">
                        <DifficultyBadge difficulty={exercise.difficulty} />
                        <ContentAccessBadge kind="exercise" id={exercise.id} />
                        {exercise.topicIds.slice(0, 2).map((id) => (
                          <Badge key={id} tone="neutral"><Authored>{TOPIC_BY_ID[id]?.label ?? id}</Authored></Badge>
                        ))}
                        <Badge tone="primary">{t('common.xpPlus', { count: exercise.xp })}</Badge>
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
          <AdvancedAnalyticsGate>
            <div className="space-y-4">
              <Card className="p-5">
                <SectionLabel className="mb-3">{t('practice.weakestTopics')}</SectionLabel>
                {weak.length === 0 ? (
                  <p className="font-body-sm text-on-surface-variant">
                    {t('practice.weakestTopicsEmpty')}
                  </p>
                ) : (
                  <div className="space-y-3">
                    {weak.map((entry) => (
                      <div key={entry.topicId}>
                        <div className="mb-1 flex items-center justify-between font-body-sm">
                          <span className="truncate text-on-surface-variant"><Authored>{entry.label}</Authored></span>
                          <span className="ml-2 shrink-0 font-mono text-on-surface">{Math.round(entry.score * 100)}%</span>
                        </div>
                        <ProgressBar value={entry.score} />
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              {review.length > 0 && (
                <Card className="p-5">
                  <SectionLabel className="mb-3">{t('practice.reviewMistakes')}</SectionLabel>
                  <ul className="space-y-2">
                    {review.slice(0, 6).map((item, i) => (
                      <li key={`${item.refId}-${i}`}>
                        <Link to={item.to} className="flex items-start gap-2 font-body-sm text-on-surface-variant transition hover:text-on-surface">
                          <Icon name={item.icon} size={15} className="mt-0.5 shrink-0" />
                          <span className="min-w-0 flex-1 truncate">{item.titleKey ? t(item.titleKey, item.titleVars) : <Authored>{item.title}</Authored>}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                  <Button to="/practice/session?mode=mistakes" variant="secondary" size="sm" className="mt-4 w-full">
                    {t('practice.practiseThese')}
                  </Button>
                </Card>
              )}

              <Card className="p-5">
                <SectionLabel className="mb-3">{t('practice.masteryOverview')}</SectionLabel>
                <div className="space-y-2">
                  {[...MASTERY_ORDER].reverse().map((level) => {
                    const count = topicScores.filter((entry) => entry.level === level).length;
                    return (
                      <div key={level} className="flex items-center justify-between font-body-sm">
                        <span className="text-on-surface-variant">{t(MASTERY_KEY[level])}</span>
                        <span className="font-mono text-on-surface">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </Card>
            </div>
          </AdvancedAnalyticsGate>
        </div>
      </div>
    </div>
  );
}
