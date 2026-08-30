import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { FeatureGate } from './FeatureGate.jsx';

const entitlement = vi.hoisted(() => ({ loading: false, allowed: false }));
vi.mock('../../state/EntitlementProvider.jsx', () => ({
  useEntitlements: () => ({ loading: entitlement.loading, hasFeature: () => entitlement.allowed }),
}));

describe('FeatureGate', () => {
  it('shows an upgrade state for locked content', () => {
    entitlement.allowed = false;
    render(<MemoryRouter><FeatureGate feature="projects"><p>Premium project</p></FeatureGate></MemoryRouter>);
    expect(screen.getByRole('heading', { name: /included with JSPath Pro/i })).toBeInTheDocument();
    expect(screen.queryByText('Premium project')).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: /View Pro options/i })).toHaveAttribute('href', '/pricing');
  });

  it('renders Pro content for an entitled user', () => {
    entitlement.allowed = true;
    render(<MemoryRouter><FeatureGate feature="projects"><p>Premium project</p></FeatureGate></MemoryRouter>);
    expect(screen.getByText('Premium project')).toBeInTheDocument();
  });
});
