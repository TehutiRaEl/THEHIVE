/**
 * NPC System Types for THEHIVE
 * Defines autonomous agent behaviors and interactions
 */

import { Position3D, HiveNPC, SandboxNPC } from './types';

// NPC behavior types
export type NPCBehavior = 
  | 'wander'
  | 'patrol'
  | 'guard'
  | 'trade'
  | 'quest'
  | 'teach'
  | 'follow'
  | 'flee'
  | 'idle';

// NPC movement types
export type NPCMovementType = 
  | 'random'
  | 'patrol'
  | 'follow'
  | 'stationary'
  | 'chase'
  | 'flee';

// NPC interaction types
export type NPCInteractionType = 
  | 'dialogue'
  | 'trade'
  | 'quest'
  | 'combat'
  | 'none';

// NPC state
export interface NPCState {
  id: string;
  npcId: string;
  behavior: NPCBehavior;
  movementType: NPCMovementType;
  interactionType: NPCInteractionType;
  
  // Position and movement
  position: Position3D;
  targetPosition?: Position3D;
  speed: number;
  rotation: Position3D;
  
  // State
  isActive: boolean;
  isInteracting: boolean;
  currentAction?: string;
  
  // Movement pattern
  patrolPoints?: Position3D[];
  patrolIndex: number;
  wanderRange: number;
  
  // Combat
  targetId?: string;
  attackCooldown: number;
  
  // Social
  faction?: string;
  reputation: number;
  
  // Time
  spawnTime: string;
  despawnTime?: string;
  lastUpdate: string;
}

// NPC dialogue node
export interface NPCDialogueNode {
  id: string;
  npcId: string;
  text: string;
  speaker: 'npc' | 'player';
  responses?: NPCDialogueResponse[];
  next?: string;
  conditions?: NPCDialogueCondition;
  actions?: NPCDialogueAction[];
}

// NPC dialogue response
export interface NPCDialogueResponse {
  id: string;
  text: string;
  next: string;
  required?: NPCDialogueCondition;
  action?: NPCDialogueAction;
}

// NPC dialogue condition
export interface NPCDialogueCondition {
  minLevel?: number;
  hasItem?: string;
  completedQuest?: string;
  factionReputation?: { faction: string; min: number };
  timeOfDay?: 'day' | 'night';
  playerStat?: { stat: string; min: number };
}

// NPC dialogue action
export interface NPCDialogueAction {
  type: 'give_item' | 'take_item' | 'award_xp' | 'spend_xp' | 'complete_quest' | 'start_quest' | 'change_reputation';
  itemId?: string;
  xp?: number;
  questId?: string;
  faction?: string;
  amount?: number;
}

// NPC quest
export interface NPCQuest {
  id: string;
  npcId: string;
  title: string;
  description: string;
  objectives: NPCQuestObjective[];
  rewards: NPCQuestReward[];
  status: 'available' | 'active' | 'completed' | 'failed';
  requirements?: NPCDialogueCondition;
}

// NPC quest objective
export interface NPCQuestObjective {
  id: string;
  type: 'kill' | 'collect' | 'deliver' | 'talk' | 'explore';
  targetId?: string;
  targetType?: string;
  quantity: number;
  completed: number;
  description: string;
}

// NPC quest reward
export interface NPCQuestReward {
  type: 'xp' | 'item' | 'currency' | 'reputation';
  itemId?: string;
  amount: number;
  faction?: string;
}

// NPC trade item
export interface NPCTradeItem {
  id: string;
  npcId: string;
  itemId: string;
  name: string;
  description: string;
  type: 'buy' | 'sell';
  price: number;
  currency: 'xp' | 'gold' | 'tokens';
  quantity: number;
  maxQuantity?: number;
}

// NPC spawn rules
export interface NPCSpawnRule {
  npcId: string;
  worldId?: string;
  region?: string;
  minLevel?: number;
  maxLevel?: number;
  requiredAchievements?: string[];
  spawnRate: number;
  maxActive: number;
  respawnTime: number;
  conditions?: {
    timeOfDay?: 'day' | 'night' | 'any';
    weather?: string;
    playerNearby?: boolean;
    playerLevel?: { min: number; max: number };
  };
}

// NPC faction
export interface NPCFaction {
  id: string;
  name: string;
  description: string;
  color: number;
  relations: Record<string, number>; // factionId -> reputation (-100 to 100)
  baseReputation: number;
}

// NPC animation states
export type NPCAnimation = 
  | 'idle'
  | 'walk'
  | 'run'
  | 'attack'
  | 'cast'
  | 'hurt'
  | 'death'
  | 'talk'
  | 'dance'
  | 'cheer';

// NPC visual appearance
export interface NPCAppearance {
  model: string;
  texture?: string;
  color: number;
  scale: { x: number; y: number; z: number };
  glow?: number;
  particleEffects?: string[];
  equipment?: Record<string, string>;
}

// NPC configuration
export interface NPCConfig {
  id: string;
  name: string;
  description: string;
  role: string;
  
  // Visual
  appearance: NPCAppearance;
  
  // Behavior
  defaultBehavior: NPCBehavior;
  movement: {
    type: NPCMovementType;
    speed: number;
    range: number;
    patrolPoints?: Position3D[];
  };
  
  // Interaction
  interactionType: NPCInteractionType;
  dialogue?: NPCDialogueNode[];
  quests?: NPCQuest[];
  trades?: NPCTradeItem[];
  
  // Combat
  stats?: {
    health: number;
    attack: number;
    defense: number;
    speed: number;
  };
  
  // Faction
  factionId?: string;
  
  // Spawn rules
  spawnRules: NPCSpawnRule[];
  
  // Visual effects
  effects?: {
    aura?: boolean;
    auraColor?: number;
    particles?: boolean;
    glow?: number;
  };
}

// NPC manager configuration
export interface NPCManagerConfig {
  maxActiveNPCs: number;
  despawnDistance: number;
  updateInterval: number;
  spawnCheckInterval: number;
  
  // Defaults
  defaultSpawnRate: number;
  defaultRespawnTime: number;
  defaultMovementSpeed: number;
}

// NPC events
export type NPCEvent = 
  | { type: 'spawned'; npcId: string; position: Position3D }
  | { type: 'despawned'; npcId: string }
  | { type: 'moved'; npcId: string; from: Position3D; to: Position3D }
  | { type: 'interaction_started'; npcId: string; interactionType: NPCInteractionType }
  | { type: 'interaction_ended'; npcId: string }
  | { type: 'quest_started'; npcId: string; questId: string }
  | { type: 'quest_completed'; npcId: string; questId: string }
  | { type: 'trade_started'; npcId: string }
  | { type: 'trade_completed'; npcId: string; itemId: string };

export type NPCEventHandler = (event: NPCEvent) => void;