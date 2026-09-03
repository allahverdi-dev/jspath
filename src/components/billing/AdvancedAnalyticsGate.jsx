import { FeatureGate, ProPreview } from './FeatureGate.jsx';
import { FEATURE } from '../../features/billing/plans.js';
import { useT } from '../../i18n/index.jsx';

export function AdvancedAnalyticsGate({ children, quiet = false }) {
  const t = useT();

  return (
    <FeatureGate
      feature={FEATURE.ADVANCED_ANALYTICS}
      fallback={quiet ? null : (
        <ProPreview title={t('billing.analyticsTitle')} message={t('billing.analyticsBody')} />
      )}
    >
      {children}
    </FeatureGate>
  );
}
