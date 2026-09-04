# Legal layer

Three policy pages, a shared footer, and one rule that matters more than the
rest: **nothing in a JSPath policy may state a fact the repository cannot
prove.**

| Route | Document | Source |
| --- | --- | --- |
| `/terms` | Terms of Service | `src/legal/{en,az,ru}.js` → `terms` |
| `/privacy` | Privacy Policy | `src/legal/{en,az,ru}.js` → `privacy` |
| `/refund-policy` | Refund Policy | `src/legal/{en,az,ru}.js` → `refund` |

Routes are locale-independent, like every other route in the app. The document
language follows the interface locale.

## How the files fit together

```
src/legal/
  config.js      every fact the documents are allowed to state
  documents.js   which sections exist, in what order, and what each depends on
  en.js          canonical prose
  az.js  ru.js   translations — same sections, same blocks, same meaning
src/pages/LegalDocument.jsx    one renderer for all three
src/components/layout/SiteFooter.jsx   the footer
src/components/layout/LegalLinks.jsx   compact link row for auth screens
```

`documents.js` owns the structure and the locale files own only prose. That is
what makes the three languages structurally identical by construction — a
translator can only fill in sections that already exist.

## Source of truth

`src/legal/config.js` is the only place a legally significant fact may live.
A value there is either read off something the repository proves, or it is a
decision the product owner made deliberately and recorded.

The operator identity is the one the project **deliberately publishes** in
`LICENSE`, `SECURITY.md` and `CONTRIBUTING.md`. It is never inferred from git
metadata, commit authorship, a developer machine or a `.env` file. Author email
in git history is not permission to publish contact information: a contact
channel becomes publishable when someone decides to publish it, and that
decision is recorded in `REQUIRED_DECISIONS`, not discovered.

## Facts are configured, never written into prose

`src/legal/config.js` holds every business fact. Locale files translate
sentences and carry `{token}` placeholders; `resolveDocument()` substitutes from
`LEGAL_FACTS` at render. A number or an address therefore exists in exactly one
place and cannot drift between languages — and `legal.test.jsx` fails if a
locale file hard-codes one.

Available tokens: `{operator}`, `{service}`, `{email}`, `{refundDays}`,
`{minimumAge}`, `{governingLaw}`, `{disputeVenue}`, `{billingProvider}`.

### The owner decisions

| Decision | Value |
| --- | --- |
| Operator | Allahverdi Həsənov, an individual — no company, no registration, no postal address |
| Contact | `jspath.edu@gmail.com` |
| Minimum age | 16, stated as a condition of use; JSPath does not verify age |
| Refund window | 10 **calendar** days, initial eligible purchase only |
| Renewals | Generally non-refundable; exceptional requests reviewed case by case, outcome not promised |
| Governing law | Laws of the Republic of Azerbaijan |
| Dispute venue | Competent courts of the Republic of Azerbaijan — no city or named court |
| Account deletion | A real feature: Settings → Danger zone |

Mandatory consumer rights sit above all of it, and every document says so.

### The withholding mechanism is still live

`LEGAL_PUBLISHABLE` is **computed** from `REQUIRED_DECISIONS`, never asserted.
Emptying any one value puts the layer straight back into its withholding state:
the sections that depend on it disappear from the page, and a localized notice
names the open topic again. That is deliberate, and a test proves it — do not
replace the computation with a literal `true`.

A section still declares what it needs:

```js
{ id: 'governing-law', requires: ['governingLaw'] },
```

`resolveDocument()` also drops any section that has its facts but no prose, so
deciding a fact before writing its wording cannot publish an empty heading.

## Updating the text

1. Edit `src/legal/en.js` first — it is canonical.
2. Mirror the change in `az.js` and `ru.js`. Same section, same block count,
   same block types, same number of list items. `legal.test.jsx` enforces all of
   that, and no language may make a promise the others do not.
3. Add or remove a section in `documents.js`, never only in a locale file.
4. Bump `LAST_UPDATED` in `config.js`. One canonical date, formatted per locale
   by the page — never three hand-written dates that can disagree.

Legal text is **not** authored learning content. It is product content in the
reader's language, so it must never be wrapped in `lang="en"` or passed through
`Authored` / `InlineMarkup`. It also stays out of `src/content/**`, which would
put it in the learning registry, the search index and the premium pipeline.

## Billing provider dependency

The policies name **Gumroad** as the seller of record, because that is what
`.env.example`, `supabase/migrations`, `supabase/functions` and
`features/billing/plans.js` implement. Prices are deliberately absent: `plans.js`
sets `price: null` and prices live at Gumroad.

`legal.test.jsx` fails if the copy names a provider the code does not integrate,
or stops naming the one it does. Changing provider therefore breaks the tests on
purpose.

## Where the footer renders

One `SiteFooter`, mounted in exactly two places:

- `AppShell`, after `<main>` and before the mobile tab bar
- `Landing`, which is the only public surface outside the shell

It is deliberately **absent** from `FocusLayout` — the lesson reader, interview
session and practice session are full-screen single-task surfaces where a
footer under the editor would be noise. Those are reached from inside the shell
and always lead back to it, Settings links to the Refund Policy, and the auth
screens carry `LegalLinks`, so the policies stay reachable from everywhere
without putting a footer inside a scrolling editor pane.

`AuthLayout` renders `LegalLinks` for Login and Sign Up. It is a link row and
nothing more: JSPath has no acceptance flow — no checkbox, no recorded consent —
so no screen claims the learner is agreeing to anything by continuing. Adding
that sentence would assert a consent mechanism the product does not implement.

## The contact address

`ContactEmail` renders the address in the Contact section of each policy. It is
three things at once, deliberately:

