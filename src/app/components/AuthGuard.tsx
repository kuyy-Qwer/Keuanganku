import { useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router";
import { isAuthenticated, refreshActivity, destroySession } from "../lib/authGuard";

/**
 * AuthGuard — wraps protected routes.
 * - Redirects to /login if no valid session
 * - Refreshes activity on user interaction
 * - Listens for inactivity and auto-logs out
 */
export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const checkRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    // Immediate auth check on mount / route change
    if (!isAuthenticated()) {
      destroySession();
      navigate("/login", { replace: true, state: { from: location.pathname } });
      return;
    }

    // Periodic check every 30 seconds for inactivity timeout
    checkRef.current = setInterval(() => {
      if (!isAuthenticated()) {
        destroySession();
        navigate("/login", { replace: true, state: { from: location.pathname } });
      }
    }, 30_000);

    return () => {
      if (checkRef.current) clearInterval(checkRef.current);
    };
  }, [location.pathname]);

  // Refresh activity on any user interaction
  useEffect(() => {
    const events = ["mousedown", "touchstart", "keydown", "scroll", "click"];
    const handler = () => refreshActivity();
    events.forEach(e => window.addEventListener(e, handler, { passive: true }));
    return () => events.forEach(e => window.removeEventListener(e, handler));
  }, []);

  if (!isAuthenticated()) return null;

  return <>{children}</>;
}
