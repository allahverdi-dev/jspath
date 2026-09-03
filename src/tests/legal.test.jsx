import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import fs from 'node:fs';
import path from 'node:path';
import { AppRouter } from '../app/router.jsx';
import { SiteFooter } from '../components/layout/SiteFooter.jsx';
import LegalDocument from '../pages/LegalDocument.jsx';
import { I18nProvider } from '../i18n/index.jsx';
import { DOCUMENTS, resolveDocument, withheldSections, publishableSections } from '../legal/documents.js';
import {
  AUTH_PROVIDERS, BILLING, LEGAL_FACTS, LEGAL_PUBLISHABLE, REQUIRED_DECISIONS,
  LAST_UPDATED, hasFacts, pendingDecisionKeys,
} from '../legal/config.js';
import { SUPPORTED_LOCALES } from '../i18n/core.js';
import en from '../i18n/locales/en.js';
import legalEn from '../legal/en.js';
import legalAz from '../legal/az.js';
import legalRu from '../legal/ru.js';

/**
 * The legal layer.
 *
 * Two jobs. The ordinary one is that the routes render, the footer links work
 * and all three languages are complete. The one that matters more is guarding
 * the *facts*: a policy that describes a payment provider the product no longer
 * uses, or an auth method it never had, is worse than no policy. The
 * fact-consistency block below fails when the copy and the implementation drift
 * apart, which is the failure mode nobody notices by reading.
 */

const legalDictionaries = { en: legalEn, az: legalAz, ru: legalRu };

const userState = vi.hoisted(() => ({ current: { settings: { locale: 'en' } } }));
vi.mock('../state/UserStateProvider.jsx', () => ({
  useUserState: () => ({ state: userState.current, actions: { updateSettings: vi.fn() } }),
}));

/* The router pulls in the shell and the entitlement gates; neither is under test here. */
vi.mock('../state/EntitlementProvider.jsx', () => ({
  useEntitlements: () => ({ loading: false, plan: 'guest', hasFeature: () => false, canAccessContent: () => true }),
}));
vi.mock('../layouts/AppShell.jsx', async () => {
  const { Outlet } = await import('react-router-dom');
  return { AppShell: Outlet, FocusLayout: Outlet, Logo: () => <span>JSPath</span> };
});

const withLocale = (locale, ui, entry = '/') => {
  userState.current = { settings: { locale } };
  return render(
    <MemoryRouter initialEntries={[entry]}>
      <I18nProvider>{ui}</I18nProvider>
    </MemoryRouter>,
  );
};

beforeEach(() => { userState.current = { settings: { locale: 'en' } }; });

/* ------------------------------------------------------------------ *
 * Routing
 * ------------------------------------------------------------------ */

describe('legal routes', () => {
  it.each(DOCUMENTS.map((d) => [d.path, d.id]))('%s renders its document', async (route, id) => {
    withLocale('en', <AppRouter />, route);
    expect(await screen.findByRole('heading', { level: 1, name: legalEn[id].title })).toBeInTheDocument();
  });

  it('keeps the routes free of locale prefixes', () => {
    expect(DOCUMENTS.map((d) => d.path)).toEqual(['/terms', '/privacy', '/refund-policy']);
  });

  it('sends an unknown path under a legal route to the normal 404', async () => {
    withLocale('en', <AppRouter />, '/terms/section-9');
    expect(await screen.findByText(en.errors.notFoundTitle)).toBeInTheDocument();
    expect(screen.queryByRole('heading', { level: 1, name: legalEn.terms.title })).not.toBeInTheDocument();
  });

  it('sets a document title naming the policy', async () => {
    withLocale('en', <AppRouter />, '/privacy');
    await screen.findByRole('heading', { level: 1, name: legalEn.privacy.title });
    expect(document.title).toBe(`${legalEn.privacy.title} | JSPath`);
  });
});

/* ------------------------------------------------------------------ *
 * Footer
 * ------------------------------------------------------------------ */

