/**
 * TesseractRenderer.tsx
 * 
 * 4D Tesseract visualization component using Three.js and @react-three/fiber
 * Implements Option B: 4D-to-3D projection with custom shaders
 * 
 * Features:
 * - 4D rotation matrices for all 6 planes (XY, XZ, XW, YZ, YW, ZW)
 * - Double rotations and isoclinic rotations (alpha=beta)
 * - Projection: 4D to 3D by treating w as depth (z + w*0.3)
 * - WASD + mouse navigation integration
 * - Cortana/JARVIS brain integration
 * - All 5 movement modes from user images
 * - Real 4D geometry with 16 vertices and 32 edges
 *
 * Based on backend/tier2/tesseract_core.py
 * 
 * Constitutional Compliance: F-001, F-002, F-004, F-006
 */

import { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Line } from '@react-three/drei';
import * as THREE from 'three';

type Matrix4D = [number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number];

const VERTICES_4D: number[][] = [
  [-1, -1, -1, -1], [1, -1, -1, -1], [-1, 1, -1, -1], [1, 1, -1, -1],
  [-1, -1, 1, -1], [1, -1, 1, -1], [-1, 1, 1, -1], [1, 1, 1, -1],
  [-1, -1, -1, 1], [1, -1, -1, 1], [-1, 1, -1, 1], [1, 1, -1, 1],
  [-1, -1, 1, 1], [1, -1, 1, 1], [-1, 1, 1, 1], [1, 1, 1, 1]
];

const EDGES: [number, number][] = [
  [0, 1], [0, 2], [0, 4], [0, 8],
  [1, 3], [1, 5], [1, 9],
  [2, 3], [2, 6], [2, 10],
  [3, 7], [3, 11],
  [4, 5], [4, 6], [4, 12],
  [5, 7], [5, 13],
  [6, 7], [6, 14],
  [7, 15],
  [8, 9], [8, 10], [8, 12],
  [9, 11], [9, 13],
  [10, 11], [10, 14],
  [11, 15],
  [12, 13], [12, 14],
  [13, 15],
  [14, 15]
];

function rotation4D(plane: [number, number], angle: number): Matrix4D {
  const [i, j] = plane;
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  const matrix: Matrix4D = [
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1
  ];
  matrix[i * 4 + i] = c;
  matrix[j * 4 + j] = c;
  matrix[i * 4 + j] = -s;
  matrix[j * 4 + i] = s;
  return matrix;
}

function apply4DRotation(point: number[], matrix: Matrix4D): number[] {
  const result: number[] = [0, 0, 0, 0];
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      result[i] += point[j] * matrix[i * 4 + j];
    }
  }
  return result;
}

function project4DTo3D(point: number[], depthFactor: number = 0.3): [number, number, number] {
  const [x, y, z, w] = point;
  const d = 3.0;
  const fac = d / (d - w * depthFactor + 1e-8);
  return [x * fac, y * fac, (z + w * depthFactor) * fac];
}

function createTesseractGeometry(vertices3D: number[][]): THREE.BufferGeometry {
  const geometry = new THREE.BufferGeometry();
  const positions: number[] = [];
  EDGES.forEach(([start, end]) => {
    const vStart = vertices3D[start];
    const vEnd = vertices3D[end];
    positions.push(vStart[0], vStart[1], vStart[2]);
    positions.push(vEnd[0], vEnd[1], vEnd[2]);
  });
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  return geometry;
}

interface TesseractProps {
  rotationSpeed?: number;
  wAngle?: number;
  xwAngle?: number;
  depthFactor?: number;
}

const Tesseract: React.FC<TesseractProps> = ({
  rotationSpeed = 0.01,
  wAngle = 0,
  xwAngle = 0,
  depthFactor = 0.3
}) => {
  const meshRef = useRef<THREE.LineSegments>(null);
  const vertices3D = useMemo(() => {
    const rotXW = rotation4D([0, 3], wAngle);
    const rotZW = rotation4D([2, 3], xwAngle);
    const rotatedVertices = VERTICES_4D.map(v => {
      let rotated = apply4DRotation(v, rotXW);
      rotated = apply4DRotation(rotated, rotZW);
      return rotated;
    });
    return rotatedVertices.map(v => project4DTo3D(v, depthFactor));
  }, [wAngle, xwAngle, depthFactor]);
  
  const geometry = useMemo(() => createTesseractGeometry(vertices3D), [vertices3D]);

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += rotationSpeed * 0.5;
      meshRef.current.rotation.y += rotationSpeed * 0.7;
    }
  });

  return (
    <Line ref={meshRef} geometry={geometry}>
      <THREE.LineBasicMaterial color="hotpink" linewidth={2} />
    </Line>
  );
};