1. **plain selectable text** — the fallback that always works
2. **a `mailto:` link** — the fast path where a mail handler exists
3. **a Copy button** — for the machines where it does not

The third exists because of a real production finding: the `mailto:` markup is
correct, but on a browser with no mail protocol handler registered, clicking it
does nothing at all, which is indistinguishable from a broken link.

The clipboard is touched only inside the click handler — never on mount, and no
permission is requested up front. `navigator.clipboard` is absent in insecure
contexts and can reject, so a failure says "select and copy it manually" rather
than failing silently. No CSP change was needed for any of this.

Only the Contact sections carry the button. Elsewhere the address stays a plain
link, so the prose is not littered with controls.

## No cookie banner

JSPath sets no cookies, runs no analytics and has no tracking. A banner would be
consent theatre for something that does not happen, and the Privacy Policy says
so plainly. Do not add one unless a non-essential cookie or tracker is actually
introduced — at which point the policy needs rewriting anyway.

## Re-review checklist

Re-read all three policies when any of these changes:

- [ ] payment provider, or the merchant of record
- [ ] prices or the subscription model
- [ ] authentication providers
- [ ] any analytics, telemetry or tracking
- [ ] any cookie
- [ ] account deletion
- [ ] data retention
- [ ] hosting or backend processors
- [ ] what profile data is stored
- [ ] marketing email
- [ ] age requirements
- [ ] operator identity
- [ ] refund rules

`legal.test.jsx` catches several of these automatically. It cannot catch a new
processor or a new stored field, so those are on the reviewer.

## Account deletion

Settings → Danger zone → Delete account. A signed-in learner only; a guest has
no account, and their data is already entirely theirs.

The rules live in `src/features/billing/accountDeletion.js`, mirrored for Deno in
`supabase/functions/_shared/account-deletion.js` — the same arrangement as the
entitlement pair, with `delete-account.test.jsx` driving both over one matrix.
The browser copy only decides *what the learner is told*. The Edge Function
re-runs the same rules against rows the browser cannot influence and is the only
thing that authorises anything.

| Subscription state | Behaviour |
| --- | --- |
| none, `expired`, `refunded`, `revoked` | Deletion proceeds |
| `canceling`, paid period still running | Allowed, after an explicit warning that remaining paid access is forfeited and not refunded; the request must carry `acknowledgeForfeit` |
| `canceling`, period already over | Proceeds, no warning owed |
| `active`, `past_due` | **Refused.** The learner is sent to Gumroad to cancel first |
| anything else | **Refused.** Fails closed |

`active` and `past_due` are refused because JSPath cannot cancel a Gumroad
subscription — the integration is read-only about it — so deleting first would
leave a recurring charge with no account behind it. JSPath must never gain code
that cancels at Gumroad on the learner's behalf; a test asserts the function
contains none.

### Trust boundary

`supabase/functions/delete-account/index.ts`:

- requires an `Authorization` header and verifies it with `auth.getUser()`
- takes the user id **only** from the verified token; there is no `user_id`
  parameter to forge, and the body is read for one boolean
- reads subscription rows with the service role, so RLS is not what decides
- refuses on a lookup error rather than reading it as "no subscriptions"
- deletes exactly one account: `admin.auth.admin.deleteUser(user.id)`
- verifies the cascade ran and reports any residual rows

### What is deleted, and what is not

Removing the row from `auth.users` cascades — both tables declare
`on delete cascade`, and a test asserts that in the migrations:

| Table | On account deletion |
| --- | --- |
| `auth.users` | deleted |
| `public.user_progress` | cascaded — the whole learning document |
| `public.subscriptions` | cascaded — including `customer_email` |
| `public.billing_events` | **kept, deliberately** |

`billing_events` holds an event type, a provider reference and a SHA-256 of the
message. It has **no `user_id` column at all** — nothing joins it to a person —
and it exists so a replayed webhook is not processed twice. Deleting it would
weaken billing idempotency while removing nothing identifying. No retention
period is claimed for it, because none has been decided.

Outside JSPath's reach, and said so in the Privacy Policy: Gumroad keeps its own
purchase and payment records; Google and GitHub keep their own account records;
deleting a JSPath account is not a refund.

### Client teardown

Order matters, and it is the opposite of the obvious one. **Nothing local is
cleared until the server confirms the account is gone.** A failed deletion that
had already wiped the browser would leave a live account behind a signed-out,
empty-looking app. On success `AuthProvider.deleteAccount` drops the in-memory
premium cache first, signs out, clears the session, and only then resets the
local learning document — so resetting cannot trigger a sync write against an
account that no longer exists.

## What the tests guard

`src/tests/legal.test.jsx` — 79 tests over routing, the footer, all three
locales, document structure, and the facts:

- publishability is computed, not asserted, and reverts if a fact is removed
- no draft notice remains, and no placeholder survives interpolation
- the operator is an individual; no company, registration, VAT or address appears
- exactly one contact address exists, rendered as a `mailto:` link
- minimum age 16, with no claim that JSPath verifies it
- a 10 calendar-day window, never measured in business days
- renewals are not promised a refund, and no second window is created
- the laws and courts of the Republic of Azerbaijan, with no invented city, no
  arbitration clause and mandatory local protections preserved
- deletion is described as the real Settings feature, not an email request
- Gumroad is named and no abandoned provider is
- cancellation stays distinct from a refund and matches `entitlements.js`
- every business fact matches across en/az/ru, and no locale hard-codes one
- no compliance badge, no promise of perfect security

`src/tests/delete-account.test.jsx` — 66 tests over the deletion rules, the
browser/server parity matrix, the Edge Function's trust boundary, the Danger
Zone flow and all three languages.
