import { useEffect, useRef, useState } from 'react';
import { NavLink, Outlet, useLocation, Link } from 'react-router-dom';
import { Icon, Button, cx } from '../components/ui/index.jsx';
import { useUserState } from '../state/UserStateProvider.jsx';
import { useAuth } from '../state/AuthProvider.jsx';
import { useEntitlements } from '../state/EntitlementProvider.jsx';
import { SearchOverlay } from '../features/search/SearchOverlay.jsx';
import { SiteFooter } from '../components/layout/SiteFooter.jsx';
import { useModalFocus } from '../hooks/useModalFocus.js';
import { useI18n, useT } from '../i18n/index.jsx';

/**
 * The application shell from the Stitch dashboard screen: a fixed 280px sidebar,
 * a sticky header with the ⌘K search affordance, and a fluid content area.
 *
 * Below `lg` the sidebar becomes a slide-over drawer and a bottom tab bar takes
 * over primary navigation, matching the mobile dashboard export.
 */

/**
 * Navigation, as translation keys rather than finished strings.
 *
 * The route and the icon are stable product identity; only the label is
 * language-dependent, so it is resolved at render time through `t`.
 */
const NAV_SECTIONS = [
  {
    labelKey: 'nav.main',
    items: [
      { to: '/dashboard', icon: 'dashboard', labelKey: 'nav.dashboard' },
      { to: '/curriculum', icon: 'school', labelKey: 'nav.learn' },
      { to: '/practice', icon: 'fitness_center', labelKey: 'nav.practice' },
      { to: '/challenges', icon: 'trophy', labelKey: 'nav.challenges' },
      { to: '/projects', icon: 'folder_open', labelKey: 'nav.projects' },
      { to: '/playground', icon: 'terminal', labelKey: 'nav.playground' },
    ],
  },
  {
    labelKey: 'nav.resources',
    items: [
      { to: '/reference', icon: 'menu_book', labelKey: 'nav.reference' },
      { to: '/cheat-sheets', icon: 'description', labelKey: 'nav.cheatSheets' },
      { to: '/interview', icon: 'record_voice_over', labelKey: 'nav.interview' },
      { to: '/pricing', icon: 'workspace_premium', labelKey: 'nav.pricing' },
    ],
  },
  {
    labelKey: 'nav.personal',
    items: [
      { to: '/my-learning', icon: 'timeline', labelKey: 'nav.myLearning' },
      { to: '/bookmarks', icon: 'bookmark', labelKey: 'nav.bookmarks' },
      { to: '/achievements', icon: 'military_tech', labelKey: 'nav.achievements' },
    ],
  },
];

/** Primary destinations for the mobile tab bar. */
const MOBILE_NAV = [
  { to: '/dashboard', icon: 'dashboard', labelKey: 'nav.home' },
  { to: '/curriculum', icon: 'school', labelKey: 'nav.learn' },
  { to: '/practice', icon: 'fitness_center', labelKey: 'nav.practice' },
  { to: '/playground', icon: 'terminal', labelKey: 'nav.code' },
  { to: '/profile', icon: 'person', labelKey: 'nav.profile' },
];

export function Logo({ size = 'md', className = '' }) {
  const box = size === 'sm' ? 'h-7 w-7 text-[13px]' : 'h-8 w-8 text-[15px]';
  return (
    <span className={cx('flex items-center gap-2.5', className)}>
      <span className={cx('grid place-items-center rounded bg-primary font-mono font-bold text-on-primary', box)}>
        JS
      </span>
      <span className="font-heading text-title-md tracking-tight text-on-surface">JSPath</span>
    </span>
  );
}

function NavItem({ item, onNavigate }) {
  const t = useT();
  return (
    <NavLink
      to={item.to}
      onClick={onNavigate}
      className={({ isActive }) =>
        cx(
          'touch-target group relative flex items-center gap-3 rounded px-3 py-2 font-body-sm transition-colors',
          isActive
            ? 'bg-surface-container-high font-semibold text-on-surface'
            : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface',
        )
      }
    >
      {({ isActive }) => (
        <>
          {/* DESIGN.md: active items carry a 2px yellow pill on the far left. */}
          <span
            className={cx(
              'absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full transition-opacity',
              isActive ? 'bg-primary opacity-100' : 'opacity-0',
            )}
            aria-hidden="true"
          />
          <Icon name={item.icon} size={20} filled={isActive} />
          {t(item.labelKey)}
        </>
      )}
    </NavLink>
  );
}

