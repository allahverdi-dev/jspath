import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { AppRouter } from './router.jsx';
import { ThemeProvider } from '../state/ThemeProvider.jsx';
import { ToastProvider } from '../state/ToastProvider.jsx';
import { AuthProvider } from '../state/AuthProvider.jsx';
import { UserStateProvider, useUserState } from '../state/UserStateProvider.jsx';
import { ErrorBoundary } from '../components/feedback/ErrorBoundary.jsx';
import { RouteError } from '../components/feedback/RouteError.jsx';

/** Scroll to the top on navigation, unless the browser is restoring a position. */
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
  }, [pathname]);
  return null;
}

/** Apply learner display preferences that live outside the theme system. */
function PreferencesEffect() {
  const { state } = useUserState();
  const { reduceMotion, fontScale } = state.settings;

  useEffect(() => {
    document.documentElement.classList.toggle('reduce-motion', Boolean(reduceMotion));
  }, [reduceMotion]);

  useEffect(() => {
    document.documentElement.style.fontSize = `${Math.round(16 * (fontScale || 1))}px`;
  }, [fontScale]);

  return null;
}

export function App() {
  return (
    <ErrorBoundary fallback={(props) => <RouteError {...props} />}>
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <UserStateProvider>
              <PreferencesEffect />
              <ScrollToTop />
              <AppRouter />
            </UserStateProvider>
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
