import { FeatureGate, ProPreview } from './FeatureGate.jsx';
import { FEATURE } from '../../features/billing/plans.js';

export function AdvancedAnalyticsGate({ children, quiet = false }) {
  return (
    <FeatureGate
      feature={FEATURE.ADVANCED_ANALYTICS}
      fallback={quiet ? null : <ProPreview title="Advanced Analytics · Pro" message="Explore your topic-by-topic mastery, assessment evidence and weak areas, calculated from your actual progress. Basic progress stays free." />}
    >
      {children}
    </FeatureGate>
  );
}
