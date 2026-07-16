/**
 * NPC Component for THEHIVE
 * Renders 3D NPCs with animations and interactions
 */
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

import { NPCState, NPCConfig, npcManager } from './NPCManager';
import { Position3D } from './types';

interface NPCProps {
  state: NPCState;
  config: NPCConfig;
  onClick?: (npcId: string) => void;
  onInteraction?: (npcId: string, interactionType: string) => void;
  showNameTag?: boolean;
  showInteractionPrompt?: boolean;
}

// NPC model geometries
const NPC_GEOMETRIES: Record<string, [THREE.BufferGeometry, number]> = {
  humanoid: [new THREE.BoxGeometry(0.8, 1.8, 0.4), 0.8],
  fairy: [new THREE.ConeGeometry(0.5, 1, 8), 0.5],
  beast: [new THREE.CapsuleGeometry(0.5, 1.5), 0.5],
  robot: [new THREE.CylinderGeometry(0.4, 0.6, 1.8, 8), 0.4],
};

// NPC animations
const NPC_ANIMATIONS: Record<string, { position: { y: number }; rotation: { x: number; y: number; z: number } }> = {
  idle: { position: { y: 0 }, rotation: { x: 0, y: 0, z: 0 } },
  walk: { position: { y: 0.1 }, rotation: { x: 0, y: 0, z: 0.1 } },
  run: { position: { y: 0.2 }, rotation: { x: 0, y: 0, z: 0.2 } },
  attack: { position: { y: 0 }, rotation: { x: 0, y: 0, z: Math.PI / 4 } },
  cast: { position: { y: 0.3 }, rotation: { x: -Math.PI / 4, y: 0, z: 0 } },
  hurt: { position: { y: -0.1 }, rotation: { x: Math.PI / 4, y: 0, z: 0 } },
  talk: { position: { y: 0 }, rotation: { x: 0, y: 0, z: 0.05 } },
};

// NPC colors by role
const ROLE_COLORS: Record<string, number> = {
  guard: 0x4CAF50,
  merchant: 0xFFD700,
  quest: 0x9C27B0,
  wanderer: 0x2196F3,
  teacher: 0xFF5722,
  soldier: 0xF44336,
  scout: 0x00BCD4,
  builder: 0xFF9800,
  healer: 0xE91E63,
  scholar: 0x3F51B5,
};

const NPCModel: React.FC<{ config: NPCConfig; state: NPCState; animation?: string }> = ({ config, state, animation = 'idle' }) => {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  
  const geometry = useMemo(() => {
    return NPC_GEOMETRIES[config.appearance.model] || NPC_GEOMETRIES.humanoid;
  }, [config.appearance.model]);

  const color = config.appearance.color || ROLE_COLORS[config.role] || 0xFFFFFF;
  const scale = config.appearance.scale || { x: 1, y: 1, z: 1 };
  const glow = config.appearance.glow || 0;

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.position.set(state.position.x, state.position.y, state.position.z);
      groupRef.current.rotation.set(state.rotation.x, state.rotation.y, state.rotation.z);
    }
  });

  return (
    <group ref={groupRef}>
      <mesh ref={meshRef} castShadow receiveShadow>
        <primitive object={geometry[0]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={glow}
          metalness={0.3}
          roughness={0.7}
        />
      </mesh>
      
      {animation === 'attack' && (
        <mesh position={[1, 0.5, 0]} rotation={[0, 0, -Math.PI / 4]}>
          <boxGeometry args={[1.5, 0.2, 0.2]} />
          <meshStandardMaterial color={0xFF0000} />
        </mesh>
      )}
      
      {animation === 'cast' && (
        <pointLight position={[0, 1, 0]} color={0xFFFF00} intensity={2} distance={5} />
      )}
    </group>
  );
};

const NPCNameTag: React.FC<{ config: NPCConfig; state: NPCState }> = ({ config, state }) => {
  const [visible, setVisible] = useState(false);

  return (
    <Html center distanceFactor={10} occlude={['mesh']}>
      <div
        onPointerOver={() => setVisible(true)}
        onPointerOut={() => setVisible(false)}
        style={{
          background: 'rgba(0,0,0,0.7)',
          color: '#fff',
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '12px',
          fontWeight: 'bold',
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
          opacity: visible ? 1 : 0,
          transition: 'opacity 0.2s',
          transform: 'translateY(-100%)',
        }}
      >
        {config.name}
        {state.isInteracting && <div style={{ fontSize: '10px', color: '#FFD700' }}>Interacting...</div>}
      </div>
    </Html>
  );
};

