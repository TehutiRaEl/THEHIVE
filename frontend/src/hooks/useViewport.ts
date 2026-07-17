import { useEffect, useState } from 'react';

const DESKTOP_QUERY = '(min-width: 1024px)';
const FORCE_DESKTOP_KEY = 'kaiel.forceDesktop';

/**
 * Is the *actual* viewport desktop-width? Tracks the (min-width:1024px) media
 * query. SSR-safe default of `true` (assume desktop until the browser tells us
 * otherwise) so a hydration flash never collapses the desktop shell.
 */
export function useIsWideViewport(): boolean {
  const [wide, setWide] = useState(() =>
    typeof window === 'undefined' ? true : window.matchMedia(DESKTOP_QUERY).matches
  );
  useEffect(() => {
    const mq = window.matchMedia(DESKTOP_QUERY);
    const onChange = () => setWide(mq.matches);
    onChange();
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return wide;
}

/**
 * "Request desktop view" — a persisted override so the founder can force the
 * full three-column desktop shell on a phone (panned via horizontal scroll),
 * independent of the browser's own "request desktop site". Persisted in
 * localStorage so it survives reloads.
 */
export function useForceDesktop(): [boolean, (v: boolean) => void] {
  const [force, setForce] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.localStorage.getItem(FORCE_DESKTOP_KEY) === '1';
  });
  const set = (v: boolean) => {
    setForce(v);
    try {
      if (v) window.localStorage.setItem(FORCE_DESKTOP_KEY, '1');
      else window.localStorage.removeItem(FORCE_DESKTOP_KEY);
    } catch {
      /* storage disabled (private mode) — the in-memory value still applies for this session */
    }
  };
  return [force, set];
}
