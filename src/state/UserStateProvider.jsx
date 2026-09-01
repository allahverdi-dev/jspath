import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
  createInitialState, STATE_VERSION, visitLesson, completeLesson, recordExerciseAttempt,
  recordQuizAttempt, recordChallengeAttempt, toggleProjectMilestone, recordInterviewAnswer,
  toggleBookmark, updateSettings, updateProfile, currentStreak, logActivity, recordActivityDay,
  savePlacement, clearPlacement,
} from '../features/progress/progressEngine.js';
import { syncAchievements } from '../features/achievements/achievements.js';
import { contentIndex } from '../content/registry.js';
import { STORAGE_KEYS, readJson, writeJson, clearAll } from '../services/storage.js';
import { useAuth } from './AuthProvider.jsx';
import { loadRemoteState, saveRemoteState } from '../services/supabase.js';
import { useToast } from './ToastProvider.jsx';

const UserStateContext = createContext(null);

/**
 * Bring an older stored state up to the current shape.
 * Progress is precious — we always migrate rather than discard.
 */
function migrate(stored) {
  if (!stored || typeof stored !== 'object') return createInitialState();
  const base = createInitialState();
  const merged = {
    ...base,
    ...stored,
    version: STATE_VERSION,
    profile: { ...base.profile, ...(stored.profile ?? {}) },
    settings: { ...base.settings, ...(stored.settings ?? {}) },
    xp: { ...base.xp, ...(stored.xp ?? {}) },
    streak: { ...base.streak, ...(stored.streak ?? {}) },
  };
  // Fields added after v1 may be missing entirely on old records.
  for (const key of ['lessons', 'exercises', 'quizzes', 'challenges', 'projects', 'interview', 'bookmarks', 'achievements', 'dailyChallenge']) {
    merged[key] = { ...(base[key] ?? {}), ...(stored[key] ?? {}) };
  }
  for (const key of ['activity', 'mistakes']) {
    merged[key] = Array.isArray(stored[key]) ? stored[key] : [];
  }
  return merged;
}

/**
 * Merge guest progress into an account's progress.
 *
 * The rule everywhere is "keep the better outcome": a lesson completed in either
 * place stays completed, an exercise solved in either place stays solved, XP takes
 * the union of awarded keys. Nothing a learner earned can be lost by signing in.
 */
