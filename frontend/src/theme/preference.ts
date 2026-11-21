// The visitor's display choices: colour theme (Light / Dark / System) and
// animations (On / Off). Saved in this browser only (localStorage), applied to
// <html> as data-theme / data-motion so styles/theme.css can do the rest.
// Default: follow the device's light/dark setting, animations on.
import { useSyncExternalStore } from 'react';

export type ThemeChoice = 'system' | 'light' | 'dark';
export type ThemeResolved = 'light' | 'dark';

const THEME_KEY = 'hive-theme';
const MOTION_KEY = 'hive-animations';

export const DEFAULTS = { theme: 'system' as ThemeChoice, animations: true };

function read(key: string): string | null {
  try { return window.localStorage.getItem(key); } catch { return null; }
}
function write(key: string, value: string | null) {
  try {
    if (value === null) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, value);
  } catch { /* private mode / blocked storage: the choice still applies for this visit */ }
}

const media = () => (typeof window !== 'undefined' && window.matchMedia ? window.matchMedia('(prefers-color-scheme: light)') : null);

export function resolveTheme(choice: ThemeChoice): ThemeResolved {
  if (choice === 'light' || choice === 'dark') return choice;
  return media()?.matches ? 'light' : 'dark';
}

let state = { ...DEFAULTS };
const listeners = new Set<() => void>();
let snapshot = { ...state, resolved: 'dark' as ThemeResolved };

function apply() {
  const resolved = resolveTheme(state.theme);
  const root = document.documentElement;
  root.setAttribute('data-theme', resolved);
  root.setAttribute('data-motion', state.animations ? 'on' : 'off');
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', resolved === 'light' ? '#f1f4f9' : '#0A0E2A');
  snapshot = { ...state, resolved };
  listeners.forEach((l) => l());
}

export function initDisplayPreferences() {
  const t = read(THEME_KEY);
  state = {
    theme: t === 'light' || t === 'dark' || t === 'system' ? t : DEFAULTS.theme,
    animations: read(MOTION_KEY) !== 'off',
  };
  apply();
  // "System" follows the device live (e.g. sunset auto-switch).
  media()?.addEventListener?.('change', () => { if (state.theme === 'system') apply(); });
}

export function setTheme(choice: ThemeChoice) {
  state = { ...state, theme: choice };
  write(THEME_KEY, choice === DEFAULTS.theme ? null : choice);
  apply();
}

export function setAnimations(on: boolean) {
  state = { ...state, animations: on };
  write(MOTION_KEY, on ? null : 'off');
  apply();
}

export function resetDisplayPreferences() {
  state = { ...DEFAULTS };
  write(THEME_KEY, null);
  write(MOTION_KEY, null);
  apply();
}

function subscribe(l: () => void) { listeners.add(l); return () => { listeners.delete(l); }; }
const get = () => snapshot;

export function useDisplayPreferences() {
  return useSyncExternalStore(subscribe, get, get);
}
