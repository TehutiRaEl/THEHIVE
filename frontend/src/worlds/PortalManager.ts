/**
 * Portal System for THEHIVE
 * Enables travel between THE HIVE world and sandbox worlds
 */

import { useState, useCallback } from 'react';
import { Position3D, WorldEntity, EntityType } from './types';
import { worldManager } from './WorldManager';

// Portal types
export type PortalType = 'hive' | 'sandbox' | 'colony' | 'memory' | 'workflow' | 'custom';

// Portal appearance
export interface PortalAppearance {
  model: string;
  color: number;
  size: { width: number; height: number; depth: number };
  glow: number;
  particleEffect?: string;
  sound?: string;
  animation?: string;
}

// Portal configuration
export interface PortalConfig {
  id: string;
  name: string;
  description: string;
  type: PortalType;
  
  // Visual
  appearance: PortalAppearance;
  
  // Connections
  sourceWorldId: string;
  sourcePosition: Position3D;
  targetWorldId: string;
  targetPosition: Position3D;
  
  // Access control
  isPublic: boolean;
  allowedUsers: string[];
  requiredLevel?: number;
  requiredItems?: string[];
  requiredXP?: number;
  entryFee?: number;
  
  // State
  isActive: boolean;
  isLocked: boolean;
  cooldown?: number; // In milliseconds
  lastUsed?: string;
  
  // Effects
  teleportEffect?: string;
  arrivalEffect?: string;
  
  // Metadata
  createdAt: string;
  createdBy: string;
}

// Portal state (runtime)
export interface PortalState extends PortalConfig {
  currentUsers: string[];
  usageCount: number;
  lastActivation: string;
}

// Portal event types
export type PortalEvent = 
  | { type: 'portal_created'; portal: PortalConfig }
  | { type: 'portal_destroyed'; portalId: string }
  | { type: 'portal_activated'; portalId: string; userId: string }
  | { type: 'portal_used'; portalId: string; userId: string; fromWorld: string; toWorld: string }
  | { type: 'portal_locked'; portalId: string }
  | { type: 'portal_unlocked'; portalId: string };

export type PortalEventHandler = (event: PortalEvent) => void;

// Portal manager configuration
export interface PortalManagerConfig {
  maxPortalsPerWorld: number;
  defaultCooldown: number;
  maxUsersPerPortal: number;
  allowCustomPortals: boolean;
}

const DEFAULT_CONFIG: PortalManagerConfig = {
  maxPortalsPerWorld: 20,
  defaultCooldown: 5000,
  maxUsersPerPortal: 5,
  allowCustomPortals: true,
};

// Active portals by world
export class PortalManager {
  private portals: Map<string, Map<string, PortalState>> = new Map();
  private config: PortalManagerConfig = DEFAULT_CONFIG;
  private eventHandlers: PortalEventHandler[] = [];

  constructor(config: Partial<PortalManagerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.initializeDefaultPortals();
  }

  // Initialize default portals
  private initializeDefaultPortals(): void {
    const hiveWorld = worldManager.getHiveWorld();
    if (!hiveWorld) return;

    const defaultPortals: PortalConfig[] = [
      {
        id: 'portal-hive-main',
        name: 'THE HIVE Gateway',
        description: 'Main entrance to THE HIVE core',
        type: 'hive',
        appearance: {
          model: 'arch',
          color: 0xFFD700,
          size: { width: 4, height: 6, depth: 1 },
          glow: 0.8,
          particleEffect: 'hive_particles',
          sound: 'hive_hum',
        },
        sourceWorldId: 'the-hive',
        sourcePosition: { x: 0, y: 0, z: 0 },
        targetWorldId: 'sandbox-main',
        targetPosition: { x: 0, y: 0, z: 0 },
        isPublic: false,
        allowedUsers: [],
        requiredLevel: 1,
        isActive: true,
        isLocked: true,
        createdAt: new Date().toISOString(),
        createdBy: 'system',
      },
      {
        id: 'portal-sandbox-main',
        name: 'Sandbox Gateway',
        description: 'Return to your sandbox world',
        type: 'sandbox',
        appearance: {
          model: 'gate',
          color: 0x4CAF50,
          size: { width: 3, height: 5, depth: 0.5 },
          glow: 0.6,
          particleEffect: 'sandbox_particles',
          sound: 'portal_open',
        },
        sourceWorldId: 'sandbox-main',
        sourcePosition: { x: 0, y: 0, z: 0 },
        targetWorldId: 'the-hive',
        targetPosition: { x: 0, y: 0, z: 0 },
        isPublic: true,
        allowedUsers: [],
        isActive: true,
        isLocked: false,
        createdAt: new Date().toISOString(),
        createdBy: 'system',
      },
    ];

    defaultPortals.forEach(portal => this.createPortal(portal));
  }

