/**
 * Auth Guard — session management & route protection
 * Handles: session tokens, inactivity timeout, auth state
 */

const SESSION_KEY = "luminary_session";
const INACTIVITY_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes

interface Session {
  token: string;
  createdAt: number;
  lastActivity: number;
}

function generateToken(): string {
  const arr = new Uint8Array(16);
  crypto.getRandomValues(arr);
  return Array.from(arr).map(b => b.toString(16).padStart(2, "0")).join("");
}

function readSession(): Session | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Session;
  } catch {
    return null;
  }
}

function writeSession(session: Session) {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

/** Create a new authenticated session after successful PIN login */
export function createSession(): void {
  const session: Session = {
    token: generateToken(),
    createdAt: Date.now(),
    lastActivity: Date.now(),
  };
  writeSession(session);
}

/** Destroy the current session (logout) */
export function destroySession(): void {
  sessionStorage.removeItem(SESSION_KEY);
}

/** Check if user has set a PIN in settings */
export function userHasPin(): boolean {
  try {
    const raw = localStorage.getItem("luminary_user");
    if (!raw) return false;
    const user = JSON.parse(raw);
    // Check if PIN exists and is not empty or default "123456"
    return user.pin && user.pin.trim() !== "" && user.pin !== "123456";
  } catch {
    return false;
  }
}

/** Check if a valid session exists and is not expired due to inactivity */
export function isAuthenticated(): boolean {
  // If user hasn't set a PIN, they don't need to login
  if (!userHasPin()) return true;

  const session = readSession();
  if (!session) return false;

  const now = Date.now();
  const inactive = now - session.lastActivity;

  if (inactive > INACTIVITY_TIMEOUT_MS) {
    destroySession();
    return false;
  }

  return true;
}

/** Refresh the last activity timestamp — call on user interactions */
export function refreshActivity(): void {
  const session = readSession();
  if (!session) return;
  writeSession({ ...session, lastActivity: Date.now() });
}

/** Get remaining session time in seconds */
export function getSessionTimeoutRemaining(): number {
  const session = readSession();
  if (!session) return 0;
  const elapsed = Date.now() - session.lastActivity;
  return Math.max(0, Math.floor((INACTIVITY_TIMEOUT_MS - elapsed) / 1000));
}