export function mergeStates(remote, local) {
  if (!remote) return local;
  if (!local) return remote;

  const out = migrate(remote);

  const keepEarliest = (a, b) => (!a ? b : !b ? a : a < b ? a : b);

  for (const [id, l] of Object.entries(local.lessons ?? {})) {
    const r = out.lessons[id];
    out.lessons[id] = {
      ...r, ...l,
      visits: (r?.visits ?? 0) + (l.visits ?? 0),
      completedAt: keepEarliest(r?.completedAt, l.completedAt),
    };
  }
  for (const [id, e] of Object.entries(local.exercises ?? {})) {
    const r = out.exercises[id];
    out.exercises[id] = {
      ...r, ...e,
      attempts: Math.max(r?.attempts ?? 0, e.attempts ?? 0),
      solved: Boolean(r?.solved || e.solved),
      solvedAt: keepEarliest(r?.solvedAt, e.solvedAt),
    };
  }
  for (const [id, c] of Object.entries(local.challenges ?? {})) {
    const r = out.challenges[id];
    out.challenges[id] = {
      ...r, ...c,
      attempts: Math.max(r?.attempts ?? 0, c.attempts ?? 0),
      solved: Boolean(r?.solved || c.solved),
      solvedAt: keepEarliest(r?.solvedAt, c.solvedAt),
    };
  }
  for (const [id, q] of Object.entries(local.quizzes ?? {})) {
    const r = out.quizzes[id];
    out.quizzes[id] = {
      ...r, ...q,
      attempts: [...(r?.attempts ?? []), ...(q.attempts ?? [])]
        .sort((a, b) => (a.at < b.at ? 1 : -1)).slice(0, 20),
      bestRatio: Math.max(r?.bestRatio ?? 0, q.bestRatio ?? 0),
      passed: Boolean(r?.passed || q.passed),
    };
  }
  for (const [id, p] of Object.entries(local.projects ?? {})) {
    const r = out.projects[id];
    out.projects[id] = {
      ...r, ...p,
      milestones: { ...(r?.milestones ?? {}), ...(p.milestones ?? {}) },
      completedAt: keepEarliest(r?.completedAt, p.completedAt),
    };
  }
  for (const [id, q] of Object.entries(local.interview ?? {})) {
    const r = out.interview[id];
    out.interview[id] = {
      ...r, ...q,
      seen: (r?.seen ?? 0) + (q.seen ?? 0),
      correctCount: (r?.correctCount ?? 0) + (q.correctCount ?? 0),
      wrongCount: (r?.wrongCount ?? 0) + (q.wrongCount ?? 0),
    };
  }

  // Placement: the newer of the two attempts wins. It is a single snapshot with
  // no history to reconcile, so a guest who took the assessment before signing in
  // does not lose their recommendation.
  const placements = [out.placement, local.placement].filter(Boolean);
  out.placement = placements.sort((a, b) =>
    String(a.completedAt ?? '').localeCompare(String(b.completedAt ?? '')),
  ).pop() ?? null;

  out.bookmarks = { ...out.bookmarks, ...local.bookmarks };
  out.achievements = { ...local.achievements, ...out.achievements };

  // XP: union of awarded keys, so nothing is double-counted and nothing is lost.
  const awarded = { ...out.xp.awarded, ...local.xp.awarded };
  out.xp = { awarded, total: Object.values(awarded).reduce((n, v) => n + (Number(v) || 0), 0) };

  // Streak: union of active days, then the longest run is recomputed honestly.
  const days = { ...out.streak.days, ...local.streak.days };
  out.streak = {
    days,
    current: Math.max(out.streak.current ?? 0, local.streak.current ?? 0),
    longest: Math.max(out.streak.longest ?? 0, local.streak.longest ?? 0),
    lastActiveDay: [out.streak.lastActiveDay, local.streak.lastActiveDay].filter(Boolean).sort().pop() ?? null,
  };

  out.activity = [...(out.activity ?? []), ...(local.activity ?? [])]
    .sort((a, b) => (a.at < b.at ? 1 : -1)).slice(0, 400);
  out.mistakes = [...(out.mistakes ?? []), ...(local.mistakes ?? [])]
    .sort((a, b) => (a.at < b.at ? 1 : -1)).slice(0, 250);

  return out;
}

