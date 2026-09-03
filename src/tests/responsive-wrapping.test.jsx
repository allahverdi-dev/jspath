import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import fs from 'node:fs';
import path from 'node:path';
import { InlineMarkup } from '../components/learning/InlineMarkup.jsx';

/**
 * Guards for the text-fragmentation defect.
 *
 * Production rendered "count" one letter per line and split `querySelector` into
 * `querySel` / `ector`. Two rules combined to cause it:
 *
 *  1. `body { overflow-wrap: anywhere }`. Unlike `break-word`, `anywhere` also
 *     makes the *min-content* width of an element a single character, so every
 *     auto-sized flex and grid track was free to collapse to ~7px.
 *  2. `InlineMarkup` generated no box of its own, so inside the checklist rows —
 *     which are flex containers — every text run and every `<code>` became a
 *     separate, independently-shrinking flex item with the row's `gap` between
 *     them.
 *
 * jsdom has no layout engine, so these assert the *causes* rather than measured
 * geometry. The rendered result was verified in a browser across 320/390/560/768/
 * 1366/1920 in en, az and ru; see the phase report.
 */

const read = (p) => fs.readFileSync(path.resolve(__dirname, '..', p), 'utf8');
const css = read('styles/index.css');

function sourceFiles() {
  const out = [];
  (function walk(dir) {
    for (const entry of fs.readdirSync(dir)) {
      const full = path.join(dir, entry);
      if (fs.statSync(full).isDirectory()) {
        if (!['content', 'i18n', 'tests'].includes(entry)) walk(full);
      } else if (/\.jsx?$/.test(entry) && !/\.test\./.test(entry)) out.push(full);
    }
  })(path.resolve(__dirname, '..'));
  return out;
}

describe('global wrapping rules', () => {
  it('never uses overflow-wrap: anywhere, which collapses intrinsic sizing', () => {
    expect(css).not.toMatch(/overflow-wrap:\s*anywhere/);
    expect(css).toMatch(/overflow-wrap:\s*break-word/);
  });

  it('never uses word-break: break-all anywhere in the app', () => {
    // `break-all` breaks between any two characters, including inside a short
    // word that would have fitted on the next line.
    expect(css).not.toMatch(/word-break:\s*break-all/);
    for (const f of sourceFiles()) {
      const src = fs.readFileSync(f, 'utf8');
      expect(src, f).not.toMatch(/\bbreak-all\b/);
    }
  });

  it('keeps code blocks scrolling in their own panel rather than wrapping', () => {
    expect(css).toMatch(/pre\s*{[^}]*overflow-wrap:\s*normal/);
  });

  it('treats inline code as an identifier, not a character stream', () => {
    expect(css).toMatch(/:not\(pre\)\s*>\s*code\s*{[^}]*word-break:\s*normal/);
  });

  it('still lets flex and grid children shrink, so nothing overflows the page', () => {
    expect(css).toMatch(/\.grid\s*>\s*\*[^{]*{\s*min-width:\s*0/);
  });
});

describe('authored prose is one box, not a row of flex items', () => {
  it('wraps its output in a single element', () => {
    const { container } = render(<InlineMarkup text="Use `querySelector` to select the element." />);
    expect(container.childNodes).toHaveLength(1);
    const wrapper = container.firstElementChild;
    expect(wrapper.tagName).toBe('SPAN');
    // All the prose lives inside that one box.
    expect(wrapper.textContent).toBe('Use querySelector to select the element.');
    expect(wrapper.querySelector('code')).not.toBeNull();
  });

  it('does not opt out of box generation', () => {
    // `display: contents` would put every run back into the parent flex row.
    const { container } = render(<InlineMarkup text="A `click` listener." />);
    const wrapper = container.firstElementChild;
    expect(wrapper.getAttribute('style') ?? '').not.toMatch(/display:\s*contents/);
  });

  it('can both fill and shrink inside a flex row', () => {
    // `flex-1` supplies the growth, `min-w-0` the ability to shrink below the
    // content's natural width. Inert inside a <p>, correct inside a flex row.
    const { container } = render(<InlineMarkup text="Some authored prose here." />);
    const cls = container.firstElementChild.className;
    expect(cls).toContain('min-w-0');
    expect(cls).toContain('flex-1');
  });

  it('keeps the authored-language marking it also carries', () => {
    const { container } = render(<InlineMarkup text="Authored English prose." />);
    expect(container.firstElementChild.getAttribute('lang')).toBe('en');
  });
});

describe('rows that mix prose with controls', () => {
  it('gives the dashboard guest notice a real flex-basis so it wraps instead of crushing', () => {
    // `flex-1` alone is `flex: 1 1 0%` — a zero basis never triggers the row's
    // flex-wrap, so the paragraph shrank beside the icon and button until Russian
    // words broke across three lines.
    const src = read('pages/Dashboard.jsx');
    const notice = src.slice(src.indexOf('dashboard.guestNoticeBody') - 400, src.indexOf('dashboard.guestNoticeBody'));
    expect(notice).toMatch(/flex-wrap/);
    expect(notice).toMatch(/basis-\d/);
  });

  it('keeps project checklist rows built from an icon plus authored prose', () => {
    const src = read('pages/ProjectDetail.jsx');
    // The icon must not shrink, so the prose keeps the rest of the row.
    expect(src).toMatch(/shrink-0/);
    expect(src).toMatch(/<InlineMarkup text=\{r\} \/>/);
  });
});
