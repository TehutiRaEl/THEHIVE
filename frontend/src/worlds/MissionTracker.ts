/**
 * Mission System for THEHIVE
 * Structured objectives and rewards
 */

import { Position3D } from './types';
import { xpSystem } from '../xp/system';
import { colonyManager } from './ColonyManager';

// Mission types
export type MissionType = 
  | 'tutorial'
  | 'exploration'
  | 'combat'
  | 'building'
  | 'resource'
  | 'social'
  | 'colony'
  | 'achievement';

// Mission difficulty
export type MissionDifficulty = 'easy' | 'medium' | 'hard' | 'epic' | 'legendary';

// Mission status
export type MissionStatus = 'locked' | 'available' | 'active' | 'completed' | 'failed' | 'abandoned';

// Mission objective types
export type MissionObjectiveType = 
  | 'reach_location'
  | 'collect_resource'
  | 'defeat_enemy'
  | 'build_structure'
  | 'upgrade_building'
  | 'recruit_agent'
  | 'complete_quest'
  | 'reach_level'
  | 'earn_xp'
  | 'discover_location'
  | 'trade_item'
  | 'craft_item'
  | 'social_interaction';

// Mission objective
export interface MissionObjective {
  id: string;
  type: MissionObjectiveType;
  description: string;
  targetId?: string; // Entity ID, location ID, etc.
  targetType?: string;
  quantity: number;
  completed: number;
  requiredLevel?: number;
  location?: Position3D;
  radius?: number;
}

// Mission reward
export interface MissionReward {
  type: 'xp' | 'item' | 'currency' | 'building' | 'unlock' | 'reputation';
  amount: number;
  itemId?: string;
  buildingId?: string;
  featureId?: string;
  factionId?: string;
}

// Mission configuration
export interface MissionConfig {
  id: string;
  name: string;
  description: string;
  type: MissionType;
  difficulty: MissionDifficulty;
  
  // Requirements
  requiredLevel: number;
  requiredMissions?: string[]; // Prerequisite missions
  requiredItems?: string[];
  requiredResources?: Record<string, number>;
  
  // Objectives
  objectives: MissionObjective[];
  
  // Rewards
  rewards: MissionReward[];
  
  // Settings
  timeLimit?: number; // In seconds
  autoComplete: boolean;
  repeatable: boolean;
  
  // Story
  story?: {
    intro: string;
    inProgress: string;
    completion: string;
  };
  
  // Visual
  icon?: string;
  color?: number;
}

// Mission state (runtime)
export interface MissionState extends MissionConfig {
  status: MissionStatus;
  userId: string;
  colonyId?: string;
  startedAt?: string;
  completedAt?: string;
  failedAt?: string;
  progress: number; // 0-100
  currentObjectiveIndex: number;
  attempts: number;
}

// Mission category
export interface MissionCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: number;
  missions: string[];
}

// Mission tracker configuration
export interface MissionTrackerConfig {
  maxActiveMissions: number;
  autoAbandonAfter: number; // In days
  showNotifications: boolean;
  trackProgress: boolean;
}

const DEFAULT_CONFIG: MissionTrackerConfig = {
  maxActiveMissions: 5,
  autoAbandonAfter: 7,
  showNotifications: true,
  trackProgress: true,
};

// Active missions by user
export class MissionTracker {
  private config: MissionTrackerConfig = DEFAULT_CONFIG;
  private missions: Map<string, MissionConfig> = new Map();
  private userMissions: Map<string, Map<string, MissionState>> = new Map();
  private categories: Map<string, MissionCategory> = new Map();
  private eventHandlers: ((event: MissionEvent) => void)[] = [];

  constructor(config: Partial<MissionTrackerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.initializeDefaultMissions();
    this.initializeDefaultCategories();
  }

