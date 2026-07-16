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
  type: 'player'   'npc' | 'portal' | 'colony' | 'voxel';
  position: Vector3;
  rotation?: Vector3;
  scale?: Vector3;
  data?: any;
};
type WorldType = 'hive' | 'sandbox';

// ============================================================================
// MANAGER SINGLETONS
// ============================================================================

class WorldManager {
  private static instance: WorldManager;
  private currentWorld: WorldType = 'hive';
  private worlds: Map<string, Entity[]> = new Map();
  private playerPosition: Vector3 = { x: 0, y: 0, z: 0 };

  public static getInstance(): WorldManager {
    if (!WorldManager.instance) WorldManager.instance = new WorldManager();
    return WorldManager.instance;
  }

  initialize() {
    this.worlds.set('hive', []);
    this.worlds.set('sandbox-1', []);
    console.log('[WorldManager] Initialized');
  }

  switchWorld(worldId: string, position?: Vector3) {
    this.currentWorld = worldId as WorldType;
    if (position) this.playerPosition = position;
    console.log(`[WorldManager] Switched to ${worldId}`);
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
  teleportPlayer(position: Vector3, worldId?: string) {
    if (worldId) this.switchWorld(worldId, position);
    else this.setPlayerPosition(position);
  }
}

class NPCManager {
  private static instance: NPCManager;
  private npcs: Map<string, any> = new Map();
  public static getInstance(): NPCManager {
    if (!NPCManager.instance) NPCManager.instance = new NPCManager();
    return NPCManager.instance;
  }
  initialize() {
    console.log('[NPCManager] Initialized');
  }
}

class PortalManager {
  private static instance: PortalManager;
  public static getInstance(): PortalManager {
    if (!PortalManager.instance) PortalManager.instance = new PortalManager();
    return PortalManager.instance;
  }
  initialize() {
    console.log('[PortalManager] Initialized');
  }
}

class ColonyManager {
  private static instance: ColonyManager;
  public static getInstance(): ColonyManager {
    if (!ColonyManager.instance) ColonyManager.instance = new ColonyManager();
    return ColonyManager.instance;
  }
  initialize() {
    console.log('[ColonyManager] Initialized');
  }
}

class MultiplayerManager {
  private static instance: MultiplayerManager;
  public static getInstance(): MultiplayerManager {
    if (!MultiplayerManager.instance) MultiplayerManager.instance = new MultiplayerManager();
    return MultiplayerManager.instance;
  }
  initialize() {
    console.log('[MultiplayerManager] Initialized');
  }
}

class MissionTracker {
  private static instance: MissionTracker;
  public static getInstance(): MissionTracker {
    if (!MissionTracker.instance) MissionTracker.instance = new MissionTracker();
    return MissionTracker.instance;
  }
  initialize() {
    console.log('[MissionTracker] Initialized');
  }
}

class AchievementTracker {
  private static instance: AchievementTracker;
  public static getInstance(): AchievementTracker {
    if (!AchievementTracker.instance) AchievementTracker.instance = new AchievementTracker();
    return AchievementTracker.instance;
  }
  initialize() {
    console.log('[AchievementTracker] Initialized');
  }
}

class ConversationManager {
  private static instance: ConversationManager;
  public static getInstance(): ConversationManager {
    if (!ConversationManager.instance) ConversationManager.instance = new ConversationManager();
    return ConversationManager.instance;
  }
  initialize() {
    console.log('[ConversationManager] Initialized');
  }
}

class XPManager {
  private static instance: XPManager;
  public static getInstance(): XPManager {
    if (!XPManager.instance) XPManager.instance = new XPManager();
    return XPManager.instance;
  }
  initialize() {
    console.log('[XPManager] Initialized');
  }
}

class AvatarManager {
  private static instance: AvatarManager;
  public static getInstance(): AvatarManager {
    if (!AvatarManager.instance) AvatarManager.instance = new AvatarManager();
    return AvatarManager.instance;
  }
  initialize() {
    console.log('[AvatarManager] Initialized');
  }
}

class VoxelManager {
  private static instance: VoxelManager;
  public static getInstance(): VoxelManager {
    if (!VoxelManager.instance) VoxelManager.instance = new VoxelManager();
    return VoxelManager.instance;
  }
  initialize() {
    console.log('[VoxelManager] Initialized');
  }
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
    ConversationManager.getInstance().initialize();
    XPManager.getInstance().initialize();
    AvatarManager.getInstance().initialize();
    VoxelManager.getInstance().initialize();

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
