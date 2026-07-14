/**
 * World Editor Manager
 */
import { VoxelWorld } from './types';
export class WorldEditorManager {
  private world: VoxelWorld | null = null;
  initialize(world: VoxelWorld): void { this.world = world; }
}
export const worldEditorManager = new WorldEditorManager();