function SidebarContent({ onNavigate, onClose }) {
  const t = useT();
  const { formatNumber } = useI18n();
  const { state, streak, xp } = useUserState();
  const { isAuthenticated, displayName } = useAuth();
  const { isPro } = useEntitlements();
  const name = isAuthenticated ? displayName : state.profile.displayName || t('auth.guest');

  return (
    <>
      <div className="flex h-16 shrink-0 items-center justify-between px-5">
        <Link to="/dashboard" onClick={onNavigate} className="rounded">
          <Logo />
        </Link>
        {onClose && <Button variant="ghost" size="icon" onClick={onClose} aria-label={t('nav.closeMenu')} icon="close" />}
      </div>

      <nav className="thin-scrollbar min-h-0 flex-1 space-y-6 overflow-y-auto overscroll-contain px-3 py-4" aria-label={t('nav.main')}>
        {NAV_SECTIONS.map((section) => (
          <div key={t(section.labelKey)} className="space-y-0.5">
            <p className="px-3 pb-2 font-mono text-label-caps uppercase tracking-wider text-on-surface-variant">
              {t(section.labelKey)}
            </p>
            {section.items.map((item) => (
              <NavItem key={item.to} item={item} onNavigate={onNavigate} />
            ))}
          </div>
        ))}
      </nav>

      <div className="border-t border-outline-variant bg-surface-container-low p-3">
        <Link
          to="/pricing"
          onClick={onNavigate}
          className="mb-2 flex items-center justify-center gap-1.5 rounded border border-primary/30 bg-primary/5 px-3 py-2 font-body-sm font-semibold text-primary-ink transition hover:bg-primary/10"
        >
          <Icon name={isPro ? 'workspace_premium' : 'upgrade'} size={17} />
          {isPro ? t('billing.proManagePlan') : t('billing.upgrade')}
        </Link>
        <div className="mb-2 flex items-center justify-between px-2 font-mono text-label-caps uppercase tracking-wider text-on-surface-variant">
          <span className="flex items-center gap-1">
            <Icon name="local_fire_department" size={13} filled className={streak > 0 ? 'text-primary-ink' : ''} />
            {t('common.dayCount', { count: streak })}
          </span>
          <span>{t('common.xp', { count: formatNumber(xp) })}</span>
        </div>
        <Link
          to="/profile"
          onClick={onNavigate}
          className="flex items-center gap-3 rounded px-2 py-2 transition-colors hover:bg-surface-container"
        >
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-surface-container-highest">
            <Icon name="person" size={18} className="text-on-surface-variant" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate font-body-sm font-semibold text-on-surface">{name}</span>
            <span className="block truncate font-mono text-code-sm text-on-surface-variant">
              {isPro
                ? t('billing.proMember')
                : isAuthenticated ? t('billing.freeAccount') : t('auth.guestMode')}
            </span>
          </span>
          <Icon name="chevron_right" size={18} className="text-on-surface-variant" />
        </Link>
      </div>
    </>
  );
}

