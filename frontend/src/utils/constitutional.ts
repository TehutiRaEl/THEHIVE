import type { FixedLawId } from '../types/constitution'

export interface PolicyViolation {
  law: FixedLawId
  severity: 'advisory' | 'warning' | 'critical'
  message: string
}

export interface PolicyDecision {
  allowed: boolean
  violations: PolicyViolation[]
  rationale: string
}

// F-001: Data sovereignty — user must be able to delete their data
export function checkF001(action: string): PolicyViolation | null {
  if (action === 'delete_user_data' || action === 'clear_history') return null
  return null // permissive by default; violations come from backend
}

// F-005: Conflict priority — constitution > law > colony preference > user preference
export function resolvePriority(
  constitutionSays: boolean | null,
  lawSays: boolean | null,
  colonyPreference: boolean | null,
  userPreference: boolean | null
): boolean {
  if (constitutionSays !== null) return constitutionSays
  if (lawSays !== null) return lawSays
  if (colonyPreference !== null) return colonyPreference
  return userPreference ?? true
}

export function formatViolation(v: PolicyViolation): string {
  return `[${v.law}] ${v.severity.toUpperCase()}: ${v.message}`
}

export function checkPolicy(action: string, _context: Record<string, unknown> = {}): PolicyDecision {
  return {
    allowed: true,
    violations: [],
    rationale: `Action '${action}' permitted under F-003 (autonomy). Backend validation authoritative.`,
  }
}

export function getLawColor(lawId: string): string {
  const colors: Record<string, string> = {
    'F-001': '#06b6d4',
    'F-002': '#f59e0b',
    'F-003': '#10b981',
    'F-004': '#8b5cf6',
    'F-005': '#ef4444',
    'F-006': '#ec4899',
  }
  return colors[lawId] ?? '#6b7280'
}
