/**
 * NPC Manager for THEHIVE
 * Manages autonomous NPC behavior in sandbox worlds
 */

import { Position3D, SandboxWorld, HiveNPC, SandboxAgent } from './types';
import {
  NPCState,
  NPCBehavior,
  NPCMovementType,
  NPCInteractionType,
  NPCQuest,
  NPCQuestObjective,
  NPCTradeItem,
  NPCSpawnRule,
  NPCFaction,
  NPCAppearance,
  NPCConfig,
  NPCManagerConfig,
  NPCEvent,
  NPCEventHandler,
} from './npc-types';

// Active NPCs in each world
const activeNPCs: Map<string, Map<string, NPCState>> = new Map();

// NPC configurations
const npcConfigs: Map<string, NPCConfig> = new Map();

// NPC factions
const factions: Map<string, NPCFaction> = new Map();

// Event handlers
const eventHandlers: NPCEventHandler[] = [];

// NPC manager configuration
const DEFAULT_CONFIG: NPCManagerConfig = {
  maxActiveNPCs: 100,
  despawnDistance: 100,
  updateInterval: 100,
  spawnCheckInterval: 1000,
  defaultSpawnRate: 0.5,
  defaultRespawnTime: 30000,
  defaultMovementSpeed: 1.0,
};

export class NPCManager {
  private config: NPCManagerConfig = DEFAULT_CONFIG;
  private updateInterval: NodeJS.Timeout | null = null;
  private spawnInterval: NodeJS.Timeout | null = null;

  constructor(config: Partial<NPCManagerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.initializeDefaultNPCs();
    this.initializeDefaultFactions();
  }

  // Initialize default NPC configurations
  private initializeDefaultNPCs(): void {
    const defaultNPCs: NPCConfig[] = [
      {
        id: 'npc-guardian',
        name: 'Guardian',
        description: 'Protects the colony from threats',
        role: 'guard',
        appearance: {
          model: 'humanoid',
          color: 0x4CAF50,
          scale: { x: 1, y: 1, z: 1 },
          glow: 0.3,
        },
        defaultBehavior: 'patrol',
        movement: {
          type: 'patrol',
          speed: 1.5,
          range: 20,
          patrolPoints: [
            { x: 0, y: 0, z: 0 },
            { x: 10, y: 0, z: 0 },
            { x: 10, y: 0, z: 10 },
            { x: 0, y: 0, z: 10 },
          ],
        },
        interactionType: 'dialogue',
        dialogue: [
          {
            id: 'guard-greet',
            npcId: 'npc-guardian',
            text: 'Halt! Who goes there?',
            speaker: 'npc',
            responses: [
              { id: 'friendly', text: 'I am a friend', next: 'guard-friendly' },
              { id: 'hostile', text: 'I mean you harm!', next: 'guard-hostile' },
            ],
          },
          {
            id: 'guard-friendly',
            npcId: 'npc-guardian',
            text: 'Welcome, traveler. The colony is safe thanks to our vigilance.',
            speaker: 'npc',
          },
          {
            id: 'guard-hostile',
            npcId: 'npc-guardian',
            text: 'Then you shall face the wrath of THE HIVE!',
            speaker: 'npc',
            actions: [{ type: 'change_reputation', faction: 'colony', amount: -10 }],
          },
        ],
        factionId: 'colony',
        spawnRules: [
          {
            npcId: 'npc-guardian',
            spawnRate: 0.8,
            maxActive: 5,
            respawnTime: 60000,
            conditions: { playerNearby: true },
          },
        ],
      },
      {
        id: 'npc-trader',
        name: 'Trader',
        description: 'Exchanges goods and services for XP',
        role: 'merchant',
        appearance: {
          model: 'humanoid',
          color: 0xFFD700,
          scale: { x: 1, y: 1, z: 1 },
        },
        defaultBehavior: 'idle',
        movement: { type: 'stationary', speed: 0, range: 0 },
        interactionType: 'trade',
        trades: [
          { id: 'trade-xp-boost', npcId: 'npc-trader', itemId: 'xp-boost-2x', name: '2x XP Booster', description: 'Double XP for 1 hour', type: 'buy', price: 200, currency: 'xp', quantity: 10 },
          { id: 'trade-sword', npcId: 'npc-trader', itemId: 'sword-legendary', name: 'Legendary Sword', description: 'Powerful weapon', type: 'buy', price: 1000, currency: 'xp', quantity: 5 },
        ],
        factionId: 'merchants',
        spawnRules: [{ npcId: 'npc-trader', spawnRate: 0.6, maxActive: 3, respawnTime: 120000 }],
      },
      {
        id: 'npc-quest-giver',
        name: 'Quest Master',
        description: 'Offers missions and rewards',
        role: 'quest',
        appearance: {
          model: 'humanoid',
          color: 0x9C27B0,
          scale: { x: 1, y: 1, z: 1 },
          glow: 0.5,
        },
        defaultBehavior: 'idle',
        movement: { type: 'stationary', speed: 0, range: 0 },
        interactionType: 'quest',
        quests: [
          {
            id: 'quest-kill-10',
            npcId: 'npc-quest-giver',
            title: 'Clear the Area',
            description: 'Defeat 10 enemy agents',
            objectives: [
              { id: 'obj-kill', type: 'kill', targetType: 'agent', quantity: 10, completed: 0, description: 'Defeat 10 enemies' },
            ],
            rewards: [
              { type: 'xp', amount: 500 },
              { type: 'item', itemId: 'sword-legendary', amount: 1 },
            ],
            status: 'available',
          },
        ],
        factionId: 'adventurers',
        spawnRules: [{ npcId: 'npc-quest-giver', spawnRate: 0.4, maxActive: 2, respawnTime: 180000 }],
      },
      {
        id: 'npc-wanderer',
        name: 'Wanderer',
        description: 'Roams the world aimlessly',
        role: 'wanderer',
        appearance: {
          model: 'humanoid',
          color: 0x2196F3,
          scale: { x: 1, y: 1, z: 1 },
        },
        defaultBehavior: 'wander',
        movement: { type: 'random', speed: 0.8, range: 30 },
        interactionType: 'dialogue',
        dialogue: [
          { id: 'wander-greet', npcId: 'npc-wanderer', text: 'The world is vast and full of mysteries...', speaker: 'npc' },
        ],
        spawnRules: [{ npcId: 'npc-wanderer', spawnRate: 0.9, maxActive: 10, respawnTime: 30000 }],
      },
    ];

    defaultNPCs.forEach(npc => npcConfigs.set(npc.id, npc));
  }

