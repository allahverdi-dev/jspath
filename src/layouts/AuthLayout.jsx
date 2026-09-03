import { Link } from 'react-router-dom';
import { Logo } from './AppShell.jsx';
import { Card } from '../components/ui/index.jsx';
import { useT } from '../i18n/index.jsx';
import { LegalLinks } from '../components/layout/LegalLinks.jsx';

export function AuthLayout({ title, subtitle, children, footer }) {
  const t = useT();

  return (
    <div className="safe-page safe-top safe-bottom flex min-h-screen flex-col bg-background">
      <a href="#main-content" className="skip-link">{t('nav.skipToContent')}</a>
      <header className="px-4 py-6 lg:px-8">
        <Link to="/"><Logo /></Link>
      </header>
      <main id="main-content" className="flex flex-1 items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          <h1 className="font-display text-headline-md text-on-surface">{title}</h1>
          {subtitle && <p className="mt-2 font-body-md text-on-surface-variant">{subtitle}</p>}
          <Card className="mt-6 p-4 sm:p-6">{children}</Card>
          {footer && <div className="mt-5 text-center font-body-sm text-on-surface-variant">{footer}</div>}
          <LegalLinks className="mt-8" />
        </div>
      </main>
    </div>
  );
}
