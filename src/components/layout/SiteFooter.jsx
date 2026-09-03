import { Link } from 'react-router-dom';
import { Logo } from '../../layouts/AppShell.jsx';
import { useT } from '../../i18n/index.jsx';
import { DOCUMENTS } from '../../legal/documents.js';
import { OPERATOR } from '../../legal/config.js';

/**
 * The one footer.
 *
 * Rendered by `AppShell` and by the landing page, which is the only public
 * surface outside the shell. It is deliberately absent from `FocusLayout` — the
 * lesson reader, the interview session and the practice session are
 * full-screen, single-task surfaces where a marketing footer under the editor
 * would be noise. Those surfaces are reached from inside the shell and always
 * lead back to it, and Settings links to the policies as well, so the legal
 * pages stay reachable from everywhere without putting a footer inside a
 * scrolling editor pane.
 *
 * Bottom padding clears the fixed mobile tab bar; the shell's `.app-content`
 * already reserves that space above the footer, and the extra padding here
 * keeps the last row of links off the bar on small screens.
 */

const PRODUCT_LINKS = [
  { to: '/curriculum', labelKey: 'nav.learn' },
  { to: '/practice', labelKey: 'nav.practice' },
  { to: '/challenges', labelKey: 'nav.challenges' },
  { to: '/projects', labelKey: 'nav.projects' },
  { to: '/interview', labelKey: 'nav.interview' },
];

const RESOURCE_LINKS = [
  { to: '/reference', labelKey: 'nav.reference' },
  { to: '/cheat-sheets', labelKey: 'nav.cheatSheets' },
  { to: '/playground', labelKey: 'nav.playground' },
  { to: '/pricing', labelKey: 'nav.pricing' },
];

function FooterColumn({ heading, links, t }) {
  return (
    <div className="min-w-0">
      <p className="font-mono text-label-caps uppercase tracking-wide text-on-surface-variant">{heading}</p>
      <ul className="mt-3 space-y-2">
        {links.map((link) => (
          <li key={link.to} className="min-w-0">
            <Link
              to={link.to}
              className="font-body-sm text-on-surface-variant underline-offset-2 hover:text-on-surface hover:underline"
            >
              {t(link.labelKey)}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function SiteFooter({ className = '' }) {
  const t = useT();

  return (
    <footer className={`border-t border-outline-variant ${className}`}>
      <div className="mx-auto w-full max-w-container-max px-4 pb-10 pt-10 lg:px-8">
        <nav aria-label={t('footer.navLabel')} className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="min-w-0 sm:col-span-2 lg:col-span-1">
            <Logo size="sm" />
            <p className="mt-3 max-w-xs font-body-sm text-on-surface-variant">{t('landing.footerTagline')}</p>
          </div>

          <FooterColumn heading={t('footer.product')} links={PRODUCT_LINKS} t={t} />
          <FooterColumn heading={t('nav.resources')} links={RESOURCE_LINKS} t={t} />
          <FooterColumn
            heading={t('legal.legal')}
            links={DOCUMENTS.map((d) => ({ to: d.path, labelKey: d.labelKey }))}
            t={t}
          />
        </nav>

        <p className="mt-10 border-t border-outline-variant pt-6 font-body-sm text-on-surface-variant">
          {/*
           * The rights line matches what LICENSE already asserts, rather than
           * being added because footers usually have one.
           */}
          {t('footer.rights', { year: OPERATOR.copyrightYear, name: 'JSPath' })}
        </p>
      </div>
    </footer>
  );
}
