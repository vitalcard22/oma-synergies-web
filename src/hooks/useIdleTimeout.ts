import { useCallback, useEffect, useRef, useState } from 'react';

const ACTIVITY_EVENTS = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click'];

interface UseIdleTimeoutOptions {
  /** Only runs the timer while true - pass false when logged out / still loading. */
  enabled: boolean;
  /** Total idle time (ms) before onTimeout fires, measured from the last activity. */
  idleMs: number;
  /** How long (ms) before the idle deadline the warning is shown. */
  warningMs: number;
  /** Called once when the idle deadline is reached (e.g. sign the user out). */
  onTimeout: () => void;
}

/**
 * Idle/inactivity auto-logout. Tracks mouse/keyboard/touch/scroll activity
 * and fires onTimeout after idleMs of silence, showing a countdown warning
 * for the last warningMs of that window first.
 *
 * Once the warning is showing, ambient activity (a stray mouse jiggle) does
 * NOT dismiss it - only an explicit call to stayActive() does (wired to a
 * "Stay signed in" button). This mirrors how banking-style session timeouts
 * behave: a screen left open on a desk shouldn't get silently kept alive
 * forever by incidental motion near it.
 */
export function useIdleTimeout({ enabled, idleMs, warningMs, onTimeout }: UseIdleTimeoutOptions) {
  const [warning, setWarningState] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(Math.round(warningMs / 1000));

  const warningRef = useRef(false);
  const idleTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const warnTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const countdownInterval = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const onTimeoutRef = useRef(onTimeout);
  onTimeoutRef.current = onTimeout;

  const setWarning = useCallback((v: boolean) => {
    warningRef.current = v;
    setWarningState(v);
  }, []);

  const clearTimers = useCallback(() => {
    clearTimeout(idleTimer.current);
    clearTimeout(warnTimer.current);
    clearInterval(countdownInterval.current);
  }, []);

  // Arms (or re-arms) the full idle window. Called on startup, on every
  // qualifying activity event, and by the "Stay signed in" button.
  const arm = useCallback(() => {
    clearTimers();
    setWarning(false);
    if (!enabled) return;

    const untilWarning = Math.max(idleMs - warningMs, 0);
    warnTimer.current = setTimeout(() => {
      setWarning(true);
      let remaining = Math.round(warningMs / 1000);
      setSecondsLeft(remaining);
      countdownInterval.current = setInterval(() => {
        remaining -= 1;
        setSecondsLeft(remaining);
        if (remaining <= 0) clearInterval(countdownInterval.current);
      }, 1000);
    }, untilWarning);

    idleTimer.current = setTimeout(() => {
      clearTimers();
      onTimeoutRef.current();
    }, idleMs);
  }, [enabled, idleMs, warningMs, clearTimers, setWarning]);

  const handleActivity = useCallback(() => {
    if (warningRef.current) return; // warning is up - require the explicit button
    arm();
  }, [arm]);

  useEffect(() => {
    if (!enabled) {
      clearTimers();
      setWarning(false);
      return;
    }
    arm();
    ACTIVITY_EVENTS.forEach((evt) => window.addEventListener(evt, handleActivity));
    return () => {
      ACTIVITY_EVENTS.forEach((evt) => window.removeEventListener(evt, handleActivity));
      clearTimers();
    };
  }, [enabled, arm, handleActivity, clearTimers, setWarning]);

  return { warning, secondsLeft, stayActive: arm };
}
