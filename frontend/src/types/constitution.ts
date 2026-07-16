export type LawCategory = 'fixed' | 'cardinal' | 'mutable';

// F-001..F-006 — matches soul.md (repo root), the canonical Constitution text.
export type FixedLawId = 'F-001' | 'F-002' | 'F-003' | 'F-004' | 'F-005' | 'F-006';

export interface Wealth {
  timeWealth: number;
  valueWealth: number;
  total: number;
}

export interface Constitution {
  fixedLaws: Array<{ id: string; title: string; description: string }>;
  mutableLaws: Array<{ id: string; title: string; description: string }>;
  version: string;
  lastUpdated: string;
}

// soul.md F-002: "Total wealth = geometric mean of method 1 and method 2."
export function calculateWealth(timeWealth: number, valueWealth: number): number {
  return Math.sqrt(Math.max(0, timeWealth) * Math.max(0, valueWealth));
}

export interface Law {
  id: string;
  article: string;
  title: string;
  description: string;
  category: LawCategory;
  isActive: boolean;
  enacted?: string;
  amended?: string;
}

export interface ConstitutionSummary {
  total: number;
  byCategory: Record<LawCategory, number>;
  active: number;
  archived: number;
}