export function UserStateProvider({ children }) {
  const { user, isAuthenticated } = useAuth();
  const toast = useToast();
  const [state, setState] = useState(() => migrate(readJson(STORAGE_KEYS.userState)));
  const [syncStatus, setSyncStatus] = useState('idle');
  const saveTimer = useRef(null);
  const lastSynced = useRef(null);

  /* Persist locally on every change — guests must never lose work. */
  useEffect(() => {
    writeJson(STORAGE_KEYS.userState, state);
  }, [state]);

  /* On sign-in, merge whatever the guest did into the account. */
  useEffect(() => {
    let cancelled = false;
    if (!isAuthenticated || !user?.id) return undefined;

    (async () => {
      setSyncStatus('syncing');
      const remote = await loadRemoteState(user.id);
      if (cancelled) return;
      setState((local) => {
        const merged = mergeStates(remote, local);
        const gained = countProgress(merged) - countProgress(remote ?? createInitialState());
        if (remote && gained > 0) {
          toast.show({
            tone: 'success',
            title: 'Progress merged',
            message: `${gained} item${gained === 1 ? '' : 's'} from this browser were added to your account.`,
          });
        }
        return merged;
      });
      setSyncStatus('idle');
    })();

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user?.id]);

  /* Debounced push to Supabase when signed in. */
  useEffect(() => {
    if (!isAuthenticated || !user?.id) return undefined;
    if (lastSynced.current === state) return undefined;
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      setSyncStatus('syncing');
      const { error } = await saveRemoteState(user.id, state);
      lastSynced.current = state;
      setSyncStatus(error ? 'error' : 'saved');
      if (!error) setTimeout(() => setSyncStatus('idle'), 1500);
    }, 1200);
    return () => clearTimeout(saveTimer.current);
  }, [state, isAuthenticated, user?.id]);

  /**
   * Wrap every mutation so achievements are evaluated centrally.
   * Individual call sites can never forget to check for an unlock.
   */
  const apply = useCallback(
    (fn) => {
      setState((prev) => {
        const next = fn(prev);
        if (next === prev) return prev;
        const { state: withAchievements, newlyUnlocked } = syncAchievements(next, contentIndex);
        if (newlyUnlocked.length > 0) {
          // Defer so we never call setState-in-render on the toast provider.
          queueMicrotask(() => {
            for (const a of newlyUnlocked) {
              toast.show({ tone: 'achievement', title: 'Achievement unlocked', message: a.title, icon: a.icon });
            }
          });
        }
        return withAchievements;
      });
    },
    [toast],
  );

  const actions = useMemo(
    () => ({
      visitLesson: (id) => apply((s) => visitLesson(s, id)),
      completeLesson: (lesson) => apply((s) => completeLesson(s, lesson)),
      recordExercise: (exercise, result) => apply((s) => recordExerciseAttempt(s, exercise, result)),
      recordQuiz: (quiz, result) => apply((s) => recordQuizAttempt(s, quiz, result)),
      recordChallenge: (challenge, result) => apply((s) => recordChallengeAttempt(s, challenge, result)),
      toggleMilestone: (project, milestoneId) => apply((s) => toggleProjectMilestone(s, project, milestoneId)),
      recordInterview: (question, result) => apply((s) => recordInterviewAnswer(s, question, result)),
      toggleBookmark: (kind, refId, meta) => apply((s) => toggleBookmark(s, kind, refId, meta)),
      updateSettings: (patch) => apply((s) => updateSettings(s, patch)),
      updateProfile: (patch) => apply((s) => updateProfile(s, patch)),
      savePlacement: (placement) => apply((s) => savePlacement(s, placement)),
      clearPlacement: () => apply((s) => clearPlacement(s)),
      markActive: () => apply((s) => recordActivityDay(s)),
      log: (entry) => apply((s) => logActivity(s, entry)),
      completeDailyChallenge: (dayKeyValue, challengeId) =>
        apply((s) => ({ ...s, dailyChallenge: { ...s.dailyChallenge, [dayKeyValue]: challengeId } })),
      resetProgress: () => {
        clearAll();
        setState(createInitialState());
      },
      /** Replace state wholesale — used by the settings import feature. */
      importState: (incoming) => setState(migrate(incoming)),
    }),
    [apply],
  );

  const value = useMemo(
    () => ({
      state,
      actions,
      syncStatus,
      streak: currentStreak(state),
      xp: state.xp.total,
      isGuest: !isAuthenticated,
    }),
    [state, actions, syncStatus, isAuthenticated],
  );

  return <UserStateContext.Provider value={value}>{children}</UserStateContext.Provider>;
}

/** Rough measure of "how much has been achieved", used only for the merge toast. */
function countProgress(s) {
  if (!s) return 0;
  return (
    Object.values(s.lessons ?? {}).filter((l) => l.completedAt).length +
    Object.values(s.exercises ?? {}).filter((e) => e.solved).length +
    Object.values(s.challenges ?? {}).filter((c) => c.solved).length +
    Object.keys(s.quizzes ?? {}).length
  );
}

export function useUserState() {
  const ctx = useContext(UserStateContext);
  if (!ctx) throw new Error('useUserState must be used inside UserStateProvider');
  return ctx;
}
