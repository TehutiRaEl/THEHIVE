/**
 * Colony Manager for THEHIVE
 * Manages user-created colonies with buildings and economy
 */

import { Position3D, SandboxWorld } from './types';
import {
  BuildingConfig,
  BuildingState,
  BuildingType,
  BuildingCategory,
  ColonyConfig,
  ColonyState,
  ColonyTier,
  ResourceType,
  ColonyEvent,
  ColonyEventHandler,
  ColonyManagerConfig,
  ColonyStats,
  BuildingPlacementResult,
} from './colony-types';
import { worldManager } from './WorldManager';

// Building configurations
const BUILDING_CONFIGS: Map<string, BuildingConfig> = new Map();

// Colony configurations
const COLONY_CONFIGS: Map<string, ColonyConfig> = new Map();

// Active colonies
const colonies: Map<string, ColonyState> = new Map();

// Event handlers
const eventHandlers: Map<string, ColonyEventHandler[]> = new Map();

// Default colony manager configuration
const DEFAULT_CONFIG: ColonyManagerConfig = {
  maxColoniesPerUser: 10,
  maxBuildingsPerColony: 100,
  buildingQueueSize: 10,
  productionInterval: 5, // seconds
  startingResources: {
    energy: 1000,
    minerals: 1000,
    food: 1000,
    knowledge: 1000,
    gold: 500,
    wood: 500,
    stone: 500,
  },
  tierRequirements: {
    1: 0,
    2: 1000,
    3: 3000,
    4: 6000,
    5: 10000,
    6: 15000,
    7: 22000,
    8: 30000,
    9: 40000,
    10: 55000,
  },
};

export class ColonyManager {
  private config: ColonyManagerConfig = DEFAULT_CONFIG;
  private productionInterval: NodeJS.Timeout | null = null;

  constructor(config: Partial<ColonyManagerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.initializeDefaultBuildings();
    this.initializeDefaultColonyConfigs();
  }

