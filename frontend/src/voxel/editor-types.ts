/**
 * Voxel World Editor Types for THEHIVE
 * Minecraft-style building tools
 */

import { VoxelType, Voxel, Position3D } from './types';

// Editor modes
export type EditorMode = 'build' | 'delete' | 'select' | 'paint' | 'copy' | 'paste';

// Editor tool types
export type EditorTool = 'brush' | 'fill' | 'line' | 'circle' | 'rectangle' | 'extrude';

// Editor state
export interface EditorState {
  mode: EditorMode;
  tool: EditorTool;
  selectedVoxelType: VoxelType;
  brushSize: number;
  color: number;
  isActive: boolean;
  showGrid: boolean;
  snapToGrid: boolean;
  gridSize: number;
}

// Building session
export interface BuildingSession {
  id: string;
  worldId: string;
  startedAt: string;
  lastActionAt: string;
  changes: VoxelChange[];
  undoStack: VoxelChange[][];
  redoStack: VoxelChange[][];
}

// Voxel change (for undo/redo)
export interface VoxelChange {
  type: 'add' | 'remove' | 'modify';
  position: Position3D;
  previous?: Voxel;
  current?: Voxel;
  timestamp: string;
}

// Editor preferences
export interface EditorPreferences {
  defaultTool: EditorTool;
  defaultMode: EditorMode;
  defaultVoxelType: VoxelType;
  defaultColor: number;
  brushSizes: number[];
  favoriteTypes: VoxelType[];
  showTooltips: boolean;
}

// Build action
export interface BuildAction {
  type: 'place' | 'remove' | 'modify';
  position: Position3D;
  voxelType: VoxelType;
  color: number;
  size?: number;
}

// Editor hotkeys
export interface EditorHotkeys {
  build: string;
  delete: string;
  select: string;
  undo: string;
  redo: string;
  save: string;
  load: string;
  toggleGrid: string;
  increaseBrush: string;
  decreaseBrush: string;
}

// Default hotkeys
export const DEFAULT_HOTKEYS: EditorHotkeys = {
  build: 'b',
  delete: 'd',
  select: 's',
  undo: 'Ctrl+z',
  redo: 'Ctrl+y',
  save: 'Ctrl+s',
  load: 'Ctrl+l',
  toggleGrid: 'g',
  increaseBrush: '[',
  decreaseBrush: ']',
};

// Editor UI state
export interface EditorUIState {
  showToolbar: boolean;
  showPalette: boolean;
  showHistory: boolean;
  showSettings: boolean;
  focusedTool: EditorTool | null;
}

// Voxel palette
export interface VoxelPalette {
  id: string;
  name: string;
  types: VoxelType[];
  colors: Record<VoxelType, number[]>;
}

// Predefined palettes
export const PALETTES: Record<string, VoxelPalette> = {
  wow: {
    id: 'wow',
    name: 'World of Warcraft',
    types: ['ground', 'stone', 'wood', 'metal', 'glass', 'grass', 'sand'],
    colors: {
      ground: [0x8B4513, 0x654321, 0xA0522D],
      stone: [0x696969, 0x808080, 0xA9A9A9],
      wood: [0x8B4513, 0xA0522D, 0xCD853F],
      metal: [0xC0C0C0, 0xA9A9A9, 0x808080],
      glass: [0x87CEEB, 0xADD8E6, 0xB0E0E6],
      grass: [0x228B22, 0x2E8B57, 0x3CB371],
      sand: [0xF4A460, 0xD2B48C, 0xDEB887],
    },
  },
  elderScrolls: {
    id: 'elderScrolls',
    name: 'Elder Scrolls',
    types: ['ground', 'stone', 'wood', 'metal', 'glass', 'grass', 'sand'],
    colors: {
      ground: [0x556B2F, 0x6B8E23, 0x8FBC8F],
      stone: [0x808080, 0x696969, 0xA9A9A9],
      wood: [0x8B4513, 0xA0522D, 0xD2691E],
      metal: [0xA9A9A9, 0x808080, 0xC0C0C0],
      glass: [0xADD8E6, 0x87CEEB, 0xB0E0E6],
      grass: [0x2E8B57, 0x228B22, 0x3CB371],
      sand: [0xD2B48C, 0xF4A460, 0xDEB887],
    },
  },
  noMansSky: {
    id: 'noMansSky',
    name: "No Man's Sky",
    types: ['ground', 'stone', 'wood', 'metal', 'glass', 'grass', 'sand'],
    colors: {
      ground: [0x32CD32, 0x9ACD32, 0x90EE90],
      stone: [0x708090, 0x696969, 0x808080],
      wood: [0x8B4513, 0xA0522D, 0xCD853F],
      metal: [0xB0C4DE, 0xC0C0C0, 0xE0E0E0],
      glass: [0x98FB98, 0x90EE90, 0xADFF2F],
      grass: [0x9ACD32, 0x32CD32, 0x7CFC00],
      sand: [0xF5DEB3, 0xD2B48C, 0xF4A460],
    },
  },
};

// Editor events
export type EditorEvent = 
  | { type: 'mode_changed'; mode: EditorMode }
  | { type: 'tool_changed'; tool: EditorTool }
  | { type: 'voxel_placed'; position: Position3D; voxel: Voxel }
  | { type: 'voxel_removed'; position: Position3D }
  | { type: 'selection_changed'; positions: Position3D[] }
  | { type: 'undo'; changes: VoxelChange[] }
  | { type: 'redo'; changes: VoxelChange[] }
  | { type: 'save' }
  | { type: 'load' };

export type EditorEventHandler = (event: EditorEvent) => void;