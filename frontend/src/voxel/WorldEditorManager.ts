/**
 * World Editor Manager for THEHIVE
 */
import { Voxel, VoxelType, VoxelWorld, Chunk, Position3D } from './types';
import { EditorState, EditorMode, EditorTool, BuildingSession, VoxelChange, EditorEvent, EditorEventHandler } from './editor-types';

const sessions: Map<string, BuildingSession> = new Map();
const eventHandlers: EditorEventHandler[] = [];

export class WorldEditorManager {
  private state: EditorState = {
    mode: 'build',
    tool: 'brush',
    selectedVoxelType: 'stone',
    brushSize: 1,
    color: 0xFFFFFF,
    isActive: false,
    showGrid: true,
    snapToGrid: true,
    gridSize: 1,
  };

  private world: VoxelWorld | null = null;
  private selectedPositions: Position3D[] = [];
  private clipboard: Voxel[] = [];

  initialize(world: VoxelWorld): void {
    this.world = world;
    this.state.isActive = true;
  }

  deactivate(): void {
    this.state.isActive = false;
    this.world = null;
    this.selectedPositions = [];
    this.clipboard = [];
  }

  getState(): EditorState {
    return { ...this.state };
  }

  setMode(mode: EditorMode): void {
    this.state.mode = mode;
  }

  setTool(tool: EditorTool): void {
    this.state.tool = tool;
  }

  setVoxelType(type: VoxelType): void {
    this.state.selectedVoxelType = type;
  }

  setBrushSize(size: number): void {
    this.state.brushSize = Math.max(1, Math.min(10, size));
  }

  setColor(color: number): void {
    this.state.color = color;
  }

  toggleGrid(): void {
    this.state.showGrid = !this.state.showGrid;
  }

  toggleSnapToGrid(): void {
    this.state.snapToGrid = !this.state.snapToGrid;
  }

  setGridSize(size: number): void {
    this.state.gridSize = Math.max(0.5, size);
  }

  getAvailableTypes(): VoxelType[] {
    return ['ground', 'stone', 'wood', 'metal', 'glass', 'water', 'lava', 'grass', 'sand', 'ice', 'colony_core', 'memory_node', 'workflow_path', 'agent_spawn', 'portal'];
  }

  placeVoxel(position: Position3D, type: VoxelType = this.state.selectedVoxelType, color: number = this.state.color): Voxel | null {
    if (!this.world) return null;
    const snappedPosition = this.snapPosition(position);
    const chunk = this.getOrCreateChunk(snappedPosition);
    const voxel: Voxel = {
      id: this.generateId('voxel'),
      type,
      position: snappedPosition,
      color,
      material: this.getMaterialForType(type),
      lodLevel: 0,
    };
    chunk.voxels.push(voxel);
    this.world.chunks.set(chunk.id, chunk);
    return voxel;
  }

  removeVoxel(position: Position3D): boolean {
    if (!this.world) return false;
    const snappedPosition = this.snapPosition(position);
    const chunk = this.getChunkAt(snappedPosition);
    if (!chunk) return false;
    const index = chunk.voxels.findIndex(v => 
      v.position.x === snappedPosition.x &&
      v.position.y === snappedPosition.y &&
      v.position.z === snappedPosition.z
    );
    if (index === -1) return false;
    chunk.voxels.splice(index, 1);
    this.world.chunks.set(chunk.id, chunk);
    return true;
  }

  selectVoxel(position: Position3D, multiSelect: boolean = false): void {
    const snapped = this.snapPosition(position);
    const voxel = this.getVoxelAt(snapped);
    if (!voxel) {
      if (!multiSelect) this.selectedPositions = [];
      return;
    }
    const key = this.positionToKey(snapped);
    const index = this.selectedPositions.findIndex(p => this.positionToKey(p) === key);
    if (multiSelect) {
      if (index === -1) {
        this.selectedPositions.push(snapped);
      } else {
        this.selectedPositions.splice(index, 1);
      }
    } else {
      this.selectedPositions = [snapped];
    }
  }

  clearSelection(): void {
    this.selectedPositions = [];
  }

  getSelectedPositions(): Position3D[] {
    return [...this.selectedPositions];
  }

  copySelection(): void {
    if (!this.world) return;
    this.clipboard = [];
    this.selectedPositions.forEach(pos => {
      const voxel = this.getVoxelAt(pos);
      if (voxel) this.clipboard.push({ ...voxel });
    });
  }

