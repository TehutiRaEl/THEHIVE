/**
 * World Manager Implementation for THEHIVE
 * Coordinates between THE HIVE world and user sandbox worlds
 */

import {
  WorldType,
  WorldEntity,
  EntityType,
  HiveWorld,
  SandboxWorld,
  HiveAgent,
  HiveNPC,
  HiveWorkflow,
  SandboxAgent,
  SandboxFairy,
  Position3D,
  WorldManager as WorldManagerInterface,
  HIVE_ENTITY_VISIBILITY
} from './types';

let hiveWorld: HiveWorld | null = null;
const sandboxWorlds: Map<string, SandboxWorld> = new Map();
const entityProjections: Map<string, Map<string, WorldEntity>> = new Map();
const activeNPCs: Map<string, Map<string, HiveNPC>> = new Map();
const activeFairies: Map<string, Map<string, SandboxFairy>> = new Map();

export class WorldManager implements WorldManagerInterface {
  constructor(initialHiveWorld?: HiveWorld) {
    if (initialHiveWorld) {
      hiveWorld = initialHiveWorld;
    } else {
      hiveWorld = this.createDefaultHiveWorld();
    }
  }

  private createDefaultHiveWorld(): HiveWorld {
    return {
      id: 'the-hive',
      type: 'hive',
      name: 'THE HIVE',
      description: 'Core AI system and governance layer',
      agents: [],
      colonies: [],
      workflows: [],
      memories: [],
      constitution: null,
      laws: [],
      decisions: [],
      resources: { energy: 10000, knowledge: 10000, influence: 10000 },
      npcs: [],
      currentTime: new Date().toISOString(),
      uptime: 0,
    };
  }

  getHiveWorld(): HiveWorld {
    if (!hiveWorld) {
      hiveWorld = this.createDefaultHiveWorld();
    }
    return hiveWorld;
  }

  createSandboxWorld(ownerId: string, name: string, theme: any): SandboxWorld {
    const id = this.generateId('sandbox');
    const sandboxWorld: SandboxWorld = {
      id,
      type: 'sandbox',
      name,
      description: 'Sandbox world owned by ' + ownerId,
      ownerId,
      theme: {
        palette: theme?.palette || 'wow',
        customColors: theme?.customColors,
        environment: theme?.environment || 'forest',
        skybox: theme?.skybox || 'default',
      },
      voxels: new Map(),
      chunks: new Map(),
      agents: [],
      colonies: [],
      fairies: [],
      structures: [],
      isPublic: false,
      allowedUsers: [ownerId],
      gameMode: 'peaceful',
      difficulty: 'medium',
      createdAt: new Date().toISOString(),
      lastActive: new Date().toISOString(),
      totalPlaytime: 0,
    };
    sandboxWorlds.set(id, sandboxWorld);
    entityProjections.set(id, new Map());
    activeNPCs.set(id, new Map());
    activeFairies.set(id, new Map());
    return sandboxWorld;
  }

  getSandboxWorld(sandboxId: string): SandboxWorld | undefined {
    return sandboxWorlds.get(sandboxId);
  }

  deleteSandboxWorld(sandboxId: string): boolean {
    if (!sandboxWorlds.has(sandboxId)) return false;
    sandboxWorlds.delete(sandboxId);
    entityProjections.delete(sandboxId);
    activeNPCs.delete(sandboxId);
    activeFairies.delete(sandboxId);
    return true;
  }

  listSandboxWorlds(): SandboxWorld[] {
    return Array.from(sandboxWorlds.values());
  }

  projectToSandbox(entity: WorldEntity, sandboxId: string): WorldEntity {
    const sandbox = sandboxWorlds.get(sandboxId);
    if (!sandbox) throw new Error('Sandbox not found');
    const visibility = HIVE_ENTITY_VISIBILITY[entity.type] || { visible: false, interaction: 'none', appearance: 'normal' };
    const projected: WorldEntity = {
      ...entity,
      worldType: 'sandbox',
      metadata: { ...entity.metadata, originalWorld: 'hive', visibility: visibility.appearance, interactionLevel: visibility.interaction }
    };
    const proj = entityProjections.get(sandboxId) || new Map();
    proj.set(entity.id, projected);
    entityProjections.set(sandboxId, proj);
    return projected;
  }

  getProjectedEntity(sandboxId: string, entityId: string): WorldEntity | undefined {
    return entityProjections.get(sandboxId)?.get(entityId);
  }

  syncFromHiveToSandbox(hiveEntity: WorldEntity, sandboxId: string): void {
    this.projectToSandbox(hiveEntity, sandboxId);
  }

  getVisibleEntities(sandboxId: string): WorldEntity[] {
    const sandbox = sandboxWorlds.get(sandboxId);
    if (!sandbox) return [];
    const visible: WorldEntity[] = [];
    const proj = entityProjections.get(sandboxId);
    if (proj) {
      for (const [id, e] of proj) {
        const meta = e.metadata as any;
        if (meta?.originalWorld === 'hive') {
          if (HIVE_ENTITY_VISIBILITY[e.type]?.visible) visible.push(e);
        } else {
          visible.push(e);
        }
      }
    }
    sandbox.agents.forEach(a => visible.push({ id: a.id, type: 'agent', worldType: 'sandbox', position: a.position, createdAt: a.lastActive, updatedAt: new Date().toISOString() }));
    sandbox.fairies.forEach(f => visible.push({ id: f.id, type: 'fairy', worldType: 'sandbox', position: f.position, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }));
    return visible;
  }

