---
name: "thehive-gamified-ui"
title: "THEHIVE Gamified UI - Main App Integration"
type: "react"
---

import React, { useEffect, useState, useRef, useCallback, Suspense } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, PerspectiveCamera, Stats, Sky, Stars, Grid } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

type Vector3 = { x: number; y: number; z: number };
type Entity = {
  id: string;
  type: 'player' | 'npc' | 'portal' | 'colony' | 'voxel';
  position: Vector3;
  rotation?: Vector3;
  scale?: Vector3;
  data?: any;
};

type WorldType = 'hive' | 'sandbox';

type AvatarPart = {
  id: string;
  type: 'head' | 'body' | 'arms' | 'legs' | 'accessory';
  name: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  cost: number;
  modelUrl: string;
  thumbnailUrl: string;
};

type XPTransaction = {
  id: string;
  amount: number;
  type: 'earn' | 'spend' | 'reward';
  category: string;
  timestamp: number;
  description: string;
};

type Mission = {
  id: string;
  title: string;
  description: string;
  type: 'combat' | 'exploration' | 'crafting' | 'social' | 'story' | 'building' | 'discovery';
  objectives: MissionObjective[];
  rewards: MissionReward;
  difficulty: 'easy' | 'medium' | 'hard' | 'epic';
  duration: number;
  isActive: boolean;
  isCompleted: boolean;
  progress: number;
};

type MissionObjective = {
  id: string;
  description: string;
  type: 'collect' | 'kill' | 'visit' | 'build' | 'talk' | 'craft' | 'discover';
  target: string;
  required: number;
  completed: number;
};

type MissionReward = {
  xp: number;
  items?: string[];
  currency?: number;
  unlocks?: string[];
};

type Achievement = {
  id: string;
  title: string;
  description: string;
  type: 'exploration' | 'combat' | 'crafting' | 'social' | 'building' | 'collection' | 'special';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  points: number;
  isUnlocked: boolean;
  unlockDate?: number;
};

type NPC = {
  id: string;
  name: string;
  type: 'merchant' | 'quest' | 'guide' | 'guard' | 'friend';
  position: Vector3;
  dialogue: NPCDialogue[];
  quests?: string[];
  inventory?: NPCInventoryItem[];
  behavior: 'idle' | 'patrol' | 'follow' | 'chase' | 'flee';
  modelUrl: string;
};

type NPCDialogue = {
  id: string;
  text: string;
  responses?: { text: string; next: string; action?: string }[];
};

type NPCInventoryItem = {
  id: string;
  name: string;
  type: 'item' | 'part' | 'blueprint';
  cost: number;
  rarity: string;
};

type Portal = {
  id: string;
  name: string;
  position: Vector3;
  targetWorld: string;
  targetPosition: Vector3;
  accessLevel: number;
  isActive: boolean;
  modelUrl: string;
};

type ColonyBuilding = {
  id: string;
  type: 'house' | 'workshop' | 'farm' | 'mine' | 'tower' | 'wall';
  position: Vector3;
  rotation: Vector3;
  level: number;
  health: number;
  maxHealth: number;
  productionRate: number;
  productionType: string;
  isBuilding: boolean;
  buildProgress: number;
};

type Peer = {
  id: string;
  name: string;
  avatar: string;
  position: Vector3;
  rotation: Vector3;
  lastUpdate: number;
  isConnected: boolean;
};

type Voxel = {
  id: string;
  position: Vector3;
  type: string;
  color: string;
  material: string;
  isSelected: boolean;
};

type Conversation = {
  id: string;
  participants: string[];
  messages: ConversationMessage[];
  isActive: boolean;
};

type ConversationMessage = {
  id: string;
  sender: string;
  text: string;
  timestamp: number;
  type: 'text' | 'voice' | 'emote';
};

// ============================================================================
// MANAGER SINGLETONS
// ============================================================================

// WorldManager - Dual-world coordination
class WorldManager {
  private static instance: WorldManager;
  private currentWorld: WorldType = 'hive';
  private worlds: Map<string, Entity[]> = new Map();
  private activeWorlds: Set<string> = new Set();
  private playerPosition: Vector3 = { x: 0, y: 0, z: 0 };
  private playerEntity: Entity | null = null;

  private constructor() {}

  public static getInstance(): WorldManager {
    if (!WorldManager.instance) {
      WorldManager.instance = new WorldManager();
    }
    return WorldManager.instance;
  }

