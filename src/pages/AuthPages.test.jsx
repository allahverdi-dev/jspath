import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import Login from './Login.jsx';
import SignUp from './SignUp.jsx';

const mocks = vi.hoisted(() => ({
  auth: {},
  userState: { state: { lessons: {} } },
}));

vi.mock('../state/AuthProvider.jsx', () => ({ useAuth: () => mocks.auth }));
vi.mock('../state/UserStateProvider.jsx', () => ({ useUserState: () => mocks.userState }));
vi.mock('../layouts/AuthLayout.jsx', () => ({
  AuthLayout: ({ title, subtitle, children, footer }) => (
    <main>
      <h1>{title}</h1>
      <p>{subtitle}</p>
      {children}
      <footer>{footer}</footer>
    </main>
  ),
}));

function renderPage(page, initialEntry) {
  return render(<MemoryRouter initialEntries={[initialEntry]}>{page}</MemoryRouter>);
}

describe('OAuth-only authentication pages', () => {
  beforeEach(() => {
    mocks.auth = {
      loading: false,
      isAuthenticated: false,
      isConfigured: true,
      signInWithGoogle: vi.fn().mockResolvedValue({ data: {}, error: null }),
      signInWithGitHub: vi.fn().mockResolvedValue({ data: {}, error: null }),
    };
    mocks.userState = { state: { lessons: {} } };
  });

  it('starts login with either provider and contains no password form', async () => {
    renderPage(<Login />, '/login');

    expect(screen.queryByLabelText(/email/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/password/i)).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Continue with Google' }));

    await waitFor(() => expect(mocks.auth.signInWithGoogle).toHaveBeenCalledWith('/dashboard'));
    expect(screen.getByRole('button', { name: 'Continue with GitHub' })).toBeDisabled();
    expect(screen.getByRole('link', { name: 'Continue as guest' })).toHaveAttribute('href', '/dashboard');
  });

  it('sends signup through GitHub and preserves the guest merge message', async () => {
    mocks.userState = {
      state: { lessons: { first: { completedAt: '2026-01-01T00:00:00.000Z' } } },
    };
    renderPage(<SignUp />, '/signup');

    expect(screen.getByText(/1 lesson you have already completed will be merged/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Continue with GitHub' }));

    await waitFor(() => expect(mocks.auth.signInWithGitHub).toHaveBeenCalledWith('/onboarding/level'));
  });

  it('preserves a safe Pro upgrade destination through OAuth signup', async () => {
    renderPage(<SignUp />, '/signup?next=%2Fpricing%3Fcheckout%3Dpro-annual');
    fireEvent.click(screen.getByRole('button', { name: 'Continue with Google' }));

    await waitFor(() => expect(mocks.auth.signInWithGoogle).toHaveBeenCalledWith('/pricing?checkout=pro-annual'));
  });

  it('keeps guest mode available when account infrastructure is unavailable', () => {
    mocks.auth.isConfigured = false;
    renderPage(<Login />, '/login');

    expect(screen.getByRole('button', { name: 'Continue with Google' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Continue with GitHub' })).toBeDisabled();
    expect(screen.getByRole('link', { name: 'Continue as guest' })).toHaveAttribute('href', '/dashboard');
    expect(screen.getByText(/Accounts are not configured/i)).toBeInTheDocument();
  });

  it('shows OAuth initiation errors without navigating away', async () => {
    mocks.auth.signInWithGitHub.mockResolvedValue({ data: null, error: { message: 'Provider disabled.' } });
    renderPage(<Login />, '/login');

    fireEvent.click(screen.getByRole('button', { name: 'Continue with GitHub' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/Provider disabled/i);
    expect(screen.getByRole('button', { name: 'Continue with GitHub' })).toBeEnabled();
  });

  it('redirects authenticated users away after session loading', () => {
    mocks.auth.isAuthenticated = true;
    render(
      <MemoryRouter initialEntries={['/login']}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<p>Dashboard destination</p>} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText('Dashboard destination')).toBeInTheDocument();
  });

  it('redirects authenticated users away from signup to onboarding', () => {
    mocks.auth.isAuthenticated = true;
    render(
      <MemoryRouter initialEntries={['/signup']}>
        <Routes>
          <Route path="/signup" element={<SignUp />} />
          <Route path="/onboarding/level" element={<p>Onboarding destination</p>} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText('Onboarding destination')).toBeInTheDocument();
  });
});
