/**
 * Achievement System for THEHIVE
 * Unlockable accomplishments with rewards
 */

import { xpSystem } from '../xp/system';
import { missionTracker } from './MissionTracker';

// Achievement types
export type AchievementType = 
  | 'exploration'
  | 'combat'
  | 'building'
  | 'social'
  | 'economy'
  | 'collection'
  | 'skill'
  | 'time'
  | 'special';

// Achievement rarity
export type AchievementRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

// Achievement status
export type AchievementStatus = 'locked' | 'unlocked' | 'progress';

// Achievement configuration
export interface AchievementConfig {
  id: string;
  name: string;
  description: string;
  type: AchievementType;
  rarity: AchievementRarity;
  
  // Requirements
  requiredLevel?: number;
  requiredAchievements?: string[];
  requiredMissions?: string[];
  
  // Progress tracking
  target: number;
  current?: number;
  increment?: number;
  
  // Rewards
  rewards: AchievementReward[];
  
  // Visual
  icon?: string;
  color?: number;
  hidden?: boolean;
  
  // Points
  points: number;
}

// Achievement state (runtime)
export interface AchievementState extends AchievementConfig {
  status: AchievementStatus;
  userId: string;
  unlockedAt?: string;
  progress: number;
  lastUpdate: string;
}

// Achievement reward
export interface AchievementReward {
  type: 'xp' | 'item' | 'currency' | 'title' | 'avatar' | 'building' | 'feature';
  amount?: number;
  itemId?: string;
  titleId?: string;
  avatarPartId?: string;
  buildingId?: string;
  featureId?: string;
}

// Achievement category
export interface AchievementCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: number;
  achievements: string[];
}

// Achievement tracker configuration
export interface AchievementTrackerConfig {
  maxProgress: number;
  showNotifications: boolean;
  showProgress: boolean;
  autoUnlock: boolean;
}

const DEFAULT_CONFIG: AchievementTrackerConfig = {
  maxProgress: 100,
  showNotifications: true,
  showProgress: true,
  autoUnlock: true,
};

// Achievement points thresholds for titles
export const TITLE_THRESHOLDS: Record<string, { name: string; threshold: number }> = {
  'novice': { name: 'Novice', threshold: 0 },
  'explorer': { name: 'Explorer', threshold: 100 },
  'adventurer': { name: 'Adventurer', threshold: 500 },
  'veteran': { name: 'Veteran', threshold: 1000 },
  'champion': { name: 'Champion', threshold: 2000 },
  'legend': { name: 'Legend', threshold: 5000 },
  'master': { name: 'Master', threshold: 10000 },
};

// Rarity colors
export const RARITY_COLORS: Record<AchievementRarity, number> = {
  common: 0x888888,
  uncommon: 0x4CAF50,
  rare: 0x2196F3,
  epic: 0x9C27B0,
  legendary: 0xFFD700,
};

export class AchievementTracker {
  private config: AchievementTrackerConfig = DEFAULT_CONFIG;
  private achievements: Map<string, AchievementConfig> = new Map();
  private userAchievements: Map<string, Map<string, AchievementState>> = new Map();
  private categories: Map<string, AchievementCategory> = new Map();
  private eventHandlers: ((event: AchievementEvent) => void)[] = [];

  constructor(config: Partial<AchievementTrackerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.initializeDefaultAchievements();
    this.initializeDefaultCategories();
  }