  spawnNPC(npc: HiveNPC, sandboxId: string): void {
    const sandbox = sandboxWorlds.get(sandboxId);
    if (!sandbox) throw new Error('Sandbox not found');
    const npcs = activeNPCs.get(sandboxId) || new Map();
    npcs.set(npc.id, npc);
    activeNPCs.set(sandboxId, npcs);
    if (!('npcs' in sandbox)) (sandbox as any).npcs = [];
    (sandbox as any).npcs.push(npc);
  }

  despawnNPC(npcId: string, sandboxId: string): void {
    const npcs = activeNPCs.get(sandboxId);
    if (npcs) { npcs.delete(npcId); activeNPCs.set(sandboxId, npcs); }
    const sandbox = sandboxWorlds.get(sandboxId);
    if (sandbox && 'npcs' in sandbox) (sandbox as any).npcs = (sandbox as any).npcs.filter((n: any) => n.id !== npcId);
  }

  getActiveNPCs(sandboxId: string): HiveNPC[] {
    return activeNPCs.get(sandboxId) ? Array.from(activeNPCs.get(sandboxId)!.values()) : [];
  }

  projectWorkflowAsFairy(workflow: HiveWorkflow, sandboxId: string): SandboxFairy {
    const id = this.generateId('fairy');
    const color = this.getFairyColor(workflow.type);
    const fairy: SandboxFairy = {
      id, workflowId: workflow.id, type: workflow.type,
      position: { x: 0, y: 0, z: 0 }, speed: 2.0,
      path: workflow.fairyProjection?.path || [], color, size: 0.5, glow: 0.8, trail: true,
      status: 'idle', carrying: workflow.fairyProjection?.carrying
    };
    const fairies = activeFairies.get(sandboxId) || new Map();
    fairies.set(id, fairy);
    activeFairies.set(sandboxId, fairies);
    const sandbox = sandboxWorlds.get(sandboxId);
    if (sandbox) sandbox.fairies.push(fairy);
    return fairy;
  }

  private getFairyColor(type: string): number {
    const colors: Record<string, number> = { mission: 0x00FF00, memory: 0x0000FF, colony: 0xFFFF00, workflow: 0xFF00FF, default: 0xFFFFFF };
    return colors[type.toLowerCase()] || colors.default;
  }

  getActiveFairies(sandboxId: string): SandboxFairy[] {
    return activeFairies.get(sandboxId) ? Array.from(activeFairies.get(sandboxId)!.values()) : [];
  }

  teleportToSandbox(agentId: string, sandboxId: string, position: Position3D): boolean {
    const sandbox = sandboxWorlds.get(sandboxId);
    if (!sandbox) return false;
    let agent: any = null;
    if (hiveWorld) agent = hiveWorld.agents.find(a => a.id === agentId);
    if (!agent) {
      for (const [wid, w] of sandboxWorlds) {
        if (wid !== sandboxId) {
          const found = w.agents.find((a: any) => a.id === agentId);
          if (found) { agent = found; w.agents = w.agents.filter((a: any) => a.id !== agentId); break; }
        }
      }
    }
    if (!agent) return false;
    const sa: SandboxAgent = {
      id: agent.id, userId: agent.id, name: agent.name,
      avatar: this.createAvatarFromAgent(agent), position, rotation: { x: 0, y: 0, z: 0 },
      status: 'idle', emotion: 'neutral', inventory: [], equipped: {},
      stats: { health: 100, maxHealth: 100, energy: 100, maxEnergy: 100, strength: 10, intelligence: 10, charisma: 10, agility: 10, endurance: 10 },
      xp: agent.xp || 0, level: agent.level || 1, abilities: agent.abilities || [],
      activeSpells: [], friends: [], lastActive: new Date().toISOString(), playtime: 0
    };
    sandbox.agents.push(sa);
    return true;
  }

  private generateId(prefix: string): string {
    return prefix + '-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
  }

  private createAvatarFromAgent(agent: any) {
    return {
      id: this.generateId('avatar'), agentId: agent.id, role: agent.role || 'agent', name: agent.name,
      level: agent.level || 1, xp: agent.xp || 0, xpToNextLevel: 100, baseModel: 'default', customization: {},
      colorScheme: { primary: 0xFFFFFF, secondary: 0xCCCCCC, accent: 0x888888 },
      colonyId: agent.colonyId || '', colonyTheme: 'default',
      position: { x: 0, y: 0, z: 0 }, rotation: { x: 0, y: 0, z: 0 },
      status: 'idle', emotion: 'neutral', totalXPEarned: agent.xp || 0, achievements: [], inventory: [], equippedParts: [],
      createdAt: new Date().toISOString(), lastActive: new Date().toISOString()
    };
  }

  getWorldStats() {
    return {
      hive: hiveWorld ? { agents: hiveWorld.agents.length, colonies: hiveWorld.colonies.length, workflows: hiveWorld.workflows.length, memories: hiveWorld.memories.length, npcs: hiveWorld.npcs.length } : null,
      sandboxes: Array.from(sandboxWorlds.entries()).map(([id, w]) => ({ id, name: w.name, owner: w.ownerId, agents: w.agents.length, colonies: w.colonies.length, fairies: w.fairies.length, structures: w.structures.length, isPublic: w.isPublic }))
    };
  }
}

export const worldManager = new WorldManager();