  initialize() {
    this.worlds.set('hive', []);
    this.worlds.set('sandbox-1', []);
    this.activeWorlds.add('hive');
    console.log('[WorldManager] Initialized - Dual-world architecture ready');
  }

  switchWorld(worldId: string, position?: Vector3) {
    const previousWorld = this.currentWorld;
    this.currentWorld = worldId as WorldType;
    if (position) this.playerPosition = position;
    if (!this.activeWorlds.has(worldId)) this.activeWorlds.add(worldId);
    console.log(`[WorldManager] Switched from ${previousWorld} to ${worldId}`);
    return previousWorld;
  }

  getCurrentWorld(): WorldType { return this.currentWorld; }
  getPlayerPosition(): Vector3 { return this.playerPosition; }
  setPlayerPosition(position: Vector3) { this.playerPosition = position; }

  addEntity(worldId: string, entity: Entity) {
    const entities = this.worlds.get(worldId) || [];
    entities.push(entity);
    this.worlds.set(worldId, entities);
    return entity.id;
  }

  getEntities(worldId: string): Entity[] { return this.worlds.get(worldId) || []; }

  projectEntityToWorld(entity: Entity, targetWorld: string): Entity {
    return { ...entity, id: `${entity.id}-projected`, data: { ...entity.data, isProjection: true, sourceWorld: this.currentWorld } };
  }

  teleportPlayer(position: Vector3, worldId?: string) {
    if (worldId) this.switchWorld(worldId, position);
    else this.setPlayerPosition(position);
    console.log(`[WorldManager] Player teleported to ${JSON.stringify(position)} in ${this.currentWorld}`);
  }

  spawnNPC(npc: NPC, worldId: string): string {
    const entity: Entity = { id: npc.id, type: 'npc', position: npc.position, data: npc };
    return this.addEntity(worldId, entity);
  }
}

// NPCManager - NPC behavior system
class NPCManager {
  private static instance: NPCManager;
  private npcs: Map<string, NPC> = new Map();
  private worldManager: WorldManager;

  private constructor() { this.worldManager = WorldManager.getInstance(); }

  public static getInstance(): NPCManager {
    if (!NPCManager.instance) NPCManager.instance = new NPCManager();
    return NPCManager.instance;
  }

  initialize() {
    console.log('[NPCManager] Initialized');
    this.createNPC({
      id: 'npc-guide-1',
      name: 'Elder Guide',
      type: 'guide',
      position: { x: 5, y: 0, z: 5 },
      dialogue: [{ id: 'welcome', text: 'Welcome to THE HIVE, traveler! I am the Elder Guide. How may I assist you?' }],
      behavior: 'idle',
      modelUrl: '/models/npcs/guide.glb',
    });
    this.createNPC({
      id: 'npc-merchant-1',
      name: 'Trader Marla',
      type: 'merchant',
      position: { x: -5, y: 0, z: 5 },
      dialogue: [{ id: 'greet', text: 'Welcome to my shop! Browse my wares.' }],
      inventory: [{ id: 'part-head-rare', name: 'Rare Head', type: 'part', cost: 100, rarity: 'rare' }],
      behavior: 'idle',
      modelUrl: '/models/npcs/merchant.glb',
    });
  }

  createNPC(npc: NPC) { this.npcs.set(npc.id, npc); this.worldManager.spawnNPC(npc, this.worldManager.getCurrentWorld()); return npc.id; }
  getNPC(npcId: string): NPC | undefined { return this.npcs.get(npcId); }
  getNearbyNPCs(position: Vector3, radius: number = 10): NPC[] {
    return Array.from(this.npcs.values()).filter(npc => {
      const dx = npc.position.x - position.x;
      const dy = npc.position.y - position.y;
      const dz = npc.position.z - position.z;
      return Math.sqrt(dx * dx + dy * dy + dz * dz) <= radius;
    });
  }
}

// PortalManager - World travel system
class PortalManager {
  private static instance: PortalManager;
  private portals: Map<string, Portal> = new Map();
  private worldManager: WorldManager;

  private constructor() { this.worldManager = WorldManager.getInstance(); }

  public static getInstance(): PortalManager {
    if (!PortalManager.instance) PortalManager.instance = new PortalManager();
    return PortalManager.instance;
  }

  initialize() {
    console.log('[PortalManager] Initialized');
    this.createPortal({
      id: 'portal-hive-to-sandbox',
      name: 'Sandbox Gateway',
      position: { x: 10, y: 0, z: 10 },
      targetWorld: 'sandbox-1',
      targetPosition: { x: 0, y: 0, z: 0 },
      accessLevel: 1,
      isActive: true,
      modelUrl: '/models/portals/gateway.glb',
    });
  }

