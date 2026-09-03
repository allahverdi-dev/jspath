import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import fs from 'node:fs';
import path from 'node:path';
import { accountDeletionReadiness, DELETION_STATE } from '../features/billing/accountDeletion.js';
import * as serverDeletion from '../../supabase/functions/_shared/account-deletion.js';
import { I18nProvider } from '../i18n/index.jsx';
import { DeleteAccountSection } from '../components/settings/DeleteAccountSection.jsx';
import { DELETE_ACCOUNT_RESULT } from '../services/supabase.js';
import { SUPPORTED_LOCALES } from '../i18n/core.js';
import en from '../i18n/locales/en.js';
import az from '../i18n/locales/az.js';
import ru from '../i18n/locales/ru.js';

/**
 * Account deletion.
 *
 * The expensive mistake here is not a broken button — it is deleting the JSPath
 * account of someone whose Gumroad subscription still renews, leaving a
 * recurring charge with nothing behind it. JSPath cannot cancel a Gumroad
 * subscription, so the only safe answer is to refuse and say why.
 *
 * The Edge Function is Deno and cannot be imported into vitest, so it is covered
 * two ways: its decision logic is the shared module below, driven exhaustively;
 * and its trust boundary is asserted against its source, which is what stops a
 * later edit from quietly trusting a client-supplied id.
 */

const dictionaries = { en, az, ru };
const FUNCTION_SOURCE = fs.readFileSync(
  path.resolve(process.cwd(), 'supabase/functions/delete-account/index.ts'),
  'utf8',
);

const sub = (status, overrides = {}) => ({
  plan: 'pro',
  status,
  current_period_end: '2030-01-01T00:00:00Z',
  last_verified_at: '2026-09-01T00:00:00Z',
  ...overrides,
});

/* ------------------------------------------------------------------ *
 * The rules, driven exhaustively
 * ------------------------------------------------------------------ */

describe('when deletion is safe', () => {
  it('allows a free account with no subscription at all', () => {
    expect(accountDeletionReadiness({ subscriptions: [] }))
      .toMatchObject({ state: DELETION_STATE.READY, blocked: false, requiresAcknowledgement: false });
    expect(accountDeletionReadiness({})).toMatchObject({ state: DELETION_STATE.READY, blocked: false });
  });

  it.each(['active', 'past_due'])('refuses while a %s subscription can still charge', (status) => {
    const readiness = accountDeletionReadiness({ subscriptions: [sub(status)] });
    expect(readiness.state).toBe(DELETION_STATE.ACTIVE_SUBSCRIPTION);
    expect(readiness.blocked).toBe(true);
  });

  it('allows a canceling subscription, but demands the forfeiture be acknowledged', () => {
    const readiness = accountDeletionReadiness({ subscriptions: [sub('canceling')] });
    expect(readiness.state).toBe(DELETION_STATE.FORFEITS_ACCESS);
    expect(readiness.blocked).toBe(false);
    expect(readiness.requiresAcknowledgement).toBe(true);
  });

  it('asks for no acknowledgement once a canceled subscription has actually expired', () => {
    // Nothing left to give up, so no warning is owed.
    const expired = sub('canceling', { current_period_end: '2026-01-01T00:00:00Z' });
    const readiness = accountDeletionReadiness({ subscriptions: [expired], now: new Date('2026-09-03') });
    expect(readiness.state).toBe(DELETION_STATE.READY);
    expect(readiness.requiresAcknowledgement).toBe(false);
  });

  it.each(['expired', 'refunded', 'revoked'])('allows deletion after a %s subscription', (status) => {
    expect(accountDeletionReadiness({ subscriptions: [sub(status)] }).state).toBe(DELETION_STATE.READY);
  });

  it.each([
    ['an unknown status', [{ status: 'trialing' }]],
    ['an empty status', [{ status: '' }]],
    ['a missing status', [{ plan: 'pro' }]],
    ['a null row', [null]],
    ['a non-array', 'active'],
  ])('fails closed on %s', (_label, subscriptions) => {
    const readiness = accountDeletionReadiness({ subscriptions });
    expect(readiness.state).toBe(DELETION_STATE.UNKNOWN_STATE);
    expect(readiness.blocked).toBe(true);
  });

  it('lets one recurring subscription block deletion even beside settled ones', () => {
    const readiness = accountDeletionReadiness({ subscriptions: [sub('expired'), sub('active')] });
    expect(readiness.state).toBe(DELETION_STATE.ACTIVE_SUBSCRIPTION);
  });

  it('is idempotent — the same input always gives the same answer', () => {
    const rows = [sub('canceling')];
    const first = accountDeletionReadiness({ subscriptions: rows, now: new Date('2026-09-03') });
    const second = accountDeletionReadiness({ subscriptions: rows, now: new Date('2026-09-03') });
    expect(second).toEqual(first);
    expect(rows).toEqual([sub('canceling')]); // and does not mutate its input
  });
});

