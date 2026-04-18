export const LOGIN_ATTEMPT_KEY = 'luminary_login_attempts';
export const MAX_LOGIN_ATTEMPTS = 5;

// Progressive lockout: 30s → 2min → 5min → 15min → 30min
const LOCKOUT_DURATIONS_MS = [30_000, 120_000, 300_000, 900_000, 1_800_000];

interface LoginAttemptState {
  count: number;
  lockedUntil: number | null;
  lockoutLevel: number; // tracks how many times user has been locked out
}

function readAttemptState(): LoginAttemptState {
  try {
    const raw = localStorage.getItem(LOGIN_ATTEMPT_KEY);
    if (!raw) return { count: 0, lockedUntil: null, lockoutLevel: 0 };
    const parsed = JSON.parse(raw) as LoginAttemptState;
    return {
      count: Number(parsed.count) || 0,
      lockedUntil: typeof parsed.lockedUntil === 'number' ? parsed.lockedUntil : null,
      lockoutLevel: Number(parsed.lockoutLevel) || 0,
    };
  } catch {
    return { count: 0, lockedUntil: null, lockoutLevel: 0 };
  }
}

function writeAttemptState(state: LoginAttemptState) {
  localStorage.setItem(LOGIN_ATTEMPT_KEY, JSON.stringify(state));
}

export function validatePinStrength(pin: string, L: (id: string, en: string) => string): string | null {
  if (!/^\d{6}$/.test(pin)) {
    return L('PIN harus terdiri dari 6 digit angka', 'PIN must be exactly 6 digits');
  }
  if (/^(\d)\1{5}$/.test(pin)) {
    return L('PIN tidak boleh semua digit sama', 'PIN cannot use the same digit repeatedly');
  }
  const ascending = '0123456789';
  const descending = '9876543210';
  if (ascending.includes(pin) || descending.includes(pin)) {
    return L('PIN tidak boleh berurutan seperti 123456', 'PIN cannot be sequential like 123456');
  }
  return null;
}

export function getLoginLockoutRemaining(): number {
  const state = readAttemptState();
  if (!state.lockedUntil) return 0;
  return Math.max(0, state.lockedUntil - Date.now());
}

export function registerFailedLoginAttempt(): { remainingAttempts: number; lockedUntil: number | null } {
  const state = readAttemptState();
  const nextCount = state.count + 1;

  if (nextCount >= MAX_LOGIN_ATTEMPTS) {
    // Progressive lockout duration
    const level = Math.min(state.lockoutLevel, LOCKOUT_DURATIONS_MS.length - 1);
    const duration = LOCKOUT_DURATIONS_MS[level];
    const lockedUntil = Date.now() + duration;
    writeAttemptState({ count: 0, lockedUntil, lockoutLevel: state.lockoutLevel + 1 });
    return { remainingAttempts: 0, lockedUntil };
  }

  writeAttemptState({ ...state, count: nextCount, lockedUntil: null });
  return { remainingAttempts: MAX_LOGIN_ATTEMPTS - nextCount, lockedUntil: null };
}

export function resetLoginAttempts() {
  // Keep lockoutLevel to maintain progressive lockout history
  const state = readAttemptState();
  writeAttemptState({ count: 0, lockedUntil: null, lockoutLevel: state.lockoutLevel });
}

export function getLockoutLevel(): number {
  return readAttemptState().lockoutLevel;
}
