import { useEffect, useRef, useState, useCallback } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { API_BASE_URL } from '../utils/constants'

interface VoxelData {
  x: number
  y: number
  z: number
  r: number
  g: number
  b: number
  a: number
}

interface ArenaFrame {
  t: number
  da?: VoxelData[]
  db?: VoxelData[]
  m?: { tick: number; leading: string }
}

function VoxelMesh({ voxels, offset }: { voxels: VoxelData[]; offset: [number, number, number] }) {
  const meshRef = useRef<THREE.InstancedMesh>(null)

  useEffect(() => {
    if (!meshRef.current || !voxels.length) return
    const mesh = meshRef.current
    const matrix = new THREE.Matrix4()
    const color = new THREE.Color()
    voxels.forEach((v, i) => {
      matrix.setPosition(v.x + offset[0], v.y + offset[1], v.z + offset[2])
      mesh.setMatrixAt(i, matrix)
      color.setRGB(v.r, v.g, v.b)
      mesh.setColorAt(i, color)
    })
    mesh.instanceMatrix.needsUpdate = true
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
  }, [voxels, offset])

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, voxels.length]}>
      <boxGeometry args={[0.9, 0.9, 0.9]} />
      <meshStandardMaterial vertexColors />
    </instancedMesh>
  )
}

function SchumannRing({ phase }: { phase: number }) {
  const ref = useRef<THREE.Mesh>(null)
  useFrame(() => {
    if (ref.current) {
      const scale = 1 + 0.08 * Math.sin(phase)
      ref.current.scale.setScalar(scale)
    }
  })
  return (
    <mesh ref={ref} rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[8, 0.05, 8, 64]} />
      <meshBasicMaterial color="#f59e0b" transparent opacity={0.3} />
    </mesh>
  )
}

interface Props {
  challengeId?: number
  autoPlay?: boolean
}

export function LiveArenaViewer({ challengeId, autoPlay = false }: Props) {
  const [frames, setFrames] = useState<ArenaFrame[]>([])
  const [currentFrame, setCurrentFrame] = useState(0)
  const [playing, setPlaying] = useState(autoPlay)
  const [voxelsA, setVoxelsA] = useState<VoxelData[]>([])
  const [voxelsB, setVoxelsB] = useState<VoxelData[]>([])
  const [schumannPhase, setSchumannPhase] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const loadFrames = useCallback(async (id: number) => {
    try {
      const res = await fetch(`${API_BASE_URL}/v11/arena/projection/${id}/frames`)
      const data = await res.json() as { frames: ArenaFrame[] }
      setFrames(data.frames ?? [])
      setCurrentFrame(0)
    } catch {
      setFrames([])
    }
  }, [])

  useEffect(() => {
    if (challengeId) loadFrames(challengeId)
  }, [challengeId, loadFrames])

  // Advance voxels when frame changes
  useEffect(() => {
    if (!frames.length) return
    const f = frames[currentFrame]
    if (f) {
      setVoxelsA((prev) => [...prev, ...(f.da ?? [])].slice(-200))
      setVoxelsB((prev) => [...prev, ...(f.db ?? [])].slice(-200))
    }
  }, [currentFrame, frames])

  // Playback timer
  useEffect(() => {
    if (!playing || !frames.length) return
    timerRef.current = setInterval(() => {
      setCurrentFrame((c) => {
        if (c >= frames.length - 1) {
          setPlaying(false)
          return c
        }
        return c + 1
      })
      setSchumannPhase((p) => p + 7.83 / 60)
    }, 100)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [playing, frames.length])

  const currentMeta = frames[currentFrame]?.m

  return (
    <div style={{ position: 'relative', width: '100%', height: '400px', background: '#020617', borderRadius: '8px', overflow: 'hidden' }}>
      <Canvas camera={{ position: [24, 16, 24], fov: 50 }}>
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 20, 10]} intensity={1} />
        <SchumannRing phase={schumannPhase} />
        {voxelsA.length > 0 && <VoxelMesh voxels={voxelsA} offset={[-9, 0, 0]} />}
        {voxelsB.length > 0 && <VoxelMesh voxels={voxelsB} offset={[9, 0, 0]} />}
        <gridHelper args={[32, 16, '#1e293b', '#1e293b']} />
      </Canvas>

      {/* HUD */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        padding: '0.5rem 1rem',
        background: 'rgba(0,0,0,0.7)',
        display: 'flex', alignItems: 'center', gap: '1rem',
        fontSize: '0.75rem', fontFamily: 'monospace', color: '#94a3b8',
      }}>
        <button
          onClick={() => setPlaying((p) => !p)}
          style={{ background: 'transparent', border: '1px solid #334155', borderRadius: '4px', color: '#94a3b8', padding: '0.2rem 0.6rem', cursor: 'pointer' }}
        >
          {playing ? '⏸' : '▶'}
        </button>
        <span>Tick {currentMeta?.tick ?? 0}/30</span>
        {currentMeta?.leading && <span style={{ color: '#f59e0b' }}>Leading: {currentMeta.leading}</span>}
        <span style={{ marginLeft: 'auto', opacity: 0.5 }}>
          {frames.length ? `${frames.length} frames loaded` : challengeId ? 'No frames — run projection first' : 'Select a challenge'}
        </span>
      </div>
    </div>
  )
}

export default LiveArenaViewer
