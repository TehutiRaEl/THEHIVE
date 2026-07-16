export interface ResourceAmounts {
  energy?: number;
  minerals?: number;
  food?: number;
  knowledge?: number;
  influence?: number;
  [key: string]: number | undefined;
}

export interface Resource {
  id: string;
  name: string;
  description: string;
  icon: string;
  current: number;
  max: number;
  productionRate: number;
  consumptionRate?: number;
}

export interface ResourceSummary {
  total: ResourceAmounts;
  production: ResourceAmounts;
  consumption: ResourceAmounts;
  capacity: ResourceAmounts;
}
