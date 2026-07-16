/**
 * Colony Building System Types for THEHIVE
 * User-created structures with economy and resources
 */

import { Position3D, SandboxColony, SandboxBuilding } from './types';

// Colony tiers
export type ColonyTier = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

// Building types
export type BuildingType = 
  | 'townhall'
  | 'residential'
  | 'commercial'
  | 'industrial'
  | 'defense'
  | 'farm'
  | 'mine'
  | 'lab'
  | 'temple'
  | 'gateway'
  | 'decorative';

// Building categories
export type BuildingCategory = 
  | 'government'
  | 'housing'
  | 'economy'
  | 'production'
  | 'defense'
  | 'special';

// Resource types
export type ResourceType = 
  | 'energy'
  | 'minerals'
  | 'food'
  | 'knowledge'
  | 'gold'
  | 'wood'
  | 'stone'
  | 'metal'
  | 'glass'
  | 'fabric';

// Building configuration
export interface BuildingConfig {
  id: string;
  name: string;
  description: string;
  type: BuildingType;
  category: BuildingCategory;
  
  // Visual
  model: string;
  size: { width: number; height: number; depth: number };
  color: number;
  texture?: string;
  
  // Requirements
  requiredLevel: ColonyTier;
  requiredResources: Record<ResourceType, number>;
  requiredBuildings?: BuildingType[];
  
  // Stats
  maxHealth: number;
  defense: number;
  
  // Production
  production?: {
    resource: ResourceType;
    amount: number;
    interval: number; // In seconds
  };
  
  // Capacity
  maxWorkers: number;
  housing?: number; // For residential
  storage?: number; // For resources
  
  // Unlocks
  unlocks?: {
    buildings?: BuildingType[];
    features?: string[];
  };
  
  // Cost
  buildCost: Record<ResourceType, number>;
  buildTime: number; // In seconds
  
  // Upgrades
  maxLevel: number;
  upgradeCosts: Record<number, Record<ResourceType, number>>;
}

// Colony configuration
export interface ColonyConfig {
  id: string;
  name: string;
  description: string;
  
  // Visual theme
  theme: {
    palette: 'wow' | 'elderScrolls' | 'noMansSky' | 'custom';
    primaryColor: number;
    secondaryColor: number;
    accentColor: number;
    architectureStyle: string;
    environment: string;
  };
  
  // Starting resources
  startingResources: Record<ResourceType, number>;
  
  // Starting buildings
  startingBuildings: { type: BuildingType; position: Position3D }[];
  
  // Unlocks
  unlocksAtTier: Record<ColonyTier, { buildings: BuildingType[]; features: string[] }>;
}

// Building state (runtime)
export interface BuildingState extends SandboxBuilding {
  id: string;
  buildingId: string; // Reference to config
  level: number;
  health: number;
  maxHealth: number;
  
  // Position and orientation
  position: Position3D;
  rotation: Position3D;
  
  // Production state
  lastProductionTime: number;
  productionQueue: ResourceType[];
  
  // Workers
  assignedAgents: string[];
  
  // State
  isActive: boolean;
  isUnderConstruction: boolean;
  constructionProgress: number; // 0-100
  constructionStartTime: number;
  
  // Visual
  animation?: string;
  particleEffects?: string[];
}

// Colony state (runtime)
export interface ColonyState extends SandboxColony {
  id: string;
  configId: string;
  
  // Owner
  ownerId: string;
  ownerName: string;
  
  // Tier and progression
  tier: ColonyTier;
  xp: number;
  xpToNextTier: number;
  
  // Resources
  resources: Record<ResourceType, number>;
  maxResources: Record<ResourceType, number>;
  
  // Buildings
  buildings: Map<string, BuildingState>;
  buildingQueue: { buildingId: string; position: Position3D; progress: number }[];
  
  // Population
  population: number;
  maxPopulation: number;
  residents: string[]; // Agent IDs
  
  // Economy
  economy: {
    taxRate: number;
    tradeRoutes: string[];
    market: MarketItem[];
    wealth: number;
  };
  
  // Defense
  defense: {
    strength: number;
    walls: number;
    towers: number;
    underAttack: boolean;
  };
  
  // Status
  status: 'thriving' | 'stable' | 'struggling' | 'abandoned' | 'under_attack';
  statusMessage: string;
  
  // Events
  events: ColonyEvent[];
  
  // Time
  founded: string;
  lastUpdated: string;
}

// Market item
export interface MarketItem {
  id: string;
  name: string;
  description: string;
  type: 'resource' | 'item' | 'building' | 'spell';
  price: number;
  currency: 'xp' | 'gold' | 'tokens';
  quantity: number;
  sellerId: string;
  sellerName: string;
  quality?: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
}

// Colony event
export type ColonyEvent = 
  | { type: 'building_started'; buildingId: string; position: Position3D }
  | { type: 'building_completed'; buildingId: string; building: BuildingState }
  | { type: 'building_upgraded'; buildingId: string; newLevel: number }
  | { type: 'building_destroyed'; buildingId: string }
  | { type: 'resource_produced'; resource: ResourceType; amount: number }
  | { type: 'resource_consumed'; resource: ResourceType; amount: number }
  | { type: 'population_changed'; previous: number; current: number }
  | { type: 'tier_upgraded'; previousTier: ColonyTier; newTier: ColonyTier }
  | { type: 'under_attack'; attackerId: string }
  | { type: 'attack_repelled'; attackerId: string }
  | { type: 'trade_completed'; itemId: string; price: number };

// Colony manager configuration
export interface ColonyManagerConfig {
  maxColoniesPerUser: number;
  maxBuildingsPerColony: number;
  buildingQueueSize: number;
  productionInterval: number; // In seconds
  startingResources: Record<ResourceType, number>;
  tierRequirements: Record<ColonyTier, number>; // XP required for each tier
}

// Colony statistics
export interface ColonyStats {
  totalColonies: number;
  totalBuildings: number;
  totalPopulation: number;
  totalWealth: number;
  resourceProduction: Record<ResourceType, number>;
  averageTier: number;
}

// Building placement result
export interface BuildingPlacementResult {
  success: boolean;
  buildingId?: string;
  error?: string;
  message?: string;
}

// Colony event handler
export type ColonyEventHandler = (event: ColonyEvent, colonyId: string) => void;