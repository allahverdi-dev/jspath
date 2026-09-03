import { Button } from '../components/ui/index.jsx';
import { useT } from '../i18n/index.jsx';

export default function NotFound() {
  const t = useT();
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <p className="font-mono text-code-md text-on-surface-variant">404</p>
      <h1 className="mt-3 font-display text-display-lg text-on-surface">{t('errors.notFoundTitle')}</h1>
      <p className="mt-3 max-w-md font-body-lg text-on-surface-variant">
        {t('errors.notFoundBody')}
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button to="/dashboard" icon="dashboard">{t('errors.goToDashboard')}</Button>
        <Button to="/curriculum" variant="secondary" icon="school">{t('errors.browseCurriculum')}</Button>
      </div>
    </div>
  );
}
