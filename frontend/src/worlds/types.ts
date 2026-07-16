/**
 * Dual-World Architecture for THEHIVE
 * 
 * THE HIVE World (Invisible/Unreachable):
 * - Core AI agents and workflows
 * - Colony management systems
 * - Memory storage and processing
 * - Governance and decision-making
 * - Autonomous NPCs that appear/disappear in user sandboxes
 * 
 * User Sandbox Worlds (Visible/Interactive):
 * - User-created worlds and colonies
 * - 3D avatars and fairy sprites
 * - Voxel-based environments
 * - Game mechanics and systems
 * - Users can see AI agents but can't fully interact with THE HIVE core
 */

// Entity types that exist in both worlds
export type EntityType = 
  | 'agent'
  | 'colony'
  | 'workflow'
  | 'memory'
  | 'fairy'
  | 'voxel'
  | 'structure'
  | 'portal';

// World types
export type WorldType = 'hive' | 'sandbox';

// Position in 3D space
export interface Position3D {
  x: number;
  y: number;
  z: number;
}

// Entity base interface
export interface WorldEntity {
  id: string;
  type: EntityType;
  worldType: WorldType;
  position: Position3D;
  createdAt: string;
  updatedAt: string;
}

// THE HIVE World (Core/Invisible)
export interface HiveWorld {
  id: string;
  type: 'hive';
  name: 'THE HIVE';
  description: 'Core AI system and governance layer';
  
  // Core systems
  agents: HiveAgent[];
  colonies: HiveColony[];
  workflows: HiveWorkflow[];
  memories: HiveMemory[];
  
  // Governance
  constitution: any; // Import from constitution types
  laws: any[]; // Import from constitution types
  decisions: HiveDecision[];
  
  // Resources
  resources: {
    energy: number;
    knowledge: number;
    influence: number;
    [key: string]: number;
  };
  
  // Autonomous NPCs that can appear in sandboxes
  npcs: HiveNPC[];
  
  // Time
  currentTime: string;
  uptime: number;
}

// User Sandbox World
export interface SandboxWorld {
  id: string;
  type: 'sandbox';
  name: string;
  description: string;
  ownerId: string; // User/agent who owns this sandbox
  
  // Visual theme
  theme: {
    palette: 'wow' | 'elderScrolls' | 'noMansSky' | 'custom';
    customColors?: {
      primary: number;
      secondary: number;
      accent: number;
    };
    environment: string;
    skybox: string;
  };
  
  // World state
  voxels: any; // Import from voxel types
  chunks: any; // Import from voxel types
  
  // Entities
  agents: SandboxAgent[];
  colonies: SandboxColony[];
  fairies: SandboxFairy[];
  structures: SandboxStructure[];
  
  // User's avatar in this world
  userAvatar?: SandboxAvatar;
  
  // Access control
  isPublic: boolean;
  allowedUsers: string[];
  entryFee?: number; // XP or currency required to enter
  
  // Game state
  gameMode: 'peaceful' | 'combat' | 'building' | 'exploration';
  difficulty: 'easy' | 'medium' | 'hard' | 'nightmare';
  
  // Time
  createdAt: string;
  lastActive: string;
  totalPlaytime: number;
}

// THE HIVE Agent (exists in THE HIVE world)
export interface HiveAgent {
  id: string;
  name: string;
  role: string;
  level: number;
  xp: number;
  
  // Current task
  currentWorkflow?: string;
  currentMission?: string;
  
  // State
  status: 'active' | 'idle' | 'working' | 'resting';
  
  // Position in THE HIVE world (not visible to sandbox users)
  hivePosition: Position3D;
  
  // Sandbox projection (where this agent appears in sandbox worlds)
  sandboxProjection?: {
    worldId: string;
    position: Position3D;
    visibility: 'visible' | 'hidden' | 'flickering';
    lastSeen: string;
  };
  
  // Abilities
  abilities: string[];
  
  // Connections
  connectedAgents: string[];
  colonyId: string;
}

// THE HIVE Colony (exists in THE HIVE world)
export interface HiveColony {
  id: string;
  name: string;
  description: string;
  
  // Resources
  resources: {
    energy: number;
    minerals: number;
    food: number;
    knowledge: number;
    [key: string]: number;
  };
  
  // Population
  agents: string[];
  population: number;
  
  // Status
  status: 'active' | 'developing' | 'struggling';
  tier: number;
  
  // Sandbox projection
  sandboxProjection?: {
    worldId: string;
    position: Position3D;
    size: number;
  };
}

// THE HIVE Workflow (exists in THE HIVE world)
export interface HiveWorkflow {
  id: string;
  name: string;
  type: string;
  status: 'running' | 'paused' | 'completed' | 'failed';
  
  // Progress
  progress: number; // 0-100
  steps: WorkflowStep[];
  currentStep: number;
  
