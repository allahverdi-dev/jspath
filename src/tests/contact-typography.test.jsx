import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import fs from 'node:fs';
import path from 'node:path';
import { ContactEmail } from '../components/layout/ContactEmail.jsx';
import LegalDocument from '../pages/LegalDocument.jsx';
import { I18nProvider } from '../i18n/index.jsx';
import { LEGAL_FACTS, LEGAL_PUBLISHABLE, REQUIRED_DECISIONS } from '../legal/config.js';
import { DOCUMENTS, resolveDocument, withheldSections } from '../legal/documents.js';
import { SUPPORTED_LOCALES } from '../i18n/core.js';
import en from '../i18n/locales/en.js';
import az from '../i18n/locales/az.js';
import ru from '../i18n/locales/ru.js';
import tailwindConfig from '../../tailwind.config.js';

/**
 * Two small production findings.
 *
 * The contact address was a correct `mailto:` link that did nothing on a machine
 * with no mail handler registered — not a broken link, but indistinguishable
 * from one. The address is now also copyable, and stays selectable text either
 * way, which is the real fallback when the clipboard API is unavailable too.
 *
 * The typography half is a guard, not a fix: it fails if any `text-*` scale used
 * in the app is missing from the Tailwind config, which is how a class that
 * silently compiles to nothing gets caught before it ships.
 */

const dictionaries = { en, az, ru };
const EMAIL = 'jspath.edu@gmail.com';

const userState = vi.hoisted(() => ({ locale: 'en' }));
vi.mock('../state/UserStateProvider.jsx', () => ({
  useUserState: () => ({ state: { settings: { locale: userState.locale } }, actions: { updateSettings: vi.fn() } }),
}));

const renderWith = (locale, ui) => {
  userState.locale = locale;
  return render(<MemoryRouter><I18nProvider>{ui}</I18nProvider></MemoryRouter>);
};

/**
 * `userEvent.setup()` installs its own `navigator.clipboard` stub, so ours must
 * be applied *after* it — otherwise the component writes to user-event's copy
 * and the assertion watches a spy nothing ever calls.
 */
const withClipboard = (impl) => {
  Object.defineProperty(navigator, 'clipboard', {
    value: impl, configurable: true, writable: true,
  });
};

beforeEach(() => { userState.locale = 'en'; });
afterEach(() => { delete navigator.clipboard; });

/* ------------------------------------------------------------------ *
 * The contact address
 * ------------------------------------------------------------------ */