  // Initialize default achievements
  private initializeDefaultAchievements(): void {
    const defaultAchievements: AchievementConfig[] = [
      // Exploration
      {
        id: 'achievement-first-steps',
        name: 'First Steps',
        description: 'Complete your first mission',
        type: 'exploration',
        rarity: 'common',
        target: 1,
        points: 10,
        rewards: [{ type: 'xp', amount: 50 }],
        icon: '👣',
        color: 0x4CAF50,
      },
      {
        id: 'achievement-explorer',
        name: 'Explorer',
        description: 'Visit 10 different locations',
        type: 'exploration',
        rarity: 'uncommon',
        target: 10,
        points: 25,
        rewards: [{ type: 'xp', amount: 100 }],
        icon: '🗺️',
        color: 0x2196F3,
      },
      {
        id: 'achievement-world-traveler',
        name: 'World Traveler',
        description: 'Travel between 5 different worlds',
        type: 'exploration',
        rarity: 'rare',
        target: 5,
        points: 50,
        rewards: [{ type: 'xp', amount: 200 }, { type: 'item', itemId: 'world_map' }],
        icon: '🌍',
        color: 0xFF5722,
      },
      {
        id: 'achievement-discoverer',
        name: 'Discoverer',
        description: 'Discover a hidden location',
        type: 'exploration',
        rarity: 'epic',
        target: 1,
        points: 100,
        rewards: [{ type: 'xp', amount: 500 }, { type: 'title', titleId: 'explorer' }],
        icon: '🔍',
        color: 0x9C27B0,
      },
      
      // Combat
      {
        id: 'achievement-first-blood',
        name: 'First Blood',
        description: 'Defeat your first enemy',
        type: 'combat',
        rarity: 'common',
        target: 1,
        points: 15,
        rewards: [{ type: 'xp', amount: 75 }],
        icon: '⚔️',
        color: 0xF44336,
      },
      {
        id: 'achievement-warrior',
        name: 'Warrior',
        description: 'Defeat 50 enemies',
        type: 'combat',
        rarity: 'uncommon',
        target: 50,
        points: 30,
        rewards: [{ type: 'xp', amount: 150 }, { type: 'item', itemId: 'sword' }],
        icon: '🛡️',
        color: 0xF44336,
      },
      {
        id: 'achievement-slayer',
        name: 'Slayer',
        description: 'Defeat 500 enemies',
        type: 'combat',
        rarity: 'rare',
        target: 500,
        points: 75,
        rewards: [{ type: 'xp', amount: 300 }, { type: 'item', itemId: 'legendary_sword' }],
        icon: '☠️',
        color: 0xF44336,
      },
      {
        id: 'achievement-champion',
        name: 'Champion',
        description: 'Defeat 1000 enemies',
        type: 'combat',
        rarity: 'epic',
        target: 1000,
        points: 150,
        rewards: [{ type: 'xp', amount: 500 }, { type: 'title', titleId: 'warrior' }],
        icon: '🏆',
        color: 0xFFD700,
      },
      
      // Building
      {
        id: 'achievement-first-building',
        name: 'Builder',
        description: 'Construct your first building',
        type: 'building',
        rarity: 'common',
        target: 1,
        points: 10,
        rewards: [{ type: 'xp', amount: 50 }],
        icon: '🏗️',
        color: 0xFF9800,
      },
      {
        id: 'achievement-architect',
        name: 'Architect',
        description: 'Construct 20 buildings',
        type: 'building',
        rarity: 'uncommon',
        target: 20,
        points: 25,
        rewards: [{ type: 'xp', amount: 100 }, { type: 'building', buildingId: 'townhall' }],
        icon: '🏛️',
        color: 0xFF9800,
      },
      {
        id: 'achievement-master-builder',
        name: 'Master Builder',
        description: 'Construct 100 buildings',
        type: 'building',
        rarity: 'rare',
        target: 100,
        points: 50,
        rewards: [{ type: 'xp', amount: 200 }, { type: 'feature', featureId: 'advanced_building' }],
        icon: '🏙️',
        color: 0xFF9800,
      },
      {
        id: 'achievement-creator',
        name: 'Creator',
        description: 'Found your first colony',
        type: 'building',
        rarity: 'epic',
        target: 1,
        points: 100,
        rewards: [{ type: 'xp', amount: 500 }, { type: 'title', titleId: 'settler' }],
        icon: '🏰',
        color: 0x9C27B0,
      },
      
      // Economy
      {
        id: 'achievement-first-trade',
        name: 'Trader',
        description: 'Complete your first trade',
        type: 'economy',
        rarity: 'common',
        target: 1,
        points: 10,
        rewards: [{ type: 'xp', amount: 50 }],
        icon: '💰',
        color: 0xFFD700,
      },
      {
        id: 'achievement-merchant',
        name: 'Merchant',
        description: 'Complete 50 trades',
        type: 'economy',
        rarity: 'uncommon',
        target: 50,
        points: 25,
        rewards: [{ type: 'xp', amount: 100 }, { type: 'currency', amount: 500 }],
        icon: '🛍️',
        color: 0xFFD700,
      },
      {
        id: 'achievement-tycoon',
        name: 'Tycoon',
        description: 'Accumulate 10000 gold',
        type: 'economy',
        rarity: 'rare',
        target: 10000,
        points: 50,
        rewards: [{ type: 'xp', amount: 200 }, { type: 'title', titleId: 'merchant' }],
        icon: '💎',
        color: 0xFFD700,
      },
      {
        id: 'achievement-rich',
        name: 'Rich',
        description: 'Accumulate 100000 gold',
        type: 'economy',
        rarity: 'legendary',
        target: 100000,
        points: 200,
        rewards: [{ type: 'xp', amount: 1000 }, { type: 'title', titleId: 'tycoon' }],
        icon: '👑',
        color: 0xFFD700,
      },
      
      // Collection
      {
        id: 'achievement-collector',
        name: 'Collector',
        description: 'Collect 100 different items',
        type: 'collection',
        rarity: 'uncommon',
        target: 100,
        points: 30,
        rewards: [{ type: 'xp', amount: 150 }],
        icon: '🎒',
        color: 0x9C27B0,
      },
      {
        id: 'achievement-hoarder',
        name: 'Hoarder',
        description: 'Collect 500 different items',
        type: 'collection',
        rarity: 'rare',
        target: 500,
        points: 75,
        rewards: [{ type: 'xp', amount: 300 }, { type: 'feature', featureId: 'extra_inventory' }],
        icon: '📦',
        color: 0x9C27B0,
      },
      
      // Skill
      {
        id: 'achievement-level-10',
        name: 'Veteran',
        description: 'Reach level 10',
        type: 'skill',
        rarity: 'uncommon',
        target: 10,
        points: 25,
        rewards: [{ type: 'xp', amount: 100 }, { type: 'title', titleId: 'veteran' }],
        icon: '📈',
        color: 0x2196F3,
      },
      {
        id: 'achievement-level-25',
        name: 'Expert',
        description: 'Reach level 25',
        type: 'skill',
        rarity: 'rare',
        target: 25,
        points: 50,
        rewards: [{ type: 'xp', amount: 200 }, { type: 'avatar', avatarPartId: 'legendary_helmet' }],
        icon: '🎯',
        color: 0x9C27B0,
      },
      {
        id: 'achievement-level-50',
        name: 'Master',
        description: 'Reach level 50',
        type: 'skill',
        rarity: 'legendary',
        target: 50,
        points: 200,
        rewards: [{ type: 'xp', amount: 1000 }, { type: 'title', titleId: 'master' }],
        icon: '🌟',
        color: 0xFFD700,
      },
      
      // Social
      {
        id: 'achievement-first-friend',
        name: 'Social',
        description: 'Make your first friend',
        type: 'social',
        rarity: 'common',
        target: 1,
        points: 10,
        rewards: [{ type: 'xp', amount: 50 }],
        icon: '👥',
        color: 0xE91E63,
      },
      {
        id: 'achievement-popular',
        name: 'Popular',
        description: 'Make 20 friends',
        type: 'social',
        rarity: 'uncommon',
        target: 20,
        points: 25,
        rewards: [{ type: 'xp', amount: 100 }],
        icon: '👨‍👩‍👧‍👦',
        color: 0xE91E63,
      },
      {
        id: 'achievement-influencer',
        name: 'Influencer',
        description: 'Make 100 friends',
        type: 'social',
        rarity: 'rare',
        target: 100,
        points: 50,
        rewards: [{ type: 'xp', amount: 200 }, { type: 'title', titleId: 'socialite' }],
        icon: '🌐',
        color: 0xE91E63,
      },
    ];

    defaultAchievements.forEach(achievement => this.achievements.set(achievement.id, achievement));
  }

