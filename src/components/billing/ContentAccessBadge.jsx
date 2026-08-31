import { Badge } from '../ui/index.jsx';
import { requiredPlanForContent } from '../../features/billing/access.js';

/** Allocation, not account status: a Pro member still sees which items are Pro. */
export function ContentAccessBadge({ kind, id }) {
  return requiredPlanForContent(kind, id) === 'pro'
    ? <Badge tone="primary" icon="lock">Pro</Badge>
    : null;
}
