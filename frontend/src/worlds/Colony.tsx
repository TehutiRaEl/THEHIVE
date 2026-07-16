/**
 * Colony Component for THEHIVE
 * Renders 3D colonies with buildings and resources
 */
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

import { colonyManager } from './ColonyManager';
import { ColonyState, BuildingState, BuildingType } from './colony-types';
import { Position3D } from './types';

interface ColonyProps {
  colony: ColonyState;
  onBuildingClick?: (buildingId: string) => void;
  onColonyClick?: (colonyId: string) => void;
  showInfo?: boolean;
  showBuildingInfo?: boolean;
}

// Building models
const BUILDING_MODELS: Record<BuildingType, { geometry: THREE.BufferGeometry; color: number; size: number }> = {
  townhall: { geometry: new THREE.BoxGeometry(5, 4, 5), color: 0xFFD700, size: 1 },
  residential: { geometry: new THREE.BoxGeometry(3, 3, 3), color: 0x8B4513, size: 1 },
  commercial: { geometry: new THREE.BoxGeometry(4, 3, 4), color: 0xFFD700, size: 1 },
  industrial: { geometry: new THREE.BoxGeometry(4, 2, 4), color: 0x696969, size: 1 },
  defense: { geometry: new THREE.BoxGeometry(2, 4, 2), color: 0x800000, size: 1 },
  farm: { geometry: new THREE.BoxGeometry(4, 1, 4), color: 0x228B22, size: 1 },
  mine: { geometry: new THREE.BoxGeometry(3, 2, 3), color: 0x696969, size: 1 },
  lab: { geometry: new THREE.BoxGeometry(4, 2, 4), color: 0x2196F3, size: 1 },
  temple: { geometry: new THREE.ConeGeometry(3, 5, 8), color: 0x9C27B0, size: 1 },
  gateway: { geometry: new THREE.TorusGeometry(2, 0.5, 8, 16), color: 0x00FFFF, size: 1 },
  decorative: { geometry: new THREE.SphereGeometry(1, 8, 8), color: 0xFFFFFF, size: 1 },
};

// Building construction visualization
const ConstructionSite: React.FC<{ position: Position3D; progress: number }> = ({ position, progress }) => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.scale.y = progress / 100;
    }
  });

  return (
    <mesh ref={meshRef} position={[position.x, position.y + 2, position.z]}>
      <boxGeometry args={[3, 4, 3]} />
      <meshStandardMaterial color={0xFF9800} transparent opacity={0.7} />
      <Html center distanceFactor={10} position={[0, 2, 0]}>
        <div style={{ background: 'rgba(0,0,0,0.8)', color: '#fff', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>
          Building: {Math.round(progress)}%
        </div>
      </Html>
    </mesh>
  );
};

// Individual building component
const Building: React.FC<{ building: BuildingState; onClick?: () => void; showInfo?: boolean }> = ({ building, onClick, showInfo = true }) => {
  const groupRef = useRef<THREE.Group>(null);
  const model = BUILDING_MODELS[building.type] || BUILDING_MODELS.residential;

  const healthPercentage = (building.health / building.maxHealth) * 100;
  const isDamaged = healthPercentage < 100;
  const isUnderConstruction = building.isUnderConstruction;

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.position.set(building.position.x, building.position.y, building.position.z);
    }
  });

  if (isUnderConstruction) {
    return <ConstructionSite position={building.position} progress={building.constructionProgress} />;
  }

  return (
    <group ref={groupRef} onClick={onClick}>
      <mesh castShadow receiveShadow>
        <primitive object={model.geometry} />
        <meshStandardMaterial color={model.color} />
      </mesh>
      
      {isDamaged && (
        <mesh position={[0, model.size * 2, 0]}>
          <planeGeometry args={[3, 0.5]} />
          <meshStandardMaterial color={0xFF0000} transparent opacity={0.5} />
        </mesh>
      )}
      
      {showInfo && (
        <Html center distanceFactor={10} position={[0, model.size * 2 + 1, 0]}>
          <div style={{ 
            background: 'rgba(0,0,0,0.8)', 
            color: '#fff', 
            padding: '4px 8px', 
            borderRadius: '4px', 
            fontSize: '11px',
            textAlign: 'center'
          }}>
            <div style={{ fontWeight: 'bold' }}>{building.name}</div>
            <div>Lvl {building.level}</div>
            {building.type === 'residential' && <div>Housing: {building.housing}</div>}
            {building.type === 'farm' && <div>Food: +10/10s</div>}
            {building.type === 'mine' && <div>Minerals: +8/15s</div>}
          </div>
        </Html>
      )}
    </group>
  );
};

