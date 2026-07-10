export interface FixedLaw {
  id: string
  title: string
  description: string
}

export interface Constitution {
  fixedLaws: FixedLaw[]
  mutableLaws: FixedLaw[]
  version: string
  lastUpdated: string
}

// EVW wealth formula: W_total = sqrt(TWW × VWW)
// TWW = timeWealth, VWW = valueWealth (from F-002)
export function calculateWealth(timeWealth: number, valueWealth: number): number {
  if (timeWealth <= 0 || valueWealth <= 0) return 0
  return Math.sqrt(timeWealth * valueWealth)
}

// EVW score for a single contribution
export function calculateEVW(
  hoursSaved: number,
  adoptionCount: number,
  noveltyScore: number,
  disputeResilience: number
): number {
  return hoursSaved * 0.4 + adoptionCount * 0.3 + noveltyScore * 0.2 + disputeResilience * 0.1
}

export const FIXED_LAW_IDS = ['F-001', 'F-002', 'F-003', 'F-004', 'F-005', 'F-006'] as const
export type FixedLawId = (typeof FIXED_LAW_IDS)[number]
