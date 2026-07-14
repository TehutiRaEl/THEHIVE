import React, { useRef, useEffect, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { AgentAvatar, AvatarAnimation, AvatarPart, COLONY_THEMES, ColonyTheme } from './types';
import { XPParticleEffect } from '../voxel/FairySprite';

// Avatar model loader and cache
const avatarModels: Map<string, THREE.Group> = new Map();
const avatarTextures: Map<string, THREE.Texture> = new Map();

// Animation mixer cache
const animationMixers: Map<string, THREE.AnimationMixer> = new Map();

// Load avatar model (simplified - in production, use GLTFLoader)
async function loadAvatarModel(url: string): Promise<THREE.Group> {
  // This is a placeholder - in production, use GLTFLoader
  // For now, create a simple humanoid mesh
  const group = new THREE.Group();
  
  // Body
  const bodyGeometry = new THREE.BoxGeometry(0.6, 1.0, 0.4);
  const bodyMaterial = new THREE.MeshStandardMaterial({ 
    color: 0xFFFFFF,
    roughness: 0.7,
    metalness: 0.1
  });
  const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
  body.position.y = 0.5;
  group.add(body);
  
  // Head
  const headGeometry = new THREE.BoxGeometry(0.4, 0.4, 0.4);
  const headMaterial = new THREE.MeshStandardMaterial({ 
    color: 0xFFFFFF,
    roughness: 0.8,
    metalness: 0.0
  });
  const head = new THREE.Mesh(headGeometry, headMaterial);
  head.position.y = 1.2;
  group.add(head);
  
  // Arms
  const armGeometry = new THREE.BoxGeometry(0.2, 0.6, 0.2);
  const leftArm = new THREE.Mesh(armGeometry, bodyMaterial);
  leftArm.position.set(-0.4, 0.7, 0);
  group.add(leftArm);
  
  const rightArm = new THREE.Mesh(armGeometry, bodyMaterial);
  rightArm.position.set(0.4, 0.7, 0);
  group.add(rightArm);
  
  // Legs
  const legGeometry = new THREE.BoxGeometry(0.2, 0.6, 0.2);
  const leftLeg = new THREE.Mesh(legGeometry, bodyMaterial);
  leftLeg.position.set(-0.15, -0.2, 0);
  group.add(leftLeg);
  
  const rightLeg = new THREE.Mesh(legGeometry, bodyMaterial);
  rightLeg.position.set(0.15, -0.2, 0);
  group.add(rightLeg);
  
  return group;
}

// Load texture
async function loadTexture(url: string): Promise<THREE.Texture> {
  const textureLoader = new THREE.TextureLoader();
  return new Promise((resolve) => {
    textureLoader.load(url, (texture) => {
      texture.anisotropy = 16;
      resolve(texture);
    });
  });
}

// Avatar props
interface AvatarProps {
  avatar: AgentAvatar;
  colonyTheme?: ColonyTheme;
  animation?: AvatarAnimation;
  showXPEffects?: boolean;
  showNameTag?: boolean;
  onClick?: () => void;
}

export function Avatar({
  avatar,
  colonyTheme = COLONY_THEMES[avatar.colonyId] || COLONY_THEMES.alphaCentauri,
  animation = 'idle',
  showXPEffects = true,
  showNameTag = true,
  onClick
}: AvatarProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [model, setModel] = useState<THREE.Group | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Load avatar model
  useEffect(() => {
    async function loadModel() {
      // Use base model based on role
      let modelUrl = avatar.baseModel;
      if (!modelUrl) {
        // Default models based on role
        modelUrl = `/models/avatars/${avatar.role}.glb`;
      }
      
      try {
        // For now, create a simple model
        const loadedModel = await loadAvatarModel(modelUrl);
        
        // Apply colony theme colors
        loadedModel.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            if (child.material instanceof THREE.MeshStandardMaterial) {
              // Apply color scheme based on avatar's colors
              child.material.color.setHex(avatar.colorScheme.primary);
              child.material.emissive?.setHex(avatar.colorScheme.accent);
              child.material.emissiveIntensity = 0.1;
            }
          }
        });
        
        setModel(loadedModel);
        setIsLoaded(true);
      } catch (error) {
        console.error('Failed to load avatar model:', error);
        // Create a simple placeholder
        const placeholder = await loadAvatarModel('');
        setModel(placeholder);
        setIsLoaded(true);
      }
    }
    
    loadModel();
    
    return () => {
      // Cleanup
      if (model) {
        // Dispose of model resources
        model.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            if (child.geometry) child.geometry.dispose();
            if (child.material) {
              if (Array.isArray(child.material)) {
                child.material.forEach(m => m.dispose?.());
              } else {
                child.material.dispose?.();
              }
            }
          }
        });
      }
    };
  }, [avatar, colonyTheme]);

  // Apply animations
  useFrame((state, delta) => {
    if (groupRef.current && isLoaded) {
      const group = groupRef.current;
      
      // Apply colony theme modifiers
      if (colonyTheme.avatarModifiers) {
        group.scale.set(
          colonyTheme.avatarModifiers.widthScale || 1,
          colonyTheme.avatarModifiers.heightScale || 1,
          colonyTheme.avatarModifiers.widthScale || 1
        );
      }
      
      // Animate based on status
      switch (avatar.status) {
        case 'idle':
          // Gentle breathing
          group.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.02;
          break;
        case 'walking':
          // Walking animation
          group.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.05;
          group.rotation.z = Math.sin(state.clock.elapsedTime * 2) * 0.05;
          break;
        case 'running':
          // Running animation
          group.position.y = Math.sin(state.clock.elapsedTime * 3) * 0.08;
          group.rotation.z = Math.sin(state.clock.elapsedTime * 3) * 0.1;
          break;
        case 'talking':
          // Talking animation - head bobbing
          if (group.children.length > 1) {
            const head = group.children[1] as THREE.Mesh;
            if (head) {
              head.position.y = 1.2 + Math.sin(state.clock.elapsedTime * 3) * 0.03;
            }
          }
          break;
      }
      
      // Apply emotion-based effects
      switch (avatar.emotion) {
        case 'happy':
          // Slight bounce
          group.position.y += Math.sin(state.clock.elapsedTime * 2) * 0.03;
          break;
        case 'angry':
          // Red glow
          group.children.forEach(child => {
            if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
              child.material.emissive?.setHex(0xFF0000);
              child.material.emissiveIntensity = 0.3;
            }
          });
          break;
        case 'sad':
          // Slight slouch
          group.children.forEach(child => {
            if (child instanceof THREE.Mesh) {
              child.position.y -= 0.05;
            }
          });
          break;
      }
    }
  });

  // Calculate XP percentage
  const xpPercentage = Math.min((avatar.xp / avatar.xpToNextLevel) * 100, 100);
  
  if (!isLoaded) {
    // Loading placeholder
    return (
      <group position={[avatar.position.x, avatar.position.y, avatar.position.z]}>
        <mesh>
          <boxGeometry args={[0.5, 1, 0.5]} />
          <meshStandardMaterial color={0x888888} />
        </mesh>
      </group>
    );
  }

  return (
    <group
      ref={groupRef}
      position={[avatar.position.x, avatar.position.y, avatar.position.z]}
      rotation={[avatar.rotation.x, avatar.rotation.y, avatar.rotation.z]}
      onClick={onClick}
    >
      {/* Avatar model */}
      {model && <primitive object={model} />}
      
      {/* XP particle effects */}
      {showXPEffects && avatar.xp > 0 && (
        <XPParticleEffect
          position={{ x: 0, y: 1.5, z: 0 }}
          color={colonyTheme.accentColor}
          intensity={xpPercentage / 100}
        />
      )}
      
      {/* Glowing aura based on level */}
      <mesh position={[0, 0.5, 0]}>
        <sphereGeometry args={[1.2, 16, 16]} />
        <meshBasicMaterial
          color={colonyTheme.glowColor || colonyTheme.accentColor}
          transparent
          opacity={0.1 + (avatar.level / 100) * 0.2}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* Level indicator */}
      <mesh position={[0, 1.8, 0]}>
        <textGeometry args={[
          `Lv. ${avatar.level}`,
          {
            font: 'https://threejs.org/examples/fonts/helvetiker_regular.typeface.json',
            size: 0.2,
            height: 0.05
          }
        ]} />
        <meshBasicMaterial color={0xFFFFFF} />
      </mesh>
      
      {/* XP progress bar at feet */}
      {showXPEffects && (
        <group position={[0, -0.1, 0]}>
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[0.8, 0.05, 0.1]} />
            <meshBasicMaterial color={0x333333} />
          </mesh>
          <mesh position={[(xpPercentage / 100 - 0.5) * 0.8, 0.025, 0.05]}>
            <boxGeometry args={[0.8 * (xpPercentage / 100), 0.04, 0.08]} />
            <meshBasicMaterial color={colonyTheme.accentColor} />
          </mesh>
        </group>
      )}
      
      {/* Name tag */}
      {showNameTag && (
        <mesh position={[0, 1.6, 0]}>
          <textGeometry args={[
            avatar.name,
            {
              font: 'https://threejs.org/examples/fonts/helvetiker_regular.typeface.json',
              size: 0.15,
              height: 0.03
            }
          ]} />
          <meshBasicMaterial color={0xFFFFFF} />
        </mesh>
      )}
      
      {/* Role icon above head */}
      <mesh position={[0, 1.9, 0]}>
        <textGeometry args={[
          getRoleIcon(avatar.role),
          {
            font: 'https://threejs.org/examples/fonts/helvetiker_regular.typeface.json',
            size: 0.2,
            height: 0.05
          }
        ]} />
        <meshBasicMaterial color={colonyTheme.accentColor} />
      </mesh>
    </group>
  );
}

// Helper to get role icon
function getRoleIcon(role: string): string {
  const icons: Record<string, string> = {
    commander: '⚔️',
    scientist: '🔬',
    engineer: '🔧',
    soldier: '🛡️',
    diplomat: '🤝',
    scout: '🗺️',
    builder: '🏗️',
    healer: '⚕️',
    merchant: '💰',
    scholar: '📚'
  };
  return icons[role] || '❓';
}

// Avatar group component for multiple avatars
export function AvatarGroup({ 
  avatars, 
  colonyThemes = COLONY_THEMES 
}: {
  avatars: AgentAvatar[];
  colonyThemes?: Record<string, ColonyTheme>;
}) {
  return (
    <group>
      {avatars.map((avatar) => (
        <Avatar
          key={avatar.id}
          avatar={avatar}
          colonyTheme={colonyThemes[avatar.colonyId]}
        />
      ))}
    </group>
  );
}
