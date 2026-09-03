import { Badge } from '../ui/index.jsx';
import { requiredPlanForContent } from '../../features/billing/access.js';
import { useT } from '../../i18n/index.jsx';

/** Allocation, not account status: a Pro member still sees which items are Pro. */
export function ContentAccessBadge({ kind, id }) {
  const t = useT();

  return requiredPlanForContent(kind, id) === 'pro'
    ? <Badge tone="primary" icon="lock">{t('common.pro')}</Badge>
    : null;
}