  pasteAt(position: Position3D): Voxel[] {
    if (!this.world || this.clipboard.length === 0) return [];
    const snapped = this.snapPosition(position);
    const pasted: Voxel[] = [];
    this.clipboard.forEach((voxel, index) => {
      const offsetX = index % 3 - 1;
      const offsetZ = Math.floor(index / 3) - 1;
      const newPosition = { x: snapped.x + offsetX, y: snapped.y, z: snapped.z + offsetZ };
      const newVoxel = this.placeVoxel(newPosition, voxel.type, voxel.color);
      if (newVoxel) pasted.push(newVoxel);
    });
    return pasted;
  }

  undo(): void {
    const session = this.getCurrentSession();
    if (!session || session.undoStack.length === 0) return;
    const changes = session.undoStack.pop()!;
    session.redoStack.push(changes);
    changes.forEach(change => {
      if (change.type === 'add') {
        this.removeVoxel(change.position);
      }
    });
  }

  redo(): void {
    const session = this.getCurrentSession();
    if (!session || session.redoStack.length === 0) return;
    const changes = session.redoStack.pop()!;
    session.undoStack.push(changes);
    changes.forEach(change => {
      if (change.type === 'add' && change.current) {
        this.placeVoxel(change.position, change.current.type, change.current.color);
      }
    });
  }

  getVoxelAt(position: Position3D): Voxel | undefined {
    if (!this.world) return undefined;
    const snapped = this.snapPosition(position);
    const chunk = this.getChunkAt(snapped);
    if (!chunk) return undefined;
    return chunk.voxels.find(v => 
      v.position.x === snapped.x &&
      v.position.y === snapped.y &&
      v.position.z === snapped.z
    );
  }

  hasVoxelAt(position: Position3D): boolean {
    return this.getVoxelAt(position) !== undefined;
  }

  getWorld(): VoxelWorld | null {
    return this.world;
  }

  onEvent(handler: EditorEventHandler): () => void {
    eventHandlers.push(handler);
    return () => {
      const index = eventHandlers.indexOf(handler);
      if (index > -1) eventHandlers.splice(index, 1);
    };
  }

  private getOrCreateChunk(position: Position3D): Chunk {
    if (!this.world) throw new Error('No world initialized');
    const chunkX = Math.floor(position.x / 16);
    const chunkY = Math.floor(position.y / 16);
    const chunkZ = Math.floor(position.z / 16);
    const chunkId = chunkX + ',' + chunkY + ',' + chunkZ;
    let chunk = this.world.chunks.get(chunkId);
    if (!chunk) {
      chunk = {
        id: chunkId,
        position: { x: chunkX * 16, y: chunkY * 16, z: chunkZ * 16 },
        voxels: [],
        isLoaded: true,
        isRendering: false,
      };
      this.world.chunks.set(chunkId, chunk);
    }
    return chunk;
  }

  private getChunkAt(position: Position3D): Chunk | undefined {
    if (!this.world) return undefined;
    const chunkX = Math.floor(position.x / 16);
    const chunkY = Math.floor(position.y / 16);
    const chunkZ = Math.floor(position.z / 16);
    const chunkId = chunkX + ',' + chunkY + ',' + chunkZ;
    return this.world.chunks.get(chunkId);
  }

  private snapPosition(position: Position3D): Position3D {
    if (!this.state.snapToGrid) return position;
    return {
      x: Math.round(position.x / this.state.gridSize) * this.state.gridSize,
      y: Math.round(position.y / this.state.gridSize) * this.state.gridSize,
      z: Math.round(position.z / this.state.gridSize) * this.state.gridSize,
    };
  }

  private getMaterialForType(type: VoxelType): string {
    const materials: Record<VoxelType, string> = {
      air: 'air', ground: 'dirt', stone: 'stone', wood: 'wood',
      metal: 'metal', glass: 'glass', water: 'liquid', lava: 'liquid',
      grass: 'grass', sand: 'sand', ice: 'ice',
      colony_core: 'special', memory_node: 'special', workflow_path: 'special',
      agent_spawn: 'special', portal: 'special',
    };
    return materials[type] || 'default';
  }

  private getCurrentSession(): BuildingSession | undefined {
    if (!this.world) return undefined;
    let session = sessions.get(this.world.id);
    if (!session) {
      session = {
        id: this.generateId('session'),
        worldId: this.world.id,
        startedAt: new Date().toISOString(),
        lastActionAt: new Date().toISOString(),
        changes: [],
        undoStack: [],
        redoStack: [],
      };
      sessions.set(this.world.id, session);
    }
    return session;
  }

  private generateId(prefix: string): string {
    return prefix + '-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
  }

  private positionToKey(position: Position3D): string {
    return position.x + ',' + position.y + ',' + position.z;
  }
}

export const worldEditorManager = new WorldEditorManager();