  // Initialize default categories
  private initializeDefaultCategories(): void {
    const defaultCategories: AchievementCategory[] = [
      {
        id: 'exploration',
        name: 'Exploration',
        description: 'Discover new places and worlds',
        icon: '🗺️',
        color: 0x2196F3,
        achievements: ['achievement-first-steps', 'achievement-explorer', 'achievement-world-traveler', 'achievement-discoverer'],
      },
      {
        id: 'combat',
        name: 'Combat',
        description: 'Defeat enemies and prove your strength',
        icon: '⚔️',
        color: 0xF44336,
        achievements: ['achievement-first-blood', 'achievement-warrior', 'achievement-slayer', 'achievement-champion'],
      },
      {
        id: 'building',
        name: 'Building',
        description: 'Construct and manage structures',
        icon: '🏗️',
        color: 0xFF9800,
        achievements: ['achievement-first-building', 'achievement-architect', 'achievement-master-builder', 'achievement-creator'],
      },
      {
        id: 'economy',
        name: 'Economy',
        description: 'Trade and accumulate wealth',
        icon: '💰',
        color: 0xFFD700,
        achievements: ['achievement-first-trade', 'achievement-merchant', 'achievement-tycoon', 'achievement-rich'],
      },
      {
        id: 'collection',
        name: 'Collection',
        description: 'Gather items and resources',
        icon: '🎒',
        color: 0x9C27B0,
        achievements: ['achievement-collector', 'achievement-hoarder'],
      },
      {
        id: 'skill',
        name: 'Skill',
        description: 'Improve your abilities',
        icon: '📈',
        color: 0x2196F3,
        achievements: ['achievement-level-10', 'achievement-level-25', 'achievement-level-50'],
      },
      {
        id: 'social',
        name: 'Social',
        description: 'Interact with other players',
        icon: '👥',
        color: 0xE91E63,
        achievements: ['achievement-first-friend', 'achievement-popular', 'achievement-influencer'],
      },
    ];

    defaultCategories.forEach(category => this.categories.set(category.id, category));
  }

