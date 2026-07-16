import { API_BASE_URL } from '../utils/constants'

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}/v11${path}`
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(err.detail ?? `HTTP ${res.status}`)
  }
  return res.json()
}

// Health
export const getHealth = () => apiFetch<{ status: string; version: string }>('/health')

// Hive
export const getHiveStatus = () =>
  apiFetch<{ colonies: Record<string, unknown>; timestamp: string }>('/hive/status')

// Agents
export const getAgents = () => apiFetch<{ agents: unknown[] }>('/agents')
export const reproduceAgent = (data: unknown) =>
  apiFetch<unknown>('/agents/reproduce', { method: 'POST', body: JSON.stringify(data) })

// Arena
export const getArenaChallenges = () =>
  apiFetch<{ challenges: unknown[] }>('/arena/challenges')
export const getArenaFallen = () =>
  apiFetch<{ hall_of_fallen_ideas: unknown[] }>('/arena/fallen')
export const createChallenge = (data: { challenger: string; challenged: string; proposition: string }) =>
  apiFetch<{ challenge_id: number; status: string }>('/arena/challenge', {
    method: 'POST',
    body: JSON.stringify(data),
  })
export const resolveChallenge = (id: number) =>
  apiFetch<{ challenge_id: number; winner: string; loser: string }>(`/arena/resolve/${id}`, {
    method: 'POST',
  })
export const projectArena = (id: number) =>
  apiFetch<{ challenge_id: number; projection: unknown; frames_url: string }>(
    `/arena/project/${id}`,
    { method: 'POST' }
  )
export const getArenaFrames = (id: number) =>
  apiFetch<{ frames: unknown[] }>(`/arena/projection/${id}/frames`)

// Governance
export const getGovernanceLog = (limit = 50) =>
  apiFetch<{ entries: unknown[]; count: number }>(`/governance/log?limit=${limit}`)
export const getGovernanceStatus = () => apiFetch<Record<string, unknown>>('/governance/status')
export const submitVote = (data: { proposal_id: string; voter: string; vote: string; rationale?: string }) =>
  apiFetch<unknown>(`/governance/vote?proposal_id=${data.proposal_id}&voter=${data.voter}&vote=${data.vote}&rationale=${data.rationale ?? ''}`, {
    method: 'POST',
  })

// Genesis / Missions
export const getGaps = () => apiFetch<unknown[]>('/genesis/gaps')
export const getMissions = () => apiFetch<unknown[]>('/genesis/missions')
export const getMission = (id: string) => apiFetch<unknown>(`/genesis/missions/${id}`)
export const proposeMission = (data: unknown) =>
  apiFetch<unknown>('/genesis/missions/propose', { method: 'POST', body: JSON.stringify(data) })
export const activateMission = (id: string) =>
  apiFetch<unknown>(`/genesis/missions/${id}/activate`, { method: 'POST' })
export const updateMissionStatus = (id: string, status: string, notes = '') =>
  apiFetch<unknown>(`/genesis/missions/${id}/status?status=${status}&notes=${encodeURIComponent(notes)}`, {
    method: 'PATCH',
  })

// Wallet / Economy
export const getSoulLeaderboard = () =>
  apiFetch<{ leaderboard: Array<{ agent: string; soul: number }> }>('/wallet/leaderboard/soul')
export const getGradingLeaderboard = () =>
  apiFetch<{ leaderboard: Array<{ agent_name: string; rating: number }> }>('/grading/leaderboard')

// Constitution
export const getConstitution = () => apiFetch<unknown>('/constitution/soul')
export const getConstitutionLaws = () => apiFetch<unknown>('/constitution')
export const getConstitutionHistory = () => apiFetch<unknown[]>('/constitution/history')

// Memory Graph
export const getMemoryGraph = () => apiFetch<unknown>('/memory/graph')

// Tesseract
export const getTesseractProject = (wAngle = 0, xwAngle = 0) =>
  apiFetch<{ vertices: unknown[]; edges: unknown[] }>(
    `/tesseract/project?w_angle=${wAngle}&xw_angle=${xwAngle}`
  )

// Tasks
export const getTasks = () => apiFetch<{ tasks: unknown[] }>('/tasks')

// LLM
export const getLLMStatus = () => apiFetch<{ active_provider: string; providers: unknown[] }>('/llm/status')

// Tier3 status
export const getTier3Status = () => apiFetch<Record<string, unknown>>('/tier3/status')

// Dream
export const getDreamStatus = () =>
  apiFetch<unknown>('/dream/status').catch(() => ({ status: 'unavailable' }))

// Auth
export const getToken = () =>
  apiFetch<{ access_token: string; token_type: string; tier: string }>('/auth/token')