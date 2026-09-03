/**
 * The facts the legal documents are allowed to state.
 *
 * Every value here is either read from something the repository already proves,
 * or it is `null` because nobody has decided it yet. Nothing in `src/legal/`
 * may assert a fact that is not in this file, and a section whose required
 * facts are `null` is omitted from the rendered document rather than published
 * with a placeholder — see `documents.js`.
 *
 * The identity below is the one the project deliberately publishes in `LICENSE`,
 * `SECURITY.md` and `CONTRIBUTING.md`. It is not inferred from git metadata,
 * commit authorship or a developer machine, and no such source may ever be used
 * to fill anything in here.
 *
 * To publish the policies, fill in the `REQUIRED_DECISIONS` values below. Until
 * every one of them is set, `LEGAL_PUBLISHABLE` is false and the pages say so.
 */

/* ------------------------------------------------------------------ *
 * Established facts
 * ------------------------------------------------------------------ */

export const OPERATOR = Object.freeze({
  /** An individual, not a company. `LICENSE`, `SECURITY.md`. */
  name: 'Allahverdi Həsənov',
  kind: 'individual',
  /**
   * The only contact channel the project currently publishes. It is a code
   * collaboration channel, which is why it does not by itself satisfy
   * `REQUIRED_DECISIONS.contact` — a learner who signed in with Google has no
   * reason to hold a GitHub account.
   */
  githubUrl: 'https://github.com/allahverdi-dev',
  githubHandle: '@allahverdi-dev',
  copyrightYear: 2026,
});

export const SERVICE = Object.freeze({
  name: 'JSPath',
  url: 'https://jspath.vercel.app',
  repositoryUrl: 'https://github.com/allahverdi-dev/jspath',
});

/** Verified in `src/services/supabase.js` — this set is closed. */
export const AUTH_PROVIDERS = Object.freeze(['Google', 'GitHub']);

/** Verified in `.env.example`, `supabase/migrations`, `supabase/functions`. */
export const BILLING = Object.freeze({
  /** The merchant of record for a JSPath Pro purchase. */
  provider: 'Gumroad',
  manageUrl: 'https://gumroad.com/library',
  /** `plans.js` sets `price: null`: prices live at Gumroad, never in this app. */
  intervals: Object.freeze(['monthly', 'annual']),
});

/**
 * The date the current text of every document took its present form. One
 * canonical value, formatted per locale by the page — never three hand-written
 * dates that can disagree with each other.
 */
export const LAST_UPDATED = '2026-09-03';

/* ------------------------------------------------------------------ *
 * Decisions the product owner has made
 * ------------------------------------------------------------------ */

/**
 * Facts a responsible policy needs that no line of code could establish.
 *
 * Each of these was, at one point, `null` — and while any of them was, every
 * section depending on it was dropped from the rendered page rather than filled
 * with a plausible guess. They now hold the values the product owner decided.
 *
 * The structure is kept exactly as it was. `LEGAL_PUBLISHABLE` is still
 * *computed* from these entries rather than asserted, so removing or emptying
 * any one of them puts the legal layer back into its withholding state instead
 * of quietly publishing a policy with a hole in it.
 *
 * `topicKey` names the localized label used to tell readers, on the page
 * itself, which topics are not yet settled.
 */
export const REQUIRED_DECISIONS = Object.freeze({
  /**
   * A contact channel every learner can use, whichever provider they signed in
   * with. This is the address published in the policies and the one privacy,
   * refund and deletion questions are routed to.
   */
  contact: { value: 'jspath.edu@gmail.com', topicKey: 'legal.decisionContact' },

  /**
   * Refund rules. The window applies to an initial eligible purchase and is
   * counted in calendar days. Renewals are deliberately not covered by it —
   * see `renewalsRefundable` — and mandatory consumer rights sit above all of
   * this regardless.
   */
  refund: {
    value: { windowDays: 10, windowUnit: 'calendar', renewalsRefundable: false },
    topicKey: 'legal.decisionRefund',
  },

  /** The law the Terms are governed by, and where disputes are heard. */
  governingLaw: {
    value: { law: 'Republic of Azerbaijan', venue: 'Republic of Azerbaijan' },
    topicKey: 'legal.decisionGoverningLaw',
  },

  /**
   * How a learner deletes their account. This is a real product feature, not a
   * request address: Settings → Danger zone runs the `delete-account` Edge
   * Function, which removes the account server-side. See `docs/LEGAL.md`.
   */
  accountDeletion: { value: { method: 'settings', route: '/settings' }, topicKey: 'legal.decisionDeletion' },

  /** The minimum age for using JSPath. JSPath does not verify age. */
  minimumAge: { value: 16, topicKey: 'legal.decisionMinimumAge' },
});

/**
 * The values the policy prose may interpolate.
 *
 * Locale files translate sentences and never restate a fact, so a number or an
 * address exists in exactly one place and cannot drift between languages. A
 * block's text carries `{token}` and the renderer substitutes from here.
 */
export const LEGAL_FACTS = Object.freeze({
  operator: OPERATOR.name,
  service: SERVICE.name,
  email: REQUIRED_DECISIONS.contact.value,
  refundDays: REQUIRED_DECISIONS.refund.value.windowDays,
  minimumAge: REQUIRED_DECISIONS.minimumAge.value,
  governingLaw: REQUIRED_DECISIONS.governingLaw.value.law,
  disputeVenue: REQUIRED_DECISIONS.governingLaw.value.venue,
  billingProvider: BILLING.provider,
});

/** True only once every decision above has been made. Computed, never asserted. */
export const LEGAL_PUBLISHABLE = Object.values(REQUIRED_DECISIONS)
  .every((decision) => decision.value !== null && decision.value !== undefined);

/** `topicKey`s for the decisions still outstanding, for the on-page notice. */
export function pendingDecisionKeys() {
  return Object.values(REQUIRED_DECISIONS)
    .filter((decision) => decision.value === null || decision.value === undefined)
    .map((decision) => decision.topicKey);
}

/** A section may render only when every fact it depends on exists. */
export function hasFacts(required = []) {
  return required.every((name) => REQUIRED_DECISIONS[name]?.value != null);
}

/** Replace `{token}` with the corresponding fact. Unknown tokens are left alone. */
export function applyFacts(text) {
  if (typeof text !== 'string') return text;
  return text.replace(/\{(\w+)\}/g, (match, token) => (
    Object.prototype.hasOwnProperty.call(LEGAL_FACTS, token) ? String(LEGAL_FACTS[token]) : match
  ));
}