  // Progress an achievement
  progressAchievement(userId: string, achievementId: string, amount: number = 1): AchievementState | null {
    const config = this.achievements.get(achievementId);
    if (!config) return null;

    const userAchievementsMap = this.userAchievements.get(userId) || new Map();
    let state = userAchievementsMap.get(achievementId);

    if (!state) {
      state = {
        ...config,
        status: 'locked',
        userId,
        progress: 0,
        lastUpdate: new Date().toISOString(),
      };
      userAchievementsMap.set(achievementId, state);
      this.userAchievements.set(userId, userAchievementsMap);
    }

    if (state.status === 'unlocked') return state;

    const requiredLevel = config.requiredLevel || 1;
    const balance = xpSystem.getBalance(userId);
    const userLevel = balance?.level || 1;

    if (userLevel < requiredLevel) return null;

    if (config.requiredAchievements && config.requiredAchievements.length > 0) {
      const allUnlocked = config.requiredAchievements.every(reqId => {
        const reqAchievement = userAchievementsMap.get(reqId);
        return reqAchievement?.status === 'unlocked';
      });
      if (!allUnlocked) return null;
    }

    if (config.requiredMissions && config.requiredMissions.length > 0) {
      const allCompleted = config.requiredMissions.every(reqId => {
        const mission = missionTracker.getUserMissions(userId).find(m => m.id === reqId);
        return mission?.status === 'completed';
      });
      if (!allCompleted) return null;
    }

    state.current = (state.current || 0) + amount;
    state.progress = Math.min(100, Math.round((state.current / config.target) * 100));
    state.lastUpdate = new Date().toISOString();

    if (state.current >= config.target) {
      state.status = 'unlocked';
      state.unlockedAt = new Date().toISOString();
      this.awardAchievementRewards(userId, config.rewards, achievementId);
      this.emitEvent({ type: 'achievement_unlocked', achievementId, userId });
    } else {
      state.status = 'progress';
    }

    return state;
  }