  // Create a new portal
  createPortal(config: PortalConfig): PortalState {
    const worldPortals = this.portals.get(config.sourceWorldId) || new Map();

    if (worldPortals.size >= this.config.maxPortalsPerWorld) {
      throw new Error('Maximum portals per world reached');
    }

    if (worldPortals.has(config.id)) {
      throw new Error('Portal with this ID already exists');
    }

    const state: PortalState = {
      ...config,
      currentUsers: [],
      usageCount: 0,
      lastActivation: '',
    };

    worldPortals.set(config.id, state);
    this.portals.set(config.sourceWorldId, worldPortals);

    this.emitEvent({ type: 'portal_created', portal: config });
    return state;
  }

  // Destroy a portal
  destroyPortal(portalId: string, worldId: string): boolean {
    const worldPortals = this.portals.get(worldId);
    if (!worldPortals) return false;

    const portal = worldPortals.get(portalId);
    if (!portal) return false;

    worldPortals.delete(portalId);
    this.emitEvent({ type: 'portal_destroyed', portalId });
    return true;
  }

  // Get portal by ID
  getPortal(portalId: string, worldId: string): PortalState | undefined {
    return this.portals.get(worldId)?.get(portalId);
  }

  // Get all portals in a world
  getPortalsInWorld(worldId: string): PortalState[] {
    return Array.from(this.portals.get(worldId)?.values() || []);
  }

  // Get all portals
  getAllPortals(): PortalState[] {
    const all: PortalState[] = [];
    for (const worldPortals of this.portals.values()) {
      all.push(...worldPortals.values());
    }
    return all;
  }

  // Teleport through a portal
  teleportThrough(portalId: string, worldId: string, userId: string): boolean {
    const portal = this.getPortal(portalId, worldId);
    if (!portal || !portal.isActive || portal.isLocked) return false;

    if (portal.allowedUsers.length > 0 && !portal.allowedUsers.includes(userId)) {
      return false;
    }

    if (portal.cooldown && portal.lastUsed) {
      const lastUsed = new Date(portal.lastUsed).getTime();
      const now = Date.now();
      if (now - lastUsed < portal.cooldown) {
        return false;
      }
    }

    const success = worldManager.teleportToSandbox(
      userId,
      portal.targetWorldId,
      portal.targetPosition
    );

    if (success) {
      portal.usageCount++;
      portal.lastUsed = new Date().toISOString();
      portal.lastActivation = new Date().toISOString();

      if (!portal.currentUsers.includes(userId)) {
        portal.currentUsers.push(userId);
      }

      this.emitEvent({
        type: 'portal_used',
        portalId: portal.id,
        userId,
        fromWorld: worldId,
        toWorld: portal.targetWorldId,
      });

      return true;
    }

    return false;
  }

  // Teleport from sandbox to HIVE
  teleportToHive(userId: string, position: Position3D): boolean {
    return worldManager.teleportToHive(userId, position);
  }

  // Activate a portal
  activatePortal(portalId: string, worldId: string): boolean {
    const portal = this.getPortal(portalId, worldId);
    if (!portal) return false;

    portal.isActive = true;
    portal.lastActivation = new Date().toISOString();
    this.emitEvent({ type: 'portal_activated', portalId, userId: '' });
    return true;
  }

  // Deactivate a portal
  deactivatePortal(portalId: string, worldId: string): boolean {
    const portal = this.getPortal(portalId, worldId);
    if (!portal) return false;

    portal.isActive = false;
    return true;
  }

  // Lock a portal
  lockPortal(portalId: string, worldId: string): boolean {
    const portal = this.getPortal(portalId, worldId);
    if (!portal) return false;

    portal.isLocked = true;
    this.emitEvent({ type: 'portal_locked', portalId });
    return true;
  }

  // Unlock a portal
  unlockPortal(portalId: string, worldId: string): boolean {
    const portal = this.getPortal(portalId, worldId);
    if (!portal) return false;

    portal.isLocked = false;
    this.emitEvent({ type: 'portal_unlocked', portalId });
    return true;
  }

  // Check if user can use a portal
  canUsePortal(portalId: string, worldId: string, userId: string): boolean {
    const portal = this.getPortal(portalId, worldId);
    if (!portal) return false;

    if (!portal.isActive) return false;
    if (portal.isLocked) return false;

    if (portal.allowedUsers.length > 0 && !portal.allowedUsers.includes(userId)) {
      return false;
    }

    if (portal.requiredLevel && portal.requiredLevel > 1) return false;
    if (portal.requiredXP && portal.requiredXP > 0) return false;
    if (portal.entryFee && portal.entryFee > 0) return false;

    if (portal.cooldown && portal.lastUsed) {
      const lastUsed = new Date(portal.lastUsed).getTime();
      const now = Date.now();
      if (now - lastUsed < portal.cooldown) {
        return false;
      }
    }

    if (portal.currentUsers.length >= this.config.maxUsersPerPortal) {
      return false;
    }

    return true;
  }

