const REPO = 'TehutiRaEl/THEHIVE'
const DISPATCH_URL = `https://api.github.com/repos/${REPO}/dispatches`

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

export async function fetchGrokToken(grokBridgeKey: string): Promise<string> {
  const res = await fetch('https://thehive.workers.dev/v11/bridge/grok-token', {
    headers: { 'X-Grok-Key': grokBridgeKey },
  })
  if (!res.ok) throw new Error(`Bridge error ${res.status}`)
  const data = await res.json()
  return data.github_token as string
}
