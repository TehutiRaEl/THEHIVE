---
name: "MemoryGraph"
title: "Memory Graph Component"
type: "react"
---

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import * as THREE from 'three';

interface MemoryNode {
  id: string;
  title: string;
  type: 'system' | 'user' | 'agent' | 'event';
  position: { x: number; y: number; z: number };
  connections: string[];
  size: number;
}

interface MemoryGraphProps {
  memories: MemoryNode[];
  onNodeSelect: (nodeId: string) => void;
  onNodeDoubleClick: (nodeId: string) => void;
}

const nodeColors: Record<string, string> = {
  system: '#ef4444',
  user: '#3b82f6',
  agent: '#10b981',
  event: '#f59e0b'
};

// 3D Node Component
function MemoryNode3D({ node, onClick, onDoubleClick, selected }: { 
  node: MemoryNode; 
  onClick: () => void; 
  onDoubleClick: () => void;
  selected: boolean
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.001;
      meshRef.current.rotation.y += 0.001;
    }
  });
  
  const color = nodeColors[node.type] || '#9333ea';
  const scale = selected ? 1.2 : hovered ? 1.1 : 1;
  
  return (
    <group 
      position={[node.position.x, node.position.y, node.position.z]}
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      onDoubleClick={(e) => { e.stopPropagation(); onDoubleClick(); }}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* Glow Effect */}
      <pointLight 
        position={[0, 0, 0]} 
        color={color} 
        intensity={selected ? 2 : hovered ? 1 : 0.5} 
        distance={20}
      />
      
      {/* Node Sphere */}
      <mesh ref={meshRef} scale={[scale, scale, scale]}>
        <sphereGeometry args={[node.size * 0.3, 32, 32]} />
        <meshStandardMaterial 
          color={color} 
          emissive={color} 
          emissiveIntensity={selected ? 0.5 : 0.2}
          metalness={0.6}
          roughness={0.3}
        />
      </mesh>
      
      {/* Selection Ring */}
      {selected && (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[node.size * 0.4, 0.02, 16, 64]} />
          <meshStandardMaterial 
            color="#ffffff" 
            emissive="#ffffff" 
            emissiveIntensity={0.8}
          />
        </mesh>
      )}
      
      {/* Label */}
      <Html center distanceFactor={10} occlude="blending">
        <div style={{
          color: '#fff',
          fontSize: 12,
          fontWeight: 'bold',
          textAlign: 'center',
          textShadow: '0 0 10px rgba(0,0,0,0.8)',
          background: 'rgba(0,0,0,0.5)',
          padding: '4px 8px',
          borderRadius: 4,
          whiteSpace: 'nowrap'
        }}>
          {node.title}
        </div>
      </Html>
    </group>
  );
}

// Connection Line Component
function ConnectionLine({ from, to }: { from: THREE.Vector3; to: THREE.Vector3 }) {
  const lineRef = useRef<THREE.Line>(null);
  
  useEffect(() => {
    if (lineRef.current) {
      const geometry = new THREE.BufferGeometry();
      const positions = [from.x, from.y, from.z, to.x, to.y, to.z];
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
      lineRef.current.geometry = geometry;
    }
  }, [from, to]);
  
  return (
    <line ref={lineRef}>
      <lineBasicMaterial color="#666688" transparent opacity={0.3} />
    </line>
  );
}

// Graph Scene
function MemoryGraphScene({ 
  memories, 
  selectedNode, 
  onNodeSelect, 
  onNodeDoubleClick 
}: { 
  memories: MemoryNode[]; 
  selectedNode: string | null;
  onNodeSelect: (id: string) => void; 
  onNodeDoubleClick: (id: string) => void
}) {
  const { camera } = useThree();
  
  useEffect(() => {
    camera.position.set(0, 0, 30);
    camera.lookAt(0, 0, 0);
  }, [camera]);
  
  // Build connection lines
  const connections: Array<{ from: THREE.Vector3; to: THREE.Vector3 }> = [];
  memories.forEach(node => {
    node.connections.forEach(targetId => {
      const target = memories.find(n => n.id === targetId);
      if (target) {
        connections.push({
          from: new THREE.Vector3(node.position.x, node.position.y, node.position.z),
          to: new THREE.Vector3(target.position.x, target.position.y, target.position.z)
        });
      }
    });
  });
  
  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[0, 0, 0]} color="#ffffff" intensity={1} distance={100} />
      <Environment preset="matrix" />
      <OrbitControls 
        enableZoom={true} 
        enablePan={true} 
        enableRotate={true}
        minDistance={5}
        maxDistance={100}
      />
      
      {/* Connection Lines */}
      {connections.map((conn, i) => (
        <ConnectionLine key={i} from={conn.from} to={conn.to} />
      ))}
      
      {/* Nodes */}
      {memories.map(node => (
        <MemoryNode3D
          key={node.id}
          node={node}
          onClick={() => onNodeSelect(node.id)}
          onDoubleClick={() => onNodeDoubleClick(node.id)}
          selected={selectedNode === node.id}
        />
      ))}
    </>
  );
}