  createPortal(portal: Portal) {
    this.portals.set(portal.id, portal);
    const entity: Entity = { id: portal.id, type: 'portal', position: portal.position, data: portal };
    this.worldManager.addEntity(this.worldManager.getCurrentWorld(), entity);
    return portal.id;
  }

  getPortal(portalId: string): Portal | undefined { return this.portals.get(portalId); }

  usePortal(portalId: string, userId: string): boolean {
    const portal = this.portals.get(portalId);
    if (!portal || !portal.isActive) return false;
    this.worldManager.teleportPlayer(portal.targetPosition, portal.targetWorld);
    console.log(`[PortalManager] ${userId} used portal ${portalId} to ${portal.targetWorld}`);
    return true;
  }

  getNearbyPortals(position: Vector3, radius: number = 10): Portal[] {
    return Array.from(this.portals.values()).filter(portal => {
      const dx = portal.position.x - position.x;
      const dy = portal.position.y - position.y;
      const dz = portal.position.z - position.z;
      return Math.sqrt(dx * dx + dy * dy + dz * dz) <= radius;
    });
  }
}

// ColonyManager - Building and economy
class ColonyManager {
  private static instance: ColonyManager;
  private buildings: Map<string, ColonyBuilding> = new Map();
  private resources: Map<string, number> = new Map();
  private worldManager: WorldManager;

  private constructor() {
    this.worldManager = WorldManager.getInstance();
    this.resources.set('wood', 100);
    this.resources.set('stone', 100);
    this.resources.set('metal', 50);
    this.resources.set('food', 50);
  }

  public static getInstance(): ColonyManager {
    if (!ColonyManager.instance) ColonyManager.instance = new ColonyManager();
    return ColonyManager.instance;
  }

  initialize() { console.log('[ColonyManager] Initialized'); }

  createBuilding(building: ColonyBuilding) {
    this.buildings.set(building.id, building);
    const entity: Entity = { id: building.id, type: 'colony', position: building.position, rotation: building.rotation, data: building };
    this.worldManager.addEntity(this.worldManager.getCurrentWorld(), entity);
    return building.id;
  }

  startBuilding(buildingType: string, position: Vector3): ColonyBuilding {
    const building: ColonyBuilding = {
      id: `building-${Date.now()}`,
      type: buildingType as any,
      position, rotation: { x: 0, y: 0, z: 0 },
      level: 1, health: 100, maxHealth: 100,
      productionRate: 1, productionType: this.getProductionType(buildingType),
      isBuilding: true, buildProgress: 0,
    };
    this.buildings.set(building.id, building);
    return building;
  }

  private getProductionType(buildingType: string): string {
    const types: Record<string, string> = { farm: 'food', mine: 'metal', workshop: 'items', house: 'population' };
    return types[buildingType] || 'generic';
  }

  updateBuildingProgress(buildingId: string, progress: number) {
    const building = this.buildings.get(buildingId);
    if (building && building.isBuilding) {
      building.buildProgress = Math.min(progress, 100);
      if (building.buildProgress >= 100) { building.isBuilding = false; building.buildProgress = 100; }
      this.buildings.set(buildingId, building);
    }
  }

  collectResources(buildingId: string): number {
    const building = this.buildings.get(buildingId);
    if (!building || building.isBuilding) return 0;
    const amount = building.productionRate;
    const resourceType = building.productionType;
    if (this.resources.has(resourceType)) this.resources.set(resourceType, (this.resources.get(resourceType) || 0) + amount);
    return amount;
  }

  getResources(): Map<string, number> { return new Map(this.resources); }
  getBuildings(): ColonyBuilding[] { return Array.from(this.buildings.values()); }
}

// MultiplayerManager - Real-time synchronization
class MultiplayerManager {
  private static instance: MultiplayerManager;
  private peers: Map<string, Peer> = new Map();
  private worldManager: WorldManager;
  private isConnected: boolean = false;
  private socket: WebSocket | null = null;

  private constructor() { this.worldManager = WorldManager.getInstance(); }

  public static getInstance(): MultiplayerManager {
    if (!MultiplayerManager.instance) MultiplayerManager.instance = new MultiplayerManager();
    return MultiplayerManager.instance;
  }