// Colony boundary visualization
const ColonyBoundary: React.FC<{ colony: ColonyState }> = ({ colony }) => {
  const size = colony.size;

  return (
    <group>
      <lineSegments>
        <edgesGeometry attach="geometry" args={[new THREE.BoxGeometry(size.width, 0.1, size.depth)]} />
        <lineBasicMaterial color={colony.theme.primaryColor} />
      </lineSegments>
      
      {Array.from({ length: 4 }).map((_, i) => {
        const angle = (i * Math.PI) / 2;
        const x = (size.width / 2 - 0.5) * Math.cos(angle);
        const z = (size.depth / 2 - 0.5) * Math.sin(angle);
        
        return (
          <mesh key={i} position={[x, 0, z]} rotation={[0, angle + Math.PI / 4, 0]}>
            <boxGeometry args={[1, 3, 0.5]} />
            <meshStandardMaterial color={colony.theme.accentColor} />
          </mesh>
        );
      })}
    </group>
  );
};

// Colony center marker
const ColonyCenter: React.FC<{ colony: ColonyState; onClick?: () => void }> = ({ colony, onClick }) => {
  const tierColor = [0xFFFFFF, 0x4CAF50, 0x2196F3, 0x9C27B0, 0xFFD700, 0xFF5722, 0x00BCD4, 0xE91E63, 0x3F51B5, 0xFF9800];
  const color = tierColor[colony.tier - 1] || 0xFFFFFF;

  return (
    <group position={[colony.position.x, colony.position.y, colony.position.z]} onClick={onClick}>
      <mesh>
        <cylinderGeometry args={[2, 2, 0.5, 16]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} />
      </mesh>
      <mesh position={[0, 0.6, 0]}>
        <coneGeometry args={[1.5, 1, 16]} />
        <meshStandardMaterial color={colony.theme.primaryColor} />
      </mesh>
      
      <Html center distanceFactor={10} position={[0, 2, 0]}>
        <div style={{ 
          background: 'rgba(0,0,0,0.9)', 
          color: '#fff', 
          padding: '8px 12px', 
          borderRadius: '8px', 
          fontSize: '14px',
          textAlign: 'center',
          minWidth: '120px'
        }}>
          <div style={{ fontWeight: 'bold', fontSize: '16px' }}>{colony.name}</div>
          <div>Tier {colony.tier}</div>
          <div>Pop: {colony.population}/{colony.maxPopulation}</div>
        </div>
      </Html>
    </group>
  );
};

