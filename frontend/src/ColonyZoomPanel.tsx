---
name: "ColonyZoomPanel"
title: "Colony Zoom Panel Component"
type: "react"
---

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, PerspectiveCamera, Html } from '@react-three/drei';
import * as THREE from 'three';

interface ColonyZoomPanelProps {
  colonyId: string;
  colonyName: string;
  buildings: Array<{
    id: string;
    type: 'house' | 'workshop' | 'farm' | 'mine' | 'tower' | 'wall';
    position: { x: number; y: number; z: number };
    level: number;
    health: number;
    maxHealth: number;
  }>;
  onClose: () => void;
  onBuildingSelect: (buildingId: string) => void;
}

// 3D Building Component
function ColonyBuilding({ building, onClick }: { building: any; onClick: () => void }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  const buildingColors: Record<string, string> = {
    house: '#4CAF50',
    workshop: '#2196F3',
    farm: '#FFC107',
    mine: '#9C27B0',
    tower: '#FF5722',
    wall: '#795548'
  };
  
  const color = buildingColors[building.type] || '#9E9E9E';
  const healthPercent = (building.health / building.maxHealth) * 100;
  
  return (
    <group position={[building.position.x, 0, building.position.z]} onClick={onClick}>
      {/* Building Mesh */}
      <mesh ref={meshRef}>
        <boxGeometry args={[2, building.level * 0.5 + 1, 2]} />
        <meshStandardMaterial 
          color={color} 
          transparent 
          opacity={0.9}
          metalness={0.3}
          roughness={0.7}
        />
      </mesh>
      
      {/* Health Bar */}
      <Html center distanceFactor={10} occlude="blending">
        <div style={{
          position: 'absolute',
          top: -30,
          left: -25,
          width: 50,
          height: 4,
          background: '#333',
          borderRadius: 2
        }}>
          <div style={{
            width: `${healthPercent}%`,
            height: '100%',
            background: healthPercent > 50 ? '#4CAF50' : healthPercent > 25 ? '#FFC107' : '#F44336',
            borderRadius: 2,
            transition: 'width 0.3s'
          }} />
        </div>
        <div style={{
          position: 'absolute',
          top: -25,
          left: -30,
          fontSize: 10,
          color: '#fff',
          textShadow: '0 0 2px #000',
          fontWeight: 'bold'
        }}>
          Lv.{building.level}
        </div>
      </Html>
    </group>
  );
}

// Colony Scene
function ColonyScene({ buildings, onBuildingSelect }: { buildings: any[]; onBuildingSelect: (id: string) => void }) {
  const { camera, gl } = useThree();
  
  useEffect(() => {
    camera.position.set(0, 15, 20);
    camera.lookAt(0, 0, 0);
    gl.setSize(window.innerWidth, window.innerHeight);
  }, [camera, gl]);
  
  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight 
        position={[10, 20, 10]} 
        intensity={1} 
        castShadow 
      />
      <directionalLight 
        position={[-10, -10, -10]} 
        intensity={0.3}
      />
      <Environment preset="city" />
      <OrbitControls 
        enableZoom={true} 
        enablePan={true} 
        enableRotate={true}
        minDistance={5}
        maxDistance={50}
        maxPolarAngle={Math.PI / 2.5}
      />
      <Grid 
        args={[50, 50]}
        cellSize={1}
        cellThickness={0.5}
        cellColor="#6E6E6E"
        sectionSize={5}
        sectionThickness={1}
        sectionColor="#9D9D9D"
        fadeDistance={30}
        fadeStrength={1}
        followCamera={false}
        infiniteGrid={true}
      />
      
      {/* Render Buildings */}
      {buildings.map(building => (
        <ColonyBuilding
          key={building.id}
          building={building}
          onClick={() => onBuildingSelect(building.id)}
        />
      ))}
      
      {/* Center Marker */}
      <mesh position={[0, 0.1, 0]}>
        <cylinderGeometry args={[0.5, 0.5, 0.2, 32]} />
        <meshStandardMaterial color="#FFD700" metalness={0.8} roughness={0.2} />
      </mesh>
    </>
  );
}