describe('the browser and the server agree', () => {
  const matrix = [
    [], [sub('active')], [sub('past_due')], [sub('canceling')], [sub('expired')],
    [sub('refunded')], [sub('revoked')], [{ status: 'trialing' }], [null],
    [sub('canceling', { current_period_end: '2026-01-01T00:00:00Z' })],
    [sub('expired'), sub('active')],
  ];

  it.each(matrix.map((rows, index) => [index, rows]))('case %i decides identically', (_index, rows) => {
    const now = new Date('2026-09-03T00:00:00Z');
    expect(serverDeletion.accountDeletionReadiness({ subscriptions: rows, now }))
      .toEqual(accountDeletionReadiness({ subscriptions: rows, now }));
  });

  it('exposes the same states under the same names', () => {
    expect(serverDeletion.DELETION_STATE).toEqual(DELETION_STATE);
  });
});

/* ------------------------------------------------------------------ *
 * The Edge Function's trust boundary
 * ------------------------------------------------------------------ */

describe('the delete-account function', () => {
  it('derives the user from the verified token and never from the request', () => {
    expect(FUNCTION_SOURCE).toContain('userClient.auth.getUser()');
    expect(FUNCTION_SOURCE).toContain("if (userError || !user?.id)");
    // The only id ever used is the verified one.
    expect(FUNCTION_SOURCE).toMatch(/\.eq\('user_id', user\.id\)/);
    expect(FUNCTION_SOURCE).toContain('admin.auth.admin.deleteUser(user.id)');
    // Nothing reads an identity out of the body.
    expect(FUNCTION_SOURCE).not.toMatch(/body[?.]*\.(user_id|userId|id|email)\b/);
  });

  it('refuses without an Authorization header', () => {
    expect(FUNCTION_SOURCE).toContain("request.headers.get('authorization')");
    expect(FUNCTION_SOURCE).toMatch(/if \(!authorization\) return jsonResponse\(\{ ok: false, reason: 'unauthenticated' \}, \{ status: 401 \}\)/);
  });

  it('accepts only POST, and answers the preflight', () => {
    expect(FUNCTION_SOURCE).toMatch(/request\.method !== 'POST'/);
    expect(FUNCTION_SOURCE).toMatch(/request\.method === 'OPTIONS'/);
  });

  it('reads billing state with the service role rather than trusting RLS to hide it', () => {
    expect(FUNCTION_SOURCE).toContain('adminClient()');
    expect(FUNCTION_SOURCE).toMatch(/from\('subscriptions'\)/);
    // A failed lookup must not be read as "no subscriptions".
    expect(FUNCTION_SOURCE).toContain("reason: 'subscription_lookup_failed'");
  });

  it('blocks the unsafe states and requires the forfeiture acknowledgement', () => {
    expect(FUNCTION_SOURCE).toContain('DELETION_STATE.ACTIVE_SUBSCRIPTION');
    expect(FUNCTION_SOURCE).toContain('DELETION_STATE.UNKNOWN_STATE');
    expect(FUNCTION_SOURCE).toContain('readiness.requiresAcknowledgement && !acknowledgedForfeit');
    // The acknowledgement is an exact true, not anything truthy.
    expect(FUNCTION_SOURCE).toContain("body?.acknowledgeForfeit === true");
  });

  it('never programmatically cancels a Gumroad subscription', () => {
    // The comments explain why it must not; the code must not do it.
    const code = FUNCTION_SOURCE.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
    expect(code).not.toMatch(/gumroad/i);
    expect(code).not.toMatch(/verifiedSubscriber|salesForEmail|api\.gumroad\.com/);
  });

  it('keeps the service-role key server-side and out of the browser bundle', () => {
    // It is read only through the shared admin client, from a non-VITE_ variable.
    expect(FUNCTION_SOURCE).not.toContain('SERVICE_ROLE');
    const shared = fs.readFileSync(path.resolve(process.cwd(), 'supabase/functions/_shared/billing-server.ts'), 'utf8');
    expect(shared).toContain("Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')");
    expect(shared).not.toContain('VITE_');

    const clientFiles = [];
    (function walk(dir) {
      for (const entry of fs.readdirSync(dir)) {
        const full = path.join(dir, entry);
        if (fs.statSync(full).isDirectory()) walk(full);
        // Tests name the variable in order to assert its absence; ship code must not.
        else if (/\.jsx?$/.test(entry) && !/\.test\./.test(entry)) {
          clientFiles.push(fs.readFileSync(full, 'utf8'));
        }
      }
    })(path.resolve(process.cwd(), 'src'));
    for (const source of clientFiles) {
      expect(source).not.toContain('SUPABASE_SERVICE_ROLE_KEY');
      expect(source).not.toMatch(/service_role/);
    }
  });

  it('verifies the cascade actually removed the learner rows', () => {
    expect(FUNCTION_SOURCE).toMatch(/from\('user_progress'\)[\s\S]{0,120}\.eq\('user_id', user\.id\)/);
    expect(FUNCTION_SOURCE).toContain('residual');
  });

  it('leaves the pseudonymous billing-event ledger alone, deliberately', () => {
    // It carries no user reference, and dropping it would weaken webhook
    // idempotency without removing anything identifying.
    expect(FUNCTION_SOURCE).not.toMatch(/from\('billing_events'\)/);
    expect(FUNCTION_SOURCE).toMatch(/billing_events[\s\S]{0,400}idempotency/i);
    const migration = fs.readFileSync(
      path.resolve(process.cwd(), 'supabase/migrations/202608300001_billing_subscriptions.sql'), 'utf8',
    );
    const table = migration.slice(migration.indexOf('create table if not exists public.billing_events'));
    expect(table.slice(0, table.indexOf(');'))).not.toContain('user_id');
  });

  it('relies on a cascade the schema actually declares', () => {
    for (const file of ['202609020001_user_progress.sql', '202608300001_billing_subscriptions.sql']) {
      const sql = fs.readFileSync(path.resolve(process.cwd(), 'supabase/migrations', file), 'utf8');
      expect(sql, file).toMatch(/references auth\.users\(id\) on delete cascade/);
    }
  });
});