describe('the contact address', () => {
  it('is visible as text, not hidden behind a link label', () => {
    renderWith('en', <ContactEmail />);
    expect(screen.getByText(EMAIL)).toBeInTheDocument();
  });

  it('keeps working as a mailto link', () => {
    renderWith('en', <ContactEmail />);
    expect(screen.getByRole('link', { name: EMAIL })).toHaveAttribute('href', `mailto:${EMAIL}`);
  });

  it('offers a copy action beside it', () => {
    renderWith('en', <ContactEmail />);
    expect(screen.getByRole('button', { name: new RegExp(en.legal.copyEmail) })).toBeInTheDocument();
  });

  it('asks for the clipboard only after a click, never on render', () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    withClipboard({ writeText });
    renderWith('en', <ContactEmail />);
    expect(writeText).not.toHaveBeenCalled();
  });

  it('copies the exact address', async () => {
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    withClipboard({ writeText });
    renderWith('en', <ContactEmail />);
    await user.click(screen.getByRole('button', { name: new RegExp(en.legal.copyEmail) }));
    expect(writeText).toHaveBeenCalledWith(EMAIL);
    expect(writeText).toHaveBeenCalledTimes(1);
  });

  it('confirms the copy in an announced status', async () => {
    const user = userEvent.setup();
    withClipboard({ writeText: vi.fn().mockResolvedValue(undefined) });
    renderWith('en', <ContactEmail />);
    await user.click(screen.getByRole('button', { name: new RegExp(en.legal.copyEmail) }));
    const status = await screen.findByRole('status');
    expect(status).toHaveTextContent(en.legal.emailCopied);
    expect(status).toHaveAttribute('aria-live', 'polite');
  });

  it.each([
    ['a rejected write', { writeText: vi.fn().mockRejectedValue(new Error('denied')) }],
    ['no clipboard API at all', undefined],
  ])('tells the reader what to do instead when %s', async (_label, impl) => {
    const user = userEvent.setup();
    withClipboard(impl);
    renderWith('en', <ContactEmail />);
    await user.click(screen.getByRole('button', { name: new RegExp(en.legal.copyEmail) }));
    expect(await screen.findByRole('status')).toHaveTextContent(en.legal.emailCopyFailed);
    // The address itself is still there to select by hand.
    expect(screen.getByText(EMAIL)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: EMAIL })).toHaveAttribute('href', `mailto:${EMAIL}`);
  });

  it.each(SUPPORTED_LOCALES)('%s localizes the copy action and its feedback', async (locale) => {
    const user = userEvent.setup();
    withClipboard({ writeText: vi.fn().mockResolvedValue(undefined) });
    renderWith(locale, <ContactEmail />);
    const label = dictionaries[locale].legal.copyEmail;
    await user.click(screen.getByRole('button', { name: new RegExp(label) }));
    expect(await screen.findByRole('status')).toHaveTextContent(dictionaries[locale].legal.emailCopied);
  });

  it('is an icon-only control, so the address stays the content', () => {
    renderWith('en', <ContactEmail />);
    const button = screen.getByRole('button', { name: en.legal.copyEmail });
    // Nothing but the icon glyph is rendered inside it.
    expect(button.textContent.trim()).toBe('content_copy');
    // And it reuses the shared compact icon size rather than a bespoke one.
    expect(button.className).toMatch(/\bh-9\b/);
    expect(button.className).toMatch(/\bw-9\b/);
    // The hit target is not shrunk with the glyph: the global coarse-pointer
    // rule grows every <button> to 44px, and this is a real <button>.
    expect(button.tagName).toBe('BUTTON');
    expect(button).toHaveAttribute('type', 'button');
    const css = fs.readFileSync(path.resolve(process.cwd(), 'src/styles/index.css'), 'utf8');
    expect(css).toMatch(/min-height: 44px; min-width: 44px/);
  });

  it('names itself for assistive technology despite showing no text', () => {
    renderWith('en', <ContactEmail />);
    const button = screen.getByRole('button', { name: en.legal.copyEmail });
    expect(button).toHaveAttribute('aria-label', en.legal.copyEmail);
    // The glyph alone must never be the accessible name.
    expect(button).toHaveAccessibleName(en.legal.copyEmail);
  });

  it.each(SUPPORTED_LOCALES)('%s localizes the accessible label', (locale) => {
    renderWith(locale, <ContactEmail />);
    expect(screen.getByRole('button', { name: dictionaries[locale].legal.copyEmail }))
      .toHaveAttribute('aria-label', dictionaries[locale].legal.copyEmail);
  });

  it('offers a tooltip that is decoration, not the accessible name', () => {
    renderWith('en', <ContactEmail />);
    const tooltip = screen.getByRole('tooltip', { hidden: true });
    expect(tooltip).toHaveTextContent(en.legal.copyEmail);
    // Revealed by hover and by keyboard focus, with no focus management.
    expect(tooltip.className).toMatch(/group-hover:block/);
    expect(tooltip.className).toMatch(/group-focus-within:block/);
    expect(tooltip.className).toMatch(/pointer-events-none/);
    // It must not widen the row at 320px.
    expect(tooltip.className).toMatch(/absolute/);
    expect(tooltip.className).toMatch(/whitespace-nowrap/);
  });

  it('can be activated from the keyboard', async () => {
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    withClipboard({ writeText });
    renderWith('en', <ContactEmail />);

    const button = screen.getByRole('button', { name: en.legal.copyEmail });
    button.focus();
    expect(button).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(writeText).toHaveBeenCalledWith(EMAIL);

    await user.keyboard(' ');
    expect(writeText).toHaveBeenCalledTimes(2);
  });

  it('swaps to a tick on success and says so in more than colour', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    try {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      withClipboard({ writeText: vi.fn().mockResolvedValue(undefined) });
      renderWith('en', <ContactEmail />);
      await user.click(screen.getByRole('button', { name: en.legal.copyEmail }));

      const done = await screen.findByRole('button', { name: en.legal.emailCopied });
      expect(done.textContent.trim()).toBe('check');
      expect(await screen.findByRole('status')).toHaveTextContent(en.legal.emailCopied);

      // And it returns to the copy affordance rather than staying stuck.
      await vi.advanceTimersByTimeAsync(2500);
      expect(screen.getByRole('button', { name: en.legal.copyEmail })).toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });

  it('cleans up its reset timer, so an unmount cannot set state', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const errors = vi.spyOn(console, 'error').mockImplementation(() => {});
    try {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      withClipboard({ writeText: vi.fn().mockResolvedValue(undefined) });
      const { unmount } = renderWith('en', <ContactEmail />);
      await user.click(screen.getByRole('button', { name: en.legal.copyEmail }));
      await screen.findByRole('button', { name: en.legal.emailCopied });
      unmount();
      await vi.advanceTimersByTimeAsync(3000);
      expect(errors).not.toHaveBeenCalled();
    } finally {
      errors.mockRestore();
      vi.useRealTimers();
    }
  });

  it('stays usable after a failure, so the reader can retry', async () => {
    const user = userEvent.setup();
    const writeText = vi.fn()
      .mockRejectedValueOnce(new Error('denied'))
      .mockResolvedValueOnce(undefined);
    withClipboard({ writeText });
    renderWith('en', <ContactEmail />);

    const button = screen.getByRole('button', { name: en.legal.copyEmail });
    await user.click(button);
    expect(await screen.findByRole('status')).toHaveTextContent(en.legal.emailCopyFailed);
    expect(button).toBeEnabled();

    // A second attempt is allowed and can succeed.
    await user.click(screen.getByRole('button', { name: en.legal.copyEmail }));
    expect(await screen.findByRole('status')).toHaveTextContent(en.legal.emailCopied);
  });

  it('appears in the Contact section of every policy', () => {
    for (const id of ['terms', 'privacy', 'refund']) {
      const { unmount } = renderWith('en', <LegalDocument documentId={id} />);
      const section = document.getElementById('contact');
      expect(within(section).getByRole('link', { name: EMAIL })).toHaveAttribute('href', `mailto:${EMAIL}`);
      expect(within(section).getByRole('button', { name: new RegExp(en.legal.copyEmail) })).toBeInTheDocument();
      unmount();
    }
  });

  it('leaves the address a plain link elsewhere, without a button on every mention', () => {
    renderWith('en', <LegalDocument documentId="refund" />);
    const problems = document.getElementById('payment-problems');
    expect(within(problems).getByRole('link', { name: EMAIL })).toBeInTheDocument();
    expect(within(problems).queryByRole('button')).not.toBeInTheDocument();
  });

  it('publishes only the configured address, never a private one', () => {
    expect(LEGAL_FACTS.email).toBe(EMAIL);
    const files = [];
    (function walk(dir) {
      for (const entry of fs.readdirSync(dir)) {
        const full = path.join(dir, entry);
        if (fs.statSync(full).isDirectory()) {
          if (entry !== 'content' && entry !== 'tests') walk(full);
        } else if (/\.jsx?$/.test(entry) && !/\.test\./.test(entry)) {
          files.push(fs.readFileSync(full, 'utf8'));
        }
      }
    })(path.resolve(process.cwd(), 'src'));
    const addresses = new Set(files.join('\n').match(/[\w.+-]+@[\w-]+\.[a-z]{2,}/gi) ?? []);
    // Only the published address, and nothing resembling a git author identity.
    expect([...addresses]).toEqual([EMAIL]);
    expect(files.join('\n')).not.toMatch(/allahverdihesenov|@users\.noreply\.github\.com/i);
  });
});