  // Initialize default factions
  private initializeDefaultFactions(): void {
    const defaultFactions: NPCFaction[] = [
      {
        id: 'colony',
        name: 'Colony',
        description: 'The main player faction',
        color: 0x4CAF50,
        relations: { merchants: 20, adventurers: 10, enemies: -50 },
        baseReputation: 50,
      },
      {
        id: 'merchants',
        name: 'Merchants Guild',
        description: 'Traders and artisans',
        color: 0xFFD700,
        relations: { colony: 20, adventurers: 5, enemies: -30 },
        baseReputation: 30,
      },
      {
        id: 'adventurers',
        name: 'Adventurers Guild',
        description: 'Explorers and quest-givers',
        color: 0x9C27B0,
        relations: { colony: 10, merchants: 5, enemies: -40 },
        baseReputation: 20,
      },
      {
        id: 'enemies',
        name: 'Enemies',
        description: 'Hostile entities',
        color: 0xF44336,
        relations: { colony: -50, merchants: -30, adventurers: -40 },
        baseReputation: -50,
      },
    ];

    defaultFactions.forEach(faction => factions.set(faction.id, faction));
  }

  // Start NPC management for a world
  startWorld(worldId: string): void {
    if (!activeNPCs.has(worldId)) {
      activeNPCs.set(worldId, new Map());
    }

    if (!this.updateInterval) {
      this.updateInterval = setInterval(() => this.updateAllNPCs(), this.config.updateInterval);
    }

    if (!this.spawnInterval) {
      this.spawnInterval = setInterval(() => this.checkSpawns(), this.config.spawnCheckInterval);
    }
  }