/* ------------------------------------------------------------------ *
 * The Danger Zone
 * ------------------------------------------------------------------ */

const mocks = vi.hoisted(() => ({
  auth: {},
  entitlements: {},
  userState: {},
  toast: { show: vi.fn() },
  navigate: vi.fn(),
  locale: 'en',
}));

vi.mock('../state/AuthProvider.jsx', () => ({ useAuth: () => mocks.auth }));
vi.mock('../state/EntitlementProvider.jsx', () => ({ useEntitlements: () => mocks.entitlements }));
vi.mock('../state/ToastProvider.jsx', () => ({ useToast: () => mocks.toast }));
vi.mock('../state/UserStateProvider.jsx', () => ({
  useUserState: () => ({ state: { settings: { locale: mocks.locale } }, actions: mocks.userState }),
}));
vi.mock('react-router-dom', async () => ({
  ...(await vi.importActual('react-router-dom')),
  useNavigate: () => mocks.navigate,
}));

const renderZone = (locale = 'en') => {
  mocks.locale = locale;
  return render(
    <MemoryRouter>
      <I18nProvider><DeleteAccountSection /></I18nProvider>
    </MemoryRouter>,
  );
};

const openDialog = async (user) => {
  await user.click(screen.getAllByRole('button', { name: en.settings.deleteAccount })[0]);
  return screen.getByRole('dialog');
};

