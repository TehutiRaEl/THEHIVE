---
name: "tesseract-chamber"
title: "Tesseract Chamber Component"
type: "react"
---

import React, { useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment, Center } from "@react-three/drei";
import * as THREE from "three";
import { motion } from "framer-motion";
import { IconCube as Cube, IconSparkles as Sparkles, IconEye as Eye, IconRefresh as Refresh } from "nucleo-sharp";

interface TesseractChamberProps {
  isActive?: boolean;
  dimensions?: number[];
}

function Tesseract({ size = 2, color = '#9333ea', rotationSpeed = 0.005 }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * rotationSpeed;
      meshRef.current.rotation.y = state.clock.elapsedTime * rotationSpeed * 0.7;
      meshRef.current.rotation.z = state.clock.elapsedTime * rotationSpeed * 0.3;
    }
  });

  const edges = new THREE.EdgesGeometry(new THREE.BoxGeometry(size, size, size));
  
  return (
    <Center>
      <mesh ref={meshRef} geometry={edges}>
        <lineBasicMaterial color={color} linewidth={2} />
      </mesh>
      <mesh position={[0, 0, 0]} rotation={[Math.PI / 4, Math.PI / 4, 0]}>
        <boxGeometry args={[size * 0.6, size * 0.6, size * 0.6]} />
        <meshBasicMaterial color={color} transparent opacity={0.3} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[size * 1.5, size * 1.5, size * 1.5]} />
        <meshBasicMaterial color={color} transparent opacity={0.1} side={THREE.DoubleSide} />
      </mesh>
    </Center>
  );
}

function TesseractScene({ isActive = true }: { isActive: boolean }) {
  return (
    <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} color="#9333ea" intensity={2} />
      <pointLight position={[-10, -10, -10]} color="#f59e0b" intensity={1} />
      <Environment preset="city" />
      <OrbitControls enableZoom={true} enablePan={true} enableRotate={true} />
      <Tesseract 
        size={2} 
        color={isActive ? '#9333ea' : '#666688'}
        rotationSpeed={isActive ? 0.005 : 0.001}
      />
    </Canvas>
  );
}

export default function TesseractChamber({ isActive = true, dimensions = [400, 400] }: TesseractChamberProps) {
  const [showStats, setShowStats] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="rounded-2xl bg-gradient-to-b from-slate-800/80 to-slate-900/90 border border-slate-600/50 overflow-hidden"
    >
      <div className="flex items-center justify-between p-6 border-b border-slate-600/50 bg-gradient-to-r from-purple-900/20 to-indigo-900/20">
        <div className="flex items-center gap-4">
          <Cube className="h-8 w-8 text-purple-400" />
          <div>
            <h2 className="text-2xl font-bold text-white">
              Tesseract Chamber
            </h2>
            <p className="text-sm text-slate-300">
              4D Visualization Matrix
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAutoRotate(!autoRotate)}
            className={"p-2 rounded-lg transition-colors " + (autoRotate ? 'bg-purple-600/30 text-purple-200' : 'bg-slate-700/50 text-slate-300')}
          >
            <Refresh className="h-5 w-5" />
          </button>
          <button
            onClick={() => setShowStats(!showStats)}
            className={"p-2 rounded-lg transition-colors " + (showStats ? 'bg-purple-600/30 text-purple-200' : 'bg-slate-700/50 text-slate-300')}
          >
            <Eye className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="relative h-[500px] w-full bg-gradient-to-br from-slate-900 to-purple-900/20">
        <TesseractScene isActive={isActive && autoRotate} />
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/40 to-transparent" />
        <div className="absolute top-4 right-4">
          <motion.span
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            className={"px-4 py-2 rounded-full text-sm font-medium backdrop-blur-md " + (isActive ? 'bg-purple-500/20 text-purple-200 border border-purple-500/30' : 'bg-slate-700/50 text-slate-300 border border-slate-600/30')}
          >
            {isActive ? '▶ Active' : '⏸️ Dormant'}
          </motion.span>
        </div>

        {showStats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute bottom-4 left-4 right-4 bg-slate-800/90 backdrop-blur-md rounded-xl p-4 border border-slate-600/50"
          >
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-xs text-slate-400 mb-1">Dimensions</p>
                <p className="text-lg font-bold text-purple-300">4D</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-1">Status</p>
                <p className="text-lg font-bold text-emerald-300">{isActive ? 'ONLINE' : 'OFFLINE'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-1">Integrity</p>
                <p className="text-lg font-bold text-orange-300">100%</p>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      <div className="p-4 text-center text-xs text-slate-400 bg-slate-800/50">
        <p>Drag to rotate | Scroll to zoom | Right-click to pan</p>
      </div>
    </motion.div>
  );
}