  // Award achievement rewards
  private awardAchievementRewards(userId: string, rewards: AchievementReward[], achievementId: string): void {
    rewards.forEach(reward => {
      switch (reward.type) {
        case 'xp':
          if (reward.amount) {
            xpSystem.awardXP(userId, 'achievement', { achievementId, reward: reward.amount });
          }
          break;
        case 'item':
          if (reward.itemId) {
            this.awardItem(userId, reward.itemId, reward.amount || 1);
          }
          break;
        case 'currency':
          if (reward.amount) {
            this.awardCurrency(userId, reward.amount);
          }
          break;
        case 'title':
          if (reward.titleId) {
            this.unlockTitle(userId, reward.titleId);
          }
          break;
        case 'avatar':
          if (reward.avatarPartId) {
            this.unlockAvatarPart(userId, reward.avatarPartId);
          }
          break;
        case 'building':
          if (reward.buildingId) {
            this.unlockBuilding(userId, reward.buildingId);
          }
          break;
        case 'feature':
          if (reward.featureId) {
            this.unlockFeature(userId, reward.featureId);
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

  // Unlock a title
  private unlockTitle(userId: string, titleId: string): void {
    console.log('Unlocked title:', titleId, 'for user:', userId);
  }

  // Unlock an avatar part
  private unlockAvatarPart(userId: string, partId: string): void {
    console.log('Unlocked avatar part:', partId, 'for user:', userId);
  }

  // Unlock a building
  private unlockBuilding(userId: string, buildingId: string): void {
    console.log('Unlocked building:', buildingId, 'for user:', userId);
  }

  // Unlock a feature
  private unlockFeature(userId: string, featureId: string): void {
    console.log('Unlocked feature:', featureId, 'for user:', userId);
  }

  // Get user achievements
  getUserAchievements(userId: string): AchievementState[] {
    return Array.from(this.userAchievements.get(userId)?.values() || []);
  }

  // Get unlocked achievements for user
  getUnlockedAchievements(userId: string): AchievementState[] {
    return this.getUserAchievements(userId).filter(a => a.status === 'unlocked');
  }

  // Get achievements in progress for user
  getAchievementsInProgress(userId: string): AchievementState[] {
    return this.getUserAchievements(userId).filter(a => a.status === 'progress');
  }

  // Get locked achievements for user
  getLockedAchievements(userId: string): AchievementConfig[] {
    const userAchievements = this.getUserAchievements(userId);
    const balance = xpSystem.getBalance(userId);
    const userLevel = balance?.level || 1;

    return Array.from(this.achievements.values()).filter(achievement => {
      const hasState = userAchievements.some(a => a.id === achievement.id);
      if (hasState) return false;

      if (achievement.requiredLevel && achievement.requiredLevel > userLevel) return false;

      if (achievement.requiredAchievements && achievement.requiredAchievements.length > 0) {
        const allUnlocked = achievement.requiredAchievements.every(reqId => {
          return userAchievements.some(a => a.id === reqId && a.status === 'unlocked');
        });
        if (!allUnlocked) return false;
      }

      if (achievement.requiredMissions && achievement.requiredMissions.length > 0) {
        const allCompleted = achievement.requiredMissions.every(reqId => {
          const mission = missionTracker.getUserMissions(userId).find(m => m.id === reqId);
          return mission?.status === 'completed';
        });
        if (!allCompleted) return false;
      }

      return !achievement.hidden;
    });
  }

  // Get total achievement points for user
  getTotalPoints(userId: string): number {
    return this.getUnlockedAchievements(userId).reduce((sum, a) => sum + (a.points || 0), 0);
  }

  // Get user title based on points
  getUserTitle(userId: string): string {
    const points = this.getTotalPoints(userId);
    
    for (const [id, threshold] of Object.entries(TITLE_THRESHOLDS)) {
      if (points >= threshold.threshold) {
        return threshold.name;
      }
    }
    
    return 'Novice';
  }

  // Get achievement config
  getAchievementConfig(achievementId: string): AchievementConfig | undefined {
    return this.achievements.get(achievementId);
  }

  // Get all achievement configs
  getAllAchievementConfigs(): AchievementConfig[] {
    return Array.from(this.achievements.values());
  }

  // Get achievements by category
  getAchievementsByCategory(categoryId: string): AchievementConfig[] {
    const category = this.categories.get(categoryId);
    if (!category) return [];
    return category.achievements.map(id => this.achievements.get(id)).filter(Boolean) as AchievementConfig[];
  }

  // Get all categories
  getAllCategories(): AchievementCategory[] {
    return Array.from(this.categories.values());
  }

  // Get category by ID
  getCategory(categoryId: string): AchievementCategory | undefined {
    return this.categories.get(categoryId);
  }

  // Register custom achievement
  registerAchievement(config: AchievementConfig): void {
    this.achievements.set(config.id, config);
  }

  // Register custom category
  registerCategory(category: AchievementCategory): void {
    this.categories.set(category.id, category);
  }

  // Achievement events
  onEvent(handler: (event: AchievementEvent) => void): () => void {
    this.eventHandlers.push(handler);
    return () => {
      const index = this.eventHandlers.indexOf(handler);
      if (index > -1) this.eventHandlers.splice(index, 1);
    };
  }

  private emitEvent(event: AchievementEvent): void {
    this.eventHandlers.forEach(handler => {
      try {
        handler(event);
      } catch (e) {
        console.error('Achievement event handler error:', e);
      }
    });
  }

  // Generate unique ID
  private generateId(prefix: string): string {
    return prefix + '-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
  }

  // Cleanup
  destroy(): void {
    this.achievements.clear();
    this.userAchievements.clear();
    this.categories.clear();
    this.eventHandlers.length = 0;
  }
}

export const achievementTracker = new AchievementTracker();

// Achievement event types
export type AchievementEvent = 
  | { type: 'achievement_unlocked'; achievementId: string; userId: string }
  | { type: 'achievement_progress'; achievementId: string; userId: string; progress: number };

// React hook for achievements
export function useAchievements(userId: string) {
  const [achievements, setAchievements] = useState<AchievementState[]>([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [userTitle, setUserTitle] = useState('');

  useEffect(() => {
    const updateAchievements = () => {
      setAchievements(achievementTracker.getUserAchievements(userId));
      setTotalPoints(achievementTracker.getTotalPoints(userId));
      setUserTitle(achievementTracker.getUserTitle(userId));
    };

    updateAchievements();

    const unsubscribe = achievementTracker.onEvent(() => updateAchievements());
    const interval = setInterval(updateAchievements, 5000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, [userId]);

  const progressAchievement = useCallback((achievementId: string, amount: number = 1) => {
    return achievementTracker.progressAchievement(userId, achievementId, amount);
  }, [userId]);

  return { achievements, totalPoints, userTitle, progressAchievement };
}