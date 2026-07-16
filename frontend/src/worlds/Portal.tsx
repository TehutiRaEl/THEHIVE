/**
 * Portal Component for THEHIVE
 * Renders interactive 3D portals for world travel
 */
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

import { PortalState, portalManager } from './PortalManager';
import { Position3D } from './types';

interface PortalProps {
  portal: PortalState;
  onClick?: (portalId: string) => void;
  canUse?: boolean;
  showName?: boolean;
  showPrompt?: boolean;
}

// Portal geometries
const PORTAL_GEOMETRIES: Record<string, THREE.BufferGeometry> = {
  arch: new THREE.TorusGeometry(2, 0.3, 8, 16),
  gate: new THREE.BoxGeometry(3, 5, 0.5),
  floating: new THREE.SphereGeometry(1, 16, 16),
  vortex: new THREE.ConeGeometry(1.5, 3, 16),
};

// Portal materials
const createPortalMaterial = (color: number, glow: number, time?: number) => {
  return new THREE.MeshStandardMaterial({
    color: color,
    emissive: color,
    emissiveIntensity: glow,
    metalness: 0.5,
    roughness: 0.3,
    transparent: true,
    opacity: 0.8,
  });
};

const PortalModel: React.FC<{ portal: PortalState; time: number }> = ({ portal, time }) => {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);

  const geometry = PORTAL_GEOMETRIES[portal.appearance.model] || PORTAL_GEOMETRIES.arch;
  const material = useMemo(() => createPortalMaterial(portal.appearance.color, portal.appearance.glow), [portal.appearance.color, portal.appearance.glow]);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.position.set(
        portal.sourcePosition.x,
        portal.sourcePosition.y,
        portal.sourcePosition.z
      );
      
      if (portal.appearance.animation === 'spin') {
        groupRef.current.rotation.y += 0.01;
      }
      
      if (portal.appearance.animation === 'pulse') {
        const scale = 1 + Math.sin(time * 0.001) * 0.1;
        groupRef.current.scale.set(scale, scale, scale);
      }
    }
  });

  return (
    <group ref={groupRef}>
      <mesh ref={meshRef} geometry={geometry} material={material} castShadow receiveShadow />
      
      {portal.appearance.particleEffect && (
        <pointLight
          position={[0, 0, 0]}
          color={portal.appearance.color}
          intensity={portal.appearance.glow * 2}
          distance={5}
        />
      )}
    </group>
  );
};

const PortalNameTag: React.FC<{ portal: PortalState }> = ({ portal }) => {
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
        {portal.name}
      </div>
    </Html>
  );
};

const PortalPrompt: React.FC<{ portal: PortalState; canUse: boolean; onClick: () => void }> = ({ portal, canUse, onClick }) => {
  const [visible, setVisible] = useState(false);

  return (
    <Html center distanceFactor={8} occlude={['mesh']}>
      <div
        onPointerOver={() => setVisible(true)}
        onPointerOut={() => setVisible(false)}
        onClick={(e) => { e.stopPropagation(); onClick(); }}
        style={{
          background: canUse ? 'rgba(0,150,0,0.8)' : 'rgba(150,0,0,0.8)',
          color: '#fff',
          padding: '6px 12px',
          borderRadius: '4px',
          fontSize: '14px',
          fontWeight: 'bold',
          whiteSpace: 'nowrap',
          pointerEvents: 'auto',
          opacity: visible ? 1 : 0,
          transition: 'opacity 0.2s',
          transform: 'translateY(50%)',
          cursor: canUse ? 'pointer' : 'not-allowed',
        }}
      >
        {canUse ? 'Press E to Enter' : 'Portal Locked'}
      </div>
    </Html>
  );
};

const PortalStatusEffect: React.FC<{ portal: PortalState }> = ({ portal }) => {
  if (!portal.isActive) {
    return (
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[3, 3, 0.1]} />
        <meshStandardMaterial color={0xFF0000} transparent opacity={0.3} />
      </mesh>
    );
  }

  if (portal.isLocked) {
    return (
      <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 4]}>
        <boxGeometry args={[2, 2, 0.1]} />
        <meshStandardMaterial color={0xFFFF00} transparent opacity={0.5} />
      </mesh>
    );
  }

  return null;
};

export const Portal: React.FC<PortalProps> = ({ portal, onClick, canUse = true, showName = true, showPrompt = true }) => {
  const [time, setTime] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setTime(Date.now()), 100);
    return () => clearInterval(interval);
  }, []);

  const handleClick = (e: any) => {
    e.stopPropagation();
    if (onClick) onClick(portal.id);
  };

  return (
    <group
      position={[portal.sourcePosition.x, portal.sourcePosition.y, portal.sourcePosition.z]}
      onClick={handleClick}
    >
      <PortalModel portal={portal} time={time} />
      <PortalStatusEffect portal={portal} />
      {showName && <PortalNameTag portal={portal} />}
      {showPrompt && <PortalPrompt portal={portal} canUse={canUse} onClick={handleClick} />}
    </group>
  );
};

// Portal Container - Renders all portals in a world
interface PortalContainerProps {
  worldId: string;
  userId: string;
  onPortalClick?: (portalId: string) => void;
  showNames?: boolean;
  showPrompts?: boolean;
}

export const PortalContainer: React.FC<PortalContainerProps> = ({
  worldId,
  userId,
  onPortalClick,
  showNames = true,
  showPrompts = true,
}) => {
  const [portals, setPortals] = useState<PortalState[]>([]);

  useEffect(() => {
    const updatePortals = () => {
      setPortals(portalManager.getPortalsInWorld(worldId));
    };

    updatePortals();

    const unsubscribe = portalManager.onEvent(() => updatePortals());
    const interval = setInterval(updatePortals, 1000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, [worldId]);

  const handlePortalClick = useCallback((portalId: string) => {
    const portal = portalManager.getPortal(portalId, worldId);
    if (portal && portalManager.canUsePortal(portalId, worldId, userId)) {
      portalManager.teleportThrough(portalId, worldId, userId);
    }
    if (onPortalClick) onPortalClick(portalId);
  }, [worldId, userId, onPortalClick]);

  return (
    <>
      {portals.map(portal => (
        <Portal
          key={portal.id}
          portal={portal}
          onClick={() => handlePortalClick(portal.id)}
          canUse={portalManager.canUsePortal(portal.id, worldId, userId)}
          showName={showNames}
          showPrompt={showPrompts}
        />
      ))}
    </>
  );
};

// Hook for portal interactions
export function usePortalInteractions(worldId: string, userId: string) {
  const [activePortal, setActivePortal] = useState<string | null>(null);

  const teleport = useCallback((portalId: string) => {
    const success = portalManager.teleportThrough(portalId, worldId, userId);
    if (success) {
      setActivePortal(portalId);
      setTimeout(() => setActivePortal(null), 2000);
    }
    return success;
  }, [worldId, userId]);

  const getPortal = useCallback((portalId: string) => {
    return portalManager.getPortal(portalId, worldId);
  }, [worldId]);

  const canUse = useCallback((portalId: string) => {
    return portalManager.canUsePortal(portalId, worldId, userId);
  }, [worldId, userId]);

  return { activePortal, teleport, getPortal, canUse };
}

export default Portal;