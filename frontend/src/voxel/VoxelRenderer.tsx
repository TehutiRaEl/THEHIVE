import React, { useRef, useEffect, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { Voxel, Chunk, LOD_CONFIG, VOXEL_PALETTES } from './types';

// Voxel geometry cache
const voxelGeometryCache = new Map<string, THREE.BoxGeometry>();
const voxelMaterialCache = new Map<string, THREE.Material>();

function getVoxelGeometry(size: number): THREE.BoxGeometry {
  const key = `voxel-${size}`;
  if (!voxelGeometryCache.has(key)) {
    voxelGeometryCache.set(key, new THREE.BoxGeometry(size, size, size));
  }
  return voxelGeometryCache.get(key)!;
}

function getVoxelMaterial(color: number, type: string): THREE.Material {
  const key = `material-${color}-${type}`;
  if (!voxelMaterialCache.has(key)) {
    let material: THREE.Material;
    
    switch (type) {
      case 'glass':
        material = new THREE.MeshPhysicalMaterial({
          color: color,
          transparent: true,
          opacity: 0.7,
          transmission: 0.9,
          roughness: 0.1,
          metalness: 0.0,
        });
        break;
      case 'water':
        material = new THREE.MeshStandardMaterial({
          color: color,
          transparent: true,
          opacity: 0.8,
          roughness: 0.0,
          metalness: 0.1,
        });
        break;
      case 'metal':
        material = new THREE.MeshStandardMaterial({
          color: color,
          metalness: 0.9,
          roughness: 0.2,
        });
        break;
      default:
        material = new THREE.MeshStandardMaterial({
          color: color,
          roughness: 0.8,
          metalness: 0.2,
        });
    }
    
    voxelMaterialCache.set(key, material);
  }
  return voxelMaterialCache.get(key)!;
}

interface VoxelMeshProps {
  voxel: Voxel;
  palette: keyof typeof VOXEL_PALETTES;
}

function VoxelMesh({ voxel, palette }: VoxelMeshProps) {
  const { size } = LOD_CONFIG[`LEVEL_${voxel.lodLevel}` as keyof typeof LOD_CONFIG];
  const color = voxel.color || VOXEL_PALETTES[palette][voxel.type] || 0xFFFFFF;
  const geometry = getVoxelGeometry(size);
  const material = getVoxelMaterial(color, voxel.type);

  return (
    <mesh
      geometry={geometry}
      material={material}
      position={[voxel.position.x * size, voxel.position.y * size, voxel.position.z * size]}
      castShadow
      receiveShadow
    />
  );
}

interface ChunkMeshProps {
  chunk: Chunk;
  palette: keyof typeof VOXEL_PALETTES;
}

function ChunkMesh({ chunk, palette }: ChunkMeshProps) {
  return (
    <group
      position={[
        chunk.position.x * 16,
        chunk.position.y * 16,
        chunk.position.z * 16
      ]}
    >
      {chunk.voxels.map((voxel) => (
        <VoxelMesh key={`${voxel.id}-${voxel.lodLevel}`} voxel={voxel} palette={palette} />
      ))}
    </group>
  );
}

interface VoxelWorldProps {
  world: {
    chunks: Chunk[];
    palette: keyof typeof VOXEL_PALETTES;
  };
  cameraPosition?: [number, number, number];
  showGrid?: boolean;
  showAxes?: boolean;
}

export function VoxelWorld({
  world,
  cameraPosition = [0, 20, 30],
  showGrid = false,
  showAxes = false
}: VoxelWorldProps) {
  return (
    <Canvas
      shadows
      camera={{ position: cameraPosition, fov: 60 }}
      gl={{ antialias: true, alpha: true }}
    >
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[10, 20, 10]}
        intensity={1}
        castShadow
        shadow-mapSize={[2048, 2048]}
      />
      <directionalLight position={[-10, -20, -10]} intensity={0.3} />
      
      <Environment preset="city" />
      
      <OrbitControls
        enableDamping
        dampingFactor={0.05}
        minDistance={5}
        maxDistance={200}
      />
      
      {showGrid && (
        <gridHelper args={[100, 100, 0x333333, 0x333333]} />
      )}
      
      {showAxes && (
        <axesHelper args={[5]} />
      )}
      
      {world.chunks.map((chunk) => (
        <ChunkMesh key={chunk.id} chunk={chunk} palette={world.palette} />
      ))}
    </Canvas>
  );
}