  initialize(signalingServerUrl?: string) {
    console.log('[MultiplayerManager] Initialized');
    this.isConnected = true;
    this.addPeer({ id: 'player-1', name: 'You', avatar: '/avatars/default.glb', position: this.worldManager.getPlayerPosition(), rotation: { x: 0, y: 0, z: 0 }, lastUpdate: Date.now(), isConnected: true });
  }

  connect(signalingServerUrl: string) {
    try {
      this.socket = new WebSocket(signalingServerUrl);
      this.socket.onopen = () => { this.isConnected = true; console.log('[MultiplayerManager] Connected to signaling server'); };
      this.socket.onmessage = (event) => this.handleMessage(JSON.parse(event.data));
      this.socket.onclose = () => { this.isConnected = false; console.log('[MultiplayerManager] Disconnected'); };
    } catch (error) { console.error('Failed to connect:', error); }
  }

  private handleMessage(message: any) {
    switch (message.type) {
      case 'peer_joined': this.addPeer(message.peer); break;
      case 'peer_left': this.removePeer(message.peerId); break;
      case 'peer_update': this.updatePeer(message.peerId, message.data); break;
    }
  }

  addPeer(peer: Peer) { this.peers.set(peer.id, peer); console.log(`[MultiplayerManager] Peer joined: ${peer.name}`); }
  removePeer(peerId: string) { this.peers.delete(peerId); }
  updatePeer(peerId: string, data: Partial<Peer>) {
    const peer = this.peers.get(peerId);
    if (peer) this.peers.set(peerId, { ...peer, ...data, lastUpdate: Date.now() });
  }
  updateSelfPosition(position: Vector3, rotation: Vector3) {
    this.updatePeer('player-1', { position, rotation });
    if (this.socket?.readyState === WebSocket.OPEN) this.socket.send(JSON.stringify({ type: 'peer_update', peerId: 'player-1', data: { position, rotation } }));
  }
  getPeers(): Peer[] { return Array.from(this.peers.values()); }
  getConnectedPeers(): Peer[] { return this.getPeers().filter(p => p.isConnected); }
  isConnectedToMultiplayer(): boolean { return this.isConnected; }
}

// MissionTracker - Mission system
class MissionTracker {
  private static instance: MissionTracker;
  private missions: Map<string, Mission> = new Map();
  private activeMissions: Set<string> = new Set();
  private completedMissions: Set<string> = new Set();

  private constructor() {}

  public static getInstance(): MissionTracker {
    if (!MissionTracker.instance) MissionTracker.instance = new MissionTracker();
    return MissionTracker.instance;
  }

  initialize() {
    console.log('[MissionTracker] Initialized');
    this.createMission({
      id: 'mission-welcome',
      title: 'Welcome to THE HIVE',
      description: 'Find and talk to the Elder Guide',
      type: 'story',
      objectives: [{ id: 'obj-talk-to-guide', description: 'Talk to Elder Guide', type: 'talk', target: 'npc-guide-1', required: 1, completed: 0 }],
      rewards: { xp: 100, items: ['welcome_pack'], unlocks: ['sandbox_access'] },
      difficulty: 'easy',
      duration: 300,
      isActive: false,
      isCompleted: false,
      progress: 0,
    });
    this.createMission({
      id: 'mission-first-build',
      title: 'Build Your First Structure',
      description: 'Construct a house in your colony',
      type: 'building',
      objectives: [{ id: 'obj-build-house', description: 'Build a house', type: 'build', target: 'house', required: 1, completed: 0 }],
      rewards: { xp: 200, currency: 50 },
      difficulty: 'easy',
      duration: 600,
      isActive: false,
      isCompleted: false,
      progress: 0,
    });
  }

  createMission(mission: Mission) { this.missions.set(mission.id, mission); return mission.id; }
  activateMission(missionId: string): boolean {
    const mission = this.missions.get(missionId);
    if (!mission || mission.isCompleted) return false;
    mission.isActive = true; this.activeMissions.add(missionId); this.missions.set(missionId, mission);
    return true;
  }
  completeObjective(missionId: string, objectiveId: string, progress: number = 1) {
    const mission = this.missions.get(missionId);
    if (!mission || !mission.isActive) return false;
    const objective = mission.objectives.find(o => o.id === objectiveId);
    if (!objective) return false;
    objective.completed = Math.min(objective.completed + progress, objective.required);
    const allComplete = mission.objectives.every(o => o.completed >= o.required);
    if (allComplete) { mission.isCompleted = true; mission.isActive = false; this.activeMissions.delete(missionId); this.completedMissions.add(missionId); this.completeMission(mission); }
    this.missions.set(missionId, mission); return true;
  }
  private completeMission(mission: Mission) { console.log(`[MissionTracker] Mission completed: ${mission.title}`); }
  getActiveMissions(): Mission[] { return Array.from(this.activeMissions.values()).map(id => this.missions.get(id)!).filter(Boolean); }
  getAvailableMissions(): Mission[] { return Array.from(this.missions.values()).filter(m => !m.isActive && !m.isCompleted); }
  getCompletedMissions(): Mission[] { return Array.from(this.completedMissions.values()).map(id => this.missions.get(id)!).filter(Boolean); }
  getMission(missionId: string): Mission | undefined { return this.missions.get(missionId); }
}

