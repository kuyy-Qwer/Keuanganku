import { useEffect, useRef } from "react";
import { Navigate, useLocation } from "react-router";
import { isAuthenticated, refreshActivity, destroySession, userHasPin } from '@/app/lib/authGuard';

/**
 * AuthGuard — wraps protected routes.
 * - Checks if onboarding is completed first
 * - If user has no PIN set, allows direct access (no login required)
 * - If user has PIN, redirects to /login if no valid session
 * - Refreshes activity on user interaction
 * - Listens for inactivity and auto-logs out
 */
export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const checkRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const onboardingCompleted = localStorage.getItem('onboarding_completed') === 'true';
  const authenticated = isAuthenticated();

  // Periodic inactivity check (only if user has PIN and is authenticated)
  useEffect(() => {
    if (!onboardingCompleted || !authenticated || !userHasPin()) return;

    checkRef.current = setInterval(() => {
      if (!isAuthenticated()) {
        destroySession();
        window.location.replace('/login');
      }
    }, 30_000);

    return () => {
      if (checkRef.current) clearInterval(checkRef.current);
    };
  }, [location.pathname, onboardingCompleted, authenticated]);

  // Refresh activity on any user interaction (only if user has PIN)
  useEffect(() => {
    if (!userHasPin()) return;

    const events = ["mousedown", "touchstart", "keydown", "scroll", "click"];
    const handler = () => refreshActivity();
    events.forEach(e => window.addEventListener(e, handler, { passive: true }));
    return () => events.forEach(e => window.removeEventListener(e, handler));
  }, []);

  // Redirect if onboarding not completed
  if (!onboardingCompleted) {
    return <Navigate to="/" replace />;
  }

  // Redirect if not authenticated
  if (!authenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
}
