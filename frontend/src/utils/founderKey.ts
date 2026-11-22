// The founder key, kept in THIS browser only so the founder can talk to Kai El.
//
// Commune with Kai El (POST /v11/command_text) is founder-only (decision S-4, 2026-11-22): the
// Worker refuses any request without the founder key as a Bearer token. The founder pastes the key
// once into the chat panel; it is stored in this browser's localStorage and sent only to this app's
// own Worker as an Authorization header. It is never put in a URL, never logged, and "Forget key"
// removes it. Honest limit: anything stored in a browser can be read by a script that runs on this
// page, so use the key only on a device and browser you trust, and rotate it if you stop trusting one.
import { useSyncExternalStore } from 'react';

const STORAGE_KEY = 'hive-founder-key';
const listeners = new Set<() => void>();

function read(): string | null {
  try {
    const v = window.localStorage.getItem(STORAGE_KEY);
    return v && v.trim() ? v.trim() : null;
  } catch {
    return null;
  }
}

let current: string | null = typeof window === 'undefined' ? null : read();

function emit() { listeners.forEach((l) => l()); }

export function getFounderKey(): string | null { return current; }

export function setFounderKey(key: string): boolean {
  const k = key.trim();
  if (!k) return false;
  current = k;
  try { window.localStorage.setItem(STORAGE_KEY, k); } catch { /* storage blocked: the key still works until the page closes */ }
  emit();
  return true;
}

export function clearFounderKey(): void {
  current = null;
  try { window.localStorage.removeItem(STORAGE_KEY); } catch { /* nothing stored to remove */ }
  emit();
}

/** Headers to add to a founder-only request; empty when no key is set. */
export function founderAuthHeader(): Record<string, string> {
  return current ? { Authorization: `Bearer ${current}` } : {};
}

function subscribe(l: () => void) { listeners.add(l); return () => { listeners.delete(l); }; }

export function useFounderKey(): string | null {
  return useSyncExternalStore(subscribe, getFounderKey, getFounderKey);
}