  // Stop NPC management for a world
  stopWorld(worldId: string): void {
    activeNPCs.delete(worldId);

    if (activeNPCs.size === 0) {
      if (this.updateInterval) {
        clearInterval(this.updateInterval);
        this.updateInterval = null;
      }
      if (this.spawnInterval) {
        clearInterval(this.spawnInterval);
        this.spawnInterval = null;
      }
    }
  }

  // Update all active NPCs
  private updateAllNPCs(): void {
    for (const [worldId, npcs] of activeNPCs) {
      for (const [npcId, state] of npcs) {
        this.updateNPC(worldId, npcId, state);
      }
    }
  }

  // Update a single NPC
  private updateNPC(worldId: string, npcId: string, state: NPCState): void {
    const config = npcConfigs.get(npcId);
    if (!config) return;

    const now = new Date().toISOString();
    const timeSinceUpdate = new Date(now).getTime() - new Date(state.lastUpdate).getTime();
    const speed = config.movement.speed * (timeSinceUpdate / 1000);

    switch (config.movement.type) {
      case 'random':
        this.updateRandomMovement(state, speed);
        break;
      case 'patrol':
        this.updatePatrolMovement(state, speed);
        break;
      case 'follow':
        this.updateFollowMovement(worldId, npcId, state, speed);
        break;
      case 'chase':
        this.updateChaseMovement(worldId, npcId, state, speed);
        break;
      case 'flee':
        this.updateFleeMovement(worldId, npcId, state, speed);
        break;
      case 'stationary':
      default:
        break;
    }

    state.lastUpdate = now;
    this.emitEvent({ type: 'moved', npcId, from: state.position, to: state.position });
  }

  // Random wander movement
  private updateRandomMovement(state: NPCState, speed: number): void {
    if (!state.targetPosition || this.isAtTarget(state.position, state.targetPosition, 0.5)) {
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * 5 + 2;
      state.targetPosition = {
        x: state.position.x + Math.cos(angle) * distance,
        y: state.position.y,
        z: state.position.z + Math.sin(angle) * distance,
      };
    }

    this.moveTowardsTarget(state, speed);
  }

  // Patrol movement
  private updatePatrolMovement(state: NPCState, speed: number): void {
    const config = npcConfigs.get(state.npcId);
    if (!config || !config.movement.patrolPoints || config.movement.patrolPoints.length === 0) {
      return;
    }

    const target = config.movement.patrolPoints[state.patrolIndex];
    if (!state.targetPosition || this.isAtTarget(state.position, target, 0.5)) {
      state.targetPosition = target;
      state.patrolIndex = (state.patrolIndex + 1) % config.movement.patrolPoints.length;
    }

    this.moveTowardsTarget(state, speed);
  }

  // Follow movement
  private updateFollowMovement(worldId: string, npcId: string, state: NPCState, speed: number): void {
    const target = this.findFollowTarget(worldId, npcId);
    if (target) {
      state.targetPosition = target.position;
      this.moveTowardsTarget(state, speed);
    }
  }

  // Chase movement
  private updateChaseMovement(worldId: string, npcId: string, state: NPCState, speed: number): void {
    const target = this.findChaseTarget(worldId, npcId);
    if (target) {
      state.targetPosition = target.position;
      this.moveTowardsTarget(state, speed * 1.5); // Chase faster
    }
  }

  // Flee movement
  private updateFleeMovement(worldId: string, npcId: string, state: NPCState, speed: number): void {
    const target = this.findChaseTarget(worldId, npcId);
    if (target) {
      const directionX = state.position.x - target.position.x;
      const directionZ = state.position.z - target.position.z;
      const distance = Math.sqrt(directionX * directionX + directionZ * directionZ);
      
      if (distance > 0) {
        state.targetPosition = {
          x: state.position.x + (directionX / distance) * 5,
          y: state.position.y,
          z: state.position.z + (directionZ / distance) * 5,
        };
        this.moveTowardsTarget(state, speed * 1.5); // Flee faster
      }
    }
  }