  // Fairy projection (visible in sandbox worlds)
  fairyProjection?: {
    worldId: string;
    fairyId: string;
    path: Position3D[];
    color: number;
    type: string;
  };
}

// THE HIVE Memory (exists in THE HIVE world)
export interface HiveMemory {
  id: string;
  title: string;
  content: string;
  type: string;
  author: string;
  timestamp: string;
  tags: string[];
  
  // Connections
  relatedMemories: string[];
  relatedAgents: string[];
  relatedColonies: string[];
}

// THE HIVE NPC (autonomous agent that can appear in sandboxes)
export interface HiveNPC {
  id: string;
  agentId: string; // Reference to the HIVE agent
  name: string;
  role: string;
  
  // Appearance in sandbox
  appearance: {
    model: string;
    color: number;
    size: number;
    glow: number;
  };
  
  // Behavior
  behavior: 'wander' | 'guard' | 'trade' | 'quest' | 'teach';
  
  // Movement pattern
  movement: {
    type: 'random' | 'patrol' | 'follow' | 'stationary';
    speed: number;
    range: number;
  };
  
  // Interaction
  canInteract: boolean;
  interactionType: 'dialogue' | 'trade' | 'quest' | 'none';
  dialogue?: NPCDialogue[];
  
  // Spawn rules
  spawnConditions: {
    worldIds: string[]; // Which sandboxes this NPC can appear in
    minLevel?: number;
    requiredAchievements?: string[];
    spawnRate: number; // 0-1 probability
  };
}

// THE HIVE Decision
export interface HiveDecision {
  id: string;
  title: string;
  description: string;
  options: DecisionOption[];
  status: 'pending' | 'voting' | 'decided' | 'implemented';
  
  // Voting
  votes: Map<string, string>; // agentId -> optionId
  votingEnds?: string;
  
  // Result
  chosenOption?: string;
  implementedAt?: string;
  
  // Impact
  affectedColonies: string[];
  affectedAgents: string[];
}

// Decision option
export interface DecisionOption {
  id: string;
  description: string;
  pros: string[];
  cons: string[];
  impact: {
    resources?: Record<string, number>;
    xp?: number;
    reputation?: number;
  };
}

// NPC Dialogue
export interface NPCDialogue {
  id: string;
  text: string;
  speaker: string; // npc or player
  responses?: DialogueResponse[];
  next?: string; // Next dialogue ID
  conditions?: {
    minLevel?: number;
    hasItem?: string;
    completedQuest?: string;
  };
}

// Dialogue Response
export interface DialogueResponse {
  id: string;
  text: string;
  next: string; // Next dialogue ID
  action?: {
    type: 'give_item' | 'complete_quest' | 'spend_xp' | 'award_xp';
    itemId?: string;
    questId?: string;
    xp?: number;
  };
}

// Sandbox Agent (user's avatar in sandbox)
export interface SandboxAgent {
  id: string;
  userId: string; // The user controlling this agent
  name: string;
  
  // Visual appearance
  avatar: any; // Import from avatars/types
  
  // Position
  position: Position3D;
  rotation: Position3D;
  
  // State
  status: 'idle' | 'walking' | 'running' | 'talking' | 'fighting' | 'building';
  emotion: string;
  
  // Inventory
  inventory: string[]; // Item IDs
  equipped: {
    weapon?: string;
    armor?: string;
    accessory?: string;
  };
  
  // Stats
  stats: {
    health: number;
    maxHealth: number;
    energy: number;
    maxEnergy: number;
    strength: number;
    intelligence: number;
    charisma: number;
    agility: number;
    endurance: number;
  };
  
  // XP
  xp: number;
  level: number;
  
  // Abilities
  abilities: string[];
  activeSpells: string[];
  
  // Social
  friends: string[];
  guild?: string;
  
  // Time
  lastActive: string;
  playtime: number;
}

// Sandbox Colony (user-created colony in sandbox)
export interface SandboxColony {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  
  // Position and size
  position: Position3D;
  size: { width: number; height: number; depth: number };
  
  // Visual theme
  theme: any; // Import from avatars/types ColonyTheme
  
  // Buildings
  buildings: SandboxBuilding[];
  
  // Resources
  resources: {
    energy: number;
    minerals: number;
    food: number;
    knowledge: number;
    [key: string]: number;
  };
  
  // Population
  residents: string[]; // Agent IDs
  maxResidents: number;
  
  // Status
  status: 'active' | 'developing' | 'struggling' | 'abandoned';
  tier: number;
  
  // Economy
  economy: {
    taxRate: number;
    tradeRoutes: string[];
    market: MarketItem[];
  };
  
  // Time
  founded: string;
}

// Sandbox Building
export interface SandboxBuilding {
  id: string;
  type: 'residential' | 'commercial' | 'industrial' | 'defense' | 'special';
  name: string;
  description: string;
  