  // Initialize default missions
  private initializeDefaultMissions(): void {
    const defaultMissions: MissionConfig[] = [
      {
        id: 'mission-tutorial-1',
        name: 'First Steps',
        description: 'Learn the basics of THEHIVE',
        type: 'tutorial',
        difficulty: 'easy',
        requiredLevel: 1,
        objectives: [
          { id: 'obj-create-avatar', type: 'social_interaction', description: 'Customize your avatar', completed: 0, quantity: 1 },
          { id: 'obj-explore', type: 'reach_location', description: 'Visit the sandbox world', completed: 0, quantity: 1, location: { x: 0, y: 0, z: 0 }, radius: 50 },
        ],
        rewards: [
          { type: 'xp', amount: 100 },
          { type: 'unlock', featureId: 'basic_building' },
        ],
        autoComplete: false,
        repeatable: false,
        story: {
          intro: 'Welcome to THEHIVE! Complete these first steps to get started.',
          inProgress: 'You are making progress in your first mission.',
          completion: 'Excellent! You have completed your first mission. The world of THEHIVE awaits!',
        },
        icon: '🎯',
        color: 0x4CAF50,
      },
      {
        id: 'mission-explore-1',
        name: 'Explorer',
        description: 'Discover new locations',
        type: 'exploration',
        difficulty: 'easy',
        requiredLevel: 2,
        requiredMissions: ['mission-tutorial-1'],
        objectives: [
          { id: 'obj-explore-50', type: 'reach_location', description: 'Explore 50 units from origin', completed: 0, quantity: 1, location: { x: 0, y: 0, z: 0 }, radius: 50 },
          { id: 'obj-discover-colony', type: 'discover_location', description: 'Find a colony', completed: 0, quantity: 1 },
        ],
        rewards: [
          { type: 'xp', amount: 200 },
          { type: 'item', itemId: 'compass', amount: 1 },
        ],
        autoComplete: false,
        repeatable: true,
        icon: '🗺️',
        color: 0x2196F3,
      },
      {
        id: 'mission-building-1',
        name: 'Builder',
        description: 'Construct your first building',
        type: 'building',
        difficulty: 'medium',
        requiredLevel: 3,
        requiredMissions: ['mission-tutorial-1'],
        objectives: [
          { id: 'obj-place-townhall', type: 'build_structure', description: 'Place a Town Hall', completed: 0, quantity: 1, targetId: 'townhall' },
          { id: 'obj-place-house', type: 'build_structure', description: 'Place a House', completed: 0, quantity: 1, targetId: 'residential' },
        ],
        rewards: [
          { type: 'xp', amount: 300 },
          { type: 'currency', amount: 100 },
        ],
        autoComplete: false,
        repeatable: false,
        icon: '🏗️',
        color: 0xFF9800,
      },
      {
        id: 'mission-resource-1',
        name: 'Gatherer',
        description: 'Collect resources for your colony',
        type: 'resource',
        difficulty: 'medium',
        requiredLevel: 3,
        objectives: [
          { id: 'obj-collect-wood', type: 'collect_resource', description: 'Collect 100 wood', completed: 0, quantity: 100, targetId: 'wood' },
          { id: 'obj-collect-stone', type: 'collect_resource', description: 'Collect 100 stone', completed: 0, quantity: 100, targetId: 'stone' },
        ],
        rewards: [
          { type: 'xp', amount: 250 },
          { type: 'item', itemId: 'resource_pack', amount: 1 },
        ],
        autoComplete: false,
        repeatable: true,
        icon: '⛏️',
        color: 0xFF5722,
      },
      {
        id: 'mission-combat-1',
        name: 'Defender',
        description: 'Protect your colony from threats',
        type: 'combat',
        difficulty: 'hard',
        requiredLevel: 5,
        objectives: [
          { id: 'obj-defeat-10', type: 'defeat_enemy', description: 'Defeat 10 enemies', completed: 0, quantity: 10 },
          { id: 'obj-survive-attack', type: 'defeat_enemy', description: 'Survive a colony attack', completed: 0, quantity: 1 },
        ],
        rewards: [
          { type: 'xp', amount: 500 },
          { type: 'item', itemId: 'defense_boost', amount: 1 },
        ],
        autoComplete: false,
        repeatable: true,
        icon: '⚔️',
        color: 0xF44336,
      },
      {
        id: 'mission-colony-1',
        name: 'Colony Founder',
        description: 'Establish your first colony',
        type: 'colony',
        difficulty: 'medium',
        requiredLevel: 4,
        objectives: [
          { id: 'obj-create-colony', type: 'build_structure', description: 'Create a colony', completed: 0, quantity: 1, targetId: 'townhall' },
          { id: 'obj-reach-population', type: 'social_interaction', description: 'Reach 5 population', completed: 0, quantity: 5 },
        ],
        rewards: [
          { type: 'xp', amount: 400 },
          { type: 'unlock', featureId: 'colony_management' },
        ],
        autoComplete: false,
        repeatable: false,
        icon: '🏰',
        color: 0x9C27B0,
      },
      {
        id: 'mission-achievement-1',
        name: 'Achiever',
        description: 'Complete multiple achievements',
        type: 'achievement',
        difficulty: 'epic',
        requiredLevel: 5,
        objectives: [
          { id: 'obj-earn-1000-xp', type: 'earn_xp', description: 'Earn 1000 XP', completed: 0, quantity: 1000 },
          { id: 'obj-complete-5-missions', type: 'complete_quest', description: 'Complete 5 missions', completed: 0, quantity: 5 },
        ],
        rewards: [
          { type: 'xp', amount: 1000 },
          { type: 'item', itemId: 'achievement_trophy', amount: 1 },
        ],
        autoComplete: false,
        repeatable: false,
        icon: '🏆',
        color: 0xFFD700,
      },
    ];

    defaultMissions.forEach(mission => this.missions.set(mission.id, mission));
  }