  // Move towards target position
  private moveTowardsTarget(state: NPCState, speed: number): void {
    if (!state.targetPosition) return;

    const dx = state.targetPosition.x - state.position.x;
    const dy = state.targetPosition.y - state.position.y;
    const dz = state.targetPosition.z - state.position.z;
    const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

    if (distance <= speed) {
      state.position = { ...state.targetPosition };
    } else {
      state.position = {
        x: state.position.x + (dx / distance) * speed,
        y: state.position.y + (dy / distance) * speed,
        z: state.position.z + (dz / distance) * speed,
      };
    }

    state.rotation = {
      x: 0,
      y: Math.atan2(dx, dz),
      z: 0,
    };
  }

  // Check if at target position
  private isAtTarget(current: Position3D, target: Position3D, threshold: number = 0.1): boolean {
    return (
      Math.abs(current.x - target.x) < threshold &&
      Math.abs(current.y - target.y) < threshold &&
      Math.abs(current.z - target.z) < threshold
    );
  }

  // Find target to follow
  private findFollowTarget(worldId: string, npcId: string): SandboxAgent | null {
    return null;
  }

  // Find target to chase
  private findChaseTarget(worldId: string, npcId: string): SandboxAgent | null {
    return null;
  }

  // Spawn an NPC
  spawnNPC(npcId: string, worldId: string, position: Position3D): NPCState | null {
    const config = npcConfigs.get(npcId);
    if (!config) return null;

    const worldNPCs = activeNPCs.get(worldId);
    if (!worldNPCs) {
      activeNPCs.set(worldId, new Map());
      return null;
    }

    const spawnRules = config.spawnRules.find(r => r.worldId === worldId || !r.worldId);
    if (spawnRules && Math.random() > spawnRules.spawnRate) {
      return null;
    }

    const maxActive = spawnRules?.maxActive || this.config.maxActiveNPCs;
    if (worldNPCs.size >= maxActive) {
      return null;
    }

    const state: NPCState = {
      id: this.generateId('npc'),
      npcId,
      behavior: config.defaultBehavior,
      movementType: config.movement.type,
      interactionType: config.interactionType,
      position: { ...position },
      speed: config.movement.speed,
      rotation: { x: 0, y: 0, z: 0 },
      isActive: true,
      isInteracting: false,
      patrolIndex: 0,
      wanderRange: config.movement.range,
      faction: config.factionId,
      reputation: factions.get(config.factionId || '')?.baseReputation || 0,
      spawnTime: new Date().toISOString(),
      lastUpdate: new Date().toISOString(),
    };

    worldNPCs.set(state.id, state);
    this.emitEvent({ type: 'spawned', npcId: state.id, position: state.position });

    return state;
  }

  // Despawn an NPC
  despawnNPC(npcId: string, worldId: string): boolean {
    const worldNPCs = activeNPCs.get(worldId);
    if (!worldNPCs) return false;

    const state = worldNPCs.get(npcId);
    if (!state) return false;

    state.isActive = false;
    state.despawnTime = new Date().toISOString();
    worldNPCs.delete(npcId);

    this.emitEvent({ type: 'despawned', npcId });
    return true;
  }

  // Get NPC state
  getNPCState(npcId: string, worldId: string): NPCState | undefined {
    return activeNPCs.get(worldId)?.get(npcId);
  }

  // Get all NPCs in a world
  getAllNPCs(worldId: string): NPCState[] {
    return Array.from(activeNPCs.get(worldId)?.values() || []);
  }

  // Get NPC config
  getNPCConfig(npcId: string): NPCConfig | undefined {
    return npcConfigs.get(npcId);
  }

  // Get all NPC configs
  getAllNPCConfigs(): NPCConfig[] {
    return Array.from(npcConfigs.values());
  }

  // Register custom NPC config
  registerNPCConfig(config: NPCConfig): void {
    npcConfigs.set(config.id, config);
  }

  // Get faction
  getFaction(factionId: string): NPCFaction | undefined {
    return factions.get(factionId);
  }

  // Get all factions
  getAllFactions(): NPCFaction[] {
    return Array.from(factions.values());
  }

  // Start interaction with NPC
  startInteraction(npcId: string, worldId: string, interactionType: NPCInteractionType): boolean {
    const state = this.getNPCState(npcId, worldId);
    if (!state) return false;

    state.isInteracting = true;
    state.currentAction = 'interacting';

    this.emitEvent({ type: 'interaction_started', npcId, interactionType });
    return true;
  }