const NPCInteractionPrompt: React.FC<{ config: NPCConfig; onInteraction: (npcId: string, interactionType: string) => void }> = ({ config, onInteraction }) => {
  const [visible, setVisible] = useState(false);

  const getInteractionText = () => {
    switch (config.interactionType) {
      case 'dialogue': return 'Press E to Talk';
      case 'trade': return 'Press E to Trade';
      case 'quest': return 'Press E for Quests';
      case 'combat': return 'Press E to Attack';
      default: return '';
    }
  };

  const text = getInteractionText();
  if (!text) return null;

  return (
    <Html center distanceFactor={8} occlude={['mesh']}>
      <div
        onPointerOver={() => setVisible(true)}
        onPointerOut={() => setVisible(false)}
        style={{
          background: 'rgba(0,0,0,0.8)',
          color: '#4CAF50',
          padding: '6px 12px',
          borderRadius: '4px',
          fontSize: '14px',
          fontWeight: 'bold',
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
          opacity: visible ? 1 : 0,
          transition: 'opacity 0.2s',
          transform: 'translateY(50%)',
          cursor: 'pointer',
        }}
        onClick={(e) => {
          e.stopPropagation();
          onInteraction(config.id, config.interactionType);
        }}
      >
        {text}
      </div>
    </Html>
  );
};

export const NPC: React.FC<NPCProps> = ({ state, config, onClick, onInteraction, showNameTag = true, showInteractionPrompt = true }) => {
  const [animation, setAnimation] = useState<string>('idle');
  const [interactionType, setInteractionType] = useState<string>('');

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    if (state.isInteracting) {
      setInteractionType(config.interactionType);
      setAnimation('talk');
    } else if (state.currentAction === 'attack') {
      setAnimation('attack');
      timeout = setTimeout(() => setAnimation('idle'), 500);
    } else if (state.currentAction === 'cast') {
      setAnimation('cast');
      timeout = setTimeout(() => setAnimation('idle'), 800);
    } else if (state.movementType === 'patrol' || state.movementType === 'wander' || state.movementType === 'chase' || state.movementType === 'flee') {
      setAnimation('walk');
    } else {
      setAnimation('idle');
    }

    return () => clearTimeout(timeout);
  }, [state, config.interactionType]);

  const handleClick = (e: any) => {
    e.stopPropagation();
    if (onClick) onClick(state.id);
  };

  const handleInteraction = (npcId: string, type: string) => {
    if (onInteraction) onInteraction(npcId, type);
  };

  return (
    <group position={[state.position.x, state.position.y, state.position.z]} onClick={handleClick}>
      <NPCModel config={config} state={state} animation={animation} />
      {showNameTag && <NPCNameTag config={config} state={state} />}
      {showInteractionPrompt && !state.isInteracting && (
        <NPCInteractionPrompt config={config} onInteraction={handleInteraction} />
      )}
    </group>
  );
};

// NPC Container - Renders all NPCs in a world
interface NPCContainerProps {
  worldId: string;
  onNPCClick?: (npcId: string) => void;
  onNPCInteraction?: (npcId: string, interactionType: string) => void;
  showNameTags?: boolean;
  showInteractionPrompts?: boolean;
}

export const NPCContainer: React.FC<NPCContainerProps> = ({
  worldId,
  onNPCClick,
  onNPCInteraction,
  showNameTags = true,
  showInteractionPrompts = true,
}) => {
  const [npcStates, setNpcStates] = useState<NPCState[]>([]);

  useEffect(() => {
    const updateNPCs = () => {
      setNpcStates(npcManager.getAllNPCs(worldId));
    };

    updateNPCs();

    const unsubscribe = npcManager.onEvent(() => updateNPCs());
    const interval = setInterval(updateNPCs, 1000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, [worldId]);

  return (
    <>
      {npcStates.map(state => {
        const config = npcManager.getNPCConfig(state.npcId);
        if (!config) return null;

        return (
          <NPC
            key={state.id}
            state={state}
            config={config}
            onClick={onNPCClick}
            onInteraction={onNPCInteraction}
            showNameTag={showNameTags}
            showInteractionPrompt={showInteractionPrompts}
          />
        );
      })}
    </>
  );
};

// Hook for NPC interactions
export function useNPCInteractions(worldId: string) {
  const [activeInteraction, setActiveInteraction] = useState<{ npcId: string; type: string } | null>(null);

  const startInteraction = useCallback((npcId: string, interactionType: string) => {
    const success = npcManager.startInteraction(npcId, worldId, interactionType as any);
    if (success) {
      setActiveInteraction({ npcId, type: interactionType });
    }
  }, [worldId]);

  const endInteraction = useCallback((npcId: string) => {
    const success = npcManager.endInteraction(npcId, worldId);
    if (success) {
      setActiveInteraction(null);
    }
  }, [worldId]);

  return { activeInteraction, startInteraction, endInteraction };
}

export default NPC;