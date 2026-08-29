import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthLayout } from '../layouts/AuthLayout.jsx';
import { Button, Input, Icon } from '../components/ui/index.jsx';
import { useAuth } from '../state/AuthProvider.jsx';
import { useToast } from '../state/ToastProvider.jsx';

export default function Login() {
  const { signIn, signInWithGoogle, resetPassword, isConfigured } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);

  const validate = () => {
    const next = {};
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) next.email = 'Enter a valid email address.';
    if (form.password.length < 6) next.password = 'Your password is at least 6 characters.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setBusy(true);
    const { error } = await signIn(form);
    setBusy(false);
    if (error) {
      setErrors({ form: error.message });
      return;
    }
    toast.show({ tone: 'success', title: 'Welcome back' });
    navigate('/dashboard');
  };

  const forgot = async () => {
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) {
      setErrors({ email: 'Enter your email address first, then choose "Forgot password".' });
      return;
    }
    const { error } = await resetPassword(form.email);
    toast.show(
      error
        ? { tone: 'error', title: 'Could not send reset email', message: error.message }
        : { tone: 'success', title: 'Reset email sent', message: 'Check your inbox for the link.' },
    );
  };

  return (
    <AuthLayout
      title="Log in"
      subtitle="Pick up where you left off."
      footer={<>New here? <Link to="/signup" className="text-primary-ink underline underline-offset-2">Create an account</Link></>}
    >
      {!isConfigured && (
        <div className="mb-5 rounded border border-info/30 bg-info/5 px-3 py-2.5 font-body-sm text-on-surface-variant">
          <Icon name="info" size={15} className="mr-1.5 inline text-info" />
          Accounts are not configured for this deployment. You can{' '}
          <Link to="/dashboard" className="text-primary-ink underline underline-offset-2">continue as a guest</Link>{' '}
          — every lesson, exercise and challenge works, saved in this browser.
        </div>
      )}

      <form onSubmit={submit} noValidate className="space-y-4">
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
              autoComplete="current-password"
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
          <button type="button" onClick={forgot} disabled={!isConfigured} className="mt-2 font-body-sm text-on-surface-variant underline underline-offset-2 transition hover:text-on-surface disabled:opacity-50">
            Forgot password?
          </button>
        </div>

        {errors.form && (
          <p className="rounded border border-error/40 bg-error/5 px-3 py-2 font-body-sm text-error" role="alert">
            {errors.form}
          </p>
        )}

        <Button type="submit" className="w-full" loading={busy} disabled={!isConfigured}>Log in</Button>

        {isConfigured && (
          <Button type="button" variant="secondary" className="w-full" onClick={signInWithGoogle}>
            Continue with Google
          </Button>
        )}

        <div className="flex items-center gap-3 py-1">
          <span className="h-px flex-1 bg-outline-variant" />
          <span className="font-mono text-label-caps uppercase tracking-wider text-on-surface-variant">or</span>
          <span className="h-px flex-1 bg-outline-variant" />
        </div>

        <Button as={Link} to="/dashboard" variant="ghost" className="w-full">Continue as guest</Button>
      </form>
    </AuthLayout>
  );
}
