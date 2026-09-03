import { Link } from 'react-router-dom';
import { useT } from '../../i18n/index.jsx';
import { DOCUMENTS } from '../../legal/documents.js';

/**
 * A compact row of policy links, for surfaces with no room for the full footer.
 *
 * Deliberately just links. JSPath has no acceptance flow — no checkbox, no
 * recorded consent — so this does not claim the learner is agreeing to anything
 * by continuing. Adding that sentence would assert a consent mechanism the
 * product does not implement.
 */
export function LegalLinks({ className = '' }) {
  const t = useT();

  return (
    <nav
      aria-label={t('legal.legal')}
      className={`flex flex-wrap justify-center gap-x-4 gap-y-1 ${className}`}
    >
      {DOCUMENTS.map((doc) => (
        <Link
          key={doc.id}
          to={doc.path}
          className="font-body-sm text-on-surface-variant underline-offset-2 hover:text-on-surface hover:underline"
        >
          {t(doc.labelKey)}
        </Link>
      ))}
    </nav>
  );
}