beforeEach(() => {
  mocks.auth = {
    isAuthenticated: true,
    deleteAccount: vi.fn().mockResolvedValue({ result: DELETE_ACCOUNT_RESULT.OK }),
  };
  mocks.entitlements = { subscriptions: [] };
  mocks.userState = { resetProgress: vi.fn(), updateSettings: vi.fn() };
  mocks.toast = { show: vi.fn() };
  mocks.navigate = vi.fn();
  mocks.locale = 'en';
});

describe('the Danger Zone', () => {
  it('is hidden from a guest, who has no account to delete', () => {
    mocks.auth = { isAuthenticated: false, deleteAccount: vi.fn() };
    const { container } = renderZone();
    expect(container).toBeEmptyDOMElement();
    expect(mocks.auth.deleteAccount).not.toHaveBeenCalled();
  });

  it('appears for a signed-in learner', () => {
    renderZone();
    expect(screen.getByText(en.settings.dangerZone)).toBeInTheDocument();
  });

  it('will not delete until the confirmation word is typed', async () => {
    const user = userEvent.setup();
    renderZone();
    const dialog = await openDialog(user);

    const confirm = within(dialog).getByRole('button', { name: en.settings.deletePermanently });
    expect(confirm).toBeDisabled();

    await user.type(within(dialog).getByRole('textbox'), 'delete my account');
    expect(confirm).toBeDisabled();
    expect(mocks.auth.deleteAccount).not.toHaveBeenCalled();
  });

  it('deletes once the word matches, ignoring case and stray spaces', async () => {
    const user = userEvent.setup();
    renderZone();
    const dialog = await openDialog(user);
    await user.type(within(dialog).getByRole('textbox'), '  delete  ');
    await user.click(within(dialog).getByRole('button', { name: en.settings.deletePermanently }));
    await waitFor(() => expect(mocks.auth.deleteAccount).toHaveBeenCalledTimes(1));
  });

  it('explains what will happen before anything is typed', async () => {
    const user = userEvent.setup();
    renderZone();
    const dialog = await openDialog(user);
    for (const key of ['deleteEffectPermanent', 'deleteEffectProgress', 'deleteEffectLocal',
      'deleteEffectProviders', 'deleteEffectGumroad']) {
      expect(within(dialog).getByText(en.settings[key])).toBeInTheDocument();
    }
  });

  it('sends learners with a live subscription to Gumroad instead of deleting', async () => {
    mocks.entitlements = { subscriptions: [sub('active')] };
    const user = userEvent.setup();
    renderZone();
    const dialog = await openDialog(user);

    expect(within(dialog).getByText(en.settings.deleteBlockedTitle)).toBeInTheDocument();
    expect(within(dialog).getByRole('link', { name: en.billing.managePlan }))
      .toHaveAttribute('href', 'https://gumroad.com/library');
    // No way to delete from here at all.
    expect(within(dialog).queryByRole('button', { name: en.settings.deletePermanently })).not.toBeInTheDocument();
    expect(within(dialog).queryByRole('textbox')).not.toBeInTheDocument();
  });

  it('warns a canceling learner that remaining paid access is forfeited', async () => {
    mocks.entitlements = { subscriptions: [sub('canceling')] };
    const user = userEvent.setup();
    renderZone();
    const dialog = await openDialog(user);

    expect(within(dialog).getByText(en.settings.deleteForfeitTitle)).toBeInTheDocument();
    await user.type(within(dialog).getByRole('textbox'), 'DELETE');
    await user.click(within(dialog).getByRole('button', { name: en.settings.deletePermanently }));

    await waitFor(() => expect(mocks.auth.deleteAccount).toHaveBeenCalled());
    // And the request carries the acknowledgement the server demands.
    expect(mocks.auth.deleteAccount.mock.calls[0][0]).toEqual({ acknowledgeForfeit: true });
  });

  it('does not acknowledge a forfeiture that is not happening', async () => {
    const user = userEvent.setup();
    renderZone();
    const dialog = await openDialog(user);
    await user.type(within(dialog).getByRole('textbox'), 'DELETE');
    await user.click(within(dialog).getByRole('button', { name: en.settings.deletePermanently }));
    await waitFor(() => expect(mocks.auth.deleteAccount).toHaveBeenCalled());
    expect(mocks.auth.deleteAccount.mock.calls[0][0]).toEqual({ acknowledgeForfeit: false });
  });

  it('blocks a second submission while the first is in flight', async () => {
    let release;
    mocks.auth.deleteAccount = vi.fn(() => new Promise((resolve) => { release = resolve; }));
    const user = userEvent.setup();
    renderZone();
    const dialog = await openDialog(user);
    await user.type(within(dialog).getByRole('textbox'), 'DELETE');

    const confirm = within(dialog).getByRole('button', { name: en.settings.deletePermanently });
    await user.click(confirm);
    await waitFor(() => expect(screen.getByRole('button', { name: en.settings.deleting })).toBeDisabled());
    await user.click(screen.getByRole('button', { name: en.settings.deleting }));
    expect(mocks.auth.deleteAccount).toHaveBeenCalledTimes(1);

    release({ result: DELETE_ACCOUNT_RESULT.OK });
  });

  it('keeps the learner signed in and their data intact when the server fails', async () => {
    mocks.auth.deleteAccount = vi.fn().mockResolvedValue({ result: DELETE_ACCOUNT_RESULT.FAILED });
    const user = userEvent.setup();
    renderZone();
    const dialog = await openDialog(user);
    await user.type(within(dialog).getByRole('textbox'), 'DELETE');
    await user.click(within(dialog).getByRole('button', { name: en.settings.deletePermanently }));

    expect(await screen.findByRole('alert')).toHaveTextContent(en.settings.deleteErrorFailed);
    // Nothing was cleared and nobody was sent anywhere.
    expect(mocks.userState.resetProgress).not.toHaveBeenCalled();
    expect(mocks.navigate).not.toHaveBeenCalled();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it.each([
    [DELETE_ACCOUNT_RESULT.UNAUTHENTICATED, 'deleteErrorSignedOut'],
    [DELETE_ACCOUNT_RESULT.ACTIVE_SUBSCRIPTION, 'deleteBlockedBody'],
    [DELETE_ACCOUNT_RESULT.UNKNOWN_SUBSCRIPTION_STATE, 'deleteUnknownStateBody'],
    [DELETE_ACCOUNT_RESULT.FORFEIT_NOT_ACKNOWLEDGED, 'deleteForfeitBody'],
    [DELETE_ACCOUNT_RESULT.UNAVAILABLE, 'deleteErrorUnavailable'],
  ])('explains a %s refusal without clearing anything', async (result, key) => {
    mocks.auth.deleteAccount = vi.fn().mockResolvedValue({ result });
    const user = userEvent.setup();
    renderZone();
    const dialog = await openDialog(user);
    await user.type(within(dialog).getByRole('textbox'), 'DELETE');
    await user.click(within(dialog).getByRole('button', { name: en.settings.deletePermanently }));

    expect(await screen.findByRole('alert')).toHaveTextContent(en.settings[key]);
    expect(mocks.userState.resetProgress).not.toHaveBeenCalled();
    expect(mocks.navigate).not.toHaveBeenCalled();
  });

  it('clears local state and returns to a public route on success', async () => {
    const user = userEvent.setup();
    renderZone();
    const dialog = await openDialog(user);
    await user.type(within(dialog).getByRole('textbox'), 'DELETE');
    await user.click(within(dialog).getByRole('button', { name: en.settings.deletePermanently }));

    await waitFor(() => expect(mocks.navigate).toHaveBeenCalledWith('/', { replace: true }));
    expect(mocks.toast.show).toHaveBeenCalledWith({ tone: 'info', titleKey: 'settings.deleteDone' });
    // The local learning document is dropped through the callback the provider runs.
    const [, onDeleted] = mocks.auth.deleteAccount.mock.calls[0];
    onDeleted();
    expect(mocks.userState.resetProgress).toHaveBeenCalled();
  });

  it('can be dismissed without deleting anything', async () => {
    const user = userEvent.setup();
    renderZone();
    const dialog = await openDialog(user);
    await user.click(within(dialog).getByRole('button', { name: en.common.cancel }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(mocks.auth.deleteAccount).not.toHaveBeenCalled();
  });

  it('forgets what was typed after being dismissed', async () => {
    const user = userEvent.setup();
    renderZone();
    let dialog = await openDialog(user);
    await user.type(within(dialog).getByRole('textbox'), 'DELETE');
    await user.click(within(dialog).getByRole('button', { name: en.common.cancel }));

    dialog = await openDialog(user);
    expect(within(dialog).getByRole('textbox')).toHaveValue('');
    expect(within(dialog).getByRole('button', { name: en.settings.deletePermanently })).toBeDisabled();
  });

  it('opens with focus aimed at the confirmation field', async () => {
    const user = userEvent.setup();
    renderZone();
    const dialog = await openDialog(user);
    // The shared modal hook focuses [data-autofocus] on open.
    expect(within(dialog).getByRole('textbox')).toHaveAttribute('data-autofocus');
  });

  it('names the dialog for assistive technology', async () => {
    const user = userEvent.setup();
    renderZone();
    const dialog = await openDialog(user);
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAccessibleName(en.settings.deleteAccount);
    expect(within(dialog).getByText(en.settings.deleteDialogLead)).toBeInTheDocument();
  });
});

/* ------------------------------------------------------------------ *
 * All three languages
 * ------------------------------------------------------------------ */

describe('the deletion flow speaks every language', () => {
  it.each(SUPPORTED_LOCALES)('%s labels the danger zone and the destructive action', (locale) => {
    renderZone(locale);
    expect(screen.getByText(dictionaries[locale].settings.dangerZone)).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: dictionaries[locale].settings.deleteAccount }).length)
      .toBeGreaterThan(0);
  });

  it.each(SUPPORTED_LOCALES)('%s confirms with a word from its own language', async (locale) => {
    const user = userEvent.setup();
    renderZone(locale);
    const word = dictionaries[locale].settings.deleteConfirmWord;
    await user.click(screen.getAllByRole('button', { name: dictionaries[locale].settings.deleteAccount })[0]);
    const dialog = screen.getByRole('dialog');

    const confirm = within(dialog).getByRole('button', { name: dictionaries[locale].settings.deletePermanently });
    expect(confirm).toBeDisabled();
    await user.type(within(dialog).getByRole('textbox'), word);
    await waitFor(() => expect(confirm).toBeEnabled());
  });

  it.each(SUPPORTED_LOCALES)('%s reports a failure in its own language', async (locale) => {
    mocks.auth.deleteAccount = vi.fn().mockResolvedValue({ result: DELETE_ACCOUNT_RESULT.FAILED });
    const user = userEvent.setup();
    renderZone(locale);
    await user.click(screen.getAllByRole('button', { name: dictionaries[locale].settings.deleteAccount })[0]);
    const dialog = screen.getByRole('dialog');
    await user.type(within(dialog).getByRole('textbox'), dictionaries[locale].settings.deleteConfirmWord);
    await user.click(within(dialog).getByRole('button', { name: dictionaries[locale].settings.deletePermanently }));

    expect(await screen.findByRole('alert')).toHaveTextContent(dictionaries[locale].settings.deleteErrorFailed);
  });

  it('gives every locale a distinct confirmation word', () => {
    const words = SUPPORTED_LOCALES.map((locale) => dictionaries[locale].settings.deleteConfirmWord);
    expect(new Set(words).size).toBe(words.length);
    for (const word of words) expect(word).toBe(word.toLocaleUpperCase());
  });
});