  // Initialize default building configurations
  private initializeDefaultBuildings(): void {
    const defaultBuildings: BuildingConfig[] = [
      {
        id: 'townhall',
        name: 'Town Hall',
        description: 'Central government building. Unlocks advanced features.',
        type: 'townhall',
        category: 'government',
        model: 'townhall',
        size: { width: 5, height: 4, depth: 5 },
        color: 0xFFD700,
        requiredLevel: 1,
        requiredResources: { wood: 200, stone: 200, gold: 100 },
        maxHealth: 1000,
        defense: 50,
        maxWorkers: 5,
        housing: 10,
        storage: 1000,
        unlocks: {
          buildings: ['residential', 'commercial', 'industrial', 'defense'],
          features: ['taxation', 'trade', 'diplomacy'],
        },
        buildCost: { wood: 200, stone: 200, gold: 100 },
        buildTime: 60,
        maxLevel: 5,
        upgradeCosts: {
          2: { wood: 100, stone: 100, gold: 50 },
          3: { wood: 200, stone: 200, gold: 100 },
          4: { wood: 300, stone: 300, gold: 150 },
          5: { wood: 400, stone: 400, gold: 200 },
        },
      },
      {
        id: 'residential',
        name: 'House',
        description: 'Housing for colony residents.',
        type: 'residential',
        category: 'housing',
        model: 'house',
        size: { width: 3, height: 3, depth: 3 },
        color: 0x8B4513,
        requiredLevel: 1,
        requiredResources: { wood: 100, stone: 50 },
        maxHealth: 300,
        defense: 10,
        maxWorkers: 2,
        housing: 4,
        buildCost: { wood: 100, stone: 50 },
        buildTime: 30,
        maxLevel: 3,
        upgradeCosts: {
          2: { wood: 50, stone: 25 },
          3: { wood: 100, stone: 50 },
        },
      },
      {
        id: 'farm',
        name: 'Farm',
        description: 'Produces food resources.',
        type: 'farm',
        category: 'production',
        model: 'farm',
        size: { width: 4, height: 1, depth: 4 },
        color: 0x228B22,
        requiredLevel: 1,
        requiredResources: { wood: 50, stone: 20 },
        maxHealth: 200,
        defense: 5,
        maxWorkers: 3,
        production: { resource: 'food', amount: 10, interval: 10 },
        buildCost: { wood: 50, stone: 20 },
        buildTime: 20,
        maxLevel: 4,
        upgradeCosts: {
          2: { wood: 25, stone: 10 },
          3: { wood: 50, stone: 20 },
          4: { wood: 100, stone: 40 },
        },
      },
      {
        id: 'mine',
        name: 'Mine',
        description: 'Extracts minerals and metals.',
        type: 'mine',
        category: 'production',
        model: 'mine',
        size: { width: 3, height: 2, depth: 3 },
        color: 0x696969,
        requiredLevel: 2,
        requiredResources: { wood: 80, stone: 100 },
        maxHealth: 400,
        defense: 20,
        maxWorkers: 4,
        production: { resource: 'minerals', amount: 8, interval: 15 },
        buildCost: { wood: 80, stone: 100 },
        buildTime: 45,
        maxLevel: 3,
        upgradeCosts: {
          2: { wood: 40, stone: 50 },
          3: { wood: 80, stone: 100 },
        },
      },
      {
        id: 'lab',
        name: 'Research Lab',
        description: 'Generates knowledge through research.',
        type: 'lab',
        category: 'production',
        model: 'lab',
        size: { width: 4, height: 2, depth: 4 },
        color: 0x2196F3,
        requiredLevel: 3,
        requiredResources: { wood: 100, stone: 100, gold: 50 },
        maxHealth: 300,
        defense: 10,
        maxWorkers: 3,
        production: { resource: 'knowledge', amount: 5, interval: 20 },
        buildCost: { wood: 100, stone: 100, gold: 50 },
        buildTime: 60,
        maxLevel: 3,
        upgradeCosts: {
          2: { wood: 50, stone: 50, gold: 25 },
          3: { wood: 100, stone: 100, gold: 50 },
        },
      },
      {
        id: 'wall',
        name: 'Defensive Wall',
        description: 'Protects the colony from attacks.',
        type: 'defense',
        category: 'defense',
        model: 'wall',
        size: { width: 1, height: 3, depth: 1 },
        color: 0x808080,
        requiredLevel: 1,
        requiredResources: { stone: 50 },
        maxHealth: 500,
        defense: 30,
        maxWorkers: 0,
        buildCost: { stone: 50 },
        buildTime: 15,
        maxLevel: 2,
        upgradeCosts: {
          2: { stone: 50 },
        },
      },
      {
        id: 'tower',
        name: 'Defense Tower',
        description: 'Attacks enemies that come too close.',
        type: 'defense',
        category: 'defense',
        model: 'tower',
        size: { width: 2, height: 4, depth: 2 },
        color: 0x800000,
        requiredLevel: 2,
        requiredResources: { wood: 100, stone: 100 },
        maxHealth: 600,
        defense: 40,
        maxWorkers: 2,
        buildCost: { wood: 100, stone: 100 },
        buildTime: 45,
        maxLevel: 3,
        upgradeCosts: {
          2: { wood: 50, stone: 50 },
          3: { wood: 100, stone: 100 },
        },
      },
      {
        id: 'commercial',
        name: 'Market',
        description: 'Enables trade and increases wealth.',
        type: 'commercial',
        category: 'economy',
        model: 'market',
        size: { width: 4, height: 3, depth: 4 },
        color: 0xFFD700,
        requiredLevel: 2,
        requiredResources: { wood: 150, stone: 50, gold: 50 },
        maxHealth: 400,
        defense: 15,
        maxWorkers: 3,
        production: { resource: 'gold', amount: 20, interval: 30 },
        buildCost: { wood: 150, stone: 50, gold: 50 },
        buildTime: 60,
        maxLevel: 3,
        upgradeCosts: {
          2: { wood: 75, stone: 25, gold: 25 },
          3: { wood: 150, stone: 50, gold: 50 },
        },
      },
    ];

    defaultBuildings.forEach(building => BUILDING_CONFIGS.set(building.id, building));
  }

