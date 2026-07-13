export interface Colony {
  id: string;
  name: string;
  description: string;
  location: string;
  population: number;
  resources: ResourceAmounts;
  specialization: string;
  founded: string;
  leader: string;
  status: 'active' | 'developing' | 'struggling' | 'abandoned';
  tier: 1 | 2 | 3 | 4 | 5;
}

export interface ColonySummary {
  total: number;
  byTier: Record<number, number>;
  byStatus: Record<string, number>;
  totalPopulation: number;
}
