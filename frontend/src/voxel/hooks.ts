import { useState, useEffect, useCallback, useRef } from 'react';
import * as THREE from 'three';
import { Voxel, Chunk, VoxelWorld, ColonyVoxel, VOXEL_PALETTES } from './types';

// Custom hook for managing voxel world state
export function useVoxelWorld(initialSeed: number = Date.now()) {
  const [world, setWorld] = useState<VoxelWorld>({
    id: 'main',
    name: 'THEHIVE World',
    seed: initialSeed,
    chunks: new Map(),
    activeChunks: new Set(),
    renderDistance: 64,
    lodDistances: { 0: 8, 1: 16, 2: 32, 3: 64 }
  });

  const [palette, setPalette] = useState<keyof typeof VOXEL_PALETTES>('elderScrolls');
  const [isLoading, setIsLoading] = useState(true);

  // Load chunks around a position
  const loadChunksAround = useCallback((position: { x: number; y: number; z: number }, distance: number = 2) => {
    setIsLoading(true);
    
    // Simulate async chunk loading
    setTimeout(() => {
      const newChunks = new Map(world.chunks);
      
      for (let x = -distance; x <= distance; x++) {
        for (let y = 0; y <= 1; y++) {
          for (let z = -distance; z <= distance; z++) {
            const chunkId = `${position.x + x}-${position.y + y}-${position.z + z}`;
            
            if (!newChunks.has(chunkId)) {
              // Generate procedural chunk
              const voxels: Voxel[] = [];
              const simplex = new (require('simplex-noise').default)(world.seed);
              
              for (let vx = 0; vx < 16; vx++) {
                for (let vy = 0; vy < 16; vy++) {
                  for (let vz = 0; vz < 16; vz++) {
                    const worldX = (position.x + x) * 16 + vx;
                    const worldY = (position.y + y) * 16 + vy;
                    const worldZ = (position.z + z) * 16 + vz;
                    
                    const noise = simplex.noise3D(worldX * 0.1, worldY * 0.1, worldZ * 0.1);
                    const height = Math.floor(noise * 8 + 8);
                    
                    if (worldY <= height) {
                      let voxelType: any = 'ground';
                      if (worldY === height) voxelType = 'grass';
                      else if (worldY > height - 3) voxelType = 'ground';
                      else voxelType = 'stone';
                      
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
              
              newChunks.set(chunkId, {
                id: chunkId,
                position: { x: position.x + x, y: position.y + y, z: position.z + z },
                voxels,
                isLoaded: true,
                isRendering: true
              });
            }
          }
        }
      }
      
      setWorld({ ...world, chunks: newChunks });
      setIsLoading(false);
    }, 100);
  }, [world, palette]);

  // Modify a voxel
  const modifyVoxel = useCallback((position: { x: number; y: number; z: number }, newType: any, color?: number) => {
    setWorld(prev => {
      const newChunks = new Map(prev.chunks);
      const chunkX = Math.floor(position.x / 16);
      const chunkY = Math.floor(position.y / 16);
      const chunkZ = Math.floor(position.z / 16);
      const chunkId = `${chunkX}-${chunkY}-${chunkZ}`;
      
      const chunk = newChunks.get(chunkId);
      if (chunk) {
        const voxelIndex = chunk.voxels.findIndex(v => 
          v.position.x === position.x % 16 &&
          v.position.y === position.y % 16 &&
          v.position.z === position.z % 16
        );
        
        if (voxelIndex !== -1) {
          const newVoxels = [...chunk.voxels];
          newVoxels[voxelIndex] = {
            ...newVoxels[voxelIndex],
            type: newType,
            color: color || VOXEL_PALETTES[palette][newType] || 0xFFFFFF,
            material: newType
          };
          
          newChunks.set(chunkId, { ...chunk, voxels: newVoxels });
        }
      }
      
      return { ...prev, chunks: newChunks };
    });
  }, [palette]);

  // Add a colony voxel structure
  const addColonyStructure = useCallback((colonyId: string, position: { x: number; y: number; z: number }) => {
    // Create a simple colony core structure
    const structures = [
      { offset: { x: 0, y: 0, z: 0 }, type: 'colony_heart' as const, color: 0xFFD700 },
      { offset: { x: 1, y: 0, z: 0 }, type: 'colony_core', color: 0xFFA500 },
      { offset: { x: -1, y: 0, z: 0 }, type: 'colony_core', color: 0xFFA500 },
      { offset: { x: 0, y: 1, z: 0 }, type: 'colony_core', color: 0xFFA500 },
      { offset: { x: 0, y: -1, z: 0 }, type: 'colony_core', color: 0xFFA500 },
      { offset: { x: 0, y: 0, z: 1 }, type: 'colony_core', color: 0xFFA500 },
      { offset: { x: 0, y: 0, z: -1 }, type: 'colony_core', color: 0xFFA500 },
    ];
    
    structures.forEach(struct => {
      modifyVoxel(
        {
          x: position.x + struct.offset.x,
          y: position.y + struct.offset.y,
          z: position.z + struct.offset.z
        },
        struct.type,
        struct.color
      );
    });
  }, [modifyVoxel]);

  // Create workflow path (fairy path)
  const createWorkflowPath = useCallback((points: { x: number; y: number; z: number }[]) => {
    points.forEach((point, index) => {
      // Create a path of workflow voxels
      modifyVoxel(point, 'workflow_path', 0x00FFFF);
      
      // Add fairy sprite marker every few points
      if (index % 3 === 0) {
        modifyVoxel(
          { x: point.x, y: point.y + 1, z: point.z },
          'agent_spawn' as any,
          0xFF69B4
        );
      }
    });
  }, [modifyVoxel]);

  return {
    world,
    palette,
    setPalette,
    isLoading,
    loadChunksAround,
    modifyVoxel,
    addColonyStructure,
    createWorkflowPath
  };
}

// Hook for avatar/fairy sprites
export function useFairySprites() {
  const [fairies, setFairies] = useState<Array<{
    id: string;
    position: { x: number; y: number; z: number };
    type: string;
    color: number;
    target?: { x: number; y: number; z: number };
    speed: number;
    size: number;
  }>>([]);

  // Add a fairy for a workflow
  const addWorkflowFairy = useCallback((workflowId: string, startPos: { x: number; y: number; z: number }) => {
    const colors = [0xFF69B4, 0x00FFFF, 0x7CFC00, 0xFFD700, 0x9370DB];
    const color = colors[Math.floor(Math.random() * colors.length)];
    
    setFairies(prev => [
      ...prev,
      {
        id: `fairy-${workflowId}-${Date.now()}`,
        position: { ...startPos, y: startPos.y + 2 },
        type: 'workflow',
        color,
        speed: 0.05 + Math.random() * 0.1,
        size: 0.5 + Math.random() * 0.5
      }
    ]);
  }, []);

  // Update fairy positions (animation)
  const updateFairies = useCallback((deltaTime: number) => {
    setFairies(prev => 
      prev.map(fairy => {
        if (fairy.target) {
          // Move towards target
          const dx = fairy.target.x - fairy.position.x;
          const dy = fairy.target.y - fairy.position.y;
          const dz = fairy.target.z - fairy.position.z;
          const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
          
          if (distance < 0.1) {
            // Reached target, remove or find new target
            return null as any;
          }
          
          const moveX = (dx / distance) * fairy.speed * deltaTime;
          const moveY = (dy / distance) * fairy.speed * deltaTime;
          const moveZ = (dz / distance) * fairy.speed * deltaTime;
          
          // Add some randomness for fairy-like movement
          const wiggle = 0.5 * Math.sin(Date.now() * 0.001 + fairy.id.length);
          
          return {
            ...fairy,
            position: {
              x: fairy.position.x + moveX + (Math.random() - 0.5) * 0.01,
              y: fairy.position.y + moveY + wiggle * 0.01,
              z: fairy.position.z + moveZ + (Math.random() - 0.5) * 0.01
            }
          };
        } else {
          // Random floating movement
          return {
            ...fairy,
            position: {
              x: fairy.position.x + (Math.random() - 0.5) * 0.02,
              y: fairy.position.y + Math.sin(Date.now() * 0.001 + fairy.id.length) * 0.01,
              z: fairy.position.z + (Math.random() - 0.5) * 0.02
            }
          };
        }
      }).filter(Boolean) as any
    );
  }, []);

  // Remove fairy
  const removeFairy = useCallback((id: string) => {
    setFairies(prev => prev.filter(f => f.id !== id));
  }, []);

  return { fairies, addWorkflowFairy, updateFairies, removeFairy };
}