  // Initialize default colony configurations
  private initializeDefaultColonyConfigs(): void {
    const defaultColonies: ColonyConfig[] = [
      {
        id: 'colony-default',
        name: 'New Colony',
        description: 'A fresh start for your civilization',
        theme: {
          palette: 'wow',
          primaryColor: 0x4CAF50,
          secondaryColor: 0x2E7D32,
          accentColor: 0x8BC34A,
          architectureStyle: 'medieval',
          environment: 'forest',
        },
        startingResources: this.config.startingResources,
        startingBuildings: [
          { type: 'townhall', position: { x: 0, y: 0, z: 0 } },
          { type: 'residential', position: { x: 5, y: 0, z: 0 } },
          { type: 'farm', position: { x: -5, y: 0, z: 0 } },
        ],
        unlocksAtTier: {
          1: { buildings: ['residential', 'farm'], features: ['basic_building'] },
          2: { buildings: ['mine', 'commercial'], features: ['trade', 'defense'] },
          3: { buildings: ['lab', 'tower'], features: ['research', 'advanced_defense'] },
          4: { buildings: ['gateway'], features: ['portals', 'colony_links'] },
          5: { buildings: ['temple'], features: ['specialization', 'unique_buildings'] },
        },
      },
    ];

    defaultColonies.forEach(colony => COLONY_CONFIGS.set(colony.id, colony));
  }

  // Create a new colony
  createColony(
    ownerId: string,
    ownerName: string,
    configId: string = 'colony-default',
    position: Position3D = { x: 0, y: 0, z: 0 },
    worldId: string
  ): ColonyState {
    const config = COLONY_CONFIGS.get(configId);
    if (!config) throw new Error('Colony config not found');

    const id = this.generateId('colony');
    
    const state: ColonyState = {
      id,
      configId,
      name: config.name,
      description: config.description,
      ownerId,
      ownerName,
      position,
      size: { width: 50, height: 50, depth: 50 },
      theme: config.theme,
      tier: 1,
      xp: 0,
      xpToNextTier: this.config.tierRequirements[2] || 1000,
      resources: { ...config.startingResources },
      maxResources: {
        energy: 10000,
        minerals: 10000,
        food: 10000,
        knowledge: 10000,
        gold: 5000,
        wood: 5000,
        stone: 5000,
        metal: 2000,
        glass: 1000,
        fabric: 1000,
      },
      buildings: new Map(),
      buildingQueue: [],
      population: 0,
      maxPopulation: 10,
      residents: [],
      economy: {
        taxRate: 0.1,
        tradeRoutes: [],
        market: [],
        wealth: 0,
      },
      defense: {
        strength: 0,
        walls: 0,
        towers: 0,
        underAttack: false,
      },
      status: 'stable',
      statusMessage: 'Colony founded',
      events: [],
      founded: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
    };

    colonies.set(id, state);

    config.startingBuildings.forEach(building => {
      this.placeBuilding(id, building.type, building.position, true);
    });

    this.emitEvent({ type: 'building_completed', buildingId: 'townhall', building: this.getBuilding('townhall', id)! }, id);

    return state;
  }

  // Destroy a colony
  destroyColony(colonyId: string, ownerId: string): boolean {
    const colony = colonies.get(colonyId);
    if (!colony || colony.ownerId !== ownerId) return false;

    colonies.delete(colonyId);
    return true;
  }

  // Get colony by ID
  getColony(colonyId: string): ColonyState | undefined {
    return colonies.get(colonyId);
  }

  // Get all colonies owned by a user
  getColoniesByOwner(ownerId: string): ColonyState[] {
    return Array.from(colonies.values()).filter(c => c.ownerId === ownerId);
  }

