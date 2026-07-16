// Avatar system types for THEHIVE

// Agent roles and their base models
export type AgentRole = 
  | 'commander'
  | 'scientist'
  | 'engineer'
  | 'soldier'
  | 'diplomat'
  | 'scout'
  | 'builder'
  | 'healer'
  | 'merchant'
  | 'scholar';

// Avatar body parts that can be customized and earned as NFTs
export type AvatarPartType = 
  | 'head'
  | 'torso'
  | 'arms'
  | 'legs'
  | 'wings'
  | 'tail'
  | 'horns'
  | 'eyes'
  | 'hair'
  | 'beard'
  | 'accessory';

export type AvatarPartRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export interface AvatarPart {
  id: string;
  name: string;
  type: AvatarPartType;
  modelUrl: string; // URL to 3D model
  textureUrl?: string;
  rarity: AvatarPartRarity;
  stats?: {
    strength?: number;
    intelligence?: number;
    charisma?: number;
    agility?: number;
    endurance?: number;
  };
  isNFT: boolean;
  nftContractAddress?: string;
  nftTokenId?: string;
  unlockableAtLevel?: number;
  price?: number; // Price in XP or real currency
}

export interface AvatarCustomization {
  [partType: string]: string; // partType -> partId
}

export interface AgentAvatar {
  id: string;
  agentId: string;
  role: AgentRole;
  name: string;
  level: number;
  xp: number;
  xpToNextLevel: number;
  
  // Visual appearance
  baseModel: string;
  customization: AvatarCustomization;
  colorScheme: {
    primary: number;
    secondary: number;
    accent: number;
  };
  
  // Colony affiliation
  colonyId: string;
  colonyTheme: string;
  
  // Position in world
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  
  // State
  status: 'idle' | 'walking' | 'running' | 'talking' | 'fighting' | 'casting';
  emotion: 'neutral' | 'happy' | 'angry' | 'sad' | 'surprised' | 'focused';
  
  // XP and growth
  totalXPEarned: number;
  achievements: string[];
  inventory: AvatarPart[];
  equippedParts: string[];
  
  // Metadata
  createdAt: string;
  lastActive: string;
  
  // NFT information
  nftAddress?: string;
  nftTokenId?: string;
}

// Colony visual themes
export interface ColonyTheme {
  id: string;
  name: string;
  primaryColor: number;
  secondaryColor: number;
  accentColor: number;
  architectureStyle: string;
  environment: string;
  skybox: string;
  ambientSound: string;
  
  // Visual modifiers for avatars in this colony
  avatarModifiers: {
    heightScale?: number;
    widthScale?: number;
    colorShift?: number;
    glowColor?: number;
  };
}

// Predefined colony themes
export const COLONY_THEMES: Record<string, ColonyTheme> = {
  alphaCentauri: {
    id: 'alpha-centauri',
    name: 'Alpha Centauri Prime',
    primaryColor: 0x9333EA,
    secondaryColor: 0xF59E0B,
    accentColor: 0x10B981,
    architectureStyle: 'futuristic',
    environment: 'city',
    skybox: 'space_station',
    ambientSound: 'tech_hum',
    avatarModifiers: {
      heightScale: 1.0,
      widthScale: 1.0,
      colorShift: 0x0000FF,
      glowColor: 0x9333EA
    }
  },
  eden7: {
    id: 'eden-7',
    name: 'Eden-7',
    primaryColor: 0x10B981,
    secondaryColor: 0x3B82F6,
    accentColor: 0xF59E0B,
    architectureStyle: 'organic',
    environment: 'forest',
    skybox: 'lush_forest',
    ambientSound: 'nature',
    avatarModifiers: {
      heightScale: 1.1,
      widthScale: 0.9,
      colorShift: 0x00FF00,
      glowColor: 0x10B981
    }
  },
  ironhold: {
    id: 'ironhold',
    name: 'Ironhold',
    primaryColor: 0x6B7280,
    secondaryColor: 0xEF4444,
    accentColor: 0xF59E0B,
    architectureStyle: 'fortress',
    environment: 'mountain',
    skybox: 'stormy_mountains',
    ambientSound: 'forging',
    avatarModifiers: {
      heightScale: 1.2,
      widthScale: 1.1,
      colorShift: 0x800000,
      glowColor: 0xEF4444
    }
  },
  frostfall: {
    id: 'frostfall',
    name: 'Frostfall',
    primaryColor: 0x06B6D4,
    secondaryColor: 0xFFFFFF,
    accentColor: 0x3B82F6,
    architectureStyle: 'ice',
    environment: 'arctic',
    skybox: 'frozen_wasteland',
    ambientSound: 'wind_howling',
    avatarModifiers: {
      heightScale: 1.0,
      widthScale: 1.0,
      colorShift: 0x00FFFF,
      glowColor: 0x06B6D4
    }
  },
  stellarForge: {
    id: 'stellar-forge',
    name: 'Stellar Forge',
    primaryColor: 0xF97316,
    secondaryColor: 0xF59E0B,
    accentColor: 0xEF4444,
    architectureStyle: 'industrial',
    environment: 'volcanic',
    skybox: 'lava_flows',
    ambientSound: 'machinery',
    avatarModifiers: {
      heightScale: 1.1,
      widthScale: 1.2,
      colorShift: 0xFF4500,
      glowColor: 0xF97316
    }
  }
};

// XP system types
export interface XPTransaction {
  id: string;
  agentId: string;
  amount: number;
  type: 'mission' | 'memory' | 'colony' | 'workflow' | 'achievement' | 'purchase' | 'trade';
  description: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface XPBalance {
  agentId: string;
  totalXP: number;
  availableXP: number;
  reservedXP: number; // For purchases, trades, etc.
  level: number;
  xpToNextLevel: number;
}

export type XPMultiplier = {
  type: string;
  value: number;
  duration?: number; // In seconds
  expiresAt?: string;
};

// Avatar animation states
export type AvatarAnimation = 
  | 'idle'
  | 'walk'
  | 'run'
  | 'attack'
  | 'cast'
  | 'hurt'
  | 'death'
  | 'dance'
  | 'cheer'
  | 'sit'
  | 'sleep';

export interface AvatarAnimationState {
  current: AvatarAnimation;
  previous: AvatarAnimation;
  transitionTime: number;
  speed: number;
}