  // Initialize default categories
  private initializeDefaultCategories(): void {
    const defaultCategories: MissionCategory[] = [
      {
        id: 'tutorial',
        name: 'Tutorial',
        description: 'Learn the basics',
        icon: '🎓',
        color: 0x4CAF50,
        missions: ['mission-tutorial-1'],
      },
      {
        id: 'exploration',
        name: 'Exploration',
        description: 'Discover new places',
        icon: '🗺️',
        color: 0x2196F3,
        missions: ['mission-explore-1'],
      },
      {
        id: 'building',
        name: 'Building',
        description: 'Construct structures',
        icon: '🏗️',
        color: 0xFF9800,
        missions: ['mission-building-1'],
      },
      {
        id: 'resource',
        name: 'Resources',
        description: 'Gather materials',
        icon: '⛏️',
        color: 0xFF5722,
        missions: ['mission-resource-1'],
      },
      {
        id: 'combat',
        name: 'Combat',
        description: 'Fight enemies',
        icon: '⚔️',
        color: 0xF44336,
        missions: ['mission-combat-1'],
      },
      {
        id: 'colony',
        name: 'Colony',
        description: 'Manage your colony',
        icon: '🏰',
        color: 0x9C27B0,
        missions: ['mission-colony-1'],
      },
      {
        id: 'achievement',
        name: 'Achievements',
        description: 'Complete challenges',
        icon: '🏆',
        color: 0xFFD700,
        missions: ['mission-achievement-1'],
      },
    ];

    defaultCategories.forEach(category => this.categories.set(category.id, category));
  }

  // Get mission config
  getMissionConfig(missionId: string): MissionConfig | undefined {
    return this.missions.get(missionId);
  }

  // Get all mission configs
  getAllMissionConfigs(): MissionConfig[] {
    return Array.from(this.missions.values());
  }

  // Get missions by category
  getMissionsByCategory(categoryId: string): MissionConfig[] {
    const category = this.categories.get(categoryId);
    if (!category) return [];
    return category.missions.map(id => this.missions.get(id)).filter(Boolean) as MissionConfig[];
  }

  // Get all categories
  getAllCategories(): MissionCategory[] {
    return Array.from(this.categories.values());
  }

  // Get category by ID
  getCategory(categoryId: string): MissionCategory | undefined {
    return this.categories.get(categoryId);
  }

  // Activate a mission for a user
  activateMission(userId: string, missionId: string, colonyId?: string): MissionState | null {
    const config = this.missions.get(missionId);
    if (!config) return null;

    const userMissionsMap = this.userMissions.get(userId) || new Map();

    if (userMissionsMap.has(missionId)) {
      const existing = userMissionsMap.get(missionId)!;
      if (existing.status === 'active') {
        return existing;
      }
    }

    if (config.requiredLevel) {
      const balance = xpSystem.getBalance(userId);
      if ((balance?.level || 1) < config.requiredLevel) {
        return null;
      }
    }

    if (config.requiredMissions && config.requiredMissions.length > 0) {
      const allCompleted = config.requiredMissions.every(reqId => {
        const reqMission = userMissionsMap.get(reqId);
        return reqMission?.status === 'completed';
      });
      if (!allCompleted) return null;
    }

    const state: MissionState = {
      ...config,
      status: 'active',
      userId,
      colonyId,
      startedAt: new Date().toISOString(),
      progress: 0,
      currentObjectiveIndex: 0,
      attempts: 1,
    };

    userMissionsMap.set(missionId, state);
    this.userMissions.set(userId, userMissionsMap);

    this.emitEvent({ type: 'mission_started', missionId, userId });
    return state;
  }