  // Get all colonies
  getAllColonies(): ColonyState[] {
    return Array.from(colonies.values());
  }

  // Get colony statistics
  getColonyStats(): ColonyStats {
    const allColonies = this.getAllColonies();
    const totalBuildings = allColonies.reduce((sum, c) => sum + c.buildings.size, 0);
    const totalPopulation = allColonies.reduce((sum, c) => sum + c.population, 0);
    const totalWealth = allColonies.reduce((sum, c) => sum + c.economy.wealth, 0);
    const avgTier = allColonies.reduce((sum, c) => sum + c.tier, 0) / Math.max(1, allColonies.length);

    const resourceProduction: Record<ResourceType, number> = {
      energy: 0, minerals: 0, food: 0, knowledge: 0, gold: 0,
      wood: 0, stone: 0, metal: 0, glass: 0, fabric: 0,
    };

    allColonies.forEach(colony => {
      colony.buildings.forEach(building => {
        if (building.production) {
          resourceProduction[building.production.resource] += building.production.amount;
        }
      });
    });

    return {
      totalColonies: allColonies.length,
      totalBuildings,
      totalPopulation,
      totalWealth,
      resourceProduction,
      averageTier: Math.round(avgTier * 10) / 10,
    };
  }

  // Place a building
  placeBuilding(
    colonyId: string,
    buildingId: string,
    position: Position3D,
    instant: boolean = false
  ): BuildingPlacementResult {
    const colony = colonies.get(colonyId);
    if (!colony) return { success: false, error: 'Colony not found' };

    const config = BUILDING_CONFIGS.get(buildingId);
    if (!config) return { success: false, error: 'Building config not found' };

    if (colony.tier < config.requiredLevel) {
      return { success: false, error: 'Colony tier too low' };
    }

    if (colony.buildings.size >= this.config.maxBuildingsPerColony) {
      return { success: false, error: 'Maximum buildings reached' };
    }

    if (!instant) {
      for (const [resource, amount] of Object.entries(config.buildCost)) {
        if ((colony.resources[resource as ResourceType] || 0) < amount) {
          return { success: false, error: 'Not enough resources' };
        }
      }
    }

    const building: BuildingState = {
      id: this.generateId('building'),
      buildingId: buildingId,
      type: config.type,
      name: config.name,
      description: config.description,
      level: 1,
      health: config.maxHealth,
      maxHealth: config.maxHealth,
      position: { ...position },
      rotation: { x: 0, y: 0, z: 0 },
      size: { ...config.size },
      requiredLevel: config.requiredLevel,
      lastProductionTime: 0,
      productionQueue: [],
      assignedAgents: [],
      isActive: true,
      isUnderConstruction: !instant,
      constructionProgress: instant ? 100 : 0,
      constructionStartTime: Date.now(),
    };

    if (!instant) {
      colony.buildingQueue.push({
        buildingId: building.id,
        position: building.position,
        progress: 0,
      });
    } else {
      colony.buildings.set(building.id, building);
      this.emitEvent({ type: 'building_completed', buildingId: building.id, building }, colonyId);
    }

    return { success: true, buildingId: building.id, message: 'Building placed' };
  }

  // Cancel building construction
  cancelBuilding(colonyId: string, buildingId: string): boolean {
    const colony = colonies.get(colonyId);
    if (!colony) return false;

    const building = colony.buildings.get(buildingId);
    if (!building || !building.isUnderConstruction) return false;

    const queueIndex = colony.buildingQueue.findIndex(b => b.buildingId === buildingId);
    if (queueIndex !== -1) {
      colony.buildingQueue.splice(queueIndex, 1);
    }

    colony.buildings.delete(buildingId);
    return true;
  }