// AchievementTracker - Achievement system
class AchievementTracker {
  private static instance: AchievementTracker;
  private achievements: Map<string, Achievement> = new Map();
  private unlockedAchievements: Set<string> = new Set();
  private totalPoints: number = 0;

  private constructor() {}

  public static getInstance(): AchievementTracker {
    if (!AchievementTracker.instance) AchievementTracker.instance = new AchievementTracker();
    return AchievementTracker.instance;
  }

  initialize() {
    console.log('[AchievementTracker] Initialized');
    this.createAchievement({ id: 'ach-first-steps', title: 'First Steps', description: 'Complete your first mission', type: 'exploration', rarity: 'common', points: 10, isUnlocked: false });
    this.createAchievement({ id: 'ach-builder', title: 'Master Builder', description: 'Build 10 structures', type: 'building', rarity: 'rare', points: 25, isUnlocked: false });
    this.createAchievement({ id: 'ach-explorer', title: 'World Wanderer', description: 'Discover both hive and sandbox worlds', type: 'exploration', rarity: 'rare', points: 20, isUnlocked: false });
  }

  createAchievement(achievement: Achievement) { this.achievements.set(achievement.id, achievement); return achievement.id; }

  unlockAchievement(achievementId: string): boolean {
    const achievement = this.achievements.get(achievementId);
    if (!achievement || achievement.isUnlocked) return false;
    achievement.isUnlocked = true;
    achievement.unlockDate = Date.now();
    this.unlockedAchievements.add(achievementId);
    this.totalPoints += achievement.points;
    this.achievements.set(achievementId, achievement);
    console.log(`[AchievementTracker] Unlocked: ${achievement.title} (+${achievement.points}pts)`);
    return true;
  }

  getAchievements(): Achievement[] { return Array.from(this.achievements.values()); }
  getUnlockedAchievements(): Achievement[] {
    return Array.from(this.unlockedAchievements.values()).map(id => this.achievements.get(id)!).filter(Boolean);
  }
  getTotalPoints(): number { return this.totalPoints; }
}

// ============================================================================
// 3D COMPONENTS
// ============================================================================

function PlayerAvatar({ position }: { position: Vector3 }) {
  return (
    <group position={[position.x, position.y + 0.9, position.z]}>
      <mesh>
        <capsuleGeometry args={[0.3, 0.7, 4, 8]} />
        <meshStandardMaterial color="#4CAF50" metalness={0.3} roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.7, 0]}>
        <sphereGeometry args={[0.25, 16, 16]} />
        <meshStandardMaterial color="#4CAF50" metalness={0.2} roughness={0.8} />
      </mesh>
      <pointLight color="#4CAF50" intensity={0.5} distance={5} />
    </group>
  );
}

function NPCComponent({ npc }: { npc: any }) {
  const getColor = (type: string) => {
    const colors: Record<string, string> = { merchant: '#FFD700', quest: '#FF4500', guide: '#87CEEB', guard: '#800080', friend: '#00FF7F' };
    return colors[type] || '#FFFFFF';
  };
  return (
    <group position={[npc.position.x, npc.position.y + 0.9, npc.position.z]}>
      <mesh>
        <capsuleGeometry args={[0.4, 0.8, 4, 8]} />
        <meshStandardMaterial color={getColor(npc.type)} metalness={0.3} roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.8, 0]}>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial color={getColor(npc.type)} metalness={0.2} roughness={0.8} />
      </mesh>
    </group>
  );
}

function PortalComponent({ portal }: { portal: any }) {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame(() => { if (meshRef.current) meshRef.current.rotation.y += 0.01; });
  return (
    <group position={[portal.position.x, portal.position.y, portal.position.z]}>
      <mesh ref={meshRef}>
        <torusGeometry args={[1.5, 0.2, 16, 48]} />
        <meshStandardMaterial color="#87CEEB" emissive="#87CEEB" emissiveIntensity={0.8} metalness={0.5} roughness={0.3} />
      </mesh>
      <pointLight color="#87CEEB" intensity={2} distance={10} />
    </group>
  );
}