// LOD-aware voxel world renderer
interface LODVoxelWorldProps {
  world: {
    chunks: Chunk[];
    palette: keyof typeof VOXEL_PALETTES;
    cameraPosition: { x: number; y: number; z: number };
  };
  renderDistance: number;
}

export function LODVoxelWorld({ world, renderDistance = 64 }: LODVoxelWorldProps) {
  const { camera } = useThree();
  
  // Calculate LOD for each chunk based on distance from camera
  const chunksWithLOD = useMemo(() => {
    return world.chunks.map(chunk => {
      const distance = Math.sqrt(
        Math.pow(chunk.position.x * 16 - camera.position.x, 2) +
        Math.pow(chunk.position.y * 16 - camera.position.y, 2) +
        Math.pow(chunk.position.z * 16 - camera.position.z, 2)
      );
      
      let lodLevel = 0;
      if (distance > LOD_CONFIG.LEVEL_3.distance) {
        return null; // Don't render
      } else if (distance > LOD_CONFIG.LEVEL_2.distance) {
        lodLevel = 3;
      } else if (distance > LOD_CONFIG.LEVEL_1.distance) {
        lodLevel = 2;
      } else if (distance > LOD_CONFIG.LEVEL_0.distance) {
        lodLevel = 1;
      }
      
      // Update voxel LOD levels
      const chunkWithLOD = {
        ...chunk,
        voxels: chunk.voxels.map(v => ({
          ...v,
          lodLevel
        }))
      };
      
      return chunkWithLOD;
    }).filter(Boolean) as Chunk[];
  }, [world.chunks, camera.position]);

  return (
    <Canvas
      shadows
      camera={{ position: [world.cameraPosition.x, world.cameraPosition.y, world.cameraPosition.z], fov: 60 }}
      gl={{ antialias: true, alpha: true }}
    >
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[10, 20, 10]}
        intensity={1}
        castShadow
        shadow-mapSize={[2048, 2048]}
      />
      
      <Environment preset="city" />
      
      <OrbitControls
        enableDamping
        dampingFactor={0.05}
        minDistance={5}
        maxDistance={renderDistance * 2}
      />
      
      {chunksWithLOD.map((chunk) => (
        <ChunkMesh key={`${chunk.id}-${chunk.voxels[0]?.lodLevel}`} chunk={chunk} palette={world.palette} />
      ))}
    </Canvas>
  );
}

// Utility to generate procedural voxel world
export function generateProceduralWorld(
  seed: number,
  size: number = 32,
  palette: keyof typeof VOXEL_PALETTES = 'elderScrolls'
): { chunks: Chunk[]; palette: keyof typeof VOXEL_PALETTES } {
  const chunks: Chunk[] = [];
  const simplex = new (require('simplex-noise').default)(seed);
  
  for (let x = -size; x < size; x++) {
    for (let y = 0; y < 4; y++) {
      for (let z = -size; z < size; z++) {
        const chunkId = `${x}-${y}-${z}`;
        const voxels: Voxel[] = [];
        
        for (let vx = 0; vx < 16; vx++) {
          for (let vy = 0; vy < 16; vy++) {
            for (let vz = 0; vz < 16; vz++) {
              const worldX = x * 16 + vx;
              const worldY = y * 16 + vy;
              const worldZ = z * 16 + vz;
              
              // Simple terrain generation
              const noise = simplex.noise3D(worldX * 0.1, worldY * 0.1, worldZ * 0.1);
              const height = Math.floor(noise * 8 + 8);
              
              if (worldY <= height) {
                let voxelType: VoxelType = 'ground';
                if (worldY === height) {
                  voxelType = 'grass';
                } else if (worldY > height - 3) {
                  voxelType = 'ground';
                } else if (worldY > height - 6) {
                  voxelType = 'stone';
                } else {
                  voxelType = Math.random() > 0.7 ? 'stone' : 'ground';
                }
                
                voxels.push({
                  id: `${worldX}-${worldY}-${worldZ}`,
                  type: voxelType,
                  position: { x: vx, y: vy, z: vz },
                  color: VOXEL_PALETTES[palette][voxelType] || 0xFFFFFF,
                  material: voxelType,
                  lodLevel: 0
                });
              }
            }
          }
        }
        
        if (voxels.length > 0) {
          chunks.push({
            id: chunkId,
            position: { x, y, z },
            voxels,
            isLoaded: true,
            isRendering: true
          });
        }
      }
    }
  }
  
  return { chunks, palette };
}