export default function MemoryGraph({ memories, onNodeSelect, onNodeDoubleClick }: MemoryGraphProps) {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [layout, setLayout] = useState<'grid' | 'force' | 'tree'>('force');

  const selected = memories.find(m => m.id === selectedNode);

  const handleNodeSelect = (nodeId: string) => {
    setSelectedNode(nodeId);
    onNodeSelect(nodeId);
  };

  const handleNodeDoubleClick = (nodeId: string) => {
    onNodeDoubleClick(nodeId);
  };

  // Generate positions based on layout
  const positionedMemories = memories.map((node, index) => {
    switch (layout) {
      case 'grid':
        const row = Math.floor(index / 5);
        const col = index % 5;
        return { ...node, position: { x: col * 8 - 20, y: row * 8 - 20, z: 0 } };
      case 'tree':
        return { ...node, position: { x: Math.cos(index * 0.5) * 15, y: Math.sin(index * 0.5) * 10, z: 0 } };
      default: // force
        return { ...node, position: { x: Math.random() * 40 - 20, y: Math.random() * 30 - 15, z: Math.random() * 20 - 10 } };
    }
  });

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="rounded-2xl bg-gradient-to-b from-slate-800/80 to-slate-900/90 border border-slate-600/50 overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-slate-600/50 bg-gradient-to-r from-purple-900/20 to-indigo-900/20">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center">
            <span className="text-xl">🧠</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Memory Graph</h2>
            <p className="text-sm text-slate-300">{memories.length} memories • {memories.reduce((sum, m) => sum + m.connections.length, 0)} connections</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <select 
            value={layout}
            onChange={(e) => setLayout(e.target.value as any)}
            className="px-3 py-2 bg-slate-700/50 border border-slate-600/30 rounded-lg text-sm text-white focus:outline-none focus:border-purple-500/50"
          >
            <option value="force">Force Layout</option>
            <option value="grid">Grid Layout</option>
            <option value="tree">Tree Layout</option>
          </select>
        </div>
      </div>

      {/* 3D Graph View */}
      <div className="relative h-[600px] w-full bg-gradient-to-br from-slate-900 to-purple-900/20">
        <Canvas camera={{ position: [0, 0, 30], fov: 60 }}>
          <MemoryGraphScene
            memories={positionedMemories}
            selectedNode={selectedNode}
            onNodeSelect={handleNodeSelect}
            onNodeDoubleClick={handleNodeDoubleClick}
          />
        </Canvas>
        
        {/* Controls Help */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-slate-800/80 backdrop-blur-md rounded-lg px-4 py-2">
          <p className="text-xs text-slate-300">
            Drag to rotate | Scroll to zoom | Click to select | Double-click to open
          </p>
        </div>
      </div>

      {/* Selected Node Details */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="p-6 border-t border-slate-600/50 bg-slate-800/50"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">📄</span>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white mb-2">{selected.title}</h3>
                <div className="flex items-center gap-4 text-sm">
                  <span className="px-3 py-1 rounded-full bg-slate-700/50 text-slate-300">
                    {selected.type}
                  </span>
                  <span className="text-slate-400">ID: {selected.id}</span>
                </div>
                <p className="text-slate-300 mt-3">
                  Connected to {selected.connections.length} other {selected.connections.length === 1 ? 'memory' : 'memories'}
                </p>
              </div>
            </div>
            
            {/* Connections List */}
            {selected.connections.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-semibold text-slate-300 mb-2">Connections:</h4>
                <div className="flex flex-wrap gap-2">
                  {selected.connections.map(id => {
                    const connected = memories.find(m => m.id === id);
                    return connected ? (
                      <span 
                        key={id}
                        className="px-3 py-1 rounded-lg bg-slate-700/50 text-sm text-purple-300 border border-purple-500/20"
                      >
                        {connected.title}
                      </span>
                    ) : null;
                  })}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
