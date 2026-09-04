import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import fs from 'node:fs';
import path from 'node:path';
import { ContactEmail } from '../components/layout/ContactEmail.jsx';
import LegalDocument from '../pages/LegalDocument.jsx';
import { I18nProvider } from '../i18n/index.jsx';
import { LEGAL_FACTS } from '../legal/config.js';
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
