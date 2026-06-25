import { useEffect, useMemo, useRef } from "react";

export interface DebouncedCallback<Args extends unknown[]> {
  /** Schedule the callback to run after the delay, resetting any pending run. */
  run: (...args: Args) => void;
  /** Immediately invoke the callback with the last scheduled args (if any pending), cancelling the timer. */
  flush: () => void;
  /** Cancel any pending run without invoking the callback. */
  cancel: () => void;
}

/**
 * A debounced wrapper around `callback` with a stable identity across renders.
 *
 * The timer id lives in a ref and is always cleared before re-scheduling and on
 * unmount, so a pending call can never fire after the component is gone.
 * The latest `callback`/`delay` are read through refs, so changing them never
 * resets a pending timer or invalidates the returned handle.
 */
export function useDebouncedCallback<Args extends unknown[]>(
  callback: (...args: Args) => void,
  delay: number,
): DebouncedCallback<Args> {
  const callbackRef = useRef(callback);
  const delayRef = useRef(delay);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingArgsRef = useRef<Args | null>(null);

  // Keep the latest callback/delay without changing the handle's identity.
  useEffect(() => {
    callbackRef.current = callback;
    delayRef.current = delay;
  });

  // Clear any pending timer when the component unmounts.
  useEffect(
    () => () => {
      if (timerRef.current !== null) clearTimeout(timerRef.current);
    },
    [],
  );

  return useMemo<DebouncedCallback<Args>>(() => {
    const clear = () => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };

    const cancel = () => {
      clear();
      pendingArgsRef.current = null;
    };

    const flush = () => {
      clear();
      if (pendingArgsRef.current !== null) {
        const args = pendingArgsRef.current;
        pendingArgsRef.current = null;
        callbackRef.current(...args);
      }
    };

    const run = (...args: Args) => {
      clear();
      pendingArgsRef.current = args;
      timerRef.current = setTimeout(() => {
        timerRef.current = null;
        pendingArgsRef.current = null;
        callbackRef.current(...args);
      }, delayRef.current);
    };

    return { run, flush, cancel };
  }, []);
}