  // Upgrade a building
  upgradeBuilding(colonyId: string, buildingId: string): BuildingPlacementResult {
    const colony = colonies.get(colonyId);
    if (!colony) return { success: false, error: 'Colony not found' };

    const building = colony.buildings.get(buildingId);
    if (!building) return { success: false, error: 'Building not found' };

    const config = BUILDING_CONFIGS.get(building.buildingId);
    if (!config) return { success: false, error: 'Building config not found' };

    if (building.level >= config.maxLevel) {
      return { success: false, error: 'Maximum level reached' };
    }

    const upgradeCost = config.upgradeCosts[building.level + 1];
    if (!upgradeCost) return { success: false, error: 'Upgrade cost not defined' };

    for (const [resource, amount] of Object.entries(upgradeCost)) {
      if ((colony.resources[resource as ResourceType] || 0) < amount) {
        return { success: false, error: 'Not enough resources' };
      }
    }

    for (const [resource, amount] of Object.entries(upgradeCost)) {
      colony.resources[resource as ResourceType] -= amount;
    }

    building.level++;
    building.maxHealth = Math.round(config.maxHealth * (1 + building.level * 0.2));
    building.health = building.maxHealth;

    this.emitEvent({ type: 'building_upgraded', buildingId: building.id, newLevel: building.level }, colonyId);

    return { success: true, buildingId: building.id, message: 'Building upgraded' };
  }

  // Destroy a building
  destroyBuilding(colonyId: string, buildingId: string): boolean {
    const colony = colonies.get(colonyId);
    if (!colony) return false;

    const building = colony.buildings.get(buildingId);
    if (!building) return false;

    colony.buildings.delete(buildingId);
    this.emitEvent({ type: 'building_destroyed', buildingId: building.id }, colonyId);
    return true;
  }

  // Get building by ID
  getBuilding(buildingId: string, colonyId: string): BuildingState | undefined {
    return colonies.get(colonyId)?.buildings.get(buildingId);
  }

  // Get all buildings in a colony
  getBuildings(colonyId: string): BuildingState[] {
    return Array.from(colonies.get(colonyId)?.buildings.values() || []);
  }

  // Assign worker to building
  assignWorker(colonyId: string, buildingId: string, agentId: string): boolean {
    const colony = colonies.get(colonyId);
    if (!colony) return false;

    const building = colony.buildings.get(buildingId);
    if (!building) return false;

    if (building.assignedAgents.length >= building.maxWorkers) return false;
    if (building.assignedAgents.includes(agentId)) return false;

    building.assignedAgents.push(agentId);
    return true;
  }

  // Remove worker from building
  removeWorker(colonyId: string, buildingId: string, agentId: string): boolean {
    const colony = colonies.get(colonyId);
    if (!colony) return false;

    const building = colony.buildings.get(buildingId);
    if (!building) return false;

    const index = building.assignedAgents.indexOf(agentId);
    if (index === -1) return false;

    building.assignedAgents.splice(index, 1);
    return true;
  }

  // Process building production
  private processProduction(colonyId: string): void {
    const colony = colonies.get(colonyId);
    if (!colony) return;

    const now = Date.now();

    colony.buildings.forEach(building => {
      const config = BUILDING_CONFIGS.get(building.buildingId);
      if (!config || !config.production) return;

      const timeSinceLast = now - building.lastProductionTime;
      const interval = config.production.interval * 1000;

      if (timeSinceLast >= interval) {
        const amount = Math.floor(timeSinceLast / interval) * config.production.amount;
        const resource = config.production.resource;

        const max = colony.maxResources[resource] || Infinity;
        const current = colony.resources[resource] || 0;
        const toAdd = Math.min(amount, max - current);

        if (toAdd > 0) {
          colony.resources[resource] = (colony.resources[resource] || 0) + toAdd;
          building.lastProductionTime = now;

          this.emitEvent({
            type: 'resource_produced',
            resource,
            amount: toAdd,
          }, colonyId);
        }
      }
    });

    colony.lastUpdated = new Date().toISOString();
  }

