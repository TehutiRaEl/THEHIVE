export type LawCategory = 'fixed' | 'cardinal' | 'mutable';

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
