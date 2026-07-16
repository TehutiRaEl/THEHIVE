// Voxel type definitions for THEHIVE voxel world

export type VoxelType = 
  | 'air'
  | 'ground'
  | 'stone'
  | 'wood'
  | 'metal'
  | 'glass'
  | 'water'
  | 'lava'
  | 'grass'
  | 'sand'
  | 'ice'
  | 'colony_core'
  | 'memory_node'
  | 'workflow_path'
  | 'agent_spawn'
  | 'portal';

export interface Voxel {
  id: string;
  type: VoxelType;
  position: { x: number; y: number; z: number };
  color: number; // Hex color
  material: string;
  metadata?: Record<string, any>;
  lodLevel: number; // 0 = highest detail, 3 = lowest
}

export interface Chunk {
  id: string;
  position: { x: number; y: number; z: number };
  voxels: Voxel[];
  isLoaded: boolean;
  isRendering: boolean;
}

export interface VoxelWorld {
  id: string;
  name: string;
  seed: number;
  chunks: Map<string, Chunk>;
  activeChunks: Set<string>;
  renderDistance: number;
  lodDistances: { [level: number]: number };
}

// LOD Configuration
export const LOD_CONFIG = {
  LEVEL_0: { distance: 0, voxelSize: 1, detail: 'high' },
  LEVEL_1: { distance: 8, voxelSize: 1, detail: 'medium' },
  LEVEL_2: { distance: 16, voxelSize: 2, detail: 'low' },
  LEVEL_3: { distance: 32, voxelSize: 4, detail: 'minimal' },
};

// Voxel color palettes inspired by WoW, Elder Scrolls, No Man's Sky
export const VOXEL_PALETTES = {
  // World of Warcraft inspired
  wow: {
    ground: 0x8B4513,
    stone: 0x696969,
    wood: 0x8B4513,
    metal: 0xC0C0C0,
    glass: 0x87CEEB,
    water: 0x4169E1,
    grass: 0x228B22,
    sand: 0xF4A460,
  },
  // Elder Scrolls inspired
  elderScrolls: {
    ground: 0x556B2F,
    stone: 0x808080,
    wood: 0x8B4513,
    metal: 0xA9A9A9,
    glass: 0xADD8E6,
    water: 0x1E90FF,
    grass: 0x2E8B57,
    sand: 0xD2B48C,
  },
  // No Man's Sky inspired
  noMansSky: {
    ground: 0x32CD32,
    stone: 0x708090,
    wood: 0x8B4513,
    metal: 0xB0C4DE,
    glass: 0x98FB98,
    water: 0x4682B4,
    grass: 0x9ACD32,
    sand: 0xF5DEB3,
  },
};

// Colony-specific voxel types
export type ColonyVoxelType = 
  | 'colony_heart'
  | 'resource_node'
  | 'defense_tower'
  | 'residential'
  | 'commercial'
  | 'industrial'
  | 'agricultural';

export interface ColonyVoxel extends Voxel {
  colonyId: string;
  buildingType?: string;
  owner?: string;
  health: number;
  maxHealth: number;
}
