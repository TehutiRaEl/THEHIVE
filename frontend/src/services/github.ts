import { API_BASE_URL } from '../utils/constants'

const REPO = 'TehutiRaEl/THEHIVE'
const DISPATCH_URL = `https://api.github.com/repos/${REPO}/dispatches`
const RUNS_URL = `https://api.github.com/repos/${REPO}/actions/workflows/grok-bridge.yml/runs`

export async function sendGrokBridgeDispatch(
  token: string,
  files: Array<{ path: string; content: string }>,
  message: string
): Promise<void> {
  const res = await fetch(DISPATCH_URL, {
    method: 'POST',
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
    body: JSON.stringify({
      event_type: 'grok-push',
      client_payload: { message, files },
    }),
  })
  if (!res.ok && res.status !== 204) {
    const err = await res.json().catch(() => ({}))
    throw new Error(`GitHub API error ${res.status}: ${JSON.stringify(err)}`)
  }
}

// Real bug found + fixed 2026-08-02 (task 5): this previously hardcoded
// `https://thehive.workers.dev/...` — a domain that does not exist for this
// Worker (the real production origin, confirmed against worker/src/index.js's
// own CORS allowlist, is thehive.sovereignhive.workers.dev). Using
// API_BASE_URL (empty string in prod, so this resolves same-origin, matching
// every other live /v11 call in this app) both fixes the wrong domain and
// keeps this file from drifting from the real origin again.
export async function fetchGrokToken(grokBridgeKey: string): Promise<string> {
  const res = await fetch(`${API_BASE_URL}/v11/bridge/grok-token`, {
    headers: { 'X-Grok-Key': grokBridgeKey },
  })
  if (!res.ok) throw new Error(`Bridge error ${res.status}`)
  const data = await res.json()
  return data.github_token as string
}

export interface GrokBridgeRun {
  id: number
  status: string // 'queued' | 'in_progress' | 'completed'
  conclusion: string | null // 'success' | 'failure' | ... | null while not completed
  html_url: string
  created_at: string
}

// The return path (task 5, 2026-08-02): repository_dispatch's own POST
// response is just a bare 204 — GitHub never hands back a run id inline. The
// only real way to know what happened is to look up the workflow's runs list
// afterward and find the one that started after we dispatched. Bounded, not
// a raw poll-forever loop — the caller decides how many times to call this.
export async function findGrokBridgeRun(token: string, afterISO: string): Promise<GrokBridgeRun | null> {
  const res = await fetch(`${RUNS_URL}?event=repository_dispatch&per_page=5`, {
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'X-GitHub-Api-Version': '2022-11-28',
    },
  })
  if (!res.ok) throw new Error(`GitHub Actions API error ${res.status}`)
  const data = await res.json()
  const runs = (data.workflow_runs || []) as GrokBridgeRun[]
  // Newest run created at/after our dispatch, allowing a few seconds of
  // clock skew between this browser and GitHub's own timestamps.
  const after = new Date(afterISO).getTime() - 5000
  const match = runs.find((r) => new Date(r.created_at).getTime() >= after)
  return match ?? null
}