// Resource display above colony
const ColonyResources: React.FC<{ colony: ColonyState }> = ({ colony }) => {
  const [visible, setVisible] = useState(false);

  const resources = [
    { type: 'energy', icon: '⚡', color: '#FFD700' },
    { type: 'minerals', icon: '⛏️', color: '#808080' },
    { type: 'food', icon: '🍎', color: '#4CAF50' },
    { type: 'knowledge', icon: '📚', color: '#2196F3' },
    { type: 'gold', icon: '💰', color: '#FFD700' },
  ];

  return (
    <Html center distanceFactor={10} position={[colony.position.x, colony.position.y + 3, colony.position.z]}
      onPointerOver={() => setVisible(true)} onPointerOut={() => setVisible(false)}>
      <div style={{ 
        background: visible ? 'rgba(0,0,0,0.9)' : 'rgba(0,0,0,0.7)',
        color: '#fff',
        padding: visible ? '8px' : '4px',
        borderRadius: '4px',
        fontSize: '11px',
        textAlign: 'center',
        transition: 'all 0.2s',
        opacity: visible ? 1 : 0.8,
      }}>
        {!visible ? (
          <div>Resources</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '4px' }}>
            {resources.map(({ type, icon, color }) => {
              const amount = colony.resources[type as keyof typeof colony.resources] || 0;
              const max = colony.maxResources[type as keyof typeof colony.maxResources] || Infinity;
              const percentage = (amount / max) * 100;
              
              return (
                <div key={type} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '14px' }}>{icon}</div>
                  <div style={{ fontSize: '10px', color }}>{Math.round(amount)}</div>
                  <div style={{ height: '4px', background: '#333', borderRadius: '2px', marginTop: '2px' }}>
                    <div style={{ 
                      height: '100%', 
                      width: percentage + '%',
                      background: color,
                      borderRadius: '2px'
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Html>
  );
};

export const Colony: React.FC<ColonyProps> = ({ colony, onBuildingClick, onColonyClick, showInfo = true, showBuildingInfo = true }) => {
  const [buildings, setBuildings] = useState<BuildingState[]>([]);

  useEffect(() => {
    const updateBuildings = () => {
      setBuildings(colonyManager.getBuildings(colony.id));
    };

    updateBuildings();

    const unsubscribe = colonyManager.onEvent(colony.id, () => updateBuildings());
    const interval = setInterval(updateBuildings, 1000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, [colony.id]);

  const handleBuildingClick = (buildingId: string) => {
    if (onBuildingClick) onBuildingClick(buildingId);
  };

  const handleColonyClick = () => {
    if (onColonyClick) onColonyClick(colony.id);
  };

  return (
    <group>
      <ColonyBoundary colony={colony} />
      <ColonyCenter colony={colony} onClick={handleColonyClick} />
      <ColonyResources colony={colony} />
      
      {buildings.map(building => (
        <Building
          key={building.id}
          building={building}
          onClick={() => handleBuildingClick(building.id)}
          showInfo={showBuildingInfo}
        />
      ))}
    </group>
  );
};

// Colony Container - Renders all colonies in a world
interface ColonyContainerProps {
  worldId: string;
  onColonyClick?: (colonyId: string) => void;
  onBuildingClick?: (colonyId: string, buildingId: string) => void;
  showInfo?: boolean;
  showBuildingInfo?: boolean;
}

export const ColonyContainer: React.FC<ColonyContainerProps> = ({
  worldId,
  onColonyClick,
  onBuildingClick,
  showInfo = true,
  showBuildingInfo = true,
}) => {
  const [colonies, setColonies] = useState<ColonyState[]>([]);

  useEffect(() => {
    const updateColonies = () => {
      setColonies(colonyManager.getAllColonies().filter(c => c.position.x >= 0));
    };

    updateColonies();

    const interval = setInterval(updateColonies, 1000);

    return () => clearInterval(interval);
  }, [worldId]);

  const handleBuildingClick = (buildingId: string) => {
    const building = colonies.flatMap(c => colonyManager.getBuildings(c.id)).find(b => b.id === buildingId);
    if (building && onBuildingClick) {
      const colony = colonies.find(c => colonyManager.getBuildings(c.id).some(b => b.id === buildingId));
      if (colony) onBuildingClick(colony.id, buildingId);
    }
  };

  return (
    <>
      {colonies.map(colony => (
        <Colony
          key={colony.id}
          colony={colony}
          onColonyClick={onColonyClick}
          onBuildingClick={handleBuildingClick}
          showInfo={showInfo}
          showBuildingInfo={showBuildingInfo}
        />
      ))}
    </>
  );
};

// Colony UI Panel - 2D overlay for colony management
interface ColonyUIPanelProps {
  colony: ColonyState;
  onClose?: () => void;
}

export const ColonyUIPanel: React.FC<ColonyUIPanelProps> = ({ colony, onClose }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'buildings' | 'resources' | 'population'>('overview');
  const buildings = colonyManager.getBuildings(colony.id);
  const buildingConfigs = colonyManager.getAllBuildingConfigs();

  const statsStyle: React.CSSProperties = {
    background: '#16213e',
    borderRadius: '8px',
    padding: '15px',
    color: '#fff',
    width: '300px',
  };

  const tabStyle: React.CSSProperties = {
    padding: '8px 12px',
    background: activeTab === 'overview' ? '#0f3460' : '#1a1a2e',
    border: 'none',
    borderRadius: '4px',
    color: '#fff',
    cursor: 'pointer',
    marginRight: '5px',
    fontSize: '12px',
  };

  return (
    <div style={statsStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <h3 style={{ margin: 0 }}>{colony.name}</h3>
        {onClose && <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#aaa', cursor: 'pointer', fontSize: '16px' }}>×</button>}
      </div>
      
      <div style={{ marginBottom: '10px' }}>
        <div style={{ fontSize: '11px', color: '#aaa' }}>Tier {colony.tier}</div>
        <div style={{ fontSize: '11px', color: '#aaa' }}>Population: {colony.population}/{colony.maxPopulation}</div>
        <div style={{ fontSize: '11px', color: '#aaa' }}>Status: {colony.status}</div>
      </div>

      <div style={{ display: 'flex', gap: '5px', marginBottom: '10px' }}>
        <button style={{ ...tabStyle }} onClick={() => setActiveTab('overview')}>Overview</button>
        <button style={{ ...tabStyle }} onClick={() => setActiveTab('buildings')}>Buildings</button>
        <button style={{ ...tabStyle }} onClick={() => setActiveTab('resources')}>Resources</button>
        <button style={{ ...tabStyle }} onClick={() => setActiveTab('population')}>Population</button>
      </div>

      {activeTab === 'overview' && (
        <div>
          <div style={{ fontSize: '12px', color: '#aaa', marginBottom: '5px' }}>XP: {colony.xp}/{colony.xpToNextTier}</div>
          <div style={{ width: '100%', height: '4px', background: '#333', borderRadius: '2px', marginBottom: '10px' }}>
            <div style={{ 
              height: '100%', 
              width: (colony.xp / colony.xpToNextTier) * 100 + '%',
              background: '#4CAF50',
              borderRadius: '2px'
            }} />
          </div>
          <div style={{ fontSize: '12px', color: '#aaa' }}>{colony.description}</div>
        </div>
      )}

      {activeTab === 'buildings' && (
        <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
          <div style={{ fontSize: '12px', color: '#aaa', marginBottom: '5px' }}>
            {buildings.length}/{colonyManager.getConfig().maxBuildingsPerColony} buildings
          </div>
          {buildings.map(building => {
            const config = buildingConfigs.find(c => c.id === building.buildingId);
            return (
              <div key={building.id} style={{ 
                padding: '6px', 
                background: '#0f3460', 
                borderRadius: '4px', 
                marginBottom: '5px',
                fontSize: '11px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>{config?.name || building.name} (Lvl {building.level})</span>
                  <span style={{ color: '#4CAF50' }}>{building.health}/{building.maxHealth}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {activeTab === 'resources' && (
        <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
          {Object.entries(colony.resources).map(([resource, amount]) => {
            const max = colony.maxResources[resource as keyof typeof colony.maxResources] || Infinity;
            const percentage = (amount / max) * 100;
            return (
              <div key={resource} style={{ marginBottom: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                  <span>{resource}</span>
                  <span>{Math.round(amount)}/{max === Infinity ? '∞' : max}</span>
                </div>
                <div style={{ width: '100%', height: '4px', background: '#333', borderRadius: '2px' }}>
                  <div style={{ 
                    height: '100%', 
                    width: percentage + '%',
                    background: '#4CAF50',
                    borderRadius: '2px'
                  }} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {activeTab === 'population' && (
        <div>
          <div style={{ fontSize: '12px', color: '#aaa', marginBottom: '5px' }}>
            {colony.population}/{colony.maxPopulation} residents
          </div>
          {colony.residents.length > 0 && (
            <div style={{ maxHeight: '150px', overflowY: 'auto' }}>
              {colony.residents.slice(0, 10).map((agentId, index) => (
                <div key={agentId} style={{ 
                  padding: '4px', 
                  background: '#0f3460', 
                  borderRadius: '4px', 
                  marginBottom: '3px',
                  fontSize: '10px'
                }}>
                  Resident #{index + 1}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Colony;