  // Process building construction queue
  private processConstruction(colonyId: string): void {
    const colony = colonies.get(colonyId);
    if (!colony || colony.buildingQueue.length === 0) return;

    const queueItem = colony.buildingQueue[0];
    const building = colony.buildings.get(queueItem.buildingId);
    
    if (!building || !building.isUnderConstruction) return;

    const config = BUILDING_CONFIGS.get(building.buildingId);
    if (!config) return;

    const timeBuilding = (Date.now() - building.constructionStartTime) / 1000;
    const progress = Math.min(100, (timeBuilding / config.buildTime) * 100);

    if (progress >= 100) {
      building.isUnderConstruction = false;
      building.constructionProgress = 100;
      colony.buildingQueue.shift();

      this.emitEvent({ type: 'building_completed', buildingId: building.id, building }, colonyId);
    } else {
      building.constructionProgress = progress;
      queueItem.progress = progress;
    }
  }

  // Add resources to colony
  addResources(colonyId: string, resources: Record<ResourceType, number>): boolean {
    const colony = colonies.get(colonyId);
    if (!colony) return false;

    for (const [resource, amount] of Object.entries(resources)) {
      const max = colony.maxResources[resource as ResourceType] || Infinity;
      colony.resources[resource as ResourceType] = Math.min(
        (colony.resources[resource as ResourceType] || 0) + amount,
        max
      );
    }

    return true;
  }

  // Remove resources from colony
  removeResources(colonyId: string, resources: Record<ResourceType, number>): boolean {
    const colony = colonies.get(colonyId);
    if (!colony) return false;

    for (const [resource, amount] of Object.entries(resources)) {
      if ((colony.resources[resource as ResourceType] || 0) < amount) {
        return false;
      }
    }

    for (const [resource, amount] of Object.entries(resources)) {
      colony.resources[resource as ResourceType] -= amount;
    }

    return true;
  }

  // Add XP to colony
  addXP(colonyId: string, xp: number): void {
    const colony = colonies.get(colonyId);
    if (!colony) return;

    colony.xp += xp;

    while (colony.xp >= colony.xpToNextTier && colony.tier < 10) {
      colony.xp -= colony.xpToNextTier;
      colony.tier++;
      colony.xpToNextTier = this.config.tierRequirements[colony.tier + 1 as ColonyTier] || 999999;

      this.emitEvent({ type: 'tier_upgraded', previousTier: colony.tier - 1 as ColonyTier, newTier: colony.tier }, colonyId);
    }
  }

  // Add population to colony
  addPopulation(colonyId: string, count: number = 1): boolean {
    const colony = colonies.get(colonyId);
    if (!colony) return false;

    const newPopulation = colony.population + count;
    if (newPopulation > colony.maxPopulation) return false;

    colony.population = newPopulation;
    this.emitEvent({ type: 'population_changed', previous: colony.population - count, current: colony.population }, colonyId);

    return true;
  }

  // Remove population from colony
  removePopulation(colonyId: string, count: number = 1): boolean {
    const colony = colonies.get(colonyId);
    if (!colony) return false;

    colony.population = Math.max(0, colony.population - count);
    this.emitEvent({ type: 'population_changed', previous: colony.population + count, current: colony.population }, colonyId);

    return true;
  }

  // Add resident to colony
  addResident(colonyId: string, agentId: string): boolean {
    const colony = colonies.get(colonyId);
    if (!colony) return false;

    if (colony.residents.includes(agentId)) return false;
    if (colony.residents.length >= colony.maxPopulation) return false;

    colony.residents.push(agentId);
    colony.population++;
    this.emitEvent({ type: 'population_changed', previous: colony.population - 1, current: colony.population }, colonyId);

    return true;
  }

  // Remove resident from colony
  removeResident(colonyId: string, agentId: string): boolean {
    const colony = colonies.get(colonyId);
    if (!colony) return false;

    const index = colony.residents.indexOf(agentId);
    if (index === -1) return false;

    colony.residents.splice(index, 1);
    colony.population--;
    this.emitEvent({ type: 'population_changed', previous: colony.population + 1, current: colony.population }, colonyId);

    return true;
  }