function BuildingComponent({ building }: { building: any }) {
  const getColor = (type: string) => {
    const colors: Record<string, string> = { house: '#8B4513', workshop: '#A0522D', farm: '#228B22', mine: '#696969', tower: '#808080' };
    return colors[type] || '#FFFFFF';
  };
  const getSize = (type: string): [number, number, number] => {
    const sizes: Record<string, [number, number, number]> = { house: [2, 2, 2], workshop: [3, 1.5, 2], farm: [4, 1, 3], mine: [2, 1.5, 2], tower: [1.5, 4, 1.5] };
    return sizes[type] || [1, 1, 1];
  };
  const [w, h, d] = getSize(building.type);
  return (
    <group position={[building.position.x, building.position.y + h / 2, building.position.z]}>
      <mesh>
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial color={getColor(building.type)} metalness={0.4} roughness={0.6} />
      </mesh>
    </group>
  );
}

function VoxelComponent({ voxel }: { voxel: any }) {
  return (
    <group position={[voxel.position.x, voxel.position.y, voxel.position.z]}>
      <mesh>
        <boxGeometry args={[0.98, 0.98, 0.98]} />
        <meshStandardMaterial color={voxel.color} roughness={0.8} metalness={0.1} />
      </mesh>
    </group>
  );
}

function OtherPlayerComponent({ peer }: { peer: any }) {
  return (
    <group position={[peer.position.x, peer.position.y + 0.9, peer.position.z]}>
      <mesh>
        <capsuleGeometry args={[0.3, 0.7, 4, 8]} />
        <meshStandardMaterial color="#0096FF" metalness={0.3} roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.7, 0]}>
        <sphereGeometry args={[0.25, 16, 16]} />
        <meshStandardMaterial color="#0096FF" metalness={0.2} roughness={0.8} />
      </mesh>
    </group>
  );
}

function WorldScene() {
  const worldManager = WorldManager.getInstance();
  const entities = worldManager.getEntities(worldManager.getCurrentWorld());
  const playerPosition = worldManager.getPlayerPosition();

  return (
    <>
      <Sky sunPosition={[100, 100, 20]} turbidity={0.1} />
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade />
      <Grid args={[100, 100]} cellSize={1} cellThickness={0.5} cellColor="#444444" sectionSize={5} sectionThickness={1} sectionColor="#666666" />
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 20, 10]} intensity={1} castShadow shadow-mapSize={[2048, 2048]} />
      <directionalLight position={[-10, 20, -10]} intensity={0.3} />
      <pointLight position={[0, 10, 0]} intensity={0.5} />

      <PlayerAvatar position={playerPosition} />
      <color attach="background" args={['#1a1a2e']} />
      <fog attach="fog" args={['#1a1a2e', 20, 100]} />
    </>
  );
}

// ============================================================================
// MAIN APP COMPONENT
// ============================================================================

export default function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('Initializing THE HIVE Gamified UI...');
    WorldManager.getInstance().initialize();
    NPCManager.getInstance().initialize();
    PortalManager.getInstance().initialize();
    ColonyManager.getInstance().initialize();
    MultiplayerManager.getInstance().initialize();
    MissionTracker.getInstance().initialize();
    AchievementTracker.getInstance().initialize();

    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div style={{ position: 'fixed', inset: 0, background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5 }}>
          <div style={{ fontSize: 72, marginBottom: 16 }}>🏰</div>
          <h1 style={{ fontSize: 48, fontWeight: 'bold', color: 'white' }}>THE HIVE</h1>
          <p style={{ color: '#94a3b8', marginTop: 8 }}>Loading gamified world...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#0f172a', overflow: 'hidden' }}>
      <Canvas shadows camera={{ position: [0, 8, 15], fov: 60 }} gl={{ antialias: true, alpha: false }}>
        <PerspectiveCamera makeDefault position={[0, 8, 15]} fov={60} />
        <OrbitControls enableDamping dampingFactor={0.05} minDistance={2} maxDistance={200} maxPolarAngle={Math.PI / 2 - 0.1} enablePan={true} />
        <Suspense fallback={null}>
          <WorldScene />
        </Suspense>
        <Stats />
      </Canvas>
    </div>
  );
}