  // Position
  position: Position3D;
  size: { width: number; height: number; depth: number };
  
  // Stats
  level: number;
  health: number;
  maxHealth: number;
  
  // Production
  production?: {
    resource: string;
    amount: number;
    interval: number; // In seconds
  };
  
  // Requirements
  requiredLevel?: number;
  requiredResources?: Record<string, number>;
  
  // Workers
  assignedAgents: string[];
  maxWorkers: number;
}

// Market Item
export interface MarketItem {
  id: string;
  name: string;
  description: string;
  type: 'resource' | 'item' | 'equipment' | 'spell';
  price: number;
  quantity: number;
  sellerId: string;
}

// Sandbox Fairy (workflow visualization)
export interface SandboxFairy {
  id: string;
  workflowId: string; // Reference to THE HIVE workflow
  type: string;
  
  // Position and movement
  position: Position3D;
  target?: Position3D;
  speed: number;
  path?: Position3D[];
  
  // Visual
  color: number;
  size: number;
  glow: number;
  trail?: boolean;
  
  // State
  status: 'idle' | 'moving' | 'working' | 'delivering';
  
  // Carrying
  carrying?: {
    type: string;
    amount: number;
  };
}

// Sandbox Structure
export interface SandboxStructure {
  id: string;
  type: 'wall' | 'floor' | 'door' | 'window' | 'decorative';
  name: string;
  
  // Position
  position: Position3D;
  rotation: Position3D;
  size: { width: number; height: number; depth: number };
  
  // Visual
  voxelType: string;
  color: number;
  
  // Physics
  collidable: boolean;
  
  // Owner
  ownerId: string;
  colonyId?: string;
}

// Sandbox Avatar (3D representation of user)
export interface SandboxAvatar {
  id: string;
  agentId: string; // Reference to SandboxAgent
  
  // Visual
  model: string;
  customization: any; // Import from avatars/types AvatarCustomization
  colorScheme: {
    primary: number;
    secondary: number;
    accent: number;
  };
  
  // Position
  position: Position3D;
  rotation: Position3D;
  
  // Animation
  currentAnimation: string;
  animationSpeed: number;
  
  // Equipment (visible items)
  equipped: {
    head?: string;
    body?: string;
    arms?: string;
    legs?: string;
    wings?: string;
    accessory?: string;
  };
  
  // Visual effects
  effects: {
    aura: boolean;
    auraColor: number;
    particles: boolean;
    glowIntensity: number;
  };
}

// World Manager (coordinates between THE HIVE and Sandbox worlds)
export interface WorldManager {
  hiveWorld: HiveWorld;
  sandboxWorlds: Map<string, SandboxWorld>;
  
  // Project THE HIVE entities into sandboxes
  projectToSandbox(entity: WorldEntity, sandboxId: string): WorldEntity;
  
  // Sync changes between worlds
  syncFromHiveToSandbox(hiveEntity: WorldEntity, sandboxId: string): void;
  syncFromSandboxToHive(sandboxEntity: WorldEntity): void;
  
  // Get entities visible in a sandbox
  getVisibleEntities(sandboxId: string): WorldEntity[];
  
  // Handle NPC spawning
  spawnNPC(npc: HiveNPC, sandboxId: string): void;
  despawnNPC(npcId: string, sandboxId: string): void;
  
  // Handle fairy projections
  projectWorkflowAsFairy(workflow: HiveWorkflow, sandboxId: string): SandboxFairy;
  
  // Create new sandbox world
  createSandboxWorld(ownerId: string, name: string, theme: any): SandboxWorld;
  
  // Delete sandbox world
  deleteSandboxWorld(sandboxId: string): boolean;
  
  // Teleport between worlds
  teleportToSandbox(agentId: string, sandboxId: string, position: Position3D): boolean;
  teleportToHive(agentId: string, position: Position3D): boolean;
}

// Visibility rules for THE HIVE entities in sandboxes
export const HIVE_ENTITY_VISIBILITY: Record<EntityType, {
  visible: boolean;
  interaction: 'none' | 'limited' | 'full';
  appearance: 'normal' | 'ghostly' | 'flickering';
}> = {
  agent: {
    visible: true,
    interaction: 'limited',
    appearance: 'flickering'
  },
  colony: {
    visible: false,
    interaction: 'none',
    appearance: 'normal'
  },
  workflow: {
    visible: true,
    interaction: 'none',
    appearance: 'normal'
  },
  memory: {
    visible: false,
    interaction: 'none',
    appearance: 'normal'
  },
  fairy: {
    visible: true,
    interaction: 'none',
    appearance: 'normal'
  },
  voxel: {
    visible: false,
    interaction: 'none',
    appearance: 'normal'
  },
  structure: {
    visible: false,
    interaction: 'none',
    appearance: 'normal'
  },
  portal: {
    visible: true,
    interaction: 'limited',
    appearance: 'ghostly'
  }
};
