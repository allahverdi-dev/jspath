import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthLayout } from '../layouts/AuthLayout.jsx';
import { Button, Input, Icon, ProgressBar } from '../components/ui/index.jsx';
import { useAuth } from '../state/AuthProvider.jsx';
import { useToast } from '../state/ToastProvider.jsx';
import { useUserState } from '../state/UserStateProvider.jsx';

/** Simple, honest strength signal — length and variety, no false precision. */
function strength(password) {
  let score = 0;
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  return Math.min(score, 4);
}

const LABELS = ['Very weak', 'Weak', 'Fair', 'Good', 'Strong'];

export default function SignUp() {
  const { signUp, signInWithGoogle, isConfigured } = useAuth();
  const { state } = useUserState();
  const navigate = useNavigate();
  const toast = useToast();

  const [form, setForm] = useState({ displayName: '', email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);

  const completed = Object.values(state.lessons).filter((l) => l.completedAt).length;
  const score = strength(form.password);

  const validate = () => {
    const next = {};
    if (form.displayName.trim().length < 2) next.displayName = 'Tell us what to call you.';
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) next.email = 'Enter a valid email address.';
    if (form.password.length < 8) next.password = 'Use at least 8 characters.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setBusy(true);
    const { error } = await signUp(form);
    setBusy(false);
    if (error) {
      setErrors({ form: error.message });
      return;
    }
    toast.show({ tone: 'success', title: 'Account created', message: 'Your guest progress has been kept.' });
    navigate('/onboarding/level');
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Free, and it syncs your progress across devices."
      footer={<>Already have an account? <Link to="/login" className="text-primary-ink underline underline-offset-2">Log in</Link></>}
    >
      {completed > 0 && (
        <div className="mb-5 rounded border border-success/30 bg-success/5 px-3 py-2.5 font-body-sm text-on-surface-variant">
          <Icon name="check_circle" size={15} className="mr-1.5 inline text-success" />
          The {completed} lesson{completed === 1 ? '' : 's'} you have already completed will be merged
          into your new account.
        </div>
      )}

      {!isConfigured && (
        <div className="mb-5 rounded border border-info/30 bg-info/5 px-3 py-2.5 font-body-sm text-on-surface-variant">
          <Icon name="info" size={15} className="mr-1.5 inline text-info" />
          Accounts are not configured for this deployment.{' '}
          <Link to="/onboarding/level" className="text-primary-ink underline underline-offset-2">Start learning as a guest</Link>{' '}
          — nothing is gated behind an account.
        </div>
      )}

      <form onSubmit={submit} noValidate className="space-y-4">
        <Input
          label="Display name"
          autoComplete="name"
          value={form.displayName}
          onChange={(e) => setForm({ ...form, displayName: e.target.value })}
          error={errors.displayName}
          disabled={!isConfigured}
        />
        <Input
          label="Email"
          type="email"
          autoComplete="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          error={errors.email}
          disabled={!isConfigured}
        />

        <div>
          <div className="relative">
            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              error={errors.password}
              disabled={!isConfigured}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-2 top-[2.1rem] rounded p-1.5 text-on-surface-variant transition hover:text-on-surface"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              <Icon name={showPassword ? 'visibility_off' : 'visibility'} size={18} />
            </button>
          </div>
          {form.password && (
            <div className="mt-2">
              <ProgressBar value={score / 4} tone={score >= 3 ? 'success' : 'primary'} label="Password strength" />
              <p className="mt-1 font-body-sm text-on-surface-variant">{LABELS[score]}</p>
            </div>
          )}
        </div>

        {errors.form && (
          <p className="rounded border border-error/40 bg-error/5 px-3 py-2 font-body-sm text-error" role="alert">
            {errors.form}
          </p>
        )}

        <Button type="submit" className="w-full" loading={busy} disabled={!isConfigured}>Create account</Button>
        {isConfigured && (
          <Button type="button" variant="secondary" className="w-full" onClick={signInWithGoogle}>
            Continue with Google
          </Button>
        )}
        <Button as={Link} to="/onboarding/level" variant="ghost" className="w-full">Continue as guest</Button>
      </form>
    </AuthLayout>
  );
}