export default function ColonyZoomPanel({ colonyId, colonyName, buildings, onClose, onBuildingSelect }: ColonyZoomPanelProps) {
  const [selectedBuilding, setSelectedBuilding] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);

  const selected = buildings.find(b => b.id === selectedBuilding);

  const handleBuildingSelect = (buildingId: string) => {
    setSelectedBuilding(buildingId);
    onBuildingSelect(buildingId);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md"
      >
        {/* Header */}
        <div className="absolute top-4 left-4 right-4 z-10">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between p-4 rounded-xl bg-slate-800/90 backdrop-blur-md border border-slate-600"
          >
            <div>
              <h2 className="text-xl font-bold text-white">{colonyName}</h2>
              <p className="text-sm text-slate-400">Colony ID: {colonyId}</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-slate-700/50 rounded-lg px-3 py-1">
                <button 
                  onClick={() => setZoomLevel(Math.max(0.5, zoomLevel - 0.25))}
                  className="text-white hover:text-cyan-400 transition-colors"
                >-</button>
                <span className="text-sm text-white">Zoom: {Math.round(zoomLevel * 100)}%</span>
                <button 
                  onClick={() => setZoomLevel(Math.min(2, zoomLevel + 0.25))}
                  className="text-white hover:text-cyan-400 transition-colors"
                >+</button>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg bg-red-600/30 hover:bg-red-600/50 text-red-400 transition-colors"
              >
                <span className="text-xl">×</span>
              </button>
            </div>
          </motion.div>
        </div>

        {/* 3D Colony View */}
        <div className="w-full h-full">
          <Canvas camera={{ position: [0, 15, 20], fov: 60 }}>
            <ColonyScene 
              buildings={buildings} 
              onBuildingSelect={handleBuildingSelect}
            />
          </Canvas>
        </div>

        {/* Building Info Panel */}
        <AnimatePresence>
          {selected && (
            <motion.div
              initial={{ opacity: 0, x: -300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -300 }}
              className="absolute left-4 top-20 bottom-4 w-72 bg-slate-800/90 backdrop-blur-md rounded-xl border border-slate-600 p-4 overflow-y-auto"
            >
              <h3 className="text-lg font-bold text-white mb-4">Building Details</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Type:</span>
                  <span className="text-white font-medium">{selected.type}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Level:</span>
                  <span className="text-cyan-400 font-bold">Lv. {selected.level}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Health:</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-green-500 rounded-full"
                        style={{ width: `${(selected.health / selected.maxHealth) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm text-white">{selected.health}/{selected.maxHealth}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Position:</span>
                  <span className="text-white text-sm">({selected.position.x}, {selected.position.z})</span>
                </div>
              </div>
              
              <div className="mt-6 pt-4 border-t border-slate-600">
                <h4 className="text-sm font-semibold text-slate-300 mb-3">Actions</h4>
                <div className="space-y-2">
                  <button className="w-full py-2 px-3 bg-cyan-600/30 hover:bg-cyan-600/50 text-cyan-300 rounded-lg transition-colors text-sm">Upgrade</button>
                  <button className="w-full py-2 px-3 bg-orange-600/30 hover:bg-orange-600/50 text-orange-300 rounded-lg transition-colors text-sm">Repair</button>
                  <button className="w-full py-2 px-3 bg-red-600/30 hover:bg-red-600/50 text-red-300 rounded-lg transition-colors text-sm">Demolish</button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Controls Help */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-slate-800/80 backdrop-blur-md rounded-lg px-4 py-2">
          <p className="text-xs text-slate-300">
            Drag to rotate | Scroll to zoom | Right-click to pan | Click buildings for details
          </p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