  // Get portal to HIVE from a sandbox world
  getHivePortal(worldId: string): PortalState | undefined {
    const portals = this.getPortalsInWorld(worldId);
    return portals.find(p => p.type === 'hive' && p.targetWorldId === 'the-hive');
  }

  // Get portal to a sandbox from HIVE
  getSandboxPortal(sandboxId: string): PortalState | undefined {
    const portals = this.getPortalsInWorld('the-hive');
    return portals.find(p => p.type === 'sandbox' && p.targetWorldId === sandboxId);
  }

  // Create a colony portal
  createColonyPortal(colonyId: string, worldId: string, position: Position3D): PortalState {
    const config: PortalConfig = {
      id: 'portal-colony-' + colonyId,
      name: 'Colony Portal: ' + colonyId,
      description: 'Portal to colony ' + colonyId,
      type: 'colony',
      appearance: {
        model: 'arch',
        color: 0x9C27B0,
        size: { width: 3, height: 4, depth: 0.5 },
        glow: 0.5,
      },
      sourceWorldId: worldId,
      sourcePosition: position,
      targetWorldId: colonyId,
      targetPosition: { x: 0, y: 0, z: 0 },
      isPublic: false,
      allowedUsers: [],
      isActive: true,
      isLocked: false,
      createdAt: new Date().toISOString(),
      createdBy: 'system',
    };

    return this.createPortal(config);
  }

  // Create a memory portal
  createMemoryPortal(memoryId: string, worldId: string, position: Position3D): PortalState {
    const config: PortalConfig = {
      id: 'portal-memory-' + memoryId,
      name: 'Memory Portal: ' + memoryId,
      description: 'Portal to memory ' + memoryId,
      type: 'memory',
      appearance: {
        model: 'floating',
        color: 0x2196F3,
        size: { width: 2, height: 2, depth: 2 },
        glow: 0.7,
        particleEffect: 'memory_particles',
      },
      sourceWorldId: worldId,
      sourcePosition: position,
      targetWorldId: 'memory-' + memoryId,
      targetPosition: { x: 0, y: 0, z: 0 },
      isPublic: false,
      allowedUsers: [],
      requiredLevel: 5,
      isActive: true,
      isLocked: false,
      createdAt: new Date().toISOString(),
      createdBy: 'system',
    };

    return this.createPortal(config);
  }

  // Create a workflow portal
  createWorkflowPortal(workflowId: string, worldId: string, position: Position3D): PortalState {
    const config: PortalConfig = {
      id: 'portal-workflow-' + workflowId,
      name: 'Workflow Portal: ' + workflowId,
      description: 'Portal to workflow ' + workflowId,
      type: 'workflow',
      appearance: {
        model: 'vortex',
        color: 0xFF9800,
        size: { width: 1.5, height: 1.5, depth: 1.5 },
        glow: 0.9,
        particleEffect: 'workflow_particles',
        animation: 'spin',
      },
      sourceWorldId: worldId,
      sourcePosition: position,
      targetWorldId: 'workflow-' + workflowId,
      targetPosition: { x: 0, y: 0, z: 0 },
      isPublic: false,
      allowedUsers: [],
      isActive: true,
      isLocked: false,
      createdAt: new Date().toISOString(),
      createdBy: 'system',
    };

    return this.createPortal(config);
  }

  // Event system
  onEvent(handler: PortalEventHandler): () => void {
    this.eventHandlers.push(handler);
    return () => {
      const index = this.eventHandlers.indexOf(handler);
      if (index > -1) this.eventHandlers.splice(index, 1);
    };
  }

  private emitEvent(event: PortalEvent): void {
    this.eventHandlers.forEach(handler => {
      try {
        handler(event);
      } catch (e) {
        console.error('Portal event handler error:', e);
      }
    });
  }

  // Generate unique ID
  private generateId(prefix: string): string {
    return prefix + '-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
  }

  // Cleanup
  destroy(): void {
    this.portals.clear();
    this.eventHandlers.length = 0;
  }
}

export const portalManager = new PortalManager();

// React hook for portal interactions
export function usePortalInteractions() {
  const [activePortal, setActivePortal] = useState<string | null>(null);

  const teleport = useCallback((portalId: string, worldId: string, userId: string) => {
    return portalManager.teleportThrough(portalId, worldId, userId);
  }, []);

  const getPortal = useCallback((portalId: string, worldId: string) => {
    return portalManager.getPortal(portalId, worldId);
  }, []);

  const canUse = useCallback((portalId: string, worldId: string, userId: string) => {
    return portalManager.canUsePortal(portalId, worldId, userId);
  }, []);

  return { activePortal, teleport, getPortal, canUse };
}