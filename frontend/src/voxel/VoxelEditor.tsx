/**
 * Voxel Editor Component for THEHIVE
 * Minecraft-style building interface
 */
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Environment, Center } from '@react-three/drei';
import * as THREE from 'three';

import { worldEditorManager } from './WorldEditorManager';
import { EditorMode, EditorTool, EditorState, PALETTES } from './editor-types';
import { VoxelType, Position3D, VoxelWorld } from './types';

interface VoxelEditorProps {
  world: VoxelWorld;
  onSave?: () => void;
  onClose?: () => void;
}

const VOXEL_COLORS: Record<VoxelType, number> = {
  air: 0x000000,
  ground: 0x8B4513,
  stone: 0x696969,
  wood: 0x8B4513,
  metal: 0xC0C0C0,
  glass: 0x87CEEB,
  water: 0x4169E1,
  lava: 0xFF4500,
  grass: 0x228B22,
  sand: 0xF4A460,
  ice: 0xADD8E6,
  colony_core: 0xFFD700,
  memory_node: 0x9370DB,
  workflow_path: 0xFF69B4,
  agent_spawn: 0x7B68EE,
  portal: 0x00FFFF,
};

const VoxelPreview: React.FC<{ type: VoxelType; size?: number }> = ({ type, size = 1 }) => {
  return (
    <mesh>
      <boxGeometry args={[size, size, size]} />
      <meshStandardMaterial color={VOXEL_COLORS[type] || 0xFFFFFF} />
    </mesh>
  );
};

const VoxelGrid: React.FC<{ size: number; color?: number }> = ({ size, color = 0x333333 }) => {
  const { scene } = useThree();
  
  useEffect(() => {
    const grid = new THREE.GridHelper(size, size, color, color);
    scene.add(grid);
    return () => scene.remove(grid);
  }, [scene, size, color]);
  
  return null;
};

const Toolbar: React.FC<{ state: EditorState; onModeChange: (mode: EditorMode) => void; onToolChange: (tool: EditorTool) => void }> = ({ state, onModeChange, onToolChange }) => {
  const modes: EditorMode[] = ['build', 'delete', 'select', 'paint'];
  const tools: EditorTool[] = ['brush', 'fill', 'line', 'circle', 'rectangle'];
  
  return (
    <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
        <div style={{ fontSize: '10px', color: '#aaa' }}>Mode</div>
        {modes.map(mode => (
          <button key={mode} onClick={() => onModeChange(mode)} style={{
            padding: '6px 12px',
            background: state.mode === mode ? '#0f3460' : '#1a1a2e',
            border: 'none',
            borderRadius: '4px',
            color: '#fff',
            cursor: 'pointer',
            fontSize: '11px'
          }}>
            {mode}
          </button>
        ))}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
        <div style={{ fontSize: '10px', color: '#aaa' }}>Tool</div>
        {tools.map(tool => (
          <button key={tool} onClick={() => onToolChange(tool)} style={{
            padding: '6px 12px',
            background: state.tool === tool ? '#0f3460' : '#1a1a2e',
            border: 'none',
            borderRadius: '4px',
            color: '#fff',
            cursor: 'pointer',
            fontSize: '11px'
          }}>
            {tool}
          </button>
        ))}
      </div>
    </div>
  );
};

const VoxelPalette: React.FC<{ selectedType: VoxelType; onSelect: (type: VoxelType) => void }> = ({ selectedType, onSelect }) => {
  const types = worldEditorManager.getAvailableTypes();
  
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '5px' }}>
      {types.map(type => (
        <button key={type} onClick={() => onSelect(type)} style={{
          padding: '8px',
          background: selectedType === type ? '#0f3460' : '#1a1a2e',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '4px'
        }}>
          <div style={{ width: '20px', height: '20px', background: VOXEL_COLORS[type] || '#FFF', borderRadius: '2px' }} />
          <span style={{ fontSize: '10px', color: '#aaa' }}>{type}</span>
        </button>
      ))}
    </div>
  );
};