  // Complete a mission objective
  completeObjective(userId: string, missionId: string, objectiveId: string, amount: number = 1): boolean {
    const userMissionsMap = this.userMissions.get(userId);
    if (!userMissionsMap) return false;

    const mission = userMissionsMap.get(missionId);
    if (!mission || mission.status !== 'active') return false;

    const config = this.missions.get(missionId);
    if (!config) return false;

    const objective = config.objectives.find(o => o.id === objectiveId);
    if (!objective) return false;

    const currentObjective = config.objectives[mission.currentObjectiveIndex];
    if (currentObjective.id !== objectiveId) return false;

    objective.completed += amount;
    mission.progress = this.calculateMissionProgress(mission);

    if (objective.completed >= objective.quantity) {
      mission.currentObjectiveIndex++;
      
      if (mission.currentObjectiveIndex >= config.objectives.length) {
        return this.completeMission(userId, missionId);
      }
    }

    this.emitEvent({ type: 'mission_progress', missionId, userId, progress: mission.progress });
    return true;
  }

  // Complete a mission
  completeMission(userId: string, missionId: string): boolean {
    const userMissionsMap = this.userMissions.get(userId);
    if (!userMissionsMap) return false;

    const mission = userMissionsMap.get(missionId);
    if (!mission || mission.status !== 'active') return false;

    mission.status = 'completed';
    mission.completedAt = new Date().toISOString();
    mission.progress = 100;

    const config = this.missions.get(missionId);
    if (config) {
      this.awardMissionRewards(userId, config.rewards, missionId);
    }

    this.emitEvent({ type: 'mission_completed', missionId, userId });
    return true;
  }

  // Award mission rewards
  private awardMissionRewards(userId: string, rewards: MissionReward[], missionId: string): void {
    rewards.forEach(reward => {
      switch (reward.type) {
        case 'xp':
          xpSystem.awardXP(userId, 'mission_complete', { missionId, reward: reward.amount });
          break;
        case 'item':
          if (reward.itemId) {
            this.awardItem(userId, reward.itemId, reward.amount);
          }
          break;
        case 'currency':
          this.awardCurrency(userId, reward.amount);
          break;
        case 'building':
          if (reward.buildingId) {
            this.unlockBuilding(userId, reward.buildingId);
          }
          break;
        case 'unlock':
          if (reward.featureId) {
            this.unlockFeature(userId, reward.featureId);
          }
          break;
        case 'reputation':
          if (reward.factionId) {
            this.awardReputation(userId, reward.factionId, reward.amount);
          }
          break;
      }
    });
  }

  // Award an item
  private awardItem(userId: string, itemId: string, amount: number): void {
    console.log('Awarded item:', itemId, 'x' + amount, 'to user:', userId);
  }

  // Award currency
  private awardCurrency(userId: string, amount: number): void {
    console.log('Awarded currency:', amount, 'to user:', userId);
  }

  // Unlock a building
  private unlockBuilding(userId: string, buildingId: string): void {
    console.log('Unlocked building:', buildingId, 'for user:', userId);
  }

  // Unlock a feature
  private unlockFeature(userId: string, featureId: string): void {
    console.log('Unlocked feature:', featureId, 'for user:', userId);
  }

  // Award reputation
  private awardReputation(userId: string, factionId: string, amount: number): void {
    console.log('Awarded reputation:', amount, 'with faction:', factionId, 'to user:', userId);
  }

  // Abandon a mission
  abandonMission(userId: string, missionId: string): boolean {
    const userMissionsMap = this.userMissions.get(userId);
    if (!userMissionsMap) return false;

    const mission = userMissionsMap.get(missionId);
    if (!mission || mission.status !== 'active') return false;

    mission.status = 'abandoned';
    mission.failedAt = new Date().toISOString();

    this.emitEvent({ type: 'mission_abandoned', missionId, userId });
    return true;
  }

  // Fail a mission
  failMission(userId: string, missionId: string): boolean {
    const userMissionsMap = this.userMissions.get(userId);
    if (!userMissionsMap) return false;

    const mission = userMissionsMap.get(missionId);
    if (!mission || mission.status !== 'active') return false;

    mission.status = 'failed';
    mission.failedAt = new Date().toISOString();
    mission.attempts++;

    this.emitEvent({ type: 'mission_failed', missionId, userId });
    return true;
  }

  // Restart a mission
  restartMission(userId: string, missionId: string): MissionState | null {
    const userMissionsMap = this.userMissions.get(userId);
    if (!userMissionsMap) return null;

    const mission = userMissionsMap.get(missionId);
    if (!mission || (mission.status !== 'failed' && mission.status !== 'abandoned')) return null;

    const config = this.missions.get(missionId);
    if (!config) return null;

    const state: MissionState = {
      ...config,
      status: 'active',
      userId,
      colonyId: mission.colonyId,
      startedAt: new Date().toISOString(),
      progress: 0,
      currentObjectiveIndex: 0,
      attempts: mission.attempts + 1,
    };

    userMissionsMap.set(missionId, state);
    this.emitEvent({ type: 'mission_restarted', missionId, userId });
    return state;
  }