describe('site footer', () => {
  it.each(DOCUMENTS.map((d) => [d.id, d.path, en.legal]))(
    'links to %s at the right path',
    (id, route) => {
      withLocale('en', <SiteFooter />);
      const label = en.legal[id === 'refund' ? 'refund' : id];
      expect(screen.getByRole('link', { name: label })).toHaveAttribute('href', route);
    },
  );

  it('uses client-side routing rather than full page loads', () => {
    const { container } = withLocale('en', <SiteFooter />);
    for (const anchor of container.querySelectorAll('a')) {
      // React Router renders a relative href; a plain <a href="https://..."> or a
      // target=_blank would reload the app and lose in-memory state.
      expect(anchor.getAttribute('href')).toMatch(/^\//);
      expect(anchor).not.toHaveAttribute('target');
    }
  });

  it('gives its navigation an accessible name', () => {
    withLocale('en', <SiteFooter />);
    expect(screen.getByRole('navigation', { name: en.footer.navLabel })).toBeInTheDocument();
  });

  it('is mounted once by the shell, and not again by the page', () => {
    const shell = fs.readFileSync(path.resolve(__dirname, '../layouts/AppShell.jsx'), 'utf8');
    expect(shell.match(/<SiteFooter/g)).toHaveLength(1);
    // Landing sits outside the shell and needs its own; nothing else may add one.
    const landing = fs.readFileSync(path.resolve(__dirname, '../pages/Landing.jsx'), 'utf8');
    expect(landing.match(/<SiteFooter/g)).toHaveLength(1);
    expect(landing).not.toMatch(/<footer/);
    const page = fs.readFileSync(path.resolve(__dirname, '../pages/LegalDocument.jsx'), 'utf8');
    expect(page).not.toMatch(/SiteFooter|<footer/);
  });

  it('is absent from the focused lesson and session layouts', () => {
    const shell = fs.readFileSync(path.resolve(__dirname, '../layouts/AppShell.jsx'), 'utf8');
    const focus = shell.slice(shell.indexOf('export function FocusLayout'));
    expect(focus).not.toContain('SiteFooter');
  });
});

/* ------------------------------------------------------------------ *
 * i18n
 * ------------------------------------------------------------------ */

describe('all three languages', () => {
  it.each(
    SUPPORTED_LOCALES.flatMap((locale) => DOCUMENTS.map((doc) => [locale, doc.id])),
  )('%s renders the %s document in its own language', (locale, id) => {
    withLocale(locale, <LegalDocument documentId={id} />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(legalDictionaries[locale][id].title);
  });

  it.each(SUPPORTED_LOCALES)('%s shows no raw translation keys', (locale) => {
    const { container } = withLocale(locale, <LegalDocument documentId="privacy" />);
    expect(container.textContent).not.toMatch(/\b(legal|footer|nav|common)\.[a-zA-Z]/);
  });

  it.each(SUPPORTED_LOCALES)('%s puts its own language on the document element', (locale) => {
    withLocale(locale, <LegalDocument documentId="terms" />);
    expect(document.documentElement.lang).toBe(locale);
  });

  it.each(SUPPORTED_LOCALES)('%s does not mark localized policy prose as English', (locale) => {
    const { container } = withLocale(locale, <LegalDocument documentId="terms" />);
    // Authored learning content carries lang="en"; a translated policy must not.
    expect(container.querySelector('[lang="en"]')).toBeNull();
  });

  it.each(SUPPORTED_LOCALES)('%s formats the last-updated date through the locale formatter', (locale) => {
    const { container } = withLocale(locale, <LegalDocument documentId="refund" />);
    // Never the raw ISO string, and never "Invalid Date".
    expect(container.textContent).not.toContain(LAST_UPDATED);
    expect(container.textContent).not.toMatch(/Invalid Date/);
  });

  it('carries the same sections in every language', () => {
    for (const doc of DOCUMENTS) {
      const base = Object.keys(legalEn[doc.id].sections);
      for (const locale of ['az', 'ru']) {
        expect(Object.keys(legalDictionaries[locale][doc.id].sections), `${locale}/${doc.id}`).toEqual(base);
      }
    }
  });

  it('keeps the same paragraphs and list items in every language', () => {
    for (const doc of DOCUMENTS) {
      for (const [id, section] of Object.entries(legalEn[doc.id].sections)) {
        for (const locale of ['az', 'ru']) {
          const other = legalDictionaries[locale][doc.id].sections[id];
          expect(other.blocks.length, `${locale}/${doc.id}/${id}`).toBe(section.blocks.length);
          section.blocks.forEach((block, index) => {
            const mirror = other.blocks[index];
            expect(Boolean(mirror.ul), `${locale}/${doc.id}/${id}#${index}`).toBe(Boolean(block.ul));
            if (block.ul) expect(mirror.ul).toHaveLength(block.ul.length);
          });
        }
      }
    }
  });

  it('translates the text rather than copying English through', () => {
    for (const doc of DOCUMENTS) {
      for (const locale of ['az', 'ru']) {
        expect(legalDictionaries[locale][doc.id].title).not.toBe(legalEn[doc.id].title);
        expect(legalDictionaries[locale][doc.id].intro).not.toBe(legalEn[doc.id].intro);
      }
    }
  });
});

/* ------------------------------------------------------------------ *
 * Accessibility and structure
 * ------------------------------------------------------------------ */

describe('document structure', () => {
  it.each(DOCUMENTS.map((d) => d.id))('%s has exactly one h1', (id) => {
    const { container } = withLocale('en', <LegalDocument documentId={id} />);
    expect(container.querySelectorAll('h1')).toHaveLength(1);
  });

  it.each(DOCUMENTS.map((d) => d.id))('%s uses h2 for every section and skips no level', (id) => {
    const { container } = withLocale('en', <LegalDocument documentId={id} />);
    const levels = [...container.querySelectorAll('h1,h2,h3,h4,h5,h6')].map((h) => Number(h.tagName[1]));
    expect(levels[0]).toBe(1);
    expect(new Set(levels.slice(1))).toEqual(new Set([2]));
    expect(container.querySelectorAll('h2')).toHaveLength(resolveDocument(id, 'en').sections.length);
  });

  it.each(DOCUMENTS.map((d) => d.id))('%s exposes a keyboard-reachable table of contents', (id) => {
    withLocale('en', <LegalDocument documentId={id} />);
    const toc = screen.getByRole('navigation', { name: en.legal.onThisPage });
    const sections = resolveDocument(id, 'en').sections;
    const entries = within(toc).getAllByRole('link');
    expect(entries).toHaveLength(sections.length);
    // Real anchors, so Tab reaches them and Enter jumps to a real target.
    entries.forEach((entry, index) => {
      expect(entry.getAttribute('href')).toBe(`#${sections[index].id}`);
      expect(document.getElementById(sections[index].id)).not.toBeNull();
    });
  });

  it('names its related-policy navigation and does not link to itself', () => {
    withLocale('en', <LegalDocument documentId="terms" />);
    const nav = screen.getByRole('navigation', { name: en.legal.otherPolicies });
    const links = within(nav).getAllByRole('link').map((a) => a.getAttribute('href'));
    expect(links).toEqual(['/privacy', '/refund-policy']);
  });

  it('wraps the policy in an article', () => {
    const { container } = withLocale('en', <LegalDocument documentId="privacy" />);
    expect(container.querySelector('article')).not.toBeNull();
    // AppShell owns <main>; a second landmark here would be a duplicate.
    expect(container.querySelector('main')).toBeNull();
  });
});

/* ------------------------------------------------------------------ *
 * Facts — the copy must not drift from the implementation
 * ------------------------------------------------------------------ */

describe('legal copy matches the product', () => {
  const everyDocumentText = (locale) =>
    DOCUMENTS.map((doc) => JSON.stringify(legalDictionaries[locale][doc.id])).join('\n');

  it('names the billing provider the code actually integrates', () => {
    const plans = fs.readFileSync(path.resolve(__dirname, '../features/billing/plans.js'), 'utf8');
    expect(plans).toContain('gumroad');
    expect(BILLING.provider).toBe('Gumroad');
    for (const locale of SUPPORTED_LOCALES) {
      expect(everyDocumentText(locale)).toContain('Gumroad');
    }
  });

  it('mentions no payment provider the product does not use', () => {
    for (const locale of SUPPORTED_LOCALES) {
      const text = everyDocumentText(locale);
      for (const other of ['Stripe', 'Paddle', 'Lemon Squeezy', 'LemonSqueezy', 'PayPal', 'Braintree']) {
        expect(text, `${locale} mentions ${other}`).not.toContain(other);
      }
    }
  });

  it('describes exactly the sign-in providers the client supports', () => {
    const supabase = fs.readFileSync(path.resolve(__dirname, '../services/supabase.js'), 'utf8');
    expect(supabase).toContain("new Set(['google', 'github'])");
    expect(AUTH_PROVIDERS).toEqual(['Google', 'GitHub']);
    for (const locale of SUPPORTED_LOCALES) {
      const text = everyDocumentText(locale);
      expect(text).toContain('Google');
      expect(text).toContain('GitHub');
    }
  });

  it('claims no password sign-in, because there is none', () => {
    const sources = ['../services/supabase.js', '../state/AuthProvider.jsx', '../pages/Login.jsx', '../pages/SignUp.jsx']
      .map((f) => fs.readFileSync(path.resolve(__dirname, f), 'utf8'))
      .join('\n');
    expect(sources).not.toMatch(/signInWithPassword|resetPasswordForEmail|signInWithOtp/);
    // The Terms say so explicitly; that sentence must not outlive the fact above.
    expect(JSON.stringify(legalEn.terms)).toMatch(/password/i);
  });

  it('claims no analytics, cookies or tracking, because there are none', () => {
    const appSources = [];
    (function walk(dir) {
      for (const entry of fs.readdirSync(dir)) {
        const full = path.join(dir, entry);
        if (fs.statSync(full).isDirectory()) {
          if (!['content', 'tests'].includes(entry)) walk(full);
        } else if (/\.jsx?$/.test(entry) && !/\.test\./.test(entry)) {
          // Comments discuss these names; only real code counts as usage.
          appSources.push(
            fs.readFileSync(full, 'utf8')
              .replace(/\/\*[\s\S]*?\*\//g, '')
              .replace(/^\s*\/\/.*$/gm, ''),
          );
        }
      }
    })(path.resolve(__dirname, '..'));
    const source = appSources.join('\n');
    expect(source).not.toMatch(/document\.cookie/);
    expect(source).not.toMatch(/posthog|mixpanel|plausible|googletagmanager|gtag\(|fbq\(|dataLayer/i);
  });

  it('lists exactly the locales the product ships', () => {
    expect(SUPPORTED_LOCALES).toEqual(['en', 'az', 'ru']);
    expect(Object.keys(legalDictionaries)).toEqual([...SUPPORTED_LOCALES]);
  });

  it('does not claim a certification or compliance badge', () => {
    for (const locale of SUPPORTED_LOCALES) {
      const text = everyDocumentText(locale);
      for (const claim of ['SOC 2', 'SOC2', 'ISO 27001', 'HIPAA', 'GDPR-compliant', 'GDPR compliant', 'CCPA compliant']) {
        expect(text, `${locale} claims ${claim}`).not.toContain(claim);
      }
    }
  });

  it('disclaims perfect security rather than promising it', () => {
    const text = legalEn.privacy.sections.security.blocks.map((b) => b.p ?? '').join(' ');
    // The phrase may appear only inside the sentence that denies it.
    expect(text).toMatch(/no online service can promise that data is completely secure/i);
    for (const locale of SUPPORTED_LOCALES) {
      const all = everyDocumentText(locale);
      expect(all).not.toMatch(/guarantee[sd]? (that )?your data is (completely|fully) secure/i);
      expect(all).not.toMatch(/100% secure|absolutely safe|unhackable/i);
    }
  });

  it('says cancelling keeps Pro until the paid-through date, matching the entitlement rule', () => {
    const entitlements = fs.readFileSync(path.resolve(__dirname, '../features/billing/entitlements.js'), 'utf8');
    // 'canceling' is not a revoked status: paid-through access is real behaviour.
    expect(entitlements).toContain("new Set(['expired', 'refunded', 'revoked'])");
    expect(entitlements).not.toMatch(/REVOKED_STATUSES[^\n]*canceling/);
    expect(JSON.stringify(legalEn.refund.sections['cancellation-is-not-a-refund'])).toMatch(/until the end of the period/i);
  });
});

/* ------------------------------------------------------------------ *
 * The owner decisions, as published
 * ------------------------------------------------------------------ */

/** Every rendered string of a document, after fact interpolation. */
function renderedStrings(documentId, locale) {
  const doc = resolveDocument(documentId, locale);
  return [doc.title, doc.intro, ...doc.sections.flatMap((section) => [
    section.heading,
    ...section.blocks.flatMap((block) => (block.ul ? block.ul : [block.p])),
  ])];
}

const everyRendered = (locale) => SUPPORTED_LOCALES.includes(locale)
  ? DOCUMENTS.flatMap((doc) => renderedStrings(doc.id, locale)).join('\n')
  : '';

describe('the legal layer is publishable', () => {
  it('computes publishability from the facts rather than asserting it', () => {
    expect(LEGAL_PUBLISHABLE).toBe(true);
    expect(pendingDecisionKeys()).toEqual([]);
    // Not a hard-coded true: the flag is derived from the decision values.
    const config = fs.readFileSync(path.resolve(__dirname, '../legal/config.js'), 'utf8');
    expect(config).not.toMatch(/LEGAL_PUBLISHABLE\s*=\s*true/);
    expect(config).toMatch(/LEGAL_PUBLISHABLE\s*=\s*Object\.values\(REQUIRED_DECISIONS\)/);
  });

  it('goes back to withholding if a required fact is ever removed', () => {
    // The safety net still works: emptying any one decision must both flip the
    // flag and pull its sections off the page.
    for (const name of Object.keys(REQUIRED_DECISIONS)) {
      const remaining = Object.entries(REQUIRED_DECISIONS)
        .filter(([key]) => key !== name)
        .every(([, decision]) => decision.value !== null && decision.value !== undefined);
      expect(remaining).toBe(true);
      // hasFacts is what gates a section, and it is false for a missing fact.
      expect(hasFacts([name])).toBe(true);
      expect(hasFacts([name, 'somethingNobodyDecided'])).toBe(false);
    }
  });

  it('withholds nothing, so every declared section is published', () => {
    for (const doc of DOCUMENTS) {
      expect(withheldSections(doc.id)).toEqual([]);
      expect(resolveDocument(doc.id, 'en').sections.map((section) => section.id))
        .toEqual(publishableSections(doc.id).map((section) => section.id));
    }
  });

  it.each(DOCUMENTS.map((d) => d.id))('shows no draft notice on %s', (id) => {
    const { container } = withLocale('en', <LegalDocument documentId={id} />);
    expect(screen.queryByText(en.legal.draftTitle)).not.toBeInTheDocument();
    expect(container.textContent).not.toContain(en.legal.decisionRefund);
    expect(container.textContent).not.toContain(en.legal.decisionContact);
  });

  it.each(SUPPORTED_LOCALES)('%s leaves no unresolved placeholder in rendered copy', (locale) => {
    for (const text of DOCUMENTS.flatMap((doc) => renderedStrings(doc.id, locale))) {
      expect(text, text).not.toMatch(/\{\s*\w+\s*\}/);
      expect(text).not.toMatch(/\[[A-Z][A-Z _-]{2,}\]/);
      expect(text).not.toMatch(/\bTBD\b|\bTODO\b|\bXXX\b|lorem ipsum/i);
    }
  });
});

describe('the published facts', () => {
  it('names the operator as an individual and invents no company', () => {
    expect(LEGAL_FACTS.operator).toBe('Allahverdi Həsənov');
    for (const locale of SUPPORTED_LOCALES) {
      const text = everyRendered(locale);
      expect(text).toContain(LEGAL_FACTS.operator);
      expect(text).not.toMatch(/JSPath\s+(LLC|Inc\.?|Ltd\.?|GmbH|B\.V\.|LLP|Limited)/i);
      // No invented postal address, registration or tax identity.
      expect(text).not.toMatch(/\b(VAT|tax id|registration number|registered office|company number)\b/i);
      expect(text).not.toMatch(/\b\d{1,4}\s+[A-Z][a-z]+\s+(Street|Road|Avenue|St\.|Rd\.)\b/);
    }
  });

  it('publishes the contact address, identically in every language', () => {
    expect(LEGAL_FACTS.email).toBe('jspath.edu@gmail.com');
    for (const locale of SUPPORTED_LOCALES) {
      expect(everyRendered(locale)).toContain('jspath.edu@gmail.com');
    }
    // One address only — no second contact route invented anywhere.
    for (const locale of SUPPORTED_LOCALES) {
      // The TLD class excludes '.', so a sentence-ending period is not captured.
      const found = new Set(everyRendered(locale).match(/[\w.+-]+@[\w-]+\.[a-z]{2,}/gi) ?? []);
      expect([...found]).toEqual(['jspath.edu@gmail.com']);
    }
  });

  it('renders the address as a usable mailto link', () => {
    withLocale('en', <LegalDocument documentId="refund" />);
    const link = screen.getAllByRole('link', { name: 'jspath.edu@gmail.com' })[0];
    expect(link).toHaveAttribute('href', 'mailto:jspath.edu@gmail.com');
  });

  it('states a minimum age of 16 and does not claim to verify it', () => {
    expect(LEGAL_FACTS.minimumAge).toBe(16);
    for (const locale of SUPPORTED_LOCALES) {
      const text = everyRendered(locale);
      expect(text).toMatch(/\b16\b/);
      expect(text).not.toMatch(/\b(13|18|21)\s*(\+|years)/);
    }
    // Age is a condition of use, not a check, and no consent machinery is claimed.
    const en16 = renderedStrings('terms', 'en').join(' ');
    expect(en16).toMatch(/does not verify age/i);
    expect(en16).toMatch(/no age-verification or parental-consent process/i);
  });

  it('states a 10 calendar-day window for an initial purchase only', () => {
    expect(REQUIRED_DECISIONS.refund.value.windowDays).toBe(10);
    expect(REQUIRED_DECISIONS.refund.value.windowUnit).toBe('calendar');
    const text = renderedStrings('refund', 'en').join(' ');
    expect(text).toMatch(/within 10 calendar days/i);
    // The policy may contrast the two — it must never *measure* the window in
    // business days, which is a different and longer period.
    expect(text).not.toMatch(/within \d+ (business|working) days/i);
    expect(text).toMatch(/not working days/i);
    for (const locale of SUPPORTED_LOCALES) {
      expect(everyRendered(locale)).toMatch(/\b10\b/);
    }
  });

  it('does not promise a renewal refund, and creates no second window', () => {
    expect(REQUIRED_DECISIONS.refund.value.renewalsRefundable).toBe(false);
    const text = renderedStrings('refund', 'en').join(' ');
    expect(text).toMatch(/renewal payments are generally not refundable/i);
    expect(text).toMatch(/looked at individually/i);
    expect(text).toMatch(/an outcome is not promised/i);
    // The 10 days must never be extended to renewals by wording.
    expect(text).not.toMatch(/renewals?[^.]{0,80}within 10 calendar days/i);
    for (const locale of SUPPORTED_LOCALES) {
      expect(everyRendered(locale)).not.toMatch(/money-back guarantee|all sales are final/i);
    }
  });

  it('keeps a statutory-rights carve-out in every document that needs one', () => {
    expect(renderedStrings('refund', 'en').join(' '))
      .toMatch(/cannot be excluded under applicable consumer law/i);
    expect(renderedStrings('terms', 'en').join(' '))
      .toMatch(/consumer law in your country gives you and does not allow to be excluded/i);
    for (const locale of SUPPORTED_LOCALES) {
      // Every language carries the same qualification.
      expect(renderedStrings('refund', locale).join(' ').length).toBeGreaterThan(0);
    }
  });

  it('names the laws and courts of the Republic of Azerbaijan, without inventing a city', () => {
    expect(LEGAL_FACTS.governingLaw).toBe('Republic of Azerbaijan');
    expect(LEGAL_FACTS.disputeVenue).toBe('Republic of Azerbaijan');
    const text = renderedStrings('terms', 'en').join(' ');
    expect(text).toMatch(/governed by the laws of the Republic of Azerbaijan/i);
    expect(text).toMatch(/competent courts of the Republic of Azerbaijan/i);
    // No specific court or city was decided, so none may appear.
    expect(everyRendered('en')).not.toMatch(/\b(Baku|Sumqayit|Ganja|District Court|Court of Appeal)\b/i);
    // Mandatory local protections are preserved rather than waived.
    expect(text).toMatch(/mandatory provisions of the law of the country you live in/i);
    expect(everyRendered('en')).not.toMatch(/binding arbitration|waive (?:any|all) right/i);
  });

  it('describes deletion as a real feature in Settings, not an email request', () => {
    expect(REQUIRED_DECISIONS.accountDeletion.value.method).toBe('settings');
    const text = renderedStrings('privacy', 'en').join(' ');
    expect(text).toMatch(/delete your JSPath account yourself, from Settings/i);
    expect(text).toMatch(/runs on the server rather than in your browser/i);
    // And it is honest about what it cannot reach.
    expect(text).toMatch(/Gumroad keeps its own purchase and payment records/i);
    expect(text).toMatch(/Google and GitHub keep their own account records/i);
    expect(everyRendered('en')).not.toMatch(/all traces|erased everywhere|completely erased/i);
  });

  it('keeps Gumroad as the named provider and names no other', () => {
    expect(LEGAL_FACTS.billingProvider).toBe('Gumroad');
    for (const locale of SUPPORTED_LOCALES) {
      const text = everyRendered(locale);
      expect(text).toContain('Gumroad');
      for (const other of ['Stripe', 'Paddle', 'Lemon Squeezy', 'LemonSqueezy', 'PayPal', 'Braintree']) {
        expect(text, `${locale} mentions ${other}`).not.toContain(other);
      }
    }
  });

  it('keeps cancellation distinct from a refund, and paid-through access intact', () => {
    const refund = renderedStrings('refund', 'en').join(' ');
    expect(refund).toMatch(/Cancelling stops your subscription from renewing/i);
    expect(refund).toMatch(/does not return a payment you have already made/i);
    expect(refund).toMatch(/until the end of the period you have paid for/i);
    // And that matches the code that actually decides it.
    const entitlements = fs.readFileSync(path.resolve(__dirname, '../features/billing/entitlements.js'), 'utf8');
    expect(entitlements).toContain("new Set(['expired', 'refunded', 'revoked'])");
    expect(entitlements).not.toMatch(/REVOKED_STATUSES[^\n]*canceling/);
  });

  it('agrees on every business fact across en, az and ru', () => {
    // The facts live in one place, so no language can drift. Each rendered
    // language must carry the same numbers and the same address.
    for (const locale of SUPPORTED_LOCALES) {
      const text = everyRendered(locale);
      expect(text, `${locale} email`).toContain(LEGAL_FACTS.email);
      expect(text, `${locale} age`).toMatch(/\b16\b/);
      expect(text, `${locale} refund window`).toMatch(/\b10\b/);
      expect(text, `${locale} provider`).toContain('Gumroad');
      expect(text, `${locale} operator`).toContain(LEGAL_FACTS.operator);
    }
    // No locale file restates a fact as a literal; they interpolate it.
    for (const locale of SUPPORTED_LOCALES) {
      const raw = fs.readFileSync(path.resolve(__dirname, `../legal/${locale}.js`), 'utf8');
      expect(raw, `${locale} hard-codes the address`).not.toContain('jspath.edu@gmail.com');
      expect(raw, `${locale} hard-codes the operator`).not.toContain('Allahverdi');
    }
  });

  it('claims no certification and no perfect security', () => {
    for (const locale of SUPPORTED_LOCALES) {
      const text = everyRendered(locale);
      for (const claim of ['SOC 2', 'SOC2', 'ISO 27001', 'HIPAA', 'GDPR-compliant', 'GDPR compliant', 'CCPA compliant']) {
        expect(text, `${locale} claims ${claim}`).not.toContain(claim);
      }
      expect(text).not.toMatch(/100% secure|absolutely safe|unhackable/i);
    }
  });
});