  // Start colony production loop
  startProduction(): void {
    if (this.productionInterval) return;

    this.productionInterval = setInterval(() => {
      colonies.forEach((colony, colonyId) => {
        this.processProduction(colonyId);
        this.processConstruction(colonyId);
      });
    }, this.config.productionInterval * 1000);
  }

  // Stop colony production loop
  stopProduction(): void {
    if (this.productionInterval) {
      clearInterval(this.productionInterval);
      this.productionInterval = null;
    }
  }

  // Get building config
  getBuildingConfig(buildingId: string): BuildingConfig | undefined {
    return BUILDING_CONFIGS.get(buildingId);
  }

  // Get all building configs
  getAllBuildingConfigs(): BuildingConfig[] {
    return Array.from(BUILDING_CONFIGS.values());
  }

  // Get colony config
  getColonyConfig(configId: string): ColonyConfig | undefined {
    return COLONY_CONFIGS.get(configId);
  }

  // Get all colony configs
  getAllColonyConfigs(): ColonyConfig[] {
    return Array.from(COLONY_CONFIGS.values());
  }

  // Register custom building config
  registerBuildingConfig(config: BuildingConfig): void {
    BUILDING_CONFIGS.set(config.id, config);
  }

  // Register custom colony config
  registerColonyConfig(config: ColonyConfig): void {
    COLONY_CONFIGS.set(config.id, config);
  }

  // Event system
  onEvent(colonyId: string, handler: ColonyEventHandler): () => void {
    if (!eventHandlers.has(colonyId)) {
      eventHandlers.set(colonyId, []);
    }
    const handlers = eventHandlers.get(colonyId)!;
    handlers.push(handler);
    return () => {
      const index = handlers.indexOf(handler);
      if (index > -1) handlers.splice(index, 1);
    };
  }

  private emitEvent(event: ColonyEvent, colonyId: string): void {
    const handlers = eventHandlers.get(colonyId);
    if (!handlers) return;

    handlers.forEach(handler => {
      try {
        handler(event, colonyId);
      } catch (e) {
        console.error('Colony event handler error:', e);
      }
    });
  }

  // Generate unique ID
  private generateId(prefix: string): string {
    return prefix + '-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
  }

  // Cleanup
  destroy(): void {
    this.stopProduction();
    colonies.clear();
    eventHandlers.clear();
  }
}

export const colonyManager = new ColonyManager();

// React hook for colony interactions
export function useColony(colonyId: string) {
  const [colony, setColony] = useState<ColonyState | undefined>(colonyManager.getColony(colonyId));

  useEffect(() => {
    const updateColony = () => {
      setColony(colonyManager.getColony(colonyId));
    };

    updateColony();

    const unsubscribe = colonyManager.onEvent(colonyId, () => updateColony());
    const interval = setInterval(updateColony, 1000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, [colonyId]);

  return colony;
}

// React hook for colony building
export function useColonyBuilding(colonyId: string) {
  const colony = useColony(colonyId);

  const placeBuilding = useCallback((buildingId: string, position: Position3D) => {
    return colonyManager.placeBuilding(colonyId, buildingId, position);
  }, [colonyId]);

  const upgradeBuilding = useCallback((buildingId: string) => {
    return colonyManager.upgradeBuilding(colonyId, buildingId);
  }, [colonyId]);

  const destroyBuilding = useCallback((buildingId: string) => {
    return colonyManager.destroyBuilding(colonyId, buildingId);
  }, [colonyId]);

  const getBuildings = useCallback(() => {
    return colonyManager.getBuildings(colonyId);
  }, [colonyId]);

  const getBuildingConfigs = useCallback(() => {
    return colonyManager.getAllBuildingConfigs();
  }, []);

  return {
    colony,
    placeBuilding,
    upgradeBuilding,
    destroyBuilding,
    getBuildings,
    getBuildingConfigs,
  };
}