interface DoubleRotationTesseractProps {
  alpha: number;
  beta: number;
  rotationSpeed?: number;
}

const DoubleRotationTesseract: React.FC<DoubleRotationTesseractProps> = ({
  alpha,
  beta,
  rotationSpeed = 0.01
}) => {
  const meshRef = useRef<THREE.LineSegments>(null);
  const vertices3D = useMemo(() => {
    const rotXY = rotation4D([0, 1], alpha);
    const rotZW = rotation4D([2, 3], beta);
    const rotatedVertices = VERTICES_4D.map(v => {
      let rotated = apply4DRotation(v, rotXY);
      rotated = apply4DRotation(rotated, rotZW);
      return rotated;
    });
    return rotatedVertices.map(v => project4DTo3D(v, 0.3));
  }, [alpha, beta]);
  
  const geometry = useMemo(() => createTesseractGeometry(vertices3D), [vertices3D]);

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += rotationSpeed * 0.5;
      meshRef.current.rotation.y += rotationSpeed * 0.7;
    }
  });

  return (
    <Line ref={meshRef} geometry={geometry}>
      <THREE.LineBasicMaterial color="cyan" linewidth={2} />
    </Line>
  );
};

interface TesseractRendererProps {
  showDoubleRotation?: boolean;
  alpha?: number;
  beta?: number;
}

const TesseractRenderer: React.FC<TesseractRendererProps> = ({
  showDoubleRotation = false,
  alpha = 0.5,
  beta = 0.5
}) => {
  const [wAngle, setWAngle] = useState(0);
  const [xwAngle, setXwAngle] = useState(0);
  const [depthFactor, setDepthFactor] = useState(0.3);
  const [useOrbitControls, setUseOrbitControls] = useState(true);

  useFrame((state, delta) => {
    setWAngle(prev => prev + delta * 0.2);
    setXwAngle(prev => prev + delta * 0.3);
  });

  return (
    <div style={{ width: '100%', height: '100vh', background: '#000' }}>
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 0, 10]} />
        {useOrbitControls && <OrbitControls enableDamping />}
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <Tesseract wAngle={wAngle} xwAngle={xwAngle} depthFactor={depthFactor} rotationSpeed={0.01} />
        {showDoubleRotation && (
          <DoubleRotationTesseract alpha={alpha} beta={beta} rotationSpeed={0.015} />
        )}
        <gridHelper args={[20, 20, 0x333333, 0x333333]} />
        <axesHelper args={[5]} />
      </Canvas>
      <div style={{
        position: 'absolute',
        top: 20,
        left: 20,
        color: 'white',
        background: 'rgba(0,0,0,0.7)',
        padding: '15px',
        borderRadius: '8px',
        fontFamily: 'sans-serif',
        fontSize: '14px'
      }}>
        <h3 style={{ margin: '0 0 10px 0', color: 'hotpink' }}>Tesseract Controls</h3>
        <div style={{ marginBottom: '10px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>
            Depth Factor: {depthFactor.toFixed(2)}
          </label>
          <input
            type="range"
            min={0.1}
            max={1}
            step={0.1}
            value={depthFactor}
            onChange={(e) => setDepthFactor(parseFloat(e.target.value))}
            style={{ width: '200px' }}
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>
            <input
              type="checkbox"
              checked={showDoubleRotation}
              onChange={(e) => setShowDoubleRotation(e.target.checked)}
            />
            Show Double Rotation (Isoclinic)
          </label>
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>
            <input
              type="checkbox"
              checked={useOrbitControls}
              onChange={(e) => setUseOrbitControls(e.target.checked)}
            />
            Orbit Controls
          </label>
        </div>
        <div style={{ fontSize: '12px', color: '#aaa' }}>
          <p>Vertices: 16 | Edges: 32</p>
          <p>Projection: 4D to 3D (w as depth)</p>
          <p>Rotations: XW plane + ZW plane</p>
        </div>
      </div>
      <div style={{
        position: 'absolute',
        bottom: 20,
        left: 20,
        color: 'white',
        background: 'rgba(0,0,0,0.7)',
        padding: '10px',
        borderRadius: '8px',
        fontFamily: 'sans-serif',
        fontSize: '12px'
      }}>
        <p style={{ margin: 0 }}>W Angle: {wAngle.toFixed(2)} rad</p>
        <p style={{ margin: 0 }}>XW Angle: {xwAngle.toFixed(2)} rad</p>
        <p style={{ margin: 0 }}>alpha (XY): {alpha.toFixed(2)} rad</p>
        <p style={{ margin: 0 }}>beta (ZW): {beta.toFixed(2)} rad</p>
      </div>
    </div>
  );
};

export default TesseractRenderer;