  // End interaction with NPC
  endInteraction(npcId: string, worldId: string): boolean {
    const state = this.getNPCState(npcId, worldId);
    if (!state) return false;

    state.isInteracting = false;
    state.currentAction = undefined;

    this.emitEvent({ type: 'interaction_ended', npcId });
    return true;
  }

  // Start quest with NPC
  startQuest(npcId: string, questId: string, worldId: string): boolean {
    const config = npcConfigs.get(npcId);
    if (!config) return false;

    const quest = config.quests?.find(q => q.id === questId);
    if (!quest) return false;

    quest.status = 'active';
    this.emitEvent({ type: 'quest_started', npcId, questId });
    return true;
  }

  // Complete quest objective
  completeQuestObjective(npcId: string, questId: string, objectiveId: string, worldId: string): boolean {
    const config = npcConfigs.get(npcId);
    if (!config) return false;

    const quest = config.quests?.find(q => q.id === questId);
    if (!quest || quest.status !== 'active') return false;

    const objective = quest.objectives.find(o => o.id === objectiveId);
    if (!objective) return false;

    objective.completed++;

    if (objective.completed >= objective.quantity) {
      const allComplete = quest.objectives.every(o => o.completed >= o.quantity);
      if (allComplete) {
        quest.status = 'completed';
        this.emitEvent({ type: 'quest_completed', npcId, questId });
        return true;
      }
    }

    return false;
  }

  // Get available quests for NPC
  getAvailableQuests(npcId: string): NPCQuest[] {
    const config = npcConfigs.get(npcId);
    if (!config) return [];
    return config.quests?.filter(q => q.status === 'available') || [];
  }

  // Start trade with NPC
  startTrade(npcId: string, worldId: string): NPCTradeItem[] {
    const config = npcConfigs.get(npcId);
    if (!config) return [];

    this.emitEvent({ type: 'trade_started', npcId });
    return config.trades || [];
  }

  // Complete trade
  completeTrade(npcId: string, tradeId: string, worldId: string): boolean {
    this.emitEvent({ type: 'trade_completed', npcId, itemId: tradeId });
    return true;
  }

  // Check NPC spawns for all worlds
  private checkSpawns(): void {
    for (const [worldId] of activeNPCs) {
      this.checkWorldSpawns(worldId);
    }
  }

  // Check spawns for a specific world
  private checkWorldSpawns(worldId: string): void {
    const worldNPCs = activeNPCs.get(worldId);
    if (!worldNPCs) return;

    if (worldNPCs.size >= this.config.maxActiveNPCs) return;

    for (const [npcId, config] of npcConfigs) {
      const spawnRules = config.spawnRules.find(r => r.worldId === worldId || !r.worldId);
      if (!spawnRules) continue;

      const activeCount = Array.from(worldNPCs.values()).filter(s => s.npcId === npcId).length;
      if (activeCount >= (spawnRules.maxActive || this.config.maxActiveNPCs)) continue;

      if (Math.random() <= spawnRules.spawnRate) {
        this.spawnNPC(npcId, worldId, this.getRandomPosition(worldId));
      }
    }
  }

  // Get random position in world
  private getRandomPosition(worldId: string): Position3D {
    return {
      x: (Math.random() - 0.5) * 100,
      y: 0,
      z: (Math.random() - 0.5) * 100,
    };
  }

  // Generate unique ID
  private generateId(prefix: string): string {
    return prefix + '-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
  }

  // Event system
  onEvent(handler: NPCEventHandler): () => void {
    eventHandlers.push(handler);
    return () => {
      const index = eventHandlers.indexOf(handler);
      if (index > -1) eventHandlers.splice(index, 1);
    };
  }

  private emitEvent(event: NPCEvent): void {
    eventHandlers.forEach(handler => {
      try {
        handler(event);
      } catch (e) {
        console.error('NPC event handler error:', e);
      }
    });
  }

  // Cleanup
  destroy(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
    if (this.spawnInterval) {
      clearInterval(this.spawnInterval);
      this.spawnInterval = null;
    }
    activeNPCs.clear();
    eventHandlers.length = 0;
  }
}

export const npcManager = new NPCManager();