export function AppShell() {
  const t = useT();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const location = useLocation();
  const drawerRef = useRef(null);
  useModalFocus(drawerOpen, drawerRef, () => setDrawerOpen(false));

  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 1024px)');
    const closeOnDesktop = () => { if (desktop.matches) setDrawerOpen(false); };
    desktop.addEventListener('change', closeOnDesktop);
    return () => desktop.removeEventListener('change', closeOnDesktop);
  }, []);

  /* Close the mobile drawer whenever navigation happens. */
  useEffect(() => setDrawerOpen(false), [location.pathname]);

  /* Global ⌘K / Ctrl+K search, matching the header affordance. */
  useEffect(() => {
    const onKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setDrawerOpen(false);
        setSearchOpen((o) => !o);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  return (
    <div className="safe-page min-h-screen bg-background">
      <a href="#main-content" className="skip-link">{t('nav.skipToContent')}</a>

      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-sidebar-width flex-col border-r border-outline-variant bg-surface-container-lowest lg:flex">
        <SidebarContent />
      </aside>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/70 animate-fade-in"
            onClick={() => setDrawerOpen(false)}
            aria-hidden="true"
          />
          <aside
            ref={drawerRef}
            tabIndex={-1}
            className="drawer-panel absolute inset-y-0 left-0 flex w-[min(20rem,90vw)] flex-col border-r border-outline-variant bg-surface-container-lowest"
            role="dialog"
            aria-modal="true"
            aria-label={t('nav.openMenu')}
          >
            <SidebarContent onNavigate={() => setDrawerOpen(false)} onClose={() => setDrawerOpen(false)} />
          </aside>
        </div>
      )}

      <div className="lg:pl-sidebar-width">
        <header className="app-header sticky top-0 z-30 flex items-center gap-3 border-b border-outline-variant bg-surface/85 px-4 backdrop-blur-xl lg:px-8">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="-ml-2 rounded p-2 text-on-surface-variant transition hover:bg-surface-container hover:text-on-surface lg:hidden"
            aria-label={t('nav.openMenu')}
            aria-expanded={drawerOpen}
          >
            <Icon name="menu" size={22} />
          </button>

          <Link to="/dashboard" className="lg:hidden">
            <Logo size="sm" />
          </Link>

          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            aria-label={t('search.title')}
            className="ml-auto flex items-center gap-2 rounded border border-outline-variant bg-surface-container px-3 py-2 text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface lg:ml-0 lg:w-96"
          >
            <Icon name="search" size={18} />
            <span className="hidden font-body-sm lg:inline">{t('search.placeholder')}</span>
            <kbd className="ml-auto hidden rounded bg-surface-variant px-1.5 py-0.5 font-mono text-code-sm lg:inline">
              ⌘K
            </kbd>
          </button>

          <div className="ml-auto hidden items-center gap-4 lg:flex">
            <Link
              to="/settings"
              className="rounded p-2 text-on-surface-variant transition hover:bg-surface-container hover:text-on-surface"
              aria-label={t('nav.settings')}
            >
              <Icon name="settings" size={20} />
            </Link>
            <div className="h-6 w-px bg-outline-variant" aria-hidden="true" />
            <Link to="/profile" className="grid h-8 w-8 place-items-center rounded-full bg-surface-container-highest" aria-label={t('nav.profile')}>
              <Icon name="person" size={18} className="text-on-surface-variant" />
            </Link>
          </div>
        </header>

        <main id="main-content" className="app-content min-w-0 min-h-[calc(100svh-4rem)] px-4 pt-6 lg:px-8 lg:pt-8">
          <div className="mx-auto w-full max-w-container-max">
            <Outlet />
          </div>
        </main>

        <SiteFooter className="mt-8" />
      </div>

      {/* Mobile tab bar */}
      <nav
        className="safe-page safe-bottom fixed inset-x-0 bottom-0 z-30 flex border-t border-outline-variant bg-surface-container-lowest/95 backdrop-blur-xl lg:hidden"
        aria-label={t('nav.primary')}
      >
        {MOBILE_NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cx(
                'flex flex-1 flex-col items-center gap-0.5 py-2.5 transition-colors',
                isActive ? 'text-primary-ink' : 'text-on-surface-variant',
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon name={item.icon} size={22} filled={isActive} />
                <span className="font-mono text-[10px] uppercase tracking-wide">{t(item.labelKey)}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
}

/** Distraction-free layout used by the lesson reader and interview sessions. */
export function FocusLayout() {
  const t = useT();

  return (
    <div className="safe-page safe-bottom min-h-screen bg-background">
      <a href="#main-content" className="skip-link">{t('nav.skipToContent')}</a>
      <Outlet />
    </div>
  );
}

export { Button };
