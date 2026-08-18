import { useEffect, useState, useCallback, useRef } from 'react';
import { API_BASE_URL } from '../utils/constants';

// Wires ColonyCard to the real GET /v11/debug/colony-ping route (worker/src/index.js).
// That route's own comment is explicit about its limits: "edge cannot reach colony
// origins directly; live colony health runs in the colony-health GitHub workflow" —
// so `reachable` here is 'checked-in-ci' for every colony today, not a live per-request
// probe. We surface that string as-is rather than dressing it up as a real health
// check, and we stamp `lastVerified` with the moment THIS client actually got a
// response, so a stale poll is visible instead of silently trusted (named requirement
// from this session's own dual-lens pass on this plan, not optional polish).

export interface ColonyPingEntry {
  name: string;
  reachable: string;
}

export interface ColonyPingResponse {
  queen: { name: string; healthy: boolean };
  colonies: ColonyPingEntry[];
  note?: string;
}

export interface ColonyPingState {
  data: ColonyPingResponse | null;
  byName: Record<string, ColonyPingEntry>;
  loading: boolean;
  error: string | null;
  /** Wall-clock time of the last successful response from this client, or null if never. */
  lastVerified: Date | null;
  refresh: () => void;
}

const POLL_MS = 60_000;

export function useColonyPing(): ColonyPingState {
  const [data, setData] = useState<ColonyPingResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastVerified, setLastVerified] = useState<Date | null>(null);
  const mounted = useRef(true);

  const fetchPing = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/v11/debug/colony-ping`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const body = (await res.json()) as ColonyPingResponse;
      if (!mounted.current) return;
      setData(body);
      setLastVerified(new Date());
      setError(null);
    } catch (e) {
      if (!mounted.current) return;
      setError(e instanceof Error ? e.message : 'colony-ping fetch failed');
    } finally {
      if (mounted.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    mounted.current = true;
    fetchPing();
    const id = setInterval(fetchPing, POLL_MS);
    return () => {
      mounted.current = false;
      clearInterval(id);
    };
  }, [fetchPing]);

  const byName: Record<string, ColonyPingEntry> = {};
  for (const c of data?.colonies ?? []) byName[c.name] = c;

  return { data, byName, loading, error, lastVerified, refresh: fetchPing };
}

export default useColonyPing;