  // Get user missions
  getUserMissions(userId: string): MissionState[] {
    return Array.from(this.userMissions.get(userId)?.values() || []);
  }

  // Get active missions for user
  getActiveMissions(userId: string): MissionState[] {
    return this.getUserMissions(userId).filter(m => m.status === 'active');
  }

  // Get available missions for user
  getAvailableMissions(userId: string): MissionConfig[] {
    const userMissions = this.getUserMissions(userId);
    const balance = xpSystem.getBalance(userId);
    const userLevel = balance?.level || 1;

    return Array.from(this.missions.values()).filter(mission => {
      if (mission.requiredLevel > userLevel) return false;
      
      if (mission.requiredMissions && mission.requiredMissions.length > 0) {
        const allCompleted = mission.requiredMissions.every(reqId => {
          return userMissions.some(m => m.id === reqId && m.status === 'completed');
        });
        if (!allCompleted) return false;
      }

      if (!mission.repeatable) {
        const hasCompleted = userMissions.some(m => m.id === mission.id && m.status === 'completed');
        if (hasCompleted) return false;
      }

      const hasActive = userMissions.some(m => m.id === mission.id && m.status === 'active');
      if (hasActive) return false;

      return true;
    });
  }

  // Get completed missions for user
  getCompletedMissions(userId: string): MissionState[] {
    return this.getUserMissions(userId).filter(m => m.status === 'completed');
  }

  // Calculate mission progress
  private calculateMissionProgress(mission: MissionState): number {
    const config = this.missions.get(mission.id);
    if (!config) return 0;

    let completed = 0;
    let total = 0;

    config.objectives.forEach((obj, index) => {
      if (index < mission.currentObjectiveIndex) {
        completed += obj.quantity;
        total += obj.quantity;
      } else if (index === mission.currentObjectiveIndex) {
        completed += Math.min(obj.completed, obj.quantity);
        total += obj.quantity;
      }
    });

    return Math.round((completed / total) * 100);
  }

  // Register custom mission
  registerMission(config: MissionConfig): void {
    this.missions.set(config.id, config);
  }

  // Register custom category
  registerCategory(category: MissionCategory): void {
    this.categories.set(category.id, category);
  }

  // Mission events
  onEvent(handler: (event: MissionEvent) => void): () => void {
    this.eventHandlers.push(handler);
    return () => {
      const index = this.eventHandlers.indexOf(handler);
      if (index > -1) this.eventHandlers.splice(index, 1);
    };
  }

  private emitEvent(event: MissionEvent): void {
    this.eventHandlers.forEach(handler => {
      try {
        handler(event);
      } catch (e) {
        console.error('Mission event handler error:', e);
      }
    });
  }

  // Generate unique ID
  private generateId(prefix: string): string {
    return prefix + '-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
  }

  // Cleanup
  destroy(): void {
    this.missions.clear();
    this.userMissions.clear();
    this.categories.clear();
    this.eventHandlers.length = 0;
  }
}

export const missionTracker = new MissionTracker();

// Mission event types
export type MissionEvent = 
  | { type: 'mission_started'; missionId: string; userId: string }
  | { type: 'mission_progress'; missionId: string; userId: string; progress: number }
  | { type: 'mission_completed'; missionId: string; userId: string }
  | { type: 'mission_failed'; missionId: string; userId: string }
  | { type: 'mission_abandoned'; missionId: string; userId: string }
  | { type: 'mission_restarted'; missionId: string; userId: string }
  | { type: 'objective_completed'; missionId: string; userId: string; objectiveId: string };

// React hook for missions
export function useMissions(userId: string) {
  const [missions, setMissions] = useState<MissionState[]>([]);
  const [available, setAvailable] = useState<MissionConfig[]>([]);

  useEffect(() => {
    const updateMissions = () => {
      setMissions(missionTracker.getUserMissions(userId));
      setAvailable(missionTracker.getAvailableMissions(userId));
    };

    updateMissions();

    const unsubscribe = missionTracker.onEvent(() => updateMissions());
    const interval = setInterval(updateMissions, 5000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, [userId]);

  const activateMission = useCallback((missionId: string) => {
    return missionTracker.activateMission(userId, missionId);
  }, [userId]);

  const completeObjective = useCallback((missionId: string, objectiveId: string, amount: number = 1) => {
    return missionTracker.completeObjective(userId, missionId, objectiveId, amount);
  }, [userId]);

  const abandonMission = useCallback((missionId: string) => {
    return missionTracker.abandonMission(userId, missionId);
  }, [userId]);

  return { missions, available, activateMission, completeObjective, abandonMission };
}