/* ------------------------------------------------------------------ *
 * Typography tokens
 * ------------------------------------------------------------------ */

describe('typography tokens', () => {
  const sourceFiles = () => {
    const out = [];
    (function walk(dir) {
      for (const entry of fs.readdirSync(dir)) {
        const full = path.join(dir, entry);
        if (fs.statSync(full).isDirectory()) {
          if (entry !== 'content') walk(full);
        } else if (/\.jsx?$/.test(entry) && !/\.test\./.test(entry)) out.push(full);
      }
    })(path.resolve(process.cwd(), 'src'));
    return out;
  };

  const scaleNames = new Set(['display', 'headline', 'title', 'label', 'body', 'code']);

  /** Every `text-<scale>-<size>` the app asks for, with where it came from. */
  const usedTextScales = () => {
    const found = new Map();
    for (const file of [...sourceFiles(), path.resolve(process.cwd(), 'src/styles/index.css')]) {
      const source = fs.readFileSync(file, 'utf8');
      for (const match of source.matchAll(/\btext-([a-z]+)-([a-z]+)\b/g)) {
        if (!scaleNames.has(match[1])) continue;
        const token = `${match[1]}-${match[2]}`;
        if (!found.has(token)) found.set(token, []);
        if (!found.get(token).includes(file)) found.get(token).push(file);
      }
    }
    return found;
  };

  it('defines every typography scale the app uses', () => {
    const defined = new Set(Object.keys(tailwindConfig.theme.extend.fontSize));
    const undefinedTokens = [...usedTextScales().entries()]
      .filter(([token]) => !defined.has(token))
      .map(([token, files]) => `${token} (${files.map((f) => path.basename(f)).join(', ')})`);
    // A class Tailwind does not generate compiles to nothing and silently falls
    // back to the inherited size — invisible in review, wrong on the page.
    expect(undefinedTokens).toEqual([]);
  });

  it.each(['text-display-md', 'text-title-lg', 'text-title-sm', 'text-label-sm', 'text-label-md'])(
    'has no orphaned %s anywhere in the app',
    (token) => {
      for (const file of sourceFiles()) {
        expect(fs.readFileSync(file, 'utf8'), path.basename(file)).not.toMatch(new RegExp(`\\b${token}\\b`));
      }
    },
  );

  it('defines every scaled font-family utility the app uses', () => {
    // Only the unambiguous `font-<family>-<size>` shape: a bare `font-loading`
    // is an application state class, and `font-medium` is a weight.
    const defined = new Set(Object.keys(tailwindConfig.theme.extend.fontFamily));
    const missing = new Set();
    for (const file of sourceFiles()) {
      for (const match of fs.readFileSync(file, 'utf8').matchAll(/\bfont-([a-z]+-[a-z]+)\b/g)) {
        if (!defined.has(match[1])) missing.add(`${match[1]} (${path.basename(file)})`);
      }
    }
    expect([...missing]).toEqual([]);
  });
});

/* ------------------------------------------------------------------ *
 * The polish changed presentation only
 * ------------------------------------------------------------------ */

describe('legal facts are untouched by the contact control', () => {
  it('keeps every published business fact exactly as decided', () => {
    expect(LEGAL_PUBLISHABLE).toBe(true);
    expect(LEGAL_FACTS).toMatchObject({
      operator: 'Allahverdi Həsənov',
      email: 'jspath.edu@gmail.com',
      refundDays: 10,
      minimumAge: 16,
      governingLaw: 'Republic of Azerbaijan',
      disputeVenue: 'Republic of Azerbaijan',
      billingProvider: 'Gumroad',
    });
    expect(REQUIRED_DECISIONS.refund.value).toMatchObject({ windowDays: 10, renewalsRefundable: false });
  });

  it('publishes every section of every policy, in every language', () => {
    for (const doc of DOCUMENTS) {
      expect(withheldSections(doc.id)).toEqual([]);
      for (const locale of SUPPORTED_LOCALES) {
        expect(resolveDocument(doc.id, locale).sections.length).toBe(doc.sections.length);
      }
    }
  });
});
