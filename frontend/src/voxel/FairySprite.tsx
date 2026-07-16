import React, { useRef, useFrame } from '@react-three/fiber';
import { useFairySprites } from './hooks';
import * as THREE from 'three';

// Fairy mesh component
function FairyMesh({ 
  position, 
  color, 
  size = 1, 
  type = 'workflow' 
}: {
  position: { x: number; y: number; z: number };
  color: number;
  size?: number;
  type?: string;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const lightRef = useRef<THREE.PointLight>(null);
  
  // Fairy geometry - simple winged creature
  const geometry = useRef<THREE.BufferGeometry>(null);
  
  // Create fairy geometry
  if (!geometry.current) {
    geometry.current = new THREE.BufferGeometry();
    const vertices = new Float32Array([
      // Body (central sphere)
      0, size * 0.5, 0,
      size * 0.3, size * 0.3, 0,
      size * 0.2, 0, size * 0.3,
      size * 0.2, 0, -size * 0.3,
      -size * 0.3, size * 0.3, 0,
      -size * 0.2, 0, size * 0.3,
      -size * 0.2, 0, -size * 0.3,
      0, -size * 0.3, 0,
      
      // Wings (top)
      size * 0.5, size * 0.5, size * 0.2,
      size * 0.8, size * 0.8, 0,
      size * 0.5, size * 0.5, -size * 0.2,
      
      -size * 0.5, size * 0.5, size * 0.2,
      -size * 0.8, size * 0.8, 0,
      -size * 0.5, size * 0.5, -size * 0.2,
    ]);
    
    geometry.current.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
  }

  // Animate fairy
  useFrame((state, delta) => {
    if (meshRef.current) {
      // Gentle floating animation
      meshRef.current.position.y += Math.sin(state.clock.elapsedTime * 2 + position.x + position.z) * 0.01 * delta;
      
      // Gentle rotation
      meshRef.current.rotation.y += delta * 0.5;
      
      // Wing flapping
      if (meshRef.current.geometry) {
        const vertices = meshRef.current.geometry.attributes.position.array as Float32Array;
        // This would require morph targets for proper wing animation
        // For now, we'll use a simple scale animation
        const wingFlap = Math.sin(state.clock.elapsedTime * 5) * 0.1;
        meshRef.current.scale.set(1, 1 + wingFlap, 1);
      }
    }
    
    if (lightRef.current) {
      lightRef.current.intensity = 0.5 + Math.sin(state.clock.elapsedTime * 3) * 0.3;
    }
  });

  // Different materials based on type
  const getMaterial = () => {
    switch (type) {
      case 'workflow':
        return new THREE.MeshStandardMaterial({
          color: color,
          emissive: color,
          emissiveIntensity: 0.5,
          metalness: 0.3,
          roughness: 0.4
        });
      case 'agent':
        return new THREE.MeshStandardMaterial({
          color: color,
          emissive: color,
          emissiveIntensity: 0.3,
          metalness: 0.1,
          roughness: 0.6
        });
      default:
        return new THREE.MeshStandardMaterial({
          color: color,
          emissive: color,
          emissiveIntensity: 0.4,
          metalness: 0.2,
          roughness: 0.5
        });
    }
  };

  return (
    <group position={[position.x, position.y, position.z]}>
      <mesh ref={meshRef} geometry={geometry.current} material={getMaterial()} />
      <pointLight
        ref={lightRef}
        position={[0, size * 0.5, 0]}
        color={color}
        distance={size * 5}
        decay={2}
      />
      {/* Glow effect */}
      <mesh position={[0, size * 0.5, 0]}>
        <sphereGeometry args={[size * 0.8, 16, 16]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.2}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

// Fairy sprite system
interface FairySpriteSystemProps {
  fairies: Array<{
    id: string;
    position: { x: number; y: number; z: number };
    type: string;
    color: number;
    size: number;
  }>;
}

export function FairySpriteSystem({ fairies }: FairySpriteSystemProps) {
  return (
    <group>
      {fairies.map((fairy) => (
        <FairyMesh
          key={fairy.id}
          position={fairy.position}
          color={fairy.color}
          size={fairy.size}
          type={fairy.type}
        />
      ))}
    </group>
  );
}

// Particle effect for XP/aura
export function XPParticleEffect({ 
  position, 
  color = 0xFFD700, 
  intensity = 1 
}: {
  position: { x: number; y: number; z: number };
  color?: number;
  intensity?: number;
}) {
  const particles = 20;
  const particleRefs = useRef<THREE.Mesh[]>([]);

  useFrame((state) => {
    particleRefs.current.forEach((particle, index) => {
      if (particle) {
        const time = state.clock.elapsedTime + index * 0.5;
        particle.position.x = position.x + Math.sin(time * 2) * 0.5;
        particle.position.y = position.y + Math.sin(time * 1.5) * 0.5 + 0.5;
        particle.position.z = position.z + Math.cos(time * 2) * 0.5;
        particle.scale.set(
          0.1 + Math.sin(time * 3) * 0.05,
          0.1 + Math.sin(time * 3) * 0.05,
          0.1 + Math.sin(time * 3) * 0.05
        );
      }
    });
  });

  return (
    <group position={[position.x, position.y, position.z]}>
      {Array.from({ length: particles }).map((_, i) => (
        <mesh
          key={i}
          ref={(el) => (particleRefs.current[i] = el as THREE.Mesh)}
          position={[0, 0, 0]}
        >
          <sphereGeometry args={[0.1, 8, 8]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={0.8}
          />
        </mesh>
      ))}
      {/* Central glow */}
      <pointLight
        position={[0, 0.5, 0]}
        color={color}
        distance={2}
        intensity={intensity}
        decay={2}
      />
    </group>
  );
}