export const VoxelEditor: React.FC<VoxelEditorProps> = ({ world, onSave, onClose }) => {
  const [state, setState] = useState<EditorState>(worldEditorManager.getState());
  const [hoveredPosition, setHoveredPosition] = useState<Position3D | null>(null);
  const [showToolbar, setShowToolbar] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    worldEditorManager.initialize(world);
    
    const unsubscribe = worldEditorManager.onEvent(event => {
      setState(worldEditorManager.getState());
    });
    
    return () => {
      worldEditorManager.deactivate();
      unsubscribe();
    };
  }, [world]);

  const handleModeChange = useCallback((mode: EditorMode) => {
    worldEditorManager.setMode(mode);
  }, []);

  const handleToolChange = useCallback((tool: EditorTool) => {
    worldEditorManager.setTool(tool);
  }, []);

  const handleVoxelTypeChange = useCallback((type: VoxelType) => {
    worldEditorManager.setVoxelType(type);
  }, []);

  const handleBrushSizeChange = useCallback((delta: number) => {
    worldEditorManager.setBrushSize(state.brushSize + delta);
    setState(worldEditorManager.getState());
  }, [state.brushSize]);

  const handleSave = useCallback(() => {
    worldEditorManager.saveWorld();
    if (onSave) onSave();
  }, [onSave]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (worldEditorManager.handleHotkey(e.key)) {
      e.preventDefault();
      setState(worldEditorManager.getState());
    }
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const handleCanvasClick = useCallback((e: any) => {
    if (!canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width * 2 - 1;
    const y = -(e.clientY - rect.top) / rect.height * 2 + 1;
    
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2(x, y);
    raycaster.setFromCamera(mouse, e.camera);
    
    const intersects = raycaster.intersectObjects(e.scene.children, true);
    if (intersects.length > 0) {
      const point = intersects[0].point;
      const position: Position3D = {
        x: Math.round(point.x),
        y: Math.round(point.y),
        z: Math.round(point.z)
      };
      
      switch (state.mode) {
        case 'build':
          worldEditorManager.placeVoxel(position, state.selectedVoxelType, state.color);
          break;
        case 'delete':
          worldEditorManager.removeVoxel(position);
          break;
        case 'select':
          worldEditorManager.selectVoxel(position, e.ctrlKey || e.metaKey);
          break;
        case 'paint':
          const voxel = worldEditorManager.getVoxelAt(position);
          if (voxel) {
            worldEditorManager.modifyVoxel(position, { color: state.color });
          }
          break;
      }
      
      setState(worldEditorManager.getState());
    }
  }, [state.mode, state.selectedVoxelType, state.color]);

  const handleCanvasMove = useCallback((e: any) => {
    if (!canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width * 2 - 1;
    const y = -(e.clientY - rect.top) / rect.height * 2 + 1;
    
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2(x, y);
    raycaster.setFromCamera(mouse, e.camera);
    
    const intersects = raycaster.intersectObjects(e.scene.children, true);
    if (intersects.length > 0) {
      const point = intersects[0].point;
      setHoveredPosition({
        x: Math.round(point.x),
        y: Math.round(point.y),
        z: Math.round(point.z)
      });
    } else {
      setHoveredPosition(null);
    }
  }, []);

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    height: '100%',
    background: '#1a1a2e',
    color: '#fff',
    padding: '10px',
    gap: '10px'
  };

  const sidebarStyle: React.CSSProperties = {
    width: '250px',
    background: '#16213e',
    borderRadius: '8px',
    padding: '15px',
    display: 'flex',
    flexDirection: 'column',
    gap: '15px'
  };

  const canvasContainerStyle: React.CSSProperties = {
    flex: 1,
    background: '#0f3460',
    borderRadius: '8px',
    position: 'relative'
  };

  return (
    <div style={containerStyle}>
      <div style={sidebarStyle}>
        <h3 style={{ margin: 0, marginBottom: '10px' }}>Voxel Editor</h3>
        
        <Toolbar state={state} onModeChange={handleModeChange} onToolChange={handleToolChange} />
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div>
            <div style={{ fontSize: '12px', color: '#aaa', marginBottom: '5px' }}>Brush Size</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button onClick={() => handleBrushSizeChange(-1)} style={{ padding: '5px 10px', background: '#1a1a2e', border: 'none', borderRadius: '4px', color: '#fff', cursor: 'pointer' }}>-</button>
              <span>{state.brushSize}</span>
              <button onClick={() => handleBrushSizeChange(1)} style={{ padding: '5px 10px', background: '#1a1a2e', border: 'none', borderRadius: '4px', color: '#fff', cursor: 'pointer' }}>+</button>
            </div>
          </div>
          
          <div>
            <div style={{ fontSize: '12px', color: '#aaa', marginBottom: '5px' }}>Voxel Type</div>
            <VoxelPalette selectedType={state.selectedVoxelType} onSelect={handleVoxelTypeChange} />
          </div>
          
          <div>
            <div style={{ fontSize: '12px', color: '#aaa', marginBottom: '5px' }}>Color</div>
            <input type="color" value={'#' + state.color.toString(16).padStart(6, '0')} onChange={(e) => worldEditorManager.setColor(parseInt(e.target.value.replace('#', ''), 16))} 
              style={{ width: '100%', height: '30px', background: 'transparent', border: '1px solid #0f3460', borderRadius: '4px', cursor: 'pointer' }} />
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '10px', marginTop: 'auto' }}>
          <button onClick={handleSave} style={{ flex: 1, padding: '10px', background: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Save</button>
          <button onClick={() => worldEditorManager.undo()} style={{ padding: '10px', background: '#666', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Undo</button>
          <button onClick={() => worldEditorManager.redo()} style={{ padding: '10px', background: '#666', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Redo</button>
        </div>
        
        {onClose && <button onClick={onClose} style={{ padding: '10px', background: '#f44336', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', width: '100%' }}>Close Editor</button>}
      </div>
      
      <div style={canvasContainerStyle}>
        <Canvas camera={{ position: [5, 5, 5], fov: 50 }} onClick={handleCanvasClick} onPointerMove={handleCanvasMove} ref={canvasRef}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          <Environment preset="city" />
          <OrbitControls makeDefault />
          
          {state.showGrid && <VoxelGrid size={50} />}
          
          {Array.from(world.chunks.values()).map(chunk => (
            chunk.voxels.map(voxel => (
              <VoxelPreview key={voxel.id} type={voxel.type} />
            ))
          ))}
          
          {hoveredPosition && state.mode === 'build' && (
            <mesh position={[hoveredPosition.x, hoveredPosition.y, hoveredPosition.z]}>
              <boxGeometry args={[1, 1, 1]} />
              <meshStandardMaterial color={0xFFFFFF} transparent opacity={0.5} />
            </mesh>
          )}
        </Canvas>
        
        {hoveredPosition && (
          <div style={{ position: 'absolute', bottom: '10px', left: '10px', background: 'rgba(0,0,0,0.8)', padding: '5px 10px', borderRadius: '4px', fontSize: '12px' }}>
            {hoveredPosition.x}, {hoveredPosition.y}, {hoveredPosition.z}
          </div>
        )}
      </div>
    </div>
  );
};

export default VoxelEditor;